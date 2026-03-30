import { useState, useEffect } from "react";
import { db } from "./firebase";
import { ref, onValue, set } from "firebase/database";

const theme = {
  bg: "#FFF8F0",
  primary: "#FF6B35",
  secondary: "#4ECDC4",
  accent: "#FFE66D",
  dark: "#2D2D2D",
  muted: "#8B8B8B",
  card: "#FFFFFF",
  shadow: "0 8px 32px rgba(0,0,0,0.10)",
  anatolia: "#C0392B",
  anatoliaBg: "linear-gradient(160deg, #f5e6d0 0%, #e8c99a 100%)",
};

// ─── DATA ────────────────────────────────────────────────────────────────────

const mapThemes = [
  { id: "anatolia", name: "Anadolu Masalları", emoji: "🏺", desc: "Peri bacaları, İstanbul Boğazı ve Nasreddin Hoca", color: "#C0392B", bg: "linear-gradient(135deg, #f8d7b0 0%, #e8a87c 100%)", icon: "🕌" },
  { id: "galaxy",   name: "Galaksi Kaşifleri", emoji: "🚀", desc: "Renkli gezegenler, sevimli uzaylılar, meteor kuşakları", color: "#6C3483", bg: "linear-gradient(135deg, #1a1a4e 0%, #6C3483 100%)", textLight: true, icon: "🌌" },
  { id: "nature",   name: "Doğa Muhafızları",  emoji: "🌿", desc: "Harita ilerledikçe orman yeşerir, nehirler temizlenir", color: "#1E8449", bg: "linear-gradient(135deg, #d4efdf 0%, #82e0aa 100%)", icon: "🌳" },
];

const avatarDefs = [
  { id: "mom",  emoji: "👩", label: "Anne" },
  { id: "dad",  emoji: "👨", label: "Baba" },
  { id: "girl", emoji: "👧", label: "Kız Çocuk" },
  { id: "boy",  emoji: "👦", label: "Erkek Çocuk" },
];

const rewards = [
  { id: "cinema",  emoji: "🎬", label: "Sinema Gecesi" },
  { id: "cooking", emoji: "🍰", label: "Tatlı Yapma" },
  { id: "bike",    emoji: "🚴", label: "Bisiklet Turu" },
  { id: "picnic",  emoji: "🧺", label: "Piknik" },
];

const DEFAULT_TASKS = [
  { id: 1, owner: "child",  emoji: "📚", title: "30 dk odaklanarak kitap oku",           desc: "Dikkat dağıtıcı olmadan, sessiz bir köşede", done: false },
  { id: 2, owner: "child",  emoji: "🧹", title: "Odanı kendi başına düzenle",             desc: "Masa, yatak, oyuncaklar  -  hepsi yerli yerinde", done: false },
  { id: 3, owner: "parent", emoji: "📵", title: "Yemek masasına telefon getirme",         desc: "Akşam yemeği boyunca telefon çantada kalır", done: false },
  { id: 4, owner: "parent", emoji: "🔕", title: "19:00'dan sonra bildirimleri sessize al", desc: "İş mailleri akşam bekleyebilir", done: false },
  { id: 5, owner: "family", emoji: "💬", title: "Ailece 15 dk sohbet veya egzersiz",     desc: "Hep birlikte, ekransız zaman", done: false },
];

// ─── GÖREV HAVUZU ─────────────────────────────────────────────────────────────
const TASK_POOL = [
  // Çocuk görevleri
  { id: "p1",  owner: "child",  emoji: "📚", title: "30 dk odaklanarak kitap oku",           desc: "Dikkat dağıtıcı olmadan, sessiz bir köşede" },
  { id: "p2",  owner: "child",  emoji: "🧹", title: "Odanı kendi başına düzenle",             desc: "Masa, yatak, oyuncaklar  -  hepsi yerli yerinde" },
  { id: "p3",  owner: "child",  emoji: "✏️", title: "Ödevini o gün bitir, yarıya bırakma",   desc: "Akşam yatmadan önce tamamla" },
  { id: "p4",  owner: "child",  emoji: "🥗", title: "Tabağındakilerin hepsini bitir",         desc: "Sebze dahil  -  bedeni için yap!" },
  { id: "p5",  owner: "child",  emoji: "🚿", title: "Hatırlatmadan banyo yap",               desc: "Kendi inisiyatifinle, söylenmeden" },
  { id: "p6",  owner: "child",  emoji: "🌅", title: "Sabah alarmla uyan, ikinci alarm yok",  desc: "İlk alarm çalınca kalk!" },
  { id: "p7",  owner: "child",  emoji: "🎨", title: "30 dk yaratıcı bir aktivite yap",       desc: "Çizim, origami, müzik  -  senin seçimin" },
  { id: "p8",  owner: "child",  emoji: "🧺", title: "Kirli çamaşırlarını sepete koy",        desc: "Yerde değil, sepette!" },
  { id: "p9",  owner: "child",  emoji: "🐾", title: "Evcil hayvanı besle ve su kabını doldur", desc: "O da aile üyesi, unutma" },
  { id: "p10", owner: "child",  emoji: "📵", title: "2 saat ekransız zaman geçir",           desc: "Telefon, tablet, TV  -  hepsi kapalı" },
  // Ebeveyn görevleri
  { id: "p11", owner: "parent", emoji: "📵", title: "Yemek masasına telefon getirme",        desc: "Akşam yemeği boyunca telefon çantada kalır" },
  { id: "p12", owner: "parent", emoji: "🔕", title: "19:00'dan sonra bildirimleri sessize al", desc: "İş mailleri akşam bekleyebilir" },
  { id: "p13", owner: "parent", emoji: "🧘", title: "10 dk meditasyon veya nefes egzersizi", desc: "Günün stresini bırak, sadece nefes al" },
  { id: "p14", owner: "parent", emoji: "🏃", title: "En az 20 dk yürüyüş veya egzersiz",    desc: "Asansör yerine merdiven de sayılır!" },
  { id: "p15", owner: "parent", emoji: "📖", title: "15 dk kitap veya makale oku",           desc: "Ekran dışı, gerçek bir sayfa" },
  { id: "p16", owner: "parent", emoji: "☕", title: "Kahveni aceleye getirmeden için",       desc: "5 dk bile olsa, sadece o ana odaklan" },
  { id: "p17", owner: "parent", emoji: "💌", title: "Eşine/partnerine teşekkür mesajı at",  desc: "Küçük bir jest, büyük fark yaratır" },
  { id: "p18", owner: "parent", emoji: "🛏️", title: "23:00'dan önce yat",                   desc: "Uyku da bir görev!" },
  // Aile görevleri
  { id: "p19", owner: "family", emoji: "💬", title: "Ailece 15 dk sohbet veya egzersiz",    desc: "Hep birlikte, ekransız zaman" },
  { id: "p20", owner: "family", emoji: "🍳", title: "Birlikte yemek pişirin",               desc: "Her biri bir iş üstlensin" },
  { id: "p21", owner: "family", emoji: "🎲", title: "Akşam bir kutu oyunu oynayın",         desc: "En az 20 dk, telefonsuz" },
  { id: "p22", owner: "family", emoji: "🌳", title: "Dışarıda 30 dk birlikte yürüyün",      desc: "Park, sokak, bahçe  -  nerede olursa" },
  { id: "p23", owner: "family", emoji: "📸", title: "Bugün bir aile fotoğrafı çekin",       desc: "Günlük hayat anısı, özel bir an" },
  { id: "p24", owner: "family", emoji: "🎵", title: "Birlikte şarkı söyleyin veya dans edin", desc: "Gülünç olmaktan korkmayın!" },
];

const POOL_CATEGORIES = [
  { id: "child",  label: "Çocuk",   emoji: "👧", color: "#4ECDC4" },
  { id: "parent", label: "Ebeveyn", emoji: "👩", color: "#FF6B35" },
  { id: "family", label: "Aile",    emoji: "👨‍👩‍👧", color: "#A855F7" },
];

// ─── HARITA ───────────────────────────────────────────────────────────────────
const TOTAL_SQUARES = 120;
const SPECIAL_SQUARES = { 10: "surprise", 20: "mini-game", 35: "surprise", 50: "mini-game", 65: "surprise" };
const anatoliaLandmarks = ["🏺","🕌","🌊","🎭","🐪","🏔️","🌙","⭐","🏺","🌿","🎯","🌺","🔮","🦅","🎶"];

// ─── SHARED UI ────────────────────────────────────────────────────────────────

function Btn({ children, onClick, variant = "primary", style, disabled }) {
  const base = { width: "100%", padding: "15px 20px", borderRadius: 16, fontSize: 16, fontFamily: "'Nunito', sans-serif", fontWeight: 700, cursor: disabled ? "not-allowed" : "pointer", transition: "transform 0.1s, opacity 0.1s", opacity: disabled ? 0.45 : 1, border: "none" };
  const variants = {
    primary:   { background: theme.primary, color: "#fff" },
    secondary: { background: "transparent", color: theme.primary, border: `2px solid ${theme.primary}` },
    ghost:     { background: "#F0EAE2", color: theme.dark },
    teal:      { background: theme.secondary, color: "#fff" },
    danger:    { background: "#FEE2E2", color: "#DC2626" },
  };
  return (
    <button onClick={disabled ? undefined : onClick} style={{ ...base, ...variants[variant], ...style }}
      onMouseDown={e => !disabled && (e.currentTarget.style.transform = "scale(0.97)")}
      onMouseUp={e => (e.currentTarget.style.transform = "scale(1)")}>
      {children}
    </button>
  );
}

function Screen({ children, style }) {
  return <div style={{ minHeight: "100%", display: "flex", flexDirection: "column", padding: "24px 20px", ...style }}>{children}</div>;
}

function StepBar({ step, total }) {
  return (
    <div style={{ display: "flex", gap: 6, justifyContent: "center", marginBottom: 20 }}>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} style={{ height: 5, borderRadius: 99, flex: 1, maxWidth: 32, background: i <= step ? theme.primary : "#E0D6CC", transition: "background 0.3s" }} />
      ))}
    </div>
  );
}

function BackBtn({ onBack }) {
  return <button onClick={onBack} style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", alignSelf: "flex-start", marginBottom: 16 }}>←</button>;
}

// ─── ONBOARDING ───────────────────────────────────────────────────────────────

function WelcomeScreen({ onNext }) {
  return (
    <Screen style={{ justifyContent: "center", alignItems: "center", textAlign: "center", background: "linear-gradient(160deg, #FFF8F0 0%, #FFE8D6 100%)" }}>
      <div style={{ fontSize: 80, marginBottom: 8, animation: "bounce 2s infinite" }}>🏡</div>
      <h1 style={{ fontFamily: "'Nunito', sans-serif", fontSize: 36, fontWeight: 900, color: theme.dark, margin: 0, lineHeight: 1.1 }}>
        Life<span style={{ color: theme.primary }}>Board</span>
      </h1>
      <p style={{ color: theme.muted, fontSize: 15, marginTop: 10, marginBottom: 40, lineHeight: 1.6 }}>
        Gerçek hayat görevleri.<br />Aile macerası. Büyük ödüller.
      </p>
      <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 12 }}>
        <Btn onClick={() => onNext("create")}>✨ Aile Hesabı Oluştur</Btn>
        <Btn variant="secondary" onClick={() => onNext("join")}>🔗 Mevcut Aileye Katıl</Btn>
      </div>
      <p style={{ color: theme.muted, fontSize: 12, marginTop: 24 }}>Ücretsiz · Reklamsız · Aile dostu</p>
    </Screen>
  );
}

