import { useState, useEffect } from "react";
import { db } from "./firebase";
import { ref, onValue, set, get } from "firebase/database";

// ── TEMA ──────────────────────────────────────────────────────────────────────
const T = {
  bg: "#FFF8F0", primary: "#FF6B35", secondary: "#4ECDC4",
  accent: "#FFE66D", dark: "#2D2D2D", muted: "#8B8B8B",
  card: "#FFFFFF", shadow: "0 8px 32px rgba(0,0,0,0.10)",
  anatoliaBg: "linear-gradient(160deg,#f5e6d0 0%,#e8c99a 100%)",
};

// ── VERİ ──────────────────────────────────────────────────────────────────────
const MAP_THEMES = [
  { id:"anatolia", name:"Anadolu Masalları", emoji:"🏺", desc:"Peri bacaları, İstanbul Boğazı ve Nasreddin Hoca", color:"#C0392B", bg:"linear-gradient(135deg,#f8d7b0 0%,#e8a87c 100%)", icon:"🕌" },
  { id:"galaxy",   name:"Galaksi Kaşifleri", emoji:"🚀", desc:"Renkli gezegenler, sevimli uzaylılar, meteor kuşakları", color:"#6C3483", bg:"linear-gradient(135deg,#1a1a4e 0%,#6C3483 100%)", light:true, icon:"🌌" },
  { id:"nature",   name:"Doğa Muhafızları",  emoji:"🌿", desc:"Harita ilerledikçe orman yeşerir, nehirler temizlenir", color:"#1E8449", bg:"linear-gradient(135deg,#d4efdf 0%,#82e0aa 100%)", icon:"🌳" },
];
const AVATARS = [
  { id:"mom", emoji:"👩", label:"Anne" },
  { id:"dad", emoji:"👨", label:"Baba" },
  { id:"girl", emoji:"👧", label:"Kız Çocuk" },
  { id:"boy", emoji:"👦", label:"Erkek Çocuk" },
];
const REWARDS = [
  { id:"cinema", emoji:"🎬", label:"Sinema Gecesi" },
  { id:"cooking", emoji:"🍰", label:"Tatlı Yapma" },
  { id:"bike", emoji:"🚴", label:"Bisiklet Turu" },
  { id:"picnic", emoji:"🧺", label:"Piknik" },
];
const DEFAULT_TASKS = [
  { id:1, owner:"child",  emoji:"📚", title:"30 dk odaklanarak kitap oku", desc:"Dikkat dagıtıcı olmadan", done:false },
  { id:2, owner:"child",  emoji:"🧹", title:"Odanı kendi basına düzenle", desc:"Masa, yatak, oyuncaklar", done:false },
  { id:3, owner:"parent", emoji:"📵", title:"Yemek masasına telefon getirme", desc:"Aksam boyunca telefon çantada", done:false },
  { id:4, owner:"parent", emoji:"🔕", title:"19:00 sonrası bildirimleri sessize al", desc:"İs mailleri aksam bekleyebilir", done:false },
  { id:5, owner:"family", emoji:"💬", title:"Ailece 15 dk sohbet veya egzersiz", desc:"Hep birlikte, ekransız zaman", done:false },
];
const TASK_POOL = [
  { id:"p1",  owner:"child",  emoji:"📚", title:"30 dk odaklanarak kitap oku", desc:"Sessiz bir kosede" },
  { id:"p2",  owner:"child",  emoji:"🧹", title:"Odanı kendi basına düzenle", desc:"Hepsi yerli yerinde" },
  { id:"p3",  owner:"child",  emoji:"✏️", title:"Ödevini o gün bitir", desc:"Aksam yatmadan önce" },
  { id:"p4",  owner:"child",  emoji:"🥗", title:"Tabagındakilerin hepsini bitir", desc:"Sebze dahil!" },
  { id:"p5",  owner:"child",  emoji:"🚿", title:"Hatırlatmadan banyo yap", desc:"Söylenmeden" },
  { id:"p6",  owner:"child",  emoji:"🌅", title:"Sabah alarmla uyan", desc:"İlk alarm çalınca kalk" },
  { id:"p7",  owner:"child",  emoji:"🎨", title:"30 dk yaratıcı aktivite yap", desc:"Çizim, origami, müzik" },
  { id:"p8",  owner:"child",  emoji:"🧺", title:"Kirli çamasırlarını sepete koy", desc:"Yerde degil, sepette" },
  { id:"p9",  owner:"child",  emoji:"🐾", title:"Evcil hayvanı besle", desc:"O da aile üyesi" },
  { id:"p10", owner:"child",  emoji:"📵", title:"2 saat ekransız zaman geçir", desc:"Telefon, tablet, TV kapalı" },
  { id:"p11", owner:"parent", emoji:"📵", title:"Yemek masasına telefon getirme", desc:"Telefon çantada kalır" },
  { id:"p12", owner:"parent", emoji:"🔕", title:"19:00 sonrası bildirimleri sessize al", desc:"İs mailleri bekleyebilir" },
  { id:"p13", owner:"parent", emoji:"🧘", title:"10 dk meditasyon", desc:"Sadece nefes al" },
  { id:"p14", owner:"parent", emoji:"🏃", title:"20 dk yürüyüs veya egzersiz", desc:"Merdiven de sayılır!" },
  { id:"p15", owner:"parent", emoji:"📖", title:"15 dk kitap oku", desc:"Gerçek bir sayfa" },
  { id:"p16", owner:"parent", emoji:"☕", title:"Kahveni aceleye getirmeden iç", desc:"Sadece o ana odaklan" },
  { id:"p17", owner:"parent", emoji:"💌", title:"Esine tesekkür mesajı at", desc:"Küçük jest, büyük fark" },
  { id:"p18", owner:"parent", emoji:"🛏️", title:"23:00 dan önce yat", desc:"Uyku da bir görev!" },
  { id:"p19", owner:"family", emoji:"💬", title:"Ailece 15 dk sohbet", desc:"Ekransız zaman" },
  { id:"p20", owner:"family", emoji:"🍳", title:"Birlikte yemek pisirin", desc:"Her biri bir is üstlensin" },
  { id:"p21", owner:"family", emoji:"🎲", title:"Aksam kutu oyunu oynayın", desc:"Telefonsuz 20 dk" },
  { id:"p22", owner:"family", emoji:"🌳", title:"Dısarıda 30 dk yürüyün", desc:"Park, sokak, bahçe" },
  { id:"p23", owner:"family", emoji:"📸", title:"Aile fotografı çekin", desc:"Günlük hayat anısı" },
  { id:"p24", owner:"family", emoji:"🎵", title:"Birlikte sans edin", desc:"Gülünç olmaktan korkmayın!" },
];
const SURPRISE_POOL = {
  couple:        { label:"Esler Arası", emoji:"💑", color:"#E91E8C", bg:"linear-gradient(135deg,#ffe0f0,#ffc2e2)", items:[
    {emoji:"☕", text:"Esine en sevdigi kahveyi yap."},
    {emoji:"🌸", text:"Eve dönerken esine küçük bir çiçek al."},
    {emoji:"💌", text:"Esine bugün neden mükemmel oldugunu anlatan mesaj at."},
    {emoji:"🎵", text:"Esinin en sevdigi sarkıyı çal ve ona söyle."},
    {emoji:"🤝", text:"Esinle 5 dk el ele oturup sadece konusu."},
  ]},
  parentToChild: { label:"Ebeveynden Çocuga", emoji:"🧒", color:"#FF6B35", bg:"linear-gradient(135deg,#fff0e0,#ffd9b8)", items:[
    {emoji:"🍦", text:"Çocuguna en sevdigi atıstırmalıgı sürpriz al."},
    {emoji:"🎮", text:"Çocugunla 10 dk onun seçtigi oyunu oyna."},
    {emoji:"📖", text:"Çocuguna onun seçtigi kitabı yüksek sesle oku."},
    {emoji:"🌟", text:"Çocuguna bugün neden gurur duydugun söyle."},
    {emoji:"🎒", text:"Yarın okul için çantasını birlikte hazırlayın."},
  ]},
  childToParent: { label:"Çocuktan Ebeveyne", emoji:"👨‍👩‍👧", color:"#4ECDC4", bg:"linear-gradient(135deg,#e0faf8,#b8f2ee)", items:[
    {emoji:"🤗", text:"Hemen git annene/babana kocaman sarıl ve öp!"},
    {emoji:"💬", text:"Babana/annene günün en güzel anını anlat."},
    {emoji:"🖼️", text:"Anne veya baban için resim çiz ve hediye et."},
    {emoji:"🍵", text:"Ebeveynine bir bardak çay veya su getir."},
  ]},
  family:        { label:"Ev İçi / Ortak", emoji:"🏠", color:"#A855F7", bg:"linear-gradient(135deg,#f3e8ff,#e0c8ff)", items:[
    {emoji:"🐾", text:"Evcil hayvanınızla 5 dk oyun oynayın."},
    {emoji:"📸", text:"Hepiniz birlikte komik fotoğraf çekin!"},
    {emoji:"🎲", text:"20 dk kutu oyunu oynayın."},
    {emoji:"🌳", text:"15 dk dısarı çıkın  -  park, balkon, bahçe."},
  ]},
};
const TOTAL = 120;
const SPECIAL = { 10:"surprise", 20:"mini-game", 35:"surprise", 50:"mini-game", 65:"surprise", 80:"surprise", 95:"mini-game" };
const LANDMARKS = ["🏺","🕌","🌊","🎭","🐪","🏔️","🌙","⭐","🌿","🎯","🌺","🔮","🦅","🎶","🌸"];

// ── YARDIMCI FONKSİYONLAR ─────────────────────────────────────────────────────
function makeCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let c = "";
  for (let i = 0; i < 4; i++) c += chars[Math.floor(Math.random() * chars.length)];
  return c + "-" + Math.floor(100 + Math.random() * 900);
}

// ── SHARED UI ──────────────────────────────────────────────────────────────────
const inputStyle = {
  width:"100%", padding:"14px 16px", borderRadius:14,
  border:"2px solid #E0D6CC", fontSize:16,
  fontFamily:"'Nunito',sans-serif", fontWeight:700,
  color:"#2D2D2D", outline:"none", boxSizing:"border-box",
  background:"#FFFFFF",
};

function Btn({ children, onClick, variant="primary", style, disabled }) {
  const base = { width:"100%", padding:"15px 20px", borderRadius:16, fontSize:16, fontFamily:"'Nunito',sans-serif", fontWeight:700, cursor:disabled?"not-allowed":"pointer", border:"none", opacity:disabled?0.45:1 };
  const V = {
    primary:   { background:T.primary, color:"#fff" },
    secondary: { background:"transparent", color:T.primary, border:`2px solid ${T.primary}` },
    ghost:     { background:"#F0EAE2", color:T.dark },
    teal:      { background:T.secondary, color:"#fff" },
  };
  return <button onClick={disabled?undefined:onClick} style={{...base,...V[variant],...style}}
    onMouseDown={e=>!disabled&&(e.currentTarget.style.transform="scale(0.97)")}
    onMouseUp={e=>(e.currentTarget.style.transform="scale(1)")}>{children}</button>;
}

