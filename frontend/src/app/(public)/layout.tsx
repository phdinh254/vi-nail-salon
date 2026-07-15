import { PublicHeader } from "@/components/layout/public-header";
import { PublicFooter } from "@/components/layout/public-footer";
import { MobileBookingBar } from "@/components/layout/mobile-booking-bar";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-full flex-col">
      <PublicHeader />
      <main className="flex-1 pb-20 lg:pb-0">{children}</main>
      <PublicFooter />
      <MobileBookingBar />
    </div>
  );
}
