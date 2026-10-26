export const isPAN = (v) => /^[A-Z]{5}[0-9]{4}[A-Z]$/.test(v);
export const isGSTIN = (v) => /^\d{2}[A-Z]{5}\d{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/.test(v);
export const isPhone = (v) => /^[6-9]\d{9}$/.test(v);
export const isEmail = (v) => /^\S+@\S+\.\S+$/.test(v);
