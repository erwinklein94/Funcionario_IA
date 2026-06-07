# HUMANICA — AI Workforce Exchange

Marketplace que conecta **clientes** (que querem contratar uma IA para substituir uma função, ex.: um analista) a **programadores** (que constroem, vendem e mantêm esses funcionários de IA). A plataforma lucra com uma comissão sobre cada acordo.

Protótipo **front-end estático** — HTML + CSS + JS puro, sem build, pronto para GitHub Pages.

## Estrutura

```
humanica/
├── index.html        # página principal (landing + marketplace)
├── css/
│   └── style.css      # design system techwear monocromático
├── js/
│   ├── data.js        # CONFIG + dados-semente
│   └── app.js         # lógica (render, abas, calculadora, formulários)
└── README.md
```

## Como rodar

Abra `index.html` no navegador, ou sirva localmente:

```bash
python3 -m http.server 8000
# acesse http://localhost:8000
```

## Como publicar no GitHub Pages

1. Suba a pasta para um repositório.
2. **Settings → Pages → Branch: main / root**.
3. O site fica disponível em `https://SEU-USUARIO.github.io/REPO/`.

## Ajustar a comissão (5%)

A porcentagem da plataforma fica em **um único lugar**, no topo de `js/data.js`:

```js
const CONFIG = {
  commissionRate: 0.05,   // 5% — altere aqui
  rates: { hire: 0.05, maint: 0.05, job: 0.05 }  // por tipo, se quiser
};
```

`0.05` = 5%, `0.08` = 8%, e assim por diante. A interface (hero, calculadora e detalhes) lê esse valor automaticamente.

## Os dois públicos

| Programador | Cliente |
|---|---|
| Cria perfil e expõe seus trabalhos | Cria perfil e descreve a função |
| Vende IA pronta **ou** manutenção mensal | Publica vaga com as **atribuições** exatas |
| Recebe propostas | Recebe propostas de devs |

Os dados publicados ficam salvos no `localStorage` do navegador (protótipo). Para produção, troque por uma API/banco real.

## Próximos passos (backend)

- Autenticação dos dois tipos de perfil
- Pagamentos com retenção automática da comissão (ex.: Stripe Connect)
- Chat entre as partes e fechamento de acordo dentro da plataforma
