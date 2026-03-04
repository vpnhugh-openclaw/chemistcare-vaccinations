import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Send, CheckCircle2, XCircle, Star, UserMinus, MessageSquare } from 'lucide-react';

type SmsMessage = {
  id: string;
  status: string;
  direction: string;
  message_type: string;
  response_rating: number | null;
  response_text: string | null;
};

interface SmsAnalyticsProps {
  messages: SmsMessage[];
}

export const SmsAnalytics = ({ messages }: SmsAnalyticsProps) => {
  const stats = useMemo(() => {
    const outbound = messages.filter(m => m.direction === 'outbound');
    const inbound = messages.filter(m => m.direction === 'inbound');
    const delivered = outbound.filter(m => m.status === 'delivered');
    const failed = outbound.filter(m => m.status === 'failed');
    const ratings = messages.filter(m => m.response_rating != null);
    const avgRating = ratings.length > 0
      ? ratings.reduce((sum, m) => sum + (m.response_rating || 0), 0) / ratings.length
      : null;
    const optOuts = inbound.filter(m => m.message_type === 'opt_out');
    const replies = inbound.filter(m => m.message_type === 'reply' || m.message_type === 'rating');
    const deliveryRate = outbound.length > 0
      ? ((delivered.length / outbound.length) * 100).toFixed(1)
      : null;
    const replyRate = outbound.length > 0
      ? ((replies.length / outbound.length) * 100).toFixed(1)
      : null;

    return {
      totalSent: outbound.length,
      totalReceived: inbound.length,
      delivered: delivered.length,
      failed: failed.length,
      deliveryRate,
      replyRate,
      avgRating,
      ratingCount: ratings.length,
      optOuts: optOuts.length,
    };
  }, [messages]);

  const cards = [
    {
      title: 'Messages Sent',
      value: stats.totalSent,
      icon: Send,
      color: 'text-primary',
    },
    {
      title: 'Delivery Rate',
      value: stats.deliveryRate ? `${stats.deliveryRate}%` : '—',
      subtitle: `${stats.delivered} delivered · ${stats.failed} failed`,
      icon: CheckCircle2,
      color: 'text-emerald-500',
    },
    {
      title: 'Reply Rate',
      value: stats.replyRate ? `${stats.replyRate}%` : '—',
      subtitle: `${stats.totalReceived} inbound messages`,
      icon: MessageSquare,
      color: 'text-blue-500',
    },
    {
      title: 'Avg. Rating',
      value: stats.avgRating ? `${stats.avgRating.toFixed(1)}/5` : '—',
      subtitle: stats.ratingCount > 0 ? `from ${stats.ratingCount} responses` : 'No ratings yet',
      icon: Star,
      color: 'text-amber-500',
    },
    {
      title: 'Opt-Outs',
      value: stats.optOuts,
      icon: UserMinus,
      color: 'text-destructive',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {cards.map((card) => (
        <Card key={card.title} className="relative overflow-hidden">
          <CardHeader className="pb-1 pt-3 px-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
              <card.icon className={`h-3.5 w-3.5 ${card.color}`} />
            </div>
          </CardHeader>
          <CardContent className="px-3 pb-3">
            <p className="text-xl font-bold tracking-tight">{card.value}</p>
            {card.subtitle && (
              <p className="text-[0.65rem] text-muted-foreground mt-0.5">{card.subtitle}</p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
