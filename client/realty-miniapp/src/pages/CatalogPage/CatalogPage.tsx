import PropertyCard from '../../components/pages/ProtertyCard/PropertyCard';
import { useState, useEffect, useCallback, useRef } from 'react';
import FilterPanel from '../../components/pages/FilterPanel/FilterPanel';
import type { Filters } from '../../components/pages/FilterPanel/FilterPanel';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../../components/pages/BottomNav/BottomNav';
import './CatalogPage.css';
import type { Property } from '../../types/property';

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

export default function CatalogPage() {
  const [filterOpen, setFilterOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [searchText, setSearchText] = useState('');
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchProperties = useCallback(
    async (filters: Filters = DEFAULT_FILTERS, search: string = '') => {
      try {
        setLoading(true);
        const params = new URLSearchParams();

        if (filters.city) params.append('city', filters.city);
        if (filters.district) params.append('district', filters.district);
        if (filters.type) params.append('type', filters.type);
        if (filters.rooms) params.append('rooms', filters.rooms);
        if (filters.priceFrom) params.append('priceFrom', filters.priceFrom);
        if (filters.priceTo) params.append('priceTo', filters.priceTo);
        if (filters.areaFrom) params.append('areaFrom', filters.areaFrom);
        if (filters.areaTo) params.append('areaTo', filters.areaTo);
        if (filters.floorFrom) params.append('floorFrom', filters.floorFrom);
        if (filters.floorTo) params.append('floorTo', filters.floorTo);

        if (search) params.append('search', search);

        const queryString = params.toString();
        const url = `https://realty-bot-prod-production.up.railway.app/api/properties${queryString ? `?${queryString}` : ''}`;

        console.log('🔍 Запрос к API:', url);
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        setProperties(data);
      } catch (error) {
        console.error('❌ Ошибка загрузки:', error);
        setProperties([]);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  useEffect(() => {
    if (window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.ready();
      tg.expand();
      const user = tg.initDataUnsafe?.user;
      if (user) {
        console.log(`Привет, ${user.first_name}! Твой Telegram ID: ${user.id}`);
      }
    }
  }, []);

  const handleApplyFilters = useCallback(
    (filters: Filters) => {
      setActiveFilters(filters);
      fetchProperties(filters, searchText);
    },
    [fetchProperties, searchText],
  );

  const handleResetFilters = useCallback(() => {
    setActiveFilters(DEFAULT_FILTERS);
    setSearchText('');
    fetchProperties(DEFAULT_FILTERS, '');
  }, [fetchProperties]);
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchText(value);
    if (searchTimerRef.current) {
      clearTimeout(searchTimerRef.current);
    }
    searchTimerRef.current = setTimeout(() => {
      fetchProperties(activeFilters, value);
    }, 500);
  };

  const hasActiveFilters = Object.entries(activeFilters).some(([key, value]) =>
    key !== 'amenities' ? value !== '' : (value as string[]).length > 0,
  );

  const getFirstPhoto = (property: Property): string => {
    try {
      const photos = JSON.parse(property.photos || '[]');
      return photos[0] || '';
    } catch {
      return property.photos || '';
    }
  };

  return (
    <div className="app">
      <div className="search-bar">
        <span className="search-bar__icon">🔍</span>
        <input
          className="search-bar__input"
          placeholder="Город, район или улица..."
          value={searchText}
          onChange={handleSearchChange}
        />
        <button
          className="search-bar__filter-btn"
          onClick={() => setFilterOpen(true)}
        >
          ⚙️
        </button>
      </div>

      {/* Активные фильтры */}
      {hasActiveFilters && (
        <div className="active-filters">
          <span>Активные фильтры:</span>
          {activeFilters.city && (
            <span className="filter-tag">📍 {activeFilters.city} ✕</span>
          )}
          {activeFilters.type && (
            <span className="filter-tag">
              🏠{' '}
              {activeFilters.type === 'APARTMENT'
                ? 'Квартира'
                : activeFilters.type === 'HOUSE'
                  ? 'Дом'
                  : 'Комната'}
            </span>
          )}
          {activeFilters.rooms && (
            <span className="filter-tag">
              🛏️ {activeFilters.rooms === '4' ? '4+' : activeFilters.rooms}{' '}
              комн.
            </span>
          )}
          {activeFilters.priceFrom && (
            <span className="filter-tag">
              💰 от {activeFilters.priceFrom} zł
            </span>
          )}
          {activeFilters.priceTo && (
            <span className="filter-tag">💰 до {activeFilters.priceTo} zł</span>
          )}
          <button className="reset-filters-btn" onClick={handleResetFilters}>
            Сбросить все
          </button>
        </div>
      )}

      {/* Список объектов */}
      <div className="property-grid">
        {loading ? (
          <div className="loading">Загрузка...</div>
        ) : properties.length > 0 ? (
          properties.map((p) => (
            <PropertyCard
              property={p}
              key={p.id}
              onClick={() => navigate(`/property/${p.id}`)}
            />
          ))
        ) : (
          <div className="no-results">
            <p>😔 Ничего не найдено</p>
            <button onClick={handleResetFilters}>Сбросить фильтры</button>
          </div>
        )}
      </div>

      <BottomNav activeTab="catalog" />

      <FilterPanel
        isOpen={filterOpen}
        onClose={() => setFilterOpen(false)}
        onApply={handleApplyFilters}
        initialFilters={activeFilters}
      />
    </div>
  );
}
