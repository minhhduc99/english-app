export const translateSchedule = (schedule: string, language: string) => {
  if (language === "en" || !schedule) return schedule;
  
  const dayMap: Record<string, string> = {
    Mon: "Thứ 2",
    Tue: "Thứ 3",
    Wed: "Thứ 4",
    Thu: "Thứ 5",
    Fri: "Thứ 6",
    Sat: "Thứ 7",
    Sun: "CN",
  };

  let translated = schedule;
  Object.keys(dayMap).forEach((day) => {
    translated = translated.replace(new RegExp(day, "g"), dayMap[day]);
  });
  return translated;
};
