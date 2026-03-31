import { useState, useEffect, useRef } from "react";
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
const BADGE_SQUARES = [15,30,45,60,75,90];
const THEME_BADGES = {
  anatolia:[
    {emoji:"🏺",name:"Çömlekçi",desc:"Çanak çömlek ustası oldun!"},
    {emoji:"🕌",name:"Tarih Yolcusu",desc:"Tarihi eserleri kesfettin!"},
    {emoji:"🐪",name:"Kervan Üyesi",desc:"Anadolu yollarını astın!"},
    {emoji:"🌙",name:"Gece Yolcusu",desc:"Karanlıkta bile yolunu buldun!"},
    {emoji:"🦅",name:"Kartal",desc:"Zirveye ulastın!"},
    {emoji:"🔮",name:"Büyücü",desc:"Gizemleri çözüyorsun!"},
  ],
  galaxy:[
    {emoji:"⭐",name:"Yıldız Toplayıcı",desc:"Galakside bir yıldız kazandın!"},
    {emoji:"🚀",name:"Roket Pilotu",desc:"Uzaya firlatıldın!"},
    {emoji:"🌍",name:"Gezegen Kaşifi",desc:"Yeni bir gezegen kesfettin!"},
    {emoji:"☄️",name:"Meteor Avcısı",desc:"Meteor kusagından geçtin!"},
    {emoji:"🛸",name:"UFO Kaptanı",desc:"Uzay gemisini kullandın!"},
    {emoji:"🌌",name:"Galaksi Haritacısı",desc:"Sonsuz evreni haritaladın!"},
  ],
  nature:[
    {emoji:"🌱",name:"Tohum Ekici",desc:"Doga yolculugu basladı!"},
    {emoji:"🦋",name:"Kelebek",desc:"Dönüsum tamamlandı!"},
    {emoji:"🌳",name:"Agaç Bekçisi",desc:"Bir agaç büyüttün!"},
    {emoji:"💧",name:"Su Koruyucusu",desc:"Nehirleri temizledin!"},
    {emoji:"🦅",name:"Orman Kartalı",desc:"Dogayı yukarıdan izledin!"},
    {emoji:"🌈",name:"Gökkusagı",desc:"Dogayı kurtardın!"},
  ],
};

const DEFAULT_GAME_STATE = {
  positions: {},   // { parent:0, child_0:0, child_1:0, ... }  -  herkes kendi konumunda
  tasks: DEFAULT_TASKS,
  memberRights: {},
  memberDone: {},
  earnedBadges: {},  // { parent:["🏺"], child_0:["⭐"] }
};
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

// ── EMOJİ ŞİFRE SEÇİCİ ───────────────────────────────────────────────────────
const EMOJI_OPTIONS = ["🌟","🎈","🦁","🍕","🚀","🌈","🐶","🎮","🏆","🦋","🍦","⚽","🎵","🌸","🐱","🎯","🦄","🍎","🎨","🌙","🐸","🎲","🦊","🍩"];

function EmojiPinPicker({ value, onChange, label }) {
  const selected = Array.isArray(value) ? value[0] : value;
  return <div style={{ marginBottom:20 }}>
    <p style={{ fontFamily:"'Nunito',sans-serif", fontWeight:700, color:T.dark, marginBottom:6, fontSize:14 }}>{label}</p>
    <p style={{ fontFamily:"'Nunito',sans-serif", fontSize:12, color:T.muted, marginBottom:10 }}>1 emoji seç  -  giriş sifren bu olacak</p>
    <div style={{ display:"grid", gridTemplateColumns:"repeat(6,1fr)", gap:8 }}>
      {EMOJI_OPTIONS.map((e,i)=>(
        <div key={i} onClick={()=>onChange(e)}
          style={{ height:48, display:"flex", alignItems:"center", justifyContent:"center", fontSize:26, borderRadius:12, background:selected===e?"linear-gradient(135deg,#FF6B35,#FF8C42)":"#F5F0EA", cursor:"pointer", border:`2px solid ${selected===e?T.primary:"transparent"}`, transition:"all 0.15s" }}>
          {e}
        </div>
      ))}
    </div>
    {selected && <div style={{ marginTop:8, textAlign:"center", fontFamily:"'Nunito',sans-serif", fontSize:13, color:T.muted }}>Seçilen: <span style={{ fontSize:22 }}>{selected}</span> ✓</div>}
  </div>;
}

// ── EMOJİ PIN GİRİŞ EKRANI ───────────────────────────────────────────────────
function EmojiPinEntry({ member, onSuccess, onBack }) {
  const [error, setError] = useState(false);

  // Pin yoksa direkt giriş
  const rawPin = member.emojiPin;
  const correct = Array.isArray(rawPin) ? rawPin[0] : rawPin;

  useEffect(()=>{ if(!correct) onSuccess(); },[]);
  if(!correct) return null;

  const pick = (e) => {
    if(e === correct) {
      onSuccess();
    } else {
      setError(true);
      setTimeout(()=>setError(false), 800);
    }
  };

  return <div style={{ minHeight:"100vh", background:T.anatoliaBg, display:"flex", flexDirection:"column", justifyContent:"center", padding:"32px 22px" }}>
    <button onClick={onBack} style={{ background:"none", border:"none", fontSize:22, cursor:"pointer", alignSelf:"flex-start", marginBottom:20 }}>←</button>
    <div style={{ textAlign:"center", marginBottom:24 }}>
      <div style={{ fontSize:56, marginBottom:8 }}>{member.emoji}</div>
      <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:900, fontSize:24, color:T.dark }}>{member.name}</div>
      <div style={{ color:T.muted, fontSize:14, marginTop:4 }}>Emoji sifrenizi seçin 🔒</div>
    </div>
    {error && <div style={{ textAlign:"center", color:"#DC2626", fontFamily:"'Nunito',sans-serif", fontWeight:800, fontSize:14, marginBottom:12 }}>Yanlis! Tekrar dene 🔒</div>}
    <div style={{ background:T.card, borderRadius:20, padding:16, boxShadow:T.shadow }}>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(6,1fr)", gap:8 }}>
        {EMOJI_OPTIONS.map((e,i)=>(
          <div key={i} onClick={()=>pick(e)}
            style={{ height:52, display:"flex", alignItems:"center", justifyContent:"center", fontSize:28, borderRadius:12, background:error?"#FEE2E2":"#F5F0EA", cursor:"pointer", transition:"all 0.15s" }}
            onMouseDown={el=>el.currentTarget.style.transform="scale(0.88)"}
            onMouseUp={el=>el.currentTarget.style.transform="scale(1)"}>
            {e}
          </div>
        ))}
      </div>
    </div>
  </div>;
}
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
    <p style={{ color:T.muted, fontSize:14, marginBottom:24 }}>Adını gir, rolünü ve emoji sifrenizi seç</p>
    <input type="text" placeholder="Adın nedir?" value={data.name||""} onChange={e=>setData({...data, name:e.target.value})}
      style={{...inputStyle, marginBottom:20}}/>
    <p style={{ fontFamily:"'Nunito',sans-serif", fontWeight:700, color:T.dark, marginBottom:12, fontSize:14 }}>Rol seç:</p>
    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:20 }}>
      {AVATARS.slice(0,2).map(a=>(
        <div key={a.id} onClick={()=>setData({...data, avatar:a.id})}
          style={{ background:data.avatar===a.id?T.primary:T.card, borderRadius:16, padding:"20px 10px", textAlign:"center", cursor:"pointer", boxShadow:T.shadow, border:`2px solid ${data.avatar===a.id?T.primary:"transparent"}` }}>
          <div style={{ fontSize:44 }}>{a.emoji}</div>
          <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:700, fontSize:14, color:data.avatar===a.id?"#fff":T.dark, marginTop:6 }}>{a.label}</div>
        </div>
      ))}
    </div>
    <EmojiPinPicker value={data.emojiPin||[]} onChange={pin=>setData({...data, emojiPin:pin})} label="Emoji Sifreniz 🔒"/>
    <Btn onClick={()=>onNext()} disabled={!data.name||!data.avatar||!data.emojiPin}>Devam →</Btn>
  </Screen>;
}

