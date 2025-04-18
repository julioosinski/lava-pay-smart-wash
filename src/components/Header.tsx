
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { WashingMachine, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/contexts/AuthContext";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isMobile = useIsMobile();

  const isActiveRoute = (path: string) => {
    return location.pathname === path;
  };

  const handleAdminAccess = () => {
    navigate('/auth', { state: { role: 'admin' } });
  };

  const handleOwnerAccess = () => {
    navigate('/auth', { state: { role: 'business' } });
  };

  const navItems = [
    { name: "Início", path: "/" },
    { name: "Admin", action: handleAdminAccess },
    { name: "Proprietário", action: handleOwnerAccess },
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
                    item.path ? (
                      <Link
                        key={item.name}
                        to={item.path}
                        className={cn(
                          "px-4 py-3 hover:bg-lavapay-500 transition-colors",
                          isActiveRoute(item.path) && "bg-lavapay-700"
                        )}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {item.name}
                      </Link>
                    ) : (
                      <button
                        key={item.name}
                        className="px-4 py-3 hover:bg-lavapay-500 transition-colors text-left"
                        onClick={() => {
                          item.action && item.action();
                          setMobileMenuOpen(false);
                        }}
                      >
                        {item.name}
                      </button>
                    )
                  ))}
                </nav>
              </div>
            )}
          </>
        ) : (
          <nav className="flex items-center space-x-6">
            {navItems.map((item) => (
              item.path ? (
                <Link
                  key={item.name}
                  to={item.path}
                  className={cn(
                    "px-3 py-2 rounded-md hover:bg-lavapay-500 transition-colors",
                    isActiveRoute(item.path) && "bg-lavapay-700"
                  )}
                >
                  {item.name}
                </Link>
              ) : (
                <button
                  key={item.name}
                  className="px-3 py-2 rounded-md hover:bg-lavapay-500 transition-colors text-white"
                  onClick={item.action}
                >
                  {item.name}
                </button>
              )
            ))}
          </nav>
        )}
      </div>
    </header>
  );
}
