import { useState } from 'react';
import { Appointment, BookingFormData, AppointmentType, ScheduledBy } from '@/lib/types/appointment';
import { formatDateDisplay } from '@/lib/utils/dateUtils';

const APPOINTMENT_TYPES: AppointmentType[] = ['Sales Call', 'Demo', 'Follow-up'];
const SCHEDULED_BY_OPTIONS: ScheduledBy[] = ['Guillermo Mariscal', 'Monica Gutierrez', 'Johnny Infante', 'Edwin Palomera', 'Samuel Carrillo'];

interface AppointmentDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: Appointment;
  onDelete: (appointmentId: string) => void;
  onUpdate: (appointmentId: string, data: BookingFormData) => void;
}

export default function AppointmentDetailsModal({
  isOpen,
  onClose,
  appointment,
  onDelete,
  onUpdate,
}: AppointmentDetailsModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<BookingFormData>({
    businessName: appointment.businessName,
    meterNumber: appointment.meterNumber,
    contactName: appointment.contactName,
    phoneNumber: appointment.phoneNumber,
    email: appointment.email || '',
    address: appointment.address,
    ownLease: appointment.ownLease,
    employees: appointment.employees,
    notes: appointment.notes || '',
    appointmentType: appointment.appointmentType,
    scheduledBy: appointment.scheduledBy,
  });

  if (!isOpen) return null;

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this appointment?')) {
      onDelete(appointment.id);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    onUpdate(appointment.id, editData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    // Reset edit data to original values
    setEditData({
      businessName: appointment.businessName,
      meterNumber: appointment.meterNumber,
      contactName: appointment.contactName,
      phoneNumber: appointment.phoneNumber,
      email: appointment.email || '',
      address: appointment.address,
      ownLease: appointment.ownLease,
      employees: appointment.employees,
      notes: appointment.notes || '',
      appointmentType: appointment.appointmentType,
      scheduledBy: appointment.scheduledBy,
    });
    setIsEditing(false);
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
          {/* Schedule Information - Always read-only */}
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
            <p className="text-blue-800">
              <span className="font-medium">Scheduled By:</span> {isEditing ? (
                <select
                  className="ml-2 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-black text-sm"
                  value={editData.scheduledBy}
                  onChange={(e) => setEditData({ ...editData, scheduledBy: e.target.value as ScheduledBy })}
                >
                  {SCHEDULED_BY_OPTIONS.map((person) => (
                    <option key={person} value={person}>
                      {person}
                    </option>
                  ))}
                </select>
              ) : (
                appointment.scheduledBy
              )}
            </p>
          </div>

          {/* Business Information */}
          <div className="bg-gray-50 p-3 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">Business Information</h3>
            {isEditing ? (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Business Name</label>
                  <input
                    type="text"
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-black text-sm"
                    value={editData.businessName}
                    onChange={(e) => setEditData({ ...editData, businessName: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Meter #</label>
                  <input
                    type="text"
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-black text-sm"
                    value={editData.meterNumber}
                    onChange={(e) => setEditData({ ...editData, meterNumber: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <input
                    type="text"
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-black text-sm"
                    value={editData.address}
                    onChange={(e) => setEditData({ ...editData, address: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Own/Lease</label>
                  <select
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-black text-sm"
                    value={editData.ownLease}
                    onChange={(e) => setEditData({ ...editData, ownLease: e.target.value as 'Own' | 'Lease' })}
                  >
                    <option value="Own">Own</option>
                    <option value="Lease">Lease</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Employees</label>
                  <input
                    type="text"
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-black text-sm"
                    value={editData.employees}
                    onChange={(e) => setEditData({ ...editData, employees: e.target.value })}
                  />
                </div>
              </div>
            ) : (
              <>
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
              </>
            )}
          </div>

          {/* Contact Information */}
          <div className="bg-green-50 p-3 rounded-lg">
            <h3 className="font-medium text-green-900 mb-2">Contact Information</h3>
            {isEditing ? (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-green-900 mb-1">Contact Name</label>
                  <input
                    type="text"
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-black text-sm"
                    value={editData.contactName}
                    onChange={(e) => setEditData({ ...editData, contactName: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-green-900 mb-1">Phone</label>
                  <input
                    type="tel"
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-black text-sm"
                    value={editData.phoneNumber}
                    onChange={(e) => setEditData({ ...editData, phoneNumber: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-green-900 mb-1">Email</label>
                  <input
                    type="email"
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-black text-sm"
                    value={editData.email}
                    onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                  />
                </div>
              </div>
            ) : (
              <>
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
              </>
            )}
          </div>

          {/* Appointment Details */}
          <div className="bg-purple-50 p-3 rounded-lg">
            <h3 className="font-medium text-purple-900 mb-2">Appointment Details</h3>
            {isEditing ? (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-purple-900 mb-1">Appointment Type</label>
                  <select
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-black text-sm"
                    value={editData.appointmentType}
                    onChange={(e) => setEditData({ ...editData, appointmentType: e.target.value as AppointmentType })}
                  >
                    {APPOINTMENT_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-purple-900 mb-1">Notes</label>
                  <textarea
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-black text-sm"
                    rows={3}
                    value={editData.notes}
                    onChange={(e) => setEditData({ ...editData, notes: e.target.value })}
                  />
                </div>
              </div>
            ) : (
              <>
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
              </>
            )}
          </div>

          {!isEditing && (
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-xs text-gray-600">
                <span className="font-medium">Booked on:</span> {formatBookedAt(appointment.bookedAt)}
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-between mt-6 pt-4 border-t border-gray-200">
          {isEditing ? (
            <>
              <button
                onClick={handleCancel}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Save Changes
              </button>
            </>
          ) : (
            <>
              <div className="flex space-x-2">
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Delete Appointment
                </button>
                <button
                  onClick={handleEdit}
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Edit Appointment
                </button>
              </div>
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Close
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
} 