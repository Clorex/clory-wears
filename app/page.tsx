import SiteHeader from "./_components/SiteHeader";
import SiteFooter from "./_components/SiteFooter";
import HomePage from "./(store)/HomePage";

export default function Page() {
  return (
    <>
      <SiteHeader />
      <main style={{ minHeight: "72vh" }}>
        <HomePage />
      </main>
      <SiteFooter />
    </>
  );
}