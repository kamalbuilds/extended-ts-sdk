export interface X10BaseModel {
  [key: string]: unknown;
}

export interface HexValue {
  value: bigint;
  toHex(): string;
  fromHex(hex: string): HexValue;
}

export class HexValueImpl implements HexValue {
  constructor(public value: bigint) {}

  toHex(): string {
    return '0x' + this.value.toString(16);
  }

  static fromHex(hex: string): HexValue {
    const cleanHex = hex.startsWith('0x') ? hex.slice(2) : hex;
    return new HexValueImpl(BigInt('0x' + cleanHex));
  }

  fromHex(hex: string): HexValue {
    return HexValueImpl.fromHex(hex);
  }
}

export interface SettlementSignatureModel {
  r: HexValue;
  s: HexValue;
}

export function toCamelCase(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

export function toSnakeCase(str: string): string {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

export function convertKeysToCamelCase<T extends Record<string, unknown>>(obj: T): T {
  const result = {} as T;
  for (const [key, value] of Object.entries(obj)) {
    const camelKey = toCamelCase(key) as keyof T;
    result[camelKey] = value as T[keyof T];
  }
  return result;
}

export function convertKeysToSnakeCase<T extends Record<string, unknown>>(obj: T): T {
  const result = {} as T;
  for (const [key, value] of Object.entries(obj)) {
    const snakeKey = toSnakeCase(key) as keyof T;
    result[snakeKey] = value as T[keyof T];
  }
  return result;
}