function Screen({ children, style }) {
  return <div style={{ minHeight:"100%", display:"flex", flexDirection:"column", padding:"24px 20px", ...style }}>{children}</div>;
}
function StepBar({ step, total }) {
  return <div style={{ display:"flex", gap:6, justifyContent:"center", marginBottom:20 }}>
    {Array.from({length:total}).map((_,i)=><div key={i} style={{ height:5, borderRadius:99, flex:1, maxWidth:32, background:i<=step?T.primary:"#E0D6CC" }}/>)}
  </div>;
}
function BackBtn({ onBack }) {
  return <button onClick={onBack} style={{ background:"none", border:"none", fontSize:22, cursor:"pointer", alignSelf:"flex-start", marginBottom:16 }}>←</button>;
}

// ── ONBOARDING ─────────────────────────────────────────────────────────────────
function WelcomeScreen({ onNext }) {
  return <Screen style={{ justifyContent:"center", alignItems:"center", textAlign:"center", background:"linear-gradient(160deg,#FFF8F0 0%,#FFE8D6 100%)" }}>
    <div style={{ fontSize:80, marginBottom:8, animation:"bounce 2s infinite" }}>🏡</div>
    <h1 style={{ fontFamily:"'Nunito',sans-serif", fontSize:36, fontWeight:900, color:T.dark, margin:0 }}>
      Life<span style={{color:T.primary}}>Board</span>
    </h1>
    <p style={{ color:T.muted, fontSize:15, marginTop:10, marginBottom:40, lineHeight:1.6 }}>
      Gerçek hayat görevleri.<br/>Aile macerası. Büyük ödüller.
    </p>
    <div style={{ width:"100%", display:"flex", flexDirection:"column", gap:12 }}>
      <Btn onClick={()=>onNext("create")}>✨ Aile Hesabı Olustur</Btn>
      <Btn variant="secondary" onClick={()=>onNext("join")}>🔗 Mevcut Aileye Katıl</Btn>
    </div>
    <p style={{ color:T.muted, fontSize:12, marginTop:24 }}>Ücretsiz · Reklamsız · Aile dostu</p>
  </Screen>;
}

function JoinScreen({ onNext, onBack, setFormData }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const join = async () => {
    if (code.length < 7) return;
    setLoading(true);
    setError("");
    try {
      const snap = await get(ref(db, `families/${code}`));
      if (!snap.exists()) {
        setError("Bu kod bulunamadı. Kodu kontrol et.");
        setLoading(false);
        return;
      }
      const family = snap.val();
      setFormData(family);
      // Save session
      localStorage.setItem("lb_familyCode", code);
      localStorage.setItem("lb_role", "join");
      onNext(code);
    } catch(e) {
      setError("Bağlantı hatası, tekrar dene.");
      setLoading(false);
    }
  };

  return <Screen>
    <BackBtn onBack={onBack}/>
    <StepBar step={0} total={5}/>
    <h2 style={{ fontFamily:"'Nunito',sans-serif", fontSize:26, fontWeight:900, color:T.dark, margin:"0 0 8px" }}>Aileye Katıl 🔗</h2>
    <p style={{ color:T.muted, fontSize:14, marginBottom:28 }}>Ebeveyninin sana verdiği kodu gir</p>
    <div style={{ background:T.card, borderRadius:20, padding:24, boxShadow:T.shadow, marginBottom:24, textAlign:"center" }}>
      <div style={{ fontSize:48, marginBottom:12 }}>🎟️</div>
      <input type="text" placeholder="ÖRN: ABCD-123"
        value={code} onChange={e=>setCode(e.target.value.toUpperCase())} maxLength={8}
        style={{...inputStyle, fontSize:22, letterSpacing:4, textAlign:"center"}}/>
      {error && <p style={{ color:"#DC2626", fontSize:13, marginTop:8 }}>{error}</p>}
      <p style={{ color:T.muted, fontSize:12, marginTop:8 }}>Kodu ebeveyninden iste</p>
    </div>
    <Btn onClick={join} disabled={code.length < 7 || loading}>{loading ? "Kontrol ediliyor..." : "Katıl →"}</Btn>
  </Screen>;
}

function ParentProfileScreen({ onNext, onBack, data, setData }) {
  return <Screen>
    <BackBtn onBack={onBack}/>
    <StepBar step={1} total={5}/>
    <h2 style={{ fontFamily:"'Nunito',sans-serif", fontSize:26, fontWeight:900, color:T.dark, margin:"0 0 4px" }}>Senin profilin 👋</h2>
    <p style={{ color:T.muted, fontSize:14, marginBottom:24 }}>Adını gir ve rolünü seç</p>
    <input type="text" placeholder="Adın nedir?" value={data.name||""} onChange={e=>setData({...data, name:e.target.value})}
      style={{...inputStyle, marginBottom:20}}/>
    <p style={{ fontFamily:"'Nunito',sans-serif", fontWeight:700, color:T.dark, marginBottom:12, fontSize:14 }}>Rol seç:</p>
    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:24 }}>
      {AVATARS.slice(0,2).map(a=>(
        <div key={a.id} onClick={()=>setData({...data, avatar:a.id})}
          style={{ background:data.avatar===a.id?T.primary:T.card, borderRadius:16, padding:"20px 10px", textAlign:"center", cursor:"pointer", boxShadow:T.shadow, border:`2px solid ${data.avatar===a.id?T.primary:"transparent"}` }}>
          <div style={{ fontSize:44 }}>{a.emoji}</div>
          <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:700, fontSize:14, color:data.avatar===a.id?"#fff":T.dark, marginTop:6 }}>{a.label}</div>
        </div>
      ))}
    </div>
    <Btn onClick={()=>onNext()} disabled={!data.name||!data.avatar}>Devam →</Btn>
  </Screen>;
}

function AddChildScreen({ onNext, onBack, data, setData }) {
  const [cn, setCn] = useState("");
  const [ca, setCa] = useState("");
  const [cv, setCv] = useState("");
  const add = () => {
    if (!cn || !ca || !cv) return;
    setData({...data, children:[...(data.children||[]), {name:cn, age:ca, avatar:cv}]});
    setCn(""); setCa(""); setCv("");
  };
  const remove = (i) => {
    const arr = [...(data.children||[])];
    arr.splice(i,1);
    setData({...data, children:arr});
  };
  return <Screen>
    <BackBtn onBack={onBack}/>
    <StepBar step={2} total={5}/>
    <h2 style={{ fontFamily:"'Nunito',sans-serif", fontSize:26, fontWeight:900, color:T.dark, margin:"0 0 4px" }}>Çocukları ekle 👧👦</h2>
    <p style={{ color:T.muted, fontSize:14, marginBottom:4 }}>İsteğe bağlı · En fazla 4 çocuk · min. 8 yaş</p>
    <p style={{ color:T.primary, fontSize:13, fontWeight:700, marginBottom:16 }}>Çocuğun yoksa direkt "Devam" a bas!</p>
    {(data.children||[]).map((c,i)=>(
      <div key={i} style={{ background:"#F0FAF8", borderRadius:14, padding:"10px 14px", marginBottom:8, display:"flex", alignItems:"center", gap:10 }}>
        <span style={{ fontSize:28 }}>{AVATARS.find(a=>a.id===c.avatar)?.emoji}</span>
        <div style={{ flex:1 }}>
          <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:800, fontSize:15, color:T.dark }}>{c.name}</div>
          <div style={{ color:T.muted, fontSize:12 }}>{c.age} yasında</div>
        </div>
        <button onClick={()=>remove(i)} style={{ background:"none", border:"none", fontSize:18, cursor:"pointer", color:"#ccc" }}>✕</button>
      </div>
    ))}
    {(data.children||[]).length < 4 && (
      <div style={{ background:T.card, borderRadius:18, padding:18, boxShadow:T.shadow, marginBottom:16 }}>
        <input placeholder="Çocuğun adı" value={cn} onChange={e=>setCn(e.target.value)}
          style={{...inputStyle, marginBottom:10}}/>
        <input placeholder="Yaşı (8-17)" type="number" value={ca} onChange={e=>setCa(e.target.value)}
          style={{...inputStyle, marginBottom:14}}/>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:14 }}>
          {AVATARS.slice(2).map(a=>(
            <div key={a.id} onClick={()=>setCv(a.id)}
              style={{ background:cv===a.id?T.secondary:"#F5F5F5", borderRadius:14, padding:"14px 8px", textAlign:"center", cursor:"pointer", border:`2px solid ${cv===a.id?T.secondary:"transparent"}` }}>
              <div style={{ fontSize:36 }}>{a.emoji}</div>
              <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:700, fontSize:13, color:cv===a.id?"#fff":T.dark, marginTop:4 }}>{a.label}</div>
            </div>
          ))}
        </div>
        <Btn variant="ghost" onClick={add} disabled={!cn||!ca||!cv}>+ Çocuk Ekle</Btn>
      </div>
    )}
    <Btn onClick={()=>onNext()}>Devam → {(data.children||[]).length===0 ? "(çocuksuz)" : ""}</Btn>
  </Screen>;
}

function MapThemeScreen({ onNext, onBack, data, setData }) {
  return <Screen>
    <BackBtn onBack={onBack}/>
    <StepBar step={3} total={5}/>
    <h2 style={{ fontFamily:"'Nunito',sans-serif", fontSize:26, fontWeight:900, color:T.dark, margin:"0 0 4px" }}>Harita temasını seç 🗺️</h2>
    <p style={{ color:T.muted, fontSize:14, marginBottom:20 }}>Bu ay hangi maceraya çıkıyorsunuz?</p>
    <div style={{ display:"flex", flexDirection:"column", gap:14, marginBottom:24 }}>
      {MAP_THEMES.map(t=>(
        <div key={t.id} onClick={()=>setData({...data, mapTheme:t.id})}
          style={{ background:t.bg, borderRadius:20, padding:"18px 20px", cursor:"pointer", border:`3px solid ${data.mapTheme===t.id?t.color:"transparent"}`, boxShadow:T.shadow, display:"flex", alignItems:"center", gap:16 }}>
          <div style={{ fontSize:40 }}>{t.icon}</div>
          <div style={{ flex:1 }}>
            <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:900, fontSize:16, color:t.light?"#fff":T.dark }}>{t.emoji} {t.name}</div>
            <div style={{ fontSize:12, color:t.light?"rgba(255,255,255,0.8)":T.muted, marginTop:3, lineHeight:1.4 }}>{t.desc}</div>
          </div>
          {data.mapTheme===t.id && <div style={{ fontSize:22 }}>✅</div>}
        </div>
      ))}
    </div>
    <Btn onClick={()=>onNext()} disabled={!data.mapTheme}>Devam →</Btn>
  </Screen>;
}

