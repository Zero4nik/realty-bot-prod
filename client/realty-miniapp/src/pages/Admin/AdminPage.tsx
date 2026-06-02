import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../../components/pages/BottomNav/BottomNav';
import './AdminPage.css';

interface Property {
  id: number;
  title: string;
  city: string;
  price: number;
  isActive: boolean;
}

export default function AdminPage() {
  const navigate = useNavigate();
  const [properties, setProperties] = useState<Property[]>([]);
  const [form, setForm] = useState({
    title: '',
    city: '',
    district: '',
    type: 'APARTMENT',
    rooms: 1,
    price: 0,
    area: 0,
    floor: 1,
    totalFloors: 1,
    address: '',
    description: '',
  });
  const [showForm, setShowForm] = useState(false);

  const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user;
  const telegramId = tgUser?.id?.toString();

  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = async () => {
    try {
      const res = await fetch(
        'https://realty-bot-prod.onrender.com/api/properties',
      );
      const data = await res.json();
      setProperties(data);
    } catch (err) {
      console.error('Ошибка загрузки:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(
        'https://realty-bot-prod.onrender.com/api/properties',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': telegramId || '',
          },
          body: JSON.stringify({ ...form, photos: '[]' }),
        },
      );

      if (res.ok) {
        alert('✅ Квартира добавлена!');
        setForm({
          title: '',
          city: 'Warszawa',
          district: '',
          type: 'APARTMENT',
          rooms: 1,
          price: 0,
          area: 0,
          floor: 1,
          totalFloors: 1,
          address: '',
          description: '',
        });
        setShowForm(false);
        loadProperties();
      } else {
        alert('❌ Ошибка при добавлении');
      }
    } catch (err) {
      alert('❌ Ошибка сети');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Удалить квартиру?')) return;
    try {
      await fetch(`https://realty-bot-prod.onrender.com/api/properties/${id}`, {
        method: 'DELETE',
        headers: { 'x-user-id': telegramId || '' },
      });
      loadProperties();
    } catch (err) {
      alert('❌ Ошибка при удалении');
    }
  };

  const handleToggleActive = async (id: number, isActive: boolean) => {
    try {
      await fetch(`https://realty-bot-prod.onrender.com/api/properties/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': telegramId || '',
        },
        body: JSON.stringify({ isActive: !isActive }),
      });
      loadProperties();
    } catch (err) {
      alert('❌ Ошибка');
    }
  };

  return (
    <div className="admin-page">
      <button className="property-back" onClick={() => navigate(-1)}>
        ← Назад к поиску
      </button>
      <h2>📊 Админ-панель</h2>

      <button className="admin-btn-add" onClick={() => navigate('/dashboard')}>
        📈 Статистика (Dashboard)
      </button>

      <button className="admin-btn-add" onClick={() => setShowForm(!showForm)}>
        {showForm ? '❌ Отмена' : '🏠 Добавить квартиру'}
      </button>

      {showForm && (
        <form onSubmit={handleSubmit} className="admin-form">
          <input
            placeholder="Название *"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
          />
          <input
            list="cities"
            placeholder="Город *"
            value={form.city}
            onChange={(e) => setForm({ ...form, city: e.target.value })}
            required
          />
          <datalist id="cities">
            <option value="Warszawa" />
            <option value="Kraków" />
            <option value="Wrocław" />
            <option value="Gdańsk" />
            <option value="Poznań" />
          </datalist>
          <input
            placeholder="Район"
            value={form.district}
            onChange={(e) => setForm({ ...form, district: e.target.value })}
          />
          <select
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
          >
            <option value="APARTMENT">Квартира</option>
            <option value="HOUSE">Дом</option>
            <option value="ROOM">Комната</option>
          </select>
          <input
            type="number"
            placeholder="Цена (zł/мес) *"
            value={form.price || ''}
            onChange={(e) => setForm({ ...form, price: +e.target.value })}
            required
          />
          <input
            type="number"
            placeholder="Площадь (м²) *"
            value={form.area || ''}
            onChange={(e) => setForm({ ...form, area: +e.target.value })}
            required
          />
          <input
            placeholder="Адрес *"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            required
          />
          <textarea
            placeholder="Описание"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={3}
          />
          <button type="submit">✅ Добавить</button>
        </form>
      )}

      <h3>📋 Все квартиры ({properties.length})</h3>
      <div className="admin-property-list">
        {properties.map((p) => (
          <div
            key={p.id}
            className={`admin-property-item ${!p.isActive ? 'inactive' : ''}`}
          >
            <div className="admin-property-info">
              <strong>{p.title}</strong>
              <span>
                {p.city} — {p.price} zł/мес
              </span>
            </div>
            <div className="admin-property-actions">
              <button
                onClick={() => handleToggleActive(p.id, p.isActive)}
                className={p.isActive ? 'btn-active' : 'btn-inactive'}
              >
                {p.isActive ? '👁️' : '👁️‍🗨️'}
              </button>
              <button onClick={() => handleDelete(p.id)} className="btn-delete">
                🗑️
              </button>
            </div>
          </div>
        ))}
      </div>

      <BottomNav activeTab="home" />
    </div>
  );
}
