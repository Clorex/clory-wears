import SiteHeader from "../_components/SiteHeader";
import SiteFooter from "../_components/SiteFooter";

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main style={{ minHeight: "72vh" }}>{children}</main>
      <SiteFooter />
    </>
  );
}