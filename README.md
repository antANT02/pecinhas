# Pecinhas

Sistema web acadêmico para uma oficina de motos. Permite cadastrar motos, registrar serviços e consultar um catálogo público.

**Site publicado:** https://pecinhas.vercel.app/  
**Repositório:** https://github.com/antANT02/pecinhas — privado, com acesso mediante autorização.  
**Branch principal:** `main`.

Os registros do catálogo são fictícios e usados para demonstrar o projeto.

## Funcionalidades

- Cadastro, login e logout com e-mail e senha, usando Better Auth.
- Cadastro, listagem, detalhes, edição e exclusão de motos.
- Criação e listagem de serviços ligados a uma moto: relação de uma moto para vários serviços.
- Verificação de sessão e propriedade dos registros no servidor.
- Catálogo público com pelo menos oito motos e fotos.
- Busca por URL, como `/?busca=Honda`, com mensagem quando nenhum resultado é encontrado.
- Upload de imagens JPG, PNG e WebP de até 2 MB, com validação no servidor.
- Limpeza da imagem anterior ao substituir uma foto, com aviso se a limpeza falhar.
- Validação dos formulários com Zod e mensagens em português.
- Layout responsivo, com identidade visual industrial, grafite e laranja.
- Rota pública `GET /api/versao` para identificar o commit publicado.

O catálogo público apresenta dados descritivos das motos. Informações particulares, como placas e serviços, ficam nas páginas protegidas.

## Tecnologias

| Tecnologia | Versão |
| --- | --- |
| Next.js, App Router | 16.3.8, da linha 16.3 |
| React e React DOM | 19.3.0 |
| Prisma, Prisma Client e adapter PostgreSQL | 7.10.0 |
| Better Auth | 1.7.6 |
| Vercel Blob | 2.8.0 |
| Zod | 4.6.5 |
| tsx | 4.23.15 |
| dotenv | 18.0.4 |
| Node.js | >= 20.19.0 |
| Banco de dados | PostgreSQL no Neon |
| Estilos | Tailwind CSS e CSS |
| Hospedagem | Vercel |

As versões exigidas e fixadas podem ser conferidas no `package.json`. O `package-lock.json` registra a árvore de dependências utilizada.

## Executar localmente

É necessário ter Git, Node.js compatível e npm. Também é preciso configurar um banco Neon e um armazenamento público Vercel Blob.

### 1. Obter o código

Com acesso ao repositório:

```bash
git clone https://github.com/antANT02/pecinhas.git
cd pecinhas
```

### 2. Configurar as variáveis

No terminal do Windows:

```bat
copy .env.example .env
```

No Linux ou macOS:

```bash
cp .env.example .env
```

Preencha o arquivo `.env` localmente:

| Variável | Finalidade |
| --- | --- |
| `DATABASE_URL` | Conexão PostgreSQL com pool, usada pela aplicação. |
| `DATABASE_URL_UNPOOLED` | Conexão direta, usada pelas migrations. |
| `BETTER_AUTH_SECRET` | Segredo da autenticação. |
| `BETTER_AUTH_URL` | `http://localhost:3000` no ambiente local. |
| `BLOB_READ_WRITE_TOKEN` | Token do armazenamento de imagens Vercel Blob. |

Use o ramo de desenvolvimento do Neon no ambiente local. Nas conexões deste projeto, use `sslmode=verify-full`, preservando os outros parâmetros fornecidos pelo Neon.

Para gerar um segredo, execute o comando abaixo e copie o resultado somente para o seu arquivo de configuração:

