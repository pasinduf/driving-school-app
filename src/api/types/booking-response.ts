export interface BookingSlot {
  startTime: string;
  endTime: string;
}

export interface Booking {
  id: string;
  testingCenter: string | null;
  suburb: { id: string; name: string; stateCode: string; postalcode: string };
  package: string;
  transmission: string;
  createdAt: string;
  status: string;
  price: string;
  bookingSlots: BookingSlot[];
  isManualBooking?: boolean;
  note?: string;
  instructor?: string | null;
  customerName?: string;
  suburbId?: number | null;
  bookingDetails?: {
    pickupAddress?: string;
    isSelfBooking?: boolean;
    customerFirstName?: string;
    customerLastName?: string;
    customerPhone?: string;
    customerEmail?: string;
    contactPersonFirstName?: string;
    contactPersonLastName?: string;
    contactPersonEmail?: string;
    contactPersonPhone?: string;
    relation?: string;
    notes?: string;
  };
}

export interface BookingsResponse {
  data: Booking[];
  total: number;
}