function JoinScreen({ onNext, onBack }) {
  const [code, setCode] = useState("");
  return (
    <Screen>
      <BackBtn onBack={onBack} />
      <StepBar step={0} total={7} />
      <h2 style={{ fontFamily: "'Nunito', sans-serif", fontSize: 26, fontWeight: 900, color: theme.dark, margin: "0 0 8px" }}>Aileye Katıl 🔗</h2>
      <p style={{ color: theme.muted, fontSize: 14, marginBottom: 28 }}>Ebeveyninin sana verdiği 6 haneli kodu gir</p>
      <div style={{ background: theme.card, borderRadius: 20, padding: 24, boxShadow: theme.shadow, marginBottom: 24, textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>🎟️</div>
        <input type="text" placeholder="ÖRN: TINT-842" value={code} onChange={e => setCode(e.target.value.toUpperCase())} maxLength={8}
          style={{ width: "100%", padding: "14px 16px", borderRadius: 12, border: `2px solid ${code.length >= 7 ? theme.secondary : "#E0D6CC"}`, fontSize: 22, fontFamily: "'Nunito', sans-serif", fontWeight: 800, letterSpacing: 4, textAlign: "center", color: theme.dark, outline: "none", boxSizing: "border-box" }} />
        <p style={{ color: theme.muted, fontSize: 12, marginTop: 8 }}>Kodu ebeveyninden iste</p>
      </div>
      <Btn onClick={() => onNext()} disabled={code.length < 7}>Katıl →</Btn>
    </Screen>
  );
}

function ParentProfileScreen({ onNext, onBack, data, setData }) {
  return (
    <Screen>
      <BackBtn onBack={onBack} />
      <StepBar step={1} total={7} />
      <h2 style={{ fontFamily: "'Nunito', sans-serif", fontSize: 26, fontWeight: 900, color: theme.dark, margin: "0 0 4px" }}>Senin profilin 👋</h2>
      <p style={{ color: theme.muted, fontSize: 14, marginBottom: 24 }}>Adını gir ve rolünü seç</p>
      <input type="text" placeholder="Adın nedir?" value={data.name || ""} onChange={e => setData({ ...data, name: e.target.value })}
        style={{ width: "100%", padding: "14px 16px", borderRadius: 14, border: "2px solid #E0D6CC", fontSize: 16, fontFamily: "'Nunito', sans-serif", fontWeight: 700, color: theme.dark, outline: "none", marginBottom: 20, boxSizing: "border-box" }} />
      <p style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 700, color: theme.dark, marginBottom: 12, fontSize: 14 }}>Rol seç:</p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 24 }}>
        {avatarDefs.slice(0, 2).map(a => (
          <div key={a.id} onClick={() => setData({ ...data, avatar: a.id })}
            style={{ background: data.avatar === a.id ? theme.primary : theme.card, borderRadius: 16, padding: "20px 10px", textAlign: "center", cursor: "pointer", boxShadow: theme.shadow, border: `2px solid ${data.avatar === a.id ? theme.primary : "transparent"}`, transition: "all 0.2s" }}>
            <div style={{ fontSize: 44 }}>{a.emoji}</div>
            <div style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 700, fontSize: 14, color: data.avatar === a.id ? "#fff" : theme.dark, marginTop: 6 }}>{a.label}</div>
          </div>
        ))}
      </div>
      <Btn onClick={() => onNext()} disabled={!data.name || !data.avatar}>Devam →</Btn>
    </Screen>
  );
}

function AddChildScreen({ onNext, onBack, data, setData }) {
  const [cn, setCn] = useState(""); const [ca, setCa] = useState(""); const [cv, setCv] = useState("");
  const add = () => {
    if (!cn || !ca || !cv) return;
    setData({ ...data, children: [...(data.children || []), { name: cn, age: ca, avatar: cv }] });
    setCn(""); setCa(""); setCv("");
  };
  return (
    <Screen>
      <BackBtn onBack={onBack} />
      <StepBar step={2} total={7} />
      <h2 style={{ fontFamily: "'Nunito', sans-serif", fontSize: 26, fontWeight: 900, color: theme.dark, margin: "0 0 4px" }}>Çocukları ekle 👧👦</h2>
      <p style={{ color: theme.muted, fontSize: 14, marginBottom: 20 }}>En fazla 4 çocuk · min. 8 yaş</p>
      {(data.children || []).map((c, i) => (
        <div key={i} style={{ background: "#F0FAF8", borderRadius: 14, padding: "10px 14px", marginBottom: 8, display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 28 }}>{avatarDefs.find(a => a.id === c.avatar)?.emoji}</span>
          <div><div style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 800, fontSize: 15, color: theme.dark }}>{c.name}</div><div style={{ color: theme.muted, fontSize: 12 }}>{c.age} yaşında</div></div>
          <span style={{ marginLeft: "auto", color: theme.secondary, fontSize: 18 }}>✓</span>
        </div>
      ))}
      {(data.children || []).length < 4 && (
        <div style={{ background: theme.card, borderRadius: 18, padding: 18, boxShadow: theme.shadow, marginBottom: 16 }}>
          <input placeholder="Çocuğun adı" value={cn} onChange={e => setCn(e.target.value)}
            style={{ width: "100%", padding: "12px 14px", borderRadius: 12, border: "2px solid #E0D6CC", fontSize: 15, fontFamily: "'Nunito', sans-serif", fontWeight: 700, color: theme.dark, outline: "none", marginBottom: 10, boxSizing: "border-box" }} />
          <input placeholder="Yaşı (8-17)" type="number" value={ca} onChange={e => setCa(e.target.value)}
            style={{ width: "100%", padding: "12px 14px", borderRadius: 12, border: "2px solid #E0D6CC", fontSize: 15, fontFamily: "'Nunito', sans-serif", fontWeight: 700, color: theme.dark, outline: "none", marginBottom: 14, boxSizing: "border-box" }} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 14 }}>
            {avatarDefs.slice(2).map(a => (
              <div key={a.id} onClick={() => setCv(a.id)}
                style={{ background: cv === a.id ? theme.secondary : "#F5F5F5", borderRadius: 14, padding: "14px 8px", textAlign: "center", cursor: "pointer", border: `2px solid ${cv === a.id ? theme.secondary : "transparent"}`, transition: "all 0.2s" }}>
                <div style={{ fontSize: 36 }}>{a.emoji}</div>
                <div style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 700, fontSize: 13, color: cv === a.id ? "#fff" : theme.dark, marginTop: 4 }}>{a.label}</div>
              </div>
            ))}
          </div>
          <Btn variant="ghost" onClick={add} disabled={!cn || !ca || !cv}>+ Çocuk Ekle</Btn>
        </div>
      )}
      <Btn onClick={() => onNext()} disabled={(data.children || []).length === 0}>Devam →</Btn>
    </Screen>
  );
}

function MapThemeScreen({ onNext, onBack, data, setData }) {
  return (
    <Screen>
      <BackBtn onBack={onBack} />
      <StepBar step={3} total={7} />
      <h2 style={{ fontFamily: "'Nunito', sans-serif", fontSize: 26, fontWeight: 900, color: theme.dark, margin: "0 0 4px" }}>Harita temasını seç 🗺️</h2>
      <p style={{ color: theme.muted, fontSize: 14, marginBottom: 20 }}>Bu ay hangi maceraya çıkıyorsunuz?</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 24 }}>
        {mapThemes.map(t => (
          <div key={t.id} onClick={() => setData({ ...data, mapTheme: t.id })}
            style={{ background: t.bg, borderRadius: 20, padding: "18px 20px", cursor: "pointer", border: `3px solid ${data.mapTheme === t.id ? t.color : "transparent"}`, boxShadow: theme.shadow, transition: "all 0.2s", display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ fontSize: 40 }}>{t.icon}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 900, fontSize: 16, color: t.textLight ? "#fff" : theme.dark }}>{t.emoji} {t.name}</div>
              <div style={{ fontSize: 12, color: t.textLight ? "rgba(255,255,255,0.8)" : theme.muted, marginTop: 3, lineHeight: 1.4 }}>{t.desc}</div>
            </div>
            {data.mapTheme === t.id && <div style={{ fontSize: 22 }}>✅</div>}
          </div>
        ))}
      </div>
      <Btn onClick={() => onNext()} disabled={!data.mapTheme}>Devam →</Btn>
    </Screen>
  );
}

function MovementScreen({ onNext, onBack, data, setData }) {
  return (
    <Screen>
      <BackBtn onBack={onBack} />
      <StepBar step={4} total={7} />
      <h2 style={{ fontFamily: "'Nunito', sans-serif", fontSize: 26, fontWeight: 900, color: theme.dark, margin: "0 0 4px" }}>Nasıl ilerlemek istersiniz?</h2>
      <p style={{ color: theme.muted, fontSize: 14, marginBottom: 24 }}>Görev tamamlandığında hareket yönteminizi seçin</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 24 }}>
        {[
          { id: "compass", emoji: "🧭", title: "Pusula Çevirme", desc: "İbre döner, 1-6 arası rastgele adım  -  macera ve keşif hissi!", color: theme.secondary },
          { id: "dice",    emoji: "🎲", title: "Zar Atma",        desc: "Klasik kutu oyunu mantığı, saf şans faktörü", color: theme.primary },
        ].map(opt => (
          <div key={opt.id} onClick={() => setData({ ...data, movement: opt.id })}
            style={{ background: data.movement === opt.id ? opt.color : theme.card, borderRadius: 20, padding: "24px 20px", cursor: "pointer", border: `3px solid ${data.movement === opt.id ? opt.color : "#E0D6CC"}`, boxShadow: theme.shadow, transition: "all 0.2s", display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ fontSize: 52 }}>{opt.emoji}</div>
            <div>
              <div style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 900, fontSize: 17, color: data.movement === opt.id ? "#fff" : theme.dark }}>{opt.title}</div>
              <div style={{ fontSize: 13, color: data.movement === opt.id ? "rgba(255,255,255,0.85)" : theme.muted, marginTop: 4, lineHeight: 1.4 }}>{opt.desc}</div>
            </div>
          </div>
        ))}
      </div>
      <Btn onClick={() => onNext()} disabled={!data.movement}>Devam →</Btn>
    </Screen>
  );
}

function FamilyCouncilScreen({ onNext, onBack, data, setData }) {
  const votes = data.votes || {};
  const toggle = id => setData({ ...data, votes: { ...votes, [id]: !votes[id] } });
  const selected = Object.keys(votes).filter(k => votes[k]);
  return (
    <Screen>
      <BackBtn onBack={onBack} />
      <StepBar step={5} total={7} />
      <h2 style={{ fontFamily: "'Nunito', sans-serif", fontSize: 26, fontWeight: 900, color: theme.dark, margin: "0 0 4px" }}>Aile Konseyi 🗳️</h2>
      <p style={{ color: theme.muted, fontSize: 14, marginBottom: 6 }}>Bu ay hangi ödülü kazanmak istiyorsunuz?</p>
      <p style={{ color: theme.primary, fontSize: 13, fontWeight: 700, marginBottom: 20 }}>⭐ Birden fazla seçebilirsiniz</p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24 }}>
        {rewards.map(r => (
          <div key={r.id} onClick={() => toggle(r.id)}
            style={{ background: votes[r.id] ? theme.accent : theme.card, borderRadius: 18, padding: "20px 12px", textAlign: "center", cursor: "pointer", border: `3px solid ${votes[r.id] ? "#F4C430" : "#E0D6CC"}`, boxShadow: theme.shadow, transition: "all 0.2s", position: "relative" }}>
            {votes[r.id] && <div style={{ position: "absolute", top: 8, right: 10, fontSize: 16 }}>✅</div>}
            <div style={{ fontSize: 44, marginBottom: 8 }}>{r.emoji}</div>
            <div style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 800, fontSize: 13, color: theme.dark }}>{r.label}</div>
          </div>
        ))}
      </div>
      <Btn onClick={() => onNext()} disabled={selected.length === 0}>
        {selected.length > 0 ? `${selected.length} ödül seçildi  -  Onayla ✓` : "En az 1 ödül seç"}
      </Btn>
    </Screen>
  );
}

function LaunchScreen({ onFinish, data }) {
  const selectedTheme = mapThemes.find(t => t.id === data.mapTheme);
  return (
    <Screen>
      <StepBar step={6} total={7} />
      <h2 style={{ fontFamily: "'Nunito', sans-serif", fontSize: 26, fontWeight: 900, color: theme.dark, margin: "0 0 4px" }}>Her şey hazır! 🚀</h2>
      <p style={{ color: theme.muted, fontSize: 14, marginBottom: 20 }}>Ailenizin macerası başlamak üzere</p>
      <div style={{ background: theme.card, borderRadius: 20, padding: 20, boxShadow: theme.shadow, marginBottom: 16 }}>
        <div style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 900, fontSize: 14, color: theme.primary, marginBottom: 12 }}>📋 ÖZET</div>
        {[
          { icon: "👤", label: "Ebeveyn",  val: data.name || " - " },
          { icon: "👨‍👩‍👧", label: "Çocuklar", val: (data.children || []).map(c => `${c.name} (${c.age})`).join(", ") || " - " },
          { icon: "🗺️", label: "Harita",   val: selectedTheme?.name || " - " },
          { icon: "🎮", label: "İlerleme", val: data.movement === "compass" ? "🧭 Pusula" : "🎲 Zar" },
          { icon: "🏆", label: "Ödüller",  val: `${Object.keys(data.votes || {}).filter(k => data.votes[k]).length} ödül seçildi` },
        ].map((item, i) => (
          <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 8 }}>
            <span style={{ fontSize: 18, minWidth: 24 }}>{item.icon}</span>
            <div>
              <div style={{ fontFamily: "'Nunito', sans-serif", fontSize: 11, color: theme.muted, fontWeight: 700 }}>{item.label.toUpperCase()}</div>
              <div style={{ fontFamily: "'Nunito', sans-serif", fontSize: 14, color: theme.dark, fontWeight: 700 }}>{item.val}</div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ background: `linear-gradient(135deg, ${theme.primary}, #FF8C42)`, borderRadius: 18, padding: 16, textAlign: "center", marginBottom: 20 }}>
        <div style={{ fontSize: 32, marginBottom: 4 }}>🔑</div>
        <div style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 900, fontSize: 13, color: "rgba(255,255,255,0.8)", marginBottom: 4 }}>AİLE DAVET KODUNUZ</div>
        <div style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 900, fontSize: 28, color: "#fff", letterSpacing: 4 }}>TINT-842</div>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", marginTop: 4 }}>Diğer aile üyelerini bu kodla davet edin</div>
      </div>
      <Btn onClick={onFinish}>🎮 Maceraya Başla!</Btn>
    </Screen>
  );
}

