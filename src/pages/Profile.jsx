import { useState, useEffect } from "react";
import { useAuth } from "../services/firebase";
import { userService } from "../services/firebase";

export default function Profile() {
  const { user } = useAuth();

  const [profile, setProfile] = useState(null);

  const [nickname, setNickname] = useState("");
  const [bio, setBio] = useState("");

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
  };

  const handleSave = async () => {
    await userService.updateProfile(user.uid, {
      nickname,
      bio,
    });

    alert("Профиль сохранён");
  };

  if (!profile) return <div>Загрузка профиля...</div>;

  return (
    <div className="profile-page">
      <h1>Профиль</h1>

      <div className="profile-form">
        <label>Ник</label>
        <input value={nickname} onChange={(e) => setNickname(e.target.value)} />

        <label>Описание</label>
        <textarea value={bio} onChange={(e) => setBio(e.target.value)} />

        <button onClick={handleSave}>Сохранить</button>
      </div>
    </div>
  );
}
