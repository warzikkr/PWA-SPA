import { createBrowserRouter, Navigate } from 'react-router-dom';
import { KioskLayout } from '../shared/ui/KioskLayout';
import { AdminLayout } from '../shared/ui/AdminLayout';
import { TherapistLayout } from '../shared/ui/TherapistLayout';
import { ReceptionLayout } from '../shared/ui/ReceptionLayout';
import { ProtectedRoute } from '../shared/components/ProtectedRoute';

// Auth
import { LoginPage } from '../features/auth/pages/LoginPage';

// Kiosk pages
import { WelcomePage } from '../features/kiosk/pages/WelcomePage';
import { FindBookingPage } from '../features/kiosk/pages/FindBookingPage';
import { ContactsPage } from '../features/kiosk/pages/ContactsPage';
import { IntakeWizardPage } from '../features/kiosk/pages/IntakeWizardPage';
import { ThankYouPage } from '../features/kiosk/pages/ThankYouPage';

// Admin pages
import { DashboardPage } from '../features/admin/pages/DashboardPage';
import { BookingDetailPage } from '../features/admin/pages/BookingDetailPage';
import { ClientsPage } from '../features/admin/pages/ClientsPage';
import { ConfigPage } from '../features/admin/pages/ConfigPage';
import { UserManagementPage } from '../features/admin/pages/UserManagementPage';
import { ClientProfilePage } from '../features/admin/pages/ClientProfilePage';
import { ChangeRequestsPage } from '../features/admin/pages/ChangeRequestsPage';

// Reception pages
import { ReceptionDashboardPage } from '../features/reception/pages/ReceptionDashboardPage';

// Therapist pages
import { MyTodayPage } from '../features/therapist/pages/MyTodayPage';
import { SessionDetailPage } from '../features/therapist/pages/SessionDetailPage';

const basename = import.meta.env.BASE_URL.replace(/\/$/, '') || '/';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/login" replace />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  // Kiosk — no auth required
  {
    path: '/kiosk',
    element: <KioskLayout />,
    children: [
      { index: true, element: <WelcomePage /> },
      { path: 'find', element: <FindBookingPage /> },
      { path: 'contacts', element: <ContactsPage /> },
      { path: 'intake', element: <IntakeWizardPage /> },
      { path: 'thanks', element: <ThankYouPage /> },
    ],
  },
  // Admin — admin only
  {
    path: '/admin',
    element: <ProtectedRoute allowedRoles={['admin']} />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          { index: true, element: <DashboardPage /> },
          { path: 'booking/:id', element: <BookingDetailPage /> },
          { path: 'clients', element: <ClientsPage /> },
          { path: 'clients/:clientId', element: <ClientProfilePage /> },
          { path: 'config', element: <ConfigPage /> },
          { path: 'users', element: <UserManagementPage /> },
          { path: 'change-requests', element: <ChangeRequestsPage /> },
        ],
      },
    ],
  },
  // Reception — admin + reception
  {
    path: '/reception',
    element: <ProtectedRoute allowedRoles={['admin', 'reception']} />,
    children: [
      {
        element: <ReceptionLayout />,
        children: [
          { index: true, element: <ReceptionDashboardPage /> },
          { path: 'booking/:id', element: <BookingDetailPage /> },
          { path: 'clients', element: <ClientsPage /> },
          { path: 'clients/:clientId', element: <ClientProfilePage /> },
        ],
      },
    ],
  },
  // Therapist — therapist only
  {
    path: '/therapist',
    element: <ProtectedRoute allowedRoles={['therapist']} />,
    children: [
      {
        element: <TherapistLayout />,
        children: [
          { index: true, element: <MyTodayPage /> },
          { path: 'session/:id', element: <SessionDetailPage /> },
        ],
      },
    ],
  },
], { basename });