// ─── GÖREV HAVUZU MODAL ───────────────────────────────────────────────────────

function TaskPoolModal({ activeTasks, onAdd, onClose }) {
  const [activeCategory, setActiveCategory] = useState("all");
  const [search, setSearch] = useState("");
  const activeIds = activeTasks.map(t => t.id);

  const filtered = TASK_POOL.filter(t => {
    const matchCat = activeCategory === "all" || t.owner === activeCategory;
    const matchSearch = t.title.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const ownerColor = { child: "#4ECDC4", parent: "#FF6B35", family: "#A855F7" };
  const ownerLabel = { child: "Çocuk", parent: "Ebeveyn", family: "Aile" };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 200, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
      <div style={{ background: theme.bg, borderRadius: "24px 24px 0 0", maxHeight: "88vh", display: "flex", flexDirection: "column" }}>
        {/* Handle */}
        <div style={{ width: 40, height: 4, borderRadius: 99, background: "#D0C8BE", margin: "12px auto 0" }} />

        {/* Header */}
        <div style={{ padding: "16px 20px 0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 900, fontSize: 20, color: theme.dark }}>Görev Havuzu 📋</div>
            <div style={{ color: theme.muted, fontSize: 13, marginTop: 2 }}>{TASK_POOL.length} hazır görev · seçip ekle</div>
          </div>
          <button onClick={onClose} style={{ background: "#F0E8DC", border: "none", borderRadius: 99, width: 36, height: 36, fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
        </div>

        {/* Arama */}
        <div style={{ padding: "12px 20px 0" }}>
          <div style={{ background: theme.card, borderRadius: 14, border: "2px solid #E8DDD0", display: "flex", alignItems: "center", gap: 10, padding: "10px 14px" }}>
            <span style={{ fontSize: 18, opacity: 0.5 }}>🔍</span>
            <input
              placeholder="Görev ara..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ border: "none", outline: "none", fontSize: 15, fontFamily: "'Nunito', sans-serif", fontWeight: 700, color: theme.dark, flex: 1, background: "transparent" }}
            />
            {search && <span onClick={() => setSearch("")} style={{ cursor: "pointer", fontSize: 16, opacity: 0.5 }}>✕</span>}
          </div>
        </div>

        {/* Kategori filtreleri */}
        <div style={{ display: "flex", gap: 8, padding: "12px 20px 0", overflowX: "auto" }}>
          {[{ id: "all", label: "Tümü", emoji: "⭐", color: theme.primary }, ...POOL_CATEGORIES].map(cat => (
            <div key={cat.id} onClick={() => setActiveCategory(cat.id)}
              style={{ background: activeCategory === cat.id ? cat.color : theme.card, borderRadius: 99, padding: "7px 14px", fontSize: 13, fontFamily: "'Nunito', sans-serif", fontWeight: 800, color: activeCategory === cat.id ? "#fff" : theme.muted, cursor: "pointer", whiteSpace: "nowrap", border: `2px solid ${activeCategory === cat.id ? cat.color : "#E8DDD0"}`, transition: "all 0.2s", flexShrink: 0 }}>
              {cat.emoji} {cat.label} {activeCategory !== cat.id && <span style={{ opacity: 0.6 }}>({cat.id === "all" ? TASK_POOL.length : TASK_POOL.filter(t => t.owner === cat.id).length})</span>}
            </div>
          ))}
        </div>

        {/* Görev listesi */}
        <div style={{ flex: 1, overflowY: "auto", padding: "12px 20px 32px" }}>
          {filtered.length === 0 && (
            <div style={{ textAlign: "center", padding: "40px 0", color: theme.muted }}>
              <div style={{ fontSize: 40, marginBottom: 8 }}>🔍</div>
              <div style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 700 }}>Görev bulunamadı</div>
            </div>
          )}
          {filtered.map(task => {
            const isActive = activeIds.includes(task.id);
            return (
              <div key={task.id}
                style={{ background: isActive ? "#F0FAF8" : theme.card, borderRadius: 16, padding: "14px 14px", marginBottom: 10, border: `2px solid ${isActive ? theme.secondary : "#E8DDD0"}`, display: "flex", alignItems: "center", gap: 12, transition: "all 0.2s" }}>
                <div style={{ fontSize: 30, minWidth: 36, textAlign: "center" }}>{task.emoji}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 800, fontSize: 14, color: theme.dark, marginBottom: 3 }}>{task.title}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ background: ownerColor[task.owner] + "22", color: ownerColor[task.owner], borderRadius: 99, padding: "2px 8px", fontSize: 10, fontFamily: "'Nunito', sans-serif", fontWeight: 800 }}>{ownerLabel[task.owner]}</span>
                    <span style={{ color: theme.muted, fontSize: 11 }}>{task.desc}</span>
                  </div>
                </div>
                <button onClick={() => !isActive && onAdd(task)}
                  style={{ width: 36, height: 36, borderRadius: 99, border: "none", cursor: isActive ? "default" : "pointer", background: isActive ? theme.secondary : theme.primary, color: "#fff", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.2s", opacity: isActive ? 0.7 : 1 }}>
                  {isActive ? "✓" : "+"}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── ANA EKRAN BİLEŞENLERİ ───────────────────────────────────────────────────

function MapGrid({ position }) {
  const start = Math.max(0, position - 4);
  const squares = Array.from({ length: 30 }, (_, i) => start + i).filter(n => n < TOTAL_SQUARES);
  return (
    <div style={{ overflowX: "auto", paddingBottom: 8 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 52px)", gap: 6, width: "fit-content", margin: "0 auto" }}>
        {squares.map(n => {
          const isActive = n === position;
          const isPast = n < position;
          const special = SPECIAL_SQUARES[n];
          const landmark = anatoliaLandmarks[n % anatoliaLandmarks.length];
          return (
            <div key={n} style={{
              width: 52, height: 52, borderRadius: 12,
              background: isActive ? "linear-gradient(135deg, #FF6B35, #FF8C42)" : isPast ? "linear-gradient(135deg, #c8a97a, #b8905a)" : "linear-gradient(135deg, #f5e6d0, #eedcb8)",
              border: isActive ? "3px solid #FF6B35" : special ? "2px dashed #C0392B" : "2px solid #d4b896",
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              position: "relative", boxShadow: isActive ? "0 4px 16px rgba(255,107,53,0.4)" : "0 2px 6px rgba(0,0,0,0.08)", transition: "all 0.3s",
            }}>
              {isActive ? <div style={{ fontSize: 26, animation: "bounce 1s infinite" }}>🧭</div>
                : special === "surprise" ? <div style={{ fontSize: 22 }}>🎁</div>
                : special === "mini-game" ? <div style={{ fontSize: 22 }}>⚡</div>
                : <div style={{ fontSize: isPast ? 18 : 16, opacity: isPast ? 1 : 0.6 }}>{landmark}</div>}
              <div style={{ position: "absolute", bottom: 2, right: 4, fontSize: 9, fontFamily: "'Nunito', sans-serif", fontWeight: 800, color: isActive ? "#fff" : isPast ? "#7a5a2a" : "#b09060", opacity: 0.8 }}>{n + 1}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TaskCard({ task, onToggle, onRemove }) {
  const ownerColors = { child: "#4ECDC4", parent: "#FF6B35", family: "#A855F7" };
  const ownerLabels = { child: "Çocuk", parent: "Ebeveyn", family: "Aile" };
  return (
    <div style={{ background: task.done ? "linear-gradient(135deg, #f0faf8, #e0f5f0)" : theme.card, borderRadius: 16, padding: "14px 14px", marginBottom: 10, border: `2px solid ${task.done ? theme.secondary : "#E8DDD0"}`, boxShadow: theme.shadow, transition: "all 0.25s", display: "flex", alignItems: "center", gap: 12 }}>
      <div onClick={() => onToggle(task.id)} style={{ fontSize: 30, minWidth: 36, textAlign: "center", cursor: "pointer", filter: task.done ? "none" : "grayscale(0.2)" }}>{task.emoji}</div>
      <div onClick={() => onToggle(task.id)} style={{ flex: 1, cursor: "pointer" }}>
        <div style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 900, fontSize: 14, color: task.done ? theme.secondary : theme.dark, textDecoration: task.done ? "line-through" : "none", marginBottom: 3 }}>{task.title}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ background: ownerColors[task.owner] + "22", color: ownerColors[task.owner], borderRadius: 99, padding: "2px 8px", fontSize: 10, fontFamily: "'Nunito', sans-serif", fontWeight: 800 }}>{ownerLabels[task.owner]}</span>
          <span style={{ color: theme.muted, fontSize: 11 }}>{task.desc}</span>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "center" }}>
        <div onClick={() => onToggle(task.id)} style={{ width: 28, height: 28, borderRadius: 99, border: `2.5px solid ${task.done ? theme.secondary : "#D0C8BE"}`, background: task.done ? theme.secondary : "transparent", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all 0.2s" }}>
          {task.done && <span style={{ color: "#fff", fontSize: 14, fontWeight: 900 }}>✓</span>}
        </div>
        {onRemove && (
          <button onClick={() => onRemove(task.id)} style={{ background: "none", border: "none", fontSize: 14, cursor: "pointer", color: "#D0C8BE", padding: 0, lineHeight: 1 }} title="Kaldır">✕</button>
        )}
      </div>
    </div>
  );
}

function CompassModal({ onSpin, onClose, movement }) {
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState(null);
  const spin = () => {
    setSpinning(true);
    setTimeout(() => { const r = Math.floor(Math.random() * 6) + 1; setResult(r); setSpinning(false); }, 1200);
  };
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 100 }}>
      <div style={{ background: theme.bg, borderRadius: "24px 24px 0 0", padding: "28px 24px 40px", width: "100%", maxWidth: 390, textAlign: "center" }}>
        <div style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 900, fontSize: 22, color: theme.dark, marginBottom: 6 }}>{movement === "compass" ? "🧭 Pusula Çevir!" : "🎲 Zar At!"}</div>
        <p style={{ color: theme.muted, fontSize: 14, marginBottom: 24 }}>Günlük görevleri tamamladın, sıra ilerlemeye geldi!</p>
        <div style={{ fontSize: 80, marginBottom: 16, display: "inline-block", animation: spinning ? "spin 0.3s linear infinite" : "none" }}>{movement === "compass" ? "🧭" : "🎲"}</div>
        {result && !spinning && (
          <div style={{ background: "linear-gradient(135deg, #FF6B35, #FF8C42)", borderRadius: 20, padding: "16px 24px", marginBottom: 20 }}>
            <div style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 900, fontSize: 48, color: "#fff" }}>{result}</div>
            <div style={{ color: "rgba(255,255,255,0.9)", fontSize: 14, fontWeight: 700 }}>adım ilerliyorsun! 🎉</div>
          </div>
        )}
        <div style={{ display: "flex", gap: 10 }}>
          {!result ? (
            <Btn onClick={spin} style={{ flex: 1 }} disabled={spinning}>{spinning ? "..." : movement === "compass" ? "Çevir!" : "At!"}</Btn>
          ) : (
            <Btn onClick={() => { onSpin(result); onClose(); }} style={{ flex: 1 }}>Haritada İlerle →</Btn>
          )}
          <Btn variant="ghost" onClick={onClose} style={{ flex: 0, padding: "15px 18px", width: "auto" }}>✕</Btn>
        </div>
      </div>
    </div>
  );
}

// ─── MİNİ OYUNLAR ────────────────────────────────────────────────────────────

function MiniGameModal({ onClose, onWin }) {
  const [game] = useState(() => Math.random() < 0.5 ? "hunt" : "balloon");
  const [phase, setPhase] = useState("intro"); // intro | playing | won | lost
  const [timeLeft, setTimeLeft] = useState(60);
  const [target, setTarget] = useState(null);
  const [balloonSize, setBalloonSize] = useState(40);
  const [p1Pressed, setP1Pressed] = useState(false);
  const [p2Pressed, setP2Pressed] = useState(false);
  const [syncResult, setSyncResult] = useState(null);

  const HUNT_TARGETS = [
    { color: "kırmızı", emoji: "🔴", hint: "Kırmızı renkli bir eşya" },
    { color: "mavi",    emoji: "🔵", hint: "Mavi renkli bir eşya" },
    { color: "sarı",    emoji: "🟡", hint: "Sarı renkli bir eşya" },
    { color: "yeşil",   emoji: "🟢", hint: "Yeşil renkli bir eşya" },
    { color: "beyaz",   emoji: "⚪", hint: "Beyaz renkli bir eşya" },
  ];

  const startGame = () => {
    if (game === "hunt") {
      setTarget(HUNT_TARGETS[Math.floor(Math.random() * HUNT_TARGETS.length)]);
      setPhase("playing");
      let t = 60;
      const iv = setInterval(() => {
        t--;
        setTimeLeft(t);
        if (t <= 0) { clearInterval(iv); setPhase("lost"); }
      }, 1000);
    } else {
      setPhase("playing");
      let size = 40;
      const iv = setInterval(() => {
        size += 2.5;
        setBalloonSize(size);
        if (size >= 200) { clearInterval(iv); setPhase("lost"); }
      }, 120);
    }
  };

  // Balon oyunu  -  iki butonun neredeyse aynı anda basılması
  const pressBtn = (who) => {
    if (phase !== "playing") return;
    if (who === 1) setP1Pressed(true);
    if (who === 2) setP2Pressed(true);
  };

  // p1 veya p2 değişince kontrol et
  const checkSync = (p1, p2) => {
    if (p1 && p2) { setSyncResult("win"); setPhase("won"); }
    else if (p1 || p2) {
      setTimeout(() => {
        setP1Pressed(pp1 => {
          setP2Pressed(pp2 => {
            if ((p1 ? pp1 : !pp1) !== (p2 ? pp2 : !pp2)) { setSyncResult("miss"); setPhase("lost"); }
            return pp2;
          });
          return pp1;
        });
      }, 600);
    }
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 150 }}>
      <div style={{ background: theme.bg, borderRadius: "28px 28px 0 0", width: "100%", maxWidth: 390, padding: "24px 22px 40px", minHeight: "60vh", display: "flex", flexDirection: "column" }}>
        <div style={{ width: 40, height: 4, borderRadius: 99, background: "#D0C8BE", margin: "0 auto 20px" }} />

        {/* ── EŞYA AVI ── */}
        {game === "hunt" && (
          <>
            {phase === "intro" && (
              <div style={{ textAlign: "center", flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <div style={{ fontSize: 64, marginBottom: 12 }}>⚡</div>
                <div style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 900, fontSize: 22, color: theme.dark, marginBottom: 8 }}>Eşya Avı!</div>
                <div style={{ color: theme.muted, fontSize: 14, marginBottom: 24, lineHeight: 1.6 }}>60 saniyede evden istenen renkteki eşyayı bulup getir. Hep beraber koşun!</div>
                <Btn onClick={startGame}>Başla! 🏃</Btn>
              </div>
            )}
            {phase === "playing" && target && (
              <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 900, fontSize: 14, color: theme.muted, marginBottom: 8 }}>SÜRE</div>
                <div style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 900, fontSize: 64, color: timeLeft <= 10 ? "#DC2626" : theme.primary, lineHeight: 1, marginBottom: 16, transition: "color 0.3s" }}>{timeLeft}</div>
                <div style={{ background: "linear-gradient(135deg,#FFE8D6,#FFD4B8)", borderRadius: 22, padding: "24px 20px", textAlign: "center", width: "100%", marginBottom: 24 }}>
                  <div style={{ fontSize: 72, marginBottom: 8 }}>{target.emoji}</div>
                  <div style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 900, fontSize: 20, color: theme.dark }}>{target.hint}</div>
                  <div style={{ color: theme.muted, fontSize: 13, marginTop: 6 }}>bulup masaya getirin!</div>
                </div>
                <Btn onClick={() => setPhase("won")}>✅ Bulduk! Görevi Başardık!</Btn>
              </div>
            )}
            {phase === "won" && (
              <div style={{ textAlign: "center", flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <div style={{ fontSize: 72, marginBottom: 12 }}>🎉</div>
                <div style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 900, fontSize: 24, color: theme.secondary, marginBottom: 8 }}>Harika iş!</div>
                <div style={{ color: theme.muted, fontSize: 14, marginBottom: 24 }}>Eşyayı buldunuz  -  ekstra adım kazandınız!</div>
                <Btn onClick={() => { onWin(); onClose(); }}>+1 Ekstra Adım Al 🎁</Btn>
              </div>
            )}
            {phase === "lost" && (
              <div style={{ textAlign: "center", flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <div style={{ fontSize: 72, marginBottom: 12 }}>⏰</div>
                <div style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 900, fontSize: 22, color: theme.primary, marginBottom: 8 }}>Süre Doldu!</div>
                <div style={{ color: theme.muted, fontSize: 14, marginBottom: 24 }}>Üzülme, bir dahaki sefere!</div>
                <Btn onClick={onClose} variant="ghost">Tamam</Btn>
              </div>
            )}
          </>
        )}

        {/* ── SENKRONİZE BALON ── */}
        {game === "balloon" && (
          <>
            {phase === "intro" && (
              <div style={{ textAlign: "center", flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <div style={{ fontSize: 64, marginBottom: 12 }}>🎈</div>
                <div style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 900, fontSize: 22, color: theme.dark, marginBottom: 8 }}>Senkronize Balon!</div>
                <div style={{ color: theme.muted, fontSize: 14, marginBottom: 24, lineHeight: 1.6 }}>İki kişi tam aynı anda butonlara basmalı  -  balon patlamadan! Takım çalışması şart.</div>
                <Btn onClick={startGame}>Hazırız! 🎈</Btn>
              </div>
            )}
            {phase === "playing" && (
              <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 800, fontSize: 13, color: theme.muted, marginBottom: 12, textAlign: "center" }}>Balon patlmadan ikisi birden basın!</div>
                {/* Balon */}
                <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <div style={{
                    width: balloonSize, height: balloonSize * 1.2,
                    background: `radial-gradient(circle at 35% 35%, #ff8080, #FF6B35)`,
                    borderRadius: "50% 50% 50% 50% / 60% 60% 40% 40%",
                    boxShadow: `0 0 ${balloonSize * 0.3}px rgba(255,107,53,0.4)`,
                    transition: "all 0.12s ease",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: Math.max(16, balloonSize * 0.3),
                  }}>🎈</div>
                </div>
                {/* İki buton */}
                <div style={{ display: "flex", gap: 16, width: "100%" }}>
                  <button
                    onPointerDown={() => { setP1Pressed(true); checkSync(true, p2Pressed); }}
                    style={{ flex: 1, height: 80, borderRadius: 20, border: "none", background: p1Pressed ? theme.secondary : "#4ECDC444", fontSize: 28, cursor: "pointer", transition: "all 0.1s", fontFamily: "'Nunito', sans-serif", fontWeight: 900, color: p1Pressed ? "#fff" : theme.secondary }}>
                    {p1Pressed ? "✓" : "BAS!"}
                  </button>
                  <button
                    onPointerDown={() => { setP2Pressed(true); checkSync(p1Pressed, true); }}
                    style={{ flex: 1, height: 80, borderRadius: 20, border: "none", background: p2Pressed ? theme.primary : "#FF6B3544", fontSize: 28, cursor: "pointer", transition: "all 0.1s", fontFamily: "'Nunito', sans-serif", fontWeight: 900, color: p2Pressed ? "#fff" : theme.primary }}>
                    {p2Pressed ? "✓" : "BAS!"}
                  </button>
                </div>
                <div style={{ color: theme.muted, fontSize: 12, marginTop: 10, textAlign: "center" }}>Sol: 1. kişi · Sağ: 2. kişi</div>
              </div>
            )}
            {phase === "won" && (
              <div style={{ textAlign: "center", flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <div style={{ fontSize: 72, marginBottom: 12 }}>🤝</div>
                <div style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 900, fontSize: 24, color: theme.secondary, marginBottom: 8 }}>Mükemmel Senkron!</div>
                <div style={{ color: theme.muted, fontSize: 14, marginBottom: 24 }}>Harika takım çalışması  -  ekstra adım kazandınız!</div>
                <Btn onClick={() => { onWin(); onClose(); }}>+1 Ekstra Adım Al 🎁</Btn>
              </div>
            )}
            {phase === "lost" && (
              <div style={{ textAlign: "center", flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <div style={{ fontSize: 72, marginBottom: 12 }}>{syncResult === "miss" ? "😅" : "💥"}</div>
                <div style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 900, fontSize: 22, color: theme.primary, marginBottom: 8 }}>{syncResult === "miss" ? "Senkron Olmadı!" : "Balon Patladı!"}</div>
                <div style={{ color: theme.muted, fontSize: 14, marginBottom: 24 }}>Bir dahaki sefere daha iyi olur!</div>
                <Btn onClick={onClose} variant="ghost">Tamam</Btn>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ─── AVATAR ÖZELLEŞTİRME ─────────────────────────────────────────────────────

const HAIR_OPTIONS  = ["👱","🧑","👨‍🦰","👨‍🦳","👩‍🦱","👩‍🦲","🧓"];
const GLASS_OPTIONS = ["", "🕶️", "👓", "🥽"];
const COLOR_OPTIONS = ["#FF6B35","#4ECDC4","#A855F7","#FFD700","#E91E8C","#1E8449","#2563EB"];

function AvatarCustomizeModal({ member, onSave, onClose }) {
  const [hair,  setHair]  = useState(member.customization?.hair  || 0);
  const [glass, setGlass] = useState(member.customization?.glass || 0);
  const [color, setColor] = useState(member.customization?.color || COLOR_OPTIONS[0]);

  const baseEmoji = avatarDefs.find(a => a.id === member.avatar)?.emoji || "👤";

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 200 }}>
      <div style={{ background: theme.bg, borderRadius: "28px 28px 0 0", width: "100%", maxWidth: 390, padding: "20px 22px 40px" }}>
        <div style={{ width: 40, height: 4, borderRadius: 99, background: "#D0C8BE", margin: "0 auto 16px" }} />

        <div style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 900, fontSize: 20, color: theme.dark, marginBottom: 4 }}>Avatar Özelleştir ✨</div>
        <div style={{ color: theme.muted, fontSize: 13, marginBottom: 20 }}>{member.name} için görünümü kişiselleştir</div>

        {/* Önizleme */}
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", background: `${color}22`, border: `3px solid ${color}`, borderRadius: 99, width: 100, height: 100, justifyContent: "center", position: "relative" }}>
            <div style={{ fontSize: 48 }}>{baseEmoji}</div>
            {GLASS_OPTIONS[glass] && (
              <div style={{ position: "absolute", top: 22, right: 10, fontSize: 18 }}>{GLASS_OPTIONS[glass]}</div>
            )}
            <div style={{ position: "absolute", bottom: -8, background: color, borderRadius: 99, padding: "2px 10px", fontFamily: "'Nunito', sans-serif", fontSize: 11, fontWeight: 800, color: "#fff" }}>{member.name}</div>
          </div>
        </div>

        {/* Saç */}
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 800, fontSize: 13, color: theme.dark, marginBottom: 8 }}>💇 Saç Stili</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {HAIR_OPTIONS.map((h, i) => (
              <div key={i} onClick={() => setHair(i)}
                style={{ width: 44, height: 44, borderRadius: 12, background: hair === i ? theme.primary : "#F0E8DC", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, cursor: "pointer", border: `2px solid ${hair === i ? theme.primary : "transparent"}`, transition: "all 0.15s" }}>
                {h}
              </div>
            ))}
          </div>
        </div>

        {/* Gözlük */}
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 800, fontSize: 13, color: theme.dark, marginBottom: 8 }}>👓 Aksesuar</div>
          <div style={{ display: "flex", gap: 8 }}>
            {GLASS_OPTIONS.map((g, i) => (
              <div key={i} onClick={() => setGlass(i)}
                style={{ width: 52, height: 44, borderRadius: 12, background: glass === i ? theme.secondary : "#F0E8DC", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, cursor: "pointer", border: `2px solid ${glass === i ? theme.secondary : "transparent"}`, transition: "all 0.15s", fontFamily: "'Nunito', sans-serif", fontWeight: 800, color: glass === i ? "#fff" : theme.muted, fontSize: g ? 22 : 13 }}>
                {g || "Yok"}
              </div>
            ))}
          </div>
        </div>

        {/* Renk */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 800, fontSize: 13, color: theme.dark, marginBottom: 8 }}>🎨 Avatar Rengi</div>
          <div style={{ display: "flex", gap: 8 }}>
            {COLOR_OPTIONS.map((c, i) => (
              <div key={i} onClick={() => setColor(c)}
                style={{ width: 36, height: 36, borderRadius: 99, background: c, cursor: "pointer", border: color === c ? "3px solid #fff" : "3px solid transparent", boxShadow: color === c ? `0 0 0 3px ${c}` : "none", transition: "all 0.15s" }} />
            ))}
          </div>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <Btn onClick={() => onSave({ hair, glass, color })} style={{ flex: 2 }}>Kaydet ✓</Btn>
          <Btn variant="ghost" onClick={onClose} style={{ flex: 1 }}>İptal</Btn>
        </div>
      </div>
    </div>
  );
}
const SURPRISE_POOL = {
  couple: {
    label: "Eşler Arası", emoji: "💑", color: "#E91E8C",
    bg: "linear-gradient(135deg, #ffe0f0, #ffc2e2)",
    items: [
      { emoji: "☕", text: "Eşine günün yorgunluğunu atması için en sevdiği kahveyi yap." },
      { emoji: "🌸", text: "Eve dönerken eşine küçük bir çiçek veya jest al." },
      { emoji: "💌", text: "Eşine bugün neden mükemmel olduğunu anlatan bir mesaj at." },
      { emoji: "🛁", text: "Eşine akşam rahatlaması için sıcak bir banyo hazırla." },
      { emoji: "🎵", text: "Eşinin en sevdiği şarkıyı çal ve ona söyle." },
      { emoji: "🤝", text: "Eşinle bugün 5 dakika el ele oturup sadece konuşun." },
    ],
  },
  parentToChild: {
    label: "Ebeveynden Çocuğa", emoji: "🧒", color: "#FF6B35",
    bg: "linear-gradient(135deg, #fff0e0, #ffd9b8)",
    items: [
      { emoji: "🍦", text: "Çocuğuna bugün zararsız, en sevdiği atıştırmalığı sürpriz olarak al." },
      { emoji: "🎮", text: "Çocuğunla 10 dakika boyunca onun seçtiği bir fiziksel oyunu oyna." },
      { emoji: "📖", text: "Çocuğuna onun seçtiği bir kitabı yüksek sesle oku." },
      { emoji: "🎨", text: "Çocuğunla birlikte bir şeyler çizin, ne olduğu önemli değil!" },
      { emoji: "🌟", text: "Çocuğuna bugün neden gurur duyduğunu söyle, gözlerine bak." },
      { emoji: "🎒", text: "Yarın okul için çantasını birlikte hazırlayın." },
    ],
  },
  childToParent: {
    label: "Çocuktan Ebeveyne", emoji: "👨‍👩‍👧", color: "#4ECDC4",
    bg: "linear-gradient(135deg, #e0faf8, #b8f2ee)",
    items: [
      { emoji: "🤗", text: "Hemen git annene/babana kocaman sarıl ve öp!" },
      { emoji: "💬", text: "Babana/annene gününün en güzel anını anlat." },
      { emoji: "🖼️", text: "Anne veya baban için bir resim çiz ve hediye et." },
      { emoji: "🍵", text: "Ebeveynine bir bardak çay veya su getir." },
      { emoji: "🧹", text: "Ebeveynine yardım etmek için evi süpür ya da topla." },
      { emoji: "🌙", text: "Bugün geceye kadar annene/babana hiç şikayet etme!" },
    ],
  },
  family: {
    label: "Ev İçi / Ortak", emoji: "🏠", color: "#A855F7",
    bg: "linear-gradient(135deg, #f3e8ff, #e0c8ff)",
    items: [
      { emoji: "🐾", text: "Evdeki evcil hayvanınızla 5 dakika boyunca sadece oyun oynayın." },
      { emoji: "🍕", text: "Bugün akşam yemeğini birlikte hazırlayın, herkes bir şey yapsın." },
      { emoji: "📸", text: "Şu an hepiniz birlikte komik bir fotoğraf çekin!" },
      { emoji: "🎲", text: "Bugün akşam 20 dakika kutu oyunu oynayın." },
      { emoji: "🌳", text: "Hep birlikte 15 dakika dışarı çıkın  -  park, balkon, bahçe." },
      { emoji: "🎬", text: "Birlikte bir film veya belgesel seçin ve izleyin." },
    ],
  },
};

