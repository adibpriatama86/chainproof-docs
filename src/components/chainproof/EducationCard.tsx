import { Card } from "@/components/ui/card";
import { BookOpen } from "lucide-react";

export function EducationCard() {
  return (
    <Card className="p-6 shadow-soft border-border/60">
      <div className="flex items-center gap-3 mb-4">
        <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary grid place-items-center">
          <BookOpen className="h-5 w-5" />
        </div>
        <h2 className="text-lg font-semibold">How it works</h2>
      </div>
      <div className="grid sm:grid-cols-2 gap-4 text-sm">
        <Item title="What is SHA-256?">
          A one-way hash function that turns any file into a fixed 64-character
          fingerprint. You cannot recover the file from the hash.
        </Item>
        <Item title="Why hashes prove integrity">
          Change a single byte in the file and the resulting hash is completely
          different. So a matching hash means the file is byte-for-byte
          identical.
        </Item>
        <Item title="Why use a blockchain?">
          Once a hash is written to a block, it cannot be silently edited or
          back-dated. It becomes a public, timestamped proof anyone can verify.
        </Item>
        <Item title="Hash vs full file">
          We never upload the document itself — only its hash. Your file stays
          private on your computer while still being provable.
        </Item>
      </div>
    </Card>
  );
}

function Item({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border/60 bg-muted/30 p-4">
      <div className="font-medium mb-1">{title}</div>
      <p className="text-muted-foreground">{children}</p>
    </div>
  );
}