function AddChildScreen({ onNext, onBack, data, setData }) {
  const [cn, setCn] = useState("");
  const [ca, setCa] = useState("");
  const [cv, setCv] = useState("");
  const [cp, setCp] = useState([]);
  const add = () => {
    if (!cn || !ca || !cv || !cp || cp.length < 4) return;
    setData({...data, children:[...(data.children||[]), {name:cn, age:ca, avatar:cv, emojiPin:cp}]});
    setCn(""); setCa(""); setCv(""); setCp([]);
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
        <EmojiPinPicker value={cp} onChange={setCp} label="Emoji Sifre 🔒"/>
        <Btn variant="ghost" onClick={add} disabled={!cn||!ca||!cv||!cp}>+ Çocuk Ekle</Btn>
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

function LaunchScreen({ data, familyCode, onFinish, onBack }) {
  const theme = MAP_THEMES.find(t=>t.id===data.mapTheme);
  return <Screen>
    <BackBtn onBack={onBack}/>
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
  const [addingParent, setAddingParent] = useState(false);
  const [p2name, setP2name] = useState("");
  const [p2avatar, setP2avatar] = useState("");
  const [p2pin, setP2pin] = useState([]);
  const [pinTarget, setPinTarget] = useState(null);

  const members = [
    { id:"parent", emoji:AVATARS.find(a=>a.id===data.avatar)?.emoji||"👩", name:data.name||"Ebeveyn", role:"Ebeveyn", ownerKey:"parent", emojiPin:data.emojiPin||[] },
    ...((data.children||[]).map((c,i)=>({
      id:`child_${i}`, emoji:AVATARS.find(a=>a.id===c.avatar)?.emoji||"👧",
      name:c.name, role:`${c.age} yas`, ownerKey:"child", childIndex:i, emojiPin:c.emojiPin||[],
    }))),
    ...(data.parent2 ? [{
      id:"parent2", emoji:AVATARS.find(a=>a.id===data.parent2.avatar)?.emoji||"👨",
      name:data.parent2.name, role:"Ebeveyn", ownerKey:"parent", emojiPin:data.parent2.emojiPin||[],
    }] : []),
  ];

  if(pinTarget) {
    return <EmojiPinEntry
      member={pinTarget}
      onSuccess={()=>{ onSelect(pinTarget); setPinTarget(null); }}
      onBack={()=>setPinTarget(null)}
    />;
  }

  return <div style={{ minHeight:"100vh", background:T.anatoliaBg, display:"flex", flexDirection:"column", justifyContent:"center", padding:"32px 22px" }}>
    <div style={{ textAlign:"center", marginBottom:32 }}>
      <div style={{ fontSize:60, marginBottom:8 }}>👋</div>
      <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:900, fontSize:28, color:T.dark }}>Kim oynuyor?</div>
      <div style={{ color:T.muted, fontSize:14, marginTop:6 }}>Seç ve emoji sifrenle giriş yap 🔒</div>
      <div style={{ marginTop:10, background:"rgba(255,107,53,0.1)", borderRadius:99, padding:"4px 14px", display:"inline-block", fontFamily:"'Nunito',sans-serif", fontSize:12, fontWeight:700, color:T.primary }}>
        Aile kodu: {familyCode}
      </div>
    </div>
    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
      {members.map(m=>(
        <div key={m.id} onClick={()=>setPinTarget(m)}
          style={{ background:T.card, borderRadius:22, padding:"18px 20px", cursor:"pointer", boxShadow:T.shadow, display:"flex", alignItems:"center", gap:16, border:"2px solid #E8DDD0" }}
          onMouseDown={e=>e.currentTarget.style.transform="scale(0.97)"}
          onMouseUp={e=>e.currentTarget.style.transform="scale(1)"}>
          <div style={{ fontSize:48, background:"#FFF3E8", borderRadius:99, width:64, height:64, display:"flex", alignItems:"center", justifyContent:"center", border:"2px solid #e8cfa0" }}>{m.emoji}</div>
          <div style={{ flex:1 }}>
            <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:900, fontSize:18, color:T.dark }}>{m.name}</div>
            <div style={{ fontFamily:"'Nunito',sans-serif", fontSize:13, color:T.muted }}>{m.role}</div>
          </div>
          <div style={{ fontSize:18 }}>🔒→</div>
        </div>
      ))}

      {!data.parent2 && !addingParent && (
        <div onClick={()=>setAddingParent(true)}
          style={{ background:"#F0EAE2", borderRadius:22, padding:"18px 20px", cursor:"pointer", display:"flex", alignItems:"center", gap:16, border:"2px dashed #D0C0A8" }}>
          <div style={{ fontSize:48, background:"#E8DDD0", borderRadius:99, width:64, height:64, display:"flex", alignItems:"center", justifyContent:"center" }}>➕</div>
          <div style={{ flex:1 }}>
            <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:900, fontSize:16, color:T.muted }}>2. Ebeveyn Ekle</div>
            <div style={{ fontFamily:"'Nunito',sans-serif", fontSize:13, color:"#C0B0A0" }}>Anne veya baba olarak katıl</div>
          </div>
        </div>
      )}

      {addingParent && (
        <div style={{ background:T.card, borderRadius:22, padding:"20px", boxShadow:T.shadow, border:"2px solid #e8cfa0" }}>
          <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:900, fontSize:16, color:T.dark, marginBottom:14 }}>2. Ebeveyn Bilgileri</div>
          <input type="text" placeholder="Adın nedir?" value={p2name} onChange={e=>setP2name(e.target.value)}
            style={{...inputStyle, marginBottom:14}}/>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:14 }}>
            {AVATARS.slice(0,2).map(a=>(
              <div key={a.id} onClick={()=>setP2avatar(a.id)}
                style={{ background:p2avatar===a.id?T.primary:T.card, borderRadius:16, padding:"16px 10px", textAlign:"center", cursor:"pointer", border:`2px solid ${p2avatar===a.id?T.primary:"#E0D6CC"}` }}>
                <div style={{ fontSize:40 }}>{a.emoji}</div>
                <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:700, fontSize:13, color:p2avatar===a.id?"#fff":T.dark, marginTop:6 }}>{a.label}</div>
              </div>
            ))}
          </div>
          <EmojiPinPicker value={p2pin} onChange={setP2pin} label="Emoji Sifre 🔒"/>
          <div style={{ display:"flex", gap:10 }}>
            <Btn onClick={()=>{
              if(!p2name||!p2avatar||!p2pin) return;
              const p2 = {name:p2name, avatar:p2avatar, emojiPin:p2pin};
              set(ref(db, `families/${familyCode}`), {...data, parent2:p2, familyCode});
              onSelect({id:"parent2", emoji:AVATARS.find(a=>a.id===p2avatar)?.emoji||"👨", name:p2name, role:"Ebeveyn", ownerKey:"parent", emojiPin:p2pin});
            }} disabled={!p2name||!p2avatar||!p2pin} style={{ flex:2 }}>Katıl →</Btn>
            <Btn variant="ghost" onClick={()=>setAddingParent(false)} style={{ flex:1 }}>İptal</Btn>
          </div>
        </div>
      )}
    </div>
  </div>;
}

// ── BOTTOM SHEET (swipe-to-close destekli) ────────────────────────────────────
function BottomSheet({ onClose, children, maxHeight="82vh" }) {
  const [startY, setStartY] = useState(null);
  const [dragY, setDragY] = useState(0);
  const sheetRef = useRef(null);

  const onTouchStart = e => setStartY(e.touches[0].clientY);
  const onTouchMove = e => {
    if(startY === null) return;
    const dy = e.touches[0].clientY - startY;
    if(dy > 0) setDragY(dy);
  };
  const onTouchEnd = () => {
    if(dragY > 80) onClose();
    setDragY(0);
    setStartY(null);
  };

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.6)", display:"flex", alignItems:"flex-end", justifyContent:"center", zIndex:150 }}
      onClick={e=>{ if(e.target===e.currentTarget) onClose(); }}>
      <div ref={sheetRef}
        onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}
        style={{ background:T.bg, borderRadius:"24px 24px 0 0", width:"100%", maxWidth:390, maxHeight, display:"flex", flexDirection:"column", transform:`translateY(${dragY}px)`, transition:dragY===0?"transform 0.2s":"none" }}>
        {/* Drag handle */}
        <div style={{ padding:"12px 20px 0", flexShrink:0 }}>
          <div style={{ width:40, height:4, borderRadius:99, background:"#D0C8BE", margin:"0 auto" }}/>
        </div>
        {children}
      </div>
    </div>
  );
}
// ── MÜZİK (Web Audio API) ─────────────────────────────────────────────────────
function useGameMusic() {
  const ctxRef = useRef(null);
  const intervalRef = useRef(null);

  const play = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      ctxRef.current = ctx;
      // Neşeli çocuk melodisi - tekrarlayan döngü
      const melody = [523,659,784,880,784,659,523,587,659,523,659,784,880,784,659,587];
      let beat = 0;
      const playNote = () => {
        if(!ctxRef.current) return;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        osc.type = "triangle";
        osc.frequency.value = melody[beat % melody.length];
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.18);
        osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.2);
        beat++;
      };
      playNote();
      intervalRef.current = setInterval(playNote, 220);
    } catch(e) {}
  };

  const stop = () => {
    clearInterval(intervalRef.current);
    try { if(ctxRef.current) { ctxRef.current.close(); ctxRef.current = null; } } catch(e) {}
  };

  return { play, stop };
}

const MEMORY_CARDS = [
  {id:1,emoji:"🌟"},{id:2,emoji:"🎈"},{id:3,emoji:"🦁"},{id:4,emoji:"🍕"},
  {id:5,emoji:"🚀"},{id:6,emoji:"🌈"},{id:7,emoji:"🐶"},{id:8,emoji:"🎮"},
];

