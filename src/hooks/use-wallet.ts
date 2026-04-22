import { useCallback, useEffect, useState } from "react";
import { BrowserProvider } from "ethers";
import { hasMetaMask, getProvider, EXPECTED_CHAIN_ID } from "@/lib/chainproof/contract";

export interface WalletState {
  address: string | null;
  chainId: number | null;
  provider: BrowserProvider | null;
  connecting: boolean;
  error: string | null;
}

export function useWallet() {
  const [state, setState] = useState<WalletState>({
    address: null,
    chainId: null,
    provider: null,
    connecting: false,
    error: null,
  });

  const refresh = useCallback(async () => {
    if (!hasMetaMask()) return;
    try {
      const provider = getProvider();
      const accounts = await provider.send("eth_accounts", []);
      const network = await provider.getNetwork();
      setState((s) => ({
        ...s,
        provider,
        address: accounts[0] ?? null,
        chainId: Number(network.chainId),
        error: null,
      }));
    } catch (e) {
      setState((s) => ({ ...s, error: (e as Error).message }));
    }
  }, []);

  const connect = useCallback(async () => {
    if (!hasMetaMask()) {
      setState((s) => ({ ...s, error: "MetaMask is not installed" }));
      return;
    }
    setState((s) => ({ ...s, connecting: true, error: null }));
    try {
      const provider = getProvider();
      const accounts: string[] = await provider.send("eth_requestAccounts", []);
      const network = await provider.getNetwork();
      setState({
        provider,
        address: accounts[0] ?? null,
        chainId: Number(network.chainId),
        connecting: false,
        error: null,
      });
    } catch (e) {
      setState((s) => ({ ...s, connecting: false, error: (e as Error).message }));
    }
  }, []);

  useEffect(() => {
    refresh();
    const eth = window.ethereum;
    if (!eth?.on) return;
    const onAccounts = () => refresh();
    const onChain = () => refresh();
    eth.on("accountsChanged", onAccounts);
    eth.on("chainChanged", onChain);
    return () => {
      eth.removeListener?.("accountsChanged", onAccounts);
      eth.removeListener?.("chainChanged", onChain);
    };
  }, [refresh]);

  const wrongNetwork =
    state.chainId !== null && state.chainId !== EXPECTED_CHAIN_ID;

  return { ...state, connect, refresh, wrongNetwork };
}
