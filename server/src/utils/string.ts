export const omitLeadSlash = (string: string): string => (string[0] === '/' ? string.slice(1) : string);
export const addLeadSlash = (string: string): string => `/${string}`;
