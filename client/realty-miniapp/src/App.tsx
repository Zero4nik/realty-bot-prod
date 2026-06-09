import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import HomePage from './pages/HomePage/HomePage';
import CatalogPage from './pages/CatalogPage/CatalogPage';
import PropertyPage from './pages/PropertyPage/PropertyPage';
import DashboardPage from './pages/DashboardsPage/DashboardPage';
import ProfilePage from './pages/ProfilePage/ProfilePage';
import AdminPage from './pages/Admin/AdminPage';
import InquiriesPage from './pages/InquiriesPage/InquiriesPage';

function AppLayout({ children }: { children: React.ReactNode }) {
  const tg = window.Telegram?.WebApp;

  const handleClose = () => {
    if (tg) {
      tg.showConfirm('Вы уверены, что хотите покинуть приложение?', (ok) => {
        if (ok) tg.close();
      });
    }
  };

  return (
    <>
      <button className="app-close" onClick={handleClose}>
        ✕
      </button>
      {children}
    </>
  );
}

export default function App() {
  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (tg) {
      tg.ready();
      tg.expand();
      tg.BackButton.hide();
    }
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <AppLayout>
              <HomePage />
            </AppLayout>
          }
        />
        <Route
          path="/catalog"
          element={
            <AppLayout>
              <CatalogPage />
            </AppLayout>
          }
        />
        <Route
          path="/property/:id"
          element={
            <AppLayout>
              <PropertyPage />
            </AppLayout>
          }
        />
        <Route
          path="/profile"
          element={
            <AppLayout>
              <ProfilePage />
            </AppLayout>
          }
        />
        <Route
          path="/dashboard"
          element={
            <AppLayout>
              <DashboardPage />
            </AppLayout>
          }
        />
        <Route
          path="/admin"
          element={
            <AppLayout>
              <AdminPage />
            </AppLayout>
          }
        />
        <Route
          path="/inquiries"
          element={
            <AppLayout>
              <InquiriesPage />
            </AppLayout>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
