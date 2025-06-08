import { Appointment } from '@/lib/types/appointment';
import { formatDateDisplay } from '@/lib/utils/dateUtils';
import { cn } from '@/lib/utils';

interface AppointmentSlotProps {
  appointment?: Appointment;
  date: Date;
  timeSlot: string;
  salesRep: string;
  onBook: (date: Date, timeSlot: string, salesRep: string) => void;
}

export default function AppointmentSlot({
  appointment,
  date,
  timeSlot,
  salesRep,
  onBook,
}: AppointmentSlotProps) {
  const isAvailable = !appointment;
  const isToday = new Date().toDateString() === date.toDateString();

  return (
    <button
      onClick={() => onBook(date, timeSlot, salesRep)}
      className={cn(
        'p-2 rounded-lg text-sm transition-colors duration-200',
        'border border-gray-200 hover:border-blue-500',
        'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50',
        isAvailable
          ? 'bg-green-50 hover:bg-green-100'
          : 'bg-purple-50 hover:bg-purple-100',
        isToday && 'ring-2 ring-blue-500'
      )}
    >
      <div className="font-medium text-gray-900">{timeSlot}</div>
      <div className="text-xs text-gray-500">{salesRep}</div>
      {isAvailable ? (
        <div className="text-green-600 font-medium mt-1">Available</div>
      ) : (
        <div className="text-purple-600 font-medium mt-1">
          {appointment.customerName}
        </div>
      )}
    </button>
  );
} 