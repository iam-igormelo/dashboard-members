# Dashboard de Membros

Sistema para gerenciamento de membros com filtros e paginação.

## Tecnologias
- **Frontend:** React, Axios.
- **Backend:** Node.js, Express, SQLite.

## Como Rodar o Projeto

### Backend
1. Entre na pasta `backend`: `cd backend`
2. Instale as dependências: `npm install`
3. Inicie o servidor: `npm run dev`

### Frontend
1. Entre na pasta `frontend`: `cd frontend`
2. Instale as dependências: `npm install`
3. Inicie a aplicação: `npm run dev`

## Endpoints da API

| Método | Endpoint | Descrição |
| :--- | :--- | :--- |
| GET | `/users` | Lista usuários (aceita filtros) |
| POST | `/users` | Cadastra um novo usuário |
| PUT | `/users/:id` | Atualiza dados de um usuário |
| DELETE | `/users/:id` | Remove um usuário |

---