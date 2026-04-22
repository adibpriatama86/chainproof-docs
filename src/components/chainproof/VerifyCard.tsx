import { useState } from "react";
import { ShieldCheck, ShieldAlert, Loader2, Search } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  sha256OfFile,
  normalizeHash,
  formatTimestamp,
  shortAddress,
} from "@/lib/chainproof/utils";
import { getReadContract, CONTRACT_ADDRESS } from "@/lib/chainproof/contract";

interface VerifyResult {
  hash: string;
  exists: boolean;
  fileName?: string;
  description?: string;
  uploadedAt?: bigint;
  owner?: string;
}

export function VerifyCard() {
  const [hash, setHash] = useState("");
  const [hashInput, setHashInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<VerifyResult | null>(null);

  async function onFile(f: File | null) {
    if (!f) return;
    setResult(null);
    setBusy(true);
    try {
      const h = await sha256OfFile(f);
      setHash(h);
      await runVerify(h);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function onManualVerify() {
    const normalized = normalizeHash(hashInput);
    if (!normalized) {
      toast.error("Hash must be 64 hex characters (with optional 0x prefix).");
      return;
    }
    setHash(normalized);
    setBusy(true);
    try {
      await runVerify(normalized);
    } finally {
      setBusy(false);
    }
  }

  async function runVerify(h: string) {
    if (!CONTRACT_ADDRESS) {
      toast.error("Contract address not configured (.env)");
      return;
    }
    try {
      const contract = await getReadContract();
      const [exists, fileName, description, uploadedAt, owner] =
        await contract.verifyDocument(h);
      setResult({ hash: h, exists, fileName, description, uploadedAt, owner });
    } catch (e) {
      toast.error("Verify failed: " + (e as Error).message);
    }
  }

  return (
    <Card className="p-6 shadow-soft border-border/60">
      <div className="flex items-center gap-3 mb-5">
        <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary grid place-items-center">
          <Search className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">Verify a document</h2>
          <p className="text-sm text-muted-foreground">
            Upload the file again or paste a hash to check the blockchain record.
          </p>
        </div>
      </div>

      <Tabs defaultValue="file">
        <TabsList className="grid grid-cols-2 w-full">
          <TabsTrigger value="file">Upload file</TabsTrigger>
          <TabsTrigger value="hash">Paste hash</TabsTrigger>
        </TabsList>

        <TabsContent value="file" className="pt-4">
          <Label htmlFor="vfile">Pick the file</Label>
          <Input
            id="vfile"
            type="file"
            onChange={(e) => onFile(e.target.files?.[0] ?? null)}
            className="mt-1"
          />
        </TabsContent>

        <TabsContent value="hash" className="pt-4 space-y-3">
          <div>
            <Label htmlFor="vhash">SHA-256 hash</Label>
            <Input
              id="vhash"
              placeholder="0x…"
              value={hashInput}
              onChange={(e) => setHashInput(e.target.value)}
              className="mt-1 font-mono"
            />
          </div>
          <Button onClick={onManualVerify} disabled={busy} className="w-full">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Verify"}
          </Button>
        </TabsContent>
      </Tabs>

      {busy && !result && (
        <div className="mt-4 text-sm text-muted-foreground flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" /> Checking blockchain…
        </div>
      )}

      {result && <ResultCard r={result} />}
    </Card>
  );
}

function ResultCard({ r }: { r: VerifyResult }) {
  if (r.exists) {
    return (
      <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 dark:bg-emerald-950/40 dark:border-emerald-900/60 p-4">
        <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 font-semibold">
          <ShieldCheck className="h-5 w-5" /> Verified — registered on blockchain
        </div>
        <dl className="mt-3 text-sm grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-6">
          <Field k="File name" v={r.fileName || "—"} />
          <Field k="Owner" v={r.owner ? shortAddress(r.owner) : "—"} mono />
          <Field
            k="Uploaded"
            v={r.uploadedAt ? formatTimestamp(r.uploadedAt) : "—"}
          />
          <Field k="Description" v={r.description || "—"} />
          <div className="sm:col-span-2">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">Hash</div>
            <code className="text-xs break-all font-mono">{r.hash}</code>
          </div>
        </dl>
      </div>
    );
  }
  return (
    <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-950/40 dark:border-amber-900/60 p-4">
      <div className="flex items-center gap-2 text-amber-800 dark:text-amber-200 font-semibold">
        <ShieldAlert className="h-5 w-5" /> Not found on blockchain
      </div>
      <p className="text-sm mt-2 text-amber-900/80 dark:text-amber-200/80">
        This file has either never been registered, or it has been modified since
        registration. Even one changed byte produces a completely different hash.
      </p>
      <code className="text-xs break-all font-mono block mt-2">{r.hash}</code>
    </div>
  );
}

function Field({ k, v, mono }: { k: string; v: string; mono?: boolean }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wide text-muted-foreground">{k}</div>
      <div className={mono ? "font-mono text-sm" : "text-sm"}>{v}</div>
    </div>
  );
}
