
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";

export interface OwnerDashboardHeaderProps {
  title: string;
  subtitle: string;
  isAdmin?: boolean;
}

export function OwnerDashboardHeader({ title, subtitle, isAdmin }: OwnerDashboardHeaderProps) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-2">
        <h1 className="text-3xl font-bold">{title}</h1>
        <Button variant="outline" className="h-9">
          <ChevronDown className="h-4 w-4 mr-2" />
          Lavanderias
        </Button>
        {isAdmin && (
          <span className="bg-lavapay-100 text-lavapay-800 text-xs px-2 py-1 rounded-full">
            Admin
          </span>
        )}
      </div>
      <p className="text-gray-500">{subtitle}</p>
    </div>
  );
}
