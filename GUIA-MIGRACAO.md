# Pecinhas — migração para a stack do enunciado

## O que este pacote faz

Atualiza o projeto existente para a stack informada no Passo 3. Não cria outro projeto nem altera o schema ou as migrations. Os dados das oito motos e suas imagens estão no Neon/Blob, não no ZIP.

| Pacote | Versão neste pacote |
| --- | --- |
| next / eslint-config-next | 16.3.8 |
| react / react-dom | 19.3.0 |
| prisma / @prisma/client / @prisma/adapter-pg | 7.10.0 |
| better-auth | 1.7.6 |
| @vercel/blob | 2.8.0 |
| zod | 4.6.5 |
| tsx (dev) | 4.23.15 |
| dotenv (dev) | 18.0.4 |

Next 16.3.8 é uma versão de correção da série 16.3, correspondente à seleção de `next@16.3`. Os pacotes exigidos estão fixados sem `^`. React e seus tipos foram atualizados em conjunto. Tailwind permanece na série 3, pois a tabela não exige mudar seu número principal e o CSS existente depende dela.

## 1. Preparar e copiar

No terminal CMD do VS Code, na pasta que contém o package.json do Pecinhas:

1. Pare `npm run dev` com Ctrl + C, se estiver rodando.
2. Execute `git status`. Deve estar limpo; se houver alterações, pare e informe a lista antes de copiar.
3. A branch `backup-antes-next16` criada anteriormente preserva o código anterior. Se não a criou, execute `git branch backup-antes-next16`. Não precisa trocar de branch.
4. Extraia o ZIP em uma pasta separada.
5. Copie seu conteúdo para a raiz do projeto existente. Mescle a pasta `src` e substitua os arquivos quando solicitado. Não substitua nem apague a pasta `src` inteira.
6. Apague somente a configuração antiga do ESLint:

```bat
del .eslintrc.json
```

Se esse arquivo já estiver ausente, ignore apenas essa mensagem. A nova configuração é `eslint.config.mjs`.

