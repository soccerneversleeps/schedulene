import { Appointment } from '@/lib/types/appointment';
import { formatDateDisplay } from '@/lib/utils/dateUtils';
import { cn } from '@/lib/utils';

interface AppointmentSlotProps {
  appointment?: Appointment;
  date: Date;
  timeSlot: string;
  salesRep: string;
  onBook: (date: Date, timeSlot: string, salesRep: string) => void;
  onViewDetails: (appointment: Appointment) => void;
}

export default function AppointmentSlot({
  appointment,
  date,
  timeSlot,
  salesRep,
  onBook,
  onViewDetails,
}: AppointmentSlotProps) {
  const isAvailable = !appointment;
  const isToday = new Date().toDateString() === date.toDateString();

  const handleMainClick = () => {
    if (isAvailable) {
      onBook(date, timeSlot, salesRep);
    } else if (appointment) {
      onViewDetails(appointment);
    }
  };

  return (
    <div className="relative w-full h-16 mb-1">
      <button
        onClick={handleMainClick}
        className={cn(
          'w-full h-full p-2 rounded-lg text-sm transition-all duration-300 transform hover:scale-105',
          'border focus:outline-none focus:ring-2 focus:ring-opacity-50 shadow-md hover:shadow-lg',
          'flex flex-col justify-center items-center text-center',
          isAvailable
            ? 'border-emerald-200 bg-gradient-to-br from-emerald-50 to-green-100 hover:from-emerald-100 hover:to-green-200 hover:border-emerald-400 focus:ring-emerald-500 cursor-pointer'
            : 'border-violet-200 bg-gradient-to-br from-violet-50 to-purple-100 hover:from-violet-100 hover:to-purple-200 hover:border-violet-400 focus:ring-violet-500 cursor-pointer',
          isToday && 'ring-2 ring-blue-400 ring-offset-2'
        )}
      >
        <div className="font-medium text-gray-900 text-xs leading-tight">
          {timeSlot}
        </div>
        <div className="text-xs text-gray-500 leading-tight">
          {salesRep}
        </div>
        <div className={cn(
          'font-semibold text-xs leading-tight mt-1',
          isAvailable ? 'text-emerald-700' : 'text-violet-700'
        )}>
          {isAvailable ? 'Available' : appointment?.contactName}
        </div>
      </button>
    </div>
  );
} 