import { SettingsLayout } from '@/components/settings/SettingsLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Building2, MapPin, Phone, Mail, Globe, Clock, CheckCircle2 } from 'lucide-react';

export default function PharmacySettings() {
  return (
    <SettingsLayout title="Pharmacy Details">
      <div className="space-y-4">
        {/* Header Card */}
        <Card className="border-primary/20">
          <CardContent className="p-5">
            <div className="flex items-start gap-4">
              <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-primary/10 shrink-0">
                <Building2 className="h-7 w-7 text-primary" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-bold">ChemistCare Blackburn</h2>
                <p className="text-sm text-muted-foreground">Community Pharmacy · Pharmacist Prescriber Model</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  <Badge variant="outline" className="text-[0.625rem]"><CheckCircle2 className="h-3 w-3 mr-1" />AHPRA Registered</Badge>
                  <Badge variant="outline" className="text-[0.625rem]"><CheckCircle2 className="h-3 w-3 mr-1" />Section 90 Approved</Badge>
                  <Badge variant="outline" className="text-[0.625rem]"><CheckCircle2 className="h-3 w-3 mr-1" />8CPA Accredited</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Basic Information</CardTitle>
              <CardDescription>Pharmacy registration and identification details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs">Pharmacy Name</Label>
                  <Input defaultValue="ChemistCare Blackburn" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Trading Name</Label>
                  <Input defaultValue="ChemistCare Pharmacy" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs">ABN</Label>
                  <Input defaultValue="12 345 678 901" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Section 90 Approval Number</Label>
                  <Input defaultValue="S90-2024-VIC-00482" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Pharmacy Licence Number</Label>
                <Input defaultValue="PHARM-VIC-12345" />
              </div>
              <Separator />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs">Phone</Label>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                    <Input defaultValue="(03) 9123 4567" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Email</Label>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                    <Input defaultValue="info@chemistcare.com.au" />
                  </div>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Website</Label>
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-muted-foreground shrink-0" />
                  <Input defaultValue="https://chemistcare.com.au" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Address + Hours */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Address &amp; Hours</CardTitle>
              <CardDescription>Physical location and operating hours</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs">Address</Label>
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
                  <div className="space-y-1 w-full">
                    <Input defaultValue="Shop 12, Blackburn Central" />
                    <Input defaultValue="123 Main Street, Blackburn VIC 3130" />
                  </div>
                </div>
              </div>
              <Separator />
              <div className="space-y-2">
                <p className="text-xs font-medium">Opening Hours</p>
                {[
                  { day: 'Monday', hours: '8:00 AM – 8:00 PM' },
                  { day: 'Tuesday', hours: '8:00 AM – 8:00 PM' },
                  { day: 'Wednesday', hours: '8:00 AM – 8:00 PM' },
                  { day: 'Thursday', hours: '8:00 AM – 9:00 PM' },
                  { day: 'Friday', hours: '8:00 AM – 9:00 PM' },
                  { day: 'Saturday', hours: '8:00 AM – 6:00 PM' },
                  { day: 'Sunday', hours: '9:00 AM – 5:00 PM' },
                ].map(({ day, hours }) => (
                  <div key={day} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{day}</span>
                    <span className="font-medium">{hours}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Jurisdiction */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Jurisdiction &amp; Prescribing Authority</CardTitle>
            <CardDescription>Regulatory settings for pharmacist prescribing</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs">Jurisdiction</Label>
                <Input defaultValue="Victoria" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Prescribing Authority</Label>
                <Input defaultValue="Community Pharmacist Prescriber" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Authorisation Level</Label>
                <Input defaultValue="Independent Prescriber (S90)" />
              </div>
            </div>
            <Separator />
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="text-[0.625rem]">Vaccination Administration</Badge>
              <Badge variant="outline" className="text-[0.625rem]">Travel Medicine</Badge>
              <Badge variant="outline" className="text-[0.625rem]">Minor Ailments</Badge>
              <Badge variant="outline" className="text-[0.625rem]">Oral Contraceptive Resupply</Badge>
              <Badge variant="outline" className="text-[0.625rem]">Dose Administration Aids</Badge>
              <Badge variant="outline" className="text-[0.625rem]">MedsCheck</Badge>
              <Badge variant="outline" className="text-[0.625rem]">Diabetes MedsCheck</Badge>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button><CheckCircle2 className="h-4 w-4 mr-1" /> Save Changes</Button>
        </div>
      </div>
    </SettingsLayout>
  );
}
