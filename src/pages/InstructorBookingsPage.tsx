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
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, X, AlertCircle, Edit, List, Search } from 'lucide-react';
import { toast } from 'sonner';
import Spinner from '../components/Spinner';
import ConfirmationModal from '../components/ConfirmationModal';
import { fetchInstructorBookings, cancelBooking, updateManualBooking } from '../api/booking-api';
import { fetchPackages } from '../api/package-api';
import ManualBookingModal from '../components/ManualBookingModal';
import { CALENDAR_END_HOUR, CALENDAR_START_HOUR } from '../util/const';
import Pagination from '../components/Pagination';
import type { Booking, BookingsResponse } from '../api/types/booking-response';
import BookingDetailsModal from '../components/BookingDetailsModal';

type ViewType = 'Day' | 'Week' | 'Month';

// Time grid constants
const START_HOUR = CALENDAR_START_HOUR;
const END_HOUR = CALENDAR_END_HOUR;
const HOURS_IN_GRID = END_HOUR - START_HOUR;
// Pixels per hour for the time grid
const PIXELS_PER_HOUR = 60;

export default function InstructorBookingsPage() {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<ViewType>("Week");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [startTime, setStartTime] = useState<string>("09:00");
  const [endTime, setEndTime] = useState<string>("10:00");
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);

  // Booking Details Modal State
  const [selectedBookingForDetails, setSelectedBookingForDetails] = useState<Booking | null>(null);

  // Cancellation Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [bookingToDelete, setBookingToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // View Toggle State
  const [viewMode, setViewMode] = useState<"calendar" | "table">("calendar");

  // Table View Filters & Pagination
  const [tablePage, setTablePage] = useState(1);
  const [tableSearch, setTableSearch] = useState("");
  const tableLimit = 10;

  // Drag & Drop State
  const [draggedOverCell, setDraggedOverCell] = useState<{ day: string; hour: number } | null>(null);

  // Calculate fetch bounds based on the current view
  const { startDateStr, endDateStr } = useMemo(() => {
    let start, end;
    if (view === "Month") {
      start = startOfMonth(currentDate);
      end = endOfMonth(currentDate);
    } else if (view === "Week") {
      start = startOfWeek(currentDate, { weekStartsOn: 1 });
      end = endOfWeek(currentDate, { weekStartsOn: 1 });
    } else {
      // Day
      start = startOfDay(currentDate);
      end = endOfDay(currentDate);
    }
    return {
      startDateStr: format(start, "yyyy-MM-dd"),
      endDateStr: format(end, "yyyy-MM-dd"),
    };
  }, [currentDate, view]);

  // Table View Date Range (Initial load 7 days)
  const [tableStartDate, setTableStartDate] = useState(startDateStr);
  const [tableEndDate, setTableEndDate] = useState(endDateStr);

  // Calendar View Data (existing logic)
  const {
    data: bookingData,
    isLoading: isCalendarLoading,
    isError: isCalendarError,
    refetch: refetchCalendar,
  } = useQuery<BookingsResponse>({
    queryKey: ["instructor-bookings", startDateStr, endDateStr, view],
    queryFn: () =>
      fetchInstructorBookings({
        page: 1,
        limit: 1000,
        startDate: startDateStr,
        endDate: endDateStr,
      }),
    placeholderData: keepPreviousData,
    enabled: !!user && viewMode === "calendar",
  });

  // Table View Data
  const {
    data: tableBookingData,
    isLoading: isTableLoading,
    isError: isTableError,
    refetch: refetchTable,
  } = useQuery<BookingsResponse>({
    queryKey: ["instructor-bookings-table", tablePage, tableSearch, tableStartDate, tableEndDate],
    queryFn: () =>
      fetchInstructorBookings({
        page: tablePage,
        limit: tableLimit,
        search: tableSearch || undefined,
        startDate: tableStartDate,
        endDate: tableEndDate,
      }),
    placeholderData: keepPreviousData,
    enabled: !!user && viewMode === "table",
  });

  const isLoading = viewMode === "calendar" ? isCalendarLoading : isTableLoading;
  const isError = viewMode === "calendar" ? isCalendarError : isTableError;
  const refetch = viewMode === "calendar" ? refetchCalendar : refetchTable;

  const { data: packages = [] } = useQuery({
    queryKey: ["packages"],
    queryFn: fetchPackages,
  });

  const bookings = bookingData?.data || [];

  const handlePrev = () => {
    if (view === "Month") setCurrentDate(subMonths(currentDate, 1));
    else if (view === "Week") setCurrentDate(subWeeks(currentDate, 1));
    else setCurrentDate(subDays(currentDate, 1));
  };

  const handleNext = () => {
    if (view === "Month") setCurrentDate(addMonths(currentDate, 1));
    else if (view === "Week") setCurrentDate(addWeeks(currentDate, 1));
    else setCurrentDate(addDays(currentDate, 1));
  };

  const handleToday = () => setCurrentDate(new Date());

  const resetTableFilters = () => {
    setTableSearch("");
    setTablePage(1);
    setTableStartDate(startDateStr);
    setTableEndDate(endDateStr);
  };

  // Generate calendar grid for Month View
  const daysInGrid = useMemo(() => {
    if (view === "Month") {
      const start = startOfWeek(startOfMonth(currentDate), { weekStartsOn: 1 });
      const end = endOfWeek(endOfMonth(currentDate), { weekStartsOn: 1 });
      return eachDayOfInterval({ start, end });
    } else if (view === "Week") {
      const start = startOfWeek(currentDate, { weekStartsOn: 1 });
      const end = endOfWeek(currentDate, { weekStartsOn: 1 });
      return eachDayOfInterval({ start, end });
    } else {
      return [currentDate];
    }
  }, [currentDate, view]);

  const getSlotsForDay = (day: Date) => {
    return bookings
      .filter((b) => b.status === "CONFIRMED")
      .flatMap((booking) => booking.bookingSlots.filter((slot) => isSameDay(parseISO(slot.startTime), day)).map((slot) => ({ booking, slot })));
  };

  const getStatusColor = (booking: Booking) => {
    if (booking.isManualBooking) {
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    }
    return "bg-green-100 text-green-800 border-green-200";
  };

  const calculateBlockStyles = (startTimeISO: string, endTimeISO: string) => {
    const start = parseISO(startTimeISO);
    const end = parseISO(endTimeISO);

    const startHourNum = start.getHours() + start.getMinutes() / 60;
    const endHourNum = end.getHours() + end.getMinutes() / 60;

    if (endHourNum <= CALENDAR_START_HOUR || startHourNum >= CALENDAR_END_HOUR) {
      return { display: "none" };
    }

    const clampedStartHour = Math.max(startHourNum, CALENDAR_START_HOUR);
    const clampedEndHour = Math.min(endHourNum, CALENDAR_END_HOUR);

    const topOffset = (clampedStartHour - CALENDAR_START_HOUR) * PIXELS_PER_HOUR;
    const durationMinutes = (clampedEndHour - clampedStartHour) * 60;
    const height = (durationMinutes / 60) * PIXELS_PER_HOUR;

    return {
      top: `${topOffset}px`,
      height: `${height}px`,
      position: "absolute" as const,
      left: "4px",
      right: "4px",
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
    setStartTime(`${hour.toString().padStart(2, "0")}:00`);
    setEndTime(`${(hour + 1).toString().padStart(2, "0")}:00`);
    setEditingBooking(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (booking: Booking) => {
    const start = parseISO(booking.bookingSlots[0].startTime);
    if (start < new Date()) {
      toast.error("Cannot edit past bookings.");
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
      toast.success("Manual booking cancelled successfully.");
      setIsDeleteModalOpen(false);
      setBookingToDelete(null);
      refetch();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to cancel manual booking.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDragStart = (e: React.DragEvent, booking: Booking) => {
    const start = parseISO(booking.bookingSlots[0].startTime);
    if (start < new Date()) {
      e.preventDefault();
      return;
    }
    e.dataTransfer.setData("bookingId", booking.id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, day: Date, hour: number) => {
    e.preventDefault();
    const cellTime = new Date(day);
    cellTime.setHours(hour, 0, 0, 0);

    if (cellTime < new Date()) {
      e.dataTransfer.dropEffect = "none";
      return;
    }

    e.dataTransfer.dropEffect = "move";
    const dayKey = day.toISOString();
    if (draggedOverCell?.day !== dayKey || draggedOverCell?.hour !== hour) {
      setDraggedOverCell({ day: dayKey, hour });
    }
  };

  const handleDrop = async (e: React.DragEvent, day: Date, hour: number) => {
    e.preventDefault();
    setDraggedOverCell(null);

    const bookingId = e.dataTransfer.getData("bookingId");
    if (!bookingId) return;

    const cellTime = new Date(day);
    cellTime.setHours(hour, 0, 0, 0);
    if (cellTime < new Date()) {
      toast.error("Cannot reschedule to a past time.");
      return;
    }

    const booking = bookings.find((b) => b.id === bookingId);
    if (!booking || !booking.isManualBooking) return;

    const originalStart = parseISO(booking.bookingSlots[0].startTime);
    const originalEnd = parseISO(booking.bookingSlots[0].endTime);
    const durationMinutes = (originalEnd.getTime() - originalStart.getTime()) / (1000 * 60);

    try {
      const dateStr = format(day, "yyyy-MM-dd");
      const timeStr = `${hour.toString().padStart(2, "0")}:00`;

      await updateManualBooking(bookingId, {
        date: dateStr,
        time: timeStr,
        duration: durationMinutes,
      });

      toast.success("Booking rescheduled successfully.");
      refetch();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to reschedule booking.");
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
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <CalendarIcon className="w-6 h-6 text-primary" />
              Bookings
            </h1>
            <p className="text-sm text-gray-500 mt-1 hidden md:block">Manage your driving lessons and availability</p>
          </div>

          <div className="flex items-center bg-gray-100 p-1 rounded-lg border border-gray-200">
            <button
              onClick={() => setViewMode("calendar")}
              className={`p-1.5 rounded-md transition-all ${viewMode === "calendar" ? "bg-white text-primary shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
              title="Calendar View"
            >
              <CalendarIcon className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded-md transition-all ${viewMode === "table" ? "bg-white text-primary shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
              title="Table View"
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
          {viewMode === "calendar" && (
            <>
              {/* Calendar View Selectors */}
              <div className="flex bg-gray-100 p-1 rounded-lg border border-gray-200">
                {(["Day", "Week", "Month"] as ViewType[]).map((v) => (
                  <button
                    key={v}
                    onClick={() => setView(v)}
                    className={`flex-1 sm:flex-none px-4 py-1.5 text-sm font-medium transition-all rounded-md ${
                      view === v ? "bg-white text-primary shadow-sm ring-1 ring-gray-900/5" : "text-gray-600 hover:text-gray-900 hover:bg-gray-200/50"
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
            </>
          )}
        </div>
      </div>

      {viewMode === "table" && (
        <div className="bg-white p-4 rounded-xl shadow-sm mb-6 border border-gray-100 flex flex-wrap gap-4 items-end shrink-0">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by customer or manual booking..."
                className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                value={tableSearch}
                onChange={(e) => {
                  setTableSearch(e.target.value);
                  setTablePage(1);
                }}
              />
            </div>
          </div>
          <div className="flex-none">
            <button
              onClick={resetTableFilters}
              className="px-4 py-2 bg-gray-50 text-gray-600 text-sm font-semibold rounded-lg hover:bg-gray-100 transition-colors border border-gray-200"
            >
              Reset
            </button>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-hidden">
        {isLoading ? (
          <div className="h-[500px] flex items-center justify-center bg-white rounded-xl border border-gray-200 shadow-sm">
            <Spinner text={`Loading ${viewMode}...`} />
          </div>
        ) : isError ? (
          <div className="h-[500px] flex flex-col items-center justify-center bg-white rounded-xl border border-red-100 shadow-sm px-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
            <h3 className="text-lg font-bold text-gray-900">Something went wrong</h3>
            <p className="text-gray-500 mt-2 max-w-sm">We couldn't load the bookings. Please check your connection and try again.</p>
            <button
              onClick={() => refetch()}
              className="mt-6 px-6 py-2 bg-primary text-white rounded-lg font-bold hover:bg-primary/90 transition-all shadow-sm"
            >
              Try Again
            </button>
          </div>
        ) : (
          <>
            {viewMode === "table" ? (
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50/50">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Date & Time</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Instructor</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Customer Name</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Suburb</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Package</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Price</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Status</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-100">
                        {(tableBookingData?.data || []).map((booking: Booking) => (
                          <tr
                            key={booking.id}
                            className={`hover:bg-primary/[0.02] transition-colors cursor-pointer group ${booking.isManualBooking ? "bg-yellow-50/20" : ""}`}
                            onClick={() => setSelectedBookingForDetails(booking)}
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex flex-col gap-1.5">
                                {booking.bookingSlots.map((slot, idx) => (
                                  <div key={idx} className="flex flex-col">
                                    <span className="text-sm text-gray-900">{format(parseISO(slot.startTime), "PPP")}</span>
                                    <span className="text-xs text-gray-500 font-medium">
                                      {format(parseISO(slot.startTime), "p")} - {format(parseISO(slot.endTime), "p")}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-sm text-gray-900">{booking?.instructor || "-"}</span>
                            </td>
                            <td className="px-6 py-4">
                              {booking.isManualBooking ? (
                                <div className="text-sm text-gray-900">{booking?.customerName || "-"}</div>
                              ) : (
                                <div className="flex flex-col">
                                  <span className="text-sm font-bold text-gray-900">
                                    {booking?.bookingDetails?.customerFirstName} {booking?.bookingDetails?.customerLastName}
                                  </span>
                                  <span className="text-xs text-gray-500 mt-0.5">{booking?.bookingDetails?.customerPhone}</span>
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-sm font-medium text-gray-600">{booking.suburb?.name}</span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-gray-100 text-gray-600 uppercase tracking-wide">
                                {booking.package}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-sm font-black text-primary">${booking.price}</span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`px-3 py-1 inline-flex text-[10px] font-black uppercase tracking-widest rounded-full shadow-sm border ${booking.status === "CANCELLED" ? "bg-red-50 text-red-700 border-red-200" : booking.isManualBooking ? "bg-yellow-50 text-yellow-700 border-yellow-200" : "bg-green-50 text-green-700 border-green-200"}`}
                              >
                                {booking.isManualBooking ? "Manual" : booking.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                        {(tableBookingData?.data || []).length === 0 && (
                          <tr>
                            <td colSpan={7} className="px-6 py-20 text-center">
                              <div className="flex flex-col items-center">
                                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                  <Search className="w-8 h-8 text-gray-300" />
                                </div>
                                <h4 className="text-lg font-bold text-gray-900">No results found</h4>
                                {/* <p className="text-gray-500 mt-1">Try adjusting your filters or search terms.</p> */}
                              </div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
                <Pagination currentPage={tablePage} totalPages={Math.ceil((tableBookingData?.total || 0) / tableLimit)} onPageChange={setTablePage} />
              </div>
            ) : (
              <div className="flex-1 bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col relative min-h-[600px]">
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
                                  draggable={booking.isManualBooking && parseISO(slot.startTime) > new Date()}
                                  onDragStart={(e) => handleDragStart(e, booking)}
                                  className={`text-xs px-2 py-1.5 rounded border shadow-sm flex flex-col gap-0.5 relative group mr-[1px]
                              ${getStatusColor(booking)} cursor-pointer hover:shadow transition-shadow ${booking.isManualBooking ? "active:cursor-grabbing" : ""}`}
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
                                      className={`w-full absolute transition-colors ${isPastSlot ? "cursor-not-allowed bg-gray-50/40" : "cursor-pointer hover:bg-primary/5"} 
                                  ${draggedOverCell?.day === day.toISOString() && draggedOverCell?.hour === START_HOUR + hourIdx ? "bg-primary/20 ring-2 ring-primary ring-inset z-20" : "z-1"}`}
                                      style={{
                                        top: `${hourIdx * PIXELS_PER_HOUR}px`,
                                        height: `${PIXELS_PER_HOUR}px`,
                                      }}
                                      onDragOver={(e) => handleDragOver(e, day, START_HOUR + hourIdx)}
                                      onDragLeave={() => setDraggedOverCell(null)}
                                      onDrop={(e) => handleDrop(e, day, START_HOUR + hourIdx)}
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
                                      draggable={booking.isManualBooking && parseISO(slot.startTime) > new Date()}
                                      onDragStart={(e) => handleDragStart(e, booking)}
                                      className={`rounded-md border flex flex-col overflow-hidden shadow-sm hover:shadow-md transition-shadow group relative
                                      ${getStatusColor(booking)} cursor-pointer ${booking.isManualBooking ? "p-1 active:cursor-grabbing" : "p-2"}`}
                                      style={styles}
                                      title={`${
                                        booking.isManualBooking
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
          </>
        )}

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

        {selectedBookingForDetails && (
          <BookingDetailsModal
            isOpen ={true}
            onClose={setSelectedBookingForDetails}
            booking={selectedBookingForDetails}
          />
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
      </div>
    </main>
  );
}
