import { EventInfo } from "../../shared/sharedTypes";

export const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export const getDurationDaysHoursMinuesSeconds = (
  durationMs: number
): [number, number, number, number] => {
  const seconds = Math.floor((durationMs / 1000) % 60);
  const minutes = Math.floor((durationMs / 1000 / 60) % 60);
  const hours = Math.floor((durationMs / (1000 * 60 * 60)) % 24);
  const days = Math.floor(durationMs / (1000 * 60 * 60 * 24));
  return [days, hours, minutes, seconds];
};
const dateOrdinal = (dom: number): string => {
  if (dom === 31 || dom === 21 || dom === 1) return dom + "st";
  else if (dom === 22 || dom === 2) return dom + "nd";
  else if (dom === 23 || dom === 3) return dom + "rd";
  else return dom + "th";
};

export const formateDuration = (event: EventInfo): string => {
  const duration = event.endTimestamp - event.startTimestamp;
  const format = (num: number, unit: string, suffix = ""): string => {
    if (num === 0) return "";
    if (num === 1) return `${num} ${unit}${suffix}`;
    return `${num} ${unit}s${suffix}`;
  };

  const [d, h, m, s] = getDurationDaysHoursMinuesSeconds(duration);
  return `${format(d, "day", " ")}${format(h, "hour", " ")}${format(
    m,
    "minute",
    " "
  )}${format(s, "second")}`;
};
export const formatDatetime = (event: EventInfo): string => {
  const start = new Date(event.startTimestamp);
  const year = start.getFullYear();
  const month = start.getMonth();
  const dd = start.getDate();
  const [time, ampm, zone] = start
    .toLocaleTimeString("en-us", { timeZoneName: "short" })
    .replace("DT", "ST")
    .split(" ");
  const [hour, min] = time.split(":");
  return `${months[month]} ${dateOrdinal(
    dd
  )}, ${year} - ${hour}:${min} ${ampm} ${zone}`;
};
