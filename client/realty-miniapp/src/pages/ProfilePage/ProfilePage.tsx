import { useEffect, useState } from 'react';
import BottomNav from '../../components/pages/BottomNav/BottomNav';
import './ProfilePage.css';

interface UserProfile {
  id: number;
  telegramId: string;
  username: string | null;
  firstName: string;
  lastName?: string;
  referralCode: string;
  referralCount: number;
  referralEarnings: number;
  inquiriesCount: number;
  dealsCount: number;
}

export default function ProfilePage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [referralLink, setReferralLink] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // Получаем Telegram user из WebApp
        const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user;
        const telegramId = tgUser?.id || 'Ошибка данных';

        // Запрос к бэкенду за полным профилем
        const response = await fetch(
          `https://realty-bot-prod.onrender.com/api/users/${telegramId}`,
        );
        if (!response.ok) {
          const createRes = await fetch(
            'https://realty-bot-prod.onrender.com/api/users',
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                telegramId: String(telegramId),
                firstName: tgUser?.first_name || 'Тестовый',
                lastName: tgUser?.last_name || '',
                username: tgUser?.username || null,
              }),
            },
          );
          const newUser = await createRes.json();
          setUser(newUser);
          setReferralLink(
            `https://t.me/arendapl_bot?start=ref_${newUser.referralCode}`,
          );
        } else {
          const userData = await response.json();
          setUser(userData);
          setReferralLink(
            `https://t.me/arendapl_bot?start=ref_${userData.referralCode}`,
          );
        }
      } catch (error) {
        console.error('Ошибка загрузки профиля:', error);
        // Fallback для браузера
        setUser({
          id: 1,
          telegramId: '12345678',
          username: null,
          firstName: 'Тестовый',
          referralCode: 'test-ref-code',
          referralCount: 0,
          referralEarnings: 0,
          inquiriesCount: 0,
          dealsCount: 0,
        });
        setReferralLink('https://t.me/arenda_pl_bot?start=ref_test-ref-code');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleShare = () => {
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.openTelegramLink(
        `https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent('🏠 Найди квартиру в Польше через АрендаPL!')}`,
      );
    } else {
      navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="page profile-page">
        <h2 className="page-title">👤 Профиль</h2>
        <div className="profile-loading">
          <div className="profile-skeleton-avatar" />
          <div className="profile-skeleton-line" />
          <div className="profile-skeleton-line short" />
        </div>
        <BottomNav activeTab="profile" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="page profile-page">
        <h2 className="page-title">👤 Профиль</h2>
        <p>Не удалось загрузить профиль</p>
        <BottomNav activeTab="profile" />
      </div>
    );
  }

  return (
    <div className="page profile-page">
      <h2 className="page-title">👤 Профиль</h2>

      <div className="profile-card">
        <div className="profile-avatar">
          {user.firstName.charAt(0).toUpperCase()}
        </div>
        <div className="profile-info">
          <h3 className="profile-name">
            {user.firstName} {user.lastName || ''}
          </h3>
          {user.username && (
            <p className="profile-username">@{user.username}</p>
          )}
          <p className="profile-id">Telegram ID: {user.telegramId}</p>
        </div>
      </div>

      {/* Рефералка */}
      <div className="profile-section">
        <h3 className="profile-section-title">🔗 Реферальная программа</h3>
        <p className="profile-section-desc">
          Приглашайте друзей в АрендаPL и получайте бонусы за каждую сделку!
        </p>
        <div className="profile-ref-box">
          <input
            className="profile-ref-input"
            type="text"
            value={referralLink}
            readOnly
            onClick={(e) => (e.target as HTMLInputElement).select()}
          />
          <button className="profile-ref-copy" onClick={handleCopyLink}>
            {copied ? '✅' : '📋'}
          </button>
        </div>
        <button className="profile-share-btn" onClick={handleShare}>
          📤 Поделиться ссылкой
        </button>
      </div>

      {/* Статистика  */}
      <div className="profile-section">
        <h3 className="profile-section-title">📊 Статистика</h3>
        <div className="profile-stats">
          <div className="profile-stat">
            <span className="profile-stat-value">{user.inquiriesCount}</span>
            <span className="profile-stat-label">Заявок</span>
          </div>
          <div className="profile-stat">
            <span className="profile-stat-value">{user.referralCount}</span>
            <span className="profile-stat-label">Рефералов</span>
          </div>
          <div className="profile-stat">
            <span className="profile-stat-value">{user.dealsCount}</span>
            <span className="profile-stat-label">Сделок</span>
          </div>
        </div>
      </div>

      <BottomNav activeTab="profile" />
    </div>
  );
}
