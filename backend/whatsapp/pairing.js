export function normalizePhone(input){return String(input||'').replace(/[\s()+-]/g,'');}
export function isValidInternationalPhone(input){return /^\d{8,15}$/.test(normalizePhone(input));}
