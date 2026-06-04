import { Navbar } from "@/components/marketing/navbar";
import { Footer } from "@/components/marketing/footer";
import { MaintenanceGate } from "@/components/system/maintenance-gate";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <MaintenanceGate>
      <Navbar />
      <main id="main" className="relative">
        {children}
      </main>
      <Footer />
    </MaintenanceGate>
  );
}
