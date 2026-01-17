import { initializeApp } from 'firebase/app'
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  sendEmailVerification,
  onAuthStateChanged,
  signOut 
} from 'firebase/auth'
import { getFirestore, collection, doc, setDoc, getDoc } from 'firebase/firestore'
import React, { createContext, useContext, useState, useEffect } from 'react'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
const googleProvider = new GoogleAuthProvider()

// Создаем контекст и экспортируем его
export const AuthContext = createContext()

// Создаем хук useAuth и экспортируем его
export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user)
      setLoading(false)
    })
    return unsubscribe
  }, [])

  const loginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider)
      return result.user
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  const loginWithEmail = async (email, password) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password)
      return result.user
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  const registerWithEmail = async (email, password) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password)
      await sendEmailVerification(result.user)
      return result.user
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  const logout = async () => {
    await signOut(auth)
  }

  const value = {
    user,
    loginWithGoogle,
    loginWithEmail,
    registerWithEmail,
    logout,
    loading
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

// Battle data service
export const battleService = {
  async getBattle(id) {
    const docRef = doc(db, 'battles', id)
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      return { 
        id: docSnap.id, 
        ...docSnap.data(),
        // Убедимся что stats всегда есть
        stats: docSnap.data().stats || {
          forces: '',
          losses: '',
          commanders: '',
          duration: ''
        }
      }
    }
    return null
  },

  async saveBattle(battleData, userId) {
    const id = battleData.id || Date.now().toString(36)
    const battleRef = doc(db, 'battles', id)
    
    const dataToSave = {
      ...battleData,
      id,
      ownerId: userId,
      updatedAt: new Date().toISOString(),
      createdAt: battleData.createdAt || new Date().toISOString(),
      // Гарантируем наличие stats
      stats: battleData.stats || {
        forces: '',
        losses: '',
        commanders: '',
        duration: ''
      }
    }
    
    try {
      await setDoc(battleRef, dataToSave, { merge: true })
      return id
    } catch (error) {
      console.error('Error saving battle:', error)
      throw error
    }
  }
}