# Funcionário Artificial

Marketplace que conecta **clientes** (querem automatizar uma função com IA) a **programadores** (constroem, vendem e mantêm esses funcionários de IA).

Protótipo **front-end estático** — HTML + CSS + JS puro, sem build, pronto para GitHub Pages.

## Estrutura

```
funcionario-artificial/
├── index.html          # página inicial explicativa
├── ofertas.html        # ofertas de produtos e soluções
├── programador.html    # perfil do programador
├── cliente.html        # perfil do cliente
├── css/style.css       # design system
├── js/
│   ├── config.js       # ⚠️ regras de receita (parte pública + parte PRIVADA)
│   ├── data.js         # dados-semente
│   ├── layout.js       # nav/rodapé + utilitários + fechamento de acordo
│   └── app.js          # lógica de cada página
└── README.md
```

## Como rodar / publicar

```bash
python3 -m http.server 8000   # http://localhost:8000
```
GitHub Pages: suba a pasta e ative **Settings → Pages → Branch: main / root**.

---

## 💰 Modelo de receita

> **Importante:** o site **não divulga** quanto fatura. Os usuários só veem
> **o que eles pagam para usar**. A comissão sobre o acordo só aparece **no
> momento de fechar o negócio pelo site**.

### 1) O que o usuário vê (acesso)
Definido em `js/config.js → CONFIG.access`:

| Público | Paga | Para |
|---|---|---|
| Programador | **R$ 50/mês** | expor seus serviços |
| Cliente | **R$ 5** | buscar e contratar soluções |

### 2) Comissão — lógica PRIVADA (só você sabe)
Como os dois lados podem se conhecer e fechar por fora, a comissão é
**opcional** e só incide quando o acordo é fechado **dentro do site**
(que oferece registro, intermediação e garantia). As faixas ficam em
`js/config.js → _PRIVATE.commissionTiers` e **não aparecem em nenhuma
página pública** — só na tela de "Fechar acordo pelo site".

| Valor do acordo | Comissão |
|---|---|
| até R$ 500 | 15% |
| até R$ 1.000 | 13% |
| até R$ 2.000 | 11% |
| até R$ 5.000 | 9% |
| até R$ 10.000 | 7% |
| até R$ 15.000 | 6% |
| acima de R$ 15.000 | 5% (piso) |

Editar é só mudar a tabela em `config.js`. As funções `commissionRate()` e
`commissionFor()` cuidam do cálculo.

---

## Observações técnicas

- Dados publicados (perfis, ofertas, vagas) ficam no `localStorage` do navegador — é protótipo. Em produção, troque por API + banco.
- Para um produto real: autenticação dos dois perfis, cobrança recorrente (R$ 50/mês) e avulsa (R$ 5), pagamento com retenção da comissão (ex.: Stripe Connect) e chat interno.