function MovementScreen({ onNext, onBack, data, setData }) {
  return <Screen>
    <BackBtn onBack={onBack}/>
    <StepBar step={3} total={5}/>
    <h2 style={{ fontFamily:"'Nunito',sans-serif", fontSize:26, fontWeight:900, color:T.dark, margin:"0 0 4px" }}>Nasıl ilerlemek istersiniz?</h2>
    <p style={{ color:T.muted, fontSize:14, marginBottom:24 }}>Görev tamamlandığında hareket yönteminizi seçin</p>
    <div style={{ display:"flex", flexDirection:"column", gap:14, marginBottom:24 }}>
      {[
        {id:"compass", emoji:"🧭", title:"Pusula Çevirme", desc:"1-6 arası rastgele adım  -  macera hissi!", color:T.secondary},
        {id:"dice",    emoji:"🎲", title:"Zar Atma",       desc:"Klasik kutu oyunu mantığı, saf sans faktörü", color:T.primary},
      ].map(opt=>(
        <div key={opt.id} onClick={()=>setData({...data, movement:opt.id})}
          style={{ background:data.movement===opt.id?opt.color:T.card, borderRadius:20, padding:"24px 20px", cursor:"pointer", border:`3px solid ${data.movement===opt.id?opt.color:"#E0D6CC"}`, boxShadow:T.shadow, display:"flex", alignItems:"center", gap:16 }}>
          <div style={{ fontSize:52 }}>{opt.emoji}</div>
          <div>
            <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:900, fontSize:17, color:data.movement===opt.id?"#fff":T.dark }}>{opt.title}</div>
            <div style={{ fontSize:13, color:data.movement===opt.id?"rgba(255,255,255,0.85)":T.muted, marginTop:4, lineHeight:1.4 }}>{opt.desc}</div>
          </div>
        </div>
      ))}
    </div>
    <Btn onClick={()=>onNext()} disabled={!data.movement}>Devam →</Btn>
  </Screen>;
}

function CouncilScreen({ onNext, onBack, data, setData }) {
  const votes = data.votes||{};
  const toggle = id => setData({...data, votes:{...votes, [id]:!votes[id]}});
  const selected = Object.keys(votes).filter(k=>votes[k]);
  return <Screen>
    <BackBtn onBack={onBack}/>
    <StepBar step={4} total={5}/>
    <h2 style={{ fontFamily:"'Nunito',sans-serif", fontSize:26, fontWeight:900, color:T.dark, margin:"0 0 4px" }}>Aile Konseyi 🗳️</h2>
    <p style={{ color:T.muted, fontSize:14, marginBottom:6 }}>Bu ay hangi ödülü kazanmak istiyorsunuz?</p>
    <p style={{ color:T.primary, fontSize:13, fontWeight:700, marginBottom:20 }}>Birden fazla seçebilirsiniz</p>
    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:24 }}>
      {REWARDS.map(r=>(
        <div key={r.id} onClick={()=>toggle(r.id)}
          style={{ background:votes[r.id]?T.accent:T.card, borderRadius:18, padding:"20px 12px", textAlign:"center", cursor:"pointer", border:`3px solid ${votes[r.id]?"#F4C430":"#E0D6CC"}`, boxShadow:T.shadow, position:"relative" }}>
          {votes[r.id]&&<div style={{ position:"absolute", top:8, right:10, fontSize:16 }}>✅</div>}
          <div style={{ fontSize:44, marginBottom:8 }}>{r.emoji}</div>
          <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:800, fontSize:13, color:T.dark }}>{r.label}</div>
        </div>
      ))}
    </div>
    <Btn onClick={()=>onNext()} disabled={selected.length===0}>
      {selected.length>0 ? `${selected.length} ödül seçildi  -  Onayla ✓` : "En az 1 ödül seç"}
    </Btn>
  </Screen>;
}

function LaunchScreen({ data, familyCode, onFinish }) {
  const theme = MAP_THEMES.find(t=>t.id===data.mapTheme);
  return <Screen>
    <StepBar step={4} total={5}/>
    <h2 style={{ fontFamily:"'Nunito',sans-serif", fontSize:26, fontWeight:900, color:T.dark, margin:"0 0 4px" }}>Her sey hazır! 🚀</h2>
    <p style={{ color:T.muted, fontSize:14, marginBottom:20 }}>Ailenizin macerası baslamak üzere</p>
    <div style={{ background:T.card, borderRadius:20, padding:20, boxShadow:T.shadow, marginBottom:16 }}>
      {[
        {icon:"👤", label:"Ebeveyn",  val:data.name||" - "},
        {icon:"👨‍👩‍👧", label:"Çocuklar", val:(data.children||[]).map(c=>`${c.name} (${c.age})`).join(", ")||"Çocuksuz aile"},
        {icon:"🗺️", label:"Harita",   val:theme?.name||" - "},
        {icon:"🎮", label:"İlerleme", val:data.movement==="compass"?"🧭 Pusula":"🎲 Zar"},
      ].map((item,i)=>(
        <div key={i} style={{ display:"flex", gap:10, alignItems:"flex-start", marginBottom:8 }}>
          <span style={{ fontSize:18, minWidth:24 }}>{item.icon}</span>
          <div>
            <div style={{ fontFamily:"'Nunito',sans-serif", fontSize:11, color:T.muted, fontWeight:700 }}>{item.label.toUpperCase()}</div>
            <div style={{ fontFamily:"'Nunito',sans-serif", fontSize:14, color:T.dark, fontWeight:700 }}>{item.val}</div>
          </div>
        </div>
      ))}
    </div>
    <div style={{ background:`linear-gradient(135deg,${T.primary},#FF8C42)`, borderRadius:18, padding:16, textAlign:"center", marginBottom:20 }}>
      <div style={{ fontSize:32, marginBottom:4 }}>🔑</div>
      <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:900, fontSize:13, color:"rgba(255,255,255,0.8)", marginBottom:4 }}>AİLE DAVET KODUNUZ</div>
      <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:900, fontSize:32, color:"#fff", letterSpacing:4 }}>{familyCode}</div>
      <div style={{ fontSize:11, color:"rgba(255,255,255,0.7)", marginTop:4 }}>Diger aile üyelerini bu kodla davet edin</div>
    </div>
    <Btn onClick={onFinish}>Maceraya Basla! 🎮</Btn>
  </Screen>;
}

// ── KULLANICI SEÇİMİ ──────────────────────────────────────────────────────────
function UserSelectScreen({ data, familyCode, onSelect }) {
  const members = [
    { id:"parent", emoji:AVATARS.find(a=>a.id===data.avatar)?.emoji||"👩", name:data.name||"Ebeveyn", role:"Ebeveyn", ownerKey:"parent" },
    ...((data.children||[]).map((c,i)=>({
      id:`child_${i}`, emoji:AVATARS.find(a=>a.id===c.avatar)?.emoji||"👧",
      name:c.name, role:`${c.age} yas`, ownerKey:"child", childIndex:i,
    }))),
  ];
  return <div style={{ minHeight:"100vh", background:T.anatoliaBg, display:"flex", flexDirection:"column", justifyContent:"center", padding:"32px 22px" }}>
    <div style={{ textAlign:"center", marginBottom:32 }}>
      <div style={{ fontSize:60, marginBottom:8 }}>👋</div>
      <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:900, fontSize:28, color:T.dark }}>Kim oynuyor?</div>
      <div style={{ color:T.muted, fontSize:14, marginTop:6 }}>Adına görevlerini gör ve hakkını kullan</div>
      <div style={{ marginTop:10, background:"rgba(255,107,53,0.1)", borderRadius:99, padding:"4px 14px", display:"inline-block", fontFamily:"'Nunito',sans-serif", fontSize:12, fontWeight:700, color:T.primary }}>
        Aile kodu: {familyCode}
      </div>
    </div>
    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
      {members.map(m=>(
        <div key={m.id} onClick={()=>onSelect(m)}
          style={{ background:T.card, borderRadius:22, padding:"18px 20px", cursor:"pointer", boxShadow:T.shadow, display:"flex", alignItems:"center", gap:16, border:"2px solid #E8DDD0" }}
          onMouseDown={e=>e.currentTarget.style.transform="scale(0.97)"}
          onMouseUp={e=>e.currentTarget.style.transform="scale(1)"}>
          <div style={{ fontSize:48, background:"#FFF3E8", borderRadius:99, width:64, height:64, display:"flex", alignItems:"center", justifyContent:"center", border:"2px solid #e8cfa0" }}>{m.emoji}</div>
          <div style={{ flex:1 }}>
            <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:900, fontSize:18, color:T.dark }}>{m.name}</div>
            <div style={{ fontFamily:"'Nunito',sans-serif", fontSize:13, color:T.muted }}>{m.role}</div>
          </div>
          <div style={{ fontSize:22, color:T.primary }}>→</div>
        </div>
      ))}
    </div>
  </div>;
}

