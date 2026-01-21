import express from 'express'
import UserController from './controllers/UserController.js'

const routes = express.Router()

routes.post('/users', UserController.create);   // Criar
routes.get('/users', UserController.index);     // Listar
routes.put('/users/:id', UserController.update); // Editar
routes.delete('/users/:id', UserController.delete); // Excluir

export default routes