import { useState, useMemo } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
  addDays,
  subDays,
  parseISO,
  startOfDay,
  endOfDay
} from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, X, AlertCircle, Edit } from 'lucide-react';
import { toast } from 'sonner';
import Spinner from '../components/Spinner';
import ConfirmationModal from '../components/ConfirmationModal';
import { fetchInstructorBookings, cancelBooking } from '../api/booking-api';
import { fetchPackages } from '../api/package-api';
import ManualBookingModal from '../components/ManualBookingModal';

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

interface BookingsResponse {
  data: Booking[];
  total: number;
}

type ViewType = 'Day' | 'Week' | 'Month';

// Time grid constants (6 AM to 10 PM)
const START_HOUR = 6;
const END_HOUR = 22;
const HOURS_IN_GRID = END_HOUR - START_HOUR;
// Pixels per hour for the time grid
const PIXELS_PER_HOUR = 60;

export default function InstructorBookingsPage() {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<ViewType>('Week');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [startTime, setStartTime] = useState<string>('09:00');
  const [endTime, setEndTime] = useState<string>('10:00');
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);

  // Booking Details Modal State
  const [selectedBookingForDetails, setSelectedBookingForDetails] = useState<Booking | null>(null);

  // Cancellation Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [bookingToDelete, setBookingToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Calculate fetch bounds based on the current view
  const { startDateStr, endDateStr } = useMemo(() => {
    let start, end;
    if (view === 'Month') {
      start = startOfMonth(currentDate);
      end = endOfMonth(currentDate);
    } else if (view === 'Week') {
      start = startOfWeek(currentDate, { weekStartsOn: 1 });
      end = endOfWeek(currentDate, { weekStartsOn: 1 });
    } else { // Day
      start = startOfDay(currentDate);
      end = endOfDay(currentDate);
    }
    return {
      startDateStr: format(start, 'yyyy-MM-dd'),
      endDateStr: format(end, 'yyyy-MM-dd')
    };
  }, [currentDate, view]);

  const {
    data: bookingData,
    isLoading,
    isError,
    refetch,
  } = useQuery<BookingsResponse>({
    queryKey: ['instructor-bookings', startDateStr, endDateStr, view],
    queryFn: () => fetchInstructorBookings(1, 1000, startDateStr, endDateStr),
    placeholderData: keepPreviousData,
    enabled: !!user,
  });

  const { data: packages = [] } = useQuery({
    queryKey: ['packages'],
    queryFn: fetchPackages,
  });

  const bookings = bookingData?.data || [];

  const handlePrev = () => {
    if (view === 'Month') setCurrentDate(subMonths(currentDate, 1));
    else if (view === 'Week') setCurrentDate(subWeeks(currentDate, 1));
    else setCurrentDate(subDays(currentDate, 1));
  };

  const handleNext = () => {
    if (view === 'Month') setCurrentDate(addMonths(currentDate, 1));
    else if (view === 'Week') setCurrentDate(addWeeks(currentDate, 1));
    else setCurrentDate(addDays(currentDate, 1));
  };

  const handleToday = () => setCurrentDate(new Date());

  // Generate calendar grid for Month View
  const daysInGrid = useMemo(() => {
    if (view === 'Month') {
      const start = startOfWeek(startOfMonth(currentDate), { weekStartsOn: 1 });
      const end = endOfWeek(endOfMonth(currentDate), { weekStartsOn: 1 });
      return eachDayOfInterval({ start, end });
    } else if (view === 'Week') {
      const start = startOfWeek(currentDate, { weekStartsOn: 1 });
      const end = endOfWeek(currentDate, { weekStartsOn: 1 });
      return eachDayOfInterval({ start, end });
    } else {
      return [currentDate];
    }
  }, [currentDate, view]);

  const getSlotsForDay = (day: Date) => {
    return bookings
      .filter(b => b.status === 'CONFIRMED')
      .flatMap(booking =>
        booking.bookingSlots
          .filter(slot => isSameDay(parseISO(slot.startTime), day))
          .map(slot => ({ booking, slot }))
      );
  };

  const getStatusColor = (booking: Booking) => {
    if (booking.isManualBooking) {
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
    return 'bg-green-100 text-green-800 border-green-200';
  };

  const calculateBlockStyles = (startTimeISO: string, endTimeISO: string) => {
    const start = parseISO(startTimeISO);
    const end = parseISO(endTimeISO);

    const startHourNum = start.getHours() + (start.getMinutes() / 60);
    const endHourNum = end.getHours() + (end.getMinutes() / 60);

    if (endHourNum <= START_HOUR || startHourNum >= END_HOUR) {
      return { display: 'none' };
    }

    const clampedStartHour = Math.max(startHourNum, START_HOUR);
    const clampedEndHour = Math.min(endHourNum, END_HOUR);

    const topOffset = (clampedStartHour - START_HOUR) * PIXELS_PER_HOUR;
    const durationMinutes = (clampedEndHour - clampedStartHour) * 60;
    const height = (durationMinutes / 60) * PIXELS_PER_HOUR;

    return {
      top: `${topOffset}px`,
      height: `${height}px`,
      position: 'absolute' as const,
      left: '4px',
      right: '4px',
      zIndex: 10,
    };
  };

  const handleGridClick = (day: Date, hour: number) => {
    const slotTime = new Date(day);
    slotTime.setHours(hour, 0, 0, 0);
    if (slotTime < new Date()) {
      return; // Return early if slot is in the past
    }

    setSelectedDate(day);
    setStartTime(`${hour.toString().padStart(2, '0')}:00`);
    setEndTime(`${(hour + 1).toString().padStart(2, '0')}:00`);
    setEditingBooking(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (booking: Booking) => {
    const start = parseISO(booking.bookingSlots[0].startTime);
    if (start < new Date()) {
      toast.error('Cannot edit past bookings.');
      return;
    }
    setEditingBooking(booking);
    setIsModalOpen(true);
  };

  const handleDeleteManualBooking = async () => {
    if (!bookingToDelete) return;
    setIsDeleting(true);

    try {
      await cancelBooking(bookingToDelete);
      toast.success('Manual booking cancelled successfully.');
      setIsDeleteModalOpen(false);
      setBookingToDelete(null);
      refetch();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to cancel manual booking.');
    } finally {
      setIsDeleting(false);
    }
  };

  if (isError) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-red-50 border border-red-100 rounded-xl p-8 max-w-md w-full shadow-sm flex flex-col items-center">
          <div className="flex justify-center mb-4 bg-red-100 p-3 rounded-full">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="text-lg font-semibold text-red-800 mb-2">Failed to Load Bookings</h3>
          <p className="text-red-600 text-sm">Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <main className="w-full flex flex-col h-[calc(100vh-120px)] md:h-[calc(100vh-80px)] overflow-hidden">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 px-1 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <CalendarIcon className="w-6 h-6 text-primary" />
            Schedule
          </h1>
          <p className="text-sm text-gray-500 mt-1 hidden md:block">Manage your driving lessons and availability</p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
          {/* View Toggle */}
          <div className="flex bg-gray-100 p-1 rounded-lg border border-gray-200">
            {(["Day", "Week", "Month"] as ViewType[]).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`flex-1 sm:flex-none px-4 py-1.5 text-sm font-medium transition-all rounded-md ${view === v ? "bg-white text-primary shadow-sm ring-1 ring-gray-900/5" : "text-gray-600 hover:text-gray-900 hover:bg-gray-200/50"
                  }`}
              >
                {v}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-2 bg-white p-1 rounded-lg border shadow-sm">
            <button onClick={handleToday} className="px-4 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md transition-colors">
              Today
            </button>
            <div className="flex items-center space-x-1 border-l pl-2">
              <button onClick={handlePrev} className="p-1.5 hover:bg-gray-100 rounded-md transition-colors text-gray-600" aria-label="Previous">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <h2 className="text-sm font-semibold text-gray-800 min-w-[140px] text-center select-none">
                {view === "Month" && format(currentDate, "MMMM yyyy")}
                {view === "Week" && `${format(daysInGrid[0], "MMM d")} - ${format(daysInGrid[6], "MMM d, yyyy")}`}
                {view === "Day" && format(currentDate, "EEEE, MMM d, yyyy")}
              </h2>
              <button onClick={handleNext} className="p-1.5 hover:bg-gray-100 rounded-md transition-colors text-gray-600" aria-label="Next">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <Spinner text="Loading calendar..." />
        </div>
      ) : (
        <div className="flex-1 bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col relative min-h-0">
          {/* MONTH VIEW */}
          {view === "Month" && (
            <>
              <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50/80 shrink-0">
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                  <div key={day} className="py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {day}
                  </div>
                ))}
              </div>
              <div className="flex-1 grid grid-cols-7 auto-rows-fr relative overflow-y-auto">
                {daysInGrid.map((day, idx) => {
                  const isCurrentMonth = isSameMonth(day, currentDate);
                  const isToday = isSameDay(day, new Date());
                  const daySlots = getSlotsForDay(day);

                  return (
                    <div
                      key={day.toISOString()}
                      className={`
                        min-h-[120px] border-b border-r border-gray-100 p-2 transition-colors flex flex-col
                        ${!isCurrentMonth ? "bg-gray-50/50" : "bg-white hover:bg-gray-50/30"}
                        ${idx % 7 === 6 ? "border-r-0" : ""}
                      `}
                    >
                      <div className="flex justify-between items-start mb-2 shrink-0">
                        <span
                          className={`
                          text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full
                          ${isToday ? "bg-primary text-white shadow-sm ring-2 ring-primary/20" : isCurrentMonth ? "text-gray-700" : "text-gray-400"}
                        `}
                        >
                          {format(day, "d")}
                        </span>
                        {daySlots.length > 0 && (
                          <span className="text-[10px] font-medium text-gray-500 bg-gray-100 border px-1.5 py-0.5 rounded-full">{daySlots.length}</span>
                        )}
                      </div>

                      <div className="space-y-1.5 overflow-y-auto overflow-x-hidden flex-1 min-h-0 scrollbar-thin scrollbar-thumb-gray-200 pr-1.5 pl-0.5 pb-1">
                        {daySlots.map(({ booking, slot }) => (
                          <div
                            key={booking.id + slot.startTime}
                            className={`text-xs px-2 py-1.5 rounded border shadow-sm flex flex-col gap-0.5 relative group mr-[1px]
                              ${getStatusColor(booking)} cursor-pointer hover:shadow transition-shadow`}
                            title={`${booking.package || "Manual Lock"} - ${booking.isManualBooking ? "Instructor booked" : booking.suburb?.name}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedBookingForDetails(booking);
                            }}
                          >
                            {booking.isManualBooking ? (
                              <>
                                <div className="flex justify-between items-start font-semibold">
                                  <span>{format(parseISO(slot.startTime), "h:mm a")}</span>
                                </div>
                                <div className="truncate opacity-90 font-medium">{booking.note || "Manual Booking"}</div>
                                {parseISO(slot.startTime) > new Date() && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleEditClick(booking);
                                    }}
                                    className="absolute bottom-1 right-1 text-yellow-600 hover:text-blue-600 transition-colors p-0.5 rounded hover:bg-yellow-200/50 hidden group-hover:block bg-yellow-100/90 shadow-sm z-30"
                                  >
                                    <Edit className="w-3 h-3" />
                                  </button>
                                )}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setBookingToDelete(booking.id);
                                    setIsDeleteModalOpen(true);
                                  }}
                                  className="absolute top-1 right-1 text-yellow-600 hover:text-red-600 transition-colors p-0.5 rounded hover:bg-yellow-200/50 hidden group-hover:block bg-yellow-100/90 shadow-sm z-30"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </>
                            ) : (
                              <>
                                <div className="flex items-center justify-between font-semibold pr-1">
                                  <span>{format(parseISO(slot.startTime), "h:mm a")}</span>
                                  <span className="truncate max-w-[50px] ml-1 opacity-70 font-normal">{booking.transmission?.substring(0, 4)}</span>
                                </div>
                                <div className="truncate opacity-90 font-medium">{booking.package || "Lesson"}</div>
                                {booking.suburb && <div className="truncate text-[10px] opacity-75">{booking.suburb.name}</div>}
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* DAY & WEEK VIEW */}
          {(view === "Day" || view === "Week") && (
            <div className="flex flex-col h-full overflow-hidden">
              {/* Header Row */}
              <div className="flex border-b border-gray-200 bg-gray-50/80 shrink-0 pr-[14px]">
                {/* Time Gutter Header */}
                <div className="w-16 border-r border-gray-200 shrink-0 flex items-center justify-center">
                  <Clock className="w-4 h-4 text-gray-400" />
                </div>
                {/* Days Headers */}
                <div className={`flex-1 grid ${view === "Week" ? "grid-cols-7" : "grid-cols-1"}`}>
                  {daysInGrid.map((day, idx) => {
                    const isToday = isSameDay(day, new Date());
                    return (
                      <div key={day.toISOString()} className={`py-3 text-center border-gray-200 ${idx !== 0 ? "border-l" : ""}`}>
                        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">{format(day, "EEE")}</div>
                        <div
                          className={`
                              inline-flex items-center justify-center w-8 h-8 rounded-full text-lg font-medium
                              ${isToday ? "bg-primary text-white shadow-sm ring-2 ring-primary/20" : "text-gray-900"}
                          `}
                        >
                          {format(day, "d")}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Scrollable Time Grid */}
              <div className="flex-1 overflow-y-auto overflow-x-hidden relative scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-50">
                <div className="flex min-h-full" style={{ height: `${HOURS_IN_GRID * PIXELS_PER_HOUR}px` }}>
                  {/* Time Gutter Columns */}
                  <div className="w-16 border-r border-gray-200 bg-white shrink-0 relative">
                    {Array.from({ length: HOURS_IN_GRID }).map((_, i) => (
                      <div
                        key={i}
                        className="absolute w-full text-right pr-2 text-xs text-gray-400 font-medium"
                        style={{ top: `${i * PIXELS_PER_HOUR - 8}px` }}
                      >
                        {format(new Date().setHours(START_HOUR + i, 0, 0, 0), "h a")}
                      </div>
                    ))}
                  </div>

                  {/* Days/Grid Content */}
                  <div className={`flex-1 grid ${view === "Week" ? "grid-cols-7" : "grid-cols-1"} relative`}>
                    {/* Horizontal Grid Lines */}
                    <div className="absolute inset-0 pointer-events-none">
                      {Array.from({ length: HOURS_IN_GRID }).map((_, i) => (
                        <div key={i} className="border-b border-gray-100 w-full" style={{ height: `${PIXELS_PER_HOUR}px` }} />
                      ))}
                    </div>

                    {/* Day Columns (Grid Interactions & Events) */}
                    {daysInGrid.map((day, idx) => {
                      const daySlots = getSlotsForDay(day);

                      return (
                        <div key={day.toISOString()} className={`relative border-gray-100 ${idx !== 0 ? "border-l" : ""}`}>
                          {/* Clickable Empty Slots */}
                          {Array.from({ length: HOURS_IN_GRID }).map((_, hourIdx) => {
                            const slotTime = new Date(day);
                            slotTime.setHours(START_HOUR + hourIdx, 0, 0, 0);
                            const isPastSlot = slotTime < new Date();

                            return (
                              <div
                                key={`empty-${hourIdx}`}
                                className={`w-full absolute ${isPastSlot ? "cursor-not-allowed bg-gray-50/40" : "cursor-pointer hover:bg-primary/5 transition-colors"}`}
                                style={{
                                  top: `${hourIdx * PIXELS_PER_HOUR}px`,
                                  height: `${PIXELS_PER_HOUR}px`,
                                  zIndex: 1, // Underneath actual bookings
                                }}
                                onClick={() => {
                                  if (!isPastSlot) handleGridClick(day, START_HOUR + hourIdx);
                                }}
                              />
                            );
                          })}

                          {/* Actual Bookings */}
                          {daySlots.map(({ booking, slot }) => {
                            const styles = calculateBlockStyles(slot.startTime, slot.endTime);

                            return (
                              <div
                                key={booking.id + slot.startTime}
                                className={`rounded-md border flex flex-col overflow-hidden shadow-sm hover:shadow-md transition-shadow group relative
                                      ${getStatusColor(booking)} cursor-pointer ${booking.isManualBooking ? 'p-1' : 'p-2'}`}
                                style={styles}
                                title={`${booking.isManualBooking
                                  ? `${booking.customerName} - ${booking.note}` || "Manual Booking"
                                  : `${booking?.bookingDetails?.customerFirstName} - ${booking?.bookingDetails?.notes}`
                                  }`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedBookingForDetails(booking);
                                }}
                              >
                                <div className="text-xs font-semibold flex justify-between items-start mb-0.5">
                                  <span className="truncate pr-4">
                                    {format(parseISO(slot.startTime), "h:mm")} - {format(parseISO(slot.endTime), "h:mm a")}
                                  </span>
                                </div>
                                {booking.isManualBooking ? (
                                  <>
                                    <div className="text-[10px] sm:text-xs font-medium truncate leading-tight group-hover:whitespace-normal group-hover:z-20 transition-all pr-4">
                                      {booking.note || "Manual Booking"}
                                    </div>
                                    <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity z-30">
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setBookingToDelete(booking.id);
                                          setIsDeleteModalOpen(true);
                                        }}
                                        className="text-yellow-600 hover:text-red-600 transition-colors bg-yellow-100/90 p-0.5 rounded shadow-sm"
                                      >
                                        <X className="w-3 h-3" />
                                      </button>
                                    </div>
                                    {parseISO(slot.startTime) > new Date() && (
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleEditClick(booking);
                                        }}
                                        className="absolute bottom-1 right-1 text-yellow-600 hover:text-blue-600 transition-colors bg-yellow-100/90 p-0.5 rounded shadow-sm opacity-0 group-hover:opacity-100 z-30 transform transition-all hover:scale-110"
                                      >
                                        <Edit className="w-3.5 h-3.5" />
                                      </button>
                                    )}
                                  </>
                                ) : (
                                  <>
                                    <div className="text-xs font-medium truncate leading-tight group-hover:whitespace-normal group-hover:z-20 transition-all">
                                      {booking.package || "Lesson"}
                                    </div>
                                    {booking.suburb && (
                                      <div className="text-[10px] opacity-75 truncate mt-auto hidden sm:block">
                                        {booking.suburb.name} • {booking.transmission?.substring(0, 4)}
                                      </div>
                                    )}
                                  </>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Manual Booking Modal */}
      <ManualBookingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          setIsModalOpen(false);
          refetch();
        }}
        selectedDate={selectedDate}
        initialStartTime={startTime}
        initialEndTime={endTime}
        editingBooking={editingBooking}
        packages={packages}
      />

      {/* Booking Details Modal */}
      {selectedBookingForDetails && (
        <div className="fixed inset-0 z-[100] overflow-y-auto bg-black/50 backdrop-blur-sm p-4 flex items-start justify-center sm:items-center">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md my-auto overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold text-gray-900 pr-8">Booking Details</h2>
              <button onClick={() => setSelectedBookingForDetails(null)} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-3 gap-y-2 gap-x-1 text-sm">
                <div className="text-gray-500">Ref:</div>
                <div className="col-span-2 font-medium">{selectedBookingForDetails.id.substring(0, 8).toUpperCase()}</div>

                <div className="text-gray-500">Date:</div>
                <div className="col-span-2 font-medium">
                  {format(parseISO(selectedBookingForDetails.bookingSlots[0].startTime), 'EEEE, MMMM d, yyyy')}
                </div>

                <div className="text-gray-500">Time:</div>
                <div className="col-span-2 font-medium">
                  {format(parseISO(selectedBookingForDetails.bookingSlots[0].startTime), 'h:mm a')} - {format(parseISO(selectedBookingForDetails.bookingSlots[0].endTime), 'h:mm a')}
                </div>

                <div className="text-gray-500">Type:</div>
                <div className="col-span-2 font-medium">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold ${selectedBookingForDetails.isManualBooking ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-800'}`}>
                    {selectedBookingForDetails.isManualBooking ? 'Manual Booking' : 'Web Booking'}
                  </span>
                </div>

                <div className="text-gray-500">Customer:</div>
                <div className="col-span-2 font-medium">
                  {selectedBookingForDetails.isManualBooking
                    ? selectedBookingForDetails.customerName || "N/A"
                    : `${selectedBookingForDetails.bookingDetails?.customerFirstName} ${selectedBookingForDetails.bookingDetails?.customerLastName}`}
                </div>

                {!selectedBookingForDetails.isManualBooking && (
                  <>
                    <div className="text-gray-500">Phone:</div>
                    <div className="col-span-2 font-medium">{selectedBookingForDetails.bookingDetails?.customerPhone}</div>
                  </>
                )}

                <div className="text-gray-500">Package:</div>
                <div className="col-span-2 font-medium">{selectedBookingForDetails.package}</div>

                <div className="text-gray-500">Suburb:</div>
                <div className="col-span-2 font-medium">{selectedBookingForDetails.suburb?.name}</div>

                {(!selectedBookingForDetails.isManualBooking && selectedBookingForDetails.bookingDetails?.pickupAddress) && (
                  <>
                    <div className="text-gray-500">Pickup:</div>
                    <div className="col-span-2 font-medium">{selectedBookingForDetails.bookingDetails?.pickupAddress}</div>
                  </>
                )}

                {(selectedBookingForDetails.isManualBooking ? selectedBookingForDetails.note : selectedBookingForDetails.bookingDetails?.notes) && (
                  <>
                    <div className="text-gray-500">Notes:</div>
                    <div className="col-span-2 font-medium italic text-gray-600">
                      {selectedBookingForDetails.isManualBooking ? selectedBookingForDetails.note : selectedBookingForDetails.bookingDetails?.notes}
                    </div>
                  </>
                )}

                {!selectedBookingForDetails.isManualBooking && (
                  <>
                    <div className="text-gray-500">Self Booking:</div>
                    <div className="col-span-2 font-medium">{selectedBookingForDetails.bookingDetails?.isSelfBooking ? "Yes" : "No"}</div>
                  </>
                )}
              </div>

              {!selectedBookingForDetails.isManualBooking && !selectedBookingForDetails.bookingDetails?.isSelfBooking && (
                <div className="pt-3 border-t">
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">Contact Person Details</h3>
                  <div className="grid grid-cols-3 gap-y-2 gap-x-1 text-sm">
                    <div className="text-gray-500">Name:</div>
                    <div className="col-span-2 font-medium">
                      {selectedBookingForDetails.bookingDetails?.contactPersonFirstName} {selectedBookingForDetails.bookingDetails?.contactPersonLastName}
                    </div>

                    <div className="text-gray-500">Phone:</div>
                    <div className="col-span-2 font-medium">{selectedBookingForDetails.bookingDetails?.contactPersonPhone}</div>

                    <div className="text-gray-500">Relation:</div>
                    <div className="col-span-2 font-medium">{selectedBookingForDetails.bookingDetails?.relation}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setBookingToDelete(null);
        }}
        onConfirm={handleDeleteManualBooking}
        isConfirming={isDeleting}
        title="Delete Booking"
        message="Are you sure you want to delete this manual booking?"
        confirmText="Delete"
        cancelText="Close"
        variant="danger"
      />
    </main>
  );
}
