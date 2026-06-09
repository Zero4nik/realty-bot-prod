import type { Property } from '../../../types/property';
import './ProtertyCard.css';
import { useEffect, useState } from 'react';

interface Props {
  property: Property;
  onClick: () => void;
}

export default function PropertyCard({ property, onClick }: Props) {
  const [viewed, setViewed] = useState(false);
  const getFirstPhoto = (): string => {
    try {
      const photosArray = JSON.parse(property.photos || '[]');
      if (photosArray.length > 0) {
        const firstPhoto = photosArray[0];
        if (firstPhoto.startsWith('http')) {
          return firstPhoto;
        }
        return firstPhoto;
      }
      return '/placeholder.jpg';
    } catch {
      if (property.photos && property.photos.startsWith('http')) {
        return property.photos.split(',')[0]?.trim();
      }
      return '/placeholder.jpg';
    }
  };

  // Вычисляем удобства
  const getAmenities = (): string[] => {
    const result: string[] = [];
    if (property.balcony) result.push('🌿 Балкон');
    if (property.terrace) result.push('🏡 Терраса');
    if (property.parking) result.push('🅿️ Парковка');
    if (property.pets) result.push('🐾 Можно с животными');
    if (property.conditioner) result.push('❄️ Кондиционер');
    return result;
  };

  const photo = getFirstPhoto();
  const amenities = getAmenities();

  const handleContact = async (e: React.MouseEvent) => {
    e.stopPropagation();
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
  useEffect(() => {
    const viewedIds = JSON.parse(localStorage.getItem('viewed') || '[]');
    setViewed(viewedIds.includes(property.id));
  }, [property.id]);
  return (
    <div className="property-card" onClick={onClick}>
      <div>{viewed && <div className="viewed-badge">✅ ПРОСМОТРЕНО</div>}</div>
      <img className="property-card__photo" src={photo} alt={property.title} />
      <div className="property-card__info">
        <div className="property-card__price">
          {property.price.toLocaleString()} zł/мес
        </div>
        <div className="property-card__address">
          📍 {property.city}
          {property.district ? `, ${property.district}` : ''}
        </div>
        <div className="property-card__details">
          📐 {property.area} м² · 🛏️ {property.rooms} комн. · 🏢{' '}
          {property.floor}/{property.totalFloors} этаж
        </div>
        <div className="property-card__amenities">
          {amenities.length > 0 ? amenities.join(' · ') : 'Без удобств'}
        </div>
        <button className="property-card__button" onClick={handleContact}>
          💬 Связаться с агентом
        </button>
      </div>
    </div>
  );
}
