export type LegacyBookingData = {
  tripType?: string;
  pickupDate?: string;
  pickupTime?: string;
  returnDate?: string;
  returnTime?: string;
  pickupLocation?: string;
  dropOffLocation?: string;
  dropoffLocation?: string;
  vehicleId?: string;
  selectedVehicleId?: string;
  hours?: string | number;
};

export function parseLegacyBookingData(raw: string | null): LegacyBookingData | null {
  if (!raw) return null;

  try {
    return JSON.parse(decodeURIComponent(raw)) as LegacyBookingData;
  } catch {
    return null;
  }
}

export function getLegacyBookingVehicleId(searchParams: URLSearchParams): string {
  const bookingData = parseLegacyBookingData(searchParams.get('bookingData'));
  return searchParams.get('vehicleId') || bookingData?.vehicleId || bookingData?.selectedVehicleId || '';
}

export function buildLegacyBookingWorkspaceHref(
  baseHref: string,
  bookingData: LegacyBookingData | null,
  vehicleId: string,
): string {
  const params = new URLSearchParams();

  if (vehicleId) {
    params.set('vehicleId', vehicleId);
  }

  if (bookingData) {
    params.set('bookingData', encodeURIComponent(JSON.stringify(bookingData)));
  }

  const query = params.toString();
  if (!query) {
    return baseHref;
  }

  return `${baseHref}${baseHref.includes('?') ? '&' : '?'}${query}`;
}
