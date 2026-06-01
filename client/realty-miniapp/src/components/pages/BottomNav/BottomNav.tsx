import { useNavigate } from 'react-router-dom';
import './BottomNav.css';

interface BottomNavProps {
  activeTab: 'home' | 'catalog' | 'profile' | 'dashboard';
  isAdmin?: boolean;
}

const NAV_ITEMS = [
  { id: 'home' as const, emoji: '🏠', label: 'Главная', path: '/' },
  { id: 'catalog' as const, emoji: '🔍', label: 'Поиск', path: '/catalog' },
  { id: 'profile' as const, emoji: '👤', label: 'Профиль', path: '/profile' },
];

export default function BottomNav({ activeTab, isAdmin }: BottomNavProps) {
  const navigate = useNavigate();

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
          <span className="bottom-nav__label">Админ</span>
        </button>
      )}
    </nav>
  );
}
