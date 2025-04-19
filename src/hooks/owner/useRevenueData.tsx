
import { Payment } from "@/types";

export function useRevenueData(payments: Payment[]) {
  // For now using simulated data, this could be enhanced to calculate real daily revenue
  const revenueByDay = [
    { day: 'Seg', amount: 320 },
    { day: 'Ter', amount: 280 },
    { day: 'Qua', amount: 340 },
    { day: 'Qui', amount: 380 },
    { day: 'Sex', amount: 450 },
    { day: 'Sáb', amount: 520 },
    { day: 'Dom', amount: 390 },
  ];

  return { revenueByDay };
}
