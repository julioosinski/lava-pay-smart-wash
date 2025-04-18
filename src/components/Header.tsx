
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { WashingMachine, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const isMobile = useIsMobile();

  const isActiveRoute = (path: string) => {
    return location.pathname === path;
  };

  const navItems = [
    { name: "Início", path: "/" },
    { name: "Admin", path: "/admin" },
    { name: "Proprietário", path: "/owner" },
  ];

  return (
    <header className="bg-lavapay-600 text-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2">
          <WashingMachine className="h-8 w-8" />
          <span className="text-xl font-bold">LavaPay Smart Wash</span>
        </Link>

        {isMobile ? (
          <>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-white hover:bg-lavapay-500"
            >
              {mobileMenuOpen ? <X /> : <Menu />}
            </Button>

            {mobileMenuOpen && (
              <div className="absolute top-16 left-0 right-0 bg-lavapay-600 shadow-lg z-50">
                <nav className="flex flex-col py-2">
                  {navItems.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={cn(
                        "px-4 py-3 hover:bg-lavapay-500 transition-colors",
                        isActiveRoute(item.path) && "bg-lavapay-700"
                      )}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {item.name}
                    </Link>
                  ))}
                </nav>
              </div>
            )}
          </>
        ) : (
          <nav className="flex items-center space-x-6">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "px-3 py-2 rounded-md hover:bg-lavapay-500 transition-colors",
                  isActiveRoute(item.path) && "bg-lavapay-700"
                )}
              >
                {item.name}
              </Link>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
}
