import { useState } from 'react'
import { signOut } from 'firebase/auth'
import { useNavigate } from 'react-router-dom'
import { auth, isMockMode } from '../firebase/config'
import { useAuth } from '../contexts/AuthContext'
import { useTodos } from '../hooks/useTodos'
import TodoItem from '../components/TodoItem'

export default function TodoList() {
  const { currentUser, userRole } = useAuth()
  const { todos, loading, addTodo, toggleTodo, editTodo, deleteTodo } = useTodos()
  const [input, setInput] = useState('')
  const navigate = useNavigate()

  async function handleAdd(e) {
    e.preventDefault()
    if (!input.trim()) return
    await addTodo(input.trim())
    setInput('')
  }

  async function handleLogout() {
    if (!isMockMode) await signOut(auth)
    navigate('/login')
  }

  return (
    <div className="todo-container">
      {isMockMode && (
        <div className="mock-banner">
          Firebase 미연결 — 임시 데이터로 UI 미리보기 중입니다.
        </div>
      )}
      <header>
        <div>
          <h2>할 일 목록</h2>
          <span className="role-badge">{userRole === 'teacher' ? '교사' : '학생'}</span>
        </div>
        <div>
          <span className="user-email">{currentUser.email}</span>
          <button onClick={handleLogout}>로그아웃</button>
        </div>
      </header>

      <form onSubmit={handleAdd} className="add-form">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="새 할 일을 입력하세요"
        />
        <button type="submit">추가</button>
      </form>

      {loading ? (
        <p>불러오는 중...</p>
      ) : todos.length === 0 ? (
        <p className="empty">할 일이 없습니다.</p>
      ) : (
        <ul className="todo-list">
          {todos.map((todo) => (
            <TodoItem
              key={todo.id}
              todo={todo}
              onToggle={toggleTodo}
              onEdit={editTodo}
              onDelete={deleteTodo}
            />
          ))}
        </ul>
      )}
    </div>
  )
}
