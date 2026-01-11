import type { Metadata } from "next";
import AdminClient from "./admin-client";

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description:
    "CLORY WEARS Admin — view all orders, review receipts, and mark payments as paid or rejected."
};

export default function AdminPage() {
  return <AdminClient />;
}