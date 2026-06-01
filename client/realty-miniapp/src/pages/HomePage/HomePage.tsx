import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import BottomNav from '../../components/pages/BottomNav/BottomNav';
import './HomePage.css';
interface UserProfile {
  id: number;
  telegramId: string;
  username: string;
  firstName: string;
  lastName: string;
  role: string;
  referralCode: string;
}
export default function HomePage() {
  const navigate = useNavigate();

  const tg = window.Telegram?.WebApp;
  const telegramId = tg?.initDataUnsafe?.user?.id?.toString();

  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    if (telegramId) {
      fetch(`/api/users/${telegramId}`)
        .then((res) => res.json())
        .then((data) => setUser(data))
        .catch(() => setUser(null));
    }
  }, [telegramId]);
  const isAdmin = user?.role === 'admin';
  const categories = [
    {
      id: 'rent',
      emoji: '🏠',
      title: 'Аренда',
      desc: 'Квартиры и дома на длительный срок',
      path: '/catalog?type=rent',
      available: true,
    },
    {
      id: 'buy',
      emoji: '💰',
      title: 'Покупка недвижимости',
      desc: 'Квартиры, дома, участки под инвестиции',
      path: '/catalog?type=buy',
      available: false,
    },
    {
      id: 'commercial',
      emoji: '🏢',
      title: 'Коммерческая аренда',
      desc: 'Офисы, склады, торговые площади',
      path: '/catalog?type=commercial',
      available: false,
    },
    {
      id: 'investment',
      emoji: '📈',
      title: 'Инвестиции',
      desc: 'Объекты с высокой доходностью под сдачу или перепродажу',
      path: '/catalog?type=investment',
      available: false,
    },
    {
      id: 'okazjonalny',
      emoji: '📋',
      title: 'Akt Okazjonalny',
      desc: 'Аренда с нотариальным договором по польскому законодательству',
      path: '/catalog?type=okazjonalny',
      available: false,
    },
    {
      id: 'relocation',
      emoji: '🚚',
      title: 'Переезд под ключ',
      desc: 'Подбор жилья, ВНЖ, прописка, школа для детей',
      path: '/catalog?type=relocation',
      available: false,
    },
  ];

  return (
    <div className="page">
      <div className="home-header">
        <h1 className="home-logo">🏠 АрендаPL</h1>
        <p className="home-subtitle">Недвижимость в Польше</p>
      </div>

      <div className="home-categories">
        {categories.map((cat) => (
          <button
            key={cat.id}
            className={`home-category-btn ${
              !cat.available ? 'home-category-btn--locked' : ''
            }`}
            onClick={() => cat.available && navigate(cat.path)}
            disabled={!cat.available}
          >
            <span className="home-category-emoji">{cat.emoji}</span>
            <span className="home-category-title">
              {cat.title}
              {!cat.available && ' 🔒'}
            </span>
            <span className="home-category-desc">
              {cat.available ? cat.desc : 'Скоро'}
            </span>
          </button>
        ))}
      </div>

      <BottomNav activeTab="home" isAdmin={isAdmin} />
    </div>
  );
}
