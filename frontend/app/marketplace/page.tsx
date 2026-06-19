import { redirect } from "next/navigation";
import { BUYER_MARKETPLACE_PATH } from "@/lib/routes";

export default function MarketplaceRedirectPage() {
  redirect(BUYER_MARKETPLACE_PATH);
}
