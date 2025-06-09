// Authorized users for Family First Energy Scheduling System
// Only these email addresses can access the appointment scheduler

export const AUTHORIZED_EMAILS = [
  // Family First Energy authorized users
  'soccerneversleeps@gmail.com', // Admin user
  'mrjonnyinfante@gmail.com',    // Johnny Infante
  'm.gutierrez@reliableenergy.net', // M. Gutierrez - Reliable Energy
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
    'soccerneversleeps@gmail.com', // Main admin email
  ];
  
  return adminEmails.includes(email.toLowerCase()) ? 'admin' : 'user';
} 