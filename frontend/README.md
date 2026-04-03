# AIDAA Frontend

React + TypeScript + Vite frontend application for the AIDAA (Autism Integrated Diagnosis and Assessment Application) project.

## Features

- **Modern React Stack**: React 18, React Router v6, TypeScript
- **Authentication System**:
  - Email/password login
  - First-time password setup for parent accounts
  - JWT token-based authentication
  - Automatic token refresh on 401 responses
- **Role-Based Access Control**:
  - Admin dashboard
  - Parent dashboard
  - Professional portal
  - Protected routes with role-based access
- **State Management**: React hooks (useState, useEffect, Context-like patterns)
- **HTTP Client**: Axios with interceptors for authentication
- **Styling**: Pure CSS with responsive design
- **Build Tool**: Vite for fast development and production builds

## Project Structure

```
frontend/
├── src/
│   ├── components/          # Reusable React components
│   │   ├── ProtectedRoute.tsx    # Route guard for authentication
│   │   └── RoleRoute.tsx         # Route guard for role-based access
│   ├── pages/              # Page components
│   │   ├── LoginPage.tsx
│   │   ├── SetPasswordPage.tsx
│   │   ├── ParentDashboard.tsx
│   │   ├── AdminPanel.tsx
│   │   └── ProfessionalPage.tsx
│   ├── services/           # API and auth services
│   │   ├── api.ts          # Axios instance with interceptors
│   │   └── auth.service.ts # Authentication functions
│   ├── hooks/              # Custom React hooks
│   │   └── useAuth.ts      # Authentication hook
│   ├── types/              # TypeScript type definitions
│   │   └── index.ts        # All types and interfaces
│   ├── styles/             # CSS files
│   │   ├── index.css
│   │   ├── LoginPage.css
│   │   ├── SetPasswordPage.css
│   │   └── Dashboard.css
│   ├── App.tsx             # Main app with routing
│   └── main.tsx            # Entry point
├── index.html              # HTML entry point
├── vite.config.ts          # Vite configuration
├── tsconfig.json           # TypeScript configuration
├── package.json            # Dependencies
├── .env                    # Environment variables
└── .env.example            # Example environment variables
```

## Setup

### Prerequisites

- Node.js 18+ and npm/yarn
- Backend API running on http://localhost:5000 (or adjust in .env)

### Installation

1. Install dependencies:

```bash
npm install
# or
yarn install
```

2. Create `.env` file (copy from `.env.example`):

```bash
cp .env.example .env
```

3. Update `.env` if backend is running on a different URL:

```env
VITE_API_URL=http://localhost:5000
```

## Development

Start the development server:

```bash
npm run dev
# or
yarn dev
```

The app will open at http://localhost:5173

### Test Credentials

- **Admin**: admin@aidaa.com / admin123
- **Parent (First-time)**: sarah.johnson@example.com / (no password - use set-password flow)
- **Professional (First-time)**: emily.brown@aidaa.com / (no password - use set-password flow)

## Authentication Flow

### First-Time Parent Login

1. Parent enters email with no password set
2. API returns `{ mustSetPassword: true, userId: 15 }`
3. Frontend redirects to `/set-password` page
4. Parent sets password
5. Password is hashed with bcryptjs (saltRounds=12) on backend
6. User is automatically logged in and redirected to role-based page

### Existing User Login

1. User enters email and password
2. API validates credentials and returns JWT token
3. Token is stored in localStorage
4. User is redirected to role-based page

### JWT Token Management

- Token is automatically added to all API requests via interceptor
- If API returns 401 Unauthorized, token is cleared and user is redirected to login
- Token is stored in localStorage under key `aidaa_token`

## Building for Production

Build the project:

```bash
npm run build
# or
yarn build
```

Preview the production build:

```bash
npm run preview
# or
yarn preview
```

## Key Components

### useAuth Hook

```typescript
const { user, token, isAuthenticated, login, setPassword, logout, isLoading } = useAuth();
```

Provides authentication state and functions to any component.

### ProtectedRoute Component

Wraps routes that require authentication. Redirects to login if not authenticated.

```typescript
<Route element={<ProtectedRoute />}>
  <Route path="/dashboard" element={<ParentDashboard />} />
</Route>
```

### RoleRoute Component

Wraps routes that require specific roles. Redirects to dashboard if role not allowed.

```typescript
<Route element={<RoleRoute allowedRoles={['admin']} />}>
  <Route path="/admin" element={<AdminPanel />} />
</Route>
```

## API Integration

### Axios Interceptors

- **Request Interceptor**: Adds JWT token to Authorization header
- **Response Interceptor**: Handles 401 errors by clearing localStorage and redirecting to login

### Auth Service Functions

- `login(email, password)`: Authenticate user
- `setPassword(userId, password)`: Set password for first-time users
- `logout()`: Clear authentication data
- `getCurrentUser()`: Get current user from localStorage
- `getCurrentToken()`: Get JWT token from localStorage

## TypeScript

All code is fully typed with no use of `any` type. Key types include:

- `User`: Authenticated user information
- `LoginResponse`: Response from login endpoint
- `ApiResponse<T>`: Generic API response wrapper
- `UserRole`: 'admin' | 'parent' | 'professional'

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Environment Variables

### Development

```env
VITE_API_URL=http://localhost:5000
```

### Production

```env
VITE_API_URL=https://api.aidaa.com
```

## Troubleshooting

### API Connection Issues

1. Check that backend is running on the URL specified in `.env`
2. Verify CORS is enabled on backend
3. Check browser console for specific error messages

### Login Issues

1. Verify test credentials are correct
2. Check that database is populated with test data
3. Review backend logs for authentication errors

### Build Issues

1. Ensure Node.js version is 18+
2. Delete `node_modules` and `package-lock.json`, then reinstall
3. Clear Vite cache: `rm -rf dist .vite`

## Development Tips

1. **Hot Module Replacement (HMR)**: Changes are reflected instantly in the browser
2. **TypeScript Checking**: Run `tsc --noEmit` to check types without building
3. **React DevTools**: Install React DevTools extension for better debugging
4. **Redux DevTools**: Install Redux DevTools for future state management debugging

## Next Steps

1. Implement child management pages
2. Add content browsing interface
3. Create activity tracking dashboard
4. Build professional consultation module
5. Add parent-professional messaging system

## License

All rights reserved. AIDAA Project.
