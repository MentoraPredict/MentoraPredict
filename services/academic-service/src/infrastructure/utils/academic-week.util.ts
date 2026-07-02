export interface AcademicWeek {
  academicWeek: number;
  academicYear: number;
}

// ISO 8601 week: weeks start on Monday, week 1 is the week containing the year's first Thursday.
export function getAcademicWeek(date: Date): AcademicWeek {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = (d.getUTCDay() + 6) % 7; // Mon=0 .. Sun=6
  d.setUTCDate(d.getUTCDate() - dayNum + 3); // move to Thursday of this ISO week

  const firstThursday = new Date(Date.UTC(d.getUTCFullYear(), 0, 4));
  const firstDayNum = (firstThursday.getUTCDay() + 6) % 7;
  firstThursday.setUTCDate(firstThursday.getUTCDate() - firstDayNum + 3);

  const academicWeek =
    1 + Math.round((d.getTime() - firstThursday.getTime()) / (7 * 24 * 3600 * 1000));

  return { academicWeek, academicYear: d.getUTCFullYear() };
}