function MiniGameModal({ onClose, onWin, forceGame, onGameSelect }) {
  const GAMES = [
    {id:"hunt",    emoji:"⚡", name:"Esya Avı",          desc:"60 sn evden renk avı!"},
    {id:"balloon", emoji:"🎈", name:"Senkronize Balon",  desc:"İkisi aynı anda bassın!"},
    {id:"freeze",  emoji:"🎵", name:"Don-Ates Müzikali", desc:"Müzik durunca donun!"},
    {id:"memory",  emoji:"🧠", name:"Hafıza Kartları",   desc:"Eslesenleri bul!"},
    {id:"nolaughing",emoji:"😐",name:"Gülmeme Challenge",desc:"Gülen kaybeder!"},
  ];

  const [selectedGame, setSelectedGame] = useState(forceGame||null);
  const [game, setGame] = useState(forceGame||null);
  const [phase, setPhase] = useState("select"); // select | intro | playing | won | lost
  const [timeLeft, setTimeLeft] = useState(60);

  // Eşya avı
  const [target] = useState(()=>{
    const T2=[
      {emoji:"🔴",hint:"Kırmızı renkli bir esya"},
      {emoji:"🔵",hint:"Mavi renkli bir esya"},
      {emoji:"🟡",hint:"Sarı renkli bir esya"},
      {emoji:"🟢",hint:"Yesil renkli bir esya"},
      {emoji:"⚪",hint:"Beyaz renkli bir esya"},
    ];
    return T2[Math.floor(Math.random()*T2.length)];
  });

  // Senkronize balon
  const [balloonSize, setBalloonSize] = useState(40);
  const [p1, setP1] = useState(false);
  const [p2, setP2] = useState(false);

  // Don-Ates
  const [musicOn, setMusicOn] = useState(false);
  const [frozen, setFrozen] = useState(false);
  const [freezeTimer, setFreezeTimer] = useState(10);
  const music = useGameMusic();

  // Hafıza kartları
  const [cards, setCards] = useState(()=>{
    const doubled = [...MEMORY_CARDS,...MEMORY_CARDS].map((c,i)=>({...c,uid:i,flipped:false,matched:false}));
    return doubled.sort(()=>Math.random()-0.5);
  });
  const [flipped, setFlipped] = useState([]);
  const [matchCount, setMatchCount] = useState(0);

  // Gülmeme
  const [laughTimer, setLaughTimer] = useState(60);

  useEffect(()=>{
    if(phase!=="playing") return;
    let iv;
    if(game==="hunt"||game==="nolaughing"){
      let t = game==="hunt"?60:60;
      iv=setInterval(()=>{ t--; if(game==="hunt") setTimeLeft(t); else setLaughTimer(t); if(t<=0){clearInterval(iv);setPhase(game==="nolaughing"?"won":"lost");} },1000);
    }
    if(game==="balloon"){
      let s=40;
      iv=setInterval(()=>{ s+=2; setBalloonSize(s); if(s>=200){clearInterval(iv);setPhase("lost");} },120);
    }
    if(game==="freeze"){
      // Müzik çal, rastgele 5-12 sn sonra durdur
      const dur = (5+Math.random()*7)*1000;
      music.play();
      setMusicOn(true);
      const t=setTimeout(()=>{
        music.stop();
        setMusicOn(false);
        setFrozen(true);
        let c=10;
        iv=setInterval(()=>{ c--; setFreezeTimer(c); if(c<=0){clearInterval(iv);setPhase("won");} },1000);
      },dur);
      return ()=>{ clearTimeout(t); clearInterval(iv); music.stop(); };
    }
    return ()=>clearInterval(iv);
  },[phase,game]);

  useEffect(()=>{ if(p1&&p2) setPhase("won"); },[p1,p2]);

  // Hafıza kartı tıklama
  const flipCard = (uid) => {
    if(flipped.length===2) return;
    const card = cards.find(c=>c.uid===uid);
    if(!card||card.flipped||card.matched) return;
    const newCards = cards.map(c=>c.uid===uid?{...c,flipped:true}:c);
    setCards(newCards);
    const newFlipped = [...flipped, {uid, id:card.id}];
    setFlipped(newFlipped);
    if(newFlipped.length===2){
      if(newFlipped[0].id===newFlipped[1].id){
        setTimeout(()=>{
          setCards(prev=>prev.map(c=>newFlipped.some(f=>f.uid===c.uid)?{...c,matched:true}:c));
          const nm = matchCount+1;
          setMatchCount(nm);
          if(nm===MEMORY_CARDS.length) setPhase("won");
          setFlipped([]);
        },400);
      } else {
        setTimeout(()=>{
          setCards(prev=>prev.map(c=>newFlipped.some(f=>f.uid===c.uid)?{...c,flipped:false}:c));
          setFlipped([]);
        },800);
      }
    }
  };

  const startGame = (g) => {
    setGame(g);
    setPhase("intro");
    if(onGameSelect) onGameSelect(g); // Firebase'e yaz  -  herkes görsün
  };

  const gameName = GAMES.find(g=>g.id===game)?.name||"";

  return (
    <BottomSheet onClose={onClose} maxHeight="88vh">
      {/* Header */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"12px 20px 10px", flexShrink:0, borderBottom:"1px solid #F0E8DC" }}>
        <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:900, fontSize:17, color:T.dark }}>
          {phase==="select" ? "Mini Oyun Seç ⚡" : gameName}
        </div>
        <div style={{ display:"flex", gap:8 }}>
          {phase!=="select" && (
            <button onClick={()=>{setPhase("select");setGame(null);setFlipped([]);setMatchCount(0);setP1(false);setP2(false);}}
              style={{ background:"#F0E8DC", border:"none", borderRadius:99, padding:"6px 14px", fontFamily:"'Nunito',sans-serif", fontWeight:800, fontSize:12, cursor:"pointer", color:T.muted }}>
              ← Geri
            </button>
          )}
          <button onClick={onClose} style={{ background:"#F0E8DC", border:"none", borderRadius:99, width:34, height:34, fontSize:16, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>✕</button>
        </div>
      </div>

      <div style={{ flex:1, overflowY:"auto", padding:"0 20px 40px" }}>

          {/* OYUN SEÇİM EKRANI */}
          {phase==="select" && (
            <div style={{ display:"flex", flexDirection:"column", gap:12, paddingTop:8 }}>
              {GAMES.map(g=>(
                <div key={g.id} onClick={()=>startGame(g.id)}
                  style={{ background:T.card, borderRadius:18, padding:"16px 18px", cursor:"pointer", display:"flex", alignItems:"center", gap:14, boxShadow:T.shadow, border:"2px solid #E8DDD0" }}
                  onMouseDown={e=>e.currentTarget.style.transform="scale(0.97)"}
                  onMouseUp={e=>e.currentTarget.style.transform="scale(1)"}>
                  <div style={{ fontSize:36, minWidth:44, textAlign:"center" }}>{g.emoji}</div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:900, fontSize:15, color:T.dark }}>{g.name}</div>
                    <div style={{ fontFamily:"'Nunito',sans-serif", fontSize:12, color:T.muted, marginTop:2 }}>{g.desc}</div>
                  </div>
                  <div style={{ color:T.primary, fontSize:18 }}>→</div>
                </div>
              ))}
            </div>
          )}

          {/* EŞYA AVI */}
          {game==="hunt"&&<>
            {phase==="intro"&&<div style={{ textAlign:"center", paddingTop:20 }}>
              <div style={{ fontSize:64, marginBottom:12 }}>⚡</div>
              <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:800, fontSize:16, color:T.dark, marginBottom:8 }}>Esya Avı!</div>
              <div style={{ color:T.muted, fontSize:14, marginBottom:24, lineHeight:1.6 }}>60 saniyede evden istenen renkteki esyayı bulup getirin!</div>
              <Btn onClick={()=>setPhase("playing")}>Basla! 🏃</Btn>
            </div>}
            {phase==="playing"&&<div style={{ display:"flex", flexDirection:"column", alignItems:"center", paddingTop:10 }}>
              <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:900, fontSize:72, color:timeLeft<=10?"#DC2626":T.primary, lineHeight:1 }}>{timeLeft}</div>
              <div style={{ background:"linear-gradient(135deg,#FFE8D6,#FFD4B8)", borderRadius:22, padding:"24px 20px", textAlign:"center", width:"100%", marginBottom:20, marginTop:12 }}>
                <div style={{ fontSize:64, marginBottom:8 }}>{target.emoji}</div>
                <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:900, fontSize:20, color:T.dark }}>{target.hint}</div>
                <div style={{ color:T.muted, fontSize:13, marginTop:6 }}>bulup masaya getirin!</div>
              </div>
              <Btn onClick={()=>setPhase("won")}>Bulduk! ✅</Btn>
            </div>}
            {phase==="won"&&<div style={{ textAlign:"center", paddingTop:20 }}>
              <div style={{ fontSize:64, marginBottom:12 }}>🎉</div>
              <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:900, fontSize:22, color:T.secondary, marginBottom:24 }}>Harika is! +1 adım!</div>
              <Btn onClick={()=>{onWin();onClose();}}>+1 Adım Al 🎁</Btn>
            </div>}
            {phase==="lost"&&<div style={{ textAlign:"center", paddingTop:20 }}>
              <div style={{ fontSize:64, marginBottom:12 }}>⏰</div>
              <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:900, fontSize:22, color:T.primary, marginBottom:24 }}>Süre Doldu!</div>
              <Btn variant="ghost" onClick={onClose}>Tamam</Btn>
            </div>}
          </>}

          {/* SENKRONİZE BALON */}
          {game==="balloon"&&<>
            {phase==="intro"&&<div style={{ textAlign:"center", paddingTop:20 }}>
              <div style={{ fontSize:64, marginBottom:12 }}>🎈</div>
              <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:800, fontSize:16, color:T.dark, marginBottom:8 }}>Senkronize Balon!</div>
              <div style={{ color:T.muted, fontSize:14, marginBottom:24, lineHeight:1.6 }}>Balon patlamadan ikisi aynı anda basmalı!</div>
              <Btn onClick={()=>setPhase("playing")}>Hazırız! 🎈</Btn>
            </div>}
            {phase==="playing"&&<div style={{ display:"flex", flexDirection:"column", alignItems:"center", paddingTop:10 }}>
              <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:800, fontSize:13, color:T.muted, marginBottom:8, textAlign:"center" }}>Balon patlamadan ikisi birden basın!</div>
              <div style={{ height:180, display:"flex", alignItems:"center", justifyContent:"center", width:"100%" }}>
                <div style={{ width:balloonSize, height:balloonSize*1.2, background:"radial-gradient(circle at 35% 35%,#ff8080,#FF6B35)", borderRadius:"50% 50% 50% 50% / 60% 60% 40% 40%" }}>🎈</div>
              </div>
              <div style={{ display:"flex", gap:12, width:"100%", marginTop:8 }}>
                <button onPointerDown={()=>setP1(true)} style={{ flex:1, height:70, borderRadius:16, border:"none", background:p1?T.secondary+"88":"#4ECDC422", fontSize:16, cursor:"pointer", fontFamily:"'Nunito',sans-serif", fontWeight:900, color:p1?"#fff":T.secondary }}>{p1?"✓":"BAS!"}</button>
                <button onPointerDown={()=>setP2(true)} style={{ flex:1, height:70, borderRadius:16, border:"none", background:p2?T.primary+"88":"#FF6B3522", fontSize:16, cursor:"pointer", fontFamily:"'Nunito',sans-serif", fontWeight:900, color:p2?"#fff":T.primary }}>{p2?"✓":"BAS!"}</button>
              </div>
            </div>}
            {phase==="won"&&<div style={{ textAlign:"center", paddingTop:20 }}>
              <div style={{ fontSize:64, marginBottom:12 }}>🤝</div>
              <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:900, fontSize:22, color:T.secondary, marginBottom:24 }}>Mükemmel! +1 adım!</div>
              <Btn onClick={()=>{onWin();onClose();}}>+1 Adım Al 🎁</Btn>
            </div>}
            {phase==="lost"&&<div style={{ textAlign:"center", paddingTop:20 }}>
              <div style={{ fontSize:64, marginBottom:12 }}>💥</div>
              <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:900, fontSize:22, color:T.primary, marginBottom:24 }}>Balon Patladı!</div>
              <Btn variant="ghost" onClick={onClose}>Tamam</Btn>
            </div>}
          </>}

          {/* DON-ATES MÜZİKALİ */}
          {game==="freeze"&&<>
            {phase==="intro"&&<div style={{ textAlign:"center", paddingTop:20 }}>
              <div style={{ fontSize:64, marginBottom:12 }}>🎵</div>
              <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:800, fontSize:16, color:T.dark, marginBottom:8 }}>Don-Ates Müzikali!</div>
              <div style={{ color:T.muted, fontSize:14, marginBottom:8, lineHeight:1.6 }}>Müzik çalarken herkes dans eder. Müzik durduğunda ekranda <b>"HEYKEL OL!"</b> yazar.</div>
              <div style={{ color:T.muted, fontSize:14, marginBottom:24 }}>10 saniye boyunca donup kalın. Kıpırdayan tatlı ceza alır!</div>
              <Btn onClick={()=>setPhase("playing")}>Basla! 💃</Btn>
            </div>}
            {phase==="playing"&&<div style={{ textAlign:"center", paddingTop:10 }}>
              {!frozen ? (
                <div>
                  <div style={{ fontSize:80, marginBottom:16, animation:"bounce 0.5s infinite" }}>🎵</div>
                  <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:900, fontSize:28, color:T.primary, marginBottom:8 }}>DANS ET! 💃🕺</div>
                  <div style={{ color:T.muted, fontSize:14, marginBottom:24 }}>Müzik herhangi bir anda duracak...</div>
                  <div style={{ background:"#F0E8DC", borderRadius:14, padding:"12px 16px", color:T.muted, fontSize:12 }}>Müzik durunca otomatik "HEYKEL OL!" ekranı gelecek</div>
                </div>
              ) : (
                <div>
                  <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:900, fontSize:40, color:"#DC2626", marginBottom:8, animation:"none" }}>HEYKEL OL!</div>
                  <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:900, fontSize:80, color:T.dark, lineHeight:1 }}>{freezeTimer}</div>
                  <div style={{ color:T.muted, fontSize:14, marginTop:8 }}>Kıpırdama! 🗿</div>
                </div>
              )}
            </div>}
            {phase==="won"&&<div style={{ textAlign:"center", paddingTop:20 }}>
              <div style={{ fontSize:64, marginBottom:12 }}>🏆</div>
              <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:900, fontSize:22, color:T.secondary, marginBottom:8 }}>Harika dondiniz!</div>
              <div style={{ color:T.muted, fontSize:14, marginBottom:16 }}>Kıpırdayan var mıydı? Varsa tatlı ceza alsın!</div>
              <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                <Btn onClick={()=>{onWin();onClose();}}>Kimse kıpırdamadı! +1 Adım 🎁</Btn>
                <Btn variant="ghost" onClick={onClose}>Kıpırdayan vardı (tatlı ceza)</Btn>
              </div>
            </div>}
          </>}

          {/* HAFIZA KARTLARI */}
          {game==="memory"&&<>
            {phase==="intro"&&<div style={{ textAlign:"center", paddingTop:20 }}>
              <div style={{ fontSize:64, marginBottom:12 }}>🧠</div>
              <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:800, fontSize:16, color:T.dark, marginBottom:8 }}>Hafıza Kartları!</div>
              <div style={{ color:T.muted, fontSize:14, marginBottom:24, lineHeight:1.6 }}>Kartları çevirin, eslesenleri bulun. Tüm çiftleri bulan aile +1 adım kazanır!</div>
              <Btn onClick={()=>setPhase("playing")}>Basla! 🧠</Btn>
            </div>}
            {phase==="playing"&&<div style={{ paddingTop:10 }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:12, alignItems:"center" }}>
                <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:800, fontSize:14, color:T.muted }}>{matchCount}/{MEMORY_CARDS.length} eslesme</div>
                <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:900, fontSize:14, color:T.primary }}>{MEMORY_CARDS.length-matchCount} kaldı</div>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:8 }}>
                {cards.map(card=>(
                  <div key={card.uid} onClick={()=>flipCard(card.uid)}
                    style={{ height:72, borderRadius:14, display:"flex", alignItems:"center", justifyContent:"center", cursor:card.matched?"default":"pointer", background:card.matched?"linear-gradient(135deg,#d4efdf,#82e0aa)":card.flipped?T.card:"linear-gradient(135deg,#FF6B35,#FF8C42)", border:card.matched?"2px solid #1E8449":"2px solid transparent", fontSize:card.flipped||card.matched?32:0, transition:"all 0.2s", boxShadow:T.shadow }}>
                    {(card.flipped||card.matched)?card.emoji:""}
                  </div>
                ))}
              </div>
            </div>}
            {phase==="won"&&<div style={{ textAlign:"center", paddingTop:20 }}>
              <div style={{ fontSize:64, marginBottom:12 }}>🧠</div>
              <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:900, fontSize:22, color:T.secondary, marginBottom:24 }}>Tüm eslesmeleri buldunuz! +1 adım!</div>
              <Btn onClick={()=>{onWin();onClose();}}>+1 Adım Al 🎁</Btn>
            </div>}
          </>}

          {/* GÜLMEME CHALLENGE */}
          {game==="nolaughing"&&<>
            {phase==="intro"&&<div style={{ textAlign:"center", paddingTop:20 }}>
              <div style={{ fontSize:64, marginBottom:12 }}>😐</div>
              <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:800, fontSize:16, color:T.dark, marginBottom:8 }}>Gülmeme Challenge!</div>
              <div style={{ color:T.muted, fontSize:14, marginBottom:8, lineHeight:1.6 }}>Karşılıklı oturun, birbirinizin gözlerine bakın. Konusmak serbest ama gülmek yasak!</div>
              <div style={{ color:T.muted, fontSize:14, marginBottom:24 }}>60 saniye boyunca gülen kaybeder ve tatlı ceza alır!</div>
              <Btn onClick={()=>setPhase("playing")}>Basla! 😐</Btn>
            </div>}
            {phase==="playing"&&<div style={{ textAlign:"center", paddingTop:10 }}>
              <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:900, fontSize:80, color:laughTimer<=10?"#DC2626":T.dark, lineHeight:1, marginBottom:8 }}>{laughTimer}</div>
              <div style={{ fontSize:48, marginBottom:16 }}>😐</div>
              <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:800, fontSize:20, color:T.dark, marginBottom:8 }}>GÜLME!</div>
              <div style={{ color:T.muted, fontSize:14, marginBottom:24 }}>Birbirinizin gözlerine bakın...</div>
              <div style={{ display:"flex", gap:10 }}>
                <Btn onClick={()=>setPhase("won")} style={{ flex:1 }}>60 sn doldu! Kimse gülmedi 🏆</Btn>
              </div>
              <div style={{ marginTop:10 }}>
                <Btn variant="ghost" onClick={()=>setPhase("lost")}>Güldü! Tatlı ceza 😂</Btn>
              </div>
            </div>}
            {phase==="won"&&<div style={{ textAlign:"center", paddingTop:20 }}>
              <div style={{ fontSize:64, marginBottom:12 }}>🏆</div>
              <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:900, fontSize:22, color:T.secondary, marginBottom:24 }}>Demir yüzlüler! +1 adım!</div>
              <Btn onClick={()=>{onWin();onClose();}}>+1 Adım Al 🎁</Btn>
            </div>}
            {phase==="lost"&&<div style={{ textAlign:"center", paddingTop:20 }}>
              <div style={{ fontSize:64, marginBottom:12 }}>😂</div>
              <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:900, fontSize:22, color:T.primary, marginBottom:8 }}>Güldü!</div>
              <div style={{ color:T.muted, fontSize:14, marginBottom:24 }}>Gülen kisi tatlı ceza alıyor!</div>
              <Btn variant="ghost" onClick={onClose}>Tamam</Btn>
            </div>}
          </>}

        </div>
      </div>
    </BottomSheet>
  );
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
  return (
    <BottomSheet onClose={onClose} maxHeight="85vh">
      {/* Header */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"12px 20px 10px", flexShrink:0, borderBottom:"1px solid #F0E8DC" }}>
        <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:900, fontSize:17, color:T.dark }}>
          {sel ? sel.label : "Tatlı Ceza 🎁"}
        </div>
        <button onClick={onClose} style={{ background:"#F0E8DC", border:"none", borderRadius:99, width:34, height:34, fontSize:16, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>✕</button>
      </div>
      <div style={{ flex:1, overflowY:"auto" }}>
      {!sel ? (
        <div style={{ padding:"16px 20px 32px" }}>
          <div style={{ textAlign:"center", marginBottom:16 }}>
            <div style={{ fontSize:48, marginBottom:6 }}>🎁</div>
            <div style={{ color:T.muted, fontSize:14 }}>Bir kategori seç!</div>
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            {cats.map((cat,i)=>(
              <div key={i} onClick={()=>pick(cat)}
                style={{ background:cat.bg, borderRadius:18, padding:"16px 18px", cursor:"pointer", display:"flex", alignItems:"center", gap:14, boxShadow:T.shadow }}>
                <div style={{ fontSize:32 }}>{cat.emoji}</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:900, fontSize:15, color:T.dark }}>{cat.label}</div>
                  <div style={{ fontFamily:"'Nunito',sans-serif", fontSize:12, color:T.muted, marginTop:2 }}>{cat.items.length} farklı sürpriz</div>
                </div>
                <div style={{ color:cat.color, fontSize:18 }}>→</div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div style={{ padding:"20px 22px 40px", textAlign:"center" }}>
          <div style={{ fontSize:72, marginBottom:12 }}>{item?.emoji}</div>
          <div style={{ background:sel.bg, borderRadius:20, padding:"20px 18px", marginBottom:20 }}>
            <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:800, fontSize:17, color:T.dark, lineHeight:1.4 }}>{item?.text}</div>
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            <Btn onClick={onClose}>Görevi Kabul Et! 🤝</Btn>
            <Btn variant="ghost" onClick={()=>{setSel(null);setItem(null);}}>← Kategori Değistir</Btn>
          </div>
        </div>
      )}
      </div>
    </BottomSheet>
  );
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
  return <BottomSheet onClose={onClose} maxHeight="88vh">
      {/* Header */}
      <div style={{ padding:"12px 20px 10px", display:"flex", alignItems:"center", justifyContent:"space-between", flexShrink:0, borderBottom:"1px solid #F0E8DC" }}>
        <div>
          <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:900, fontSize:18, color:T.dark }}>Görev Havuzu</div>
          <div style={{ color:T.muted, fontSize:12, marginTop:1 }}>{TASK_POOL.length} hazır görev</div>
        </div>
        <button onClick={onClose} style={{ background:"#F0E8DC", border:"none", borderRadius:99, width:34, height:34, fontSize:16, cursor:"pointer" }}>✕</button>
      </div>
      <div style={{ padding:"10px 20px 0", flexShrink:0 }}>
        <div style={{ background:T.card, borderRadius:14, border:"2px solid #E8DDD0", display:"flex", alignItems:"center", gap:10, padding:"10px 14px" }}>
          <span style={{ fontSize:18, opacity:0.5 }}>🔍</span>
          <input placeholder="Görev ara..." value={search} onChange={e=>setSearch(e.target.value)}
            style={{ border:"none", outline:"none", fontSize:15, fontFamily:"'Nunito',sans-serif", fontWeight:700, color:T.dark, flex:1, background:"transparent" }}/>
        </div>
      </div>
      <div style={{ display:"flex", gap:8, padding:"10px 20px 0", overflowX:"auto", flexShrink:0 }}>
        {[{id:"all",label:"Tümü",emoji:"⭐",color:T.primary},{id:"child",label:"Çocuk",emoji:"👧",color:"#4ECDC4"},{id:"parent",label:"Ebeveyn",emoji:"👩",color:"#FF6B35"},{id:"family",label:"Aile",emoji:"👨‍👩‍👧",color:"#A855F7"}].map(c=>(
          <div key={c.id} onClick={()=>setCat(c.id)}
            style={{ background:cat===c.id?c.color:T.card, borderRadius:99, padding:"7px 14px", fontSize:13, fontFamily:"'Nunito',sans-serif", fontWeight:800, color:cat===c.id?"#fff":T.muted, cursor:"pointer", whiteSpace:"nowrap", border:`2px solid ${cat===c.id?c.color:"#E8DDD0"}`, flexShrink:0 }}>
            {c.emoji} {c.label}
          </div>
        ))}
      </div>
      <div style={{ flex:1, overflowY:"auto", padding:"10px 20px 32px" }}>
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
  </BottomSheet>;
}

