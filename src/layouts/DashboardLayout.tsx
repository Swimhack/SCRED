
import { ReactNode } from "react";
import PharmacistSidebar from "@/components/PharmacistSidebar";
import Header from "@/components/Header";
import EmailVerificationBanner from "@/components/EmailVerificationBanner";

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <PharmacistSidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <EmailVerificationBanner />
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
