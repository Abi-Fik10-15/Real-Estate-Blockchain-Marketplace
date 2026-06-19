import { redirect } from "next/navigation";

export default function BuyerProfileRedirect() {
  redirect("/dashboard/buyer/settings");
}
