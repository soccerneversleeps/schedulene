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
          'w-full h-full p-2 rounded-lg text-sm transition-all duration-200',
          'border focus:outline-none focus:ring-2 focus:ring-opacity-50',
          'flex flex-col justify-center items-center text-center',
          isAvailable
            ? 'border-gray-200 bg-green-50 hover:bg-green-100 hover:border-green-400 focus:ring-green-500 cursor-pointer'
            : 'border-purple-200 bg-purple-50 hover:bg-purple-100 hover:border-purple-400 focus:ring-purple-500 cursor-pointer',
          isToday && 'ring-2 ring-blue-400'
        )}
      >
        <div className="font-medium text-gray-900 text-xs leading-tight">
          {timeSlot}
        </div>
        <div className="text-xs text-gray-500 leading-tight">
          {salesRep}
        </div>
        <div className={cn(
          'font-medium text-xs leading-tight mt-1',
          isAvailable ? 'text-green-600' : 'text-purple-600'
        )}>
          {isAvailable ? 'Available' : appointment?.contactName}
        </div>
      </button>
    </div>
  );
} 