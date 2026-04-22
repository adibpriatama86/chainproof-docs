// Helper utilities for ChainProof — hashing, formatting, network checks.

/** Compute SHA-256 of a File in the browser using the Web Crypto API. */
export async function sha256OfFile(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const digest = await crypto.subtle.digest("SHA-256", buffer);
  return "0x" + bufferToHex(digest);
}

/** Compute SHA-256 of an arbitrary string (used for "verify by hash" sanity). */
export async function sha256OfText(text: string): Promise<string> {
  const enc = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest("SHA-256", enc);
  return "0x" + bufferToHex(digest);
}

function bufferToHex(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let hex = "";
  for (let i = 0; i < bytes.length; i++) {
    hex += bytes[i].toString(16).padStart(2, "0");
  }
  return hex;
}

/** Normalize and validate a user-pasted hash to a 0x-prefixed 32-byte hex string. */
export function normalizeHash(input: string): string | null {
  if (!input) return null;
  let h = input.trim().toLowerCase();
  if (h.startsWith("0x")) h = h.slice(2);
  if (!/^[0-9a-f]{64}$/.test(h)) return null;
  return "0x" + h;
}

/** Shorten an address: 0x1234…abcd */
export function shortAddress(addr: string): string {
  if (!addr) return "";
  return addr.slice(0, 6) + "…" + addr.slice(-4);
}

/** Shorten a hash for display. */
export function shortHash(hash: string): string {
  if (!hash) return "";
  return hash.slice(0, 10) + "…" + hash.slice(-8);
}

/** Format a unix-second timestamp into a human-readable string. */
export function formatTimestamp(unixSeconds: bigint | number): string {
  const ms = typeof unixSeconds === "bigint" ? Number(unixSeconds) * 1000 : unixSeconds * 1000;
  return new Date(ms).toLocaleString();
}

/** Format file size in KB / MB. */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/** Map a chain id to a friendly network name. */
export function networkName(chainId: number | bigint): string {
  const id = typeof chainId === "bigint" ? Number(chainId) : chainId;
  switch (id) {
    case 1:
      return "Ethereum Mainnet";
    case 11155111:
      return "Sepolia Testnet";
    case 31337:
    case 1337:
      return "Hardhat Local";
    default:
      return `Chain #${id}`;
  }
}
