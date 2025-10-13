export interface VehicleRelease {
  base: string;
  processo: string;
  marca: string;
  modelo: string;
  estadia: number;
  remocao: number;
  vistoria: number;
  seguro: number;
  km: number;
  valorTotal: number;
  dinheiro: number;
  pix: number;
  cartaoDebito: number;
  cartaoCredito: number;
  transferencia: number;
  troco: number;
  atendente: string;
  idPix: string;
  rpsNumero: string;
  dataLiberacao: string;
  dia: number;
}

export interface DashboardMetrics {
  totalEstadias: number;
  totalKm: number;
  totalRemocao: number;
  totalSeguro: number;
  totalVistoria: number;
  totalLucro: number;
  totalPorBase: {
    SP: number;
    SBC: number;
  };
  formasPagamento: {
    dinheiro: number;
    pix: number;
    transferencia: number;
    cartaoCredito: number;
  };
  rankingAtendentes: Array<{
    nome: string;
    liberacoes: number;
    valorTotal: number;
  }>;
  notas: {
    totalComNota: number;
    totalSemNota: number;
    processosSemNota: Array<{
      processo: string;
      marca: string;
      modelo: string;
      valorTotal: number;
      base: string;
      dia: number;
    }>;
  };
}