function SurpriseModal({ onClose }) {
  const categories = Object.values(SURPRISE_POOL);
  const [selectedCat, setSelectedCat] = useState(null);
  const [drawnItem, setDrawnItem] = useState(null);
  const [phase, setPhase] = useState("pick"); // pick | reveal

  const pickCategory = (cat) => {
    const item = cat.items[Math.floor(Math.random() * cat.items.length)];
    setSelectedCat(cat);
    setDrawnItem(item);
    setPhase("reveal");
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 100 }}>
      <div style={{ background: theme.bg, borderRadius: "28px 28px 0 0", width: "100%", maxWidth: 390, maxHeight: "88vh", overflowY: "auto", paddingBottom: 32 }}>
        {/* Handle */}
        <div style={{ width: 40, height: 4, borderRadius: 99, background: "#D0C8BE", margin: "12px auto 0" }} />

        {phase === "pick" && (
          <div style={{ padding: "20px 22px" }}>
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <div style={{ fontSize: 56, marginBottom: 6 }}>🎁</div>
              <div style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 900, fontSize: 22, color: theme.dark }}>Sürpriz Kare!</div>
              <div style={{ color: theme.muted, fontSize: 14, marginTop: 4 }}>Bir kategori seç  -  sürprizin hazır!</div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {categories.map((cat, i) => (
                <div key={i} onClick={() => pickCategory(cat)}
                  style={{ background: cat.bg, borderRadius: 20, padding: "18px 20px", cursor: "pointer", display: "flex", alignItems: "center", gap: 14, border: `2px solid transparent`, transition: "transform 0.15s", boxShadow: theme.shadow }}
                  onMouseDown={e => e.currentTarget.style.transform = "scale(0.97)"}
                  onMouseUp={e => e.currentTarget.style.transform = "scale(1)"}>
                  <div style={{ fontSize: 36 }}>{cat.emoji}</div>
                  <div>
                    <div style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 900, fontSize: 16, color: theme.dark }}>{cat.label}</div>
                    <div style={{ fontFamily: "'Nunito', sans-serif", fontSize: 12, color: theme.muted, marginTop: 2 }}>{cat.items.length} farklı sürpriz</div>
                  </div>
                  <div style={{ marginLeft: "auto", fontSize: 20, color: cat.color }}>→</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {phase === "reveal" && selectedCat && drawnItem && (
          <div style={{ padding: "20px 22px", textAlign: "center" }}>
            <div style={{ display: "inline-block", background: selectedCat.bg, borderRadius: 99, padding: "6px 16px", fontFamily: "'Nunito', sans-serif", fontWeight: 800, fontSize: 12, color: selectedCat.color, marginBottom: 16 }}>
              {selectedCat.emoji} {selectedCat.label}
            </div>
            <div style={{ fontSize: 80, marginBottom: 12, animation: "bounce 0.6s ease" }}>{drawnItem.emoji}</div>
            <div style={{ background: selectedCat.bg, borderRadius: 22, padding: "22px 18px", marginBottom: 12 }}>
              <div style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 800, fontSize: 18, color: theme.dark, lineHeight: 1.4 }}>{drawnItem.text}</div>
            </div>
            <div style={{ color: theme.muted, fontSize: 12, marginBottom: 20 }}>Bu görevi yapmadan bir sonraki tura geçemezsin!</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <Btn onClick={onClose}>Görevi Kabul Et! 🤝</Btn>
              <Btn variant="ghost" onClick={() => { setPhase("pick"); setSelectedCat(null); setDrawnItem(null); }}>
                ← Kategori Değiştir
              </Btn>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── KUTLAMA EKRANI (120. KARE) ───────────────────────────────────────────────
function CelebrationScreen({ data, onNewSeason }) {
  const [confetti] = useState(() =>
    Array.from({ length: 60 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 2,
      dur: 2.5 + Math.random() * 2,
      emoji: ["🎉","⭐","🏺","🌟","✨","🎊","💫","🎈"][Math.floor(Math.random() * 8)],
      size: 16 + Math.random() * 20,
    }))
  );

  const selectedRewards = Object.keys(data.votes || {})
    .filter(k => data.votes[k])
    .map(id => rewards.find(r => r.id === id))
    .filter(Boolean);

  return (
    <div style={{ position: "fixed", inset: 0, background: "linear-gradient(160deg, #1a0533 0%, #3d0d6e 50%, #6C3483 100%)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", zIndex: 300, overflow: "hidden", padding: "0 24px" }}>
      {/* Confetti */}
      {confetti.map(c => (
        <div key={c.id} style={{
          position: "absolute",
          left: `${c.x}%`,
          top: "-40px",
          fontSize: c.size,
          animation: `confettiFall ${c.dur}s ${c.delay}s linear infinite`,
          pointerEvents: "none",
          zIndex: 301,
        }}>{c.emoji}</div>
      ))}

      {/* Content */}
      <div style={{ textAlign: "center", zIndex: 302, maxWidth: 340 }}>
        <div style={{ fontSize: 88, marginBottom: 8, animation: "bounce 0.8s infinite" }}>🏆</div>
        <div style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 900, fontSize: 32, color: "#FFD700", lineHeight: 1.1, marginBottom: 8, textShadow: "0 0 30px rgba(255,215,0,0.5)" }}>
          Tebrikler!
        </div>
        <div style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 800, fontSize: 18, color: "#fff", marginBottom: 6 }}>
          120 Kareyi Tamamladınız! 🎊
        </div>
        <div style={{ fontFamily: "'Nunito', sans-serif", fontSize: 14, color: "rgba(255,255,255,0.75)", marginBottom: 28, lineHeight: 1.6 }}>
          Bir aylık maceranızı başarıyla bitirdiniz.<br />Büyük hazineye ulaştınız!
        </div>

        {/* Büyük ödül */}
        {selectedRewards.length > 0 && (
          <div style={{ background: "rgba(255,255,255,0.12)", borderRadius: 24, padding: "20px 18px", marginBottom: 24, border: "2px solid rgba(255,215,0,0.4)" }}>
            <div style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 900, fontSize: 12, color: "#FFD700", marginBottom: 10, letterSpacing: 1 }}>🏅 KAZANILAN BÜYÜK ÖDÜL</div>
            <div style={{ display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
              {selectedRewards.map((r, i) => (
                <div key={i} style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 44 }}>{r.emoji}</div>
                  <div style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 800, fontSize: 13, color: "#fff", marginTop: 4 }}>{r.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Aile özeti */}
        <div style={{ background: "rgba(255,255,255,0.10)", borderRadius: 20, padding: "14px 16px", marginBottom: 24, display: "flex", justifyContent: "space-around" }}>
          {[
            { val: "120", label: "Kare" },
            { val: "~30", label: "Gün" },
            { val: (data.children||[]).length + 1, label: "Kahraman" },
          ].map((s, i) => (
            <div key={i} style={{ textAlign: "center" }}>
              <div style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 900, fontSize: 26, color: "#FFD700" }}>{s.val}</div>
              <div style={{ fontFamily: "'Nunito', sans-serif", fontSize: 11, color: "rgba(255,255,255,0.7)", fontWeight: 700 }}>{s.label}</div>
            </div>
          ))}
        </div>

        <Btn onClick={onNewSeason} style={{ background: "linear-gradient(135deg, #FFD700, #FFA500)", color: "#1a0533", fontWeight: 900, fontSize: 17 }}>
          🚀 Yeni Sezon Başlat!
        </Btn>
      </div>

      <style>{`
        @keyframes confettiFall {
          0%   { transform: translateY(0) rotate(0deg);   opacity: 1; }
          80%  { opacity: 1; }
          100% { transform: translateY(110vh) rotate(720deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

// ─── ANA EKRAN ────────────────────────────────────────────────────────────────

function HomeScreen({ data, activeUser, seasonNo, globalState, setGlobalState, onSwitchUser, onNewSeason }) {
  const { position, tasks, memberRights, memberDone } = globalState;

  const setPosition  = (v) => setGlobalState(s => ({ ...s, position: typeof v === "function" ? v(s.position) : v }));
  const setTasks     = (v) => setGlobalState(s => ({ ...s, tasks: typeof v === "function" ? v(s.tasks) : v }));

  const myKey = activeUser?.id || "parent";
  const myOwner = activeUser?.ownerKey || "parent";
  const myRights = memberRights[myKey] || 0;
  const myDone = memberDone[myKey] || false;

  // Benim görevlerim: ownerKey eşleşenler + family görevleri
  const myTasks = tasks.filter(t => t.owner === myOwner || t.owner === "family");
  const myDoneCount = myTasks.filter(t => t.done).length;
  const myAllDone = myTasks.length > 0 && myDoneCount === myTasks.length;

  const [showCompass, setShowCompass] = useState(false);
  const [showSurprise, setShowSurprise] = useState(false);
  const [showPool, setShowPool] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [showMiniGame, setShowMiniGame] = useState(false);
  const [showAvatarEdit, setShowAvatarEdit] = useState(false);
  const [customizations, setCustomizations] = useState({});
  const [activeTab, setActiveTab] = useState("home");

  const progressPct = Math.round((position / TOTAL_SQUARES) * 100);
  const parentAvatar = avatarDefs.find(a => a.id === data.avatar);

  const toggleTask = id => setTasks(ts => ts.map(t => t.id === id ? { ...t, done: !t.done } : t));
  const removeTask = id => setTasks(ts => ts.filter(t => t.id !== id));
  const addTask    = (task) => { if (tasks.find(t => t.id === task.id)) return; setTasks(ts => [...ts, { ...task, done: false }]); };

  // Tüm görevler bitince hak kazan
  const claimRight = () => {
    if (!myAllDone || myDone) return;
    setGlobalState(s => ({
      ...s,
      memberRights: { ...s.memberRights, [myKey]: (s.memberRights[myKey] || 0) + 1 },
      memberDone: { ...s.memberDone, [myKey]: true },
    }));
  };

  const handleSpin = (steps) => {
    const newPos = Math.min(position + steps, TOTAL_SQUARES - 1);
    setGlobalState(s => ({
      ...s,
      position: newPos,
      memberRights: { ...s.memberRights, [myKey]: Math.max(0, (s.memberRights[myKey] || 0) - 1) },
      memberDone: { ...s.memberDone, [myKey]: false },
      tasks: s.tasks.map(t => ({ ...t, done: false })),
    }));
    if (newPos === TOTAL_SQUARES - 1) setTimeout(() => setShowCelebration(true), 600);
    else if (SPECIAL_SQUARES[newPos] === "surprise") setTimeout(() => setShowSurprise(true), 400);
    else if (SPECIAL_SQUARES[newPos] === "mini-game") setTimeout(() => setShowMiniGame(true), 400);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ background: theme.anatoliaBg, padding: "16px 20px 14px", borderBottom: "2px solid #e8cfa0" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <div>
            <div style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 900, fontSize: 20, color: theme.dark }}>Life<span style={{ color: theme.primary }}>Board</span> <span style={{ fontSize: 13, color: "#8a6a3a", fontWeight: 700 }}>S{seasonNo}</span></div>
            <div style={{ fontFamily: "'Nunito', sans-serif", fontSize: 12, color: "#8a6a3a", fontWeight: 700 }}>🏺 {mapThemes.find(t => t.id === data.mapTheme)?.name || "Anadolu Masalları"}</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ background: "#fff8", borderRadius: 99, padding: "5px 10px", fontFamily: "'Nunito', sans-serif", fontWeight: 800, fontSize: 12, color: theme.dark }}>📍 {position + 1}/{TOTAL_SQUARES}</div>
            {/* Aktif kullanıcı + geçiş */}
            <div onClick={onSwitchUser} style={{ display: "flex", alignItems: "center", gap: 6, background: theme.primary, borderRadius: 99, padding: "6px 12px", cursor: "pointer" }}>
              <span style={{ fontSize: 20 }}>{activeUser?.emoji || parentAvatar?.emoji || "👩"}</span>
              <span style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 800, fontSize: 12, color: "#fff" }}>{activeUser?.name || data.name || "Ben"}</span>
              <span style={{ fontSize: 10, color: "rgba(255,255,255,0.8)" }}>↕</span>
            </div>
          </div>
        </div>
        <div style={{ background: "#e8cfa0", borderRadius: 99, height: 10, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${progressPct}%`, background: "linear-gradient(90deg,#C0392B,#e74c3c)", borderRadius: 99, transition: "width 0.6s ease" }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
          <span style={{ fontFamily: "'Nunito', sans-serif", fontSize: 11, color: "#8a6a3a", fontWeight: 700 }}>Başlangıç 🏺</span>
          <span style={{ fontFamily: "'Nunito', sans-serif", fontSize: 11, color: "#8a6a3a", fontWeight: 700 }}>%{progressPct}</span>
          <span style={{ fontFamily: "'Nunito', sans-serif", fontSize: 11, color: "#8a6a3a", fontWeight: 700 }}>Hazine 💎</span>
        </div>
      </div>

      {/* Tab nav */}
      <div style={{ display: "flex", background: theme.card, borderBottom: "2px solid #F0E8DC" }}>
        {[{ id: "home", label: "🏠 Ana" }, { id: "map", label: "🗺️ Harita" }, { id: "tasks", label: "✅ Görev" }, { id: "profile", label: "👤 Profil" }].map(tab => (
          <div key={tab.id} onClick={() => setActiveTab(tab.id)}
            style={{ flex: 1, padding: "12px 4px", textAlign: "center", fontFamily: "'Nunito', sans-serif", fontWeight: 800, fontSize: 12, color: activeTab === tab.id ? theme.primary : theme.muted, borderBottom: `3px solid ${activeTab === tab.id ? theme.primary : "transparent"}`, cursor: "pointer", transition: "all 0.2s" }}>
            {tab.label}
          </div>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: "auto", padding: "18px 16px 90px" }}>

        {/* HOME TAB */}
        {activeTab === "home" && (
          <>
            <div style={{ background: "linear-gradient(135deg, #fff8ee, #fff0dc)", borderRadius: 20, padding: "16px 18px", marginBottom: 16, border: "2px solid #e8cfa0" }}>
              <div style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 900, fontSize: 14, color: "#8a6a3a", marginBottom: 10 }}>👨‍👩‍👧 AİLE EKİBİ</div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                {[{ emoji: parentAvatar?.emoji || "👩", name: data.name || "Ebeveyn", role: "Ebeveyn", rights: 2 },
                  ...((data.children || []).map(c => ({ emoji: avatarDefs.find(a => a.id === c.avatar)?.emoji || "👧", name: c.name, role: `${c.age} yaş`, rights: 1 })))
                ].map((m, i) => (
                  <div key={i} style={{ background: "#fff", borderRadius: 14, padding: "10px 12px", textAlign: "center", border: "2px solid #e8cfa0", minWidth: 70 }}>
                    <div style={{ fontSize: 28 }}>{m.emoji}</div>
                    <div style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 800, fontSize: 12, color: theme.dark, marginTop: 2 }}>{m.name}</div>
                    <div style={{ fontFamily: "'Nunito', sans-serif", fontSize: 10, color: theme.muted }}>{m.role}</div>
                    <div style={{ marginTop: 4, background: "#fff3e0", borderRadius: 99, padding: "2px 6px", fontSize: 10, fontWeight: 800, color: theme.primary }}>
                      {m.rights > 0 ? `${m.rights}x ${data.movement === "compass" ? "🧭" : "🎲"}` : "Görev bekliyor"}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ background: theme.card, borderRadius: 20, padding: "16px 18px", marginBottom: 16, boxShadow: theme.shadow }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                <div style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 900, fontSize: 14, color: theme.primary }}>📋 BUGÜNÜN GÖREVLERİM</div>
                <div style={{ fontFamily: "'Nunito', sans-serif", fontSize: 12, fontWeight: 800, color: theme.muted }}>{myDoneCount}/{myTasks.length}</div>
              </div>
              {myTasks.slice(0, 3).map(task => (
                <div key={task.id} onClick={() => toggleTask(task.id)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: "1px solid #F5EDE0", cursor: "pointer" }}>
                  <span style={{ fontSize: 22 }}>{task.emoji}</span>
                  <span style={{ fontFamily: "'Nunito', sans-serif", fontSize: 13, fontWeight: 700, flex: 1, color: task.done ? theme.secondary : theme.dark, textDecoration: task.done ? "line-through" : "none" }}>{task.title}</span>
                  <div style={{ width: 22, height: 22, borderRadius: 99, border: `2px solid ${task.done ? theme.secondary : "#D0C8BE"}`, background: task.done ? theme.secondary : "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {task.done && <span style={{ color: "#fff", fontSize: 12 }}>✓</span>}
                  </div>
                </div>
              ))}
              <div onClick={() => setActiveTab("tasks")} style={{ textAlign: "center", padding: "8px 0 2px", fontFamily: "'Nunito', sans-serif", fontWeight: 800, fontSize: 12, color: theme.primary, cursor: "pointer" }}>
                Tüm görevleri gör ({myTasks.length}) →
              </div>
            </div>

            {/* Hak kazan / pusula kullan */}
            {myRights > 0 ? (
              <div style={{ background: "linear-gradient(135deg,#FF6B35,#FF8C42)", borderRadius: 20, padding: "18px 20px", textAlign: "center", marginBottom: 16 }}>
                <div style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 900, fontSize: 13, color: "rgba(255,255,255,0.85)", marginBottom: 4 }}>
                  {myRights}x {data.movement === "compass" ? "pusula hakkın" : "zar hakkın"} var!
                </div>
                <div style={{ fontSize: 40, marginBottom: 10 }}>{data.movement === "compass" ? "🧭" : "🎲"}</div>
                <Btn onClick={() => setShowCompass(true)} style={{ background: "#fff", color: theme.primary }}>
                  {data.movement === "compass" ? "Pusula Çevir! 🧭" : "Zar At! 🎲"}
                </Btn>
              </div>
            ) : myAllDone && !myDone ? (
              <div style={{ background: "linear-gradient(135deg,#4ECDC4,#38b2aa)", borderRadius: 20, padding: "18px 20px", textAlign: "center", marginBottom: 16 }}>
                <div style={{ fontSize: 40, marginBottom: 8 }}>🎉</div>
                <div style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 900, fontSize: 15, color: "#fff", marginBottom: 10 }}>Tüm görevler tamam!<br/>Hakkını al!</div>
                <Btn onClick={claimRight} style={{ background: "#fff", color: theme.secondary }}>
                  {data.movement === "compass" ? "🧭 Pusula Hakkı Al" : "🎲 Zar Hakkı Al"}
                </Btn>
              </div>
            ) : (
              <div style={{ background: "#F0E8DC", borderRadius: 20, padding: "18px 20px", textAlign: "center", marginBottom: 16, border: "2px dashed #D0C0A8" }}>
                <div style={{ fontSize: 36, marginBottom: 8, opacity: 0.5 }}>{data.movement === "compass" ? "🧭" : "🎲"}</div>
                <div style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 800, fontSize: 14, color: theme.muted }}>
                  {myDoneCount}/{myTasks.length} görev tamamlandı<br/>
                  <span style={{ fontSize: 12 }}>Tüm görevleri bitir → hak kazan → haritada ilerle</span>
                </div>
              </div>
            )}

            <div style={{ background: "linear-gradient(135deg, #6C3483, #9B59B6)", borderRadius: 20, padding: "16px 18px", textAlign: "center" }}>
              <div style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 900, fontSize: 13, color: "rgba(255,255,255,0.8)", marginBottom: 6 }}>🏆 AY SONU BÜYÜK ÖDÜL</div>
              <div style={{ fontSize: 36, marginBottom: 4 }}>{Object.keys(data.votes || {}).filter(k => data.votes[k]).map(id => rewards.find(r => r.id === id)?.emoji).join(" ") || "🎬"}</div>
              <div style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 800, fontSize: 14, color: "#fff" }}>{Object.keys(data.votes || {}).filter(k => data.votes[k]).map(id => rewards.find(r => r.id === id)?.label).join(" & ") || "Sinema Gecesi"}</div>
              <div style={{ fontFamily: "'Nunito', sans-serif", fontSize: 12, color: "rgba(255,255,255,0.7)", marginTop: 4 }}>{TOTAL_SQUARES - position - 1} kare kaldı</div>
              <div onClick={() => setShowCelebration(true)} style={{ marginTop: 10, fontFamily: "'Nunito', sans-serif", fontSize: 11, color: "rgba(255,255,255,0.4)", cursor: "pointer" }}>🎊 finale önizle</div>
            </div>
          </>
        )}

        {/* MAP TAB */}
        {activeTab === "map" && (
          <>
            <div style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 900, fontSize: 18, color: theme.dark, marginBottom: 4 }}>🗺️ Anadolu Masalları Haritası</div>
            <p style={{ color: theme.muted, fontSize: 13, marginBottom: 6 }}>🧭 = Konumun · 🎁 = Sürpriz · ⚡ = Mini Oyun</p>
            <div onClick={() => setShowMiniGame(true)} style={{ background: "linear-gradient(135deg,#FFE8D6,#FFD4B8)", borderRadius: 14, padding: "10px 14px", marginBottom: 14, display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
              <span style={{ fontSize: 24 }}>⚡</span>
              <div>
                <div style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 800, fontSize: 13, color: theme.dark }}>Mini Oyun Önizle</div>
                <div style={{ fontSize: 11, color: theme.muted }}>Eşya Avı veya Senkronize Balon  -  deneyebilirsin</div>
              </div>
              <span style={{ marginLeft: "auto", color: theme.primary }}>→</span>
            </div>
            <MapGrid position={position} />
            <div style={{ marginTop: 16, background: theme.card, borderRadius: 16, padding: "14px 16px", boxShadow: theme.shadow }}>
              <div style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 900, fontSize: 13, color: theme.primary, marginBottom: 8 }}>📍 KONUM BİLGİSİ</div>
              {[
                { label: "Mevcut kare", val: `${position + 1}. kare` },
                { label: "Kalan kare",  val: `${TOTAL_SQUARES - position - 1} kare` },
                { label: "İlerleme",    val: `%${progressPct}` },
                { label: "Tahmini bitiş", val: `~${Math.ceil((TOTAL_SQUARES - position) / 4)} gün` },
              ].map((row, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: i < 3 ? "1px solid #F0E8DC" : "none" }}>
                  <span style={{ fontFamily: "'Nunito', sans-serif", fontSize: 13, color: theme.muted }}>{row.label}</span>
                  <span style={{ fontFamily: "'Nunito', sans-serif", fontSize: 13, fontWeight: 800, color: theme.dark }}>{row.val}</span>
                </div>
              ))}
            </div>
          </>
        )}

        {/* TASKS TAB */}
        {activeTab === "tasks" && (
          <>
            {/* Başlık + ekle butonu */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
              <div style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 900, fontSize: 18, color: theme.dark }}>✅ Görevler</div>
              <button onClick={() => setShowPool(true)}
                style={{ background: theme.primary, border: "none", borderRadius: 99, padding: "8px 16px", fontFamily: "'Nunito', sans-serif", fontWeight: 800, fontSize: 13, color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 16 }}>+</span> Görev Ekle
              </button>
            </div>
            <p style={{ color: theme.muted, fontSize: 13, marginBottom: 16 }}>Dokun → tamamla · ✕ → kaldır · + → havuzdan ekle</p>

            {/* Görev sayacı */}
            <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
              {[
                { label: "Toplam", val: tasks.length, color: theme.dark },
                { label: "Tamamlandı", val: tasks.filter(t => t.done).length, color: theme.secondary },
                { label: "Bekliyor", val: tasks.filter(t => !t.done).length, color: theme.primary },
              ].map((s, i) => (
                <div key={i} style={{ flex: 1, background: theme.card, borderRadius: 14, padding: "10px 8px", textAlign: "center", boxShadow: theme.shadow }}>
                  <div style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 900, fontSize: 22, color: s.color }}>{s.val}</div>
                  <div style={{ fontFamily: "'Nunito', sans-serif", fontSize: 11, color: theme.muted, fontWeight: 700 }}>{s.label}</div>
                </div>
              ))}
            </div>

            {tasks.length === 0 && (
              <div style={{ textAlign: "center", padding: "40px 0", color: theme.muted }}>
                <div style={{ fontSize: 48, marginBottom: 8 }}>📋</div>
                <div style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 800, fontSize: 16, marginBottom: 6 }}>Görev yok</div>
                <div style={{ fontSize: 13, marginBottom: 20 }}>Havuzdan görev ekle</div>
                <Btn onClick={() => setShowPool(true)} style={{ maxWidth: 200, margin: "0 auto" }}>+ Görev Ekle</Btn>
              </div>
            )}

            {tasks.map(task => <TaskCard key={task.id} task={task} onToggle={toggleTask} onRemove={removeTask} />)}

            {tasks.length > 0 && (
              <div style={{ marginTop: 8 }}>
                <Btn variant="secondary" onClick={() => setShowPool(true)}>+ Havuzdan Görev Ekle</Btn>
              </div>
            )}

            {myAllDone && tasks.length > 0 && (
              <div style={{ background: "linear-gradient(135deg, #4ECDC4, #38b2aa)", borderRadius: 18, padding: "18px", textAlign: "center", marginTop: 16 }}>
                <div style={{ fontSize: 40, marginBottom: 6 }}>🎉</div>
                <div style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 900, fontSize: 16, color: "#fff" }}>Görevlerin tamam!</div>
                <div style={{ fontFamily: "'Nunito', sans-serif", fontSize: 13, color: "rgba(255,255,255,0.9)", marginBottom: 14 }}>Ana sayfadan hakkını al ve haritada ilerle</div>
                <Btn onClick={() => setActiveTab("home")} style={{ background: "#fff", color: theme.secondary }}>
                  Ana Sayfaya Git →
                </Btn>
              </div>
            )}
          </>
        )}

        {/* PROFILE TAB */}
        {activeTab === "profile" && (() => {
          // Demo skor verileri  -  gerçekte her üyenin kendi görev geçmişinden gelir
          const members = [
            { emoji: parentAvatar?.emoji || "👩", name: data.name || "Ebeveyn", role: "Ebeveyn", totalDone: 42, streak: 7,  rights: 2, badges: ["🏆","⭐","🔥"] },
            ...((data.children || []).map((c, i) => ({
              emoji: avatarDefs.find(a => a.id === c.avatar)?.emoji || "👧",
              name: c.name, role: `${c.age} yaş`,
              totalDone: [28, 35, 19, 31][i] || 24,
              streak: [5, 9, 3, 6][i] || 4,
              rights: 1,
              badges: [["🌟","📚"], ["🚀","🎯","💪"], ["🌱"], ["⚡","🎨"]][i] || ["🌟"],
            }))),
          ];
          const sorted = [...members].sort((a, b) => b.totalDone - a.totalDone);
          const maxDone = sorted[0]?.totalDone || 1;

          return (
            <>
              {/* Skor Tablosu */}
              <div style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 900, fontSize: 18, color: theme.dark, marginBottom: 4 }}>🏆 Skor Tablosu</div>
              <p style={{ color: theme.muted, fontSize: 13, marginBottom: 16 }}>Bu ay kim kaç görev tamamladı?</p>

              {sorted.map((m, i) => {
                const medals = ["🥇","🥈","🥉","🎖️"];
                const barColors = ["linear-gradient(90deg,#FFD700,#FFA500)", "linear-gradient(90deg,#C0C0C0,#A0A0A0)", "linear-gradient(90deg,#CD7F32,#A0522D)", "linear-gradient(90deg,#A855F7,#7C3AED)"];
                return (
                  <div key={i} style={{ background: i === 0 ? "linear-gradient(135deg,#fff8e1,#fff3cc)" : theme.card, borderRadius: 18, padding: "14px 16px", marginBottom: 10, border: `2px solid ${i === 0 ? "#FFD700" : "#E8DDD0"}`, boxShadow: theme.shadow }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                      <div style={{ fontSize: 28 }}>{medals[i]}</div>
                      <div style={{ fontSize: 32 }}>{m.emoji}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 900, fontSize: 15, color: theme.dark }}>{m.name}</div>
                        <div style={{ fontFamily: "'Nunito', sans-serif", fontSize: 12, color: theme.muted }}>{m.role}</div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 900, fontSize: 22, color: theme.primary }}>{m.totalDone}</div>
                        <div style={{ fontFamily: "'Nunito', sans-serif", fontSize: 10, color: theme.muted, fontWeight: 700 }}>GÖREV</div>
                      </div>
                    </div>
                    {/* Bar */}
                    <div style={{ background: "#F0E8DC", borderRadius: 99, height: 8, overflow: "hidden", marginBottom: 8 }}>
                      <div style={{ height: "100%", width: `${(m.totalDone / maxDone) * 100}%`, background: barColors[i], borderRadius: 99, transition: "width 0.8s ease" }} />
                    </div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div style={{ display: "flex", gap: 4 }}>
                        {m.badges.map((b, j) => <span key={j} style={{ fontSize: 18 }}>{b}</span>)}
                      </div>
                      <div style={{ background: "#FFF3E0", borderRadius: 99, padding: "3px 10px", fontFamily: "'Nunito', sans-serif", fontWeight: 800, fontSize: 11, color: theme.primary }}>
                        🔥 {m.streak} günlük seri
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Ayın istatistikleri */}
              <div style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 900, fontSize: 16, color: theme.dark, margin: "20px 0 12px" }}>📊 Ay Özeti</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
                {[
                  { emoji: "✅", label: "Toplam Görev", val: members.reduce((s, m) => s + m.totalDone, 0), color: theme.secondary },
                  { emoji: "📍", label: "Harita Konumu", val: `${position + 1}. kare`, color: theme.primary },
                  { emoji: "🔥", label: "En Uzun Seri", val: `${Math.max(...members.map(m => m.streak))} gün`, color: "#F97316" },
                  { emoji: "⏳", label: "Kalan Kare", val: TOTAL_SQUARES - position - 1, color: "#A855F7" },
                ].map((s, i) => (
                  <div key={i} style={{ background: theme.card, borderRadius: 16, padding: "14px 12px", textAlign: "center", boxShadow: theme.shadow, border: `2px solid ${s.color}22` }}>
                    <div style={{ fontSize: 28, marginBottom: 4 }}>{s.emoji}</div>
                    <div style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 900, fontSize: 20, color: s.color }}>{s.val}</div>
                    <div style={{ fontFamily: "'Nunito', sans-serif", fontSize: 11, color: theme.muted, fontWeight: 700, marginTop: 2 }}>{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Kendi profil kartı */}
              <div style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 900, fontSize: 16, color: theme.dark, margin: "4px 0 12px" }}>👤 Profilim</div>
              <div style={{ background: "linear-gradient(135deg, #fff8ee, #fff0dc)", borderRadius: 20, padding: "20px 18px", border: "2px solid #e8cfa0", marginBottom: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
                  <div style={{ position: "relative" }}>
                    <div style={{
                      fontSize: 52, background: customizations["parent"]?.color ? `${customizations["parent"].color}22` : "#fff",
                      borderRadius: 99, width: 68, height: 68, display: "flex", alignItems: "center", justifyContent: "center",
                      border: `3px solid ${customizations["parent"]?.color || "#e8cfa0"}`,
                    }}>{parentAvatar?.emoji || "👩"}</div>
                    {customizations["parent"]?.glass ? <div style={{ position: "absolute", top: 12, right: 4, fontSize: 16 }}>{GLASS_OPTIONS[customizations["parent"].glass]}</div> : null}
                    <div onClick={() => setShowAvatarEdit(true)}
                      style={{ position: "absolute", bottom: -4, right: -4, background: theme.primary, borderRadius: 99, width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, cursor: "pointer", border: "2px solid #fff" }}>✏️</div>
                  </div>
                  <div>
                    <div style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 900, fontSize: 20, color: theme.dark }}>{data.name || "Ebeveyn"}</div>
                    <div style={{ fontFamily: "'Nunito', sans-serif", fontSize: 13, color: theme.muted }}>Aile Kaptanı</div>
                    <div style={{ display: "flex", gap: 4, marginTop: 6 }}>{["🏆","⭐","🔥"].map((b, i) => <span key={i} style={{ fontSize: 20 }}>{b}</span>)}</div>
                  </div>
                </div>
                {[
                  { label: "Tamamlanan Görev", val: "42", icon: "✅" },
                  { label: "Günlük Seri",       val: "7 gün 🔥", icon: "📅" },
                  { label: "Kazanılan Hak",     val: `14x ${data.movement === "compass" ? "🧭" : "🎲"}`, icon: "🎮" },
                  { label: "Aile Davet Kodu",   val: "TINT-842", icon: "🔑" },
                ].map((row, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 0", borderBottom: i < 3 ? "1px solid #e8cfa0" : "none" }}>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <span style={{ fontSize: 16 }}>{row.icon}</span>
                      <span style={{ fontFamily: "'Nunito', sans-serif", fontSize: 13, color: theme.muted }}>{row.label}</span>
                    </div>
                    <span style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 800, fontSize: 14, color: theme.dark }}>{row.val}</span>
                  </div>
                ))}
              </div>

              {/* Rozet koleksiyonu */}
              <div style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 900, fontSize: 16, color: theme.dark, marginBottom: 12 }}>🎖️ Rozetlerim</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 24 }}>
                {[
                  { emoji: "🏆", label: "Şampiyon", earned: true },
                  { emoji: "⭐", label: "Yıldız",   earned: true },
                  { emoji: "🔥", label: "Serili",   earned: true },
                  { emoji: "📚", label: "Okuyucu",  earned: true },
                  { emoji: "🚀", label: "Hızlı",    earned: false },
                  { emoji: "💪", label: "Güçlü",    earned: false },
                  { emoji: "🌟", label: "Süper",    earned: false },
                  { emoji: "👑", label: "Kral",     earned: false },
                ].map((b, i) => (
                  <div key={i} style={{ background: b.earned ? theme.card : "#F5F0EA", borderRadius: 14, padding: "12px 6px", textAlign: "center", border: `2px solid ${b.earned ? "#e8cfa0" : "transparent"}`, opacity: b.earned ? 1 : 0.4 }}>
                    <div style={{ fontSize: 28, filter: b.earned ? "none" : "grayscale(1)" }}>{b.emoji}</div>
                    <div style={{ fontFamily: "'Nunito', sans-serif", fontSize: 10, color: theme.muted, fontWeight: 700, marginTop: 4 }}>{b.label}</div>
                  </div>
                ))}
              </div>
            </>
          );
        })()}
      </div>

      {/* Bottom nav */}
      <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 390, background: "#fff", borderTop: "2px solid #F0E8DC", padding: "10px 20px 18px", display: "flex", justifyContent: "space-around" }}>
        {[{ id: "home", emoji: "🏠", label: "Ana" }, { id: "map", emoji: "🗺️", label: "Harita" }, { id: "tasks", emoji: "✅", label: "Görevler" }, { id: "profile", emoji: "👤", label: "Profil" }].map(tab => (
          <div key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ textAlign: "center", cursor: "pointer" }}>
            <div style={{ fontSize: 22 }}>{tab.emoji}</div>
            <div style={{ fontFamily: "'Nunito', sans-serif", fontSize: 11, fontWeight: 800, color: activeTab === tab.id ? theme.primary : theme.muted }}>{tab.label}</div>
          </div>
        ))}
      </div>

      {/* Modals */}
      {showCompass  && <CompassModal movement={data.movement} onSpin={handleSpin} onClose={() => setShowCompass(false)} />}
      {showSurprise && <SurpriseModal onClose={() => setShowSurprise(false)} />}
      {showPool     && <TaskPoolModal activeTasks={tasks} onAdd={t => { addTask(t); }} onClose={() => setShowPool(false)} />}
      {showCelebration && <CelebrationScreen data={data} onNewSeason={() => { setShowCelebration(false); onNewSeason(); }} />}
      {showMiniGame && (
        <MiniGameModal
          onClose={() => setShowMiniGame(false)}
          onWin={() => {
            setGlobalState(s => ({ ...s, position: Math.min(s.position + 1, TOTAL_SQUARES - 1) }));
            setShowMiniGame(false);
          }}
        />
      )}
      {showAvatarEdit && (
        <AvatarCustomizeModal
          member={{ name: data.name || "Ebeveyn", avatar: data.avatar || "mom", customization: customizations["parent"] }}
          onSave={(c) => { setCustomizations(prev => ({ ...prev, parent: c })); setShowAvatarEdit(false); }}
          onClose={() => setShowAvatarEdit(false)}
        />
      )}
    </div>
  );
}

