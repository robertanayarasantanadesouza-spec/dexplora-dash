import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  trend?: number;
  variant?: "default" | "success" | "warning" | "info";
}

export const MetricCard = ({ title, value, icon: Icon, trend, variant = "default" }: MetricCardProps) => {
  const variantColors = {
    default: "text-primary",
    success: "text-success",
    warning: "text-warning",
    info: "text-info",
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className={`h-5 w-5 ${variantColors[variant]}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {trend !== undefined && (
          <p className={`text-xs mt-1 ${trend >= 0 ? 'text-success' : 'text-destructive'}`}>
            {trend >= 0 ? '+' : ''}{trend}% vs. mês anterior
          </p>
        )}
      </CardContent>
    </Card>
  );
};