// ── MİNİ OYUNLAR ──────────────────────────────────────────────────────────────
function MiniGameModal({ onClose, onWin }) {
  const [game] = useState(()=>Math.random()<0.5?"hunt":"balloon");
  const [phase, setPhase] = useState("intro");
  const [timeLeft, setTimeLeft] = useState(60);
  const [target] = useState(()=>{
    const TARGETS=[
      {color:"kırmızı",emoji:"🔴",hint:"Kırmızı renkli bir esya"},
      {color:"mavi",emoji:"🔵",hint:"Mavi renkli bir esya"},
      {color:"sarı",emoji:"🟡",hint:"Sarı renkli bir esya"},
      {color:"yesil",emoji:"🟢",hint:"Yesil renkli bir esya"},
    ];
    return TARGETS[Math.floor(Math.random()*TARGETS.length)];
  });
  const [balloonSize, setBalloonSize] = useState(40);
  const [p1, setP1] = useState(false);
  const [p2, setP2] = useState(false);

  useEffect(()=>{
    if(phase!=="playing") return;
    if(game==="hunt"){
      let t=60;
      const iv=setInterval(()=>{ t--; setTimeLeft(t); if(t<=0){clearInterval(iv);setPhase("lost");} },1000);
      return ()=>clearInterval(iv);
    } else {
      let s=40;
      const iv=setInterval(()=>{ s+=2; setBalloonSize(s); if(s>=200){clearInterval(iv);setPhase("lost");} },120);
      return ()=>clearInterval(iv);
    }
  },[phase]);

  useEffect(()=>{ if(p1&&p2) setPhase("won"); },[p1,p2]);

  return <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.7)", display:"flex", alignItems:"flex-end", justifyContent:"center", zIndex:150 }}>
    <div style={{ background:T.bg, borderRadius:"28px 28px 0 0", width:"100%", maxWidth:390, padding:"24px 22px 40px", minHeight:"60vh", display:"flex", flexDirection:"column" }}>
      <div style={{ width:40, height:4, borderRadius:99, background:"#D0C8BE", margin:"0 auto 20px" }}/>

      {game==="hunt" && <>
        {phase==="intro"&&<div style={{ textAlign:"center", flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
          <div style={{ fontSize:64, marginBottom:12 }}>⚡</div>
          <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:900, fontSize:22, color:T.dark, marginBottom:8 }}>Esya Avı!</div>
          <div style={{ color:T.muted, fontSize:14, marginBottom:24, lineHeight:1.6 }}>60 saniyede evden istenen renkteki esyayı bulup getirin!</div>
          <Btn onClick={()=>setPhase("playing")}>Basla! 🏃</Btn>
        </div>}
        {phase==="playing"&&<div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center" }}>
          <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:900, fontSize:64, color:timeLeft<=10?"#DC2626":T.primary }}>{timeLeft}</div>
          <div style={{ background:"linear-gradient(135deg,#FFE8D6,#FFD4B8)", borderRadius:22, padding:"24px 20px", textAlign:"center", width:"100%", marginBottom:24 }}>
            <div style={{ fontSize:72, marginBottom:8 }}>{target.emoji}</div>
            <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:900, fontSize:20, color:T.dark }}>{target.hint}</div>
            <div style={{ color:T.muted, fontSize:13, marginTop:6 }}>bulup masaya getirin!</div>
          </div>
          <Btn onClick={()=>setPhase("won")}>Bulduk! Görevi Basardık! ✅</Btn>
        </div>}
        {phase==="won"&&<div style={{ textAlign:"center", flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
          <div style={{ fontSize:72, marginBottom:12 }}>🎉</div>
          <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:900, fontSize:22, color:T.secondary, marginBottom:8 }}>Harika is!</div>
          <div style={{ color:T.muted, fontSize:14, marginBottom:24 }}>+1 ekstra adım kazandınız!</div>
          <Btn onClick={()=>{onWin();onClose();}}>+1 Adım Al 🎁</Btn>
        </div>}
        {phase==="lost"&&<div style={{ textAlign:"center", flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
          <div style={{ fontSize:72, marginBottom:12 }}>⏰</div>
          <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:900, fontSize:22, color:T.primary, marginBottom:24 }}>Süre Doldu!</div>
          <Btn variant="ghost" onClick={onClose}>Tamam</Btn>
        </div>}
      </>}

      {game==="balloon" && <>
        {phase==="intro"&&<div style={{ textAlign:"center", flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
          <div style={{ fontSize:64, marginBottom:12 }}>🎈</div>
          <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:900, fontSize:22, color:T.dark, marginBottom:8 }}>Senkronize Balon!</div>
          <div style={{ color:T.muted, fontSize:14, marginBottom:24, lineHeight:1.6 }}>İki kisi tam aynı anda butonlara basmalı  -  balon patlamadan!</div>
          <Btn onClick={()=>setPhase("playing")}>Hazırız! 🎈</Btn>
        </div>}
        {phase==="playing"&&<div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center" }}>
          <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:800, fontSize:13, color:T.muted, marginBottom:12, textAlign:"center" }}>Balon patlamadan ikisi birden basın!</div>
          <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center" }}>
            <div style={{ width:balloonSize, height:balloonSize*1.2, background:"radial-gradient(circle at 35% 35%,#ff8080,#FF6B35)", borderRadius:"50% 50% 50% 50% / 60% 60% 40% 40%", display:"flex", alignItems:"center", justifyContent:"center" }}>🎈</div>
          </div>
          <div style={{ display:"flex", gap:16, width:"100%" }}>
            <button onPointerDown={()=>setP1(true)} style={{ flex:1, height:80, borderRadius:20, border:"none", background:p1?T.secondary:"#4ECDC444", fontSize:18, cursor:"pointer", fontFamily:"'Nunito',sans-serif", fontWeight:900, color:p1?"#fff":T.secondary }}>
              {p1?"✓":"BAS!"}
            </button>
            <button onPointerDown={()=>setP2(true)} style={{ flex:1, height:80, borderRadius:20, border:"none", background:p2?T.primary:"#FF6B3544", fontSize:18, cursor:"pointer", fontFamily:"'Nunito',sans-serif", fontWeight:900, color:p2?"#fff":T.primary }}>
              {p2?"✓":"BAS!"}
            </button>
          </div>
        </div>}
        {phase==="won"&&<div style={{ textAlign:"center", flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
          <div style={{ fontSize:72, marginBottom:12 }}>🤝</div>
          <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:900, fontSize:22, color:T.secondary, marginBottom:8 }}>Mükemmel Senkron!</div>
          <div style={{ color:T.muted, fontSize:14, marginBottom:24 }}>+1 ekstra adım kazandınız!</div>
          <Btn onClick={()=>{onWin();onClose();}}>+1 Adım Al 🎁</Btn>
        </div>}
        {phase==="lost"&&<div style={{ textAlign:"center", flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
          <div style={{ fontSize:72, marginBottom:12 }}>💥</div>
          <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:900, fontSize:22, color:T.primary, marginBottom:24 }}>Balon Patladı!</div>
          <Btn variant="ghost" onClick={onClose}>Tamam</Btn>
        </div>}
      </>}
    </div>
  </div>;
}

// ── TATLI CEZA ────────────────────────────────────────────────────────────────
function SurpriseModal({ onClose }) {
  const cats = Object.values(SURPRISE_POOL);
  const [sel, setSel] = useState(null);
  const [item, setItem] = useState(null);
  const pick = (cat) => {
    setSel(cat);
    setItem(cat.items[Math.floor(Math.random()*cat.items.length)]);
  };
  return <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.6)", zIndex:100, display:"flex", flexDirection:"column", justifyContent:"flex-end" }}>
    <div style={{ background:T.bg, borderRadius:"28px 28px 0 0", maxHeight:"88vh", display:"flex", flexDirection:"column" }}>
      <div style={{ width:40, height:4, borderRadius:99, background:"#D0C8BE", margin:"12px auto 0" }}/>
      {!sel ? (
        <div style={{ padding:"20px 22px" }}>
          <div style={{ textAlign:"center", marginBottom:20 }}>
            <div style={{ fontSize:56, marginBottom:6 }}>🎁</div>
            <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:900, fontSize:22, color:T.dark }}>Sürpriz Kare!</div>
            <div style={{ color:T.muted, fontSize:14, marginTop:4 }}>Bir kategori seç!</div>
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:12, paddingBottom:32 }}>
            {cats.map((cat,i)=>(
              <div key={i} onClick={()=>pick(cat)}
                style={{ background:cat.bg, borderRadius:20, padding:"18px 20px", cursor:"pointer", display:"flex", alignItems:"center", gap:14, boxShadow:T.shadow }}>
                <div style={{ fontSize:36 }}>{cat.emoji}</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:900, fontSize:16, color:T.dark }}>{cat.label}</div>
                  <div style={{ fontFamily:"'Nunito',sans-serif", fontSize:12, color:T.muted, marginTop:2 }}>{cat.items.length} farklı sürpriz</div>
                </div>
                <div style={{ color:cat.color, fontSize:20 }}>→</div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div style={{ padding:"20px 22px", textAlign:"center", paddingBottom:32 }}>
          <div style={{ display:"inline-block", background:sel.bg, borderRadius:99, padding:"6px 16px", fontFamily:"'Nunito',sans-serif", fontWeight:800, fontSize:12, color:sel.color, marginBottom:16 }}>{sel.label}</div>
          <div style={{ fontSize:80, marginBottom:12 }}>{item?.emoji}</div>
          <div style={{ background:sel.bg, borderRadius:22, padding:"22px 18px", marginBottom:20 }}>
            <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:800, fontSize:18, color:T.dark, lineHeight:1.4 }}>{item?.text}</div>
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            <Btn onClick={onClose}>Görevi Kabul Et! 🤝</Btn>
            <Btn variant="ghost" onClick={()=>{setSel(null);setItem(null);}}>← Kategori Değistir</Btn>
          </div>
        </div>
      )}
    </div>
  </div>;
}

// ── KUTLAMA ───────────────────────────────────────────────────────────────────
function CelebrationScreen({ data, onNewSeason }) {
  const confetti = Array.from({length:50},(_,i)=>({
    id:i, x:Math.random()*100, delay:Math.random()*2,
    dur:2.5+Math.random()*2,
    e:["🎉","⭐","🏺","🌟","✨","🎊","💫"][Math.floor(Math.random()*7)],
    size:16+Math.random()*20,
  }));
  const earned = Object.keys(data.votes||{}).filter(k=>data.votes[k]).map(id=>REWARDS.find(r=>r.id===id)).filter(Boolean);
  return <div style={{ position:"fixed", inset:0, background:"linear-gradient(160deg,#1a0533 0%,#3d0d6e 50%,#6C3483 100%)", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", zIndex:300, overflow:"hidden", padding:"0 24px" }}>
    {confetti.map(c=>(
      <div key={c.id} style={{ position:"absolute", left:`${c.x}%`, top:"-40px", fontSize:c.size, animation:`confettiFall ${c.dur}s ${c.delay}s linear infinite`, pointerEvents:"none" }}>{c.e}</div>
    ))}
    <div style={{ textAlign:"center", zIndex:302, maxWidth:340 }}>
      <div style={{ fontSize:88, marginBottom:8, animation:"bounce 0.8s infinite" }}>🏆</div>
      <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:900, fontSize:32, color:"#FFD700", lineHeight:1.1, marginBottom:8 }}>Tebrikler!</div>
      <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:800, fontSize:18, color:"#fff", marginBottom:6 }}>120 Kareyi Tamamladınız! 🎊</div>
      <div style={{ fontFamily:"'Nunito',sans-serif", fontSize:14, color:"rgba(255,255,255,0.75)", marginBottom:28, lineHeight:1.6 }}>Bir aylık maceranızı basarıyla bitirdiniz!</div>
      {earned.length>0&&<div style={{ background:"rgba(255,255,255,0.12)", borderRadius:24, padding:"20px 18px", marginBottom:24, border:"2px solid rgba(255,215,0,0.4)" }}>
        <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:900, fontSize:12, color:"#FFD700", marginBottom:10 }}>KAZANILAN BÜYÜK ÖDÜL</div>
        <div style={{ display:"flex", justifyContent:"center", gap:12, flexWrap:"wrap" }}>
          {earned.map((r,i)=><div key={i} style={{ textAlign:"center" }}>
            <div style={{ fontSize:44 }}>{r.emoji}</div>
            <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:800, fontSize:13, color:"#fff", marginTop:4 }}>{r.label}</div>
          </div>)}
        </div>
      </div>}
      <button onClick={onNewSeason} style={{ width:"100%", padding:"16px", borderRadius:18, border:"none", background:"linear-gradient(135deg,#FFD700,#FFA500)", color:"#1a0533", fontFamily:"'Nunito',sans-serif", fontWeight:900, fontSize:17, cursor:"pointer" }}>
        🚀 Yeni Sezon Basla!
      </button>
    </div>
  </div>;
}

