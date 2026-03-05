import { useState } from 'react';
import { ClinicalLayout } from '@/components/ClinicalLayout';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Plus } from 'lucide-react';
import { sampleAppointments, AppointmentSlot, BookingStatus } from '@/data/booking-data';
import { DayView } from '@/components/calendar/DayView';
import { WeekView } from '@/components/calendar/WeekView';
import { AppointmentDetailSheet } from '@/components/calendar/AppointmentDetailSheet';
import { NewAppointmentDialog } from '@/components/calendar/NewAppointmentDialog';
import { StatusSummaryBar } from '@/components/calendar/StatusSummaryBar';
import { EncounterWizard } from '@/components/booking/EncounterWizard';

const CalendarPage = () => {
  const [appointments, setAppointments] = useState<AppointmentSlot[]>(sampleAppointments);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedApt, setSelectedApt] = useState<AppointmentSlot | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [encounterApt, setEncounterApt] = useState<AppointmentSlot | null>(null);
  const [encounterOpen, setEncounterOpen] = useState(false);

  const handleStatusChange = (id: string, status: BookingStatus) => {
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status } : a));
    if (selectedApt?.id === id) setSelectedApt(prev => prev ? { ...prev, status } : null);
  };

  const handleNotesChange = (id: string, notes: string) => {
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, notes } : a));
    if (selectedApt?.id === id) setSelectedApt(prev => prev ? { ...prev, notes } : null);
  };

  const handleAppointmentClick = (apt: AppointmentSlot) => {
    setSelectedApt(apt);
    setSheetOpen(true);
  };

  const handleAddAppointment = (apt: AppointmentSlot) => {
    setAppointments(prev => [...prev, apt]);
  };

  const handleCompleteEncounter = (apt: AppointmentSlot) => {
    setSheetOpen(false);
    setEncounterApt(apt);
    setEncounterOpen(true);
  };

  const handleEncounterDone = () => {
    if (encounterApt) {
      handleStatusChange(encounterApt.id, 'completed');
    }
    setEncounterOpen(false);
    setEncounterApt(null);
  };

  return (
    <ClinicalLayout>
      <div className="p-4 md:p-6 space-y-5 animate-fade-in">
        {/* Top bar */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Appointment Calendar</h1>
          <Button onClick={() => setDialogOpen(true)}><Plus className="h-4 w-4 mr-1" /> New Appointment</Button>
        </div>

        {/* KPI bar */}
        <StatusSummaryBar appointments={appointments} selectedDate={selectedDate} />

        {/* Calendar views */}
        <Tabs defaultValue="day">
          <TabsList>
            <TabsTrigger value="day">Day View</TabsTrigger>
            <TabsTrigger value="week">Week View</TabsTrigger>
          </TabsList>
          <TabsContent value="day" className="mt-4">
            <DayView
              selectedDate={selectedDate}
              onDateChange={setSelectedDate}
              appointments={appointments}
              onAppointmentClick={handleAppointmentClick}
            />
          </TabsContent>
          <TabsContent value="week" className="mt-4">
            <WeekView
              selectedDate={selectedDate}
              onDateChange={setSelectedDate}
              appointments={appointments}
              onAppointmentClick={handleAppointmentClick}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Detail sheet */}
      <AppointmentDetailSheet
        appointment={selectedApt}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        onStatusChange={handleStatusChange}
        onNotesChange={handleNotesChange}
        onCompleteEncounter={handleCompleteEncounter}
      />

      {/* New appointment wizard (drawer) */}
      <NewAppointmentDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onAdd={handleAddAppointment}
      />

      {/* Complete Encounter wizard (right-side drawer) */}
      <Sheet open={encounterOpen} onOpenChange={setEncounterOpen}>
        <SheetContent className="sm:max-w-lg w-full overflow-y-auto">
          <SheetHeader className="mb-4">
            <SheetTitle>Complete Encounter</SheetTitle>
          </SheetHeader>
          {encounterOpen && encounterApt && (
            <EncounterWizard
              appointment={encounterApt}
              onComplete={handleEncounterDone}
              onCancel={() => { setEncounterOpen(false); setEncounterApt(null); }}
            />
          )}
        </SheetContent>
      </Sheet>
    </ClinicalLayout>
  );
};

export default CalendarPage;
