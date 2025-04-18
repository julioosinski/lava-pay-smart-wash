
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";

interface OwnerDashboardHeaderProps {
  title: string;
  subtitle: string;
}

export function OwnerDashboardHeader({ title, subtitle }: OwnerDashboardHeaderProps) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-2">
        <h1 className="text-3xl font-bold">{title}</h1>
        <Button variant="outline" className="h-9">
          <ChevronDown className="h-4 w-4 mr-2" />
          Suas Lavanderias
        </Button>
      </div>
      <p className="text-gray-500">{subtitle}</p>
    </div>
  );
}
