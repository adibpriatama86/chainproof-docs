import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ShieldCheck, Github } from "lucide-react";
import { Toaster } from "@/components/ui/sonner";
import { WalletCard } from "@/components/chainproof/WalletCard";
import { RegisterCard } from "@/components/chainproof/RegisterCard";
import { VerifyCard } from "@/components/chainproof/VerifyCard";
import { RecentList } from "@/components/chainproof/RecentList";
import { EducationCard } from "@/components/chainproof/EducationCard";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "ChainProof — Blockchain Document Integrity" },
      {
        name: "description",
        content:
          "Prove the integrity of any document by registering its SHA-256 hash on the blockchain. Beginner-friendly Web3 demo built with React, ethers.js and Solidity.",
      },
      { property: "og:title", content: "ChainProof — Blockchain Document Integrity" },
      {
        property: "og:description",
        content:
          "Register and verify file hashes on-chain. Browser-side SHA-256 hashing + Solidity smart contract.",
      },
    ],
  }),
});

function Index() {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="min-h-screen">
      <Toaster richColors position="top-right" />

      <header className="border-b border-border/60 bg-background/70 backdrop-blur sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-primary text-primary-foreground grid place-items-center shadow-soft">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="font-semibold leading-tight">ChainProof</div>
              <div className="text-xs text-muted-foreground leading-tight">
                Document integrity on blockchain
              </div>
            </div>
          </div>
          <a
            href="https://hardhat.org/"
            target="_blank"
            rel="noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <Github className="h-4 w-4" /> Local + Sepolia ready
          </a>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-5 py-10 space-y-8">
        <section className="text-center max-w-2xl mx-auto pt-4">
          <span className="inline-block text-xs font-medium tracking-wider uppercase text-primary bg-primary/10 px-3 py-1 rounded-full">
            Web3 · SHA-256 · Solidity
          </span>
          <h1 className="text-4xl sm:text-5xl font-bold mt-4 tracking-tight">
            Prove your document hasn't changed,{" "}
            <span className="text-primary">forever.</span>
          </h1>
          <p className="mt-4 text-muted-foreground">
            ChainProof hashes your file in the browser with SHA-256 and stores
            that fingerprint on a blockchain. Anyone can later upload the same
            file to confirm it matches the on-chain record — bit-for-bit.
          </p>
        </section>

        <WalletCard />

        <div className="grid lg:grid-cols-2 gap-6">
          <RegisterCard onRegistered={() => setRefreshKey((k) => k + 1)} />
          <VerifyCard />
        </div>

        <RecentList refreshKey={refreshKey} />

        <EducationCard />

        <footer className="text-center text-xs text-muted-foreground pt-6 pb-10">
          Built for a Data Security &amp; Blockchain class · React + ethers.js +
          Solidity
        </footer>
      </main>
    </div>
  );
}
