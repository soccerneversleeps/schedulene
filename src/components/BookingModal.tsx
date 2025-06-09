import { useState } from 'react';
import { AppointmentType, BookingFormData, ScheduledBy } from '@/lib/types/appointment';
import { formatDateDisplay } from '@/lib/utils/dateUtils';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: BookingFormData) => Promise<void>;
  date: Date;
  timeSlot: string;
  salesRep: string;
}

const APPOINTMENT_TYPES: AppointmentType[] = ['Sales Call', 'Demo', 'Follow-up'];
const SCHEDULED_BY_OPTIONS: ScheduledBy[] = ['Guillermo Mariscal', 'Monica Gutierrez', 'Johnny Infante', 'Edwin Palomera', 'Samuel Carrillo'];

export default function BookingModal({
  isOpen,
  onClose,
  onSubmit,
  date,
  timeSlot,
  salesRep,
}: BookingModalProps) {
  const [formData, setFormData] = useState<BookingFormData>({
    businessName: '',
    meterNumber: '',
    contactName: '',
    phoneNumber: '',
    email: '',
    address: '',
    ownLease: 'Own',
    employees: '',
    notes: '',
    appointmentType: 'Sales Call',
    scheduledBy: 'Guillermo Mariscal',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      // Do not call onClose here; let the parent handle it after Firestore updates
    } catch (error) {
      console.error('Error booking appointment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h2 className="text-xl font-semibold mb-4">Book Appointment</h2>
        <div className="mb-4">
          <p className="text-gray-600">
            {formatDateDisplay(date)} - {timeSlot}
          </p>
          <p className="text-gray-600">Sales Rep: {salesRep}</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 max-h-96 overflow-y-auto">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Business Name *
            </label>
            <input
              type="text"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-black"
              value={formData.businessName}
              onChange={(e) =>
                setFormData({ ...formData, businessName: e.target.value })
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Meter # *
            </label>
            <input
              type="text"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-black"
              value={formData.meterNumber}
              onChange={(e) =>
                setFormData({ ...formData, meterNumber: e.target.value })
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Contact Name *
            </label>
            <input
              type="text"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-black"
              value={formData.contactName}
              onChange={(e) =>
                setFormData({ ...formData, contactName: e.target.value })
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Phone Number *
            </label>
            <input
              type="tel"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-black"
              value={formData.phoneNumber}
              onChange={(e) =>
                setFormData({ ...formData, phoneNumber: e.target.value })
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email (optional)
            </label>
            <input
              type="email"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-black"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Address (Street #, City, Zip) *
            </label>
            <input
              type="text"
              required
              placeholder="123 Main St, City, 12345"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-black"
              value={formData.address}
              onChange={(e) =>
                setFormData({ ...formData, address: e.target.value })
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Own/Lease *
            </label>
            <select
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-black"
              value={formData.ownLease}
              onChange={(e) =>
                setFormData({ ...formData, ownLease: e.target.value as 'Own' | 'Lease' })
              }
            >
              <option value="Own">Own</option>
              <option value="Lease">Lease</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Employees *
            </label>
            <input
              type="text"
              required
              placeholder="e.g., 5-10, 25, 100+"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-black"
              value={formData.employees}
              onChange={(e) =>
                setFormData({ ...formData, employees: e.target.value })
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Appointment Type
            </label>
            <select
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-black"
              value={formData.appointmentType}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  appointmentType: e.target.value as AppointmentType,
                })
              }
            >
              {APPOINTMENT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Scheduled By *
            </label>
            <select
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-black"
              value={formData.scheduledBy}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  scheduledBy: e.target.value as ScheduledBy,
                })
              }
            >
              {SCHEDULED_BY_OPTIONS.map((person) => (
                <option key={person} value={person}>
                  {person}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Notes (optional)
            </label>
            <textarea
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-black"
              rows={3}
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
            />
          </div>
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isSubmitting ? 'Booking...' : 'Book Appointment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 