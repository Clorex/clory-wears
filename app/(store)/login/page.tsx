import type { Metadata } from "next";
import LoginClient from "./login-client";

export const metadata: Metadata = {
  title: "Login / Register",
  description: "Login or create your CLORY WEARS account to checkout, upload receipts, and track orders."
};

export default function LoginPage() {
  return <LoginClient />;
}