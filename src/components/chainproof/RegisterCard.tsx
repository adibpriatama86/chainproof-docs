import { useState } from "react";
import { Upload, Loader2, CheckCircle2, FileText } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { sha256OfFile, formatBytes, shortHash } from "@/lib/chainproof/utils";
import { getWriteContract, CONTRACT_ADDRESS } from "@/lib/chainproof/contract";
import { useWallet } from "@/hooks/use-wallet";

export function RegisterCard({ onRegistered }: { onRegistered?: () => void }) {
  const { address, wrongNetwork } = useWallet();
  const [file, setFile] = useState<File | null>(null);
  const [hash, setHash] = useState<string>("");
  const [hashing, setHashing] = useState(false);
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);

  async function handleFile(f: File | null) {
    setFile(f);
    setHash("");
    setTxHash(null);
    if (!f) return;
    setHashing(true);
    try {
      const h = await sha256OfFile(f);
      setHash(h);
    } catch (e) {
      toast.error("Failed to hash file: " + (e as Error).message);
    } finally {
      setHashing(false);
    }
  }

  async function handleRegister() {
    if (!file || !hash) return toast.error("Select a file first");
    if (!address) return toast.error("Connect your wallet first");
    if (wrongNetwork) return toast.error("Switch to the correct network");
    if (!CONTRACT_ADDRESS) return toast.error("Contract address not configured (.env)");

    setSubmitting(true);
    setTxHash(null);
    try {
      const contract = await getWriteContract();
      const tx = await contract.registerDocument(hash, file.name, description);
      toast.message("Transaction sent", { description: "Waiting for confirmation…" });
      const receipt = await tx.wait();
      setTxHash(receipt?.hash ?? tx.hash);
      toast.success("Document registered on-chain ✅");
      onRegistered?.();
    } catch (e) {
      const msg = (e as { shortMessage?: string; message?: string }).shortMessage
        ?? (e as Error).message
        ?? "Transaction failed";
      if (/already registered/i.test(msg)) {
        toast.error("This document is already registered.");
      } else if (/user rejected|denied|reject/i.test(msg)) {
        toast.error("Transaction rejected in MetaMask.");
      } else {
        toast.error(msg);
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card className="p-6 shadow-soft border-border/60">
      <div className="flex items-center gap-3 mb-5">
        <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary grid place-items-center">
          <Upload className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">Register a document</h2>
          <p className="text-sm text-muted-foreground">
            The file never leaves your browser — only its SHA-256 hash is stored on-chain.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="file">File</Label>
          <Input
            id="file"
            type="file"
            onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
            className="mt-1"
          />
        </div>

        {file && (
          <div className="rounded-lg border border-border/60 bg-muted/40 p-3 text-sm space-y-1">
            <div className="flex items-center gap-2 font-medium">
              <FileText className="h-4 w-4" /> {file.name}
            </div>
            <div className="text-muted-foreground text-xs">
              {formatBytes(file.size)} • {file.type || "unknown type"}
            </div>
            <div className="pt-2">
              <div className="text-xs uppercase tracking-wide text-muted-foreground">SHA-256</div>
              {hashing ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-3 w-3 animate-spin" /> Hashing…
                </div>
              ) : (
                <code className="text-xs break-all font-mono">{hash}</code>
              )}
            </div>
          </div>
        )}

        <div>
          <Label htmlFor="desc">Description</Label>
          <Textarea
            id="desc"
            placeholder="e.g. Final exam answer key, version 2"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1"
          />
        </div>

        <Button
          onClick={handleRegister}
          disabled={!file || !hash || submitting || hashing}
          className="w-full"
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" /> Registering on blockchain…
            </>
          ) : (
            "Register on blockchain"
          )}
        </Button>

        {txHash && (
          <div className="flex items-start gap-2 text-sm rounded-lg border border-emerald-200 bg-emerald-50 dark:bg-emerald-950/40 dark:border-emerald-900/60 dark:text-emerald-200 text-emerald-900 px-3 py-2">
            <CheckCircle2 className="h-4 w-4 mt-0.5" />
            <div>
              Transaction confirmed.{" "}
              <span className="font-mono">{shortHash(txHash)}</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
