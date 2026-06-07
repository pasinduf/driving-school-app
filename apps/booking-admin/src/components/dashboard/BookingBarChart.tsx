interface ChartPoint {
  label: string;
  count: number;
}

/**
 * Lightweight, dependency-free bar chart for dashboard booking analytics.
 * Bars use the company theme color (primary) gradient with rounded tops;
 * hovering reveals the exact count. Handles the empty/no-data state gracefully.
 */
export default function BookingBarChart({ data }: { data: ChartPoint[] }) {
  const max = Math.max(1, ...data.map((d) => d.count));
  const hasData = data.some((d) => d.count > 0);

  if (!hasData) {
    return (
      <div className="h-64 flex items-center justify-center text-sm text-gray-400">
        No bookings for this period
      </div>
    );
  }

  return (
    <div className="h-64 flex items-end gap-2 sm:gap-3">
      {data.map((d, i) => {
        const heightPct = (d.count / max) * 100;
        return (
          <div key={i} className="flex-1 flex flex-col h-full">
            <div className="flex-1 flex items-end justify-center">
              <div className="relative w-full max-w-[44px] mx-auto flex items-end" style={{ height: '100%' }}>
                <div
                  className="w-full rounded-t-lg bg-gradient-to-b from-primary-400 to-primary-600 hover:from-primary-500 hover:to-primary-700 transition-[height,background-color] duration-500 ease-out group/bar relative"
                  style={{ height: `${Math.max(heightPct, d.count > 0 ? 4 : 0)}%` }}
                >
                  <div className="opacity-0 group-hover/bar:opacity-100 transition-opacity absolute -top-7 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] font-semibold px-2 py-1 rounded whitespace-nowrap pointer-events-none">
                    {d.count}
                  </div>
                </div>
              </div>
            </div>
            <span className="mt-2 text-center text-[11px] font-medium text-gray-500">{d.label}</span>
          </div>
        );
      })}
    </div>
  );
}
