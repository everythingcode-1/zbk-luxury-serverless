import { useEffect, useMemo, useState } from 'react';
import {
  buildVehicleQuote,
  calculateTripHours,
  deriveAdditionalHours,
  inferServiceTypeFromTrip,
  isAirportLocation,
  type BookingHistoryResponse,
  type BookingLookupResponse,
  type BookingPaymentReturnResponse,
  type BookingQuoteRequest,
  type BookingQuoteResponse,
  type CreateBookingResponse,
  type CreateCheckoutSessionResponse,
  type TripType,
  type Vehicle,
  type VehicleDetailResponse,
  tripTypeOptions,
  vehicleCategoryOptions,
} from '@zbk/shared';
import AdminDashboardView from './AdminDashboardView';
import AuthWorkspace from './AuthWorkspace';
import BookingLandingView from './BookingLandingView';
import BookingConfirmationView from './BookingConfirmationView';
import BookingDemoView from './BookingDemoView';
import FleetView from './FleetView';
import ServicesView from './ServicesView';
import HowToBookView from './HowToBookView';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8787';

type VehiclesResponse = {
  data: Vehicle[];
  meta: {
    total: number;
    categories: string[];
    source: string;
  };
};

type BookingFormState = {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  tripType: TripType;
  startDate: string;
  endDate: string;
  pickupTime: string;
  endTime: string;
  pickupLocation: string;
  pickupNote: string;
  dropoffLocation: string;
  dropoffNote: string;
  notes: string;
};

type BookingLookupFormState = {
  reference: string;
  email: string;
};

type BookingHistoryFormState = {
  email: string;
};

type RouteState = {
  pathname: string;
  searchParams: URLSearchParams;
};

function getRouteState(): RouteState {
  if (typeof window === 'undefined') {
    return { pathname: '/', searchParams: new URLSearchParams() };
  }

  const { hash, search } = window.location;
  if (hash.startsWith('#/')) {
    const [hashPath, hashQuery = ''] = hash.slice(1).split('?');
    return {
      pathname: hashPath || '/',
      searchParams: new URLSearchParams(hashQuery),
    };
  }

  return { pathname: '/', searchParams: new URLSearchParams(search) };
}

const initialBookingForm: BookingFormState = {
  customerName: '',
  customerEmail: '',
  customerPhone: '',
  tripType: 'ONE_WAY',
  startDate: '',
  endDate: '',
  pickupTime: '09:00',
  endTime: '18:00',
  pickupLocation: '',
  pickupNote: '',
  dropoffLocation: '',
  dropoffNote: '',
  notes: '',
};

const initialLookupForm: BookingLookupFormState = {
  reference: '',
  email: '',
};

const initialHistoryForm: BookingHistoryFormState = {
  email: '',
};

function getDefaultQuoteRequest(vehicle?: Vehicle): BookingQuoteRequest {
  return {
    vehicleId: vehicle?.id || '',
    serviceType: 'AIRPORT_TRANSFER',
    hours: 1,
    additionalHours: 0,
  };
}

function formatServiceTypeLabel(serviceType: BookingQuoteRequest['serviceType']) {
  switch (serviceType) {
    case 'AIRPORT_TRANSFER':
      return 'Airport transfer';
    case 'TRIP':
      return 'One-way trip';
    case 'RENTAL':
      return 'Round-trip rental';
    default:
      return serviceType;
  }
}

function formatTripTypeLabel(tripType: TripType) {
  return tripType === 'ROUND_TRIP' ? 'Round trip' : 'One way';
}


