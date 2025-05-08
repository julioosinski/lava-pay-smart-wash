
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: "available" | "in-use" | "maintenance" | "pending" | "approved" | "rejected";
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const statusConfig = {
    available: {
      color: "bg-green-100 text-green-800 hover:bg-green-100",
      label: "Disponível"
    },
    "in-use": {
      color: "bg-blue-100 text-blue-800 hover:bg-blue-100",
      label: "Em Uso"
    },
    maintenance: {
      color: "bg-orange-100 text-orange-800 hover:bg-orange-100",
      label: "Manutenção"
    },
    pending: {
      color: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
      label: "Pendente"
    },
    approved: {
      color: "bg-green-100 text-green-800 hover:bg-green-100",
      label: "Aprovado"
    },
    rejected: {
      color: "bg-red-100 text-red-800 hover:bg-red-100",
      label: "Rejeitado"
    }
  };

  const config = statusConfig[status];

  return (
    <Badge className={cn(config.color, "capitalize font-normal")}>
      {config.label}
    </Badge>
  );
}
