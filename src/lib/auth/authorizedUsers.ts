// Authorized users for Family First Energy Scheduling System
// Only these email addresses can access the appointment scheduler

export const AUTHORIZED_EMAILS = [
  // Add authorized email addresses here
  'your-email@gmail.com', // Replace with your actual email
  'soccerneversleeps@gmail.com', // Example - replace with real emails
  'newuser@company.com', // ← Add new email here
  'another@gmail.com', // ← Add another one
  // Add more authorized emails as needed
];

// Function to check if a user is authorized
export function isUserAuthorized(email: string): boolean {
  return AUTHORIZED_EMAILS.includes(email.toLowerCase());
}

// Function to get user role (for future expansion)
export function getUserRole(email: string): 'admin' | 'user' | 'unauthorized' {
  if (!isUserAuthorized(email)) {
    return 'unauthorized';
  }
  
  // Define admin emails (can manage the system)
  const adminEmails = [
    'your-email@gmail.com', // Replace with your actual admin email
  ];
  
  return adminEmails.includes(email.toLowerCase()) ? 'admin' : 'user';
} 