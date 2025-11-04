import { useState } from "react";
import { FileUploader } from "@/components/dashboard/FileUploader";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { AttendantRanking } from "@/components/dashboard/AttendantRanking";
import { PaymentMethodsChart } from "@/components/dashboard/PaymentMethodsChart";
import { BaseComparisonChart } from "@/components/dashboard/BaseComparisonChart";
import { ProcessosSemNota } from "@/components/dashboard/ProcessosSemNota";
import { parseExcelData, calculateMetrics } from "@/utils/excelParser";
import { DashboardMetrics } from "@/types/financial";
import { Button } from "@/components/ui/button";
import { 
  DollarSign, 
  TrendingUp, 
  MapPin, 
  Shield, 
  ClipboardCheck,
  Banknote,
  FileText,
  Printer
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

  const handlePrintDashboard = () => {
    const printContent = document.getElementById('dashboard-content');
    const notasSection = document.getElementById('notas-pendentes');
    
    if (printContent && notasSection) {
      // Ocultar temporariamente a seção de notas pendentes
      notasSection.style.display = 'none';
      
      window.print();
      
      // Restaurar a seção de notas pendentes
      notasSection.style.display = 'block';
    }
  };

  const handlePrintNotas = () => {
    if (!metrics) return;
    
    // Criar uma nova janela para impressão
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    const processos = metrics.notas.processosSemNota;
    const totalPendente = processos.reduce((sum, p) => sum + p.valorTotal, 0);
    
    // Criar o conteúdo HTML do relatório
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Relatório de Pendências - Notas Fiscais</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: system-ui, -apple-system, sans-serif; 
            padding: 40px; 
            color: #1e293b;
            background: white;
          }
          .header { 
            text-align: center; 
            margin-bottom: 40px; 
            padding-bottom: 20px;
            border-bottom: 3px solid #4f46e5;
          }
          .header h1 { 
            color: #4f46e5; 
            font-size: 28px; 
            margin-bottom: 8px;
          }
          .header p { 
            color: #64748b; 
            font-size: 14px;
          }
          .summary {
            background: #f1f5f9;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 30px;
            border-left: 4px solid #f59e0b;
          }
          .summary h2 {
            color: #f59e0b;
            font-size: 18px;
            margin-bottom: 10px;
          }
          .summary-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 15px;
            margin-top: 15px;
          }
          .summary-item {
            display: flex;
            flex-direction: column;
          }
          .summary-label {
            font-size: 12px;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .summary-value {
            font-size: 20px;
            font-weight: bold;
            color: #1e293b;
            margin-top: 4px;
          }
          table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-top: 20px;
          }
          th { 
            background: #4f46e5; 
            color: white; 
            padding: 12px; 
            text-align: left;
            font-size: 13px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          td { 
            padding: 12px; 
            border-bottom: 1px solid #e2e8f0;
            font-size: 14px;
          }
          tr:hover { 
            background: #f8fafc; 
          }
          .badge {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 11px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.3px;
          }
          .badge-base {
            background: #dbeafe;
            color: #1e40af;
          }
          .badge-dia {
            background: #fef3c7;
            color: #92400e;
          }
          .total-row {
            background: #f1f5f9 !important;
            font-weight: bold;
            border-top: 2px solid #4f46e5;
          }
          .footer {
            margin-top: 40px;
            text-align: center;
            color: #94a3b8;
            font-size: 12px;
            padding-top: 20px;
            border-top: 1px solid #e2e8f0;
          }
          @media print {
            body { padding: 20px; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>⚠️ Relatório de Pendências - Notas Fiscais</h1>
          <p>Pátio SBC - ${new Date().toLocaleDateString('pt-BR', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
        
        <div class="summary">
          <h2>📊 Resumo Executivo</h2>
          <div class="summary-grid">
            <div class="summary-item">
              <span class="summary-label">Total de Pendências</span>
              <span class="summary-value">${processos.length} processo(s)</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">Valor Total Pendente</span>
              <span class="summary-value">${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalPendente)}</span>
            </div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Processo</th>
              <th>Marca/Modelo</th>
              <th>Base</th>
              <th>Dia</th>
              <th style="text-align: right;">Valor Total</th>
            </tr>
          </thead>
          <tbody>
            ${processos.map(p => `
              <tr>
                <td><strong>${p.processo}</strong></td>
                <td>${p.marca} ${p.modelo}</td>
                <td><span class="badge badge-base">${p.base}</span></td>
                <td><span class="badge badge-dia">Dia ${p.dia}</span></td>
                <td style="text-align: right;"><strong>${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(p.valorTotal)}</strong></td>
              </tr>
            `).join('')}
            <tr class="total-row">
              <td colspan="4" style="text-align: right;">TOTAL PENDENTE:</td>
              <td style="text-align: right;">${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalPendente)}</td>
            </tr>
          </tbody>
        </table>

        <div class="footer">
          <p>Relatório gerado automaticamente • ${new Date().toLocaleString('pt-BR')}</p>
        </div>

        <script>
          window.onload = function() {
            window.print();
            window.onafterprint = function() {
              window.close();
            };
          };
        </script>
      </body>
      </html>
    `;
    
    printWindow.document.write(htmlContent);
    printWindow.document.close();
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
            {/* Botões de Impressão */}
            <div className="flex gap-4 justify-end no-print">
              <Button onClick={handlePrintDashboard} variant="outline" className="gap-2">
                <Printer className="h-4 w-4" />
                Imprimir Dashboard
              </Button>
              <Button onClick={handlePrintNotas} variant="outline" className="gap-2">
                <Printer className="h-4 w-4" />
                Imprimir Pendências
              </Button>
            </div>

            {/* Dashboard Content */}
            <div id="dashboard-content">
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
            </div>
            
            {/* Processos sem nota */}
            <div id="notas-pendentes">
              <ProcessosSemNota processos={metrics.notas.processosSemNota} />
            </div>

            {/* Upload another file button */}
            <div className="flex justify-center pt-8 no-print">
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
