
import { format, parseISO } from 'date-fns';
import {  X  } from 'lucide-react';
import type { Booking } from '../api/types/booking-response';

interface ManualBookingModalProps {
  isOpen: boolean;
  onClose: (open:any) => void;
  booking : Booking
}


export default function BookingDetailsModal({ isOpen, onClose, booking }: ManualBookingModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto bg-black/50 backdrop-blur-sm p-4 flex items-start justify-center sm:items-center">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md my-auto overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900 pr-8">Booking Details</h2>
          <button onClick={() => onClose(null)} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-3 gap-y-2 gap-x-1 text-sm">
            <div className="text-gray-500">Ref:</div>
            <div className="col-span-2 font-medium">{booking.id.substring(0, 8).toUpperCase()}</div>

            <div className="text-gray-500">Date:</div>
            <div className="col-span-2 font-medium">{format(parseISO(booking.bookingSlots[0].startTime), "EEEE, MMMM d, yyyy")}</div>

            <div className="text-gray-500">Time:</div>
            <div className="col-span-2 font-medium">
              {format(parseISO(booking.bookingSlots[0].startTime), "h:mm a")} -{" "}
              {format(parseISO(booking.bookingSlots[0].endTime), "h:mm a")}
            </div>

            <div className="text-gray-500">Type:</div>
            <div className="col-span-2 font-medium">
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold ${booking.isManualBooking ? "bg-yellow-100 text-yellow-700" : "bg-green-100 text-green-800"}`}
              >
                {booking.isManualBooking ? "Manual Booking" : "Web Booking"}
              </span>
            </div>

            <div className="text-gray-500">Customer:</div>
            <div className="col-span-2 font-medium">
              {booking.isManualBooking
                ? booking.customerName || "N/A"
                : `${booking.bookingDetails?.customerFirstName} ${booking.bookingDetails?.customerLastName}`}
            </div>

            {!booking.isManualBooking && (
              <>
                <div className="text-gray-500">Phone:</div>
                <div className="col-span-2 font-medium">{booking.bookingDetails?.customerPhone}</div>
              </>
            )}

            <div className="text-gray-500">Package:</div>
            <div className="col-span-2 font-medium">{booking?.package}</div>

            <div className="text-gray-500">Suburb:</div>
            <div className="col-span-2 font-medium">{booking.suburb?.name}</div>

            {!booking.isManualBooking && booking.bookingDetails?.pickupAddress && (
              <>
                <div className="text-gray-500">Pickup:</div>
                <div className="col-span-2 font-medium">{booking.bookingDetails?.pickupAddress}</div>
              </>
            )}

            {(booking.isManualBooking ? booking?.note : booking.bookingDetails?.notes) && (
              <>
                <div className="text-gray-500">Notes:</div>
                <div className="col-span-2 font-medium italic text-gray-600">
                  {booking.isManualBooking ? booking.note : booking.bookingDetails?.notes}
                </div>
              </>
            )}

            {!booking.isManualBooking && (
              <>
                <div className="text-gray-500">Self Booking:</div>
                <div className="col-span-2 font-medium">{booking.bookingDetails?.isSelfBooking ? "Yes" : "No"}</div>
              </>
            )}
          </div>

          {!booking.isManualBooking && !booking.bookingDetails?.isSelfBooking && (
            <div className="pt-3 border-t">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Contact Person Details</h3>
              <div className="grid grid-cols-3 gap-y-2 gap-x-1 text-sm">
                <div className="text-gray-500">Name:</div>
                <div className="col-span-2 font-medium">
                  {booking.bookingDetails?.contactPersonFirstName} {booking.bookingDetails?.contactPersonLastName}
                </div>

                <div className="text-gray-500">Phone:</div>
                <div className="col-span-2 font-medium">{booking.bookingDetails?.contactPersonPhone}</div>

                <div className="text-gray-500">Relation:</div>
                <div className="col-span-2 font-medium">{booking.bookingDetails?.relation}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
