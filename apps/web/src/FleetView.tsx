import { useEffect, useMemo, useState } from 'react';
import {
  getVehicleCapacityBand,
  getVehicleCapacityBandLabel,
  type Vehicle,
  type VehicleCapacityBand,
  type VehicleDetailResponse,
  vehicleCapacityBandOptions,
} from '@zbk/shared';
import PageSeo from './PageSeo';

type VehiclesResponse = {
  data: Vehicle[];
  meta: {
    total: number;
    categories: string[];
    source: string;
  };
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8787';
const FLEET_CANONICAL_URL = 'https://www.zbktransportservices.com/fleet';

const fleetPageSeo = {
  title: 'Premium Fleet - Toyota Alphard, Noah & Hiace Limousine Rental | ZBK Singapore',
  description:
    "Browse ZBK's premium fleet of luxury Toyota vehicles in Singapore. Choose from Alphard MPV (6 seats), Noah (6 seats), or Hiace Combi (9 seats). All vehicles feature professional chauffeurs, modern amenities, and competitive rates.",
  canonicalUrl: FLEET_CANONICAL_URL,
  keywords: [
    'Toyota Alphard rental Singapore',
    'Toyota Noah rental',
    'Toyota Hiace Combi',
    'luxury MPV rental Singapore',
    'premium vehicle fleet',
    '6 seater limousine',
    '9 seater van rental',
    'Singapore luxury car fleet',
    'executive car rental',
    'family car rental Singapore',
  ],
};

function buildFleetJsonLd(vehicles: Vehicle[]) {
  const topVehicles = vehicles.slice(0, 3);

  const itemList = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'ZBK Limousine Fleet — Singapore',
    itemListElement: topVehicles.map((vehicle, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'Product',
        name: vehicle.name,
        description: vehicle.description || `${vehicle.name} luxury vehicle`,
        brand: {
          '@type': 'Brand',
          name: vehicle.model.split(' ')[0],
        },
        sku: vehicle.id,
        image: vehicle.images?.[0] || vehicle.imageUrl,
        offers: {
          '@type': 'Offer',
          priceCurrency: 'SGD',
          price: vehicle.pricing.airportTransfer,
          availability: `https://schema.org/${vehicle.status === 'AVAILABLE' ? 'InStock' : 'OutOfStock'}`,
          seller: {
            '@type': 'Organization',
            name: 'ZBK Luxury Tours',
          },
        },
      },
    })),
  };

  return [itemList];
}

const fleetHighlights = [
  {
    title: 'Premium Quality',
    description: 'All vehicles are regularly maintained and inspected for optimal performance.',
  },
  {
    title: '24/7 Support',
    description: 'Round-the-clock customer support and roadside assistance stay available with the new stack.',
  },
  {
    title: 'Flexible Pickup',
    description: 'Convenient pickup and drop-off planning remains aligned with the public booking flow.',
  },
  {
    title: 'Competitive Rates',
    description: 'Transparent pricing is surfaced directly from the shared vehicle catalog.',
  },
];

function formatPrice(vehicle?: Vehicle | null) {
  if (!vehicle) return '0';
  const price = vehicle.pricing?.airportTransfer ?? vehicle.pricing?.perHour ?? 0;
  return price.toLocaleString('en-US', { maximumFractionDigits: 0 });
}

function formatTransmission(vehicle?: Vehicle | null) {
  return vehicle?.transmission?.trim() || 'Automatic';
}

function formatRating(vehicle?: Vehicle | null) {
  if (!vehicle?.rating) return 'No rating yet';
  return `${vehicle.rating.toFixed(1)} rating`;
}

function formatLuggage(vehicle?: Vehicle | null) {
  if (vehicle?.luggage === null || vehicle?.luggage === undefined) return 'Luggage n/a';
  return `${vehicle.luggage} bags`;
}

function getVehicleImage(vehicle?: Vehicle | null) {
  if (!vehicle) return [];
  if (vehicle.images?.length) return vehicle.images;
  return vehicle.imageUrl ? [vehicle.imageUrl] : [];
}