// ── GÖREV HAVUZU ──────────────────────────────────────────────────────────────
function TaskPoolModal({ activeTasks, onAdd, onClose }) {
  const [cat, setCat] = useState("all");
  const [search, setSearch] = useState("");
  const activeIds = activeTasks.map(t=>t.id);
  const ownerColor = {child:"#4ECDC4", parent:"#FF6B35", family:"#A855F7"};
  const ownerLabel = {child:"Çocuk", parent:"Ebeveyn", family:"Aile"};
  const filtered = TASK_POOL.filter(t=>{
    const mc = cat==="all"||t.owner===cat;
    const ms = t.title.toLowerCase().includes(search.toLowerCase());
    return mc&&ms;
  });
  return <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.6)", zIndex:200, display:"flex", flexDirection:"column", justifyContent:"flex-end" }}>
    <div style={{ background:T.bg, borderRadius:"24px 24px 0 0", maxHeight:"88vh", display:"flex", flexDirection:"column" }}>
      <div style={{ width:40, height:4, borderRadius:99, background:"#D0C8BE", margin:"12px auto 0" }}/>
      <div style={{ padding:"16px 20px 0", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div>
          <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:900, fontSize:20, color:T.dark }}>Görev Havuzu</div>
          <div style={{ color:T.muted, fontSize:13, marginTop:2 }}>{TASK_POOL.length} hazır görev</div>
        </div>
        <button onClick={onClose} style={{ background:"#F0E8DC", border:"none", borderRadius:99, width:36, height:36, fontSize:18, cursor:"pointer" }}>✕</button>
      </div>
      <div style={{ padding:"12px 20px 0" }}>
        <div style={{ background:T.card, borderRadius:14, border:"2px solid #E8DDD0", display:"flex", alignItems:"center", gap:10, padding:"10px 14px" }}>
          <span style={{ fontSize:18, opacity:0.5 }}>🔍</span>
          <input placeholder="Görev ara..." value={search} onChange={e=>setSearch(e.target.value)}
            style={{ border:"none", outline:"none", fontSize:15, fontFamily:"'Nunito',sans-serif", fontWeight:700, color:T.dark, flex:1, background:"transparent" }}/>
        </div>
      </div>
      <div style={{ display:"flex", gap:8, padding:"12px 20px 0", overflowX:"auto" }}>
        {[{id:"all",label:"Tümü",emoji:"⭐",color:T.primary},{id:"child",label:"Çocuk",emoji:"👧",color:"#4ECDC4"},{id:"parent",label:"Ebeveyn",emoji:"👩",color:"#FF6B35"},{id:"family",label:"Aile",emoji:"👨‍👩‍👧",color:"#A855F7"}].map(c=>(
          <div key={c.id} onClick={()=>setCat(c.id)}
            style={{ background:cat===c.id?c.color:T.card, borderRadius:99, padding:"7px 14px", fontSize:13, fontFamily:"'Nunito',sans-serif", fontWeight:800, color:cat===c.id?"#fff":T.muted, cursor:"pointer", whiteSpace:"nowrap", border:`2px solid ${cat===c.id?c.color:"#E8DDD0"}`, flexShrink:0 }}>
            {c.emoji} {c.label}
          </div>
        ))}
      </div>
      <div style={{ flex:1, overflowY:"auto", padding:"12px 20px 32px" }}>
        {filtered.map(task=>{
          const isActive = activeIds.includes(task.id);
          return <div key={task.id}
            style={{ background:isActive?"#F0FAF8":T.card, borderRadius:16, padding:"14px 14px", marginBottom:10, border:`2px solid ${isActive?T.secondary:"#E8DDD0"}`, display:"flex", alignItems:"center", gap:12 }}>
            <div style={{ fontSize:30, minWidth:36, textAlign:"center" }}>{task.emoji}</div>
            <div style={{ flex:1 }}>
              <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:800, fontSize:14, color:T.dark, marginBottom:3 }}>{task.title}</div>
              <span style={{ background:ownerColor[task.owner]+"22", color:ownerColor[task.owner], borderRadius:99, padding:"2px 8px", fontSize:10, fontFamily:"'Nunito',sans-serif", fontWeight:800 }}>{ownerLabel[task.owner]}</span>
            </div>
            <button onClick={()=>!isActive&&onAdd(task)}
              style={{ width:36, height:36, borderRadius:99, border:"none", cursor:isActive?"default":"pointer", background:isActive?T.secondary:T.primary, color:"#fff", fontSize:18, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, opacity:isActive?0.7:1 }}>
              {isActive?"✓":"+"}
            </button>
          </div>;
        })}
      </div>
    </div>
  </div>;
}

// ── PUSULA / ZAR ──────────────────────────────────────────────────────────────
function CompassModal({ onSpin, onClose, movement }) {
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState(null);
  const spin = () => {
    setSpinning(true);
    setTimeout(()=>{ setResult(Math.floor(Math.random()*6)+1); setSpinning(false); },1200);
  };
  return <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.55)", display:"flex", alignItems:"flex-end", justifyContent:"center", zIndex:100 }}>
    <div style={{ background:T.bg, borderRadius:"24px 24px 0 0", padding:"28px 24px 40px", width:"100%", maxWidth:390, textAlign:"center" }}>
      <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:900, fontSize:22, color:T.dark, marginBottom:6 }}>{movement==="compass"?"🧭 Pusula Çevir!":"🎲 Zar At!"}</div>
      <div style={{ fontSize:80, marginBottom:16, display:"inline-block", animation:spinning?"spin 0.3s linear infinite":"none" }}>{movement==="compass"?"🧭":"🎲"}</div>
      {result&&!spinning&&<div style={{ background:`linear-gradient(135deg,${T.primary},#FF8C42)`, borderRadius:20, padding:"16px 24px", marginBottom:20 }}>
        <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:900, fontSize:48, color:"#fff" }}>{result}</div>
        <div style={{ color:"rgba(255,255,255,0.9)", fontSize:14, fontWeight:700 }}>adım ilerliyorsun! 🎉</div>
      </div>}
      <div style={{ display:"flex", gap:10 }}>
        {!result ? (
          <Btn onClick={spin} style={{ flex:1 }} disabled={spinning}>{spinning?"...":movement==="compass"?"Çevir!":"At!"}</Btn>
        ) : (
          <Btn onClick={()=>{onSpin(result);onClose();}} style={{ flex:1 }}>Haritada İlerle →</Btn>
        )}
        <Btn variant="ghost" onClick={onClose} style={{ flex:0, padding:"15px 18px", width:"auto" }}>✕</Btn>
      </div>
    </div>
  </div>;
}

// ── HARİTA ────────────────────────────────────────────────────────────────────
function MapGrid({ position }) {
  const start = Math.max(0, position-4);
  const squares = Array.from({length:30},(_,i)=>start+i).filter(n=>n<TOTAL);
  return <div style={{ overflowX:"auto", paddingBottom:8 }}>
    <div style={{ display:"grid", gridTemplateColumns:"repeat(5,52px)", gap:6, width:"fit-content", margin:"0 auto" }}>
      {squares.map(n=>{
        const isActive=n===position, isPast=n<position, special=SPECIAL[n];
        const lm=LANDMARKS[n%LANDMARKS.length];
        return <div key={n} style={{ width:52, height:52, borderRadius:12,
          background:isActive?"linear-gradient(135deg,#FF6B35,#FF8C42)":isPast?"linear-gradient(135deg,#c8a97a,#b8905a)":"linear-gradient(135deg,#f5e6d0,#eedcb8)",
          border:isActive?"3px solid #FF6B35":special?"2px dashed #C0392B":"2px solid #d4b896",
          display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", position:"relative",
          boxShadow:isActive?"0 4px 16px rgba(255,107,53,0.4)":"0 2px 6px rgba(0,0,0,0.08)" }}>
          {isActive?<div style={{ fontSize:26, animation:"bounce 1s infinite" }}>🧭</div>
           :special==="surprise"?<div style={{ fontSize:22 }}>🎁</div>
           :special==="mini-game"?<div style={{ fontSize:22 }}>⚡</div>
           :<div style={{ fontSize:isPast?18:16, opacity:isPast?1:0.6 }}>{lm}</div>}
          <div style={{ position:"absolute", bottom:2, right:4, fontSize:9, fontFamily:"'Nunito',sans-serif", fontWeight:800, color:isActive?"#fff":isPast?"#7a5a2a":"#b09060", opacity:0.8 }}>{n+1}</div>
        </div>;
      })}
    </div>
  </div>;
}

// ── GÖREV KARTI ───────────────────────────────────────────────────────────────
function TaskCard({ task, onToggle, onRemove }) {
  const ownerColors={child:"#4ECDC4",parent:"#FF6B35",family:"#A855F7"};
  const ownerLabels={child:"Çocuk",parent:"Ebeveyn",family:"Aile"};
  return <div style={{ background:task.done?"linear-gradient(135deg,#f0faf8,#e0f5f0)":T.card, borderRadius:16, padding:"14px 14px", marginBottom:10, border:`2px solid ${task.done?T.secondary:"#E8DDD0"}`, boxShadow:T.shadow, display:"flex", alignItems:"center", gap:12 }}>
    <div onClick={()=>onToggle(task.id)} style={{ fontSize:30, minWidth:36, textAlign:"center", cursor:"pointer" }}>{task.emoji}</div>
    <div onClick={()=>onToggle(task.id)} style={{ flex:1, cursor:"pointer" }}>
      <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:900, fontSize:14, color:task.done?T.secondary:T.dark, textDecoration:task.done?"line-through":"none", marginBottom:3 }}>{task.title}</div>
      <span style={{ background:ownerColors[task.owner]+"22", color:ownerColors[task.owner], borderRadius:99, padding:"2px 8px", fontSize:10, fontFamily:"'Nunito',sans-serif", fontWeight:800 }}>{ownerLabels[task.owner]}</span>
    </div>
    <div style={{ display:"flex", flexDirection:"column", gap:6, alignItems:"center" }}>
      <div onClick={()=>onToggle(task.id)} style={{ width:28, height:28, borderRadius:99, border:`2.5px solid ${task.done?T.secondary:"#D0C8BE"}`, background:task.done?T.secondary:"transparent", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}>
        {task.done&&<span style={{ color:"#fff", fontSize:14, fontWeight:900 }}>✓</span>}
      </div>
      {onRemove&&<button onClick={()=>onRemove(task.id)} style={{ background:"none", border:"none", fontSize:14, cursor:"pointer", color:"#D0C8BE", padding:0 }}>✕</button>}
    </div>
  </div>;
}

