import { useState, useEffect } from 'react'
import {
  collection, addDoc, updateDoc, deleteDoc,
  doc, onSnapshot, query, orderBy, serverTimestamp,
} from 'firebase/firestore'
import { db, isMockMode } from '../firebase/config'
import { useAuth } from '../contexts/AuthContext'

const MOCK_TODOS = [
  { id: '1', text: '수업 자료 준비하기', done: false },
  { id: '2', text: '과제 채점하기', done: true },
  { id: '3', text: '학부모 상담 일정 확인', done: false },
]

export function useTodos() {
  const { currentUser } = useAuth()
  const [todos, setTodos] = useState(isMockMode ? MOCK_TODOS : [])
  const [loading, setLoading] = useState(!isMockMode)

  useEffect(() => {
    if (isMockMode || !currentUser) return
    const q = query(
      collection(db, 'todos', currentUser.uid, 'items'),
      orderBy('createdAt', 'desc')
    )
    const unsub = onSnapshot(q, (snap) => {
      setTodos(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
      setLoading(false)
    })
    return unsub
  }, [currentUser])

  async function addTodo(text) {
    if (isMockMode) {
      setTodos((prev) => [{ id: Date.now().toString(), text, done: false }, ...prev])
      return
    }
    await addDoc(collection(db, 'todos', currentUser.uid, 'items'), {
      text,
      done: false,
      createdAt: serverTimestamp(),
    })
  }

  async function toggleTodo(id, done) {
    if (isMockMode) {
      setTodos((prev) => prev.map((t) => t.id === id ? { ...t, done: !done } : t))
      return
    }
    await updateDoc(doc(db, 'todos', currentUser.uid, 'items', id), { done: !done })
  }

  async function editTodo(id, text) {
    if (isMockMode) {
      setTodos((prev) => prev.map((t) => t.id === id ? { ...t, text } : t))
      return
    }
    await updateDoc(doc(db, 'todos', currentUser.uid, 'items', id), { text })
  }

  async function deleteTodo(id) {
    if (isMockMode) {
      setTodos((prev) => prev.filter((t) => t.id !== id))
      return
    }
    await deleteDoc(doc(db, 'todos', currentUser.uid, 'items', id))
  }

  return { todos, loading, addTodo, toggleTodo, editTodo, deleteTodo }
}
