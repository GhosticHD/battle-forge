import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../services/firebase";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const { loginWithGoogle, loginWithEmail, registerWithEmail } = useAuth();
  const navigate = useNavigate();

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    try {
      await loginWithEmail(email, password);
      navigate("/");
    } catch (error) {
      alert("Ошибка входа: " + error.message);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
      navigate("/");
    } catch (error) {
      alert("Ошибка Google входа: " + error.message);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await registerWithEmail(email, password);
      alert("Регистрация успешна! Проверьте email для подтверждения.");
      setIsRegistering(false);
    } catch (error) {
      alert("Ошибка регистрации: " + error.message);
    }
  };

  return (
    <div className="auth-container">
      <h2 className="auth-title">{isRegistering ? "Регистрация" : "Вход"}</h2>
      <form
        onSubmit={isRegistering ? handleRegister : handleEmailLogin}
        className="auth-form"
      >
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="profile-input"
        />
        <input
          type="password"
          placeholder="Пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="profile-input"
        />
        <button type="submit" className="btn-primary auth-btn">
          {isRegistering ? "Зарегистрироваться" : "Войти"}
        </button>

        <div className="auth-providers">
          <button className="btn-primary btn-secondary auth-btn auth-btn-google" onClick={handleGoogleLogin}>
            Войти через Google
          </button>
        </div>

        <button
          onClick={() => setIsRegistering(!isRegistering)}
          style={{
            marginTop: "20px",
            background: "transparent",
            color: "#666",
          }}
          className="toolbar-btn register-btn"
        >
          {isRegistering
            ? "Уже есть аккаунт? Войти"
            : "Нет аккаунта? Зарегистрироваться"}
        </button>
      </form>
    </div>
  );
}
