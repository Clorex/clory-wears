import type { Metadata } from "next";
import ContactClient from "./contact-client";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contact CLORY WEARS support — ask questions about sizes, delivery, payments, or your order."
};

export default function ContactPage() {
  return <ContactClient />;
}