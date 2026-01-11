import type { Metadata } from "next";
import AccountClient from "./account-client";

export const metadata: Metadata = {
  title: "My Account",
  description:
    "Your CLORY WEARS account — view your orders, receipt status, and payment confirmation history."
};

export default function AccountPage() {
  return <AccountClient />;
}