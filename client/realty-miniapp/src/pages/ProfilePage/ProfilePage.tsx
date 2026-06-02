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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const tg = window.Telegram?.WebApp;

        // ВАЖНО: Инициализируем WebApp
        if (tg) {
          tg.ready();
          tg.expand();
        }

        const tgUser = tg?.initDataUnsafe?.user;
        console.log('🔍 Telegram WebApp:', tg);
        console.log('🔍 initDataUnsafe:', tg?.initDataUnsafe);
        console.log('🔍 User:', tgUser);

        const telegramId = tgUser?.id;

        if (!telegramId) {
          console.error('❌ Не удалось получить Telegram ID');
          console.error(
            '📋 initDataUnsafe:',
            JSON.stringify(tg?.initDataUnsafe),
          );
          setError(
            'Не удалось получить данные пользователя из Telegram. Убедитесь, что вы открыли приложение через Telegram.',
          );
          setUser(null);
          setLoading(false);
          return;
        }

        console.log('✅ Telegram ID получен:', telegramId);

        // Пробуем получить существующего пользователя
        const response = await fetch(
          `https://realty-bot-prod.onrender.com/api/users/${telegramId}`,
        );

        console.log('📡 Response status:', response.status);

        if (!response.ok) {
          console.log('⚠️ Пользователь не найден, создаем нового...');

          // Создаем нового пользователя
          const createRes = await fetch(
            'https://realty-bot-prod.onrender.com/api/users',
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                telegramId: String(telegramId),
                firstName: tgUser?.first_name || 'Пользователь',
                lastName: tgUser?.last_name || '',
                username: tgUser?.username || null,
              }),
            },
          );

          console.log('📡 Create response status:', createRes.status);

          if (!createRes.ok) {
            const errorText = await createRes.text();
            console.error('❌ Ошибка создания пользователя:', errorText);
            setError(`Ошибка создания пользователя: ${createRes.status}`);
            setUser(null);
            setLoading(false);
            return;
          }

          const newUser = await createRes.json();
          console.log('✅ Пользователь создан:', newUser);
          setUser(newUser);
          setReferralLink(
            `https://t.me/arendapl_bot?start=ref_${newUser.referralCode}`,
          );
        } else {
          const userData = await response.json();
          console.log('✅ Пользователь загружен:', userData);
          setUser(userData);
          setReferralLink(
            `https://t.me/arendapl_bot?start=ref_${userData.referralCode}`,
          );
        }
      } catch (error) {
        console.error('❌ Ошибка загрузки профиля:', error);
        setError(
          `Ошибка сети: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`,
        );
        setUser(null);
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

  if (error) {
    return (
      <div className="page profile-page">
        <h2 className="page-title">👤 Профиль</h2>
        <div className="profile-error">
          <p>❌ {error}</p>
          <p style={{ fontSize: '12px', color: '#666', marginTop: '10px' }}>
            Откройте консоль браузера (F12) для получения детальной информации
          </p>
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

      {/* Статистика */}
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
