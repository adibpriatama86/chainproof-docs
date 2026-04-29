// Shared contract configuration + ethers helpers for ChainProof.
// This is the single source of truth for: contract address, ABI,
// expected chain id, and read RPC URL. All components (Register, Verify,
// RecentList) MUST import from here so they always talk to the same contract.
import {
  BrowserProvider,
  Contract,
  JsonRpcProvider,
  type Eip1193Provider,
} from "ethers";
import { DOCUMENT_REGISTRY_ABI } from "./abi";

declare global {
  interface Window {
    ethereum?: Eip1193Provider & {
      on?: (event: string, cb: (...args: unknown[]) => void) => void;
      removeListener?: (event: string, cb: (...args: unknown[]) => void) => void;
    };
  }
}

// ── Shared config (read from .env) ─────────────────────────────────────────
export const CONTRACT_ADDRESS =
  (import.meta.env.VITE_CONTRACT_ADDRESS as string | undefined) ?? "";

export const EXPECTED_CHAIN_ID = Number(
  (import.meta.env.VITE_CHAIN_ID as string | undefined) ?? "31337",
);

export const READ_RPC_URL =
  (import.meta.env.VITE_RPC_URL as string | undefined) ??
  "http://127.0.0.1:8545";

export const CONTRACT_ABI = DOCUMENT_REGISTRY_ABI;

// ── Friendly Indonesian diagnostics ────────────────────────────────────────
export const ERR_CONTRACT_NOT_FOUND =
  "Kontrak tidak ditemukan pada network/RPC yang sedang dipakai. Periksa contract address, RPC, dan chain.";

export const ERR_ABI_MISMATCH =
  "ABI tidak cocok dengan kontrak yang ter-deploy. Periksa kembali ABI dan signature fungsi (mis. getAllDocumentHashes / verifyDocument) di kontrak Anda.";

// ── Provider helpers ───────────────────────────────────────────────────────
export function hasMetaMask(): boolean {
  return typeof window !== "undefined" && !!window.ethereum;
}

export function getProvider(): BrowserProvider {
  if (!hasMetaMask()) throw new Error("MetaMask is not installed");
  return new BrowserProvider(window.ethereum as Eip1193Provider);
}

/** Read-only provider that does NOT require MetaMask. Always uses VITE_RPC_URL. */
export function getReadProvider(): JsonRpcProvider {
  return new JsonRpcProvider(READ_RPC_URL, EXPECTED_CHAIN_ID);
}

/**
 * Verify the configured CONTRACT_ADDRESS actually has bytecode on the
 * provider's network. Throws an Indonesian-friendly error if not.
 */
async function assertContractDeployed(
  provider: BrowserProvider | JsonRpcProvider,
): Promise<void> {
  if (!CONTRACT_ADDRESS) throw new Error("Contract address is not configured");
  const code = await provider.getCode(CONTRACT_ADDRESS);
  if (!code || code === "0x") {
    throw new Error(ERR_CONTRACT_NOT_FOUND);
  }
}

// ── Contract factories ─────────────────────────────────────────────────────
export async function getReadContract(): Promise<Contract> {
  // Prefer MetaMask provider when available so we read from the same chain
  // the user is currently connected to. Fall back to a static JSON-RPC
  // provider so the Recent list still works without a wallet.
  const provider: BrowserProvider | JsonRpcProvider = hasMetaMask()
    ? getProvider()
    : getReadProvider();
  await assertContractDeployed(provider);
  return new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
}

export async function getWriteContract(): Promise<Contract> {
  const provider = getProvider();
  await assertContractDeployed(provider);
  const signer = await provider.getSigner();
  return new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
}
