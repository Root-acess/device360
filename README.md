# Device360 — TypeScript + one800.help inspired design

## Project Structure
```
device360-ts/
├── frontend/          ← React + TypeScript + Vite
│   ├── src/
│   │   ├── types/         ← All TypeScript interfaces
│   │   ├── data/          ← mockData.ts (brands, issues, pricing)
│   │   ├── firebaseClient.ts
│   │   ├── components/
│   │   │   ├── Layout.tsx
│   │   │   ├── HomePage.tsx
│   │   │   ├── RepairFlow.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── AdminDashboard.tsx
│   │   │   └── steps/
│   │   │       ├── BrandSelection.tsx
│   │   │       ├── ModelSelection.tsx
│   │   │       ├── IssueSelection.tsx
│   │   │       ├── PricingDisplay.tsx
│   │   │       ├── LeadCapture.tsx
│   │   │       ├── Confirmation.tsx
│   │   │       └── contact/
│   │   │           └── ContactSteps.tsx  ← Phone, OTP, Name, Address, TimeSlot
│   ├── .env               ← Firebase + backend config
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
└── backend/           ← Node.js + Express + Firebase Admin
    ├── server.js
    ├── firebase.js
    ├── routes/
    │   ├── auth.js    ← OTP send/verify
    │   └── leads.js   ← Bookings CRUD
    ├── .env
    └── package.json
```

## Setup

### Backend
```bash
cd backend
npm install
node server.js      # runs on :5000
```

### Frontend
```bash
cd frontend
npm install
npm run dev         # runs on :3000
```

## Routes
- `/`                   → Homepage
- `/repair`             → Booking flow (6 steps)
- `/dashboard/:id`      → Customer repair tracker
- `/admin`              → Admin dashboard

## Environment Variables

### frontend/.env
```
VITE_BACKEND_URL=http://localhost:5000
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

### backend/.env
```
PORT=5000
FRONTEND_URL=http://localhost:3000
FIREBASE_PROJECT_ID=...
FIREBASE_PRIVATE_KEY_ID=...
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=...
FIREBASE_CLIENT_ID=...
```
