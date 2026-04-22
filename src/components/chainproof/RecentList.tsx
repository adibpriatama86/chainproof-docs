import { useEffect, useState, useCallback } from "react";
import { Clock, RefreshCw } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getReadContract, CONTRACT_ADDRESS } from "@/lib/chainproof/contract";
import {
  formatTimestamp,
  shortAddress,
  shortHash,
} from "@/lib/chainproof/utils";

interface Doc {
  hash: string;
  fileName: string;
  description: string;
  uploadedAt: bigint;
  owner: string;
}

export function RecentList({ refreshKey = 0 }: { refreshKey?: number }) {
  const [docs, setDocs] = useState<Doc[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!CONTRACT_ADDRESS) {
      setError("Contract address not configured");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const contract = await getReadContract();
      const hashes: string[] = await contract.getAllDocumentHashes();
      const recent = hashes.slice(-10).reverse();
      const items = await Promise.all(
        recent.map(async (h) => {
          const [, fileName, description, uploadedAt, owner] =
            await contract.verifyDocument(h);
          return { hash: h, fileName, description, uploadedAt, owner } as Doc;
        }),
      );
      setDocs(items);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load, refreshKey]);

  return (
    <Card className="p-6 shadow-soft border-border/60">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary grid place-items-center">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Recent registrations</h2>
            <p className="text-sm text-muted-foreground">
              Latest documents recorded on-chain.
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={load} disabled={loading}>
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      {error && (
        <p className="text-sm text-muted-foreground">
          Could not load list: {error}
        </p>
      )}

      {!error && docs && docs.length === 0 && (
        <p className="text-sm text-muted-foreground">
          No documents have been registered yet. Be the first!
        </p>
      )}

      <ul className="space-y-3">
        {docs?.map((d) => (
          <li
            key={d.hash}
            className="rounded-lg border border-border/60 bg-muted/30 p-3 text-sm"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="font-medium">{d.fileName || "(unnamed)"}</div>
              <div className="text-xs text-muted-foreground">
                {formatTimestamp(d.uploadedAt)}
              </div>
            </div>
            <div className="text-xs text-muted-foreground mt-1 font-mono">
              {shortHash(d.hash)} • by {shortAddress(d.owner)}
            </div>
            {d.description && (
              <div className="text-xs mt-1 text-muted-foreground">
                {d.description}
              </div>
            )}
          </li>
        ))}
      </ul>
    </Card>
  );
}
