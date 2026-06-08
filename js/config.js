/* =========================================================
   FUNCIONÁRIO ARTIFICIAL — Configuração
   ========================================================= */

const CONFIG = {
  brand: 'Funcionário Artificial',
  shortBrand: 'F·A',
  currency: 'R$',

  /* -------------------------------------------------------
     VISÍVEL AO PÚBLICO — assinatura mensal para usar o site.
     Cliente e Programador pagam o MESMO valor.
  ------------------------------------------------------- */
  access: {
    monthly: 299.00,       // R$ 299 / mês para qualquer um dos dois perfis
    periodDays: 30
  },

  /* Dados de cobrança via PIX (fase inicial — pagamento manual) */
  pix: {
    key:  '40468707883',           // chave PIX (CPF)
    keyType: 'CPF',
    name: 'FUNCIONARIO ARTIFICIAL', // máx. 25 caracteres, sem acento
    city: 'SAO PAULO'               // máx. 15 caracteres, sem acento
  }
};

/* =========================================================================
   ███  LÓGICA PRIVADA DO DONO — NÃO é divulgada em NENHUMA página pública.
   ███  A comissão só é exibida ao FECHAR O ACORDO PELO SITE.
   ========================================================================= */
const _PRIVATE = {
  commissionTiers: [
    { upTo: 500,      rate: 0.15 },
    { upTo: 1000,     rate: 0.13 },
    { upTo: 2000,     rate: 0.11 },
    { upTo: 5000,     rate: 0.09 },
    { upTo: 10000,    rate: 0.07 },
    { upTo: 15000,    rate: 0.06 },
    { upTo: Infinity, rate: 0.05 }   // piso de 5%
  ]
};
function commissionRate(value){
  for(const t of _PRIVATE.commissionTiers){ if(value <= t.upTo) return t.rate; }
  return 0.05;
}
function commissionFor(value){
  const v = Math.max(0, Number(value)||0);
  const rate = commissionRate(v);
  const fee = Math.round(v*rate);
  return { value:v, rate, fee, net:v-fee };
}
