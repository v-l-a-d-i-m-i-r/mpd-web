export const generateId = (): string => Math.random().toString(36).substr(2, 9);

export const fancyTimeFormat = (duration: number): string => {
  // Hours, minutes and seconds
  const hrs = ~~(duration / 3600);
  const mins = ~~((duration % 3600) / 60);
  const secs = ~~duration % 60;

  // Output like "1:01" or "4:03:59" or "123:03:59"
  const hoursResult = hrs > 0 ? `${hrs}:${mins < 10 ? '0' : ''}` : '';
  const minutesResult = `${mins}:${secs < 10 ? '0' : ''}`;

  return `${hoursResult}${minutesResult}${secs}`;
};
