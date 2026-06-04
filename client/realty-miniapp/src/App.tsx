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

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <BrowserRouter>
      <div
        style={{ position: 'fixed', top: '8px', right: '8px', zIndex: 9999 }}
      >
        <button
          onClick={handleRefresh}
          style={{
            background: '#007aff',
            border: 'none',
            borderRadius: '50%',
            width: '36px',
            height: '36px',
            fontSize: '18px',
            cursor: 'pointer',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
          }}
          title="Обновить приложение"
        >
          🔄
        </button>
      </div>
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
