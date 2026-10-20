# Autenticação Completa — API REST

API de autenticação construída em Node.js e TypeScript, com cadastro de usuários, login, refresh token com rotação, logout e perfil protegido. Projeto pessoal de estudo, estruturado em camadas com injeção de dependência e princípios SOLID.

## Stack

- **Node.js** + **TypeScript**
- **Express 5**
- **PostgreSQL** (via `pg`, sem ORM — queries SQL puras)
- **Zod** para validação de dados
- **JWT** (`jsonwebtoken`) para autenticação
- **bcryptjs** para hash de senha
- **Jest** + **Supertest** para testes unitários e de integração
- **Docker** e **Docker Compose**

## Arquitetura

O projeto segue uma arquitetura em camadas, separada por módulo de domínio:

```
src/
├── config/        → validação de variáveis de ambiente (Zod)
├── database/       → pool de conexão e migrations SQL
├── errors/         → classes de erro customizadas (AppError e subclasses)
├── middlewares/     → autenticação, validação e tratamento de erro
├── modules/
│   ├── auth/        → login, refresh, logout
│   └── users/        → cadastro e perfil
├── shared/
│   ├── jwt/          → geração e verificação de tokens
│   └── password/      → hash e comparação de senha
└── container.ts      → composition root (injeção de dependência)
```

Cada módulo segue o padrão **Controller → Service → Repository**, com interfaces (`IUserRepository`, `IAuthRepository`, `IPasswordService`, `ITokenService`) separando a regra de negócio dos detalhes técnicos (banco, bcrypt, JWT). Isso permite trocar qualquer implementação (por exemplo, o banco de dados) sem alterar a camada de serviço, e também torna os testes unitários possíveis via mocks.

## Como a autenticação funciona

- O **access token** é um JWT de curta duração (15 minutos por padrão), devolvido no corpo da resposta.
- O **refresh token** é entregue em um cookie `httpOnly`, `sameSite=strict`, restrito à rota `/auth`.
- O banco guarda apenas o **hash SHA-256** do refresh token, nunca o valor original.
- A cada uso, o refresh token é **rotacionado**: o antigo é revogado e um novo é emitido.
- Se um refresh token já revogado for reapresentado (indício de roubo de token), **todas as sessões daquele usuário são revogadas**.
- Login retorna a mesma mensagem de erro para e-mail inexistente e senha incorreta, evitando enumeração de usuários.
- A rota de login tem **rate limit** (10 tentativas a cada 15 minutos por IP).

## Rotas

| Método | Rota             | Descrição                          | Autenticação |
|--------|-------------------|--------------------------------------|---------------|
| POST   | `/users`          | Cadastra um novo usuário             | Não           |
| GET    | `/users/me`       | Retorna o perfil do usuário logado    | Sim (Bearer)  |
| POST   | `/auth/login`      | Autentica e retorna os tokens        | Não           |
| POST   | `/auth/refresh`    | Gera um novo par de tokens            | Cookie        |
| POST   | `/auth/logout`     | Revoga a sessão atual                | Cookie        |
| GET    | `/health`         | Verifica se a API está no ar          | Não           |

## Como rodar o projeto

### Pré-requisitos
- Node.js 20+
- Docker e Docker Compose

### Passo a passo

```bash
# 1. Clone o repositório
git clone https://github.com/SEU-USUARIO/autenticacao-api.git
cd autenticacao-api

# 2. Instale as dependências
npm install

# 3. Copie o arquivo de variáveis de ambiente
cp .env.example .env
# edite o .env e troque os valores de JWT_ACCESS_SECRET e JWT_REFRESH_SECRET

# 4. Suba o banco de dados
docker compose up -d

# 5. Rode as migrations
npm run migrate

# 6. Inicie o servidor em modo desenvolvimento
npm run dev
```

A API sobe em `http://localhost:3333`.

### Rodando os testes

```bash
npm test
```

Os testes de integração usam um banco PostgreSQL isolado, criado automaticamente pelo `docker-compose.yml`.

## Variáveis de ambiente

| Variável                      | Descrição                                   |
|--------------------------------|------------------------------------------------|
| `NODE_ENV`                    | `development`, `test` ou `production`           |
| `PORT`                        | Porta onde o servidor sobe                      |
| `DATABASE_URL`                 | String de conexão do PostgreSQL                |
| `JWT_ACCESS_SECRET`             | Segredo para assinar o access token (32+ chars) |
| `JWT_REFRESH_SECRET`            | Segredo para assinar o refresh token (32+ chars)|
| `JWT_ACCESS_EXPIRES_SECONDS`    | Validade do access token, em segundos           |
| `JWT_REFRESH_EXPIRES_SECONDS`   | Validade do refresh token, em segundos          |
| `BCRYPT_ROUNDS`                | Custo do hash de senha                         |
| `CORS_ORIGIN`                  | Origem permitida pelo CORS                      |

## Próximos passos

- [ ] Logs estruturados (Pino)
- [ ] CI com GitHub Actions rodando os testes a cada push
- [ ] Documentação da API (Swagger)
- [ ] Verificação de e-mail e troca de senha

## Autor

**Samuel Ramos** — Estudante de Análise e Desenvolvimento de Sistemas
[LinkedIn](#) · [GitHub](#)