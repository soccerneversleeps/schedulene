# Appointment Scheduler

A real-time appointment scheduling web application built with Next.js 14, React, TailwindCSS, and Firebase.

## Features

- Weekly calendar view with real-time updates
- Two sales reps with four daily time slots each
- Real-time appointment booking and management
- User authentication
- Responsive design
- Clean and intuitive UI

## Tech Stack

- **Frontend**: Next.js 14 (App Router) + React + TailwindCSS
- **Backend**: Firebase (Firestore + Authentication)
- **Deployment**: Firebase Hosting

## Prerequisites

- Node.js 18+ and npm
- Firebase account
- Firebase project with Firestore and Authentication enabled

## Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd appointment-scheduler
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file in the root directory with your Firebase configuration:
```
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Firebase Setup

1. Create a new Firebase project in the [Firebase Console](https://console.firebase.google.com/)
2. Enable Authentication with Email/Password provider
3. Create a Firestore database
4. Set up Firestore security rules:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /appointments/{appointment} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
  }
}
```

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── components/
│   │   │   ├── Calendar.tsx
│   │   │   ├── AppointmentSlot.tsx
│   │   │   └── BookingModal.tsx
│   │   ├── lib/
│   │   │   ├── contexts/
│   │   │   ├── firebase/
│   │   │   ├── hooks/
│   │   │   └── utils/
│   │   ├── login/
│   │   │   ├── page.tsx
│   │   │   └── layout.tsx
│   │   ├── page.tsx
│   │   └── layout.tsx
│   └──
```

## Usage

1. Sign in with your credentials
2. View the weekly calendar
3. Click on an available time slot to book an appointment
4. Fill in the customer details and submit
5. The appointment will be visible to all users in real-time

## Contributing

1. Fork the repository
2. Create a new branch
3. Make your changes
4. Submit a pull request

## License

MIT