// ─── YENİ SEZON AKIŞI ────────────────────────────────────────────────────────

function NewSeasonScreen({ data, seasonNo, onFinish }) {
  const [selectedTheme, setSelectedTheme] = useState(null);

  // Mevcut temayı listeden çıkar  -  zaten oynanmış
  const available = mapThemes.filter(t => t.id !== data.mapTheme);

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(160deg, #1a0533 0%, #3d0d6e 100%)", display: "flex", flexDirection: "column", padding: "32px 22px" }}>
      {/* Başlık */}
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <div style={{ display: "inline-block", background: "rgba(255,215,0,0.15)", borderRadius: 99, padding: "6px 18px", fontFamily: "'Nunito', sans-serif", fontWeight: 800, fontSize: 13, color: "#FFD700", marginBottom: 12 }}>
          🏅 SEZON {seasonNo} TAMAMLANDI
        </div>
        <div style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 900, fontSize: 26, color: "#fff", lineHeight: 1.2 }}>Yeni Macera Seçin!</div>
        <div style={{ color: "rgba(255,255,255,0.65)", fontSize: 14, marginTop: 6 }}>
          Bir önceki haritayı bitirdiniz.<br />Sırada hangi macera var?
        </div>
      </div>

      {/* Eski sezon rozeti */}
      <div style={{ background: "rgba(255,255,255,0.08)", borderRadius: 18, padding: "14px 18px", marginBottom: 24, display: "flex", alignItems: "center", gap: 14, border: "1px solid rgba(255,215,0,0.2)" }}>
        <div style={{ fontSize: 36 }}>{mapThemes.find(t => t.id === data.mapTheme)?.icon || "🏺"}</div>
        <div>
          <div style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 900, fontSize: 14, color: "#FFD700" }}>Tamamlanan</div>
          <div style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 700, fontSize: 13, color: "rgba(255,255,255,0.8)" }}>{mapThemes.find(t => t.id === data.mapTheme)?.name}</div>
        </div>
        <div style={{ marginLeft: "auto", fontSize: 24 }}>✅</div>
      </div>

      {/* Yeni tema seçimi */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14, flex: 1 }}>
        {available.map(t => (
          <div key={t.id} onClick={() => setSelectedTheme(t.id)}
            style={{ background: t.bg, borderRadius: 22, padding: "20px 20px", cursor: "pointer", border: `3px solid ${selectedTheme === t.id ? t.color : "transparent"}`, boxShadow: selectedTheme === t.id ? `0 0 0 4px ${t.color}44` : theme.shadow, transition: "all 0.2s", display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ fontSize: 44 }}>{t.icon}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 900, fontSize: 17, color: t.textLight ? "#fff" : theme.dark }}>{t.emoji} {t.name}</div>
              <div style={{ fontSize: 12, color: t.textLight ? "rgba(255,255,255,0.75)" : theme.muted, marginTop: 4, lineHeight: 1.4 }}>{t.desc}</div>
            </div>
            {selectedTheme === t.id && <div style={{ fontSize: 24 }}>✅</div>}
          </div>
        ))}
      </div>

      <div style={{ marginTop: 24 }}>
        <button
          onClick={() => selectedTheme && onFinish(selectedTheme)}
          disabled={!selectedTheme}
          style={{ width: "100%", padding: "16px", borderRadius: 18, border: "none", background: selectedTheme ? "linear-gradient(135deg,#FFD700,#FFA500)" : "rgba(255,255,255,0.15)", color: selectedTheme ? "#1a0533" : "rgba(255,255,255,0.4)", fontFamily: "'Nunito', sans-serif", fontWeight: 900, fontSize: 17, cursor: selectedTheme ? "pointer" : "not-allowed", transition: "all 0.2s" }}>
          🚀 Yeni Sezonu Başlat!
        </button>
      </div>
    </div>
  );
}

