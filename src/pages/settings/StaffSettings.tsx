import { useState } from 'react';
import { SettingsLayout } from '@/components/settings/SettingsLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Plus, Pencil, Shield, Stethoscope, Clock } from 'lucide-react';

interface StaffMember {
  id: string;
  name: string;
  role: string;
  ahpraNumber: string;
  email: string;
  phone: string;
  active: boolean;
  permissions: string[];
}

const INITIAL_STAFF: StaffMember[] = [
  {
    id: '1',
    name: 'Dr. Sarah Mitchell',
    role: 'Pharmacist Prescriber',
    ahpraNumber: 'PHA-1045823',
    email: 's.mitchell@chemistcare.com.au',
    phone: '0412 345 678',
    active: true,
    permissions: ['prescribe', 'admin', 'billing'],
  },
  {
    id: '2',
    name: 'James Chen',
    role: 'Intern Pharmacist',
    ahpraNumber: 'PHA-2083941',
    email: 'j.chen@chemistcare.com.au',
    phone: '0423 456 789',
    active: true,
    permissions: ['consult', 'view'],
  },
  {
    id: '3',
    name: 'Emily O\'Brien',
    role: 'Pharmacy Assistant',
    ahpraNumber: 'PHA-3019284',
    email: 'e.obrien@chemistcare.com.au',
    phone: '0434 567 890',
    active: true,
    permissions: ['booking', 'view'],
  },
  {
    id: '4',
    name: 'Dr. Michael Park',
    role: 'Pharmacist Prescriber',
    ahpraNumber: 'PHA-1093847',
    email: 'm.park@chemistcare.com.au',
    phone: '0456 789 012',
    active: false,
    permissions: ['prescribe', 'view'],
  },
];

const ROLE_ICONS: Record<string, React.ReactNode> = {
  'Pharmacist Prescriber': <Stethoscope className="h-3.5 w-3.5" />,
  'Intern Pharmacist': <Clock className="h-3.5 w-3.5" />,
  'Pharmacy Assistant': <Shield className="h-3.5 w-3.5" />,
};

export default function StaffSettings() {
  const [staff, setStaff] = useState<StaffMember[]>(INITIAL_STAFF);
  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState({ name: '', role: '', ahpraNumber: '', email: '', phone: '' });

  const toggleActive = (id: string) => {
    setStaff(prev => prev.map(s => s.id === id ? { ...s, active: !s.active } : s));
  };

  const addStaff = () => {
    if (!form.name.trim()) return;
    const newMember: StaffMember = {
      id: crypto.randomUUID(),
      name: form.name,
      role: form.role || 'Pharmacy Assistant',
      ahpraNumber: form.ahpraNumber || 'Pending',
      email: form.email || '',
      phone: form.phone || '',
      active: true,
      permissions: ['view'],
    };
    setStaff(prev => [newMember, ...prev]);
    setForm({ name: '', role: '', ahpraNumber: '', email: '', phone: '' });
    setShowAddForm(false);
  };

  return (
    <SettingsLayout title="Staff">
      <div className="space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Total Staff', value: staff.length },
            { label: 'Active', value: staff.filter(s => s.active).length },
            { label: 'Prescribers', value: staff.filter(s => s.role === 'Pharmacist Prescriber').length },
            { label: 'Inactive', value: staff.filter(s => !s.active).length },
          ].map(stat => (
            <Card key={stat.label}>
              <CardContent className="pt-4 pb-3 px-4">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                <p className="text-2xl font-semibold mt-1">{stat.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Add Staff Form */}
        {showAddForm && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Add New Staff Member</CardTitle>
              <CardDescription>Enter details for the new team member</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Full Name *</Label>
                  <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Dr. Jane Smith" />
                </div>
                <div className="space-y-1.5">
                  <Label>Role</Label>
                  <Select value={form.role} onValueChange={v => setForm({ ...form, role: v })}>
                    <SelectTrigger><SelectValue placeholder="Select role…" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pharmacist Prescriber">Pharmacist Prescriber</SelectItem>
                      <SelectItem value="Intern Pharmacist">Intern Pharmacist</SelectItem>
                      <SelectItem value="Pharmacy Assistant">Pharmacy Assistant</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>AHPRA Number</Label>
                  <Input value={form.ahpraNumber} onChange={e => setForm({ ...form, ahpraNumber: e.target.value })} placeholder="PHA-XXXXXXX" />
                </div>
                <div className="space-y-1.5">
                  <Label>Phone</Label>
                  <Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="04XX XXX XXX" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Email</Label>
                <Input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="name@chemistcare.com.au" />
              </div>
              <div className="flex gap-2 pt-2">
                <Button onClick={addStaff}><Plus className="h-4 w-4 mr-1" /> Add Staff</Button>
                <Button variant="outline" onClick={() => setShowAddForm(false)}>Cancel</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Staff List */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base">Staff Directory</CardTitle>
              <CardDescription>Manage staff profiles, roles, and AHPRA registration details</CardDescription>
            </div>
            <Button size="sm" onClick={() => setShowAddForm(true)}><Plus className="h-4 w-4 mr-1" /> Add Staff</Button>
          </CardHeader>
          <CardContent>
            <div className="overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Staff Member</TableHead>
                    <TableHead className="text-xs">Role</TableHead>
                    <TableHead className="text-xs hidden sm:table-cell">AHPRA</TableHead>
                    <TableHead className="text-xs hidden md:table-cell">Contact</TableHead>
                    <TableHead className="text-xs">Permissions</TableHead>
                    <TableHead className="text-xs">Status</TableHead>
                    <TableHead className="text-xs w-10"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {staff.map((member) => (
                    <TableRow key={member.id} className={!member.active ? 'opacity-50' : ''}>
                      <TableCell>
                        <div className="flex items-center gap-2.5">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="text-xs bg-primary/10 text-primary">
                              {member.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">{member.name}</p>
                            <p className="text-xs text-muted-foreground">{member.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          {ROLE_ICONS[member.role]}
                          <span className="text-xs font-medium">{member.role}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs hidden sm:table-cell font-mono">{member.ahpraNumber}</TableCell>
                      <TableCell className="text-xs hidden md:table-cell text-muted-foreground">{member.phone}</TableCell>
                      <TableCell>
                        <div className="flex gap-1 flex-wrap">
                          {member.permissions.map(p => (
                            <Badge key={p} variant="outline" className="text-[0.625rem] capitalize">{p}</Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Switch checked={member.active} onCheckedChange={() => toggleActive(member.id)} />
                          <Badge variant={member.active ? 'default' : 'secondary'} className="text-[0.625rem]">
                            {member.active ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" className="h-8 w-8"><Pencil className="h-3.5 w-3.5" /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </SettingsLayout>
  );
}
