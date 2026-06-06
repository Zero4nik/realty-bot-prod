import { useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import './PropertyPage.css';
import BottomNav from '../../components/pages/BottomNav/BottomNav';

interface Property {
  id: number;
  city: string;
  district: string;
  type: string;
  rooms: number;
  price: number;
  area: number;
  floor: number;
  totalFloors: number;
  balcony: boolean;
  terrace: boolean;
  parking: boolean;
  conditioner: boolean;
  photos: string;
  description: string;
  address: string;
  pets: boolean;
  separateKitchen: boolean;
}

export default function PropertyPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPhoto, setCurrentPhoto] = useState(0);
  const nextPhoto = () => {
    setCurrentPhoto((prev) => (prev + 1) % photoUrls.length);
  };
  const prevPhoto = () => {
    setCurrentPhoto((prev) => (prev - 1 + photoUrls.length) % photoUrls.length);
  };
  useEffect(() => {
    const fetchProperty = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `https://realty-bot-prod.onrender.com/api/properties/${id}`,
        );
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        const data = await response.json();
        setProperty(data);
      } catch (error) {
        console.error('Ошибка при загрузке квартиры:', error);
        setProperty(null);
      } finally {
        setLoading(false);
      }
    };
    fetchProperty();
  }, [id]);

  const handleContact = async () => {
    const userId = window.Telegram?.WebApp?.initDataUnsafe?.user?.id;
    if (!userId) {
      alert('Ошибка: нет данных пользователя');
      return;
    }
    if (!property) {
      alert('Ошибка: объект не загружен');
      return;
    }

    try {
      const res = await fetch(
        'https://realty-bot-prod.onrender.com/api/inquiries',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, propertyId: property.id }),
        },
      );
      if (res.ok) {
        alert(
          `✅ Заявка отправлена агенту!\n\nОбъект: ${property.address}\nЦена: ${property.price} zł/мес\n\nСкоро с вами свяжутся!`,
        );
      } else {
        alert('Ошибка отправки');
      }
    } catch (err) {
      console.error('Ошибка при отправке заявки:', err);
      alert('Ошибка соединения с сервером');
    }
  };

  if (loading) {
    return <div className="page property-page">Загрузка...</div>;
  }

  if (!property) {
    return (
      <div className="page property-page">
        <button className="property-back" onClick={() => navigate(-1)}>
          ← Назад к поиску.
        </button>
        <p>Объект не найден</p>
      </div>
    );
  }

  // Парсим фото
  let photoUrls: string[] = [];
  try {
    const parsed = JSON.parse(property.photos || '[]');
    photoUrls = parsed;
  } catch {
    photoUrls = property.photos ? [property.photos] : [];
  }

  return (
    <div className="page property-page">
      <button className="property-back" onClick={() => navigate(-1)}>
        ← Назад к поиску.
      </button>

      <div className="property-gallery">
        {photoUrls.length > 0 ? (
          <>
            <img
              className="property-gallery__image"
              src={photoUrls[currentPhoto]}
              alt={property.address}
            />
            {photoUrls.length > 1 && (
              <>
                <button
                  className="property-gallery__arrow property-gallery__arrow--left"
                  onClick={prevPhoto}
                >
                  ‹
                </button>
                <button
                  className="property-gallery__arrow property-gallery__arrow--right"
                  onClick={nextPhoto}
                >
                  ›
                </button>
                <div className="property-gallery__dots">
                  {photoUrls.map((_, i) => (
                    <span
                      key={i}
                      className={`property-gallery__dot ${i === currentPhoto ? 'property-gallery__dot--active' : ''}`}
                      onClick={() => setCurrentPhoto(i)}
                    />
                  ))}
                </div>
                <div className="property-gallery__counter">
                  {currentPhoto + 1} / {photoUrls.length}
                </div>
              </>
            )}
          </>
        ) : (
          <div className="property-gallery__image property-gallery__image--placeholder">
            Нет фото
          </div>
        )}
      </div>

      <div className="property-header">
        <span className="property-type-badge">
          {property.type === 'APARTMENT' ? 'Квартира' : property.type}
        </span>
        <h1 className="property-title">{property.address}</h1>
        <p className="property-price">
          {property.price.toLocaleString()} zł/мес
        </p>
        <p className="property-address">
          📍 {property.city}, {property.district}
        </p>
      </div>

      {/* Характеристики */}
      <div className="property-section">
        <h2 className="property-section-title">📋 Характеристики</h2>
        <div className="property-features">
          <div className="property-feature">
            <span className="property-feature__icon">📐</span>
            <span className="property-feature__label">Площадь</span>
            <span className="property-feature__value">{property.area} м²</span>
          </div>
          <div className="property-feature">
            <span className="property-feature__icon">🛏️</span>
            <span className="property-feature__label">Комнат</span>
            <span className="property-feature__value">{property.rooms}</span>
          </div>
          <div className="property-feature">
            <span className="property-feature__icon">🏢</span>
            <span className="property-feature__label">Этаж</span>
            <span className="property-feature__value">
              {property.floor} из {property.totalFloors}
            </span>
          </div>
        </div>
      </div>

      {/* Удобства */}
      <div className="property-section">
        <h2 className="property-section-title">✅ Удобства</h2>
        <div className="property-amenities">
          {property.balcony && (
            <span className="property-amenity-badge">🌿 Балкон</span>
          )}
          {property.terrace && (
            <span className="property-amenity-badge">🏖️ Терраса</span>
          )}
          {property.parking && (
            <span className="property-amenity-badge">🚗 Парковка</span>
          )}
          {property.pets && (
            <span className="property-amenity-badge">🐾 Можно с животными</span>
          )}
          {property.conditioner && (
            <span className="property-amenity-badge">❄️ Кондиционер</span>
          )}
          {property.separateKitchen && (
            <span className="property-amenity-badge">🍳 Отдельная кухня</span>
          )}
          {!property.balcony &&
            !property.terrace &&
            !property.parking &&
            !property.pets &&
            !property.conditioner &&
            !property.separateKitchen && (
              <span className="property-amenity-empty">
                Без дополнительных удобств
              </span>
            )}
        </div>
      </div>

      {/* Описание */}
      {property.description && (
        <div className="property-section">
          <h2 className="property-section-title">📝 Описание</h2>
          <p className="property-description">{property.description}</p>
        </div>
      )}

      {/* Кнопка "Связаться" */}
      <button className="property-contact-btn" onClick={handleContact}>
        💬 Связаться с агентом
      </button>
      <BottomNav activeTab="catalog" />
    </div>
  );
}