// ── PUSULA / ZAR ──────────────────────────────────────────────────────────────
// Zar yüzü SVG  -  gösterilen nokta sayısı ile sayı tutarlı
function DiceFace({ n }) {
  const dots = {
    1: [[50,50]],
    2: [[25,25],[75,75]],
    3: [[25,25],[50,50],[75,75]],
    4: [[25,25],[75,25],[25,75],[75,75]],
    5: [[25,25],[75,25],[50,50],[25,75],[75,75]],
    6: [[25,22],[75,22],[25,50],[75,50],[25,78],[75,78]],
  };
  return <svg width="90" height="90" viewBox="0 0 100 100">
    <rect x="5" y="5" width="90" height="90" rx="16" fill="white" stroke="#ddd" strokeWidth="2"/>
    {(dots[n]||dots[1]).map(([cx,cy],i)=>(
      <circle key={i} cx={cx} cy={cy} r="8" fill="#2D2D2D"/>
    ))}
  </svg>;
}

function CompassModal({ onSpin, onClose, movement }) {
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState(null);
  const spin = () => {
    setSpinning(true);
    setTimeout(()=>{ setResult(Math.floor(Math.random()*6)+1); setSpinning(false); },1200);
  };
  return <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.55)", display:"flex", alignItems:"flex-end", justifyContent:"center", zIndex:100 }}>
    <div style={{ background:T.bg, borderRadius:"24px 24px 0 0", padding:"24px 24px 40px", width:"100%", maxWidth:390 }}>
      {/* Başlık  -  ayrı satırda, net okunur */}
      <div style={{ textAlign:"center", marginBottom:20 }}>
        <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:900, fontSize:24, color:T.dark }}>
          {movement==="compass" ? "Pusula Çevir! 🧭" : "Zar At! 🎲"}
        </div>
        <div style={{ fontFamily:"'Nunito',sans-serif", fontSize:13, color:T.muted, marginTop:4 }}>
          {result ? `${result} adım ilerliyorsun!` : "Düğmeye bas ve sans dene!"}
        </div>
      </div>

      {/* Görsel */}
      <div style={{ display:"flex", justifyContent:"center", marginBottom:20 }}>
        {movement==="compass" ? (
          <div style={{ fontSize:90, animation:spinning?"spin 0.3s linear infinite":"none", display:"inline-block" }}>🧭</div>
        ) : (
          result && !spinning ? (
            <DiceFace n={result}/>
          ) : (
            <div style={{ fontSize:90, animation:spinning?"spin 0.4s linear infinite":"none", display:"inline-block" }}>🎲</div>
          )
        )}
      </div>

      {/* Sonuç kutusu */}
      {result && !spinning && (
        <div style={{ background:`linear-gradient(135deg,${T.primary},#FF8C42)`, borderRadius:20, padding:"16px 24px", marginBottom:20, textAlign:"center" }}>
          <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:900, fontSize:52, color:"#fff" }}>{result}</div>
          <div style={{ color:"rgba(255,255,255,0.9)", fontSize:15, fontWeight:700 }}>adım ilerliyorsun! 🎉</div>
        </div>
      )}

      {/* Butonlar */}
      <div style={{ display:"flex", gap:10 }}>
        {!result ? (
          <Btn onClick={spin} style={{ flex:1 }} disabled={spinning}>
            {spinning ? "..." : movement==="compass" ? "Çevir!" : "At!"}
          </Btn>
        ) : (
          <Btn onClick={()=>{onSpin(result);onClose();}} style={{ flex:1 }}>Haritada İlerle →</Btn>
        )}
        <Btn variant="ghost" onClick={onClose} style={{ flex:0, padding:"15px 18px", width:"auto" }}>✕</Btn>
      </div>
    </div>
  </div>;
}

