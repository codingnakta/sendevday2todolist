import { useState } from 'react'

export default function TodoItem({ todo, onToggle, onEdit, onDelete }) {
  const [editing, setEditing] = useState(false)
  const [text, setText] = useState(todo.text)

  function handleSave() {
    if (text.trim()) onEdit(todo.id, text.trim())
    setEditing(false)
  }

  return (
    <li className="todo-item">
      <input
        type="checkbox"
        checked={todo.done}
        onChange={() => onToggle(todo.id, todo.done)}
      />
      {editing ? (
        <>
          <input
            className="edit-input"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            autoFocus
          />
          <button onClick={handleSave}>저장</button>
          <button onClick={() => setEditing(false)}>취소</button>
        </>
      ) : (
        <>
          <span className={todo.done ? 'done' : ''}>{todo.text}</span>
          <button onClick={() => setEditing(true)}>수정</button>
          <button onClick={() => onDelete(todo.id)}>삭제</button>
        </>
      )}
    </li>
  )
}