// ── ANA EKRAN ─────────────────────────────────────────────────────────────────
function HomeScreen({ data, familyCode, activeUser, seasonNo, globalState, setGlobalState, onSwitchUser, onNewSeason }) {
  const { position, tasks, memberRights, memberDone } = globalState;
  const setTasks = v => setGlobalState(s=>({...s, tasks:typeof v==="function"?v(s.tasks):v}));
  const addTask = task => { if(tasks.find(t=>t.id===task.id)) return; setTasks(ts=>[...ts,{...task,done:false}]); };
  const removeTask = id => setTasks(ts=>ts.filter(t=>t.id!==id));
  const toggleTask = id => setTasks(ts=>ts.map(t=>t.id===id?{...t,done:!t.done}:t));

  const myKey = activeUser?.id||"parent";
  const myOwner = activeUser?.ownerKey||"parent";
  const myRights = memberRights?.[myKey]||0;
  const myDone = memberDone?.[myKey]||false;
  const myTasks = tasks.filter(t=>t.owner===myOwner||t.owner==="family");
  const myDoneCount = myTasks.filter(t=>t.done).length;
  const myAllDone = myTasks.length>0&&myDoneCount===myTasks.length;

  const [showCompass, setShowCompass] = useState(false);
  const [showSurprise, setShowSurprise] = useState(false);
  const [showPool, setShowPool] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [showMiniGame, setShowMiniGame] = useState(false);
  const [activeTab, setActiveTab] = useState("home");

  const progressPct = Math.round((position/TOTAL)*100);
  const parentAvatar = AVATARS.find(a=>a.id===data.avatar);
  const mapTheme = MAP_THEMES.find(t=>t.id===data.mapTheme)||MAP_THEMES[0];

  const claimRight = () => {
    if(!myAllDone||myDone) return;
    setGlobalState(s=>({...s, memberRights:{...s.memberRights,[myKey]:(s.memberRights?.[myKey]||0)+1}, memberDone:{...s.memberDone,[myKey]:true}}));
  };

  const handleSpin = steps => {
    const newPos = Math.min(position+steps, TOTAL-1);
    setGlobalState(s=>({...s, position:newPos, memberRights:{...s.memberRights,[myKey]:Math.max(0,(s.memberRights?.[myKey]||0)-1)}, memberDone:{...s.memberDone,[myKey]:false}, tasks:s.tasks.map(t=>({...t,done:false}))}));
    if(newPos===TOTAL-1) setTimeout(()=>setShowCelebration(true),600);
    else if(SPECIAL[newPos]==="surprise") setTimeout(()=>setShowSurprise(true),400);
    else if(SPECIAL[newPos]==="mini-game") setTimeout(()=>setShowMiniGame(true),400);
  };

  return <div style={{ display:"flex", flexDirection:"column", minHeight:"100vh" }}>
    {/* Header */}
    <div style={{ background:T.anatoliaBg, padding:"16px 20px 14px", borderBottom:"2px solid #e8cfa0" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
        <div>
          <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:900, fontSize:20, color:T.dark }}>
            Life<span style={{color:T.primary}}>Board</span>
            <span style={{ fontSize:13, color:"#8a6a3a", fontWeight:700, marginLeft:6 }}>S{seasonNo}</span>
          </div>
          <div style={{ fontFamily:"'Nunito',sans-serif", fontSize:12, color:"#8a6a3a", fontWeight:700 }}>{mapTheme.icon} {mapTheme.name}</div>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <div style={{ background:"#fff8", borderRadius:99, padding:"5px 10px", fontFamily:"'Nunito',sans-serif", fontWeight:800, fontSize:12, color:T.dark }}>📍 {position+1}/{TOTAL}</div>
          <div onClick={onSwitchUser} style={{ display:"flex", alignItems:"center", gap:6, background:T.primary, borderRadius:99, padding:"6px 12px", cursor:"pointer" }}>
            <span style={{ fontSize:20 }}>{activeUser?.emoji||parentAvatar?.emoji||"👩"}</span>
            <span style={{ fontFamily:"'Nunito',sans-serif", fontWeight:800, fontSize:12, color:"#fff" }}>{activeUser?.name||data.name||"Ben"}</span>
            <span style={{ fontSize:10, color:"rgba(255,255,255,0.8)" }}>↕</span>
          </div>
        </div>
      </div>
      <div style={{ background:"#e8cfa0", borderRadius:99, height:10, overflow:"hidden" }}>
        <div style={{ height:"100%", width:`${progressPct}%`, background:"linear-gradient(90deg,#C0392B,#e74c3c)", borderRadius:99, transition:"width 0.6s ease" }}/>
      </div>
      <div style={{ display:"flex", justifyContent:"space-between", marginTop:4 }}>
        <span style={{ fontFamily:"'Nunito',sans-serif", fontSize:11, color:"#8a6a3a", fontWeight:700 }}>Baslangıç</span>
        <span style={{ fontFamily:"'Nunito',sans-serif", fontSize:11, color:"#8a6a3a", fontWeight:700 }}>%{progressPct}</span>
        <span style={{ fontFamily:"'Nunito',sans-serif", fontSize:11, color:"#8a6a3a", fontWeight:700 }}>Hazine 💎</span>
      </div>
    </div>

    {/* Tabs */}
    <div style={{ display:"flex", background:T.card, borderBottom:"2px solid #F0E8DC" }}>
      {[{id:"home",label:"🏠 Ana"},{id:"map",label:"🗺️ Harita"},{id:"tasks",label:"✅ Görev"},{id:"profile",label:"👤 Profil"}].map(tab=>(
        <div key={tab.id} onClick={()=>setActiveTab(tab.id)}
          style={{ flex:1, padding:"12px 4px", textAlign:"center", fontFamily:"'Nunito',sans-serif", fontWeight:800, fontSize:12, color:activeTab===tab.id?T.primary:T.muted, borderBottom:`3px solid ${activeTab===tab.id?T.primary:"transparent"}`, cursor:"pointer" }}>
          {tab.label}
        </div>
      ))}
    </div>

    {/* Content */}
    <div style={{ flex:1, overflowY:"auto", padding:"18px 16px 90px" }}>

      {activeTab==="home"&&<>
        {/* Aile ekibi */}
        <div style={{ background:"linear-gradient(135deg,#fff8ee,#fff0dc)", borderRadius:20, padding:"16px 18px", marginBottom:16, border:"2px solid #e8cfa0" }}>
          <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:900, fontSize:14, color:"#8a6a3a", marginBottom:10 }}>AİLE EKİBİ</div>
          <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
            {[
              {emoji:parentAvatar?.emoji||"👩", name:data.name||"Ebeveyn", role:"Ebeveyn", key:"parent"},
              ...((data.children||[]).map((c,i)=>({emoji:AVATARS.find(a=>a.id===c.avatar)?.emoji||"👧", name:c.name, role:`${c.age} yas`, key:`child_${i}`}))),
            ].map((m,i)=>(
              <div key={i} style={{ background:"#fff", borderRadius:14, padding:"10px 12px", textAlign:"center", border:"2px solid #e8cfa0", minWidth:70 }}>
                <div style={{ fontSize:28 }}>{m.emoji}</div>
                <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:800, fontSize:12, color:T.dark, marginTop:2 }}>{m.name}</div>
                <div style={{ fontFamily:"'Nunito',sans-serif", fontSize:10, color:T.muted }}>{m.role}</div>
                <div style={{ marginTop:4, background:"#fff3e0", borderRadius:99, padding:"2px 6px", fontSize:10, fontWeight:800, color:T.primary }}>
                  {(memberRights?.[m.key]||0)>0?`${memberRights[m.key]}x ${data.movement==="compass"?"🧭":"🎲"}`:"Görev bekliyor"}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bugünün görevleri özeti */}
        <div style={{ background:T.card, borderRadius:20, padding:"16px 18px", marginBottom:16, boxShadow:T.shadow }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
            <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:900, fontSize:14, color:T.primary }}>BUGÜNÜN GÖREVLERİM</div>
            <div style={{ fontFamily:"'Nunito',sans-serif", fontSize:12, fontWeight:800, color:T.muted }}>{myDoneCount}/{myTasks.length}</div>
          </div>
          {myTasks.slice(0,3).map(task=>(
            <div key={task.id} onClick={()=>toggleTask(task.id)} style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 0", borderBottom:"1px solid #F5EDE0", cursor:"pointer" }}>
              <span style={{ fontSize:22 }}>{task.emoji}</span>
              <span style={{ fontFamily:"'Nunito',sans-serif", fontSize:13, fontWeight:700, flex:1, color:task.done?T.secondary:T.dark, textDecoration:task.done?"line-through":"none" }}>{task.title}</span>
              <div style={{ width:22, height:22, borderRadius:99, border:`2px solid ${task.done?T.secondary:"#D0C8BE"}`, background:task.done?T.secondary:"transparent", display:"flex", alignItems:"center", justifyContent:"center" }}>
                {task.done&&<span style={{ color:"#fff", fontSize:12 }}>✓</span>}
              </div>
            </div>
          ))}
          <div onClick={()=>setActiveTab("tasks")} style={{ textAlign:"center", padding:"8px 0 2px", fontFamily:"'Nunito',sans-serif", fontWeight:800, fontSize:12, color:T.primary, cursor:"pointer" }}>
            Tüm görevleri gör ({myTasks.length}) →
          </div>
        </div>

        {/* Hak kazan / pusula */}
        {myRights>0 ? (
          <div style={{ background:`linear-gradient(135deg,${T.primary},#FF8C42)`, borderRadius:20, padding:"18px 20px", textAlign:"center", marginBottom:16 }}>
            <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:900, fontSize:13, color:"rgba(255,255,255,0.85)", marginBottom:4 }}>{myRights}x {data.movement==="compass"?"pusula hakkın":"zar hakkın"} var!</div>
            <div style={{ fontSize:40, marginBottom:10 }}>{data.movement==="compass"?"🧭":"🎲"}</div>
            <Btn onClick={()=>setShowCompass(true)} style={{ background:"#fff", color:T.primary }}>
              {data.movement==="compass"?"Pusula Çevir! 🧭":"Zar At! 🎲"}
            </Btn>
          </div>
        ) : myAllDone&&!myDone ? (
          <div style={{ background:`linear-gradient(135deg,${T.secondary},#38b2aa)`, borderRadius:20, padding:"18px 20px", textAlign:"center", marginBottom:16 }}>
            <div style={{ fontSize:40, marginBottom:8 }}>🎉</div>
            <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:900, fontSize:15, color:"#fff", marginBottom:10 }}>Tüm görevler tamam!<br/>Hakkını al!</div>
            <Btn onClick={claimRight} style={{ background:"#fff", color:T.secondary }}>
              {data.movement==="compass"?"🧭 Pusula Hakkı Al":"🎲 Zar Hakkı Al"}
            </Btn>
          </div>
        ) : (
          <div style={{ background:"#F0E8DC", borderRadius:20, padding:"18px 20px", textAlign:"center", marginBottom:16, border:"2px dashed #D0C0A8" }}>
            <div style={{ fontSize:36, marginBottom:8, opacity:0.5 }}>{data.movement==="compass"?"🧭":"🎲"}</div>
            <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:800, fontSize:14, color:T.muted }}>
              {myDoneCount}/{myTasks.length} görev tamamlandı<br/>
              <span style={{ fontSize:12 }}>Tüm görevleri bitir → hak kazan → ilerle</span>
            </div>
          </div>
        )}

        {/* Büyük ödül */}
        <div style={{ background:"linear-gradient(135deg,#6C3483,#9B59B6)", borderRadius:20, padding:"16px 18px", textAlign:"center" }}>
          <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:900, fontSize:13, color:"rgba(255,255,255,0.8)", marginBottom:6 }}>AY SONU BÜYÜK ÖDÜL</div>
          <div style={{ fontSize:36, marginBottom:4 }}>{Object.keys(data.votes||{}).filter(k=>data.votes[k]).map(id=>REWARDS.find(r=>r.id===id)?.emoji).join(" ")||"🎬"}</div>
          <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:800, fontSize:14, color:"#fff" }}>{Object.keys(data.votes||{}).filter(k=>data.votes[k]).map(id=>REWARDS.find(r=>r.id===id)?.label).join(" & ")||"Sinema Gecesi"}</div>
          <div style={{ fontFamily:"'Nunito',sans-serif", fontSize:12, color:"rgba(255,255,255,0.7)", marginTop:4 }}>{TOTAL-position-1} kare kaldı</div>
          <div onClick={()=>setShowCelebration(true)} style={{ marginTop:10, fontFamily:"'Nunito',sans-serif", fontSize:11, color:"rgba(255,255,255,0.4)", cursor:"pointer" }}>finale önizle</div>
        </div>
      </>}

      {activeTab==="map"&&<>
        <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:900, fontSize:18, color:T.dark, marginBottom:4 }}>{mapTheme.icon} {mapTheme.name} Haritası</div>
        <p style={{ color:T.muted, fontSize:13, marginBottom:6 }}>🧭 Konumun · 🎁 Sürpriz · ⚡ Mini Oyun</p>
        <div onClick={()=>setShowMiniGame(true)} style={{ background:"linear-gradient(135deg,#FFE8D6,#FFD4B8)", borderRadius:14, padding:"10px 14px", marginBottom:14, display:"flex", alignItems:"center", gap:10, cursor:"pointer" }}>
          <span style={{ fontSize:24 }}>⚡</span>
          <div style={{ flex:1 }}>
            <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:800, fontSize:13, color:T.dark }}>Mini Oyun Dene</div>
            <div style={{ fontSize:11, color:T.muted }}>Esya Avı veya Senkronize Balon</div>
          </div>
          <span style={{ color:T.primary }}>→</span>
        </div>
        <MapGrid position={position}/>
        <div style={{ marginTop:16, background:T.card, borderRadius:16, padding:"14px 16px", boxShadow:T.shadow }}>
          {[
            {label:"Mevcut kare", val:`${position+1}. kare`},
            {label:"Kalan kare",  val:`${TOTAL-position-1} kare`},
            {label:"İlerleme",    val:`%${progressPct}`},
            {label:"Tahmini bitis", val:`~${Math.ceil((TOTAL-position)/4)} gün`},
          ].map((row,i)=>(
            <div key={i} style={{ display:"flex", justifyContent:"space-between", padding:"6px 0", borderBottom:i<3?"1px solid #F0E8DC":"none" }}>
              <span style={{ fontFamily:"'Nunito',sans-serif", fontSize:13, color:T.muted }}>{row.label}</span>
              <span style={{ fontFamily:"'Nunito',sans-serif", fontSize:13, fontWeight:800, color:T.dark }}>{row.val}</span>
            </div>
          ))}
        </div>
      </>}

      {activeTab==="tasks"&&<>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:4 }}>
          <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:900, fontSize:18, color:T.dark }}>Görevlerim</div>
          <button onClick={()=>setShowPool(true)}
            style={{ background:T.primary, border:"none", borderRadius:99, padding:"8px 16px", fontFamily:"'Nunito',sans-serif", fontWeight:800, fontSize:13, color:"#fff", cursor:"pointer" }}>
            + Görev Ekle
          </button>
        </div>
        <p style={{ color:T.muted, fontSize:13, marginBottom:14 }}>Dokunarak tamamla · ✕ ile kaldır</p>
        <div style={{ display:"flex", gap:8, marginBottom:14 }}>
          {[{label:"Toplam",val:myTasks.length,color:T.dark},{label:"Tamam",val:myDoneCount,color:T.secondary},{label:"Bekliyor",val:myTasks.filter(t=>!t.done).length,color:T.primary}].map((s,i)=>(
            <div key={i} style={{ flex:1, background:T.card, borderRadius:14, padding:"10px 8px", textAlign:"center", boxShadow:T.shadow }}>
              <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:900, fontSize:22, color:s.color }}>{s.val}</div>
              <div style={{ fontFamily:"'Nunito',sans-serif", fontSize:11, color:T.muted, fontWeight:700 }}>{s.label}</div>
            </div>
          ))}
        </div>
        {myTasks.length===0&&(
          <div style={{ textAlign:"center", padding:"40px 0", color:T.muted }}>
            <div style={{ fontSize:48, marginBottom:8 }}>📋</div>
            <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:800, fontSize:16, marginBottom:20 }}>Görev yok  -  havuzdan ekle</div>
            <Btn onClick={()=>setShowPool(true)} style={{ maxWidth:200, margin:"0 auto" }}>+ Görev Ekle</Btn>
          </div>
        )}
        {myTasks.map(task=><TaskCard key={task.id} task={task} onToggle={toggleTask} onRemove={removeTask}/>)}
        {myTasks.length>0&&<div style={{ marginTop:8 }}><Btn variant="secondary" onClick={()=>setShowPool(true)}>+ Havuzdan Görev Ekle</Btn></div>}
        {myAllDone&&myTasks.length>0&&(
          <div style={{ background:`linear-gradient(135deg,${T.secondary},#38b2aa)`, borderRadius:18, padding:"18px", textAlign:"center", marginTop:16 }}>
            <div style={{ fontSize:40, marginBottom:6 }}>🎉</div>
            <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:900, fontSize:16, color:"#fff" }}>Görevlerin tamam!</div>
            <div style={{ fontFamily:"'Nunito',sans-serif", fontSize:13, color:"rgba(255,255,255,0.9)", marginBottom:14 }}>Ana sayfadan hakkını al ve ilerle</div>
            <Btn onClick={()=>setActiveTab("home")} style={{ background:"#fff", color:T.secondary }}>Ana Sayfaya Git →</Btn>
          </div>
        )}
      </>}

      {activeTab==="profile"&&(()=>{
        const members = [
          {emoji:parentAvatar?.emoji||"👩", name:data.name||"Ebeveyn", role:"Ebeveyn", key:"parent", totalDone:42, streak:7, badges:["🏆","⭐","🔥"]},
          ...((data.children||[]).map((c,i)=>({emoji:AVATARS.find(a=>a.id===c.avatar)?.emoji||"👧", name:c.name, role:`${c.age} yas`, key:`child_${i}`, totalDone:[28,35,19][i]||24, streak:[5,9,3][i]||4, badges:[["🌟","📚"],["🚀","🎯"],["🌱"]][i]||["🌟"]}))),
        ];
        const sorted=[...members].sort((a,b)=>b.totalDone-a.totalDone);
        const maxDone=sorted[0]?.totalDone||1;
        const medals=["🥇","🥈","🥉","🎖️"];
        const barColors=["linear-gradient(90deg,#FFD700,#FFA500)","linear-gradient(90deg,#C0C0C0,#A0A0A0)","linear-gradient(90deg,#CD7F32,#A0522D)","linear-gradient(90deg,#A855F7,#7C3AED)"];
        return <>
          <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:900, fontSize:18, color:T.dark, marginBottom:4 }}>Skor Tablosu 🏆</div>
          <p style={{ color:T.muted, fontSize:13, marginBottom:16 }}>Bu ay kim kaç görev tamamladı?</p>
          {sorted.map((m,i)=>(
            <div key={i} style={{ background:i===0?"linear-gradient(135deg,#fff8e1,#fff3cc)":T.card, borderRadius:18, padding:"14px 16px", marginBottom:10, border:`2px solid ${i===0?"#FFD700":"#E8DDD0"}`, boxShadow:T.shadow }}>
              <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:10 }}>
                <div style={{ fontSize:28 }}>{medals[i]}</div>
                <div style={{ fontSize:32 }}>{m.emoji}</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:900, fontSize:15, color:T.dark }}>{m.name}</div>
                  <div style={{ fontFamily:"'Nunito',sans-serif", fontSize:12, color:T.muted }}>{m.role}</div>
                </div>
                <div style={{ textAlign:"right" }}>
                  <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:900, fontSize:22, color:T.primary }}>{m.totalDone}</div>
                  <div style={{ fontFamily:"'Nunito',sans-serif", fontSize:10, color:T.muted, fontWeight:700 }}>GÖREV</div>
                </div>
              </div>
              <div style={{ background:"#F0E8DC", borderRadius:99, height:8, overflow:"hidden", marginBottom:8 }}>
                <div style={{ height:"100%", width:`${(m.totalDone/maxDone)*100}%`, background:barColors[i], borderRadius:99 }}/>
              </div>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                <div style={{ display:"flex", gap:4 }}>{m.badges.map((b,j)=><span key={j} style={{ fontSize:18 }}>{b}</span>)}</div>
                <div style={{ background:"#FFF3E0", borderRadius:99, padding:"3px 10px", fontFamily:"'Nunito',sans-serif", fontWeight:800, fontSize:11, color:T.primary }}>🔥 {m.streak} günlük seri</div>
              </div>
            </div>
          ))}
          <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:900, fontSize:16, color:T.dark, margin:"20px 0 12px" }}>Ay Özeti 📊</div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:16 }}>
            {[
              {emoji:"✅", label:"Toplam Görev", val:members.reduce((s,m)=>s+m.totalDone,0), color:T.secondary},
              {emoji:"📍", label:"Harita Konumu", val:`${position+1}. kare`, color:T.primary},
              {emoji:"🔥", label:"En Uzun Seri",  val:`${Math.max(...members.map(m=>m.streak))} gün`, color:"#F97316"},
              {emoji:"⏳", label:"Kalan Kare",    val:TOTAL-position-1, color:"#A855F7"},
            ].map((s,i)=>(
              <div key={i} style={{ background:T.card, borderRadius:16, padding:"14px 12px", textAlign:"center", boxShadow:T.shadow, border:`2px solid ${s.color}22` }}>
                <div style={{ fontSize:28, marginBottom:4 }}>{s.emoji}</div>
                <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:900, fontSize:20, color:s.color }}>{s.val}</div>
                <div style={{ fontFamily:"'Nunito',sans-serif", fontSize:11, color:T.muted, fontWeight:700, marginTop:2 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </>;
      })()}
    </div>

    {/* Bottom nav */}
    <div style={{ position:"fixed", bottom:0, left:"50%", transform:"translateX(-50%)", width:"100%", maxWidth:390, background:"#fff", borderTop:"2px solid #F0E8DC", padding:"10px 20px 18px", display:"flex", justifyContent:"space-around" }}>
      {[{id:"home",emoji:"🏠",label:"Ana"},{id:"map",emoji:"🗺️",label:"Harita"},{id:"tasks",emoji:"✅",label:"Görevler"},{id:"profile",emoji:"👤",label:"Profil"}].map(tab=>(
        <div key={tab.id} onClick={()=>setActiveTab(tab.id)} style={{ textAlign:"center", cursor:"pointer" }}>
          <div style={{ fontSize:22 }}>{tab.emoji}</div>
          <div style={{ fontFamily:"'Nunito',sans-serif", fontSize:11, fontWeight:800, color:activeTab===tab.id?T.primary:T.muted }}>{tab.label}</div>
        </div>
      ))}
    </div>

    {/* Modals */}
    {showCompass&&<CompassModal movement={data.movement} onSpin={handleSpin} onClose={()=>setShowCompass(false)}/>}
    {showSurprise&&<SurpriseModal onClose={()=>setShowSurprise(false)}/>}
    {showPool&&<TaskPoolModal activeTasks={tasks} onAdd={addTask} onClose={()=>setShowPool(false)}/>}
    {showCelebration&&<CelebrationScreen data={data} onNewSeason={()=>{setShowCelebration(false);onNewSeason();}}/>}
    {showMiniGame&&<MiniGameModal onClose={()=>setShowMiniGame(false)} onWin={()=>setGlobalState(s=>({...s,position:Math.min(s.position+1,TOTAL-1)}))}/>}
  </div>;
}

