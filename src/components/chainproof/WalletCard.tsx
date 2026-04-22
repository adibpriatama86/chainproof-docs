import { Wallet, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useWallet } from "@/hooks/use-wallet";
import { hasMetaMask, EXPECTED_CHAIN_ID } from "@/lib/chainproof/contract";
import { networkName, shortAddress } from "@/lib/chainproof/utils";

export function WalletCard() {
  const { address, chainId, connect, connecting, error, wrongNetwork } = useWallet();
  const installed = typeof window !== "undefined" ? hasMetaMask() : true;

  return (
    <Card className="p-6 shadow-soft border-border/60">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary grid place-items-center">
            <Wallet className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Wallet</h2>
            <p className="text-sm text-muted-foreground">
              Connect MetaMask to register and verify documents.
            </p>
          </div>
        </div>

        {address ? (
          <div className="text-right">
            <div className="flex items-center gap-2 text-sm font-mono">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              {shortAddress(address)}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {chainId !== null ? networkName(chainId) : "—"}
            </div>
          </div>
        ) : (
          <Button onClick={connect} disabled={connecting || !installed}>
            {connecting ? "Connecting…" : "Connect MetaMask"}
          </Button>
        )}
      </div>

      {!installed && (
        <Alert tone="warn" className="mt-4">
          MetaMask is not installed.{" "}
          <a
            href="https://metamask.io/download/"
            target="_blank"
            rel="noreferrer"
            className="underline"
          >
            Install it here
          </a>{" "}
          and refresh the page.
        </Alert>
      )}

      {wrongNetwork && address && (
        <Alert tone="warn" className="mt-4">
          You are on <b>{networkName(chainId!)}</b>. Switch MetaMask to{" "}
          <b>{networkName(EXPECTED_CHAIN_ID)}</b> (chain id {EXPECTED_CHAIN_ID}).
        </Alert>
      )}

      {error && (
        <Alert tone="error" className="mt-4">
          {error}
        </Alert>
      )}
    </Card>
  );
}

function Alert({
  tone,
  className = "",
  children,
}: {
  tone: "warn" | "error";
  className?: string;
  children: React.ReactNode;
}) {
  const tones = {
    warn: "bg-amber-50 text-amber-900 border-amber-200 dark:bg-amber-950/40 dark:text-amber-200 dark:border-amber-900/60",
    error:
      "bg-red-50 text-red-900 border-red-200 dark:bg-red-950/40 dark:text-red-200 dark:border-red-900/60",
  } as const;
  return (
    <div className={`flex gap-2 items-start text-sm border rounded-lg px-3 py-2 ${tones[tone]} ${className}`}>
      <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
      <div>{children}</div>
    </div>
  );
}
