/* =========================================================
   FUNCIONÁRIO ARTIFICIAL — Configuração
   ========================================================= */

const CONFIG = {
  brand: 'Funcionário Artificial',
  shortBrand: 'F·A',
  currency: 'R$',

  /* -------------------------------------------------------
     VISÍVEL AO PÚBLICO — o que cada lado PAGA para usar o site.
     (É o único número de receita que os usuários enxergam.)
  ------------------------------------------------------- */
  access: {
    devMonthly:   50,   // PROGRAMADOR: R$ 50/mês para expor seus serviços
    clientSearch: 5     // CLIENTE: R$ 5 para buscar e contratar soluções
  }
};

/* =========================================================================
   ███  LÓGICA PRIVADA DO DONO — NÃO é divulgada em NENHUMA página pública.
   ███  A comissão só é exibida no momento de FECHAR O ACORDO PELO SITE.
   ███  Os usuários NÃO veem essas faixas nem sabem quanto o site fatura.
   =========================================================================
   Regra: começa em 15% para acordos até R$ 500 e vai caindo conforme o
   valor sobe (1.000 / 2.000 / 5.000 / 10.000 / 15.000 ...), com piso de 5%.
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

/* Retorna a taxa (decimal) aplicável a um valor de acordo. */
function commissionRate(value){
  for(const t of _PRIVATE.commissionTiers){
    if(value <= t.upTo) return t.rate;
  }
  return 0.05;
}

/* Calcula a divisão de um acordo fechado PELO site. */
function commissionFor(value){
  const v = Math.max(0, Number(value) || 0);
  const rate = commissionRate(v);
  const fee  = Math.round(v * rate);
  return { value: v, rate, fee, net: v - fee };
}
