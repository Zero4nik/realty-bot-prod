import { useState, useEffect } from 'react';
import './FilterPanel.css';

export interface Filters {
  city: string;
  district: string;
  type: string;
  rooms: string;
  priceFrom: string;
  priceTo: string;
  areaFrom: string;
  areaTo: string;
  floorFrom: string;
  floorTo: string;
  amenities: string[];
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: Filters) => void;
  initialFilters: Filters;
}

const DEFAULT_FILTERS: Filters = {
  city: '',
  district: '',
  type: '',
  rooms: '',
  priceFrom: '',
  priceTo: '',
  areaFrom: '',
  areaTo: '',
  floorFrom: '',
  floorTo: '',
  amenities: [],
};

export default function FilterPanel({
  isOpen,
  onClose,
  onApply,
  initialFilters,
}: Props) {
  const [filters, setFilters] = useState<Filters>(
    initialFilters || DEFAULT_FILTERS,
  );
  useEffect(() => {
    setFilters(initialFilters || DEFAULT_FILTERS);
  }, [initialFilters]);

  if (!isOpen) return null;

  const handleChange = (key: keyof Filters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleAmenityToggle = (amenity: string) => {
    setFilters((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity],
    }));
  };

  const handleReset = () => {
    setFilters(DEFAULT_FILTERS);
  };

  const handleApply = () => {
    onApply(filters);
    onClose();
  };

  const isChipActive = (key: keyof Filters, value: string) => {
    return filters[key] === value;
  };

  return (
    <div className="filter-panel-overlay" onClick={onClose}>
      <div className="filter-panel" onClick={(e) => e.stopPropagation()}>
        <div className="filter-panel__header">
          <h3>Фильтры</h3>
          <button onClick={onClose} className="filter-panel__close">
            ✕
          </button>
        </div>

        <div className="filter-panel__body">
          {/* Город */}
          <label className="filter-label">📍 Город</label>
          <select
            className="filter-select"
            value={filters.city}
            onChange={(e) => handleChange('city', e.target.value)}
          >
            <option value="">Все города</option>
            <option value="Warszawa">Warszawa</option>
            <option value="Kraków">Kraków</option>
            <option value="Wrocław">Wrocław</option>
            <option value="Gdańsk">Gdańsk</option>
            <option value="Poznań">Poznań</option>
          </select>

          {/* Район */}
          <label className="filter-label">📍 Район</label>
          <input
            className="filter-input"
            placeholder="Введите район..."
            value={filters.district}
            onChange={(e) => handleChange('district', e.target.value)}
          />

          {/* Тип жилья */}
          <label className="filter-label">🏠 Тип жилья</label>
          <div className="filter-chips">
            {[
              { value: '', label: 'Все' },
              { value: 'APARTMENT', label: 'Квартира' },
              { value: 'HOUSE', label: 'Дом' },
              { value: 'ROOM', label: 'Комната' },
            ].map((item) => (
              <button
                key={item.value}
                className={`filter-chip ${isChipActive('type', item.value) ? 'filter-chip--active' : ''}`}
                onClick={() => handleChange('type', item.value)}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Комнаты */}
          <label className="filter-label">🛏️ Комнат</label>
          <div className="filter-chips">
            {[
              { value: '', label: 'Все' },
              { value: '1', label: '1' },
              { value: '2', label: '2' },
              { value: '3', label: '3' },
              { value: '4', label: '4+' },
            ].map((item) => (
              <button
                key={item.value}
                className={`filter-chip ${isChipActive('rooms', item.value) ? 'filter-chip--active' : ''}`}
                onClick={() => handleChange('rooms', item.value)}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Цена */}
          <label className="filter-label">💰 Цена (zł/мес)</label>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              className="filter-input"
              placeholder="От"
              type="number"
              style={{ flex: 1 }}
              value={filters.priceFrom}
              onChange={(e) => handleChange('priceFrom', e.target.value)}
            />
            <input
              className="filter-input"
              placeholder="До"
              type="number"
              style={{ flex: 1 }}
              value={filters.priceTo}
              onChange={(e) => handleChange('priceTo', e.target.value)}
            />
          </div>

          {/* Площадь */}
          <label className="filter-label">📐 Площадь (м²)</label>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              className="filter-input"
              placeholder="От"
              type="number"
              style={{ flex: 1 }}
              value={filters.areaFrom}
              onChange={(e) => handleChange('areaFrom', e.target.value)}
            />
            <input
              className="filter-input"
              placeholder="До"
              type="number"
              style={{ flex: 1 }}
              value={filters.areaTo}
              onChange={(e) => handleChange('areaTo', e.target.value)}
            />
          </div>

          {/* Этаж */}
          <label className="filter-label">🏢 Этаж</label>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              className="filter-input"
              placeholder="От"
              type="number"
              style={{ flex: 1 }}
              value={filters.floorFrom}
              onChange={(e) => handleChange('floorFrom', e.target.value)}
            />
            <input
              className="filter-input"
              placeholder="До"
              type="number"
              style={{ flex: 1 }}
              value={filters.floorTo}
              onChange={(e) => handleChange('floorTo', e.target.value)}
            />
          </div>

          {/* Удобства */}
          <label className="filter-label">✅ Удобства</label>
          <div className="filter-amenities">
            {[
              { value: 'pets', label: '🐾 Животные' },
              { value: 'ac', label: '❄️ Кондиционер' },
              { value: 'balcony', label: '🏢 Балкон' },
              { value: 'terrace', label: '🌳 Терраса' },
              { value: 'parking', label: '🚗 Парковка' },
            ].map((a) => (
              <label key={a.value} className="filter-checkbox">
                <input
                  type="checkbox"
                  checked={filters.amenities.includes(a.value)}
                  onChange={() => handleAmenityToggle(a.value)}
                />
                {a.label}
              </label>
            ))}
          </div>
        </div>

        <div className="filter-panel__footer">
          <button
            className="filter-btn filter-btn--reset"
            onClick={handleReset}
          >
            Сбросить
          </button>
          <button
            className="filter-btn filter-btn--apply"
            onClick={handleApply}
          >
            Применить
          </button>
        </div>
      </div>
    </div>
  );
}
