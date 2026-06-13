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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAmenitiesDrawer, setShowAmenitiesDrawer] = useState(false);
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
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
    photos: '',
  });
  const [showForm, setShowForm] = useState(false);

  const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user;
  const telegramId = tgUser?.id?.toString();

  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = async () => {
    setLoading(true);
    setError(null);
    const id = window.Telegram?.WebApp?.initDataUnsafe?.user?.id;
    if (!id) {
      setError('Откройте приложение через Telegram бота');
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(
        'https://realty-bot-prod-1.onrender.com/api/properties?showAll=true',
        {
          headers: { 'x-user-id': telegramId || '' },
        },
      );
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      const data = await res.json();
      setProperties(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Ошибка загрузки:', err);
      setError('Не удалось загрузить объявления. Сервер временно недоступен.');
      setProperties([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setPhotoFiles((prev) => [...prev, ...files]);

      const urls = files.map((file) => URL.createObjectURL(file));
      setForm((prev) => ({
        ...prev,
        photos: prev.photos
          ? prev.photos + ', ' + urls.join(', ')
          : urls.join(', '),
      }));
    }
  };

  const removePhoto = (index: number) => {
    setPhotoFiles((prev) => prev.filter((_, i) => i !== index));
    const urls = form.photos.split(', ').filter((_, i) => i !== index);
    setForm((prev) => ({ ...prev, photos: urls.join(', ') }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!telegramId) {
      alert('❌ Открой Mini App через бота @arendapl_bot');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('title', form.title);
      formData.append('city', form.city);
      formData.append('district', form.district);
      formData.append('type', form.type);
      formData.append('rooms', String(form.rooms));
      formData.append('price', String(form.price));
      formData.append('area', String(form.area));
      formData.append('floor', String(form.floor));
      formData.append('totalFloors', String(form.totalFloors));
      formData.append('address', form.address);
      formData.append('description', form.description);

      Object.entries(amenities).forEach(([key, value]) => {
        formData.append(key, String(value));
      });

      photoFiles.forEach((file) => {
        formData.append('photos', file);
      });

      const res = await fetch(
        'https://realty-bot-prod-1.onrender.com/api/properties',
        {
          method: 'POST',
          headers: {
            'x-user-id': telegramId,
          },
          body: formData,
        },
      );

      if (res.ok) {
        alert('✅ Квартира добавлена!');
        setShowForm(false);
        setShowAmenitiesDrawer(false);
        setPhotoFiles([]);
        loadProperties();
      } else {
        const errorData = await res.json().catch(() => ({}));
        alert(`❌ Ошибка: ${errorData.message || res.statusText}`);
      }
    } catch (err) {
      alert('❌ Ошибка сети');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Удалить квартиру безвозвратно?')) return;
    try {
      await fetch(
        `https://realty-bot-prod-1.onrender.com/api/properties/${id}`,
        {
          method: 'DELETE',
          headers: { 'x-user-id': telegramId || '' },
        },
      );
      loadProperties();
    } catch (err) {
      alert('❌ Ошибка при удалении');
    }
  };

  const handleViewProperty = (id: number) => {
    navigate(`/property/${id}`);
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

  if (loading) {
    return (
      <div className="admin-page">
        <button className="property-back" onClick={() => navigate(-1)}>
          ← Назад к поиску.
        </button>
        <h2>📊 Админ-панель</h2>
        <div style={{ textAlign: 'center', padding: '40px', color: '#fff' }}>
          Загрузка...
        </div>
        <BottomNav activeTab="home" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-page">
        <button className="property-back" onClick={() => navigate(-1)}>
          ← Назад к поиску.
        </button>
        <h2>📊 Админ-панель</h2>
        <div style={{ textAlign: 'center', padding: '40px', color: '#ff6b6b' }}>
          ⚠️ {error}
          <div>
            <button
              onClick={() => loadProperties()}
              style={{
                marginTop: '16px',
                padding: '8px 16px',
                background: '#007aff',
                border: 'none',
                borderRadius: '8px',
                color: '#fff',
                cursor: 'pointer',
              }}
            >
              Попробовать снова
            </button>
          </div>
        </div>
        <BottomNav activeTab="home" />
      </div>
    );
  }

  return (
    <div className="admin-page">
      <button className="property-back" onClick={() => navigate(-1)}>
        ← Назад к поиску.
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

            <select
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
              required
            >
              <option value="Warszawa">Warszawa</option>
            </select>

            <select
              value={form.district}
              onChange={(e) => setForm({ ...form, district: e.target.value })}
            >
              <option value="">Выберите район</option>
              <option value="Śródmieście">Śródmieście</option>
              <option value="Mokotów">Mokotów</option>
              <option value="Wola">Wola</option>
              <option value="Ochota">Ochota</option>
              <option value="Żoliborz">Żoliborz</option>
              <option value="Bielany">Bielany</option>
              <option value="Bemowo">Bemowo</option>
              <option value="Ursynów">Ursynów</option>
              <option value="Wilanów">Wilanów</option>
              <option value="Włochy">Włochy</option>
              <option value="Ursus">Ursus</option>
              <option value="Praga-Północ">Praga-Północ</option>
              <option value="Praga-Południe">Praga-Południe</option>
              <option value="Targówek">Targówek</option>
              <option value="Białołęka">Białołęka</option>
              <option value="Rembertów">Rembertów</option>
              <option value="Wawer">Wawer</option>
              <option value="Wesoła">Wesoła</option>
            </select>

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

            <div className="photo-upload">
              <label className="photo-upload-label">
                📸 Загрузить фото
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handlePhotoChange}
                  style={{ display: 'none' }}
                />
              </label>
              {photoFiles.length > 0 && (
                <div className="photo-preview-list">
                  {photoFiles.map((file, index) => (
                    <div key={index} className="photo-preview-item">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={file.name}
                        className="photo-preview-img"
                      />
                      <button
                        type="button"
                        className="photo-remove-btn"
                        onClick={() => removePhoto(index)}
                      >
                        ✕
                      </button>
                      <span className="photo-preview-name">{file.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              type="button"
              className="amenities-drawer-btn"
              onClick={() => setShowAmenitiesDrawer(true)}
            >
              🛋️ Удобства{' '}
              {selectedAmenitiesCount > 0 && `(${selectedAmenitiesCount})`}
            </button>
            <textarea
              placeholder="Описание"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              rows={3}
            />

            <button type="submit">✅ Добавить</button>
          </form>

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
                onClick={() => handleViewProperty(p.id)}
                className="btn-view"
              >
                👁️
              </button>
              <button onClick={() => handleDelete(p.id)} className="btn-delete">
                🗑️
              </button>
            </div>
          </div>
        ))}
      </div>

      <BottomNav activeTab="admin" />
    </div>
  );
}
