import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/firebase';
import { useAuth } from '@/lib/hooks/useAuth';
import { Appointment, SalesRep, TimeSlot } from '@/lib/types/appointment';
import { BookingFormData } from '@/lib/types/appointment';
import { getWeekDates, formatDate, TIME_SLOTS } from '@/lib/utils/dateUtils';
import AppointmentSlot from './AppointmentSlot';
import BookingModal from './BookingModal';

const SALES_REPS: SalesRep[] = ['Rep A', 'Rep B'];

function formatWeekRange(dates: Date[]) {
  const start = dates[0];
  const end = dates[6];
  const startStr = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const endStr = end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  return `${startStr} – ${endStr}`;
}

export default function Calendar() {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<{
    date: Date;
    timeSlot: string;
    salesRep: string;
  } | null>(null);

  const weekDates = getWeekDates(currentDate);

  useEffect(() => {
    if (!user) return;
    const startDate = formatDate(weekDates[0]);
    const endDate = formatDate(weekDates[6]);
    const q = query(
      collection(db, 'appointments'),
      where('date', '>=', startDate),
      where('date', '<=', endDate)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const appointmentsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Appointment[];
      setAppointments(appointmentsData);
    });
    return () => unsubscribe();
  }, [user, weekDates]);

  const handleBook = (date: Date, timeSlot: string, salesRep: string) => {
    setSelectedSlot({ date, timeSlot, salesRep });
  };

  const handleBookingSubmit = async (formData: BookingFormData) => {
    if (!user || !selectedSlot) return;
    const appointmentData = {
      ...formData,
      salesRep: selectedSlot.salesRep,
      date: formatDate(selectedSlot.date),
      timeSlot: selectedSlot.timeSlot,
      bookedBy: user.uid,
      bookedAt: serverTimestamp(),
      status: 'scheduled' as const,
    };
    await addDoc(collection(db, 'appointments'), appointmentData);
    setSelectedSlot(null);
  };

  const getAppointmentForSlot = (date: Date, timeSlot: string, salesRep: string) => {
    return appointments.find(
      (apt) =>
        apt.date === formatDate(date) &&
        apt.timeSlot === timeSlot &&
        apt.salesRep === salesRep
    );
  };

  const goToPreviousWeek = () => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      newDate.setDate(newDate.getDate() - 7);
      return newDate;
    });
  };
  const goToNextWeek = () => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      newDate.setDate(newDate.getDate() + 7);
      return newDate;
    });
  };
  const goToToday = () => {
    setCurrentDate(new Date());
  };

  return (
    <div className="p-4">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-4 gap-2">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight drop-shadow-sm mb-1" style={{ letterSpacing: '-0.01em' }}>Appointment Calendar</h1>
          <div className="text-lg font-medium text-blue-700 bg-blue-50 rounded px-3 py-1 inline-block shadow-sm border border-blue-200">
            {formatWeekRange(weekDates)}
          </div>
        </div>
        <div className="flex gap-2 mt-2 sm:mt-0">
          <button
            onClick={goToToday}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-100 transition"
          >
            Today
          </button>
          <button
            onClick={goToPreviousWeek}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-100 transition"
          >
            Previous Week
          </button>
          <button
            onClick={goToNextWeek}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-100 transition"
          >
            Next Week
          </button>
        </div>
      </div>
      <div className="grid grid-cols-8 gap-4">
        <div className="col-span-1">
          <div className="h-12"></div>
          {TIME_SLOTS.map((timeSlot) => (
            <div key={timeSlot} className="h-32 flex items-center justify-center">
              <span className="text-sm text-gray-500">{timeSlot}</span>
            </div>
          ))}
        </div>
        {weekDates.map((date) => (
          <div key={date.toISOString()} className="col-span-1">
            <div className="h-12 flex items-center justify-center border-b">
              <div className="text-center">
                <div className="font-semibold text-gray-800">
                  {date.toLocaleDateString('en-US', { weekday: 'short' })}
                </div>
                <div className="text-sm text-gray-500">
                  {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </div>
              </div>
            </div>
            {TIME_SLOTS.map((timeSlot) => (
              <div key={timeSlot} className="h-32 p-1">
                {SALES_REPS.map((salesRep) => (
                  <AppointmentSlot
                    key={`${timeSlot}-${salesRep}`}
                    appointment={getAppointmentForSlot(date, timeSlot, salesRep)}
                    date={date}
                    timeSlot={timeSlot}
                    salesRep={salesRep}
                    onBook={handleBook}
                  />
                ))}
              </div>
            ))}
          </div>
        ))}
      </div>
      {selectedSlot && (
        <BookingModal
          isOpen={!!selectedSlot}
          onClose={() => setSelectedSlot(null)}
          onSubmit={handleBookingSubmit}
          date={selectedSlot.date}
          timeSlot={selectedSlot.timeSlot}
          salesRep={selectedSlot.salesRep}
        />
      )}
    </div>
  );
} 