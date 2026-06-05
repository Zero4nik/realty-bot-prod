import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import HomePage from './pages/HomePage/HomePage';
import CatalogPage from './pages/CatalogPage/CatalogPage';
import PropertyPage from './pages/PropertyPage/PropertyPage';
import DashboardPage from './pages/DashboardsPage/DashboardPage';
import ProfilePage from './pages/ProfilePage/ProfilePage';
import AdminPage from './pages/Admin/AdminPage';

export default function App() {
  useEffect(() => {
    const tg = window.Telegram?.WebApp;

    if (tg) {
      tg.BackButton.show();
      tg.BackButton.onClick(() => {
        tg.showConfirm('Вы уверены, что хотите покинуть приложение?', (ok) => {
          if (ok) tg.close();
        });
      });

      tg.onEvent('viewportChanged', () => {
        if (!tg.isExpanded) {
          tg.expand();
          tg.showConfirm(
            'Вы уверены, что хотите покинуть приложение?',
            (ok) => {
              if (ok) tg.close();
            },
          );
        }
      });
    }

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = 'Вы уверены, что хотите покинуть приложение?';
      return 'Вы уверены, что хотите покинуть приложение?';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);


  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/catalog" element={<CatalogPage />} />
        <Route path="/property/:id" element={<PropertyPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </BrowserRouter>
  );
}
