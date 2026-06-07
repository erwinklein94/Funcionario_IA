# Funcionário Artificial

Marketplace que conecta **clientes** (querem automatizar uma função com IA) a
**programadores** (constroem/vendem/mantêm esses funcionários de IA), agora com
**banco de dados, login e segurança no servidor via Supabase**.

## Estrutura
```
funcionario-artificial/
├── index.html  ofertas.html  programador.html  cliente.html
├── css/style.css
├── js/
│   ├── config.js     # preços, PIX, faixas de comissão (PRIVADO)
│   ├── supabase.js   # << COLE AQUI sua URL + anon key
│   ├── api.js        # auth + acesso ao banco
│   ├── layout.js     # nav, login, PIX, paywall, fechar acordo
│   └── app.js        # lógica de cada página
└── supabase/
    ├── schema.sql                    # << RODE ISTO no SQL Editor
    └── functions/pix-webhook/index.ts# confirmação automática de PIX (PSP)
```

## Passo a passo para colocar no ar

### 1. Criar o projeto Supabase
Crie um projeto em supabase.com. Em **Project Settings → API**, copie a
**Project URL** e a chave **anon public**.

### 2. Criar o banco
Abra **SQL Editor**, cole todo o conteúdo de `supabase/schema.sql` e clique em
**Run**. Isso cria as tabelas, as funções e as **políticas de segurança (RLS)**.

### 3. Conectar o site ao banco
Em `js/supabase.js`, cole a URL e a anon key:
```js
const SUPABASE_URL      = 'https://SEU-PROJETO.supabase.co';
const SUPABASE_ANON_KEY = 'sua-anon-key';
```
(A anon key pode ser pública — a segurança real está no RLS do banco.)

### 4. Auth
Em **Authentication → Providers → Email**, deixe o e-mail habilitado. Para
testar rápido, você pode **desligar "Confirm email"** (assim o login funciona na
hora). Em produção, mantenha a confirmação ligada.

### 5. Publicar
Suba a pasta no GitHub e ative **Settings → Pages**. Pronto: cadastro, login,
perfis, ofertas e vagas já gravam no Supabase.

## Como o acesso é controlado (no servidor)

| Ação | Quem pode |
|---|---|
| Ver ofertas (página Ofertas) | assinatura de **cliente** ativa |
| Publicar vaga (página Cliente) | assinatura de **cliente** ativa |
| Publicar oferta / ver vagas (página Programador) | assinatura de **programador** ativa |

Isso é garantido pelas **políticas RLS** — não dá para burlar pelo navegador.
A função `has_active_sub()` checa a assinatura em cada consulta.

## Pagamento (R$ 19,90/mês via PIX)

O site mostra o PIX (chave `40468707883` + copia e cola) e, ao clicar em
**"Já fiz o PIX"**, grava um registro em `payments` com status `pending`.
**A liberação só acontece quando esse pagamento é confirmado** — e a confirmação
NÃO pode ser feita pelo usuário (o RLS bloqueia). Há dois caminhos:

**A) Confirmação manual (MVP, sem provedor)**
Você recebe o PIX, confere no seu banco e roda no SQL Editor:
```sql
-- veja os pagamentos pendentes:
select id, user_id, role, amount, created_at from payments where status='pending';
-- confirme um deles (cria/renova a assinatura por 30 dias):
select confirm_payment('COLE_O_ID_AQUI');
```

**B) Confirmação automática (produção)**
Use um provedor (Mercado Pago, Asaas, Efí, PagBank, Stripe-PIX) que gera PIX
dinâmico e chama um **webhook** quando o pagamento cai. O arquivo
`supabase/functions/pix-webhook/index.ts` é o esqueleto desse webhook: ele recebe
o aviso do PSP e chama `confirm_payment()` com a service role. Deploy:
```bash
supabase functions deploy pix-webhook --no-verify-jwt
supabase secrets set SUPABASE_URL=... SERVICE_ROLE_KEY=... PSP_SECRET=...
```
Para mensalidade recorrente: PIX Automático, assinatura no cartão, ou renovação
manual a cada mês.

## Comissão (privada)
Continua só no fechamento de acordo pelo site: começa em 15% (até R$ 500) e cai
até 5% (acima de R$ 15.000). Fica em `js/config.js → _PRIVATE.commissionTiers` e
**não aparece em nenhuma página pública**.
