import { useState, useCallback, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Mic, MicOff, Copy, Check, Loader2, Square } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface ScribeRecorderProps {
  /** Compact mode for embedding in other views */
  compact?: boolean;
  /** Called with the full transcript whenever it updates */
  onTranscriptChange?: (transcript: string) => void;
  /** Additional class names */
  className?: string;
}

interface TranscriptSegment {
  id: string;
  text: string;
  timestamp: Date;
  isPartial?: boolean;
}

export function ScribeRecorder({ compact = false, onTranscriptChange, className }: ScribeRecorderProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [segments, setSegments] = useState<TranscriptSegment[]>([]);
  const [partialText, setPartialText] = useState('');
  const [copied, setCopied] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const fullTranscript = segments.filter(s => !s.isPartial).map(s => s.text).join(' ');

  useEffect(() => {
    onTranscriptChange?.(fullTranscript);
  }, [fullTranscript, onTranscriptChange]);

  useEffect(() => {
    return () => {
      stopRecording();
    };
  }, []);

  const startRecording = useCallback(async () => {
    setIsConnecting(true);
    try {
      // Get scribe token
      const { data, error } = await supabase.functions.invoke('elevenlabs-scribe-token');
      if (error || !data?.token) {
        throw new Error(error?.message || 'Failed to get scribe token');
      }

      // Get microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, sampleRate: 16000 },
      });
      mediaStreamRef.current = stream;

      // Set up audio processing
      const audioContext = new AudioContext({ sampleRate: 16000 });
      audioContextRef.current = audioContext;
      const source = audioContext.createMediaStreamSource(stream);
      const processor = audioContext.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;

      // Connect WebSocket to ElevenLabs
      const ws = new WebSocket(
        `wss://api.elevenlabs.io/v1/scribe/realtime?model_id=scribe_v2_realtime&language_code=en`
      );
      wsRef.current = ws;

      ws.onopen = () => {
        // Send auth
        ws.send(JSON.stringify({ type: 'auth', token: data.token }));
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          
          if (msg.type === 'session_started') {
            setIsConnected(true);
            setIsConnecting(false);
            setElapsed(0);
            timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000);
          } else if (msg.type === 'partial_transcript') {
            setPartialText(msg.text || '');
          } else if (msg.type === 'committed_transcript' || msg.type === 'committed_transcript_with_timestamps') {
            if (msg.text?.trim()) {
              setSegments(prev => [...prev, {
                id: crypto.randomUUID(),
                text: msg.text.trim(),
                timestamp: new Date(),
              }]);
            }
            setPartialText('');
          } else if (msg.type === 'error') {
            console.error('Scribe error:', msg);
            toast({ title: 'Transcription Error', description: msg.message || 'An error occurred', variant: 'destructive' });
          }
        } catch {
          // Ignore parse errors
        }
      };

      ws.onerror = () => {
        toast({ title: 'Connection Error', description: 'Failed to connect to transcription service', variant: 'destructive' });
        stopRecording();
      };

      ws.onclose = () => {
        setIsConnected(false);
        setIsConnecting(false);
      };

      // Stream audio chunks
      processor.onaudioprocess = (e) => {
        if (ws.readyState !== WebSocket.OPEN) return;
        const inputData = e.inputBuffer.getChannelData(0);
        // Convert Float32 to Int16 PCM
        const pcm16 = new Int16Array(inputData.length);
        for (let i = 0; i < inputData.length; i++) {
          const s = Math.max(-1, Math.min(1, inputData[i]));
          pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
        }
        // Convert to base64
        const bytes = new Uint8Array(pcm16.buffer);
        let binary = '';
        for (let i = 0; i < bytes.byteLength; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        const base64 = btoa(binary);
        ws.send(JSON.stringify({ type: 'audio', data: base64 }));
      };

      source.connect(processor);
      processor.connect(audioContext.destination);

    } catch (err: any) {
      console.error('Start recording error:', err);
      toast({
        title: 'Recording Failed',
        description: err.message || 'Could not start recording. Check microphone permissions.',
        variant: 'destructive',
      });
      setIsConnecting(false);
      stopRecording();
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(t => t.stop());
      mediaStreamRef.current = null;
    }
    setIsConnected(false);
    setIsConnecting(false);
    setPartialText('');
  }, []);

  const copyTranscript = useCallback(() => {
    navigator.clipboard.writeText(fullTranscript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: 'Copied', description: 'Transcript copied to clipboard' });
  }, [fullTranscript]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  if (compact) {
    return (
      <div className={cn('space-y-2', className)}>
        <div className="flex items-center gap-2">
          {!isConnected ? (
            <Button
              size="sm"
              variant="outline"
              onClick={startRecording}
              disabled={isConnecting}
              className="gap-1.5"
            >
              {isConnecting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Mic className="h-3.5 w-3.5" />}
              {isConnecting ? 'Connecting...' : 'Record & Transcribe'}
            </Button>
          ) : (
            <>
              <Button size="sm" variant="destructive" onClick={stopRecording} className="gap-1.5">
                <Square className="h-3 w-3" /> Stop
              </Button>
              <Badge variant="outline" className="gap-1 text-xs animate-pulse">
                <span className="h-2 w-2 rounded-full bg-destructive inline-block" />
                {formatTime(elapsed)}
              </Badge>
            </>
          )}
          {fullTranscript && (
            <Button size="sm" variant="ghost" onClick={copyTranscript} className="gap-1 text-xs h-7">
              {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
              Copy
            </Button>
          )}
        </div>
        {(isConnected || segments.length > 0) && (
          <div className="bg-muted/50 border rounded-md p-2 max-h-32 overflow-y-auto text-xs leading-relaxed">
            {segments.map(s => (
              <span key={s.id}>{s.text} </span>
            ))}
            {partialText && <span className="text-muted-foreground italic">{partialText}</span>}
            {!segments.length && !partialText && isConnected && (
              <span className="text-muted-foreground">Listening...</span>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <Card className={cn('', className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Mic className="h-4 w-4 text-primary" />
          Clinical Scribe
        </CardTitle>
        <div className="flex items-center gap-2">
          {isConnected && (
            <Badge variant="outline" className="gap-1.5 animate-pulse">
              <span className="h-2 w-2 rounded-full bg-destructive inline-block" />
              Recording {formatTime(elapsed)}
            </Badge>
          )}
          {fullTranscript && (
            <Button size="sm" variant="ghost" onClick={copyTranscript} className="gap-1.5 h-8">
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              Copy
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Controls */}
        <div className="flex items-center gap-2">
          {!isConnected ? (
            <Button onClick={startRecording} disabled={isConnecting} className="gap-2">
              {isConnecting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mic className="h-4 w-4" />}
              {isConnecting ? 'Connecting...' : 'Start Recording'}
            </Button>
          ) : (
            <Button variant="destructive" onClick={stopRecording} className="gap-2">
              <Square className="h-4 w-4" /> Stop Recording
            </Button>
          )}
        </div>

        {/* Transcript */}
        <ScrollArea className="h-[300px] border rounded-lg p-3" ref={scrollRef}>
          {segments.length === 0 && !partialText && !isConnected ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <MicOff className="h-8 w-8 text-muted-foreground/40 mb-2" />
              <p className="text-sm font-medium text-muted-foreground">Capture your session</p>
              <p className="text-xs text-muted-foreground/70">Your transcription will appear here</p>
            </div>
          ) : (
            <div className="space-y-1 text-sm leading-relaxed">
              {segments.map(s => (
                <p key={s.id}>
                  <span className="text-[10px] text-muted-foreground mr-1.5">
                    {s.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {s.text}
                </p>
              ))}
              {partialText && (
                <p className="text-muted-foreground italic">{partialText}</p>
              )}
              {!segments.length && !partialText && isConnected && (
                <p className="text-muted-foreground text-center py-8">Listening... speak now</p>
              )}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
