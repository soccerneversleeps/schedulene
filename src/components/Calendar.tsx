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
import { Great_Vibes, Oswald } from 'next/font/google';

const SALES_REPS: SalesRep[] = ['Rep A', 'Rep B'];

// Configure beautiful Google Fonts for the logo
const greatVibes = Great_Vibes({
  subsets: ['latin'],
  weight: ['400'],
  display: 'swap',
});

const oswald = Oswald({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
});

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 text-white shadow-xl">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 tracking-tight relative">
              <span className="relative inline-block">
                <span className="relative inline-block">
                  {/* Flowing S that creates underline effect */}
                  <span 
                    className={`${greatVibes.className} text-9xl md:text-[10rem] absolute -left-20 md:-left-28 -top-1 text-yellow-300`}
                    style={{ 
                      textShadow: '4px 4px 8px rgba(0,0,0,0.5), 0 0 20px rgba(255,255,0,0.3)',
                      zIndex: 1,
                      filter: 'drop-shadow(2px 2px 4px rgba(255,215,0,0.6))',
                      transform: 'rotate(-8deg) scaleX(1.3)'
                    }}
                  >
                    S
                  </span>
                  
                  {/* Flowing underline created by CSS */}
                  <span className="absolute -bottom-2 left-12 right-0 h-2">
                    <div 
                      className="w-full h-1 bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-300 rounded-full"
                      style={{
                        boxShadow: '0 0 8px rgba(255,215,0,0.6), 0 2px 4px rgba(0,0,0,0.3)',
                        transform: 'rotate(-1deg)'
                      }}
                    ></div>
                  </span>
                  
                  <span 
                    className={`${oswald.className} ml-12 font-bold tracking-wider relative z-10 text-white`}
                    style={{ 
                      letterSpacing: '0.12em',
                      textShadow: '3px 3px 6px rgba(0,0,0,0.7), 0 0 15px rgba(255,255,255,0.2)',
                      fontWeight: 700,
                      filter: 'drop-shadow(0 0 8px rgba(255,255,255,0.3))'
                    }}
                  >
                    CHEDULENE
                  </span>
                </span>
              </span>
            </h1>
            <div className="relative">
              <p className="text-blue-100 text-sm font-medium tracking-wide ml-12 -mt-1">
                a Family First Energy scheduling tool
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto p-4 pt-8">
        <div className="flex flex-col items-center text-center mb-6 gap-3">
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight drop-shadow-sm" style={{ letterSpacing: '-0.01em' }}>Appointment Calendar</h2>
          <div className="text-lg font-medium text-blue-700 bg-white rounded-lg px-4 py-2 shadow-lg border border-blue-200 backdrop-blur-sm">
            {formatWeekRange(weekDates)}
          </div>
          <div className="flex gap-2 mt-2">
            <button
              onClick={goToToday}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-blue-600 rounded-lg hover:bg-blue-700 transition shadow-md"
            >
              Today
            </button>
            <button
              onClick={goToPreviousWeek}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition shadow-md"
            >
              Previous Week
            </button>
            <button
              onClick={goToNextWeek}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition shadow-md"
            >
              Next Week
            </button>
          </div>
        </div>
        {/* Desktop and tablet layout */}
        <div className="hidden sm:block bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden">
          <div className="grid grid-cols-8">
            <div className="col-span-1 border-r-2 border-gray-300">
              <div className="h-12 border-b-2 border-gray-300 bg-gradient-to-r from-gray-100 to-gray-200"></div>
              {TIME_SLOTS.map((timeSlot, index) => (
                <div 
                  key={timeSlot} 
                  className={cn(
                    "h-36 flex items-center justify-center bg-gradient-to-r from-gray-50 to-gray-100",
                    index < TIME_SLOTS.length - 1 && "border-b-2 border-gray-300"
                  )}
                >
                  <span className="text-sm font-bold text-gray-800">{timeSlot}</span>
                </div>
              ))}
          </div>
            {weekDates.map((date, dateIndex) => (
              <div key={date.toISOString()} className={cn(
                "col-span-1",
                dateIndex < weekDates.length - 1 && "border-r-2 border-gray-300"
              )}>
                <div className="h-12 flex items-center justify-center border-b-2 border-gray-300 bg-gradient-to-r from-blue-50 to-indigo-50">
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
                      "h-36 p-1 bg-gradient-to-br from-white to-gray-50",
                      timeIndex < TIME_SLOTS.length - 1 && "border-b-2 border-gray-300"
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
          <div className="space-y-6">
            {weekDates.map((date) => (
              <div key={date.toISOString()} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-lg">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-4 border-b border-gray-200">
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
    </div>
  );
} 