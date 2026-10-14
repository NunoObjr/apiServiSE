# ServiSE — API

API REST em **Node.js** do **ServiSE**, plataforma que conecta **clientes** a **prestadores de serviço**: o cliente encontra um prestador, **agenda** um serviço em um horário disponível, acompanha e cancela agendamentos e, ao final, **avalia** o atendimento. Os aplicativos e o site do ServiSE consomem esta API e recebem atualizações em tempo real por **WebSocket**.

## Funcionalidades

- **Usuários (clientes):** cadastro com validação de CPF e foto, login, atualização de perfil/senha/CPF, exclusão
- **Prestadores:** cadastro, login, perfil, serviços oferecidos, lista de serviços agendados e indicadores (agendados, concluídos, cancelados, renda gerada)
- **Serviços:** CRUD de serviços com preço e horários disponíveis (dia/hora)
- **Agendamentos:** agendar, listar e cancelar; impede agendar duas vezes o mesmo serviço com o mesmo prestador
- **Avaliações:** nota e comentário por serviço, refletidos na nota do prestador
- **Upload de imagens:** disco local ou Amazon S3
- **Tempo real:** eventos de atualização de perfil, criação/exclusão de serviços, agendamentos e mudança de status

## Conceitos técnicos

**API REST com Express.** Rotas organizadas por recurso em `Routes/`, com `body-parser` e `cors`.

**Autenticação com JWT.** O login devolve um token assinado (`jsonwebtoken`) com expiração; o middleware `middleware/auth.js` valida o cabeçalho `token` e disponibiliza o usuário autenticado em `res.locals`.

**Senhas com bcrypt.** O *hash* é gerado em um *hook* `pre('save')` do Mongoose, e o campo `senha` usa `select: false`, para nunca ser retornado nas consultas.

**Modelagem com Mongoose (MongoDB).** Documentos relacionados por `ObjectId` e `populate`:

```
User ──< ServicoAgendado >── Prestador ──< Servico
                │
                └──< Avaliacao        Imagem (foto de User/Prestador)
```

**Upload com Multer.** Estratégia selecionável — `diskStorage` (pasta `uploads/`) ou `multer-s3` (bucket S3, com nome aleatório gerado por `crypto.randomBytes`).

**Tempo real com Socket.IO.** O servidor retransmite (*broadcast*) os eventos recebidos dos clientes (ex.: `agendouServico` → `servicoAgendado`), mantendo apps abertos sincronizados sem *polling*.

**Validação.** Campos obrigatórios e CPF verificados (`validar-cpf`) antes de gravar.

## Endpoints principais

| Recurso | Rotas |
| --- | --- |
| `/users` | `GET /`, `POST /create`, `POST /login`, `PUT /update`, `PUT /updatePass`, `PUT /updateCpf`, `DELETE /delete`, `POST /agendar`, `GET /agendamentos`, `DELETE /cancelarAgendamento`, `GET /identificarUsuario` |
| `/prestador` | `GET /`, `POST /create`, `POST /login`, `PUT /update`, `PUT /updatePass`, `PUT /updateCpf`, `DELETE /delete`, `GET /servicosAgendados`, `GET /identificarUsuario` |
| `/servico` | `GET /`, `POST /create`, `POST /update`, `DELETE /delete/:id` |
| `/users/avl` | `POST /avaliar` |

Rotas protegidas exigem o cabeçalho `token: <jwt>`.

## Stack

Node.js · Express · MongoDB (Mongoose) · JWT · bcrypt · Multer / AWS S3 · Socket.IO · Heroku (`Procfile`)

## Estrutura

```
app.js                 # servidor, conexão com o Mongo e eventos Socket.IO
Routes/                # users, prestadorDeServico, servico, avaliacao
model/                 # schemas Mongoose
middleware/auth.js     # validação do JWT
multerConfig/          # armazenamento local/S3
config/config.js       # configuração
Procfile               # processo web para o Heroku
```

## Como executar

Pré-requisitos: Node.js 13+ e uma instância do MongoDB.

```bash
npm install
# defina as variáveis de ambiente (veja abaixo)
npm start
```

Configuração esperada por variáveis de ambiente (arquivo `.env`, já ignorado pelo Git):

| Variável | Uso |
| --- | --- |
| string de conexão do MongoDB | banco de dados |
| segredo do JWT | assinatura dos tokens |
| `BUCKET_NAME` e credenciais AWS | upload no S3 (opcional) |

## Segurança — atenção

O arquivo `config/config.js` ainda contém a string de conexão do banco e o segredo do JWT **escritos no código**. Antes de qualquer uso real:

1. **Revogue** a senha do usuário do MongoDB e **troque** o segredo do JWT;
2. Passe esses valores para variáveis de ambiente (`process.env`);
3. Remova os segredos do histórico do Git, se necessário.
