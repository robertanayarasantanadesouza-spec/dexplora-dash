import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ProcessosSemNotaProps {
  processos: Array<{
    processo: string;
    marca: string;
    modelo: string;
    valorTotal: number;
    base: string;
    dia: number;
  }>;
}

export const ProcessosSemNota = ({ processos }: ProcessosSemNotaProps) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  if (processos.length === 0) {
    return (
      <Card className="col-span-full border-success">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-success">
            ✅ Notas Fiscais em Dia
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Todos os processos possuem nota fiscal emitida!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-full border-warning">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-warning">
          <AlertCircle className="h-5 w-5" />
          ⚠️ Processos Pendentes de Nota Fiscal
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground mb-4">
            {processos.length} processo(s) sem nota fiscal emitida
          </p>
          <div className="max-h-[400px] overflow-y-auto space-y-2">
            {processos.map((processo, index) => (
              <div 
                key={index}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-foreground">
                      Processo {processo.processo}
                    </span>
                    <Badge variant="outline">{processo.base}</Badge>
                    <Badge variant="secondary">Dia {processo.dia}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {processo.marca} {processo.modelo}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-foreground">
                    {formatCurrency(processo.valorTotal)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
