import { ArrowLeftRight, MapPinned, ShieldCheck, UserCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const FEATURES = [
  {
    icon: ShieldCheck,
    title: "Ownership Verification",
    description: "Verify property ownership through blockchain records.",
  },
  {
    icon: UserCheck,
    title: "Agent Authorization",
    description: "Property owners can authorize agents to manage listings.",
  },
  {
    icon: ArrowLeftRight,
    title: "Transparent Transfers",
    description: "Track ownership transfers securely.",
  },
  {
    icon: MapPinned,
    title: "Smart Property Discovery",
    description:
      "Search and explore properties through advanced filters and interactive maps.",
  },
];

export function Features() {
  return (
    <section className="container py-16 lg:py-24">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Everything you need to trust the transaction
        </h2>
        <p className="mt-4 text-muted-foreground">
          A complete toolkit for owners, agents, and buyers — backed by verifiable on-chain records.
        </p>
      </div>
      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {FEATURES.map((f) => (
          <Card
            key={f.title}
            className="group transition-all hover:-translate-y-1 hover:shadow-glow"
          >
            <CardContent className="p-6">
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-brand text-primary-foreground shadow-glow transition-transform group-hover:scale-110">
                <f.icon className="h-6 w-6" />
              </div>
              <h3 className="mt-5 font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
