import { SettingsLayout } from '@/components/settings/SettingsLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function RoomsSettings() {
  return (
    <SettingsLayout title="Rooms">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Consultation Rooms</CardTitle>
          <CardDescription>Manage rooms and capacity for scheduling</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Room configuration will be managed here. Define consultation rooms, capacity, and equipment availability.</p>
        </CardContent>
      </Card>
    </SettingsLayout>
  );
}