// ── YENİ SEZON ────────────────────────────────────────────────────────────────
function NewSeasonScreen({ data, seasonNo, onFinish }) {
  const [sel, setSel] = useState(null);
  const available = MAP_THEMES.filter(t=>t.id!==data.mapTheme);
  return <div style={{ minHeight:"100vh", background:"linear-gradient(160deg,#1a0533 0%,#3d0d6e 100%)", display:"flex", flexDirection:"column", padding:"32px 22px" }}>
    <div style={{ textAlign:"center", marginBottom:28 }}>
      <div style={{ display:"inline-block", background:"rgba(255,215,0,0.15)", borderRadius:99, padding:"6px 18px", fontFamily:"'Nunito',sans-serif", fontWeight:800, fontSize:13, color:"#FFD700", marginBottom:12 }}>SEZON {seasonNo} TAMAMLANDI</div>
      <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:900, fontSize:26, color:"#fff" }}>Yeni Macera Seçin!</div>
    </div>
    <div style={{ display:"flex", flexDirection:"column", gap:14, flex:1 }}>
      {available.map(t=>(
        <div key={t.id} onClick={()=>setSel(t.id)}
          style={{ background:t.bg, borderRadius:22, padding:"20px 20px", cursor:"pointer", border:`3px solid ${sel===t.id?t.color:"transparent"}`, boxShadow:T.shadow, display:"flex", alignItems:"center", gap:16 }}>
          <div style={{ fontSize:44 }}>{t.icon}</div>
          <div style={{ flex:1 }}>
            <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:900, fontSize:17, color:t.light?"#fff":T.dark }}>{t.emoji} {t.name}</div>
            <div style={{ fontSize:12, color:t.light?"rgba(255,255,255,0.75)":T.muted, marginTop:4 }}>{t.desc}</div>
          </div>
          {sel===t.id&&<div style={{ fontSize:24 }}>✅</div>}
        </div>
      ))}
    </div>
    <div style={{ marginTop:24 }}>
      <button onClick={()=>sel&&onFinish(sel)} disabled={!sel}
        style={{ width:"100%", padding:"16px", borderRadius:18, border:"none", background:sel?"linear-gradient(135deg,#FFD700,#FFA500)":"rgba(255,255,255,0.15)", color:sel?"#1a0533":"rgba(255,255,255,0.4)", fontFamily:"'Nunito',sans-serif", fontWeight:900, fontSize:17, cursor:sel?"pointer":"not-allowed" }}>
        Yeni Sezonu Basla! 🚀
      </button>
    </div>
  </div>;
}