// ── ROZET KAZANMA MODALI ──────────────────────────────────────────────────────
function BadgeModal({ badge, onClose }) {
  return <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.65)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:200, padding:24 }}>
    <div style={{ background:"linear-gradient(135deg,#1a0533,#3d0d6e)", borderRadius:28, padding:"36px 28px", width:"100%", maxWidth:340, textAlign:"center", border:"2px solid rgba(255,215,0,0.4)" }}>
      <div style={{ fontSize:80, marginBottom:8, animation:"bounce 0.6s ease" }}>{badge.emoji}</div>
      <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:900, fontSize:14, color:"#FFD700", marginBottom:6, letterSpacing:1 }}>ROZET KAZANDIN!</div>
      <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:900, fontSize:24, color:"#fff", marginBottom:8 }}>{badge.name}</div>
      <div style={{ fontFamily:"'Nunito',sans-serif", fontSize:15, color:"rgba(255,255,255,0.8)", marginBottom:28 }}>{badge.desc}</div>
      <button onClick={onClose} style={{ width:"100%", padding:"14px", borderRadius:16, border:"none", background:"linear-gradient(135deg,#FFD700,#FFA500)", color:"#1a0533", fontFamily:"'Nunito',sans-serif", fontWeight:900, fontSize:16, cursor:"pointer" }}>
        Harika! 🎉
      </button>
    </div>
  </div>;
}

