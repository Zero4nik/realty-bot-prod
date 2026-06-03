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

interface Amenities {
  balcony: boolean;
  terrace: boolean;
  parking: boolean;
  pets: boolean;
  conditioner: boolean;
  separateKitchen: boolean;
}

export default function AdminPage() {
  const navigate = useNavigate();
  const [properties, setProperties] = useState<Property[]>([]);
  const [showAmenitiesDrawer, setShowAmenitiesDrawer] = useState(false);
  const [amenities, setAmenities] = useState<Amenities>({
    balcony: false,
    terrace: false,
    parking: false,
    pets: false,
    conditioner: false,
    separateKitchen: false,
  });
  const [form, setForm] = useState({
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
          body: JSON.stringify({
            ...form,
            photos: '[]',
            ...amenities,
          }),
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
        setAmenities({
          balcony: false,
          terrace: false,
          parking: false,
          pets: false,
          conditioner: false,
          separateKitchen: false,
        });
        setShowForm(false);
        setShowAmenitiesDrawer(false);
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

  const toggleAmenity = (key: keyof Amenities) => {
    setAmenities((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const getAmenityLabel = (key: keyof Amenities): string => {
    const labels: Record<keyof Amenities, string> = {
      balcony: 'Балкон',
      terrace: 'Терраса',
      parking: 'Парковка',
      pets: 'Можно с животными',
      conditioner: 'Кондиционер',
      separateKitchen: 'Отдельная кухня',
    };
    return labels[key];
  };

  const selectedAmenitiesCount =
    Object.values(amenities).filter(Boolean).length;

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
        <>
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
            </datalist>
            <input
              list="districts"
              placeholder="Район"
              value={form.district}
              onChange={(e) => setForm({ ...form, district: e.target.value })}
            />
            <datalist id="districts">
              <option value="Śródmieście" />
              <option value="Mokotów" />
              <option value="Wola" />
              <option value="Ochota" />
              <option value="Żoliborz" />
              <option value="Bielany" />
              <option value="Bemowo" />
              <option value="Ursynów" />
              <option value="Wilanów" />
              <option value="Włochy" />
              <option value="Ursus" />
              <option value="Praga-Północ" />
              <option value="Praga-Południe" />
              <option value="Targówek" />
              <option value="Białołęka" />
              <option value="Rembertów" />
              <option value="Wawer" />
              <option value="Wesoła" />
            </datalist>
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
              placeholder="Количество комнат"
              value={form.rooms || ''}
              onChange={(e) => setForm({ ...form, rooms: +e.target.value })}
            />
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
              type="number"
              placeholder="Этаж"
              value={form.floor || ''}
              onChange={(e) => setForm({ ...form, floor: +e.target.value })}
            />
            <input
              type="number"
              placeholder="Всего этажей"
              value={form.totalFloors || ''}
              onChange={(e) =>
                setForm({ ...form, totalFloors: +e.target.value })
              }
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
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              rows={3}
            />

            {/* Кнопка выбора удобств */}
            <button
              type="button"
              className="amenities-drawer-btn"
              onClick={() => setShowAmenitiesDrawer(true)}
            >
              🛋️ Удобства{' '}
              {selectedAmenitiesCount > 0 && `(${selectedAmenitiesCount})`}
            </button>

            <button type="submit">✅ Добавить</button>
          </form>

          {/* Выезжающая панель с удобствами */}
          <div
            className={`amenities-drawer-overlay ${showAmenitiesDrawer ? 'open' : ''}`}
            onClick={() => setShowAmenitiesDrawer(false)}
          >
            <div
              className={`amenities-drawer ${showAmenitiesDrawer ? 'open' : ''}`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="amenities-drawer-header">
                <h3>Выберите удобства</h3>
                <button
                  className="amenities-drawer-close"
                  onClick={() => setShowAmenitiesDrawer(false)}
                >
                  ✕
                </button>
              </div>
              <div className="amenities-drawer-list">
                {(Object.keys(amenities) as Array<keyof Amenities>).map(
                  (key) => (
                    <label key={key} className="amenity-item">
                      <input
                        type="checkbox"
                        checked={amenities[key]}
                        onChange={() => toggleAmenity(key)}
                      />
                      <span>{getAmenityLabel(key)}</span>
                    </label>
                  ),
                )}
              </div>
              <div className="amenities-drawer-footer">
                <button
                  className="amenities-reset-btn"
                  onClick={() =>
                    setAmenities({
                      balcony: false,
                      terrace: false,
                      parking: false,
                      pets: false,
                      conditioner: false,
                      separateKitchen: false,
                    })
                  }
                >
                  Сбросить все
                </button>
                <button
                  className="amenities-save-btn"
                  onClick={() => setShowAmenitiesDrawer(false)}
                >
                  Готово ({selectedAmenitiesCount})
                </button>
              </div>
            </div>
          </div>
        </>
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
