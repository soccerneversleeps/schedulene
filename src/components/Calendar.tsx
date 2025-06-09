import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, addDoc, deleteDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/firebase';
import { useAuth } from '@/lib/hooks/useAuth';
import { Appointment, SalesRep, TimeSlot } from '@/lib/types/appointment';
import { BookingFormData } from '@/lib/types/appointment';
import { getWeekDates, formatDate, TIME_SLOTS } from '@/lib/utils/dateUtils';
import { cn } from '@/lib/utils';
import AppointmentSlot from './AppointmentSlot';
import BookingModal from './BookingModal';
import AppointmentDetailsModal from './AppointmentDetailsModal';

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
    appointment?: Appointment;
  } | null>(null);
  const [viewingAppointment, setViewingAppointment] = useState<Appointment | null>(null);

  const weekDates = getWeekDates(currentDate);

  useEffect(() => {
    if (!user) return;
    
    // Calculate week dates inside useEffect to avoid dependency issues
    const currentWeekDates = getWeekDates(currentDate);
    const startDate = formatDate(currentWeekDates[0]);
    const endDate = formatDate(currentWeekDates[6]);
    console.log('📅 Loading appointments for week:', startDate, 'to', endDate);
    
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
      console.log(`📋 Loaded ${appointmentsData.length} appointments`);
      setAppointments(appointmentsData);
    }, (error) => {
      console.error('❌ Error listening to appointments:', error);
    });
    
    return () => unsubscribe();
  }, [user, currentDate]);

  const handleBook = (date: Date, timeSlot: string, salesRep: string) => {
    const existingAppointment = getAppointmentForSlot(date, timeSlot, salesRep);
    setSelectedSlot({ date, timeSlot, salesRep, appointment: existingAppointment });
  };

  const handleBookingSubmit = async (formData: BookingFormData) => {
    if (!user || !selectedSlot) {
      console.error('❌ Missing user or selectedSlot for booking');
      return;
    }
    
    // Double-check that the slot is still available (race condition protection)
    const existingAppointment = getAppointmentForSlot(selectedSlot.date, selectedSlot.timeSlot, selectedSlot.salesRep);
    if (existingAppointment) {
      console.log('⚠️ Slot was booked by someone else while form was open');
      alert('This slot was just booked by someone else. Please choose a different time slot.');
      setSelectedSlot(null);
      return;
    }
    
    const appointmentData = {
      ...formData,
      salesRep: selectedSlot.salesRep,
      date: formatDate(selectedSlot.date),
      timeSlot: selectedSlot.timeSlot,
      bookedBy: user.uid,
      bookedAt: serverTimestamp(),
      status: 'scheduled' as const,
    };
    
    console.log('💾 Booking appointment:', formData.contactName, 'with', selectedSlot.salesRep, 'on', formatDate(selectedSlot.date), selectedSlot.timeSlot);
    
    try {
      const docRef = await addDoc(collection(db, 'appointments'), appointmentData);
      console.log('✅ Appointment booked successfully');
      setSelectedSlot(null);
    } catch (error) {
      console.error('❌ Error saving appointment:', error);
      alert('Error booking appointment. Please try again.');
    }
  };

  const handleDeleteAppointment = async (appointmentId: string) => {
    if (!confirm('Are you sure you want to delete this appointment?')) {
      return;
    }
    
    try {
      await deleteDoc(doc(db, 'appointments', appointmentId));
      console.log('🗑️ Appointment deleted successfully');
      setSelectedSlot(null);
      setViewingAppointment(null);
    } catch (error) {
      console.error('❌ Error deleting appointment:', error);
      alert('Error deleting appointment. Please try again.');
    }
  };

  const handleUpdateAppointment = async (appointmentId: string, formData: BookingFormData) => {
    if (!user) {
      console.error('❌ Missing user for appointment update');
      return;
    }
    
    console.log('📝 Updating appointment:', appointmentId, formData.contactName);
    
    try {
      const appointmentRef = doc(db, 'appointments', appointmentId);
      await updateDoc(appointmentRef, {
        ...formData,
        updatedAt: serverTimestamp(),
      });
      console.log('✅ Appointment updated successfully');
      setViewingAppointment(null);
    } catch (error) {
      console.error('❌ Error updating appointment:', error);
      alert('Error updating appointment. Please try again.');
    }
  };

  const handleViewAppointmentDetails = (appointment: Appointment) => {
    setViewingAppointment(appointment);
  };

  const getAppointmentForSlot = (date: Date, timeSlot: string, salesRep: string) => {
    const matchingAppointments = appointments.filter(
      (apt) =>
        apt.date === formatDate(date) &&
        apt.timeSlot === timeSlot &&
        apt.salesRep === salesRep
    );
    
    if (matchingAppointments.length === 0) return undefined;
    
    // If multiple appointments exist for the same slot, return the most recent one
    if (matchingAppointments.length > 1) {
      console.warn('⚠️ Multiple appointments found for same slot:', {
        date: formatDate(date),
        timeSlot,
        salesRep,
        count: matchingAppointments.length
      });
    }
    
    // Sort by bookedAt timestamp and return the most recent
    return matchingAppointments.sort((a, b) => {
      const getTime = (timestamp: any): number => {
        if (!timestamp) return 0;
        if (typeof timestamp === 'object' && 'seconds' in timestamp) {
          return Number(timestamp.seconds);
        }
        return new Date(timestamp).getTime();
      };
      
      const timeA = getTime(a.bookedAt);
      const timeB = getTime(b.bookedAt);
      return timeB - timeA;
    })[0];
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
            {/* Desktop and tablet layout */}
      <div className="hidden sm:block border-2 border-black">
        <div className="grid grid-cols-8">
          <div className="col-span-1 border-r-2 border-black">
            <div className="h-12 border-b-2 border-black bg-gray-100"></div>
            {TIME_SLOTS.map((timeSlot, index) => (
              <div 
                key={timeSlot} 
                className={cn(
                  "h-36 flex items-center justify-center bg-gray-50",
                  index < TIME_SLOTS.length - 1 && "border-b-2 border-black"
                )}
              >
                <span className="text-sm font-bold text-gray-700">{timeSlot}</span>
              </div>
            ))}
          </div>
          {weekDates.map((date, dateIndex) => (
            <div key={date.toISOString()} className={cn(
              "col-span-1",
              dateIndex < weekDates.length - 1 && "border-r-2 border-black"
            )}>
              <div className="h-12 flex items-center justify-center border-b-2 border-black bg-gray-100">
                <div className="text-center">
                  <div className="font-bold text-gray-800 text-sm">
                    {date.toLocaleDateString('en-US', { weekday: 'short' })}
                  </div>
                  <div className="text-xs text-gray-600">
                    {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                </div>
              </div>
              {TIME_SLOTS.map((timeSlot, timeIndex) => (
                <div 
                  key={timeSlot} 
                  className={cn(
                    "h-36 p-1",
                    timeIndex < TIME_SLOTS.length - 1 && "border-b-2 border-black"
                  )}
                >
                  <div className="flex flex-col gap-1 h-full">
                    {SALES_REPS.map((salesRep) => (
                      <AppointmentSlot
                        key={`${timeSlot}-${salesRep}`}
                        appointment={getAppointmentForSlot(date, timeSlot, salesRep)}
                        date={date}
                        timeSlot={timeSlot}
                        salesRep={salesRep}
                        onBook={handleBook}
                        onViewDetails={handleViewAppointmentDetails}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Mobile layout */}
      <div className="block sm:hidden">
        <div className="space-y-4">
          {weekDates.map((date) => (
            <div key={date.toISOString()} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                <h3 className="font-semibold text-gray-800">
                  {date.toLocaleDateString('en-US', { 
                    weekday: 'long',
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </h3>
              </div>
              <div className="p-4">
                {TIME_SLOTS.map((timeSlot) => (
                  <div key={timeSlot} className="mb-4 last:mb-0">
                    <div className="text-sm font-medium text-gray-600 mb-2">{timeSlot}</div>
                    <div className="grid grid-cols-2 gap-2">
                      {SALES_REPS.map((salesRep) => (
                        <AppointmentSlot
                          key={`${timeSlot}-${salesRep}`}
                          appointment={getAppointmentForSlot(date, timeSlot, salesRep)}
                          date={date}
                          timeSlot={timeSlot}
                          salesRep={salesRep}
                          onBook={handleBook}
                          onViewDetails={handleViewAppointmentDetails}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      {selectedSlot && !selectedSlot.appointment && (
        <BookingModal
          isOpen={!!selectedSlot && !selectedSlot.appointment}
          onClose={() => setSelectedSlot(null)}
          onSubmit={handleBookingSubmit}
          date={selectedSlot.date}
          timeSlot={selectedSlot.timeSlot}
          salesRep={selectedSlot.salesRep}
        />
      )}
      
      {viewingAppointment && (
        <AppointmentDetailsModal
          isOpen={!!viewingAppointment}
          onClose={() => setViewingAppointment(null)}
          appointment={viewingAppointment}
          onDelete={handleDeleteAppointment}
          onUpdate={handleUpdateAppointment}
        />
      )}
    </div>
  );
} 