import { useState, useEffect } from 'react';
import './DashboardPage.css';

import ProtertyBack from '../../shared/components/ProtertyBack';
interface DashboardStats {
  totalUsers: number;
  totalProperties: number;
  totalDeals: number;
  newInquiries: number;
  inProgressInquiries: number;
  closedInquiries: number;
  totalCommission: number;
  totalYourPercent: number;
  recentInquiries: Array<{
    id: number;
    status: string;
    user: { firstName: string; username: string };
    property: { title: string; city: string; price: number };
    createdAt: string;
  }>;
  topReferrers: Array<{
    id: number;
    username: string;
    firstName: string;
    referralCount: number;
  }>;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const userId =
    window.Telegram?.WebApp?.initDataUnsafe?.user?.id || '6537896588';

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);

        const response = await fetch(
          'https://realty-bot-prod.onrender.com/api/dashboard',
          {
            headers: {
              'x-user-id': String(userId || ''),
            },
          },
        );

        if (!response.ok) {
          if (response.status === 403) {
            throw new Error('Доступ запрещён. Вы не администратор.');
          }
          throw new Error(`Ошибка сервера: ${response.status}`);
        }

        const data = await response.json();
        setStats(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [userId]);

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-loading">Загрузка панели управления...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-error">
          <h2>🔒 Доступ запрещён</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-error">Нет данных</div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <ProtertyBack />
      <h1 className="dashboard-title">DashBoard</h1>

      <div className="dashboard-cards">
        <div className="dashboard-card">
          <span className="dashboard-card__icon">👥</span>
          <span className="dashboard-card__value">{stats.totalUsers}</span>
          <span className="dashboard-card__label">Пользователей</span>
        </div>
        <div className="dashboard-card">
          <span className="dashboard-card__icon">🏠</span>
          <span className="dashboard-card__value">{stats.totalProperties}</span>
          <span className="dashboard-card__label">Объектов</span>
        </div>
        <div className="dashboard-card">
          <span className="dashboard-card__icon">📋</span>
          <span className="dashboard-card__value">{stats.newInquiries}</span>
          <span className="dashboard-card__label">Новых заявок</span>
        </div>
        <div className="dashboard-card">
          <span className="dashboard-card__icon">💰</span>
          <span className="dashboard-card__value">
            {stats.totalCommission} zł
          </span>
          <span className="dashboard-card__label">Комиссия</span>
        </div>
      </div>

      <div className="dashboard-section">
        <h2 className="dashboard-section__title">📋 Статусы заявок</h2>
        <div className="dashboard-statuses">
          <div className="dashboard-status dashboard-status--new">
            <span>🆕 Новые</span>
            <strong>{stats.newInquiries}</strong>
          </div>
          <div className="dashboard-status dashboard-status--progress">
            <span>🔄 В работе</span>
            <strong>{stats.inProgressInquiries}</strong>
          </div>
          <div className="dashboard-status dashboard-status--closed">
            <span>✅ Закрыто</span>
            <strong>{stats.closedInquiries}</strong>
          </div>
        </div>
      </div>

      <div className="dashboard-section">
        <h2 className="dashboard-section__title">🏆 Топ рефереров</h2>
        {stats.topReferrers.length > 0 ? (
          <div className="dashboard-referrers">
            {stats.topReferrers.map((ref, index) => (
              <div key={ref.id} className="dashboard-referrer">
                <span className="dashboard-referrer__rank">#{index + 1}</span>
                <span className="dashboard-referrer__name">
                  {ref.firstName || ref.username || 'Пользователь'}
                </span>
                <span className="dashboard-referrer__count">
                  {ref.referralCount} рефералов
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="dashboard-empty">Пока нет рефералов</p>
        )}
      </div>

      <div className="dashboard-section">
        <h2 className="dashboard-section__title">📝 Последние заявки</h2>
        {stats.recentInquiries.length > 0 ? (
          <div className="dashboard-inquiries">
            {stats.recentInquiries.map((inq) => (
              <div key={inq.id} className="dashboard-inquiry">
                <div className="dashboard-inquiry__header">
                  <span
                    className={`dashboard-inquiry__status dashboard-inquiry__status--${inq.status}`}
                  >
                    {inq.status === 'new'
                      ? '🆕 Новая'
                      : inq.status === 'in_progress'
                        ? '🔄 В работе'
                        : '✅ Закрыта'}
                  </span>
                  <span className="dashboard-inquiry__date">
                    {new Date(inq.createdAt).toLocaleString('ru-RU')}
                  </span>
                </div>
                <div className="dashboard-inquiry__body">
                  <p>👤 {inq.user.firstName || inq.user.username}</p>
                  <p>
                    🏠 {inq.property.title} ({inq.property.city})
                  </p>
                  <p>💰 {inq.property.price} zł/мес</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="dashboard-empty">Пока нет заявок</p>
        )}
      </div>
    </div>
  );
}
