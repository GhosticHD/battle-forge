import { useState, useEffect } from "react"
import { useAuth, userService } from "../services/firebase"
import { Link } from "react-router-dom"

export default function Profile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [nickname, setNickname] = useState("");
  const [bio, setBio] = useState("");
  const [avatarPreview, setAvatarPreview] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    let data = await userService.getUser(user.uid);
    if (!data) {
      await userService.createUser(user);
      data = await userService.getUser(user.uid);
    }
    setProfile(data);
    setNickname(data.nickname);
    setBio(data.bio);
    setAvatarPreview(data.avatar || "/default-avatar.png");
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setAvatarFile(file);

    // превью через base64
    const reader = new FileReader();
    reader.onload = () => setAvatarPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    let avatar = avatarPreview;

    if (avatarFile) {
      // просто сохраняем base64 в Firestore
      avatar = avatarPreview;
      await userService.setAvatar(user.uid, avatar);
    }

    await userService.updateProfile(user.uid, {
      nickname,
      bio,
      avatar,
    });

    alert("Профиль сохранён!");
    setAvatarFile(null);
    setAvatarPreview(avatar);
  };

  if (!profile) return <div>Загрузка профиля...</div>;

  return (
    <>
      <header className="header">
        <Link to="/" className="logo">
          Battle Forge
        </Link>
      </header>
      <div className="profile-page">
        <h1 className="profile-title">Профиль</h1>

        <div className="profile-form">
          <label>Аватар</label>
          <div style={{ marginBottom: "10px" }}>
            <img
              src={avatarPreview}
              alt="Аватар"
              style={{ width: 80, height: 80, borderRadius: "50%", objectFit: "cover" }}
            />
          </div>
          <input className="profile-input" type="file" accept="image/*" onChange={handleAvatarChange} />

          <label>Имя</label>
          <input className="profile-input" value={nickname} onChange={(e) => setNickname(e.target.value)} />

          <label>Описание</label>
          <textarea className="profile-input profile-textarea" value={bio} onChange={(e) => setBio(e.target.value)} />

          <button className="view-button profile-button" onClick={handleSave}>Сохранить</button>
        </div>
      </div>
    </>
  );
}