// ─── KULLANICI GİRİŞ SEÇİMİ ──────────────────────────────────────────────────

function UserSelectScreen({ data, onSelect }) {
  const members = [
    { id: "parent", emoji: avatarDefs.find(a => a.id === data.avatar)?.emoji || "👩", name: data.name || "Ebeveyn", role: "Ebeveyn", ownerKey: "parent" },
    ...((data.children || []).map((c, i) => ({
      id: `child_${i}`,
      emoji: avatarDefs.find(a => a.id === c.avatar)?.emoji || "👧",
      name: c.name,
      role: `${c.age} yaş`,
      ownerKey: "child",
      childIndex: i,
    }))),
  ];

  return (
    <div style={{ minHeight: "100vh", background: theme.anatoliaBg, display: "flex", flexDirection: "column", justifyContent: "center", padding: "32px 22px" }}>
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <div style={{ fontSize: 60, marginBottom: 8 }}>👋</div>
        <div style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 900, fontSize: 28, color: theme.dark }}>Kim oynuyor?</div>
        <div style={{ color: theme.muted, fontSize: 14, marginTop: 6 }}>Adına görevlerini gör ve hakkını kullan</div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {members.map(m => (
          <div key={m.id} onClick={() => onSelect(m)}
            style={{ background: theme.card, borderRadius: 22, padding: "18px 20px", cursor: "pointer", boxShadow: theme.shadow, display: "flex", alignItems: "center", gap: 16, border: "2px solid #E8DDD0", transition: "all 0.15s" }}
            onMouseDown={e => e.currentTarget.style.transform = "scale(0.97)"}
            onMouseUp={e => e.currentTarget.style.transform = "scale(1)"}>
            <div style={{ fontSize: 48, background: "#FFF3E8", borderRadius: 99, width: 64, height: 64, display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid #e8cfa0" }}>{m.emoji}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 900, fontSize: 18, color: theme.dark }}>{m.name}</div>
              <div style={{ fontFamily: "'Nunito', sans-serif", fontSize: 13, color: theme.muted }}>{m.role}</div>
            </div>
            <div style={{ fontSize: 22, color: theme.primary }}>→</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── APP ROOT ─────────────────────────────────────────────────────────────────

export default function App() {
  // appState: "onboarding" | "userSelect" | "home" | "newSeason"
  const [appState, setAppState] = useState("onboarding");
  const [step, setStep] = useState(0);
  const [flow, setFlow] = useState("create");
  const [formData, setFormData] = useState({});
  const [activeUser, setActiveUser] = useState(null); // { id, name, emoji, role, ownerKey }
  const [seasonNo, setSeasonNo] = useState(1);
  const [globalState, setGlobalState] = useState({
    position: 12,
    tasks: DEFAULT_TASKS,
    // memberRights: { parent: 0, child_0: 0, ... }
    memberRights: {},
    // memberDone: { parent: false, child_0: false, ... }
    memberDone: {},
  });
  
  useEffect(() => {
    const gameRef = ref(db, "game/state");
    onValue(gameRef, (snapshot) => {
      if (snapshot.exists()) {
        setGlobalState(snapshot.val());
      }
    });
  }, []);

  useEffect(() => {
    set(ref(db, "game/state"), globalState);
  }, [globalState]);

  const steps = flow === "join"
    ? ["welcome", "join", "parentProfile", "addChild", "mapTheme", "movement", "council", "launch"]
    : ["welcome", "parentProfile", "addChild", "mapTheme", "movement", "council", "launch"];

  const currentStep = steps[step];
  const next = (extra) => { if (currentStep === "welcome") setFlow(extra || "create"); setStep(s => s + 1); };
  const back = () => setStep(s => Math.max(0, s - 1));

  const handleFinishOnboarding = () => {
    setAppState("userSelect");
  };

  const handleSelectUser = (user) => {
    setActiveUser(user);
    setAppState("home");
  };

  const handleNewSeason = (newThemeId) => {
    setFormData(fd => ({ ...fd, mapTheme: newThemeId }));
    setSeasonNo(s => s + 1);
    setGlobalState({ position: 0, tasks: DEFAULT_TASKS, memberRights: {}, memberDone: {} });
    setAppState("userSelect");
  };

  const CSS = `@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;700;800;900&display=swap'); *{box-sizing:border-box;margin:0;padding:0} body{background:#E8DDD0;display:flex;justify-content:center;align-items:flex-start;min-height:100vh;font-family:'Nunito',sans-serif} @keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}} @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}} @keyframes confettiFall{0%{transform:translateY(0) rotate(0deg);opacity:1}80%{opacity:1}100%{transform:translateY(110vh) rotate(720deg);opacity:0}}`;

  if (appState === "newSeason") return (
    <>
      <style>{CSS}</style>
      <div style={{ width: "100%", maxWidth: 390, minHeight: "100vh" }}>
        <NewSeasonScreen data={formData} seasonNo={seasonNo} onFinish={handleNewSeason} />
      </div>
    </>
  );

  if (appState === "userSelect") return (
    <>
      <style>{CSS}</style>
      <div style={{ width: "100%", maxWidth: 390, minHeight: "100vh", background: theme.bg }}>
        <UserSelectScreen data={formData} onSelect={handleSelectUser} />
      </div>
    </>
  );

  if (appState === "home") return (
    <>
      <style>{CSS}</style>
      <div style={{ width: "100%", maxWidth: 390, minHeight: "100vh", background: theme.bg }}>
        <HomeScreen
          data={formData}
          activeUser={activeUser}
          seasonNo={seasonNo}
          globalState={globalState}
          setGlobalState={setGlobalState}
          onSwitchUser={() => setAppState("userSelect")}
          onNewSeason={() => setAppState("newSeason")}
        />
      </div>
    </>
  );

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;700;800;900&display=swap'); *{box-sizing:border-box;margin:0;padding:0} body{background:#E8DDD0;display:flex;justify-content:center;align-items:center;min-height:100vh;font-family:'Nunito',sans-serif} @keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-12px)}}`}</style>
      <div style={{ width: "100%", maxWidth: 390, minHeight: "100vh", background: theme.bg, overflowY: "auto" }}>
        {currentStep === "welcome"       && <WelcomeScreen onNext={next} />}
        {currentStep === "join"          && <JoinScreen onNext={next} onBack={back} />}
        {currentStep === "parentProfile" && <ParentProfileScreen onNext={next} onBack={back} data={formData} setData={setFormData} />}
        {currentStep === "addChild"      && <AddChildScreen onNext={next} onBack={back} data={formData} setData={setFormData} />}
        {currentStep === "mapTheme"      && <MapThemeScreen onNext={next} onBack={back} data={formData} setData={setFormData} />}
        {currentStep === "movement"      && <MovementScreen onNext={next} onBack={back} data={formData} setData={setFormData} />}
        {currentStep === "council"       && <FamilyCouncilScreen onNext={next} onBack={back} data={formData} setData={setFormData} />}
        {currentStep === "launch"        && <LaunchScreen data={formData} onFinish={handleFinishOnboarding} />}
      </div>
    </>
  );
}
