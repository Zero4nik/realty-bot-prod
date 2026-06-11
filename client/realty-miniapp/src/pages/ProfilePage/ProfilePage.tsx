import { useEffect, useState } from 'react';
import BottomNav from '../../components/pages/BottomNav/BottomNav';
import './ProfilePage.css';
import { useParams } from 'react-router-dom';
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
  const [phone, setPhone] = useState('');
  const [about, setAbout] = useState('');
  const [editMode, setEditMode] = useState(false);
  const { userId: urlUserId } = useParams<{ userId?: string }>();
  const currentTelegramId =
    window.Telegram?.WebApp?.initDataUnsafe?.user?.id?.toString();

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError(null);

      try {
        const tg = window.Telegram?.WebApp;
        if (tg) {
          tg.ready();
          tg.expand();
        }

        const tgUser = tg?.initDataUnsafe?.user;
        let response: Response;

        if (urlUserId) {
          response = await fetch(
            `https://realty-bot-prod-1.onrender.com/api/users/by-id/${urlUserId}`,
          );
        } else {
          const telegramId = tgUser?.id;
          if (!telegramId) {
            setError(
              'Не удалось получить данные пользователя из Telegram. Убедитесь, что вы открыли приложение через Telegram.',
            );
            setUser(null);
            return;
          }

          response = await fetch(
            `https://realty-bot-prod-1.onrender.com/api/users/${telegramId}`,
          );

          if (!response.ok) {
            const createRes = await fetch(
              'https://realty-bot-prod-1.onrender.com/api/users',
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

            if (!createRes.ok) {
              setError(`Ошибка создания пользователя: ${createRes.status}`);
              setUser(null);
              return;
            }

            const newUser = await createRes.json();
            setUser(newUser);
            setPhone(newUser.phone || '');
            setAbout(newUser.about || '');
            setReferralLink(
              `https://t.me/arendapl_bot?start=ref_${newUser.referralCode}`,
            );
            return;
          }
        }

        if (!response.ok) {
          setError('Пользователь не найден');
          setUser(null);
          return;
        }

        const userData = await response.json();
        setUser(userData);
        setPhone(userData.phone || '');
        setAbout(userData.about || '');
        setReferralLink(
          `https://t.me/arendapl_bot?start=ref_${userData.referralCode}`,
        );
      } catch (error) {
        setError(
          `Ошибка сети: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`,
        );
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [urlUserId]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const saveProfile = async () => {
    await fetch(
      `https://realty-bot-prod-1.onrender.com/api/users/${user?.telegramId}/profile`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, about }),
      },
    );
    setEditMode(false);
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

  const isOwnProfile = user.telegramId === currentTelegramId;

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
        </div>
        <button className="profile-share-btn" onClick={handleCopyLink}>
          {copied ? '✅ Скопировано' : '📋 Копировать ссылку'}
        </button>
      </div>
      {isOwnProfile && (
        <div className="profile-section">
          <h3>О себе</h3>
          {editMode ? (
            <>
              <input
                placeholder="Телефон"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
              <textarea
                placeholder="Пожелания по поиску"
                value={about}
                onChange={(e) => setAbout(e.target.value)}
                rows={3}
              />
              <button onClick={saveProfile}>Сохранить</button>
            </>
          ) : (
            <div onClick={() => setEditMode(true)}>
              <p>📱 {phone || 'Не указан'}</p>
              <p>📝 {about || 'Не указаны'}</p>
              <button>Редактировать</button>
            </div>
          )}
        </div>
      )}
      <BottomNav activeTab="profile" />
    </div>
  );
}