// ── HARİTA (çok kullanıcı, zoom, tam kaydırma) ────────────────────────────────
function MapGrid({ positions, myKey, members, mapThemeId }) {
  const [zoom, setZoom] = useState(1);
  const CELL = zoom === 1 ? 52 : 32;
  const GAP  = zoom === 1 ? 6  : 4;
  const COLS = 10;

  // Her karedeki üyeler
  const memberPositions = {};
  Object.entries(positions||{}).forEach(([key, pos])=>{
    if(!memberPositions[pos]) memberPositions[pos] = [];
    const m = members.find(m=>m.id===key);
    if(m) memberPositions[pos].push(m);
  });

  const myPos = positions?.[myKey] ?? 0;
  const badges = THEME_BADGES[mapThemeId] || THEME_BADGES.anatolia;

  // Benim avatarım
  const me = members.find(m=>m.id===myKey);

  return <div>
    <div style={{ display:"flex", gap:8, marginBottom:10, justifyContent:"flex-end" }}>
      <button onClick={()=>setZoom(1)} style={{ background:zoom===1?T.primary:"#F0E8DC", border:"none", borderRadius:99, padding:"6px 14px", fontFamily:"'Nunito',sans-serif", fontWeight:800, fontSize:12, color:zoom===1?"#fff":T.muted, cursor:"pointer" }}>Normal</button>
      <button onClick={()=>setZoom(0.6)} style={{ background:zoom===0.6?T.primary:"#F0E8DC", border:"none", borderRadius:99, padding:"6px 14px", fontFamily:"'Nunito',sans-serif", fontWeight:800, fontSize:12, color:zoom===0.6?"#fff":T.muted, cursor:"pointer" }}>Tümü</button>
    </div>

    <div style={{ overflowX:"auto", overflowY:"auto", maxHeight: zoom===1 ? 320 : 480, borderRadius:16, border:"2px solid #E8DDD0" }}>
      <div style={{ display:"grid", gridTemplateColumns:`repeat(${COLS},${CELL}px)`, gap:GAP, padding:GAP, width:"fit-content" }}>
        {Array.from({length:TOTAL},(_,n)=>{
          const isMyPos = n === myPos;
          const special = SPECIAL[n];
          const isBadge = BADGE_SQUARES.includes(n+1);
          const badge = isBadge ? badges[BADGE_SQUARES.indexOf(n+1)] : null;
          const membersHere = memberPositions[n] || [];
          const othersHere = membersHere.filter(m=>m.id!==myKey);
          const lm = LANDMARKS[n % LANDMARKS.length];
          const anyoneHere = membersHere.length > 0;

          return <div key={n} style={{
            width:CELL, height:CELL, borderRadius: zoom===1?12:8,
            background: isMyPos
              ? "linear-gradient(135deg,#FF6B35,#FF8C42)"
              : anyoneHere
                ? "linear-gradient(135deg,#e8f5ff,#c5e8ff)"
                : special==="surprise"
                  ? "linear-gradient(135deg,#fff3e0,#ffe0b2)"
                  : special==="mini-game"
                    ? "linear-gradient(135deg,#e8f5e9,#c8e6c9)"
                    : isBadge
                      ? "linear-gradient(135deg,#f3e8ff,#e0c8ff)"
                      : n < myPos
                        ? "linear-gradient(135deg,#c8a97a,#b8905a)"
                        : "linear-gradient(135deg,#f5e6d0,#eedcb8)",
            border: isMyPos ? "2.5px solid #FF6B35"
              : anyoneHere ? "2px solid #5BB8F5"
              : special ? "2px dashed #C0392B"
              : isBadge ? "2px solid #A855F7"
              : "1.5px solid #d4b896",
            display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
            position:"relative", flexShrink:0,
            boxShadow: isMyPos ? "0 3px 12px rgba(255,107,53,0.5)" : anyoneHere ? "0 2px 8px rgba(91,184,245,0.4)" : "none",
          }}>
            {/* Benim avatarım  -  animasyonlu */}
            {isMyPos ? (
              <div style={{ fontSize:zoom===1?22:14, animation:"bounce 1s infinite", lineHeight:1 }}>{me?.emoji||"🧭"}</div>
            ) : othersHere.length > 0 ? (
              // Başka biri bu karede
              <div style={{ fontSize:zoom===1?18:11, lineHeight:1 }}>{othersHere[0].emoji}</div>
            ) : special==="surprise" ? (
              <div style={{ fontSize:zoom===1?18:11 }}>🎁</div>
            ) : special==="mini-game" ? (
              <div style={{ fontSize:zoom===1?18:11 }}>⚡</div>
            ) : isBadge ? (
              <div style={{ fontSize:zoom===1?18:11 }}>{badge?.emoji}</div>
            ) : (
              <div style={{ fontSize:zoom===1?14:9, opacity: n<myPos?1:0.55 }}>{lm}</div>
            )}

            {/* Kare no */}
            <div style={{ position:"absolute", bottom:1, right:2, fontSize:zoom===1?8:5, fontFamily:"'Nunito',sans-serif", fontWeight:800, color:isMyPos?"#fff": n<myPos?"#7a5a2a":"#b09060", opacity:0.8 }}>{n+1}</div>

            {/* Hem ben hem başkası aynı karede */}
            {isMyPos && othersHere.length > 0 && (
              <div style={{ position:"absolute", top:1, left:2, fontSize:zoom===1?9:6 }}>{othersHere[0].emoji}</div>
            )}
            {/* Birden fazla başkası */}
            {!isMyPos && membersHere.length > 1 && (
              <div style={{ position:"absolute", top:1, right:2, fontFamily:"'Nunito',sans-serif", fontWeight:900, fontSize:zoom===1?8:6, color:"#fff", background:"#5BB8F5", borderRadius:99, padding:"0 3px" }}>{membersHere.length}</div>
            )}
          </div>;
        })}
      </div>
    </div>

    {/* Legend  -  üyeleri göster */}
    <div style={{ display:"flex", gap:8, marginTop:10, flexWrap:"wrap", alignItems:"center" }}>
      {members.map((m,i)=>(
        <div key={i} style={{ display:"flex", alignItems:"center", gap:4, background:m.id===myKey?"#FFF3E0":"#F0F0F0", borderRadius:99, padding:"3px 8px", border:`1px solid ${m.id===myKey?T.primary:"#E0E0E0"}` }}>
          <span style={{ fontSize:14 }}>{m.emoji}</span>
          <span style={{ fontFamily:"'Nunito',sans-serif", fontSize:11, color:T.dark, fontWeight:700 }}>{m.name}</span>
          <span style={{ fontFamily:"'Nunito',sans-serif", fontSize:10, color:T.muted }}>{(positions?.[m.id]||0)+1}. kare</span>
        </div>
      ))}
      <div style={{ display:"flex", alignItems:"center", gap:4 }}>
        <div style={{ width:12, height:12, borderRadius:3, background:"linear-gradient(135deg,#fff3e0,#ffe0b2)", border:"1px solid #C0392B", flexShrink:0 }}/>
        <span style={{ fontFamily:"'Nunito',sans-serif", fontSize:11, color:T.muted }}>🎁 Sürpriz</span>
      </div>
      <div style={{ display:"flex", alignItems:"center", gap:4 }}>
        <div style={{ width:12, height:12, borderRadius:3, background:"linear-gradient(135deg,#f3e8ff,#e0c8ff)", border:"1px solid #A855F7", flexShrink:0 }}/>
        <span style={{ fontFamily:"'Nunito',sans-serif", fontSize:11, color:T.muted }}>🏅 Rozet</span>
      </div>
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
  const { positions, tasks, memberRights, memberDone, earnedBadges } = globalState;
  const setTasks = v => setGlobalState(s=>({...s, tasks:typeof v==="function"?v(s.tasks):v}));
  const addTask = task => { if(tasks.find(t=>t.id===task.id)) return; setTasks(ts=>[...ts,{...task,done:false}]); };
  const removeTask = id => setTasks(ts=>ts.filter(t=>t.id!==id));
  const toggleTask = id => setTasks(ts=>ts.map(t=>t.id===id?{...t,done:!t.done}:t));

  const myKey = activeUser?.id||"parent";
  const myOwner = activeUser?.ownerKey||"parent";
  const myRights = memberRights?.[myKey]||0;
  const myDone = memberDone?.[myKey]||false;
  const myPosition = positions?.[myKey]||0;
  const myTasks = tasks.filter(t=>t.owner===myOwner||t.owner==="family");
  const myDoneCount = myTasks.filter(t=>t.done).length;
  const myAllDone = myTasks.length>0&&myDoneCount===myTasks.length;

  // Tüm aile üyeleri listesi (header'da göstermek için)
  const allMembers = [
    {id:"parent", emoji:AVATARS.find(a=>a.id===data.avatar)?.emoji||"👩", name:data.name||"Ebeveyn", ownerKey:"parent"},
    ...((data.children||[]).map((c,i)=>({id:`child_${i}`, emoji:AVATARS.find(a=>a.id===c.avatar)?.emoji||"👧", name:c.name, ownerKey:"child"}))),
    ...(data.parent2?[{id:"parent2", emoji:AVATARS.find(a=>a.id===data.parent2.avatar)?.emoji||"👨", name:data.parent2.name, ownerKey:"parent"}]:[]),
  ];

  const [showCompass, setShowCompass] = useState(false);
  const [showSurprise, setShowSurprise] = useState(false);
  const [showPool, setShowPool] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [showMiniGame, setShowMiniGame] = useState(false);
  const [activeMiniGameId, setActiveMiniGameId] = useState(null); // Firebase'den gelen oyun
  const [showBadge, setShowBadge] = useState(null);
  const [activeTab, setActiveTab] = useState("home");
  const [miniGameBanner, setMiniGameBanner] = useState(null); // "Baba mini oyun başlattı!"

  // Firebase'den aktif mini oyun dinle
  useEffect(()=>{
    if(!familyCode) return;
    const mgRef = ref(db, `families/${familyCode}/activeMiniGame`);
    const unsub = onValue(mgRef, snap=>{
      const val = snap.val();
      if(val && val.startedBy !== myKey) {
        // Başkası başlattı  -  banner göster
        const starter = allMembers.find(m=>m.id===val.startedBy);
        setMiniGameBanner(`${starter?.emoji||"⚡"} ${starter?.name||"Birisi"} mini oyun başlattı!`);
        setTimeout(()=>setMiniGameBanner(null), 4000);
        setActiveMiniGameId(val.gameId);
        setShowMiniGame(true);
      } else if(!val) {
        // Oyun bitti
        setActiveMiniGameId(null);
      }
    });
    return ()=>unsub();
  },[familyCode, myKey]);

  // Mini oyun başlat  -  Firebase'e yaz, herkes görsün
  const startOnlineMiniGame = (gameId) => {
    setActiveMiniGameId(gameId);
    setShowMiniGame(true);
    set(ref(db, `families/${familyCode}/activeMiniGame`), { gameId, startedBy: myKey, startedAt: Date.now() });
  };

  // Mini oyun kapat  -  Firebase'i temizle
  const closeMiniGame = () => {
    setShowMiniGame(false);
    setActiveMiniGameId(null);
    set(ref(db, `families/${familyCode}/activeMiniGame`), null);
  };

  const progressPct = Math.round((myPosition/TOTAL)*100);
  const parentAvatar = AVATARS.find(a=>a.id===data.avatar);
  const mapTheme = MAP_THEMES.find(t=>t.id===data.mapTheme)||MAP_THEMES[0];
  const themeBadges = THEME_BADGES[data.mapTheme]||THEME_BADGES.anatolia;

  const claimRight = () => {
    if(!myAllDone||myDone) return;
    setGlobalState(s=>({...s, memberRights:{...s.memberRights,[myKey]:(s.memberRights?.[myKey]||0)+1}, memberDone:{...s.memberDone,[myKey]:true}}));
  };

  const handleSpin = steps => {
    const newPos = Math.min(myPosition+steps, TOTAL-1);
    const newPositions = {...(positions||{}), [myKey]: newPos};
    const myBadges = earnedBadges?.[myKey]||[];

    // Rozet kontrolü  -  yeni konuma gelince rozet kazanıldı mı?
    let earnedBadge = null;
    const badgeIdx = BADGE_SQUARES.indexOf(newPos+1);
    if(badgeIdx !== -1 && !myBadges.includes(badgeIdx)) {
      earnedBadge = themeBadges[badgeIdx];
      const newBadges = {...(earnedBadges||{}), [myKey]: [...myBadges, badgeIdx]};
      setGlobalState(s=>({
        ...s,
        positions: newPositions,
        earnedBadges: newBadges,
        memberRights:{...s.memberRights,[myKey]:Math.max(0,(s.memberRights?.[myKey]||0)-1)},
        memberDone:{...s.memberDone,[myKey]:false},
        tasks:s.tasks.map(t=>({...t,done:false})),
      }));
    } else {
      setGlobalState(s=>({
        ...s,
        positions: newPositions,
        memberRights:{...s.memberRights,[myKey]:Math.max(0,(s.memberRights?.[myKey]||0)-1)},
        memberDone:{...s.memberDone,[myKey]:false},
        tasks:s.tasks.map(t=>({...t,done:false})),
      }));
    }

    if(newPos===TOTAL-1) setTimeout(()=>setShowCelebration(true),600);
    else if(SPECIAL[newPos]==="surprise") setTimeout(()=>setShowSurprise(true),400);
    else if(SPECIAL[newPos]==="mini-game") setTimeout(()=>setShowMiniGame(true),400);
    else if(earnedBadge) setTimeout(()=>setShowBadge(earnedBadge),400);
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
          <div style={{ background:"#fff8", borderRadius:99, padding:"5px 10px", fontFamily:"'Nunito',sans-serif", fontWeight:800, fontSize:12, color:T.dark }}>📍 {myPosition+1}/{TOTAL}</div>
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
        <span style={{ fontFamily:"'Nunito',sans-serif", fontSize:11, color:"#8a6a3a", fontWeight:700 }}>%{progressPct} ({myPosition+1}. kare)</span>
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
            {allMembers.map((m,i)=>(
              <div key={i} style={{ background:"#fff", borderRadius:14, padding:"10px 12px", textAlign:"center", border:`2px solid ${m.id===myKey?"#FF6B35":"#e8cfa0"}`, minWidth:70 }}>
                <div style={{ fontSize:28 }}>{m.emoji}</div>
                <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:800, fontSize:12, color:T.dark, marginTop:2 }}>{m.name}</div>
                <div style={{ fontFamily:"'Nunito',sans-serif", fontSize:10, color:T.muted }}>{(positions?.[m.id]||0)+1}. kare</div>
                <div style={{ marginTop:4, background:"#fff3e0", borderRadius:99, padding:"2px 6px", fontSize:10, fontWeight:800, color:T.primary }}>
                  {(memberRights?.[m.id]||0)>0?`${memberRights[m.id]}x ${data.movement==="compass"?"🧭":"🎲"}`:"Görev bekliyor"}
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
          <div style={{ fontFamily:"'Nunito',sans-serif", fontSize:12, color:"rgba(255,255,255,0.7)", marginTop:4 }}>{TOTAL-myPosition-1} kare kaldı</div>
          {/* Sadece ebeveyn görebilir */}
          {activeUser?.ownerKey==="parent" && (
            <div style={{ marginTop:12, display:"flex", gap:8, justifyContent:"center" }}>
              <div onClick={()=>setShowCelebration(true)}
                style={{ background:"rgba(255,255,255,0.15)", borderRadius:99, padding:"5px 14px", fontFamily:"'Nunito',sans-serif", fontSize:11, color:"rgba(255,255,255,0.7)", cursor:"pointer" }}>
                finale önizle
              </div>
              <div onClick={()=>{ if(window.confirm("Sezonu sıfırlamak istediğine emin misin? Tüm ilerleme sıfırlanır.")) { setGlobalState({position:0, tasks:DEFAULT_TASKS, memberRights:{}, memberDone:{}}); }}}
                style={{ background:"rgba(255,255,255,0.15)", borderRadius:99, padding:"5px 14px", fontFamily:"'Nunito',sans-serif", fontSize:11, color:"rgba(255,255,255,0.7)", cursor:"pointer" }}>
                sezonu sıfırla 🔄
              </div>
            </div>
          )}
        </div>
      </>}

      {activeTab==="map"&&<>
        <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:900, fontSize:18, color:T.dark, marginBottom:4 }}>{mapTheme.icon} {mapTheme.name} Haritası</div>
        <p style={{ color:T.muted, fontSize:13, marginBottom:10 }}>Herkes kendi karesinde  -  tümünü görmek için "Tümü"ye bas</p>
        {/* Test butonları */}
        <div style={{ display:"flex", gap:10, marginBottom:14 }}>
          <div onClick={()=>setShowMiniGame(true)} style={{ flex:1, background:"linear-gradient(135deg,#FFE8D6,#FFD4B8)", borderRadius:14, padding:"10px 14px", display:"flex", alignItems:"center", gap:8, cursor:"pointer" }}>
            <span style={{ fontSize:22 }}>⚡</span>
            <div>
              <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:800, fontSize:13, color:T.dark }}>Mini Oyun</div>
              <div style={{ fontSize:11, color:T.muted }}>5 oyun var</div>
            </div>
          </div>
          <div onClick={()=>setShowSurprise(true)} style={{ flex:1, background:"linear-gradient(135deg,#f3e8ff,#e0c8ff)", borderRadius:14, padding:"10px 14px", display:"flex", alignItems:"center", gap:8, cursor:"pointer" }}>
            <span style={{ fontSize:22 }}>🎁</span>
            <div>
              <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:800, fontSize:13, color:T.dark }}>Tatlı Ceza</div>
              <div style={{ fontSize:11, color:T.muted }}>Sürpriz test</div>
            </div>
          </div>
        </div>
        <MapGrid
          positions={positions||{}}
          myKey={myKey}
          members={allMembers}
          mapThemeId={data.mapTheme||"anatolia"}
        />
        <div style={{ marginTop:16, background:T.card, borderRadius:16, padding:"14px 16px", boxShadow:T.shadow }}>
          <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:900, fontSize:13, color:T.primary, marginBottom:8 }}>KONUM BİLGİSİ</div>
          {allMembers.map((m,i)=>(
            <div key={i} style={{ display:"flex", justifyContent:"space-between", padding:"6px 0", borderBottom:i<allMembers.length-1?"1px solid #F0E8DC":"none" }}>
              <span style={{ fontFamily:"'Nunito',sans-serif", fontSize:13, color:T.muted }}>{m.emoji} {m.name}</span>
              <span style={{ fontFamily:"'Nunito',sans-serif", fontSize:13, fontWeight:800, color:m.id===myKey?T.primary:T.dark }}>{(positions?.[m.id]||0)+1}. kare</span>
            </div>
          ))}
          <div style={{ display:"flex", justifyContent:"space-between", padding:"6px 0 0" }}>
            <span style={{ fontFamily:"'Nunito',sans-serif", fontSize:13, color:T.muted }}>Tahmini bitisim</span>
            <span style={{ fontFamily:"'Nunito',sans-serif", fontSize:13, fontWeight:800, color:T.dark }}>~{Math.ceil((TOTAL-myPosition)/4)} gün</span>
          </div>
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
          <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:900, fontSize:16, color:T.dark, margin:"20px 0 12px" }}>⚙️ Ayarlar</div>
          <div style={{ background:T.card, borderRadius:18, padding:"16px 18px", boxShadow:T.shadow, marginBottom:16 }}>
            <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:800, fontSize:14, color:T.dark, marginBottom:12 }}>İlerleme Yöntemi</div>
            <div style={{ display:"flex", gap:10 }}>
              {[
                {id:"compass", emoji:"🧭", label:"Pusula"},
                {id:"dice",    emoji:"🎲", label:"Zar"},
              ].map(opt=>(
                <div key={opt.id} onClick={()=>{
                  if(activeUser?.ownerKey!=="parent") return;
                  const updated = {...data, movement:opt.id};
                  set(ref(db, `families/${familyCode}`), {...updated, familyCode});
                }}
                  style={{ flex:1, padding:"14px 8px", borderRadius:14, textAlign:"center", cursor:activeUser?.ownerKey==="parent"?"pointer":"not-allowed", background:data.movement===opt.id?T.primary:"#F0E8DC", border:`2px solid ${data.movement===opt.id?T.primary:"transparent"}`, opacity:activeUser?.ownerKey==="parent"?1:0.6 }}>
                  <div style={{ fontSize:28 }}>{opt.emoji}</div>
                  <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:800, fontSize:13, color:data.movement===opt.id?"#fff":T.dark, marginTop:4 }}>{opt.label}</div>
                  {data.movement===opt.id&&<div style={{ fontFamily:"'Nunito',sans-serif", fontSize:10, color:"rgba(255,255,255,0.8)", marginTop:2 }}>Aktif ✓</div>}
                </div>
              ))}
            </div>
            {activeUser?.ownerKey!=="parent"&&<p style={{ fontFamily:"'Nunito',sans-serif", fontSize:12, color:T.muted, marginTop:8, textAlign:"center" }}>Sadece ebeveyn degistirebilir</p>}
          </div>
          <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:900, fontSize:16, color:T.dark, margin:"20px 0 12px" }}>Ay Özeti 📊</div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:16 }}>
            {[
              {emoji:"✅", label:"Toplam Görev", val:members.reduce((s,m)=>s+m.totalDone,0), color:T.secondary},
              {emoji:"📍", label:"Harita Konumum", val:`${myPosition+1}. kare`, color:T.primary},
              {emoji:"🔥", label:"En Uzun Seri",  val:`${Math.max(...members.map(m=>m.streak))} gün`, color:"#F97316"},
              {emoji:"⏳", label:"Kalan Kare",    val:TOTAL-myPosition-1, color:"#A855F7"},
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

    {/* Mini oyun banner bildirimi */}
    {miniGameBanner && (
      <div style={{ position:"fixed", top:80, left:"50%", transform:"translateX(-50%)", zIndex:400, background:"linear-gradient(135deg,#FF6B35,#FF8C42)", borderRadius:16, padding:"12px 20px", boxShadow:"0 8px 24px rgba(255,107,53,0.4)", maxWidth:340, width:"90%" }}>
        <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:900, fontSize:14, color:"#fff", textAlign:"center" }}>⚡ {miniGameBanner}</div>
        <div style={{ fontFamily:"'Nunito',sans-serif", fontSize:12, color:"rgba(255,255,255,0.85)", textAlign:"center", marginTop:2 }}>Mini oyun ekranı açılıyor...</div>
      </div>
    )}

    {/* Modals */}
    {showCompass&&<CompassModal movement={data.movement} onSpin={handleSpin} onClose={()=>setShowCompass(false)}/>}
    {showSurprise&&<SurpriseModal onClose={()=>setShowSurprise(false)}/>}
    {showPool&&<TaskPoolModal activeTasks={tasks} onAdd={addTask} onClose={()=>setShowPool(false)}/>}
    {showCelebration&&<CelebrationScreen data={data} onNewSeason={()=>{setShowCelebration(false);onNewSeason();}}/>}
    {showMiniGame&&<MiniGameModal
      forceGame={activeMiniGameId}
      onClose={closeMiniGame}
      onGameSelect={startOnlineMiniGame}
      onWin={()=>{
        const newPos = Math.min(myPosition+1, TOTAL-1);
        setGlobalState(s=>({...s, positions:{...(s.positions||{}), [myKey]:newPos}}));
      }}
    />}
    {showBadge&&<BadgeModal badge={showBadge} onClose={()=>setShowBadge(null)}/>}
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
  const [globalState, setGlobalStateLocal] = useState(DEFAULT_GAME_STATE);

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
    // Kod council bittikten sonra launch'a geçmeden önce üret
    if(currentStep==="council" && !familyCode) {
      const code = makeCode();
      setFamilyCode(code);
    }
    setStep(s=>s+1);
  };
  const back = ()=>setStep(s=>Math.max(0,s-1));

  const handleFinishOnboarding = async () => {
    const code = familyCode || makeCode();
    if(!familyCode) setFamilyCode(code);
    localStorage.setItem("lb_familyCode", code);
    await set(ref(db, `families/${code}`), {
      ...formData,
      familyCode: code,
      createdAt: Date.now(),
    });
    const initState = { positions:{}, tasks:DEFAULT_TASKS, memberRights:{}, memberDone:{}, earnedBadges:{} };
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
    const initState = { positions:{}, tasks:DEFAULT_TASKS, memberRights:{}, memberDone:{}, earnedBadges:{} };
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
      {currentStep==="launch"       &&<LaunchScreen data={formData} familyCode={familyCode||"..."} onFinish={handleFinishOnboarding} onBack={back}/>}
    </div></>
  );
}
