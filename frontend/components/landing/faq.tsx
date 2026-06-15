"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/ui/motion";

const FAQ_ITEMS = [
  {
    question: "How does blockchain property verification work?",
    answer:
      "ChainEstate uses a combination of government title registry oracles, AI document verification, and blockchain consensus to create an immutable ownership record. When a property is submitted, our verification engine cross-references ownership documents against multiple data sources and, upon confirmation, mints a unique on-chain record that serves as cryptographic proof of ownership.",
  },
  {
    question: "Can ownership records be changed or tampered with?",
    answer:
      "No. Once a property ownership record is written to the blockchain, it becomes immutable — meaning it cannot be altered, deleted, or falsified by any party, including ChainEstate. Changes to ownership only occur through verified smart contract transfers that require cryptographic signatures from the current owner.",
  },
  {
    question: "How secure are the smart contracts?",
    answer:
      "Our smart contracts are audited by industry-leading security firms including Certik and OpenZeppelin. We follow established Solidity best practices, implement multi-signature governance, and conduct regular penetration testing. All contract code is open-source and verifiable on-chain.",
  },
  {
    question: "How are agents authorized on the platform?",
    answer:
      "Property owners grant agent authorization through an on-chain transaction that creates a verifiable permission record. Agents must complete KYC verification, provide valid real estate licensing documentation, and be approved by the platform before they can be authorized by owners to manage listings.",
  },
  {
    question: "What happens during a property transfer?",
    answer:
      "When a transfer is initiated, our smart contract handles the entire process: it verifies both parties' identities, manages escrow funds, updates the ownership record on-chain, revokes previous agent authorizations, and generates a complete audit trail — all within minutes rather than the weeks required by traditional systems.",
  },
  {
    question: "How long does property verification take?",
    answer:
      "Initial property verification typically takes 24-48 hours as we cross-reference documents with government registries. Once verified, subsequent ownership checks are instant — completed in under 30 seconds through our blockchain query system. Re-verification after transfers is automatic.",
  },
  {
    question: "What blockchain network does ChainEstate use?",
    answer:
      "ChainEstate is built on Ethereum with Layer 2 scaling solutions for fast, cost-effective transactions. We support EVM-compatible wallets including MetaMask, Coinbase Wallet, and WalletConnect. Future updates will add multi-chain support for Polygon, Arbitrum, and other networks.",
  },
  {
    question: "Is ChainEstate available internationally?",
    answer:
      "Yes. ChainEstate currently supports property verification in 30+ countries across North America, Europe, Middle East, and Asia Pacific. We're actively expanding to more jurisdictions and working with local regulatory bodies to ensure compliance with regional property laws.",
  },
  {
    question: "What are the fees for using ChainEstate?",
    answer:
      "ChainEstate charges a one-time verification fee (0.1% of property value, minimum $99) and a transfer facilitation fee (0.25% of transaction value). Agent subscriptions start at $49/month for basic plans. There are no hidden fees, and all charges are transparently recorded on-chain.",
  },
  {
    question: "How does property tokenization work?",
    answer:
      "Property tokenization allows fractional ownership by dividing a property into digital tokens on the blockchain. Each token represents a proportional share of the property's value and rights. This enables smaller investors to participate in high-value real estate markets. Full tokenization support launches in Q4 2026.",
  },
  {
    question: "What wallets are supported?",
    answer:
      "We support all major EVM-compatible wallets including MetaMask, Coinbase Wallet, Trust Wallet, and WalletConnect. Simply connect your preferred wallet to start verifying properties, managing listings, and executing transfers on the platform.",
  },
  {
    question: "How do I report a suspicious property listing?",
    answer:
      "Every property page has a 'Report' button that flags the listing for immediate review. Our fraud detection team, combined with AI monitoring systems, investigates flagged properties within 24 hours. Verified fraudulent listings are permanently removed and reported to relevant authorities.",
  },
  {
    question: "Can I use ChainEstate for commercial properties?",
    answer:
      "Absolutely. ChainEstate supports all property types including residential, commercial, industrial, and mixed-use. Commercial properties benefit from additional features like multi-party ownership tracking, lease management, and tenant verification through smart contracts.",
  },
  {
    question: "What data privacy protections are in place?",
    answer:
      "We are fully GDPR and CCPA compliant. Personal data is encrypted using AES-256 encryption, stored in SOC 2 Type II certified data centers, and never shared without explicit consent. On-chain records contain only cryptographic hashes, not personal information, ensuring privacy by design.",
  },
  {
    question: "How can I become a verified agent on ChainEstate?",
    answer:
      "To become a verified agent: (1) Create an account and select 'Agent' role, (2) Submit valid real estate license documentation, (3) Complete KYC/AML identity verification, (4) Pass our platform certification quiz. Approved agents receive a verified badge and can be authorized by property owners within 48 hours.",
  },
];

function AccordionItem({
  item,
  isOpen,
  onToggle,
}: {
  item: (typeof FAQ_ITEMS)[0];
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="group overflow-hidden rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm transition-all duration-300 hover:border-border">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left transition-colors"
        aria-expanded={isOpen}
      >
        <span className="text-sm font-semibold leading-relaxed sm:text-base">
          {item.question}
        </span>
        <ChevronDown
          className={`h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-300 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.25, 0.4, 0, 1] }}
          >
            <div className="border-t border-border/30 px-6 pb-5 pt-4">
              <p className="text-sm leading-relaxed text-muted-foreground">
                {item.answer}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function FAQ() {
  const [openIndex, setOpenIndex] = React.useState<number | null>(0);

  return (
    <section id="faq" className="relative overflow-hidden py-20 lg:py-28">
      {/* Background */}
      <div className="absolute inset-0 -z-10 section-gradient" />
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="glow-orb right-1/3 top-0 h-[400px] w-[400px] bg-[hsl(199,89%,48%)] opacity-[0.04]" />
      </div>

      <div className="container">
        <FadeIn className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            Frequently Asked{" "}
            <span className="text-gradient">Questions</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Everything you need to know about ChainEstate&apos;s blockchain-powered
            property verification platform.
          </p>
        </FadeIn>

        <div className="mx-auto mt-14 max-w-3xl space-y-3">
          {FAQ_ITEMS.map((item, i) => (
            <FadeIn key={i} delay={Math.min(i * 0.05, 0.5)}>
              <AccordionItem
                item={item}
                isOpen={openIndex === i}
                onToggle={() =>
                  setOpenIndex(openIndex === i ? null : i)
                }
              />
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
