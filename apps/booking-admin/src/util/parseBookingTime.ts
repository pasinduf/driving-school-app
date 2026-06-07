/**
 * Parses an ISO datetime string by treating its UTC time components as the
 * intended wall-clock display time, without applying any browser timezone offset.
 *
 * The backend stores booking times as wall-clock values in UTC
 * (e.g. a 6:00 AM booking is stored as "…T06:00:00.000Z").
 * Using parseISO() directly would add the browser's UTC offset to that value,
 * shifting the displayed time by hours. This function prevents that by mapping
 * the UTC fields (year/month/day/hour/minute/second) to an equivalent local Date
 * so that .getHours() returns 6 regardless of the browser's timezone.
 */
export function parseBookingTime(isoString: string): Date {
    const d = new Date(isoString);
    return new Date(
        d.getUTCFullYear(),
        d.getUTCMonth(),
        d.getUTCDate(),
        d.getUTCHours(),
        d.getUTCMinutes(),
        d.getUTCSeconds(),
    );
}
