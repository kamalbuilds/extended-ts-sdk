export function generateNonce(): string {
  return Math.floor(Math.random() * 1000000000).toString();
}

export function generateTimestampNonce(): string {
  return Date.now().toString();
}