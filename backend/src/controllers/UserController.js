import connection from '../database/index.js'

const UserController = {
    // CRIAR USUÁRIO
    async create(req, res) {
        try {
            const { name, email, password, phone, birth_date, status } = req.body
    
            // Validação de senha (8 caracteres + 1 especial)
            const passwordRegex = /^(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/

            if (!passwordRegex.test(password)) {
                return res.status(400).json({
                    error: 'A senha deve ter 8 caracteres e um símbolo especial.'
                })
            }

            // Validação de idade (Mínimo de 18 anos)
            const today = new Date()
            const birthDate = new Date(birth_date)
            let age = today.getFullYear() - birthDate.getFullYear()
            const m = today.getMonth() - birthDate.getMonth()

            // Caso o aniversário ainda não tenha acontecido
            if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                age--
            }

            if (age < 18) {
                return res.status(400).json({
                    error: 'O usuário deve ter 18 anos ou mais.'
                })
            }

            // Verifica se o email já existe
            const userExists = await connection('users').where('email', email).first()
            if (userExists) {
                return res.status(400).json({
                    error: 'Este e-mail já está cadastrado.'
                })
            }
            
            // Salva no banco
            await connection('users').insert({
                name,
                email,
                password,
                phone,
                birth_date,
                status: status || 'ativo'
            })

            return res.status(201).json({ message: 'Usuário criado com sucesso!' })

        } catch (err) {
            console.error(err)
            return res.status(500).json({ error: 'Erro interno no servidor.' })
        }  
    },

    // LISTAR USUÁRIO
    async index(req, res) {
        try {
            const { page = 1, name, ageRange, showInactive } = req.query
            const limit = 5
            const offset = (page - 1) * limit

            let query = connection('users')

            // Filtro por nome
            if (name) {
                query = query.where('name', 'like', `%${name}%`)
            }

            // Filtro por status (Ocultar inativo por padrão)
            if (showInactive !== 'true') {
                query = query.where('status', 'ativo')
            }

            // Filtro por faixa etaria
            if (ageRange) {
                const today = new Date()
                const currentYear = today.getFullYear()

                if (ageRange === '18-25') {
                    query = query.whereBetween('birth_date', [
                    `${currentYear - 25}-01-01`, 
                    `${currentYear - 18}-12-31`
                    ])
                } else if (ageRange === '26-40') {
                    query = query.whereBetween('birth_date', [
                    `${currentYear - 40}-01-01`, 
                    `${currentYear - 26}-12-31`
                    ])
                } else if (ageRange === '41+') {
                    query = query.where('birth_date', '<=', `${currentYear - 41}-12-31`)
                }
            }

            // Contagem total para a paginação saber o fim
            const [count] = await query.clone().count()
            const totalUsers = count['count(*)'] || count['count']

            // Busca final com limite e paginação
            const users = await query
            .limit(limit)
            .offset(offset)
            .select('*')

            // Retornando os dados e o total no cabeçalho ou no corpo
            res.header('X-Total-Count', totalUsers)
            return res.json(users)
        } catch (err) {
            console.error(err)
            return res.status(500).json({ error: 'Erro ao listar usuários.' })
        }
    },

    // EDITAR USUÁRIO
    async update(req, res) {
        try {
            const { id } = req.params
            const { name, email, phone, birth_date, status } = req.body

            await connection('users').where('id', id).update({
                name, email, phone, birth_date, status
            })

            return res.json({ message: 'Usuário atualizado!' })
        } catch (err) {
            return res.status(500).json({ error: 'Erro ao atualizar.' })
        }
    },

    // EXCLUIR USUÁRIO
    async delete(req, res) {
        try {
            const { id } = req.params;
            
            // Verifica se o usuário existe antes de deletar
            const user = await connection('users').where('id', id).first()
            if (!user) {
                return res.status(404).json({ error: 'Usuário não encontrado.' })
            }

            await connection('users').where('id', id).delete()
            return res.status(204).send()
        } catch (err) {
            return res.status(500).json({ error: 'Erro ao excluir.' })
        }
    }
}

export default UserController