import { Appointment } from '@/lib/types/appointment';
import { formatDateDisplay } from '@/lib/utils/dateUtils';

interface AppointmentDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: Appointment;
  onDelete: (appointmentId: string) => void;
}

export default function AppointmentDetailsModal({
  isOpen,
  onClose,
  appointment,
  onDelete,
}: AppointmentDetailsModalProps) {
  if (!isOpen) return null;

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this appointment?')) {
      onDelete(appointment.id);
    }
  };

  const formatBookedAt = (timestamp: any): string => {
    if (!timestamp) return 'Unknown';
    
    let date: Date;
    if (typeof timestamp === 'object' && 'seconds' in timestamp) {
      date = new Date(timestamp.seconds * 1000);
    } else {
      date = new Date(timestamp);
    }
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Appointment Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl font-bold"
          >
            ×
          </button>
        </div>
        
        <div className="space-y-4">
          <div className="bg-blue-50 p-3 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-2">Schedule Information</h3>
            <p className="text-blue-800">
              <span className="font-medium">Date:</span> {formatDateDisplay(new Date(appointment.date + 'T00:00:00'))}
            </p>
            <p className="text-blue-800">
              <span className="font-medium">Time:</span> {appointment.timeSlot}
            </p>
            <p className="text-blue-800">
              <span className="font-medium">Sales Rep:</span> {appointment.salesRep}
            </p>
          </div>

          <div className="bg-gray-50 p-3 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">Business Information</h3>
            <p className="text-gray-700">
              <span className="font-medium">Business Name:</span> {appointment.businessName}
            </p>
            <p className="text-gray-700">
              <span className="font-medium">Meter #:</span> {appointment.meterNumber}
            </p>
            <p className="text-gray-700">
              <span className="font-medium">Address:</span> {appointment.address}
            </p>
            <p className="text-gray-700">
              <span className="font-medium">Own/Lease:</span> {appointment.ownLease}
            </p>
            <p className="text-gray-700">
              <span className="font-medium">Employees:</span> {appointment.employees}
            </p>
          </div>

          <div className="bg-green-50 p-3 rounded-lg">
            <h3 className="font-medium text-green-900 mb-2">Contact Information</h3>
            <p className="text-green-800">
              <span className="font-medium">Contact Name:</span> {appointment.contactName}
            </p>
            <p className="text-green-800">
              <span className="font-medium">Phone:</span> {appointment.phoneNumber}
            </p>
            {appointment.email && (
              <p className="text-green-800">
                <span className="font-medium">Email:</span> {appointment.email}
              </p>
            )}
          </div>

          <div className="bg-purple-50 p-3 rounded-lg">
            <h3 className="font-medium text-purple-900 mb-2">Appointment Details</h3>
            <p className="text-purple-800">
              <span className="font-medium">Type:</span> {appointment.appointmentType}
            </p>
            <p className="text-purple-800">
              <span className="font-medium">Status:</span> <span className="capitalize">{appointment.status}</span>
            </p>
            {appointment.notes && (
              <div className="mt-2">
                <span className="font-medium text-purple-800">Notes:</span>
                <p className="text-purple-700 mt-1 text-sm bg-white p-2 rounded border">
                  {appointment.notes}
                </p>
              </div>
            )}
          </div>

          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-xs text-gray-600">
              <span className="font-medium">Booked on:</span> {formatBookedAt(appointment.bookedAt)}
            </p>
          </div>
        </div>

        <div className="flex justify-between mt-6 pt-4 border-t border-gray-200">
          <button
            onClick={handleDelete}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Delete Appointment
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
} 