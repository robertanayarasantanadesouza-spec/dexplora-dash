import { useState } from "react";
import { FileUploader } from "@/components/dashboard/FileUploader";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { AttendantRanking } from "@/components/dashboard/AttendantRanking";
import { PaymentMethodsChart } from "@/components/dashboard/PaymentMethodsChart";
import { BaseComparisonChart } from "@/components/dashboard/BaseComparisonChart";
import { ProcessosSemNota } from "@/components/dashboard/ProcessosSemNota";
import { parseExcelData, calculateMetrics } from "@/utils/excelParser";
import { DashboardMetrics } from "@/types/financial";
import { 
  DollarSign, 
  TrendingUp, 
  MapPin, 
  Shield, 
  ClipboardCheck,
  Banknote,
  FileText
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleFileSelect = async (file: File) => {
    setIsLoading(true);
    try {
      const releases = await parseExcelData(file);
      const calculatedMetrics = calculateMetrics(releases);
      setMetrics(calculatedMetrics);
      
      toast({
        title: "✅ Planilha carregada com sucesso!",
        description: `${releases.length} liberações processadas.`,
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "❌ Erro ao processar planilha",
        description: "Verifique se o arquivo está no formato correto.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-primary">
            Relatório Financeiro - Pátio SBC
          </h1>
          <p className="text-muted-foreground mt-1">
            Relatório mensal de liberações de veículos
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {!metrics ? (
          <FileUploader onFileSelect={handleFileSelect} isLoading={isLoading} />
        ) : (
          <div className="space-y-8">
            {/* KPIs */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <MetricCard
                title="💰 Lucro Total"
                value={formatCurrency(metrics.totalLucro)}
                icon={DollarSign}
                variant="success"
              />
              <MetricCard
                title="🏨 Total de Estadias"
                value={formatCurrency(metrics.totalEstadias)}
                icon={Banknote}
                variant="default"
              />
              <MetricCard
                title="🚚 Total de Remoções"
                value={formatCurrency(metrics.totalRemocao)}
                icon={TrendingUp}
                variant="info"
              />
              <MetricCard
                title="📏 Total KM"
                value={formatCurrency(metrics.totalKm)}
                icon={MapPin}
                variant="warning"
              />
              <MetricCard
                title="🛡️ Total de Seguros"
                value={formatCurrency(metrics.totalSeguro)}
                icon={Shield}
                variant="default"
              />
              <MetricCard
                title="✅ Total de Vistorias"
                value={formatCurrency(metrics.totalVistoria)}
                icon={ClipboardCheck}
                variant="info"
              />
              <MetricCard
                title="📄 Notas Emitidas"
                value={`${metrics.notas.totalComNota} / ${metrics.notas.totalComNota + metrics.notas.totalSemNota}`}
                icon={FileText}
                variant={metrics.notas.totalSemNota === 0 ? "success" : "warning"}
              />
            </div>

            {/* Charts */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <AttendantRanking data={metrics.rankingAtendentes} />
              <PaymentMethodsChart data={metrics.formasPagamento} />
              <BaseComparisonChart data={metrics.totalPorBase} />
            </div>
            
            {/* Processos sem nota */}
            <ProcessosSemNota processos={metrics.notas.processosSemNota} />

            {/* Upload another file button */}
            <div className="flex justify-center pt-8">
              <button
                onClick={() => setMetrics(null)}
                className="text-primary hover:underline text-sm font-medium"
              >
                📂 Carregar outra planilha
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
