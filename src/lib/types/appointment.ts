export type SalesRep = 'Rep A' | 'Rep B';

export type TimeSlot = '8-10 AM' | '10-12 PM' | '1-3 PM' | '3-5 PM';

export type AppointmentType = 'Sales Call' | 'Demo' | 'Follow-up';

export type AppointmentStatus = 'scheduled' | 'completed' | 'cancelled';

export interface Appointment {
  id: string;
  salesRep: SalesRep;
  date: string; // YYYY-MM-DD format
  timeSlot: TimeSlot;
  businessName: string;
  meterNumber: string;
  contactName: string;
  phoneNumber: string;
  email?: string;
  address: string;
  ownLease: 'Own' | 'Lease';
  employees: string;
  notes?: string;
  appointmentType: AppointmentType;
  bookedBy: string;
  bookedAt: Date;
  status: AppointmentStatus;
}

export interface BookingFormData {
  businessName: string;
  meterNumber: string;
  contactName: string;
  phoneNumber: string;
  email?: string;
  address: string;
  ownLease: 'Own' | 'Lease';
  employees: string;
  notes?: string;
  appointmentType: AppointmentType;
} 