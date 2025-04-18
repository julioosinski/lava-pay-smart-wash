
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface RevenueData {
  day: string;
  amount: number;
}

interface RevenueChartProps {
  revenueByDay: RevenueData[];
}

export function RevenueChart({ revenueByDay }: RevenueChartProps) {
  const maxRevenue = Math.max(...revenueByDay.map(d => d.amount));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Receita Semanal</CardTitle>
        <CardDescription>Receita dos últimos 7 dias</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[200px] flex items-end justify-between gap-2">
          {revenueByDay.map((data) => (
            <div key={data.day} className="flex flex-col items-center">
              <div 
                className="bg-lavapay-500 w-8 rounded-t-md" 
                style={{ height: `${(data.amount / maxRevenue) * 160}px` }}
              ></div>
              <div className="text-xs mt-2">{data.day}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
