// Dates are stored as YYYY-MM-DD. Parse as UTC so the day never shifts with the viewer's timezone.
const day = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", timeZone: "UTC" });

export function formatDay(iso: string) {
  return day.format(new Date(`${iso.slice(0, 10)}T00:00:00Z`)).toUpperCase();
}

/** "12 OCT → 18 OCT" (mono data format from the kit). */
export function formatRange(start: string, end: string) {
  return `${formatDay(start)} → ${formatDay(end)}`;
}

/** "Hostel/Budget" → "Hostel / Budget" */
export function spaced(option: string) {
  return option.replace("/", " / ");
}

export function genderInitial(gender: string | null) {
  if (gender === "Male") return "M";
  if (gender === "Female") return "F";
  if (gender === "Non-Binary") return "NB";
  return null;
}
