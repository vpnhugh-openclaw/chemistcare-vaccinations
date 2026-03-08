import { useState } from 'react';
import { ClinicalLayout } from '@/components/ClinicalLayout';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, addMonths, subMonths } from 'date-fns';
import { sampleAppointments, AppointmentSlot, BookingStatus } from '@/data/booking-data';
import { DayView } from '@/components/calendar/DayView';
import { WeekView } from '@/components/calendar/WeekView';
import { MonthView } from '@/components/calendar/MonthView';
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
  const [activeView, setActiveView] = useState('month');

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

  const handlePrevMonth = () => setSelectedDate(prev => subMonths(prev, 1));
  const handleNextMonth = () => setSelectedDate(prev => addMonths(prev, 1));

  return (
    <ClinicalLayout>
      <div className="p-4 md:p-6 space-y-5 animate-fade-in">
        {/* Header row */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Appointment Calendar</h1>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-1" /> New Appointment
          </Button>
        </div>

        {/* KPI bar */}
        <StatusSummaryBar appointments={appointments} selectedDate={selectedDate} />

        {/* Calendar card */}
        <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
          {/* Centered month nav + view toggle */}
          <div className="flex flex-col items-center gap-3 pt-6 pb-4 px-4">
            {/* Month navigator */}
            <div className="flex items-center gap-4">
              <button
                onClick={handlePrevMonth}
                className="w-8 h-8 flex items-center justify-center rounded-full text-muted-foreground hover:bg-secondary transition-colors"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <h2 className="text-xl font-semibold tracking-tight text-foreground min-w-[200px] text-center mb-0">
                {format(selectedDate, 'MMMM yyyy')}
              </h2>
              <button
                onClick={handleNextMonth}
                className="w-8 h-8 flex items-center justify-center rounded-full text-muted-foreground hover:bg-secondary transition-colors"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>

            {/* Today helper */}
            <p className="text-sm text-muted-foreground">
              Today is {format(new Date(), 'EEEE, d MMMM yyyy')}
            </p>

            {/* View toggle */}
            <Tabs value={activeView} onValueChange={setActiveView}>
              <TabsList className="bg-secondary/60 rounded-full px-1">
                <TabsTrigger value="month" className="rounded-full text-xs px-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  Monthly View
                </TabsTrigger>
                <TabsTrigger value="week" className="rounded-full text-xs px-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  Weekly View
                </TabsTrigger>
                <TabsTrigger value="day" className="rounded-full text-xs px-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  Daily View
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* View content */}
          <div className="px-4 md:px-8 pb-6">
            {activeView === 'month' && (
              <MonthView
                selectedDate={selectedDate}
                onDateChange={setSelectedDate}
                appointments={appointments}
                onAppointmentClick={handleAppointmentClick}
                onSwitchToDay={(date) => { setSelectedDate(date); setActiveView('day'); }}
              />
            )}
            {activeView === 'week' && (
              <WeekView
                selectedDate={selectedDate}
                onDateChange={setSelectedDate}
                appointments={appointments}
                onAppointmentClick={handleAppointmentClick}
              />
            )}
            {activeView === 'day' && (
              <DayView
                selectedDate={selectedDate}
                onDateChange={setSelectedDate}
                appointments={appointments}
                onAppointmentClick={handleAppointmentClick}
              />
            )}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-6 py-4 border-t border-border bg-secondary/20">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-primary" />
              <span className="text-xs text-muted-foreground">Today</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: 'hsl(var(--clinical-safe))' }} />
              <span className="text-xs text-muted-foreground">Confirmed</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: 'hsl(var(--clinical-warning))' }} />
              <span className="text-xs text-muted-foreground">Pending</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: 'hsl(var(--clinical-danger))' }} />
              <span className="text-xs text-muted-foreground">Cancelled</span>
            </div>
          </div>
        </div>
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

      {/* New appointment wizard */}
      <NewAppointmentDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onAdd={handleAddAppointment}
      />

      {/* Complete Encounter wizard */}
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