function PaymentReturnView({ routeState }: { routeState: RouteState }) {
  const [result, setResult] = useState<BookingPaymentReturnResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reference = routeState.searchParams.get('reference') || '';
  const token = routeState.searchParams.get('token') || '';
  const sessionId = routeState.searchParams.get('session_id') || '';
  const stage = routeState.searchParams.get('stage') || (routeState.pathname === '/payment/cancel' ? 'CANCEL' : 'SUCCESS');

  const isCancel = stage === 'CANCEL';

  useEffect(() => {
    const controller = new AbortController();

    async function loadPaymentReturn() {
      if (!reference || !token) {
        setError('Payment return link is missing the booking reference or secure token.');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        const params = new URLSearchParams({ token, stage });
        if (sessionId) {
          params.set('session_id', sessionId);
        }

        const response = await fetch(
          `${API_BASE_URL}/api/public/bookings/${encodeURIComponent(reference)}/payment-return?${params.toString()}`,
          { signal: controller.signal },
        );
        const payload: BookingPaymentReturnResponse | { message?: string } = await response.json();

        if (!response.ok) {
          throw new Error(payload.message || `Payment return lookup failed: ${response.status}`);
        }

        setResult(payload as BookingPaymentReturnResponse);
      } catch (err) {
        if (controller.signal.aborted) return;
        setError(err instanceof Error ? err.message : 'Unknown error loading payment return');
        setResult(null);
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    loadPaymentReturn();
    return () => controller.abort();
  }, [reference, routeState.pathname, sessionId, stage, token]);

  const booking = result?.data.booking;
  const returnHeadline =
    result?.payment.status === 'CONFIRMED'
      ? 'Stripe webhook sudah mengonfirmasi payment dan booking kini berstatus confirmed.'
      : result?.payment.status === 'FAILED'
        ? 'Stripe webhook menandai checkout ini gagal, jadi booking bisa diulang dari return flow.'
        : isCancel
          ? 'Checkout dibatalkan, tapi flow return page sudah dimigrasikan.'
          : 'Payment success return page sudah mendarat di stack serverless.';

  return (
    <main className="page payment-return-page">
      <section className="hero payment-return-hero">
        <p className="eyebrow">ZBK Luxury Serverless</p>
        <h1>{returnHeadline}</h1>
        <p>
          Slice ini memindahkan hash-routed Stripe return pages ke React/Vite + Workers supaya checkout success/cancel
          kembali ke app baru tanpa bergantung pada Next.js legacy route runtime.
        </p>
      </section>

      {isLoading ? <div className="card">Loading payment return summary…</div> : null}
      {error ? <div className="alert error">{error}</div> : null}

      {booking && result ? (
        <section className="card-grid payment-return-grid">
          <article className="card card--wide payment-return-card">
            <div className="section-title-row">
              <div>
                <h2>{isCancel ? 'Deposit checkout can be reopened' : 'Booking deposit return summary'}</h2>
                <p className="muted">{result.message}</p>
              </div>
              <span className={`pill ${isCancel ? 'pill--muted' : ''}`}>{result.payment.status}</span>
            </div>

            <div className="payment-return-summary">
              <div>
                <p><strong>{booking.reference}</strong> • {booking.customerName} • {booking.vehicleName}</p>
                <p className="muted">{formatTripTypeLabel(booking.tripType)} • {formatServiceTypeLabel(booking.serviceType)}</p>
                <p className="muted">
                  {booking.startDate}
                  {booking.pickupTime ? ` • ${booking.pickupTime}` : ''}
                  {booking.tripType === 'ROUND_TRIP' && booking.endTime ? ` → ${booking.endDate} • ${booking.endTime}` : ''}
                </p>
                <p className="muted">
                  Pickup {booking.pickupLocation}
                  {booking.pickupNote ? ` (${booking.pickupNote})` : ''}
                  {booking.dropoffLocation ? ` → ${booking.dropoffLocation}` : ''}
                  {booking.dropoffNote ? ` (${booking.dropoffNote})` : ''}
                </p>
                <p className="muted">Next: {result.payment.nextStep}</p>
                {result.data.sessionId ? <p className="muted">Stripe session: {result.data.sessionId}</p> : null}
                {result.data.expiresAt ? <p className="muted">Checkout expires: {result.data.expiresAt}</p> : null}
              </div>

              <div className="quote-box__amount">
                <span>${booking.totalAmount.toFixed(2)}</span>
                <small>Deposit ${booking.depositAmount.toFixed(2)}</small>
              </div>
            </div>

            <div className="payment-return-actions">
              {result.data.checkoutUrl ? (
                <button className="primary-button primary-button--inline" onClick={() => window.location.assign(result.data.checkoutUrl!)} type="button">
                  {isCancel ? 'Reopen deposit checkout' : 'Open latest checkout again'}
                </button>
              ) : null}
              <a className="secondary-link" href="#/">
                Back to booking workspace
              </a>
            </div>
          </article>
        </section>
      ) : null}
    </main>
  );
}

export default function App() {
  const [routeState, setRouteState] = useState<RouteState>(() => getRouteState());
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [vehicleCategories, setVehicleCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<(typeof vehicleCategoryOptions)[number] | 'ALL'>('ALL');
  const [luxuryOnly, setLuxuryOnly] = useState(false);
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [selectedVehicleDetail, setSelectedVehicleDetail] = useState<VehicleDetailResponse | null>(null);
  const [isLoadingVehicleDetail, setIsLoadingVehicleDetail] = useState(true);
  const [vehicleDetailError, setVehicleDetailError] = useState<string | null>(null);
  const [activeVehicleImageIndex, setActiveVehicleImageIndex] = useState(0);
  const [bookingForm, setBookingForm] = useState<BookingFormState>(initialBookingForm);
  const [lookupForm, setLookupForm] = useState<BookingLookupFormState>(initialLookupForm);
  const [historyForm, setHistoryForm] = useState<BookingHistoryFormState>(initialHistoryForm);
  const [remoteQuote, setRemoteQuote] = useState<BookingQuoteResponse | null>(null);
  const [bookingResult, setBookingResult] = useState<CreateBookingResponse | null>(null);
  const [lookupResult, setLookupResult] = useState<BookingLookupResponse | null>(null);
  const [historyResult, setHistoryResult] = useState<BookingHistoryResponse | null>(null);
  const [isLoadingVehicles, setIsLoadingVehicles] = useState(true);
  const [isLoadingQuote, setIsLoadingQuote] = useState(false);
  const [isSubmittingBooking, setIsSubmittingBooking] = useState(false);
  const [isLookingUpBooking, setIsLookingUpBooking] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isPreparingCheckoutFor, setIsPreparingCheckoutFor] = useState<string | null>(null);
  const [checkoutMessage, setCheckoutMessage] = useState<string | null>(null);
  const [checkoutMessageFor, setCheckoutMessageFor] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const syncRouteState = () => setRouteState(getRouteState());

    window.addEventListener('hashchange', syncRouteState);
    window.addEventListener('popstate', syncRouteState);

    return () => {
      window.removeEventListener('hashchange', syncRouteState);
      window.removeEventListener('popstate', syncRouteState);
    };
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    async function loadVehicles() {
      try {
        setIsLoadingVehicles(true);
        setError(null);
        const params = new URLSearchParams();
        if (selectedCategory !== 'ALL') {
          params.set('category', selectedCategory);
        }
        if (luxuryOnly) {
          params.set('luxuryOnly', 'true');
        }

        const response = await fetch(`${API_BASE_URL}/api/public/vehicles${params.size ? `?${params.toString()}` : ''}`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Failed to load vehicles: ${response.status}`);
        }

        const payload: VehiclesResponse = await response.json();
        setVehicles(payload.data);
        setVehicleCategories(payload.meta.categories);

        const nextVehicle = payload.data.find((vehicle) => vehicle.id === selectedVehicleId) || payload.data[0];
        setSelectedVehicleId(nextVehicle?.id || '');
      } catch (err) {
        if (controller.signal.aborted) return;
        setError(err instanceof Error ? err.message : 'Unknown error loading vehicles');
      } finally {
        if (!controller.signal.aborted) {
          setIsLoadingVehicles(false);
        }
      }
    }

    loadVehicles();
    return () => controller.abort();
  }, [luxuryOnly, selectedCategory, selectedVehicleId]);

  const selectedVehicle = useMemo(
    () => vehicles.find((vehicle) => vehicle.id === selectedVehicleId),
    [selectedVehicleId, vehicles],
  );

  useEffect(() => {
    if (!selectedVehicleId) {
      setSelectedVehicleDetail(null);
      setIsLoadingVehicleDetail(false);
      setVehicleDetailError(null);
      setActiveVehicleImageIndex(0);
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
        const payload: VehicleDetailResponse | { message?: string } = await response.json();

        if (!response.ok) {
          throw new Error(payload.message || `Vehicle detail failed: ${response.status}`);
        }

        setSelectedVehicleDetail(payload as VehicleDetailResponse);
        setActiveVehicleImageIndex(0);
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

  const normalizedDropoffLocation = useMemo(
    () => bookingForm.dropoffLocation.trim() || bookingForm.pickupLocation.trim(),
    [bookingForm.dropoffLocation, bookingForm.pickupLocation],
  );

  const derivedServiceType = useMemo(
    () => inferServiceTypeFromTrip(bookingForm.tripType, bookingForm.pickupLocation, normalizedDropoffLocation),
    [bookingForm.tripType, bookingForm.pickupLocation, normalizedDropoffLocation],
  );

  const calculatedTripHours = useMemo(() => {
    if (bookingForm.tripType !== 'ROUND_TRIP') {
      return null;
    }

    return calculateTripHours(bookingForm.startDate, bookingForm.pickupTime, bookingForm.endDate, bookingForm.endTime);
  }, [bookingForm.endDate, bookingForm.endTime, bookingForm.pickupTime, bookingForm.startDate, bookingForm.tripType]);

  const derivedHours = useMemo(() => {
    if (bookingForm.tripType !== 'ROUND_TRIP') {
      return 1;
    }

    return calculatedTripHours || 1;
  }, [bookingForm.tripType, calculatedTripHours]);

  const derivedAdditionalHours = useMemo(
    () => (derivedServiceType === 'RENTAL' ? deriveAdditionalHours(derivedHours) : 0),
    [derivedHours, derivedServiceType],
  );

  const quoteRequest = useMemo<BookingQuoteRequest>(
    () => ({
      ...(getDefaultQuoteRequest(selectedVehicle)),
      vehicleId: selectedVehicle?.id || '',
      serviceType: derivedServiceType,
      hours: derivedHours,
      additionalHours: derivedAdditionalHours,
    }),
    [derivedAdditionalHours, derivedHours, derivedServiceType, selectedVehicle],
  );

  const localPreview = useMemo(() => {
    if (!selectedVehicle) return null;
    return buildVehicleQuote(selectedVehicle, quoteRequest);
  }, [selectedVehicle, quoteRequest]);

  const selectedVehicleSupportsDerivedService = useMemo(
    () => (selectedVehicle ? selectedVehicle.services.includes(quoteRequest.serviceType) : false),
    [quoteRequest.serviceType, selectedVehicle],
  );

  const spotlightVehicle = selectedVehicleDetail?.data || selectedVehicle;
  const vehicleImages = useMemo(
    () => (spotlightVehicle?.images?.length ? spotlightVehicle.images : spotlightVehicle?.imageUrl ? [spotlightVehicle.imageUrl] : []),
    [spotlightVehicle],
  );
  const activeVehicleImage = vehicleImages[activeVehicleImageIndex] || vehicleImages[0] || '';

  const showPickupNoteField = useMemo(() => isAirportLocation(bookingForm.pickupLocation), [bookingForm.pickupLocation]);
  const showDropoffNoteField = useMemo(() => isAirportLocation(normalizedDropoffLocation), [normalizedDropoffLocation]);

  function resetBookingArtifacts() {
    setBookingResult(null);
    setRemoteQuote(null);
    setCheckoutMessage(null);
    setCheckoutMessageFor(null);
  }

  function updateBookingForm(field: keyof BookingFormState, value: string) {
    setBookingForm((prev) => {
      if (field === 'tripType') {
        const nextTripType = value as TripType;
        return {
          ...prev,
          tripType: nextTripType,
          endDate: nextTripType === 'ONE_WAY' ? prev.startDate || prev.endDate : prev.endDate || prev.startDate,
          endTime: nextTripType === 'ONE_WAY' ? '' : prev.endTime || '18:00',
        };
      }

      const nextState = {
        ...prev,
        [field]: value,
      };

      if (field === 'startDate' && (prev.tripType === 'ONE_WAY' || !prev.endDate)) {
        nextState.endDate = value;
      }

      return nextState;
    });
    resetBookingArtifacts();
  }

  function updateLookupForm(field: keyof BookingLookupFormState, value: string) {
    setLookupForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  function updateHistoryForm(field: keyof BookingHistoryFormState, value: string) {
    setHistoryForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  async function requestQuote() {
    if (!selectedVehicle || !selectedVehicleSupportsDerivedService) return;

    try {
      setIsLoadingQuote(true);
      setError(null);
      const response = await fetch(`${API_BASE_URL}/api/public/booking/quote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(quoteRequest),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.message || `Quote request failed: ${response.status}`);
      }

      setRemoteQuote(payload.data);
      setBookingResult(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error requesting quote');
      setRemoteQuote(null);
    } finally {
      setIsLoadingQuote(false);
    }
  }

  async function submitBooking(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedVehicle) {
      setError('Pilih vehicle dulu sebelum submit booking.');
      return;
    }

    if (!selectedVehicleSupportsDerivedService) {
      setError('Vehicle ini belum mendukung service type yang terdeteksi dari ride details.');
      return;
    }

    if (!bookingForm.startDate || !bookingForm.pickupLocation) {
      setError('Tanggal mulai dan pickup location wajib diisi.');
      return;
    }

    if (bookingForm.tripType === 'ROUND_TRIP' && !calculatedTripHours) {
      setError('Round trip membutuhkan return date dan return time yang valid setelah pickup.');
      return;
    }

    try {
      setIsSubmittingBooking(true);
      setError(null);
      const response = await fetch(`${API_BASE_URL}/api/public/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...bookingForm,
          pickupNote: showPickupNoteField ? bookingForm.pickupNote.trim() : '',
          dropoffLocation: normalizedDropoffLocation,
          dropoffNote: showDropoffNoteField ? bookingForm.dropoffNote.trim() : '',
          vehicleId: selectedVehicle.id,
          tripType: bookingForm.tripType,
          serviceType: quoteRequest.serviceType,
          startDate: bookingForm.startDate,
          endDate: bookingForm.tripType === 'ROUND_TRIP' ? bookingForm.endDate : bookingForm.startDate,
          endTime: bookingForm.tripType === 'ROUND_TRIP' ? bookingForm.endTime : undefined,
          hours: quoteRequest.hours,
          additionalHours: quoteRequest.additionalHours,
        }),
      });

      const payload: CreateBookingResponse | { message?: string } = await response.json();
      if (!response.ok) {
        throw new Error(payload.message || `Booking request failed: ${response.status}`);
      }

      const bookingResponse = payload as CreateBookingResponse;
      setBookingResult(bookingResponse);
      setLookupForm({
        reference: bookingResponse.data.reference,
        email: bookingResponse.data.customerEmail,
      });
      setHistoryForm({
        email: bookingResponse.data.customerEmail,
      });
      setHistoryResult((prev) => {
        const existing = (prev?.data || []).filter((item) => item.reference !== bookingResponse.data.reference);
        const nextData = [bookingResponse.data, ...existing];

        return {
          message: prev?.message || 'Booking drafts loaded for this customer email.',
          data: nextData,
          meta: {
            total: nextData.length,
            pendingPayment: nextData.filter((item) => item.status === 'PENDING_PAYMENT').length,
            confirmed: nextData.filter((item) => item.status === 'CONFIRMED').length,
            paymentFailed: nextData.filter((item) => item.status === 'PAYMENT_FAILED').length,
          },
        };
      });
      setLookupResult({
        message: 'Freshly created booking draft is ready to track from this page.',
        data: bookingResponse.data,
        payment: bookingResponse.payment,
      });
      sessionStorage.setItem('zbk_last_booking_confirmation', JSON.stringify(bookingResponse));
      window.location.assign(
        `#/booking/confirmation?reference=${encodeURIComponent(bookingResponse.data.reference)}&email=${encodeURIComponent(bookingResponse.data.customerEmail)}`,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error submitting booking');
      setBookingResult(null);
    } finally {
      setIsSubmittingBooking(false);
    }
  }

  async function lookupBooking(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!lookupForm.reference || !lookupForm.email) {
      setError('Masukkan booking reference dan email untuk melacak draft.');
      return;
    }

    try {
      setIsLookingUpBooking(true);
      setError(null);
      const reference = encodeURIComponent(lookupForm.reference.trim().toUpperCase());
      const email = encodeURIComponent(lookupForm.email.trim());
      const response = await fetch(`${API_BASE_URL}/api/public/bookings/${reference}?email=${email}`);
      const payload: BookingLookupResponse | { message?: string } = await response.json();

      if (!response.ok) {
        throw new Error(payload.message || `Lookup failed: ${response.status}`);
      }

      setLookupResult(payload as BookingLookupResponse);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error looking up booking');
      setLookupResult(null);
    } finally {
      setIsLookingUpBooking(false);
    }
  }

  async function loadBookingHistory(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!historyForm.email) {
      setError('Masukkan email customer untuk memuat daftar booking draft.');
      return;
    }

    try {
      setIsLoadingHistory(true);
      setError(null);
      const email = encodeURIComponent(historyForm.email.trim());
      const response = await fetch(`${API_BASE_URL}/api/public/bookings?email=${email}`);
      const payload: BookingHistoryResponse | { message?: string } = await response.json();

      if (!response.ok) {
        throw new Error(payload.message || `History lookup failed: ${response.status}`);
      }

      setHistoryResult(payload as BookingHistoryResponse);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error loading booking history');
      setHistoryResult(null);
    } finally {
      setIsLoadingHistory(false);
    }
  }

  async function startCheckout(reference: string, email: string) {
    try {
      setIsPreparingCheckoutFor(reference);
      setCheckoutMessage(null);
      setCheckoutMessageFor(null);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/api/public/bookings/${encodeURIComponent(reference)}/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          origin: window.location.origin,
        }),
      });

      const payload: CreateCheckoutSessionResponse | { message?: string } = await response.json();

      if (!response.ok) {
        throw new Error(payload.message || `Checkout initialization failed: ${response.status}`);
      }

      const checkoutPayload = payload as CreateCheckoutSessionResponse;
      setCheckoutMessage(checkoutPayload.message);
      setCheckoutMessageFor(reference);

      if (checkoutPayload.data.checkoutUrl) {
        window.location.assign(checkoutPayload.data.checkoutUrl);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error starting checkout');
    } finally {
      setIsPreparingCheckoutFor(null);
    }
  }

  if (routeState.pathname === '/payment/success' || routeState.pathname === '/payment/cancel') {
    return <PaymentReturnView routeState={routeState} />;
  }

  if (routeState.pathname === '/fleet') {
    return <FleetView />;
  }

  if (routeState.pathname === '/services') {
    return <ServicesView />;
  }

  if (routeState.pathname === '/booking/confirmation') {
    return (
      <BookingConfirmationView
        bookingDemoHref="#/booking-demo"
        bookingWorkspaceHref="#/"
        fleetHref="#/fleet"
        searchParams={routeState.searchParams}
      />
    );
  }

  if (routeState.pathname === '/booking') {
    return (
      <BookingLandingView
        bookingDemoHref="#/booking-demo"
        bookingWorkspaceHref="#/"
        fleetHref="#/fleet"
        searchParams={routeState.searchParams}
        vehicles={vehicles}
      />
    );
  }

  if (routeState.pathname === '/admin') {
    return <AdminDashboardView />;
  }

  if (routeState.pathname === '/booking-demo') {
    return (
      <BookingDemoView
        isLoadingVehicles={isLoadingVehicles}
        vehicleCategories={vehicleCategories}
        vehicles={vehicles}
      />
    );
  }

  if (routeState.pathname === '/how-to-book') {
    return (
      <HowToBookView
        vehicleCount={vehicles.length}
        vehicleCategoryCount={vehicleCategories.length}
        featuredVehicleName={vehicles[0]?.name}
        bookingLandingHref="#/booking"
        bookingWorkspaceHref="#/"
        fleetDemoHref="#/fleet"
      />
    );
  }

  return (
    <main className="page">
      <section className="hero">
        <p className="eyebrow">ZBK Luxury Serverless</p>
        <h1>Public vehicles + booking draft flow sudah bergerak ke Workers.</h1>
        <p>
          UI React ini memakai contract shared untuk membaca katalog, meminta booking quote,
          mengirim booking draft ke backend Hono/Workers, lalu menginisialisasi deposit checkout
          via Workers-safe Stripe session handoff saat secret sudah tersedia. Return page success/cancel kini
          juga masuk ke app React/Vite melalui hash route yang aman untuk static hosting.
        </p>
        <div className="service-pills">
          <a className="secondary-link" href="#/fleet" style={{ minWidth: 0 }}>
            Open public fleet
          </a>
          <a className="secondary-link" href="#/services" style={{ minWidth: 0 }}>
            Services
          </a>
          <a className="secondary-link" href="#/booking" style={{ minWidth: 0 }}>
            Open booking landing
          </a>
          <a className="secondary-link" href="#/booking-demo" style={{ minWidth: 0 }}>
            Open booking demo
          </a>
          <a className="secondary-link" href="#/how-to-book" style={{ minWidth: 0 }}>
            How to book
          </a>
        </div>
      </section>

      <AuthWorkspace />

      {error ? <div className="alert error">{error}</div> : null}

      <section className="card-grid">
        <article className="card card--wide">
          <div className="section-title-row">
            <div>
              <h2>Legacy-inspired vehicle catalog</h2>
              <p className="muted">Kategori dan highlight kendaraan publik sudah ikut dimigrasikan ke Workers seed catalog.</p>
            </div>
            <span className="pill">{isLoadingVehicles ? 'Loading…' : `${vehicles.length} vehicles`}</span>
          </div>

          <div className="catalog-filter-row">
            <div className="service-pills">
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
                  onClick={() => setSelectedCategory(category as (typeof vehicleCategoryOptions)[number])}
                >
                  {category}
                </button>
              ))}
            </div>

            <label className="checkbox-inline">
              <input type="checkbox" checked={luxuryOnly} onChange={(e) => setLuxuryOnly(e.target.checked)} />
              Luxury only
            </label>
          </div>

          <div className="vehicle-grid">
            {vehicles.map((vehicle) => (
              <button
                key={vehicle.id}
                className={`vehicle-card ${vehicle.id === selectedVehicleId ? 'vehicle-card--active' : ''}`}
                onClick={() => {
                  setSelectedVehicleId(vehicle.id);
                  setSelectedVehicleDetail(null);
                  setVehicleDetailError(null);
                  setActiveVehicleImageIndex(0);
                  resetBookingArtifacts();
                }}
                type="button"
              >
                <div className="vehicle-card__header">
                  <div>
                    <strong>{vehicle.name}</strong>
                    <div className="service-pills service-pills--tight">
                      <span className="pill pill--muted">{vehicle.category}</span>
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
                <p className="muted">{vehicle.features.slice(0, 2).join(' • ')}</p>
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
        </article>

        <article className="card vehicle-detail-card">
          <div className="section-title-row">
            <div>
              <h2>Vehicle detail spotlight</h2>
              <p className="muted">
                Selected vehicle detail now comes from the Workers endpoint so the public fleet can grow into deeper pages.
              </p>
            </div>
            <span className={`pill ${isLoadingVehicleDetail ? 'pill--muted' : ''}`}>
              {isLoadingVehicleDetail ? 'Loading detail…' : `${spotlightVehicle?.images?.length || 0} images`}
            </span>
          </div>

          {vehicleDetailError ? <div className="alert error">{vehicleDetailError}</div> : null}

          {spotlightVehicle ? (
            <>
              <div className="vehicle-spotlight">
                <div className="vehicle-spotlight__media">
                  {activeVehicleImage ? (
                    <img
                      alt={`${spotlightVehicle.name} hero image`}
                      className="vehicle-spotlight__image"
                      src={activeVehicleImage}
                    />
                  ) : (
                    <div className="vehicle-spotlight__placeholder">No vehicle image available yet.</div>
                  )}
                  <div className="vehicle-spotlight__meta">
                    <span className="pill">{spotlightVehicle.category}</span>
                    {spotlightVehicle.isLuxury ? <span className="pill">Luxury</span> : null}
                    <span className="pill pill--muted">{spotlightVehicle.status}</span>
                  </div>
                </div>

                <div className="vehicle-spotlight__summary">
                  <p className="vehicle-detail__name">{spotlightVehicle.name}</p>
                  <p className="muted">{selectedVehicleDetail?.message || spotlightVehicle.description}</p>
                  <p className="muted">
                    {selectedVehicleDetail
                      ? `Loaded from ${selectedVehicleDetail.meta.source} • ${selectedVehicleDetail.meta.imageCount} photos`
                      : 'Previewed from the selected catalog card.'}
                  </p>

                  <ul className="detail-list">
                    <li>Model: {spotlightVehicle.model}</li>
                    <li>Location: {spotlightVehicle.location}</li>
                    <li>Capacity: {spotlightVehicle.capacity} pax</li>
                    <li>Luggage: {spotlightVehicle.luggage ?? '-'} bags</li>
                    <li>Transmission: {spotlightVehicle.transmission || '-'}</li>
                    <li>Rating: {spotlightVehicle.rating ? `${spotlightVehicle.rating.toFixed(1)} / 5` : '-'}</li>
                    <li>Featured highlight: {selectedVehicleDetail?.meta.featuredFeature || spotlightVehicle.features[0] || '-'}</li>
                    <li>Airport transfer: ${spotlightVehicle.pricing.airportTransfer}</li>
                    <li>6 hours: ${spotlightVehicle.pricing.sixHours}</li>
                    <li>12 hours: ${spotlightVehicle.pricing.twelveHours}</li>
                    <li>Per hour: ${spotlightVehicle.pricing.perHour}</li>
                  </ul>

                  {spotlightVehicle.features.length ? (
                    <div>
                      <p className="muted">Legacy feature highlights</p>
                      <div className="service-pills">
                        {spotlightVehicle.features.map((feature) => (
                          <span key={feature} className="pill pill--muted">
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  <div className="payment-return-actions">
                    <button
                      className="primary-button primary-button--inline"
                      type="button"
                      onClick={() => document.getElementById('booking-draft-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                    >
                      Book this vehicle
                    </button>
                    {spotlightVehicle.imageUrl ? (
                      <a className="secondary-link" href={spotlightVehicle.imageUrl} target="_blank" rel="noreferrer">
                        Open source image
                      </a>
                    ) : null}
                  </div>
                </div>
              </div>

              {vehicleImages.length > 1 ? (
                <div className="vehicle-spotlight__thumbs" aria-label="Vehicle image gallery">
                  {vehicleImages.map((image, index) => (
                    <button
                      key={`${spotlightVehicle.id}-image-${index}`}
                      className={`vehicle-spotlight__thumb ${index === activeVehicleImageIndex ? 'vehicle-spotlight__thumb--active' : ''}`}
                      type="button"
                      onClick={() => setActiveVehicleImageIndex(index)}
                    >
                      <img alt={`${spotlightVehicle.name} gallery thumbnail ${index + 1}`} src={image} />
                    </button>
                  ))}
                </div>
              ) : null}
            </>
          ) : (
            <p className="muted">Pilih vehicle dulu.</p>
          )}
        </article>

        <article className="card">
          <h2>Booking quote request</h2>
          <div className="quote-facts">
            <div className="quote-facts__row">
              <span className="muted">Trip type</span>
              <strong>{formatTripTypeLabel(bookingForm.tripType)}</strong>
            </div>
            <div className="quote-facts__row">
              <span className="muted">Detected service</span>
              <strong>{formatServiceTypeLabel(quoteRequest.serviceType)}</strong>
            </div>
            <div className="quote-facts__row">
              <span className="muted">Chargeable hours</span>
              <strong>{quoteRequest.hours} hour(s)</strong>
            </div>
            <div className="quote-facts__row">
              <span className="muted">Additional hours</span>
              <strong>{quoteRequest.additionalHours}</strong>
            </div>
          </div>

          <p className="muted quote-helper-text">
            One-way rides otomatis dipetakan ke airport transfer atau trip berdasarkan lokasi pickup/dropoff.
            Round-trip rides otomatis menjadi rental dengan durasi dihitung dari pickup dan return time.
          </p>

          {!selectedVehicleSupportsDerivedService && selectedVehicle ? (
            <div className="alert error quote-inline-alert">
              {selectedVehicle.name} belum mendukung {formatServiceTypeLabel(quoteRequest.serviceType).toLowerCase()}.
              Pilih vehicle lain atau ubah ride details.
            </div>
          ) : null}

          <button
            className="primary-button"
            onClick={requestQuote}
            disabled={!selectedVehicle || !selectedVehicleSupportsDerivedService || isLoadingQuote}
            type="button"
          >
            {isLoadingQuote ? 'Requesting…' : 'Request quote from API'}
          </button>

          {localPreview ? (
            <div className="quote-box">
              <div>
                <strong>Local preview</strong>
                <p className="muted">Shared pricing logic preview di browser.</p>
              </div>
              <div className="quote-box__amount">
                <span>${localPreview.totalAmount.toFixed(2)}</span>
                <small>Deposit ${localPreview.depositAmount.toFixed(2)}</small>
              </div>
            </div>
          ) : null}

          {remoteQuote ? (
            <div className="quote-box quote-box--success">
              <div>
                <strong>API quote ready</strong>
                <p className="muted">
                  {remoteQuote.vehicleName} • {formatServiceTypeLabel(remoteQuote.serviceType)}
                </p>
              </div>
              <div className="quote-box__amount">
                <span>${remoteQuote.totalAmount.toFixed(2)}</span>
                <small>Deposit ${remoteQuote.depositAmount.toFixed(2)}</small>
              </div>
            </div>
          ) : null}
        </article>

        <article className="card card--wide" id="booking-draft-section">
          <div className="section-title-row">
            <div>
              <h2>Booking draft submission</h2>
              <p className="muted">
                Slice ini memigrasikan ride detail logic legacy: one-way vs round-trip, auto service detection, dan auto-calculated rental duration.
              </p>
            </div>
            <span className="pill pill--muted">
              {bookingResult ? bookingResult.data.status : 'Draft not submitted'}
            </span>
          </div>

          <form className="booking-form-grid" onSubmit={submitBooking}>
            <div className="booking-form-grid__full">
              <span className="label-title">Trip type</span>
              <div className="service-pills">
                {tripTypeOptions.map((tripType) => (
                  <button
                    key={tripType}
                    type="button"
                    className={`pill pill-button ${bookingForm.tripType === tripType ? '' : 'pill--muted'}`}
                    onClick={() => updateBookingForm('tripType', tripType)}
                  >
                    {formatTripTypeLabel(tripType)}
                  </button>
                ))}
              </div>
            </div>

            <label>
              Customer name
              <input required value={bookingForm.customerName} onChange={(e) => updateBookingForm('customerName', e.target.value)} />
            </label>
            <label>
              Customer email
              <input
                required
                type="email"
                value={bookingForm.customerEmail}
                onChange={(e) => updateBookingForm('customerEmail', e.target.value)}
              />
            </label>
            <label>
              Customer phone
              <input required value={bookingForm.customerPhone} onChange={(e) => updateBookingForm('customerPhone', e.target.value)} />
            </label>
            <label>
              Pickup date
              <input required type="date" value={bookingForm.startDate} onChange={(e) => updateBookingForm('startDate', e.target.value)} />
            </label>
            <label>
              Pickup time
              <input required type="time" value={bookingForm.pickupTime} onChange={(e) => updateBookingForm('pickupTime', e.target.value)} />
            </label>
            <label>
              Pickup location
              <input required value={bookingForm.pickupLocation} onChange={(e) => updateBookingForm('pickupLocation', e.target.value)} />
            </label>

            {bookingForm.tripType === 'ROUND_TRIP' ? (
              <>
                <label>
                  Return date
                  <input required type="date" value={bookingForm.endDate} onChange={(e) => updateBookingForm('endDate', e.target.value)} />
                </label>
                <label>
                  Return time
                  <input required type="time" value={bookingForm.endTime} onChange={(e) => updateBookingForm('endTime', e.target.value)} />
                </label>
                <div className="trip-summary-panel">
                  <strong>Auto-calculated rental duration</strong>
                  <p className="muted">
                    {calculatedTripHours
                      ? `${calculatedTripHours} hour(s) from pickup to return. Additional billable hours: ${quoteRequest.additionalHours}.`
                      : 'Isi return date dan return time yang valid untuk menghitung durasi rental.'}
                  </p>
                </div>
              </>
            ) : null}

            <label>
              Dropoff location
              <input value={bookingForm.dropoffLocation} onChange={(e) => updateBookingForm('dropoffLocation', e.target.value)} />
            </label>
            {showPickupNoteField ? (
              <label>
                Pickup note
                <input
                  maxLength={160}
                  placeholder="Terminal 3 arrival hall / gate details"
                  value={bookingForm.pickupNote}
                  onChange={(e) => updateBookingForm('pickupNote', e.target.value)}
                />
              </label>
            ) : null}
            {showDropoffNoteField ? (
              <label>
                Dropoff note
                <input
                  maxLength={160}
                  placeholder="Terminal 1 departure hall / gate details"
                  value={bookingForm.dropoffNote}
                  onChange={(e) => updateBookingForm('dropoffNote', e.target.value)}
                />
              </label>
            ) : null}
            <label className="booking-form-grid__full">
              Notes
              <textarea rows={4} value={bookingForm.notes} onChange={(e) => updateBookingForm('notes', e.target.value)} />
            </label>

            <div className="booking-submit-row booking-form-grid__full">
              <div className="muted booking-submit-row__summary">
                <span>Selected vehicle: {selectedVehicle?.name || '—'}</span>
                <span>Trip type: {formatTripTypeLabel(bookingForm.tripType)}</span>
                <span>Service: {formatServiceTypeLabel(quoteRequest.serviceType)}</span>
                <span>
                  Current quote: ${localPreview?.totalAmount.toFixed(2) || '0.00'} / deposit ${localPreview?.depositAmount.toFixed(2) || '0.00'}
                </span>
              </div>
              <button
                className="primary-button primary-button--inline"
                disabled={!selectedVehicle || !selectedVehicleSupportsDerivedService || isSubmittingBooking}
                type="submit"
              >
                {isSubmittingBooking ? 'Submitting…' : 'Submit booking draft'}
              </button>
            </div>
          </form>

          {bookingResult ? (
            <div className="quote-box quote-box--success booking-result">
              <div>
                <strong>{bookingResult.message}</strong>
                <p className="muted">
                  Ref {bookingResult.data.reference} • {bookingResult.data.vehicleName} • {formatTripTypeLabel(bookingResult.data.tripType)}
                </p>
                <p className="muted">
                  {bookingResult.data.startDate}
                  {bookingResult.data.pickupTime ? ` • ${bookingResult.data.pickupTime}` : ''}
                  {bookingResult.data.tripType === 'ROUND_TRIP' && bookingResult.data.endTime
                    ? ` → ${bookingResult.data.endDate} • ${bookingResult.data.endTime}`
                    : ''}
                </p>
                <p className="muted">
                  Pickup {bookingResult.data.pickupLocation}
                  {bookingResult.data.pickupNote ? ` (${bookingResult.data.pickupNote})` : ''}
                  {' → '}
                  {bookingResult.data.dropoffLocation}
                  {bookingResult.data.dropoffNote ? ` (${bookingResult.data.dropoffNote})` : ''}
                </p>
                <p className="muted">
                  Service: {formatServiceTypeLabel(bookingResult.data.serviceType)} • Payment: {bookingResult.payment.status} • Checkout ready:{' '}
                  {bookingResult.payment.checkoutReady ? 'Yes' : 'Not yet'}
                </p>
                <p className="muted">Next: {bookingResult.payment.nextStep}</p>
                {checkoutMessage && checkoutMessageFor === bookingResult.data.reference ? (
                  <p className="muted">Checkout: {checkoutMessage}</p>
                ) : null}
              </div>
              <div className="quote-box__amount">
                <span>${bookingResult.data.totalAmount.toFixed(2)}</span>
                <small>Deposit ${bookingResult.data.depositAmount.toFixed(2)}</small>
                <button
                  className="primary-button"
                  disabled={!bookingResult.payment.checkoutReady || isPreparingCheckoutFor === bookingResult.data.reference}
                  onClick={() => startCheckout(bookingResult.data.reference, bookingResult.data.customerEmail)}
                  type="button"
                >
                  {isPreparingCheckoutFor === bookingResult.data.reference ? 'Preparing checkout…' : 'Open deposit checkout'}
                </button>
              </div>
            </div>
          ) : null}
        </article>

        <article className="card">
          <div className="section-title-row">
            <div>
              <h2>Track booking draft</h2>
              <p className="muted">
                Lookup publik ini memigrasikan status check dasar dari flow legacy agar customer bisa cek draft dengan reference + email.
              </p>
            </div>
            <span className="pill pill--muted">
              {lookupResult ? lookupResult.data.status : 'Lookup ready'}
            </span>
          </div>

          <form className="lookup-form" onSubmit={lookupBooking}>
            <label>
              Booking reference
              <input
                placeholder="BK-20260404-ABCD"
                value={lookupForm.reference}
                onChange={(e) => updateLookupForm('reference', e.target.value.toUpperCase())}
              />
            </label>
            <label>
              Customer email
              <input
                required
                type="email"
                placeholder="name@example.com"
                value={lookupForm.email}
                onChange={(e) => updateLookupForm('email', e.target.value)}
              />
            </label>
            <button className="primary-button primary-button--inline" disabled={isLookingUpBooking} type="submit">
              {isLookingUpBooking ? 'Looking up…' : 'Lookup booking draft'}
            </button>
          </form>

          {lookupResult ? (
            <div className="quote-box quote-box--success booking-result">
              <div>
                <strong>{lookupResult.message}</strong>
                <p className="muted">
                  Ref {lookupResult.data.reference} • {lookupResult.data.customerName} • {lookupResult.data.vehicleName}
                </p>
                <p className="muted">
                  {formatTripTypeLabel(lookupResult.data.tripType)} • {formatServiceTypeLabel(lookupResult.data.serviceType)}
                </p>
                <p className="muted">
                  {lookupResult.data.startDate} {lookupResult.data.pickupTime ? `• ${lookupResult.data.pickupTime}` : ''}
                  {lookupResult.data.tripType === 'ROUND_TRIP' && lookupResult.data.endTime
                    ? ` → ${lookupResult.data.endDate} • ${lookupResult.data.endTime}`
                    : ''}
                </p>
                <p className="muted">
                  Pickup {lookupResult.data.pickupLocation}
                  {lookupResult.data.pickupNote ? ` (${lookupResult.data.pickupNote})` : ''}
                  {lookupResult.data.dropoffLocation ? ` → ${lookupResult.data.dropoffLocation}` : ''}
                  {lookupResult.data.dropoffNote ? ` (${lookupResult.data.dropoffNote})` : ''}
                </p>
                <p className="muted">Payment: {lookupResult.payment.status} • Checkout ready: {lookupResult.payment.checkoutReady ? 'Yes' : 'Not yet'}</p>
                <p className="muted">Next: {lookupResult.payment.nextStep}</p>
                {checkoutMessage && checkoutMessageFor === lookupResult.data.reference ? (
                  <p className="muted">Checkout: {checkoutMessage}</p>
                ) : null}
              </div>
              <div className="quote-box__amount">
                <span>${lookupResult.data.totalAmount.toFixed(2)}</span>
                <small>Deposit ${lookupResult.data.depositAmount.toFixed(2)}</small>
                <button
                  className="primary-button"
                  disabled={!lookupResult.payment.checkoutReady || isPreparingCheckoutFor === lookupResult.data.reference}
                  onClick={() => startCheckout(lookupResult.data.reference, lookupResult.data.customerEmail)}
                  type="button"
                >
                  {isPreparingCheckoutFor === lookupResult.data.reference ? 'Preparing checkout…' : 'Open deposit checkout'}
                </button>
              </div>
            </div>
          ) : (
            <p className="muted lookup-empty">Belum ada hasil lookup. Submit draft di atas atau masukkan reference yang sudah ada.</p>
          )}
        </article>

        <article className="card card--wide">
          <div className="section-title-row">
            <div>
              <h2>Customer booking history snapshot</h2>
              <p className="muted">
                Slice ini memigrasikan tampilan dasar mirip “my bookings” versi publik berbasis email, sebelum auth/session serverless selesai.
              </p>
            </div>
            <span className="pill pill--muted">
              {historyResult ? `${historyResult.meta.total} drafts` : 'History ready'}
            </span>
          </div>

          <form className="lookup-form" onSubmit={loadBookingHistory}>
            <label>
              Customer email
              <input
                required
                type="email"
                placeholder="name@example.com"
                value={historyForm.email}
                onChange={(e) => updateHistoryForm('email', e.target.value)}
              />
            </label>
            <button className="primary-button primary-button--inline" disabled={isLoadingHistory} type="submit">
              {isLoadingHistory ? 'Loading…' : 'Load booking drafts by email'}
            </button>
          </form>

          {historyResult ? (
            <div className="booking-history-stack">
              <div className="quote-box quote-box--success booking-result">
                <div>
                  <strong>{historyResult.message}</strong>
                  <p className="muted">
                    Total drafts: {historyResult.meta.total} • Pending payment: {historyResult.meta.pendingPayment} • Confirmed: {historyResult.meta.confirmed} • Payment failed: {historyResult.meta.paymentFailed}
                  </p>
                </div>
              </div>

              {historyResult.data.length > 0 ? (
                historyResult.data.map((booking) => (
                  <div key={booking.reference} className="quote-box booking-result">
                    <div>
                      <strong>
                        {booking.reference} • {booking.vehicleName}
                      </strong>
                      <p className="muted">
                        {booking.customerName} • {formatTripTypeLabel(booking.tripType)} • {formatServiceTypeLabel(booking.serviceType)}
                      </p>
                      <p className="muted">
                        {booking.startDate}
                        {booking.pickupTime ? ` • ${booking.pickupTime}` : ''}
                        {booking.tripType === 'ROUND_TRIP' && booking.endTime ? ` → ${booking.endDate} • ${booking.endTime}` : ''}
                      </p>
                      <p className="muted">
                        Pickup {booking.pickupLocation}
                        {booking.pickupNote ? ` (${booking.pickupNote})` : ''}
                        {booking.dropoffLocation ? ` → ${booking.dropoffLocation}` : ''}
                        {booking.dropoffNote ? ` (${booking.dropoffNote})` : ''}
                      </p>
                      <p className="muted">Status: {booking.status}</p>
                    </div>
                    <div className="quote-box__amount">
                      <span>${booking.totalAmount.toFixed(2)}</span>
                      <small>Deposit ${booking.depositAmount.toFixed(2)}</small>
                      {booking.status === 'PENDING_PAYMENT' ? (
                        <button
                          className="primary-button primary-button--inline"
                          onClick={() => startCheckout(booking.reference, booking.customerEmail)}
                          type="button"
                        >
                          {isPreparingCheckoutFor === booking.reference ? 'Preparing checkout…' : 'Continue deposit checkout'}
                        </button>
                      ) : null}
                    </div>
                  </div>
                ))
              ) : (
                <p className="muted lookup-empty">Belum ada draft untuk email ini di worker memory scaffold saat ini.</p>
              )}
            </div>
          ) : (
            <p className="muted lookup-empty">Belum ada history yang dimuat. Gunakan email customer untuk melihat semua draft terbaru.</p>
          )}
        </article>
      </section>
    </main>
  );
}
