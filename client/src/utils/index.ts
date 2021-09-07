export const generateId = (): string => Math.random().toString(36).substr(2, 9);

// https://stackoverflow.com/questions/3733227/javascript-seconds-to-minutes-and-seconds
export const fancyTimeFormat = (duration = 0): string => {
  const hours = Math.floor(duration / 3600).toString().padStart(2, '0');
  const minutes = Math.floor((duration % 3600) / 60).toString().padStart(2, '0');
  const seconds = Math.floor(duration % 60).toString().padStart(2, '0');

  return `${hours}:${minutes}:${seconds}`;
};

export const classNames = (conditions: Record<string, boolean>): string => Object
  .entries(conditions)
  .filter(([_, condition]) => Boolean(condition))
  .map(([className]) => className)
  .join(' ');
