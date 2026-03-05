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
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, X } from 'lucide-react';
import { toast } from 'sonner';
import Spinner from '../components/Spinner';
import { fetchInstructorBookings, createManualBooking } from '../api/client';

interface BookingSlot {
  startTime: string;
  endTime: string;
}

interface Booking {
  id: string;
  testingCenter: string | null;
  suburb: { name: string; postalcode: string };
  package: string;
  transmission: string;
  createdAt: string;
  status: string;
  price: string;
  bookingSlots: BookingSlot[];
  isManualBooking?: boolean;
  note?: string;
}

interface BookingsResponse {
  data: Booking[];
  total: number;
}

type ViewType = 'Day' | 'Week' | 'Month';

// Time grid constants (6 AM to 9 PM)
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
  const [selectedTime, setSelectedTime] = useState<number | null>(null);
  const [duration, setDuration] = useState(60);
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    return bookings.flatMap(booking =>
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

  // Helper to calculate absolute positioning for time blocks
  const calculateBlockStyles = (startTimeISO: string, endTimeISO: string) => {
    const start = parseISO(startTimeISO);
    const end = parseISO(endTimeISO);

    // Bounds check
    const startHourNum = start.getHours() + (start.getMinutes() / 60);
    const endHourNum = end.getHours() + (end.getMinutes() / 60);

    // If perfectly out of bounds, hide it (rare if we only accept bookings in business hours)
    if (endHourNum <= START_HOUR || startHourNum >= END_HOUR) {
      return { display: 'none' };
    }

    // Clamp values to visible grid
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
    if (day < startOfDay(new Date())) return; // Prevent past bookings if needed
    setSelectedDate(day);
    setSelectedTime(hour);
    setIsModalOpen(true);
  };

  const submitManualBooking = async () => {
    if (!selectedDate || selectedTime === null) return;
    setIsSubmitting(true);
    try {
      const timeStr = `${selectedTime.toString().padStart(2, '0')}:00`;
      const dateStr = format(selectedDate, 'yyyy-MM-dd');

      await createManualBooking({
        date: dateStr,
        time: timeStr,
        duration,
        note
      });

      toast.success('Manual booking added successfully.');
      setIsModalOpen(false);
      setNote('');
      setDuration(60);
      refetch(); // Reload calendar
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create manual booking.');
    } finally {
      setIsSubmitting(false);
    }
  };


  if (isError) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-red-500 font-medium bg-red-50 px-6 py-4 rounded-lg flex items-center space-x-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span>Failed to load bookings. Please try again later.</span>
        </div>
      </div>
    );
  }

  return (
    <main className="w-full flex flex-col h-[calc(100vh-[120px])] md:h-[calc(100vh-80px)] overflow-hidden">
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
            {(['Day', 'Week', 'Month'] as ViewType[]).map(v => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`flex-1 sm:flex-none px-4 py-1.5 text-sm font-medium transition-all rounded-md ${view === v
                  ? 'bg-white text-primary shadow-sm ring-1 ring-gray-900/5'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/50'
                  }`}
              >
                {v}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-2 bg-white p-1 rounded-lg border shadow-sm">
            <button
              onClick={handleToday}
              className="px-4 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
            >
              Today
            </button>
            <div className="flex items-center space-x-1 border-l pl-2">
              <button
                onClick={handlePrev}
                className="p-1.5 hover:bg-gray-100 rounded-md transition-colors text-gray-600"
                aria-label="Previous"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <h2 className="text-sm font-semibold text-gray-800 min-w-[140px] text-center select-none">
                {view === 'Month' && format(currentDate, 'MMMM yyyy')}
                {view === 'Week' && `${format(daysInGrid[0], 'MMM d')} - ${format(daysInGrid[6], 'MMM d, yyyy')}`}
                {view === 'Day' && format(currentDate, 'EEEE, MMM d, yyyy')}
              </h2>
              <button
                onClick={handleNext}
                className="p-1.5 hover:bg-gray-100 rounded-md transition-colors text-gray-600"
                aria-label="Next"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col relative min-h-0">
        {isLoading && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-50 flex items-center justify-center">
            <Spinner size="lg" text="Loading calendar..." />
          </div>
        )}

        {/* 
          =============================================
          MONTH VIEW 
          =============================================
        */}
        {view === 'Month' && (
          <>
            <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50/80 shrink-0">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
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
                      ${!isCurrentMonth ? 'bg-gray-50/50' : 'bg-white hover:bg-gray-50/30'}
                      ${idx % 7 === 6 ? 'border-r-0' : ''}
                    `}
                  >
                    <div className="flex justify-between items-start mb-2 shrink-0">
                      <span className={`
                        text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full
                        ${isToday ? 'bg-primary text-white shadow-sm ring-2 ring-primary/20' :
                          isCurrentMonth ? 'text-gray-700' : 'text-gray-400'}
                      `}>
                        {format(day, 'd')}
                      </span>
                      {daySlots.length > 0 && (
                        <span className="text-[10px] font-medium text-gray-500 bg-gray-100 border px-1.5 py-0.5 rounded-full">
                          {daySlots.length}
                        </span>
                      )}
                    </div>

                    <div className="space-y-1.5 overflow-y-auto flex-1 min-h-0 scrollbar-thin scrollbar-thumb-gray-200 pr-1">
                      {daySlots.map(({ booking, slot }) => (
                        <div
                          key={booking.id + slot.startTime}
                          className={`text-xs px-2 py-1.5 rounded border shadow-sm flex flex-col gap-0.5 
                            ${getStatusColor(booking)} cursor-default hover:shadow transition-shadow`}
                          title={`${booking.package || 'Manual Lock'} - ${booking.isManualBooking ? 'Instructor booked' : booking.suburb?.name}`}
                        >
                          {booking.isManualBooking ? (
                            <>
                              <div className="font-semibold">{format(parseISO(slot.startTime), 'h:mm a')}</div>
                              <div className="truncate opacity-90 font-medium">{booking.note || 'Manual Booking'}</div>
                            </>
                          ) : (
                            <>
                              <div className="flex items-center justify-between font-semibold">
                                <span>{format(parseISO(slot.startTime), 'h:mm a')}</span>
                                <span className="truncate max-w-[50px] ml-1 opacity-70 font-normal">{booking.transmission?.substring(0, 4)}</span>
                              </div>
                              <div className="truncate opacity-90 font-medium">{booking.package || 'Lesson'}</div>
                              {booking.suburb && (
                                <div className="truncate text-[10px] opacity-75">{booking.suburb.name}</div>
                              )}
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

        {/* 
          =============================================
          DAY & WEEK VIEW
          =============================================
        */}
        {(view === 'Day' || view === 'Week') && (
          <div className="flex flex-col h-full overflow-hidden">
            {/* Header Row */}
            <div className="flex border-b border-gray-200 bg-gray-50/80 shrink-0 pr-[14px]">
              {/* Time Gutter Header */}
              <div className="w-16 border-r border-gray-200 shrink-0 flex items-center justify-center">
                <Clock className="w-4 h-4 text-gray-400" />
              </div>
              {/* Days Headers */}
              <div className={`flex-1 grid ${view === 'Week' ? 'grid-cols-7' : 'grid-cols-1'}`}>
                {daysInGrid.map((day, idx) => {
                  const isToday = isSameDay(day, new Date());
                  return (
                    <div key={day.toISOString()} className={`py-3 text-center border-gray-200 ${idx !== 0 ? 'border-l' : ''}`}>
                      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                        {format(day, 'EEE')}
                      </div>
                      <div className={`
                            inline-flex items-center justify-center w-8 h-8 rounded-full text-lg font-medium
                            ${isToday ? 'bg-primary text-white shadow-sm ring-2 ring-primary/20' : 'text-gray-900'}
                         `}>
                        {format(day, 'd')}
                      </div>
                    </div>
                  )
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
                      style={{ top: `${(i * PIXELS_PER_HOUR) - 8}px` }}
                    >
                      {format(new Date().setHours(START_HOUR + i, 0, 0, 0), 'h a')}
                    </div>
                  ))}
                </div>

                {/* Days/Grid Content */}
                <div className={`flex-1 grid ${view === 'Week' ? 'grid-cols-7' : 'grid-cols-1'} relative`}>
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
                      <div key={day.toISOString()} className={`relative border-gray-100 ${idx !== 0 ? 'border-l' : ''}`}>
                        {/* Clickable Empty Slots */}
                        {Array.from({ length: HOURS_IN_GRID }).map((_, hourIdx) => {
                          const isPastDay = day < startOfDay(new Date());
                          return (
                            <div
                              key={`empty-${hourIdx}`}
                              className={`w-full absolute ${isPastDay ? 'cursor-not-allowed bg-gray-50/40' : 'cursor-pointer hover:bg-primary/5 transition-colors'}`}
                              style={{
                                top: `${hourIdx * PIXELS_PER_HOUR}px`,
                                height: `${PIXELS_PER_HOUR}px`,
                                zIndex: 1 // Underneath actual bookings
                              }}
                              onClick={() => {
                                if (!isPastDay) handleGridClick(day, START_HOUR + hourIdx);
                              }}
                            />
                          )
                        })}

                        {/* Actual Bookings */}
                        {daySlots.map(({ booking, slot }) => {
                          const styles = calculateBlockStyles(slot.startTime, slot.endTime);

                          return (
                            <div
                              key={booking.id + slot.startTime}
                              className={`rounded-md border p-2 flex flex-col overflow-hidden shadow-sm hover:shadow-md transition-shadow group
                                    ${getStatusColor(booking)}`}
                              style={styles}
                              title={`${booking.isManualBooking ? (booking.note || 'Manual Booking') : booking.package}`}
                            >
                              <div className="text-xs font-semibold flex justify-between items-start mb-0.5">
                                <span className="truncate">
                                  {format(parseISO(slot.startTime), 'h:mm')} - {format(parseISO(slot.endTime), 'h:mm a')}
                                </span>
                              </div>
                              {booking.isManualBooking ? (
                                <div className="text-xs font-medium truncate leading-tight group-hover:whitespace-normal group-hover:z-20 transition-all">
                                  {booking.note || 'Manual Booking'}
                                </div>
                              ) : (
                                <>
                                  <div className="text-xs font-medium truncate leading-tight group-hover:whitespace-normal group-hover:z-20 transition-all">
                                    {booking.package || 'Lesson'}
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
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Manual Booking Modal */}
      {isModalOpen && selectedDate && selectedTime !== null && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold text-gray-900">Add Manual Booking</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700 flex items-center gap-2 border border-gray-100">
                <CalendarIcon className="w-4 h-4 text-primary shrink-0" />
                <span className="font-medium">
                  {format(selectedDate, 'MMMM d, yyyy')} at {selectedTime === 12 ? '12 PM' : selectedTime > 12 ? `${selectedTime - 12} PM` : `${selectedTime} AM`}
                </span>
              </div>

              <div>
                <label className="block text-sm font-medium border-gray-200 text-gray-700 mb-1">Duration</label>
                <select
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value={45}>45 Minutes</option>
                  <option value={60}>1 Hour</option>
                  <option value={90}>1.5 Hours</option>
                  <option value={120}>2 Hours</option>
                  <option value={150}>2.5 Hours</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium border-gray-200 text-gray-700 mb-1">Note (Optional)</label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="e.g. Blocking off for lunch, or manual student booking"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary min-h-[80px]"
                />
              </div>
            </div>
            <div className="p-4 border-t bg-gray-50 flex justify-end gap-2">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                onClick={submitManualBooking}
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary-dark transition-colors flex items-center gap-2"
              >
                {isSubmitting ? <Spinner size="sm" /> : null}
                Save Booking
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