// ── APP ROOT ──────────────────────────────────────────────────────────────────
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;700;800;900&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #E8DDD0; display: flex; justify-content: center; align-items: flex-start; min-height: 100vh; font-family: 'Nunito', sans-serif; }
  input { color-scheme: light; }
  @keyframes bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
  @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
  @keyframes confettiFall { 0%{transform:translateY(0) rotate(0deg);opacity:1} 80%{opacity:1} 100%{transform:translateY(110vh) rotate(720deg);opacity:0} }
`;

export default function App() {
  const [appState, setAppState] = useState("loading");
  const [step, setStep] = useState(0);
  const [flow, setFlow] = useState("create");
  const [formData, setFormData] = useState({});
  const [familyCode, setFamilyCode] = useState("");
  const [activeUser, setActiveUser] = useState(null);
  const [seasonNo, setSeasonNo] = useState(1);
  const [globalState, setGlobalStateLocal] = useState({
    position: 0, tasks: DEFAULT_TASKS, memberRights: {}, memberDone: {},
  });

  // Firebase'den global state oku
  useEffect(()=>{
    if(!familyCode) return;
    const gsRef = ref(db, `families/${familyCode}/gameState`);
    const unsub = onValue(gsRef, snap=>{
      if(snap.exists()) setGlobalStateLocal(snap.val());
    });
    return ()=>unsub();
  },[familyCode]);

  // Global state Firebase'e yaz
  const setGlobalState = v => {
    const newState = typeof v==="function" ? v(globalState) : v;
    setGlobalStateLocal(newState);
    if(familyCode) set(ref(db, `families/${familyCode}/gameState`), newState);
  };

  // Sayfa açılışında session kontrol et
  useEffect(()=>{
    const savedCode = localStorage.getItem("lb_familyCode");
    if(savedCode) {
      get(ref(db, `families/${savedCode}`)).then(snap=>{
        if(snap.exists()) {
          const family = snap.val();
          setFormData(family);
          setFamilyCode(savedCode);
          if(family.gameState) setGlobalStateLocal(family.gameState);
          setAppState("userSelect");
        } else {
          localStorage.removeItem("lb_familyCode");
          setAppState("onboarding");
        }
      }).catch(()=>setAppState("onboarding"));
    } else {
      setAppState("onboarding");
    }
  },[]);

  const steps = flow==="join"
    ? ["welcome","join","userSelect"]
    : ["welcome","parentProfile","addChild","mapTheme","movement","council","launch"];

  const currentStep = steps[step];

  const next = (extra) => {
    if(currentStep==="welcome") setFlow(extra||"create");
    setStep(s=>s+1);
  };
  const back = ()=>setStep(s=>Math.max(0,s-1));

  const handleFinishOnboarding = async () => {
    const code = makeCode();
    setFamilyCode(code);
    localStorage.setItem("lb_familyCode", code);
    // Aile verisini Firebase'e kaydet
    await set(ref(db, `families/${code}`), {
      ...formData,
      familyCode: code,
      createdAt: Date.now(),
    });
    // Oyun durumunu sıfırla
    const initState = { position:0, tasks:DEFAULT_TASKS, memberRights:{}, memberDone:{} };
    await set(ref(db, `families/${code}/gameState`), initState);
    setGlobalStateLocal(initState);
    setAppState("userSelect");
  };

  const handleJoin = async (code) => {
    setFamilyCode(code);
    setAppState("userSelect");
  };

  const handleSelectUser = user => {
    setActiveUser(user);
    setAppState("home");
  };

  const handleNewSeason = async newThemeId => {
    const newFormData = {...formData, mapTheme:newThemeId};
    setFormData(newFormData);
    setSeasonNo(s=>s+1);
    const initState = { position:0, tasks:DEFAULT_TASKS, memberRights:{}, memberDone:{} };
    setGlobalState(initState);
    await set(ref(db, `families/${familyCode}`), {...newFormData, familyCode, gameState:initState});
    setAppState("userSelect");
  };

  if(appState==="loading") return (
    <><style>{CSS}</style>
    <div style={{ width:"100%", maxWidth:390, minHeight:"100vh", background:T.bg, display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ textAlign:"center" }}>
        <div style={{ fontSize:60, animation:"bounce 1s infinite" }}>🏡</div>
        <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:900, fontSize:20, color:T.primary, marginTop:12 }}>Yükleniyor...</div>
      </div>
    </div></>
  );

  if(appState==="newSeason") return (
    <><style>{CSS}</style>
    <div style={{ width:"100%", maxWidth:390, minHeight:"100vh" }}>
      <NewSeasonScreen data={formData} seasonNo={seasonNo} onFinish={handleNewSeason}/>
    </div></>
  );

  if(appState==="userSelect") return (
    <><style>{CSS}</style>
    <div style={{ width:"100%", maxWidth:390, minHeight:"100vh", background:T.bg }}>
      <UserSelectScreen data={formData} familyCode={familyCode} onSelect={handleSelectUser}/>
    </div></>
  );

  if(appState==="home") return (
    <><style>{CSS}</style>
    <div style={{ width:"100%", maxWidth:390, minHeight:"100vh", background:T.bg }}>
      <HomeScreen
        data={formData} familyCode={familyCode} activeUser={activeUser}
        seasonNo={seasonNo} globalState={globalState} setGlobalState={setGlobalState}
        onSwitchUser={()=>setAppState("userSelect")}
        onNewSeason={()=>setAppState("newSeason")}
      />
    </div></>
  );

  // Onboarding
  return (
    <><style>{`@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;700;800;900&display=swap'); *{box-sizing:border-box;margin:0;padding:0} input{color-scheme:light} body{background:#E8DDD0;display:flex;justify-content:center;align-items:center;min-height:100vh;font-family:'Nunito',sans-serif} @keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-12px)}}`}</style>
    <div style={{ width:"100%", maxWidth:390, minHeight:"100vh", background:T.bg, overflowY:"auto" }}>
      {currentStep==="welcome"      &&<WelcomeScreen onNext={next}/>}
      {currentStep==="join"         &&<JoinScreen onNext={handleJoin} onBack={back} setFormData={setFormData}/>}
      {currentStep==="parentProfile"&&<ParentProfileScreen onNext={next} onBack={back} data={formData} setData={setFormData}/>}
      {currentStep==="addChild"     &&<AddChildScreen onNext={next} onBack={back} data={formData} setData={setFormData}/>}
      {currentStep==="mapTheme"     &&<MapThemeScreen onNext={next} onBack={back} data={formData} setData={setFormData}/>}
      {currentStep==="movement"     &&<MovementScreen onNext={next} onBack={back} data={formData} setData={setFormData}/>}
      {currentStep==="council"      &&<CouncilScreen onNext={next} onBack={back} data={formData} setData={setFormData}/>}
      {currentStep==="launch"       &&<LaunchScreen data={formData} familyCode={familyCode||"..."} onFinish={handleFinishOnboarding}/>}
    </div></>
  );
}
