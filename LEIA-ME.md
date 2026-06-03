# Virago 250 Peças

Plataforma web para encontrar peças compatíveis com a Yamaha Virago 250.
**Stack:** Next.js 16 · Tailwind CSS · Prisma ORM · PostgreSQL (Neon) · Vercel

---

## Deploy (Vercel + Neon) — Passo a Passo

### 1. Criar o banco de dados gratuito no Neon

1. Acesse [neon.tech](https://neon.tech) e crie uma conta gratuita
2. Crie um novo projeto (ex: `virago-pecas`)
3. No painel, clique em **Connection string** e copie a URL (começa com `postgresql://...`)

---

### 2. Subir o código no GitHub

1. Acesse [github.com](https://github.com) e crie um repositório chamado `virago-pecas`
2. No terminal do seu computador, dentro da pasta do projeto:

```bash
cd D:\CLAUDE\virago-pecas
git init
git add .
git commit -m "primeiro commit"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/virago-pecas.git
git push -u origin main
```

---

### 3. Deploy na Vercel

1. Acesse [vercel.com](https://vercel.com) e crie uma conta (pode entrar com o GitHub)
2. Clique em **Add New Project** → importe o repositório `virago-pecas`
3. Antes de clicar em Deploy, abra **Environment Variables** e adicione:
   - **Nome:** `DATABASE_URL`
   - **Valor:** a connection string copiada do Neon (passo 1)
4. Clique em **Deploy** — o Vercel vai instalar, rodar as migrations e publicar automaticamente

✅ Pronto! O site estará no ar em ~2 minutos em uma URL como `virago-pecas.vercel.app`

---

### 4. Popular o banco com dados de exemplo (opcional)

Após o primeiro deploy, rode localmente com a URL do Neon no `.env`:

```bash
npm run db:seed
```

Ou conecte diretamente via Neon SQL Editor e insira os dados pelo painel.

---

### 5. Conectar seu domínio da Hostinger

1. No painel da Vercel → seu projeto → **Settings → Domains**
2. Adicione seu domínio (ex: `virago250pecas.com.br`)
3. A Vercel vai mostrar os registros DNS para configurar
4. No **hPanel da Hostinger** → **DNS Zone** → adicione os registros fornecidos pela Vercel

---

## Desenvolvimento Local

### Pré-requisitos
- Node.js 18+
- Conta no Neon com banco criado

### Configuração

```bash
# 1. Instalar dependências
npm install

# 2. Configurar .env com a URL do Neon
cp .env.example .env
# Edite .env e cole sua DATABASE_URL do Neon

# 3. Criar tabelas
npx prisma migrate dev --name init

# 4. Popular com dados de exemplo
npm run db:seed

# 5. Rodar
npm run dev
```

Acesse: http://localhost:3000

---

## Estrutura do Projeto

```
virago-pecas/
├── prisma/
│   ├── schema.prisma        # Modelos PostgreSQL
│   └── seed.ts              # Dados iniciais de exemplo
├── src/
│   ├── app/
│   │   ├── layout.tsx       # Layout global (header + footer)
│   │   ├── page.tsx         # Página inicial / busca
│   │   ├── pecas/[id]/      # Detalhes de cada peça
│   │   ├── contribuir/      # Formulário de sugestão
│   │   └── api/             # Rotas REST
│   ├── components/
│   │   ├── CompatibilityBadge.tsx   # Badge verde/amarelo/vermelho
│   │   ├── VideoEmbed.tsx           # Embed YouTube + links sociais
│   │   └── AdPlaceholder.tsx        # Espaços para Google AdSense
│   └── lib/
│       └── prisma.ts        # Client Prisma (singleton)
└── .env.example             # Template de variáveis de ambiente
```

## Scripts

| Comando | Quando usar |
|---------|-------------|
| `npm run dev` | Desenvolvimento local |
| `npm run build` | Build de produção (roda migrations automaticamente) |
| `npm run db:migrate:dev` | Criar nova migration em desenvolvimento |
| `npm run db:seed` | Popular banco com dados de exemplo |
| `npm run db:studio` | Interface visual do banco |