```bash
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

Nunca envie o `.env` ao GitHub nem compartilhe senhas, segredos ou tokens.

### 3. Instalar e preparar o banco

```bash
npm ci
npx prisma migrate deploy
npx prisma generate
```

`npm ci` instala as dependências do arquivo de lock e executa o `postinstall`, que gera o Prisma Client. `migrate deploy` aplica as migrations já versionadas no banco configurado.

### 4. Iniciar

```bash
npm run dev
```

Abra http://localhost:3000/. Crie uma conta e acesse o painel para cadastrar motos e serviços.

**Dados de demonstração:** as oito motos do catálogo publicado foram cadastradas manualmente. O arquivo `prisma/seed.mjs` ainda é um esqueleto e não preenche um banco novo automaticamente. Para demonstrar um ambiente novo, cadastre pelo menos oito motos fictícias e envie suas fotos.

## Organização do código

| Arquivo ou pasta | Responsabilidade |
| --- | --- |
| `src/app/page.tsx` | Página inicial, catálogo e busca pública. |
| `src/app/login/` e `src/app/cadastro/` | Páginas, formulários e ações de autenticação. |
| `src/app/painel/` | Lista das motos do usuário e logout. |
| `src/app/motos/` | Cadastro, detalhes, edição, exclusão, fotos e serviços. |
| `src/app/api/auth/[...all]/route.ts` | Endpoint do Better Auth. |
| `src/app/api/versao/route.ts` | Identificação do commit em produção. |
| `src/lib/auth.ts` | Configuração da autenticação. |
| `src/lib/prisma.ts` | Instância compartilhada do Prisma, com adapter PostgreSQL. |
| `src/prisma/schema.prisma` | Modelos de autenticação, Moto e Servico. |
| `prisma/migrations/` | Histórico versionado das alterações do banco. |
| `prisma.config.ts` | Caminhos do schema, migrations e conexão para o Prisma CLI. |
| `src/proxy.ts` | Checagem inicial de presença do cookie; a autorização completa ocorre no servidor. |
| `src/components/EstruturaPagina.tsx` | Estrutura visual compartilhada pelas páginas internas. |
| `src/app/sistema.css` | Estilos das páginas internas. |

Para quem conhece Express: `route.ts` funciona como um endpoint; as Server Actions recebem e validam os dados dos formulários; os arquivos `page.tsx` produzem as páginas. O acesso ao banco e a verificação de sessão ficam no servidor.

O Prisma Client é gerado em `src/app/generated/prisma` e importado por `@/app/generated/prisma/client`.

## Alterações no banco durante o desenvolvimento

Depois de alterar `src/prisma/schema.prisma`, no ambiente de desenvolvimento:

```bash
npx prisma migrate dev --name nome_da_alteracao
npx prisma generate
```

Versione os arquivos criados em `prisma/migrations`. A geração do client deve ser executada explicitamente depois da migration. Use `migrate deploy` para aplicar o histórico em produção.

## Verificação e comandos úteis

```bash
npm run lint
npm run typecheck
npm run build
```

O build executa `prisma generate && prisma migrate deploy && next build`. Portanto, também aplica migrations pendentes ao banco indicado nas variáveis daquele ambiente.

| Comando | Uso |
| --- | --- |
| `npm run dev` | Servidor de desenvolvimento. |
| `npm run build` | Preparação do banco e build de produção. |
| `npm start` | Executar o build de produção localmente. |
| `npm audit` | Conferir todas as dependências. |
| `npm audit --omit=dev` | Conferir dependências de produção. |

Antes de cada commit, execute `npm run build` e só prossiga se ele terminar com sucesso.

### Testes manuais

- Cadastrar, entrar, sair e rejeitar uma senha incorreta.
- Redirecionar visitantes sem sessão das páginas protegidas.
- Criar, editar, consultar e excluir uma moto.
- Criar e listar serviços da moto.
- Confirmar que outra conta não consegue acessar ou alterar registros particulares.
- Enviar uma imagem válida, substituir a foto e rejeitar arquivos inválidos ou maiores que 2 MB.
- Buscar uma moto e testar uma busca sem resultados.
- Conferir o catálogo sem login e a navegação em uma tela de 375 px.
- Conferir `/api/versao` depois do deploy.

## Deploy na Vercel

O projeto está conectado à branch `main`. Um push nessa branch inicia um novo deploy.

Configuração:

- Install Command: `npm ci`.
- Build Command: `npm run build`.
- Variáveis de produção: as cinco variáveis descritas acima.
- Banco: ramo de produção do Neon.
- `BETTER_AUTH_URL`: `https://pecinhas.vercel.app`.
- Armazenamento: Vercel Blob público.

Mantenha as conexões de desenvolvimento e produção separadas. Gere um segredo próprio para produção.

Após o deploy ficar **Ready**, abra:

https://pecinhas.vercel.app/api/versao

A resposta tem o formato `{"commit":"SHA_DO_COMMIT"}`. Compare com:

```bash
git rev-parse HEAD
```

O SHA muda a cada novo commit publicado. No ambiente local, a rota retorna `{"commit":"local"}` quando a variável de commit da Vercel não existe.

## Dependências e alertas conhecidos

Na última conferência relatada durante o desenvolvimento, em 09/10/2026, `npm audit --omit=dev` retornou zero vulnerabilidades. A auditoria completa ainda apresentou alertas associados a `braces` e sua cadeia de ferramentas de desenvolvimento. Esses resultados podem mudar conforme novos avisos são publicados.

O projeto usa overrides para `mysql2`, `deepmerge-ts` e `postcss-selector-parser`, registrados no `package.json` e no lockfile.

Evite `npm audit fix --force`: as mudanças propostas podem substituir versões exigidas pelo enunciado e exigir adaptações no código. Avalie atualizações individualmente e repita o build e os testes.

## Limites atuais

O foco é o cadastro de motos e seus serviços. Agendamento, pagamento e integração com WhatsApp ficam fora desta versão.

A limpeza de imagens foi implementada na substituição de fotos. A exclusão da foto do Blob ao excluir definitivamente uma moto é uma melhoria futura.

