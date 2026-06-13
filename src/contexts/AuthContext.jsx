import { createContext, useContext, useEffect, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db, isMockMode } from '../firebase/config'

const AuthContext = createContext(null)

const MOCK_USER = { uid: 'mock-uid', email: 'demo@school.com' }
const MOCK_ROLE = 'teacher'

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(isMockMode ? MOCK_USER : null)
  const [userRole, setUserRole] = useState(isMockMode ? MOCK_ROLE : null)
  const [loading, setLoading] = useState(!isMockMode)

  useEffect(() => {
    if (isMockMode) return
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const snap = await getDoc(doc(db, 'users', user.uid))
        setUserRole(snap.exists() ? snap.data().role : null)
      } else {
        setUserRole(null)
      }
      setCurrentUser(user)
      setLoading(false)
    })
    return unsubscribe
  }, [])

  return (
    <AuthContext.Provider value={{ currentUser, userRole, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
