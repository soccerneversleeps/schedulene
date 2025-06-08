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
  };

  const getAppointmentForSlot = (date: Date, timeSlot: string, salesRep: string) => {
    return appointments.find(
      (apt) =>
        apt.date === formatDate(date) &&
        apt.timeSlot === timeSlot &&
        apt.salesRep === salesRep
    );
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Appointment Calendar</h1>
        <div className="space-x-2">
          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
          >
            Today
          </button>
          <button
            onClick={() => setCurrentDate((prev) => new Date(prev.setDate(prev.getDate() - 7)))}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
          >
            Previous Week
          </button>
          <button
            onClick={() => setCurrentDate((prev) => new Date(prev.setDate(prev.getDate() + 7)))}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
          >
            Next Week
          </button>
        </div>
      </div>

      <div className="grid grid-cols-8 gap-4">
        {/* Time slots column */}
        <div className="col-span-1">
          <div className="h-12"></div> {/* Header spacer */}
          {TIME_SLOTS.map((timeSlot) => (
            <div key={timeSlot} className="h-32 flex items-center justify-center">
              <span className="text-sm text-gray-500">{timeSlot}</span>
            </div>
          ))}
        </div>

        {/* Days columns */}
        {weekDates.map((date) => (
          <div key={date.toISOString()} className="col-span-1">
            <div className="h-12 flex items-center justify-center border-b">
              <div className="text-center">
                <div className="font-medium">
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