import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

interface PaymentMethodsChartProps {
  data: {
    dinheiro: number;
    pix: number;
    transferencia: number;
    cartaoCredito: number;
  };
}

const COLORS = {
  dinheiro: "hsl(var(--chart-2))",
  pix: "hsl(var(--chart-1))",
  transferencia: "hsl(var(--chart-3))",
  cartaoCredito: "hsl(var(--chart-5))",
};

export const PaymentMethodsChart = ({ data }: PaymentMethodsChartProps) => {
  const chartData = [
    { name: "Dinheiro", value: data.dinheiro, color: COLORS.dinheiro },
    { name: "Pix", value: data.pix, color: COLORS.pix },
    { name: "Transfer.", value: data.transferencia, color: COLORS.transferencia },
    { name: "Cartão", value: data.cartaoCredito, color: COLORS.cartaoCredito },
  ].filter(item => item.value > 0);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <Card className="col-span-full lg:col-span-1">
      <CardHeader>
        <CardTitle>💳 Formas de Pagamento</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "var(--radius)",
              }}
              formatter={(value: number) => formatCurrency(value)}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
