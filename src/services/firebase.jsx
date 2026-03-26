import { initializeApp } from "firebase/app";
import { query, where, getDocs, collection } from "firebase/firestore";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import React, { createContext, useContext, useState, useEffect } from "react";
import { deleteDoc, increment } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

// Создаем контекст и экспортируем его
export const AuthContext = createContext();

// Создаем хук useAuth и экспортируем его
export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const loginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);

      const existing = await userService.getUser(result.user.uid);

      if (!existing) {
        await userService.createUser(result.user);
      }

      return result.user;
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const loginWithEmail = async (email, password) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      return result.user;
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const registerWithEmail = async (email, password) => {
    try {
      const result = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );

      await sendEmailVerification(result.user);

      await userService.createUser(result.user);

      return result.user;
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  const value = {
    user,
    loginWithGoogle,
    loginWithEmail,
    registerWithEmail,
    logout,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

// Battle data service
export const battleService = {
  async getBattle(id) {
    const docRef = doc(db, "battles", id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data(),
        // Убедимся что stats всегда есть
        stats: docSnap.data().stats || {
          forces: "",
          losses: "",
          commanders: "",
          duration: "",
        },
      };
    }
    return null;
  },

  async saveBattle(battleData, userId) {
    const id = battleData.id || Date.now().toString(36);
    const battleRef = doc(db, "battles", id);

    const dataToSave = {
      ...battleData,
      id,
      ownerId: userId,
      likes: 0,
      views: 0,
      updatedAt: new Date().toISOString(),
      createdAt: battleData.createdAt || new Date().toISOString(),
      // Гарантируем наличие stats
      stats: battleData.stats || {
        forces: "",
        losses: "",
        commanders: "",
        duration: "",
      },
    };

    try {
      await setDoc(battleRef, dataToSave, { merge: true });
      return id;
    } catch (error) {
      console.error("Error saving battle:", error);
      throw error;
    }
  },
};

export const userService = {
  async getUser(uid) {
    if (!uid) return null;
    const docRef = doc(db, "users", uid);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? docSnap.data() : null;
  },

  async createUser(user) {
    const userRef = doc(db, "users", user.uid);
    await setDoc(userRef, {
      uid: user.uid,
      nickname: user.email?.split("@")[0] || "User",
      avatar: "", // теперь это просто URL/base64
      bio: "",
      createdAt: new Date().toISOString(),
    });
  },

  async updateProfile(uid, data) {
    const userRef = doc(db, "users", uid);
    await updateDoc(userRef, data);
  },

  // Новый метод: установить аватарку через URL/base64
  async setAvatar(uid, avatarUrlOrBase64) {
    await this.updateProfile(uid, { avatar: avatarUrlOrBase64 });
    return avatarUrlOrBase64;
  },
};

export const likeService = {
  async toggleLike(battleId, userId) {
    const likeId = `${battleId}_${userId}`;

    const likeRef = doc(db, "likes", likeId);
    const battleRef = doc(db, "battles", battleId);

    const likeSnap = await getDoc(likeRef);

    if (likeSnap.exists()) {
      await deleteDoc(likeRef);

      await updateDoc(battleRef, {
        likes: increment(-1),
      });

      return false;
    } else {
      await setDoc(likeRef, {
        battleId,
        userId,
      });

      await updateDoc(battleRef, {
        likes: increment(1),
      });

      return true;
    }
  },

  async hasLiked(battleId, userId) {
    const likeId = `${battleId}_${userId}`;

    const likeRef = doc(db, "likes", likeId);

    const likeSnap = await getDoc(likeRef);

    return likeSnap.exists();
  },
};



export const viewService = {
  async registerView(battleId, userId) {
    if (!userId) return;

    const viewId = `${battleId}_${userId}`;
    const viewRef = doc(db, "views", viewId);
    const battleRef = doc(db, "battles", battleId);

    const viewSnap = await getDoc(viewRef);

    // если уже смотрел — ничего не делаем
    if (viewSnap.exists()) {
      return false;
    }

    // создаём просмотр
    await setDoc(viewRef, {
      battleId,
      userId,
      createdAt: new Date().toISOString(),
    });

    // 👇 увеличиваем views
    await updateDoc(battleRef, {
      views: increment(1),
    });

    return true;
  }
};