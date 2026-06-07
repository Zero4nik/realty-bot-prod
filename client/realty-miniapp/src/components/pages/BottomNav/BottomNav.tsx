import { useNavigate } from 'react-router-dom';
import './BottomNav.css';
import { useState, useEffect } from 'react';

interface BottomNavProps {
  activeTab: 'home' | 'catalog' | 'profile' | 'dashboard' | 'inquiries';
  isAdmin?: boolean;
}

const NAV_ITEMS = [
  { id: 'home' as const, emoji: '🏠', label: 'Главная', path: '/' },
  { id: 'catalog' as const, emoji: '🔍', label: 'Поиск', path: '/catalog' },
  {
    id: 'inquiries' as const,
    emoji: '💬',
    label: 'Заявки',
    path: '/inquiries',
  },
  { id: 'profile' as const, emoji: '👤', label: 'Профиль', path: '/profile' },
];
export default function BottomNav({
  activeTab,
  isAdmin: isAdminProp,
}: BottomNavProps) {
  const navigate = useNavigate();
  const [isAdminLocal, setIsAdminLocal] = useState(false);

  const isAdmin = isAdminProp ?? isAdminLocal;

  useEffect(() => {
    if (isAdminProp !== undefined) return;

    const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user;
    const telegramId = tgUser?.id;

    if (!telegramId) {
      console.warn('[BottomNav] Telegram user ID не найден');
      return;
    }

    fetch(`https://realty-bot-prod.onrender.com/api/users/${telegramId}`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((user) => {
        console.log('[BottomNav] User data:', user);
        if (user.role === 'admin') setIsAdminLocal(true);
      })
      .catch((err) => {
        console.error('[BottomNav] Ошибка получения роли:', err);
      });
  }, [isAdminProp]);

  return (
    <nav className="bottom-nav">
      {NAV_ITEMS.map((item) => (
        <button
          key={item.id}
          className={`bottom-nav__item ${
            activeTab === item.id ? 'bottom-nav__item--active' : ''
          }`}
          onClick={() => navigate(item.path)}
        >
          <span className="bottom-nav__icon">{item.emoji}</span>
          <span className="bottom-nav__label">{item.label}</span>
        </button>
      ))}

      {isAdmin && (
        <button
          className={`bottom-nav__item ${
            activeTab === 'dashboard' ? 'bottom-nav__item--active' : ''
          }`}
          onClick={() => navigate('/dashboard')}
        >
          <span className="bottom-nav__icon">📊</span>
          <span className="bottom-nav__label">Дашборд</span>
        </button>
      )}
      {isAdmin && (
        <button
          className={`bottom-nav__item ${
            activeTab === 'dashboard' ? 'bottom-nav__item--active' : ''
          }`}
          onClick={() => navigate('/admin')}
        >
          <span className="bottom-nav__icon">⚙️</span>
          <span className="bottom-nav__label">Админка</span>
        </button>
      )}
    </nav>
  );
}
