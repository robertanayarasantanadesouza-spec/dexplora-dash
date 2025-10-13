import * as XLSX from 'xlsx';
import { VehicleRelease, DashboardMetrics } from '@/types/financial';

const parseMoneyValue = (value: any): number => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const cleaned = value.replace(/[R$\s.]/g, '').replace(',', '.');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
};

export const parseExcelData = async (file: File): Promise<VehicleRelease[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        
        const allReleases: VehicleRelease[] = [];
        
        // Iterar por todas as abas (cada aba é um dia)
        workbook.SheetNames.forEach((sheetName, index) => {
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          
          // Encontrar a linha do cabeçalho
          let headerRow = -1;
          for (let i = 0; i < Math.min(5, jsonData.length); i++) {
            const row = jsonData[i] as any[];
            if (row.some((cell: any) => 
              typeof cell === 'string' && 
              (cell.includes('BASE') || cell.includes('Processo'))
            )) {
              headerRow = i;
              break;
            }
          }
          
          if (headerRow === -1) return;
          
          const headers = jsonData[headerRow] as string[];
          const dataRows = jsonData.slice(headerRow + 1);
          
          dataRows.forEach((row: any) => {
            // Ignorar linhas vazias ou de totais
            if (!row[0] || row[0].toString().includes('Total')) return;
            
            const release: VehicleRelease = {
              base: row[0]?.toString() || '',
              processo: row[1]?.toString() || '',
              marca: row[2]?.toString() || '',
              modelo: row[3]?.toString() || '',
              estadia: parseMoneyValue(row[4]),
              remocao: parseMoneyValue(row[5]),
              vistoria: parseMoneyValue(row[6]),
              seguro: parseMoneyValue(row[7]),
              km: parseMoneyValue(row[8]),
              valorTotal: parseMoneyValue(row[9]),
              dinheiro: parseMoneyValue(row[10]),
              pix: parseMoneyValue(row[11]),
              cartaoDebito: parseMoneyValue(row[12]),
              cartaoCredito: parseMoneyValue(row[13]),
              transferencia: parseMoneyValue(row[14]),
              troco: parseMoneyValue(row[15]),
              atendente: row[16]?.toString() || '',
              idPix: row[17]?.toString() || '',
              rpsNumero: row[18]?.toString() || '',
              dataLiberacao: row[19]?.toString() || '',
              dia: index + 1,
            };
            
            if (release.valorTotal > 0) {
              allReleases.push(release);
            }
          });
        });
        
        resolve(allReleases);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
    reader.readAsBinaryString(file);
  });
};

export const calculateMetrics = (releases: VehicleRelease[]): DashboardMetrics => {
  const metrics: DashboardMetrics = {
    totalEstadias: 0,
    totalKm: 0,
    totalRemocao: 0,
    totalSeguro: 0,
    totalVistoria: 0,
    totalLucro: 0,
    totalPorBase: {
      SP: 0,
      SBC: 0,
    },
    formasPagamento: {
      dinheiro: 0,
      pix: 0,
      transferencia: 0,
      cartaoCredito: 0,
    },
    rankingAtendentes: [],
    notas: {
      totalComNota: 0,
      totalSemNota: 0,
      processosSemNota: [],
    },
  };
  
  const atendentesMap = new Map<string, { liberacoes: number; valorTotal: number }>();
  
  releases.forEach((release) => {
    metrics.totalEstadias += release.estadia;
    metrics.totalKm += release.km;
    metrics.totalRemocao += release.remocao;
    metrics.totalSeguro += release.seguro;
    metrics.totalVistoria += release.vistoria;
    metrics.totalLucro += release.valorTotal;
    
    // Lucro por base
    if (release.base === 'SP') {
      metrics.totalPorBase.SP += release.valorTotal;
    } else if (release.base === 'SBC') {
      metrics.totalPorBase.SBC += release.valorTotal;
    }
    
    // Formas de pagamento
    metrics.formasPagamento.dinheiro += release.dinheiro;
    metrics.formasPagamento.pix += release.pix;
    metrics.formasPagamento.transferencia += release.transferencia;
    metrics.formasPagamento.cartaoCredito += Math.abs(release.cartaoCredito);
    
    // Ranking de atendentes
    if (release.atendente) {
      // Pegar apenas o primeiro nome
      const primeiroNome = release.atendente.trim().split(' ')[0];
      const current = atendentesMap.get(primeiroNome) || { liberacoes: 0, valorTotal: 0 };
      atendentesMap.set(primeiroNome, {
        liberacoes: current.liberacoes + 1,
        valorTotal: current.valorTotal + release.valorTotal,
      });
    }
    
    // Controle de notas fiscais
    const temNota = release.rpsNumero && 
                    release.rpsNumero.trim() !== '' && 
                    release.rpsNumero.toUpperCase() !== 'ISENTO';
    
    if (temNota) {
      metrics.notas.totalComNota++;
    } else {
      metrics.notas.totalSemNota++;
      metrics.notas.processosSemNota.push({
        processo: release.processo,
        marca: release.marca,
        modelo: release.modelo,
        valorTotal: release.valorTotal,
        base: release.base,
        dia: release.dia,
      });
    }
  });
  
  // Converter map para array e ordenar
  metrics.rankingAtendentes = Array.from(atendentesMap.entries())
    .map(([nome, data]) => ({ nome, ...data }))
    .sort((a, b) => b.liberacoes - a.liberacoes);
  
  return metrics;
};