function sortVehiclesByCarouselOrder(left: Vehicle, right: Vehicle) {
  const leftOrder = left.carouselOrder ?? Number.MAX_SAFE_INTEGER;
  const rightOrder = right.carouselOrder ?? Number.MAX_SAFE_INTEGER;

  if (leftOrder !== rightOrder) {
    return leftOrder - rightOrder;
  }

  const nameDelta = left.name.localeCompare(right.name);
  if (nameDelta !== 0) {
    return nameDelta;
  }

  return left.id.localeCompare(right.id);
}

export default function FleetView() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [vehicleCategories, setVehicleCategories] = useState<string[]>([]);
  const [isLoadingVehicles, setIsLoadingVehicles] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<'ALL' | string>('ALL');
  const [selectedCapacityBand, setSelectedCapacityBand] = useState<VehicleCapacityBand | 'ALL'>('ALL');
  const [luxuryOnly, setLuxuryOnly] = useState(false);
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [selectedVehicleDetail, setSelectedVehicleDetail] = useState<VehicleDetailResponse | null>(null);
  const [isLoadingVehicleDetail, setIsLoadingVehicleDetail] = useState(false);
  const [vehicleDetailError, setVehicleDetailError] = useState<string | null>(null);
  const [activeVehicleImageIndex, setActiveVehicleImageIndex] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function loadVehicles() {
      try {
        setIsLoadingVehicles(true);
        setError(null);

        const params = new URLSearchParams({ status: 'AVAILABLE' });
        if (selectedCategory !== 'ALL') {
          params.set('category', selectedCategory);
        }
        if (selectedCapacityBand !== 'ALL') {
          params.set('capacityBand', selectedCapacityBand);
        }
        if (luxuryOnly) {
          params.set('luxuryOnly', 'true');
        }

        const response = await fetch(`${API_BASE_URL}/api/public/vehicles?${params.toString()}`, {
          signal: controller.signal,
        });
        const payload: VehiclesResponse = await response.json();

        if (!response.ok) {
          throw new Error((payload as unknown as { message?: string }).message || `Unable to load fleet: ${response.status}`);
        }

        setVehicles(payload.data);
        setVehicleCategories(payload.meta.categories);
        setSelectedVehicleId((currentSelectedVehicleId) => {
          if (payload.data.some((vehicle) => vehicle.id === currentSelectedVehicleId)) {
            return currentSelectedVehicleId;
          }

          return payload.data[0]?.id || '';
        });
      } catch (err) {
        if (controller.signal.aborted) return;
        setError(err instanceof Error ? err.message : 'Unknown error loading fleet');
      } finally {
        if (!controller.signal.aborted) {
          setIsLoadingVehicles(false);
        }
      }
    }

    loadVehicles();
    return () => controller.abort();
  }, [luxuryOnly, selectedCapacityBand, selectedCategory]);

  const visibleVehicles = useMemo(
    () =>
      [...vehicles]
        .filter((vehicle) => {
          if (selectedCategory !== 'ALL' && vehicle.category !== selectedCategory) return false;
          if (selectedCapacityBand !== 'ALL' && getVehicleCapacityBand(vehicle.capacity) !== selectedCapacityBand) return false;
          if (luxuryOnly && !vehicle.isLuxury) return false;
          return true;
        })
        .sort(sortVehiclesByCarouselOrder),
    [luxuryOnly, selectedCapacityBand, selectedCategory, vehicles],
  );

  const spotlightVehicle = useMemo(
    () => visibleVehicles.find((vehicle) => vehicle.id === selectedVehicleId) || visibleVehicles[0] || null,
    [selectedVehicleId, visibleVehicles],
  );

  useEffect(() => {
    if (!visibleVehicles.length) {
      setSelectedVehicleId('');
      setSelectedVehicleDetail(null);
      setVehicleDetailError(null);
      return;
    }

    if (!visibleVehicles.some((vehicle) => vehicle.id === selectedVehicleId)) {
      setSelectedVehicleId(visibleVehicles[0].id);
    }
  }, [selectedVehicleId, visibleVehicles]);

  useEffect(() => {
    if (!selectedVehicleId) {
      setSelectedVehicleDetail(null);
      setVehicleDetailError(null);
      setIsLoadingVehicleDetail(false);
      return;
    }

    const controller = new AbortController();

    async function loadVehicleDetail() {
      try {
        setIsLoadingVehicleDetail(true);
        setVehicleDetailError(null);

        const response = await fetch(`${API_BASE_URL}/api/public/vehicles/${encodeURIComponent(selectedVehicleId)}`, {
          signal: controller.signal,
        });
        const payload: VehicleDetailResponse = await response.json();

        if (!response.ok) {
          throw new Error((payload as unknown as { message?: string }).message || `Unable to load vehicle detail: ${response.status}`);
        }

        setSelectedVehicleDetail(payload);
      } catch (err) {
        if (controller.signal.aborted) return;
        setSelectedVehicleDetail(null);
        setVehicleDetailError(err instanceof Error ? err.message : 'Unknown error loading vehicle detail');
      } finally {
        if (!controller.signal.aborted) {
          setIsLoadingVehicleDetail(false);
        }
      }
    }

    loadVehicleDetail();
    return () => controller.abort();
  }, [selectedVehicleId]);

  useEffect(() => {
    setActiveVehicleImageIndex(0);
  }, [selectedVehicleId]);

  const selectedVehicle = selectedVehicleDetail?.data || spotlightVehicle;
  const vehicleImages = useMemo(() => getVehicleImage(selectedVehicle), [selectedVehicle]);
  const activeVehicleImage = vehicleImages[activeVehicleImageIndex] || vehicleImages[0] || '';
  const pageSeo = useMemo(
    () => ({
      ...fleetPageSeo,
      jsonLd: visibleVehicles.length ? buildFleetJsonLd(visibleVehicles) : undefined,
    }),
    [visibleVehicles],
  );

  return (
    <main className="page">
      <PageSeo {...pageSeo} />
      <section className="hero">
        <p className="eyebrow">ZBK Luxury Serverless</p>
        <h1>Public fleet browsing now has its own hash-routed page.</h1>
        <p>
          This slice lifts the legacy fleet overview into the React/Vite app so visitors can browse live vehicles,
          inspect the detail spotlight, and jump back into the migrated booking workspace without leaving the serverless stack.
        </p>
        <div className="service-pills">
          <span className="pill">{isLoadingVehicles ? 'Loading fleet…' : `${visibleVehicles.length} available vehicles`}</span>
          <span className="pill pill--muted">{vehicleCategories.length} categories</span>
          <a className="primary-button primary-button--inline" href="#/">
            Open booking workspace
          </a>
          <a className="secondary-link" href="#/booking-demo" style={{ minWidth: 0 }}>
            Booking demo
          </a>
          <a className="secondary-link" href="#/how-to-book" style={{ minWidth: 0 }}>
            How to book
          </a>
        </div>
      </section>

      <section className="card-grid" style={{ marginTop: 20 }}>
        {fleetHighlights.map((feature) => (
          <article key={feature.title} className="card">
            <h2 style={{ marginTop: 0 }}>{feature.title}</h2>
            <p className="muted" style={{ marginBottom: 0 }}>
              {feature.description}
            </p>
          </article>
        ))}
      </section>

      {error ? <div className="alert error">{error}</div> : null}

      <section className="card-grid">
        <article className="card">
          <p className="eyebrow">Step 1</p>
          <h2>Review the live fleet</h2>
          <p className="muted">
            The serverless catalog now exposes available vehicles from the Workers API, including legacy-inspired category and luxury filters.
          </p>
          <ul className="detail-list">
            <li>{vehicleCategories.length} public categories are available in this seed catalog.</li>
            <li>{visibleVehicles.length || 0} vehicles match the current filters.</li>
            <li>Each selection loads a typed detail response from the Workers endpoint.</li>
          </ul>
        </article>

        <article className="card">
          <p className="eyebrow">Step 2</p>
          <h2>Pick a vehicle</h2>
          <p className="muted">
            Browse the cards below, switch categories, or narrow to luxury-only vehicles before you continue to the booking workspace.
          </p>
          <div className="service-pills service-pills--tight" style={{ marginTop: 12 }}>
            <button
              type="button"
              className={`pill pill-button ${selectedCategory === 'ALL' ? '' : 'pill--muted'}`}
              onClick={() => setSelectedCategory('ALL')}
            >
              All categories
            </button>
            {vehicleCategories.map((category) => (
              <button
                key={category}
                type="button"
                className={`pill pill-button ${selectedCategory === category ? '' : 'pill--muted'}`}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>
          <div className="service-pills service-pills--tight" style={{ marginTop: 12 }}>
            {vehicleCapacityBandOptions.map((band) => (
              <button
                key={band}
                type="button"
                className={`pill pill-button ${selectedCapacityBand === band ? '' : 'pill--muted'}`}
                onClick={() => setSelectedCapacityBand(band)}
              >
                {getVehicleCapacityBandLabel(band)}
              </button>
            ))}
          </div>
          <label className="checkbox-inline" style={{ marginTop: 12 }}>
            <input type="checkbox" checked={luxuryOnly} onChange={(e) => setLuxuryOnly(e.target.checked)} />
            Luxury only
          </label>
        </article>

        <article className="card">
          <p className="eyebrow">Step 3</p>
          <h2>Continue into booking</h2>
          <p className="muted">
            From the fleet page, the visitor can jump back into the booking workspace, read the public guide, or use the booking demo route.
          </p>
          <ul className="detail-list">
            <li>Booking workspace stays on the migrated React/Vite shell.</li>
            <li>The guide and demo routes now link back to this public fleet page.</li>
            <li>Further migration work can swap the seed catalog for database-backed inventory later.</li>
          </ul>
        </article>
      </section>

      <section className="card" style={{ marginTop: 20 }}>
        <div className="section-title-row">
          <div>
            <h2>Fleet cards</h2>
            <p className="muted">The current selection remains visible while you browse the available catalog.</p>
          </div>
          <span className={`pill ${isLoadingVehicles ? 'pill--muted' : ''}`}>
            {isLoadingVehicles ? 'Loading…' : `${visibleVehicles.length} shown`}
          </span>
        </div>

        {isLoadingVehicles ? (
          <p className="muted">Loading fleet preview…</p>
        ) : visibleVehicles.length > 0 ? (
          <div className="vehicle-grid">
            {visibleVehicles.map((vehicle) => (
              <button
                key={vehicle.id}
                type="button"
                className={`vehicle-card ${vehicle.id === selectedVehicleId ? 'vehicle-card--active' : ''}`}
                onClick={() => setSelectedVehicleId(vehicle.id)}
              >
                <div className="vehicle-card__header">
                  <div>
                    <strong>{vehicle.name}</strong>
                    <div className="service-pills service-pills--tight">
                      <span className="pill pill--muted">{vehicle.category}</span>
                      {vehicle.carouselOrder ? <span className="pill">Order #{vehicle.carouselOrder}</span> : null}
                      {vehicle.isLuxury ? <span className="pill">Luxury</span> : null}
                    </div>
                  </div>
                  <span>{vehicle.status}</span>
                </div>
                <p>
                  {vehicle.model} • {vehicle.year}
                </p>
                <p>
                  {vehicle.location} • {vehicle.capacity} pax
                </p>
                <div className="service-pills service-pills--tight">
                  <span className="pill pill--muted">{formatTransmission(vehicle)}</span>
                  <span className="pill pill--muted">{formatRating(vehicle)}</span>
                  <span className="pill pill--muted">{formatLuggage(vehicle)}</span>
                </div>
                <p className="muted">Capacity band: {getVehicleCapacityBandLabel(getVehicleCapacityBand(vehicle.capacity))}</p>
                {vehicle.minimumHours ? (
                  <p className="muted">Minimum booking window: {vehicle.minimumHours} hour{vehicle.minimumHours > 1 ? 's' : ''}</p>
                ) : null}
                {vehicle.features.length > 0 ? <p className="muted">{vehicle.features.slice(0, 2).join(' • ')}</p> : null}
                <div className="service-pills">
                  {vehicle.services.map((service) => (
                    <span key={service} className="pill pill--muted">
                      {service}
                    </span>
                  ))}
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="alert error">No available vehicles match the current filter.</div>
        )}
      </section>

      <section className="card" style={{ marginTop: 20 }}>
        <div className="section-title-row">
          <div>
            <h2>Vehicle detail spotlight</h2>
            <p className="muted">
              {selectedVehicleDetail?.message || 'Select a vehicle to load the full serverless detail response.'}
            </p>
          </div>
          <span className={`pill ${isLoadingVehicleDetail ? 'pill--muted' : ''}`}>
            {isLoadingVehicleDetail ? 'Loading detail…' : `${selectedVehicleDetail?.meta.imageCount || vehicleImages.length || 0} images`}
          </span>
        </div>

        {vehicleDetailError ? <div className="alert error">{vehicleDetailError}</div> : null}

        {selectedVehicle ? (
          <div className="vehicle-spotlight">
            <div className="vehicle-spotlight__media">
              {activeVehicleImage ? (
                <img
                  alt={`${selectedVehicle.name} hero image`}
                  className="vehicle-spotlight__image"
                  src={activeVehicleImage}
                />
              ) : (
                <div className="vehicle-spotlight__placeholder">No vehicle image available yet.</div>
              )}
              <div className="vehicle-spotlight__meta">
                <span className="pill">{selectedVehicle.category}</span>
                {selectedVehicle.carouselOrder ? <span className="pill">Order #{selectedVehicle.carouselOrder}</span> : null}
                {selectedVehicle.isLuxury ? <span className="pill">Luxury</span> : null}
                <span className="pill pill--muted">{selectedVehicle.status}</span>
              </div>
            </div>

            <div className="vehicle-spotlight__summary">
              <p className="vehicle-detail__name">{selectedVehicle.name}</p>
              <p className="muted">{selectedVehicle.description}</p>
              <p className="muted">
                Loaded from {selectedVehicleDetail?.meta.source || 'the live catalog seed'}
                {selectedVehicleDetail?.meta.featuredFeature ? ` • featured: ${selectedVehicleDetail.meta.featuredFeature}` : ''}
              </p>

              <ul className="detail-list">
                <li>Model: {selectedVehicle.model}</li>
                <li>Location: {selectedVehicle.location}</li>
                <li>Capacity: {selectedVehicle.capacity} pax</li>
                <li>Luggage: {selectedVehicle.luggage ?? '-'} bags</li>
                <li>Transmission: {selectedVehicle.transmission || '-'}</li>
                <li>Rating: {selectedVehicle.rating ? `${selectedVehicle.rating.toFixed(1)} / 5` : '-'}</li>
                <li>Airport transfer: ${selectedVehicle.pricing.airportTransfer}</li>
                <li>6 hours: ${selectedVehicle.pricing.sixHours}</li>
                <li>12 hours: ${selectedVehicle.pricing.twelveHours}</li>
                <li>Per hour: ${selectedVehicle.pricing.perHour}</li>
              </ul>

              {selectedVehicle.features.length ? (
                <div>
                  <p className="muted">Legacy feature highlights</p>
                  <div className="service-pills">
                    {selectedVehicle.features.map((feature) => (
                      <span key={feature} className="pill pill--muted">
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}

              <div className="quote-box" style={{ marginTop: 16 }}>
                <div>
                  <p style={{ margin: 0, fontWeight: 700 }}>From SGD {formatPrice(selectedVehicle)}</p>
                  <p className="muted" style={{ margin: '4px 0 0' }}>
                    Loaded from the Workers API detail endpoint
                  </p>
                </div>
                <a
                  className="primary-button primary-button--inline"
                  href={`#/booking?vehicleId=${encodeURIComponent(selectedVehicle.id)}`}
                >
                  Book this vehicle
                </a>
              </div>
            </div>
          </div>
        ) : (
          <p className="muted">Pilih vehicle dulu.</p>
        )}

        {selectedVehicle && vehicleImages.length > 1 ? (
          <div className="vehicle-spotlight__thumbs" aria-label="Vehicle image gallery" style={{ marginTop: 16 }}>
            {vehicleImages.map((image, index) => (
              <button
                key={`${selectedVehicle.id}-image-${index}`}
                className={`vehicle-spotlight__thumb ${index === activeVehicleImageIndex ? 'vehicle-spotlight__thumb--active' : ''}`}
                type="button"
                onClick={() => setActiveVehicleImageIndex(index)}
              >
                <img alt={`${selectedVehicle.name} gallery thumbnail ${index + 1}`} src={image} />
              </button>
            ))}
          </div>
        ) : null}
      </section>
    </main>
  );
}
