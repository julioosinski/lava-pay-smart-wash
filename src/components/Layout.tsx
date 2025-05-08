
import { ReactNode } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { useIsMobile } from "@/hooks/use-mobile";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const isMobile = useIsMobile();

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className={`flex-1 px-4 md:px-6 lg:px-8 w-full ${isMobile ? 'py-4' : 'py-6'}`}>
        {children}
      </main>
      <Footer />
    </div>
  );
}
