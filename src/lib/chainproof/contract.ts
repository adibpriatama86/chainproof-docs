// Thin wrapper around ethers.js for talking to DocumentRegistry.
import { BrowserProvider, Contract, type Eip1193Provider } from "ethers";
import { DOCUMENT_REGISTRY_ABI } from "./abi";

declare global {
  interface Window {
    ethereum?: Eip1193Provider & {
      on?: (event: string, cb: (...args: unknown[]) => void) => void;
      removeListener?: (event: string, cb: (...args: unknown[]) => void) => void;
    };
  }
}

export const CONTRACT_ADDRESS =
  (import.meta.env.VITE_CONTRACT_ADDRESS as string | undefined) ?? "";

export const EXPECTED_CHAIN_ID = Number(
  (import.meta.env.VITE_CHAIN_ID as string | undefined) ?? "31337",
);

export function hasMetaMask(): boolean {
  return typeof window !== "undefined" && !!window.ethereum;
}

export function getProvider(): BrowserProvider {
  if (!hasMetaMask()) throw new Error("MetaMask is not installed");
  return new BrowserProvider(window.ethereum as Eip1193Provider);
}

export async function getReadContract(): Promise<Contract> {
  if (!CONTRACT_ADDRESS) throw new Error("Contract address is not configured");
  const provider = getProvider();
  return new Contract(CONTRACT_ADDRESS, DOCUMENT_REGISTRY_ABI, provider);
}

export async function getWriteContract(): Promise<Contract> {
  if (!CONTRACT_ADDRESS) throw new Error("Contract address is not configured");
  const provider = getProvider();
  const signer = await provider.getSigner();
  return new Contract(CONTRACT_ADDRESS, DOCUMENT_REGISTRY_ABI, signer);
}
