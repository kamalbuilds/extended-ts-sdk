export function isHexString(value: string): boolean {
  return /^0x[0-9a-fA-F]+$/.test(value) || /^[0-9a-fA-F]+$/.test(value);
}

export function ensureHexPrefix(value: string): string {
  return value.startsWith('0x') ? value : `0x${value}`;
}

export function removeHexPrefix(value: string): string {
  return value.startsWith('0x') ? value.slice(2) : value;
}

export function padHexString(value: string, length: number): string {
  const hex = removeHexPrefix(value);
  return ensureHexPrefix(hex.padStart(length, '0'));
}