O pacote não contém `.env`, `node_modules`, `.next`, cliente Prisma gerado ou arquivos de migrations. Mantenha seu `.env` local. Nenhuma variável nova é necessária. Mantenha `BETTER_AUTH_URL` com seu endereço local durante os testes (normalmente http://localhost:3000).

## 2. Instalar e conferir

Execute um comando de cada vez. Pare se algum falhar e envie a mensagem, ocultando credenciais.

```bat
npm ci
```

`npm ci` instala o que está no package-lock atualizado e substitui as dependências antigas. O postinstall gera o Prisma Client. Execute a geração explícita também para conferir seu resultado:

```bat
npx prisma generate
```

```bat
npm ls --depth=0
```

Confira as versões da tabela. Não execute migrate dev, db push, reset ou geradores de tabelas do Better Auth nesta etapa. O schema atual foi preservado, incluindo o campo issuer com default das contas existentes. O Better Auth 1.7.6 usa accountId/providerId; manter a coluna adicional com default evita apagar dados na atualização.

## 3. Verificar o código

```bat
npm run lint
```

```bat
npm run build
```

O Next 16 não executa lint durante o build, por isso o comando de lint é separado. O build mantém `prisma generate && prisma migrate deploy && next build`. Você precisa estar conectado à internet para acessar o Neon. Não há migrations novas neste pacote; deploy apenas confere/aplica as versionadas que ainda estejam pendentes no banco configurado.

Depois que os dois comandos passarem:

```bat
npm run dev
```

## 4. Testar no seu banco antes do commit

1. Página pública: sem login, veja as oito motos/fotos e busque Honda. Busque um termo inexistente e use Limpar.
2. Cadastro: crie uma conta de teste com um novo e-mail. Não envie a senha a ninguém.
3. Login: entre com uma conta anterior à migração. Faça logout e confirme que uma senha errada é recusada. Entre novamente com a senha correta.
4. Sessão: com login, /login e /cadastro devem redirecionar para /painel. Sem login, /painel e /motos/nova devem redirecionar para /login.
5. Moto de teste: cadastre, abra detalhes, edite e confirme os dados.
6. Serviço: cadastre na moto de teste e confira data/valor na lista.
7. Foto: envie uma foto, troque por outra e confirme a limpeza da anterior no Blob. Um arquivo maior que 2 MB deve ser recusado.
8. Propriedade: com outra conta, tente abrir o endereço de detalhes/edição/foto/serviço da primeira conta. Deve responder 404.
9. Exclua a moto de teste e confirme que desapareceu.
10. /api/versao deve devolver {"commit":"local"} localmente, também sem login.
11. Confira as telas em 375 px, sem rolagem lateral.

Retorne o resultado desses testes antes de avançar para outra funcionalidade ou deploy.

## 5. Arquivos explicados em linguagem simples

| Arquivo | Papel e comparação com Express |
| --- | --- |
| package.json | Define as bibliotecas e os comandos, como em qualquer aplicação Express. Inclui lint com ESLint, typecheck e as versões do enunciado. |
| package-lock.json | Registra as versões completas da árvore instalada, permitindo repetir a instalação. |
| tsconfig.json | Configura TypeScript e JSX; foi ajustado pelo Next 16. |
| eslint.config.mjs | Confere padrões e erros no código; substitui .eslintrc.json para a configuração moderna do ESLint. |
| src/app/page.tsx | Equivale ao GET / com busca; searchParams agora é uma Promise, lida com await. |
| src/app/motos/[id]/page.tsx | Equivale ao GET /motos/:id; aguarda params antes de consultar a moto do usuário. |
| src/app/motos/[id]/editar/page.tsx | Equivale ao GET que preenche o formulário de edição; aguarda o ID. |
| src/app/motos/[id]/foto/page.tsx | Equivale ao GET que abre a tela de upload; aguarda o ID. |
| src/app/motos/[id]/servicos/novo/page.tsx | Equivale ao GET do cadastro de serviço; aguarda o ID da moto. |
| src/proxy.ts | Faz uma checagem otimista da presença do cookie, parecida com um filtro antes das rotas do Express. Não valida a sessão nem consulta o banco. As páginas/actions continuam validando sessão e propriedade no servidor. |

As Server Actions existentes, o singleton Prisma, a configuração de upload e a lógica de autenticação foram mantidos. Os métodos de Zod utilizados continuam compilando com 4.6.5. A geração do Prisma foi verificada com 7.10.0.

## 6. Evidências e limites da revisão

Verificado em 09/10/2026, com Node 24.19.0, sem usar segredos ou acessar o Neon do aluno:

- Instalação e conferência das versões principais.
- Prisma generate: passou.
- npm run lint: passou.
- Geração de tipos de rotas e npm run typecheck: passaram.
- npx next build: passou (Next 16.3.8, Turbopack).
- Servidor de produção local: /api/versao respondeu 200 com commit local; /painel, /motos/nova e /motos/teste/foto responderam 307 para /login; /api/auth/get-session respondeu 200 com null sem cookie.
- Schema e migrations comparados byte a byte com o ZIP original: preservados.

Não foi executado prisma migrate deploy contra seu Neon. Portanto, o npm run build completo precisa ser executado no seu computador. Cadastro, contas antigas, consultas e uploads reais precisam dos testes da seção 4. A compilação não comprova essas operações de banco.

Audit após a atualização:

- Audit completo: 13 avisos (11 altos, 2 moderados, 0 críticos).
- Audit com --omit=dev: 4 avisos altos, 0 críticos, na cadeia prisma/@prisma/config/deepmerge-ts/mysql2.
- O audit completo ainda inclui dependências de Tailwind e ESLint.

Isso não significa que todas as falhas foram resolvidas. As sugestões de baixar Prisma para 6 ou trocar Tailwind para 4 não foram aplicadas. Depois de testar a migração, vamos avaliar separadamente esses avisos e a classificação do Prisma na árvore de produção, respeitando 7.10.0. Não use npm audit fix --force.

## 7. Commit — somente depois dos testes confirmados

Pare o servidor com Ctrl + C. Antes do commit, rode:

```bat
npm run lint
```

```bat
npm run build
```

Se ambos passarem e os testes da seção 4 funcionarem, selecione os arquivos:

```bat
git add package.json package-lock.json tsconfig.json eslint.config.mjs .eslintrc.json src/proxy.ts src/app/page.tsx "src/app/motos/[id]/page.tsx" "src/app/motos/[id]/editar/page.tsx" "src/app/motos/[id]/foto/page.tsx" "src/app/motos/[id]/servicos/novo/page.tsx" GUIA-MIGRACAO.md
```

Esse comando inclui a exclusão da configuração antiga versionada do ESLint. Se você não copiou GUIA-MIGRACAO.md para o projeto, remova somente esse nome do comando.

```bat
git diff --cached --name-only
```

Confira que não há arquivos de ambiente com segredos. Depois:

```bat
git commit -m "Migra Pecinhas para a stack exigida com Next 16.3"
```

```bat
git push
```

```bat
git status
```

O esperado é main atualizada com origin/main e working tree clean. Não faça deploy nesta etapa: primeiro concluímos os testes e a revisão dos avisos restantes.
