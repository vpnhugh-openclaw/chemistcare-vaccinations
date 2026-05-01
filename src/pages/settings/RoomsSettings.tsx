import { useState } from 'react';
import { SettingsLayout } from '@/components/settings/SettingsLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Plus, Pencil, DoorOpen, Monitor, Wifi, Accessibility } from 'lucide-react';

interface Room {
  id: string;
  name: string;
  capacity: number;
  features: string[];
  equipment: string[];
  active: boolean;
  colour: string;
}

const INITIAL_ROOMS: Room[] = [
  {
    id: '1',
    name: 'Consultation Room A',
    capacity: 2,
    features: ['Wheelchair accessible', 'Private', 'Air-conditioned'],
    equipment: ['BP monitor', 'Stethoscope', 'Thermometer', 'Pulse oximeter'],
    active: true,
    colour: '#1D6FA4',
  },
  {
    id: '2',
    name: 'Consultation Room B',
    capacity: 2,
    features: ['Private', 'Air-conditioned'],
    equipment: ['BP monitor', 'Thermometer', 'Vaccine fridge'],
    active: true,
    colour: '#1FA971',
  },
  {
    id: '3',
    name: 'Vaccination Bay 1',
    capacity: 1,
    features: ['Open plan', 'Natural light'],
    equipment: ['Vaccine fridge', 'Sharps disposal', 'First aid kit'],
    active: true,
    colour: '#F6D860',
  },
  {
    id: '4',
    name: 'Private Consulting Room',
    capacity: 4,
    features: ['Wheelchair accessible', 'Private', 'Soundproofed'],
    equipment: ['BP monitor', 'ECG machine', 'Examination couch'],
    active: false,
    colour: '#E63946',
  },
];

const FEATURE_ICONS: Record<string, React.ReactNode> = {
  'Wheelchair accessible': <Accessibility className="h-3 w-3" />,
  'Private': <DoorOpen className="h-3 w-3" />,
  'Air-conditioned': <Monitor className="h-3 w-3" />,
  'Open plan': <Wifi className="h-3 w-3" />,
  'Natural light': <Monitor className="h-3 w-3" />,
  'Soundproofed': <DoorOpen className="h-3 w-3" />,
};

export default function RoomsSettings() {
  const [rooms, setRooms] = useState<Room[]>(INITIAL_ROOMS);
  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState({ name: '', capacity: '2', features: '', equipment: '' });

  const toggleActive = (id: string) => {
    setRooms(prev => prev.map(r => r.id === id ? { ...r, active: !r.active } : r));
  };

  const addRoom = () => {
    if (!form.name.trim()) return;
    const newRoom: Room = {
      id: crypto.randomUUID(),
      name: form.name,
      capacity: parseInt(form.capacity) || 2,
      features: form.features.split(',').map(f => f.trim()).filter(Boolean) || ['Private'],
      equipment: form.equipment.split(',').map(e => e.trim()).filter(Boolean) || ['BP monitor'],
      active: true,
      colour: '#1D6FA4',
    };
    setRooms(prev => [newRoom, ...prev]);
    setForm({ name: '', capacity: '2', features: '', equipment: '' });
    setShowAddForm(false);
  };

  return (
    <SettingsLayout title="Rooms">
      <div className="space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Total Rooms', value: rooms.length },
            { label: 'Active', value: rooms.filter(r => r.active).length },
            { label: 'Vac. Bays', value: rooms.filter(r => r.name.toLowerCase().includes('vaccination') || r.name.toLowerCase().includes('bay')).length },
            { label: 'Inactive', value: rooms.filter(r => !r.active).length },
          ].map(stat => (
            <Card key={stat.label}>
              <CardContent className="pt-4 pb-3 px-4">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                <p className="text-2xl font-semibold mt-1">{stat.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Add Room Form */}
        {showAddForm && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Add New Room</CardTitle>
              <CardDescription>Configure a new consultation or vaccination room</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Room Name *</Label>
                  <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Consultation Room C" />
                </div>
                <div className="space-y-1.5">
                  <Label>Capacity</Label>
                  <Input type="number" value={form.capacity} onChange={e => setForm({ ...form, capacity: e.target.value })} min={1} max={10} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Features (comma-separated)</Label>
                <Input value={form.features} onChange={e => setForm({ ...form, features: e.target.value })} placeholder="e.g. Private, Air-conditioned, Wheelchair accessible" />
              </div>
              <div className="space-y-1.5">
                <Label>Equipment (comma-separated)</Label>
                <Input value={form.equipment} onChange={e => setForm({ ...form, equipment: e.target.value })} placeholder="e.g. BP monitor, Thermometer, Vaccine fridge" />
              </div>
              <div className="flex gap-2 pt-2">
                <Button onClick={addRoom}><Plus className="h-4 w-4 mr-1" /> Add Room</Button>
                <Button variant="outline" onClick={() => setShowAddForm(false)}>Cancel</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Rooms Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {rooms.map((room) => (
            <Card key={room.id} className={!room.active ? 'opacity-60' : ''}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: room.colour }} />
                    <div>
                      <p className="text-sm font-semibold">{room.name}</p>
                      <p className="text-xs text-muted-foreground">Capacity: {room.capacity} patient{room.capacity > 1 ? 's' : ''}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Switch checked={room.active} onCheckedChange={() => toggleActive(room.id)} />
                    <Badge variant={room.active ? 'default' : 'secondary'} className="text-[0.625rem]">
                      {room.active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>
                <Separator className="my-2.5" />
                <div className="space-y-2">
                  <div>
                    <p className="text-[0.6875rem] text-muted-foreground uppercase tracking-wider mb-1">Features</p>
                    <div className="flex flex-wrap gap-1">
                      {room.features.map(f => (
                        <Badge key={f} variant="outline" className="text-[0.625rem] gap-1">
                          {FEATURE_ICONS[f] || <DoorOpen className="h-3 w-3" />}
                          {f}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-[0.6875rem] text-muted-foreground uppercase tracking-wider mb-1">Equipment</p>
                    <div className="flex flex-wrap gap-1">
                      {room.equipment.map(e => (
                        <Badge key={e} variant="secondary" className="text-[0.625rem]">{e}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex justify-end mt-3">
                  <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs"><Pencil className="h-3 w-3" /> Edit</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </SettingsLayout>
  );
}
