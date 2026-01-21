import { useEffect, useState } from 'react'
import api from './services/api'
import './App.css'

function App() {
  // Estado para armazenar os usuários
  const [users, setUsers] = useState([])

  // Estado para paginação
  const [page, setPage] = useState(1)
  
  // Estados para o formulário
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [birthDate, setBirthDate] = useState('')

  // Estados para os filtros
  const [filterName, setFilterName] = useState('')
  const [filterAge, setFilterAge] = useState('')
  const [showInactive, setShowInactive] = useState(false)

  // Estado para editar usuários
  const [editingUser, setEditingUser] = useState(null)

  // Estado para controlar o modal
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Dica de senha
  const [showPasswordTooltip, setShowPasswordTooltip] = useState(false)

  // Estado para o status
  const [status, setStatus] = useState('ativo')

  // Buscar usuários
  async function fetchUsers() {
    try {
      const response = await api.get('/users', {
        params: {
          page: page,
          name: filterName,
          ageRange: filterAge,
          showInactive: showInactive
        }
      })
      setUsers(response.data)
    } catch (error) {
      console.error("Erro ao buscar usuários", error)
    }
  }

  // Assim que carrega a página os usuários são carregados
  useEffect(()=> {
    fetchUsers()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, filterName, filterAge, showInactive])

  // Voltar para a primeira página sempre que um filtro é aplicado
  useEffect(() => {
    setPage(1)
  }, [filterName, filterAge, showInactive])

  // Sempre que a lista de usuários mudar, a página desce suavemente
  useEffect(() => {
    window.scrollTo({
      top: document.documentElement.scrollHeight, 
      behavior: 'smooth' // Faz o movimento ser deslizado e não um "salto" seco
    })
  }, [users]) // Dependência: só roda quando a lista de usuários for alterada

  // Máscara de telefone (83) 99999-9999
  const formatPhone = (value) => {
    if (!value) return ""
    value = value.replace(/\D/g, "") // Remove tudo o que não é número
    value = value.replace(/(\d{2})(\d)/, "($1) $2") // Coloca parênteses no DDD
    value = value.replace(/(\d{5})(\d)/, "$1-$2") // Coloca o hífen no quinto dígito
    return value
  }

  // Abrir o modal para cadastro do usuário
    function handleNewUser() {
    setEditingUser(null)
    setName('')
    setEmail('')
    setPassword('')
    setPhone('')
    setBirthDate('')
    setStatus('ativo')
    setIsModalOpen(true)
  }

  // Cadastro de usuário
  async function handleAddUser(event) {
    event.preventDefault() // Impede a página de recarregar

    // Regra: 8 caracteres e pelo menos um caractere especial
    const passwordRegex = /[!@#$%^&*(),.?":{}|<>]/
    
    if (!editingUser) {
      if (password.length < 8 || !passwordRegex.test(password)) {
        alert("A senha deve ter no mínimo 8 caracteres e incluir um caractere especial.")
        return
      }
    }
    
    const userData = {
      name,
      email,
      password,
      phone,
      birth_date: birthDate, // Ajustado para o nome da coluna no banco
      status: status
    }

    // Só altera a senha caso tenha sido digitada
    if (password) {
      userData.password = password
    }

    try {
      if (editingUser) {
        // Se estiver editando
        await api.put(`/users/${editingUser.id}`, userData)
        alert('Usuário atualizado com sucesso!')
      } else {
        // Se não estiver editando
        await api.post('/users', userData)
        alert('Usuário cadastrado com sucesso!')
      }

      // Limpa os campos
      setName('')
      setEmail('')
      setPassword('')
      setPhone('')
      setBirthDate('')

      // Atualiza a lista de usuários
      fetchUsers()

    } catch (error) {
      alert(error.response?.data?.error || 'Erro ao cadastrar usuário')
    }
  }

  function handleEditClick(user) {
    setEditingUser(user)
    setName(user.name)
    setEmail(user.email)
    setPhone(user.phone)
    setBirthDate(user.birth_date.split('T')[0])
    setStatus(user.status)
    setIsModalOpen(true)
  }

  async function handleDeleteUser(id) {
  if (!window.confirm("Tem certeza que deseja excluir este usuário?")) {
    return
  }

  try {
    await api.delete(`/users/${id}`)
    alert("Usuário removido com sucesso!")

    // Atualiza a lista de usuários
    fetchUsers()

  } catch (error) {
    alert("Erro ao excluir usuário.")
    console.error(error)
  }
}

  return (
    <div className="container">
    <h1>Dashboard</h1>

    {/* Botão para abrir o modal de novo usuário */}
    <button className="btn-new-user" onClick={handleNewUser}>
      + Novo Usuário
    </button>

    {/* Estrutura Condicional do Modal */}
    {isModalOpen && (
      <div className="modal-overlay">
        <div className="modal-content">
          <button className="close-button" onClick={() => setIsModalOpen(false)}>&times;</button>
          
          <h2>{editingUser ? 'Editar Usuário' : 'Novo Cadastro'}</h2>
          
          <form className="user-form" onSubmit={(e) => {
            handleAddUser(e);
            setIsModalOpen(false); // Fecha ao salvar
          }}>
            <input className="full-width" placeholder="Nome Completo" value={name} onChange={e => setName(e.target.value)} required />
            <input type="email" placeholder="E-mail" value={email} onChange={e => setEmail(e.target.value)} required />
            <div className="input-group" style={{ position: 'relative' }}>
              <input 
                type="password" 
                placeholder="Senha" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                onFocus={() => setShowPasswordTooltip(true)} // Abre ao clicar
                onBlur={() => setShowPasswordTooltip(false)}  // Fecha ao sair
                required={!editingUser} 
              />
              
              {showPasswordTooltip && (
                <div className="password-tooltip">
                  <strong>Requisitos da senha:</strong>
                  <ul>
                    <li className={password.length >= 8 ? 'valid' : ''}>Mínimo de 8 caracteres</li>
                    <li className={/[!@#$%^&*(),.?":{}|<>]/.test(password) ? 'valid' : ''}>Pelo menos um caractere especial</li>
                  </ul>
                </div>
              )}
            </div>
            <input placeholder="Telefone" value={phone} onChange={e => setPhone(formatPhone(e.target.value))} maxLength="15" required />
            <input type="date" value={birthDate} onChange={e => setBirthDate(e.target.value)} required />
            <div className="status-control-container" style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
            <span className="status-label">Status do Usuário</span>
            
            <div className="radio-group">
              <label className="radio-option">
                <input 
                  type="radio" 
                  name="status" 
                  value="ativo" 
                  checked={status === 'ativo'} 
                  onChange={(e) => setStatus(e.target.value)} 
                />
                Ativo
              </label>

              <label className="radio-option">
                <input 
                  type="radio" 
                  name="status" 
                  value="inativo" 
                  checked={status === 'inativo'} 
                  onChange={(e) => setStatus(e.target.value)} 
                />
                Inativo
              </label>
            </div>
          </div>
            
            <button type="submit" className="btn-save full-width">
              {editingUser ? 'Salvar Alterações' : 'Cadastrar Usuário'}
            </button>
          </form>
        </div>
      </div>
    )}

      <div className="card filters">
        <h2>Filtros de Busca</h2>
        <div className="filter-group">
          <input 
            placeholder="Buscar por nome..." 
            value={filterName} 
            onChange={e => setFilterName(e.target.value)} 
          />
          
          <select value={filterAge} onChange={e => setFilterAge(e.target.value)}>
            <option value="">Todas as idades</option>
            <option value="18-25">18 a 25 anos</option>
            <option value="26-40">26 a 40 anos</option>
            <option value="41+">Mais de 40 anos</option>
          </select>

          <label className="checkbox-label">
            <input 
              type="checkbox" 
              checked={showInactive} 
              onChange={e => setShowInactive(e.target.checked)} 
            />
            Mostrar inativos
          </label>
        </div>
      </div>

      <div className="card">
        <h2>Usuários Ativos</h2>
        <table className="user-table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>E-mail</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>
                  <span className={`status-badge ${user.status}`}>
                    {user.status}
                  </span>
                </td>
                <td>
                  <button 
                    className="btn-edit" 
                    onClick={() => handleEditClick(user)}>
                      Editar
                  </button>
                  <button 
                    className="btn-delete" 
                    onClick={() => handleDeleteUser(user.id)}>
                      Excluir
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="pagination">
        <button 
          onClick={() => setPage(prev => Math.max(prev - 1, 1))}
          disabled={page === 1}>
            Anterior
        </button>
        
        <span>Página {page}</span>
        
        <button 
          onClick={() => setPage(prev => prev + 1)}
          // Se vier menos de 5 é a última página
          disabled={users.length < 5}>
            Próxima
        </button>
      </div>
    </div>
  )
}

export default App
