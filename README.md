# Funcionário Artificial

Marketplace que conecta **clientes** (querem automatizar uma função com IA) a
**programadores** (constroem, vendem e mantêm esses funcionários de IA).

Protótipo **front-end** (HTML + CSS + JS puro) com **acesso pago por assinatura**
e cobrança inicial via **PIX**.

## Estrutura

```
funcionario-artificial/
├── index.html          # página inicial explicativa
├── ofertas.html        # ofertas (acesso de CLIENTE)
├── programador.html    # perfil do programador (acesso de PROGRAMADOR)
├── cliente.html        # perfil do cliente (acesso de CLIENTE)
├── css/style.css
├── js/
│   ├── config.js       # preços, PIX e regras de comissão (parte PRIVADA)
│   ├── data.js         # dados-semente
│   ├── layout.js       # nav/rodapé, PIX, assinatura/paywall, acordo
│   └── app.js          # lógica de cada página
└── README.md
```

## Modelo atual

- **Assinatura:** R$ 19,90/mês para **cada** perfil (cliente e programador).
- **Cliente** só vê as ofertas com a assinatura ativa.
- **Programador** só expõe serviços e vê o que os clientes querem com a assinatura ativa.
- **PIX (fase inicial):** chave `40468707883` (CPF). O site gera o "copia e cola"
  com valor de R$ 19,90 já preenchido.
- **Comissão (privada):** continua existindo só quando o acordo é fechado pelo
  site, começando em 15% (até R$ 500) e caindo até 5% (acima de R$ 15.000).
  Editável em `js/config.js → _PRIVATE.commissionTiers`. **Não aparece em
  página pública** — só na tela de fechar acordo.

Trocar preço/PIX: `js/config.js → CONFIG.access` e `CONFIG.pix`.

---

## ⚠️ Importante antes de lançar de verdade

Este protótipo guarda tudo no `localStorage` e libera o acesso quando o usuário
clica em **"Já fiz o PIX"**. Isso é só demonstração: **qualquer pessoa
conseguiria liberar sem pagar**. Para virar um site real é preciso mover a regra
para um servidor. Veja abaixo.

## Arquitetura de um site de verdade

1. **Backend + banco de dados**
   Tabelas: `usuarios` (com `papel`: cliente/programador), `assinaturas`
   (status, validade), `ofertas`, `vagas`, `acordos`.

2. **Autenticação**
   Cadastro/login (e-mail + senha ou login social). Cada conta tem um papel.

3. **Cobrança PIX automática (recomendado)**
   Use um provedor (PSP) que gera PIX dinâmico e avisa o pagamento por **webhook**:
   Mercado Pago, Asaas, Efí (Gerencianet), PagBank, Stripe (PIX). Fluxo:
   - backend pede ao PSP um PIX de R$ 19,90 → recebe QR + copia e cola;
   - usuário paga;
   - o PSP chama seu **webhook** confirmando → o backend marca a assinatura ativa.
   Só o webhook confirma de forma confiável. Para recorrência mensal: **PIX
   Automático**, ou assinatura no cartão, ou renovação manual a cada mês.

4. **Controle de acesso no SERVIDOR (essencial)**
   A API só devolve ofertas/vagas se a assinatura daquele papel estiver ativa.
   Travar só no front (como neste protótipo) é facilmente burlável.

5. **Comissão**
   Quando o acordo é fechado pelo site, o backend calcula a taxa (tabela
   privada) e — idealmente — usa split de pagamento (ex.: Stripe Connect / Asaas
   split) para reter automaticamente sua parte e repassar o resto ao programador.

### Fase inicial sem backend (MVP manual)
Funciona em pequena escala: o usuário paga no PIX, manda o comprovante, **você
confere no seu banco** e libera o acesso na mão. Dá trabalho e não escala, mas
valida o negócio antes de investir no backend.

## Rodar / publicar
```bash
python3 -m http.server 8000   # http://localhost:8000
```
GitHub Pages: **Settings → Pages → Branch: main / root**.
