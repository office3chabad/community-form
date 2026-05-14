"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

const HEBREW_DAYS = ["א'","ב'","ג'","ד'","ה'","ו'","ז'","ח'","ט'","י'","י\"א","י\"ב","י\"ג","י\"ד","ט\"ו","ט\"ז","י\"ז","י\"ח","י\"ט","כ'","כ\"א","כ\"ב","כ\"ג","כ\"ד","כ\"ה","כ\"ו","כ\"ז","כ\"ח","כ\"ט","ל'"];
const HEBREW_MONTHS = ["תשרי","חשון","כסלו","טבת","שבט","אדר","אדר א׳","אדר ב׳","ניסן","אייר","סיון","תמוז","אב","אלול"];
const HEBREW_YEARS = ["תש\"כ","תשכ\"א","תשכ\"ב","תשכ\"ג","תשכ\"ד","תשכ\"ה","תשכ\"ו","תשכ\"ז","תשכ\"ח","תשכ\"ט","תש\"ל","תשל\"א","תשל\"ב","תשל\"ג","תשל\"ד","תשל\"ה","תשל\"ו","תשל\"ז","תשל\"ח","תשל\"ט","תש\"מ","תשמ\"א","תשמ\"ב","תשמ\"ג","תשמ\"ד","תשמ\"ה","תשמ\"ו","תשמ\"ז","תשמ\"ח","תשמ\"ט","תש\"נ","תשנ\"א","תשנ\"ב","תשנ\"ג","תשנ\"ד","תשנ\"ה","תשנ\"ו","תשנ\"ז","תשנ\"ח","תשנ\"ט","תש\"ס","תשס\"א","תשס\"ב","תשס\"ג","תשס\"ד","תשס\"ה","תשס\"ו","תשס\"ז","תשס\"ח","תשס\"ט","תש\"ע","תשע\"א","תשע\"ב","תשע\"ג","תשע\"ד","תשע\"ה","תשע\"ו","תשע\"ז","תשע\"ח","תשע\"ט","תש\"פ","תשפ\"א","תשפ\"ב","תשפ\"ג","תשפ\"ד","תשפ\"ה","תשפ\"ו","תשפ\"ז"];
const YAHRZEIT_RELATIONS = ["אבא","אמא","סבא","סבתא","אח","אחות","בן זוג","חבר קרוב","רב","אחר"];

// Fixed sparkle positions to avoid hydration mismatch
const SPARKLES = [
  { top:"12%", left:"6%",  delay:"0s",    size:"3px" },
  { top:"22%", left:"88%", delay:"0.6s",  size:"2px" },
  { top:"38%", left:"3%",  delay:"1.1s",  size:"4px" },
  { top:"55%", left:"92%", delay:"0.3s",  size:"2px" },
  { top:"70%", left:"7%",  delay:"1.4s",  size:"3px" },
  { top:"80%", left:"85%", delay:"0.8s",  size:"2px" },
  { top:"10%", left:"45%", delay:"1.8s",  size:"2px" },
  { top:"90%", left:"40%", delay:"0.4s",  size:"3px" },
  { top:"48%", left:"95%", delay:"2.1s",  size:"2px" },
  { top:"30%", left:"50%", delay:"1.6s",  size:"2px" },
];

interface HebrewDate { day: string; month: string; year: string; }
interface Child {
  firstName: string; lastName: string; gender: string;
  onlyGregorian: boolean; birthdayGregorian: string; hebrew: HebrewDate;
}
interface Yahrzeit {
  name: string; relation: string;
  onlyGregorian: boolean; dateGregorian: string; hebrew: HebrewDate;
}

const emptyHebrew = (): HebrewDate => ({ day: "", month: "", year: "" });
const emptyChild = (defaultLastName = ""): Child => ({
  firstName: "", lastName: defaultLastName, gender: "",
  onlyGregorian: false, birthdayGregorian: "", hebrew: emptyHebrew(),
});
const emptyYahrzeit = (): Yahrzeit => ({
  name: "", relation: "", onlyGregorian: false, dateGregorian: "", hebrew: emptyHebrew(),
});

const inp = "w-full border border-gray-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-[#511C24]/25 focus:border-[#511C24] bg-white transition-all duration-200";
const sel = "w-full border border-gray-200 rounded-xl px-3 py-3 text-base focus:outline-none focus:ring-2 focus:ring-[#511C24]/25 focus:border-[#511C24] bg-white transition-all duration-200";
const lbl = "block text-sm font-semibold text-gray-700 mb-1.5";
const card = "bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-5 transition-shadow duration-300 hover:shadow-md";
const sectionTitle = "text-xl font-bold text-center mb-6 pb-3 border-b border-gray-100";

function byGender(gender: string, male: string, female: string, neutral: string) {
  if (gender === "זכר") return male;
  if (gender === "נקבה") return female;
  return neutral;
}

function RadioGroup({ name, value, onChange }: { name: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex gap-6 mt-1">
      {["זכר", "נקבה"].map(g => (
        <label key={g} className="flex items-center gap-2.5 cursor-pointer group" onClick={() => onChange(g)}>
          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${value === g ? "border-[#511C24] bg-[#511C24]" : "border-gray-300 group-hover:border-[#511C24]"}`}>
            {value === g && <div className="w-2 h-2 rounded-full bg-white" />}
          </div>
          <span className="text-sm font-medium">{g}</span>
        </label>
      ))}
    </div>
  );
}

function HebrewDateFields({ value, onChange }: { value: HebrewDate; onChange: (v: HebrewDate) => void }) {
  return (
    <div className="grid grid-cols-3 gap-2 mt-2">
      <div>
        <label className="text-xs text-gray-500 block mb-1">יום <span className="text-red-500">*</span></label>
        <select value={value.day} onChange={e => onChange({ ...value, day: e.target.value })} className={sel}>
          <option value="">בחר</option>
          {HEBREW_DAYS.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>
      <div>
        <label className="text-xs text-gray-500 block mb-1">חודש <span className="text-red-500">*</span></label>
        <select value={value.month} onChange={e => onChange({ ...value, month: e.target.value })} className={sel}>
          <option value="">בחר</option>
          {HEBREW_MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
      </div>
      <div>
        <label className="text-xs text-gray-500 block mb-1">שנה</label>
        <select value={value.year} onChange={e => onChange({ ...value, year: e.target.value })} className={sel}>
          <option value="">לא יודע/ת</option>
          {HEBREW_YEARS.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>
    </div>
  );
}

function BirthdaySection({ label = "תאריך לידה", onlyGregorian, setOnlyGregorian, gregorian, setGregorian, hebrew, setHebrew, knowText = "אני יודע/ת רק את התאריך הלועזי" }: {
  label?: string;
  knowText?: string;
  onlyGregorian: boolean; setOnlyGregorian: (v: boolean) => void;
  gregorian: string; setGregorian: (v: string) => void;
  hebrew: HebrewDate; setHebrew: (v: HebrewDate) => void;
}) {
  return (
    <div>
      {!onlyGregorian && (
        <div className="animate-[fadeUp_0.3s_ease_both]">
          <label className={lbl}>{label} עברי <span className="text-red-500">*</span></label>
          <HebrewDateFields value={hebrew} onChange={setHebrew} />
        </div>
      )}
      {onlyGregorian && (
        <div className="animate-[fadeUp_0.3s_ease_both]">
          <label className={lbl}>{label} לועזי <span className="text-red-500">*</span></label>
          <input type="date" value={gregorian} onChange={e => setGregorian(e.target.value)} className={inp} dir="ltr" />
        </div>
      )}
      <label className="flex items-center gap-2 mt-3 cursor-pointer select-none group" onClick={() => setOnlyGregorian(!onlyGregorian)}>
        <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all duration-200 shrink-0 ${onlyGregorian ? "bg-[#511C24] border-[#511C24]" : "border-gray-400 group-hover:border-[#511C24]"}`}>
          {onlyGregorian && <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 10 8"><path d="M1 4l3 3 5-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
        </div>
        <span className="text-sm text-gray-500">{knowText}</span>
      </label>
    </div>
  );
}

function Stepper({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  return (
    <div className="flex items-center gap-5 mt-1">
      <button type="button" onClick={() => onChange(Math.max(0, value - 1))}
        className="w-11 h-11 rounded-full border-2 border-[#511C24] text-[#511C24] font-bold text-xl flex items-center justify-center hover:bg-[#511C24] hover:text-white transition-all duration-200 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
        disabled={value === 0}>−</button>
      <span className="text-3xl font-bold w-8 text-center tabular-nums" style={{ color: "#511C24" }}>{value}</span>
      <button type="button" onClick={() => onChange(Math.min(15, value + 1))}
        className="w-11 h-11 rounded-full border-2 border-[#511C24] text-[#511C24] font-bold text-xl flex items-center justify-center hover:bg-[#511C24] hover:text-white transition-all duration-200 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
        disabled={value === 15}>+</button>
      {value > 0 && <span className="text-sm text-gray-400 animate-[fadeIn_0.3s_ease_both]">{value === 1 ? "ילד/ה אחד/ת" : `${value} ילדים`}</span>}
    </div>
  );
}

export default function CommunityForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState("");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [gender, setGender] = useState("");

  const [noSpouse, setNoSpouse] = useState(false);
  const [spouseName, setSpouseName] = useState("");
  const [spousePhone, setSpousePhone] = useState("");

  const [onlyGregorian, setOnlyGregorian] = useState(false);
  const [birthdayGregorian, setBirthdayGregorian] = useState("");
  const [hebrewBirthday, setHebrewBirthday] = useState<HebrewDate>(emptyHebrew());

  const [numChildren, setNumChildren] = useState(0);
  const [children, setChildren] = useState<Child[]>([]);
  const [yahrzeits, setYahrzeits] = useState<Yahrzeit[]>([]);

  function handleNumChildren(n: number) {
    setNumChildren(n);
    setChildren(prev => {
      const next = [...prev];
      while (next.length < n) next.push(emptyChild(lastName));
      return next.slice(0, n);
    });
  }

  function updateChild(i: number, field: keyof Child, value: unknown) {
    setChildren(prev => prev.map((c, idx) => idx === i ? { ...c, [field]: value } : c));
  }

  function updateYahrzeit(i: number, field: keyof Yahrzeit, value: unknown) {
    setYahrzeits(prev => prev.map((y, idx) => idx === i ? { ...y, [field]: value } : y));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!firstName || !lastName || !phone || !email || !address || !gender) {
      setFormError("נא למלא את כל שדות החובה המסומנים ב-*");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    if (!noSpouse && (!spouseName || !spousePhone)) {
      setFormError("נא למלא שם וטלפון של בן/בת זוג, או לסמן 'אין לי בן/בת זוג'");
      return;
    }
    if (!onlyGregorian && (!hebrewBirthday.day || !hebrewBirthday.month)) {
      setFormError("נא למלא את תאריך הלידה");
      return;
    }
    if (onlyGregorian && !birthdayGregorian) {
      setFormError("נא למלא את תאריך הלידה");
      return;
    }
    for (let i = 0; i < children.length; i++) {
      const c = children[i];
      if (!c.firstName || !c.gender) { setFormError(`נא למלא את כל פרטי ילד/ה ${i + 1}`); return; }
      if (!c.onlyGregorian && (!c.hebrew.day || !c.hebrew.month)) { setFormError(`נא למלא תאריך לידה עברי לילד/ה ${i + 1}`); return; }
      if (c.onlyGregorian && !c.birthdayGregorian) { setFormError(`נא למלא תאריך לידה לילד/ה ${i + 1}`); return; }
    }

    setFormError("");
    setLoading(true);
    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName, lastName, phone, email, address, gender,
          spouseName: noSpouse ? "" : spouseName,
          spousePhone: noSpouse ? "" : spousePhone,
          birthdayGregorian: onlyGregorian ? birthdayGregorian : "",
          hebrewDay: onlyGregorian ? "" : hebrewBirthday.day,
          hebrewMonth: onlyGregorian ? "" : hebrewBirthday.month,
          hebrewYear: onlyGregorian ? "" : hebrewBirthday.year,
          children: children.map(c => ({
            firstName: c.firstName, lastName: c.lastName || lastName, gender: c.gender,
            birthdayGregorian: c.onlyGregorian ? c.birthdayGregorian : "",
            hebrewDay: c.onlyGregorian ? "" : c.hebrew.day,
            hebrewMonth: c.onlyGregorian ? "" : c.hebrew.month,
            hebrewYear: c.onlyGregorian ? "" : c.hebrew.year,
          })),
          yahrzeits: yahrzeits.map(y => ({
            name: y.name, relation: y.relation,
            dateGregorian: y.onlyGregorian ? y.dateGregorian : "",
            hebrewDay: y.onlyGregorian ? "" : y.hebrew.day,
            hebrewMonth: y.onlyGregorian ? "" : y.hebrew.month,
            hebrewYear: y.onlyGregorian ? "" : y.hebrew.year,
          })),
        }),
      });
      if (!res.ok) throw new Error();
      router.push("/success");
    } catch {
      setFormError("אירעה שגיאה בשמירת הנתונים. נסה שוב.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen py-8 px-4">
      <div className="max-w-2xl mx-auto">

        {/* ===== ANIMATED HEADER ===== */}
        <div className="relative overflow-hidden rounded-3xl mb-8 text-white text-center pt-10 pb-9 px-6 animate-[fadeUp_0.7s_ease_both]"
          style={{ background: "linear-gradient(150deg, #1A0810 0%, #3A0F18 30%, #511C24 65%, #7A2B35 100%)" }}>

          {/* Glow orbs */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full pointer-events-none"
            style={{ background: "radial-gradient(circle, rgba(204,127,24,0.22) 0%, transparent 70%)", animation: "glow-pulse 3.5s ease-in-out infinite" }} />
          <div className="absolute top-1/4 right-1/4 w-40 h-40 rounded-full pointer-events-none"
            style={{ background: "radial-gradient(circle, rgba(142,48,64,0.35) 0%, transparent 70%)", animation: "glow-pulse 5s ease-in-out infinite 1s" }} />

          {/* Sparkle dots */}
          {SPARKLES.map((s, i) => (
            <div key={i} className="absolute rounded-full bg-amber-300 pointer-events-none"
              style={{ top: s.top, left: s.left, width: s.size, height: s.size, animation: `twinkle 2.5s ease-in-out infinite ${s.delay}` }} />
          ))}

          {/* Decorative ring behind logo */}
          <div className="relative inline-block mb-2">
            <div className="absolute inset-0 rounded-full pointer-events-none"
              style={{ background: "radial-gradient(circle, rgba(204,127,24,0.3) 30%, transparent 70%)", filter: "blur(12px)", animation: "glow-pulse 2.8s ease-in-out infinite" }} />
            <div style={{ animation: "float 4s ease-in-out infinite" }}>
              <Image src="/logo.png" alt="חב״ד רמת בית שמש ג׳" width={200} height={255}
                className="relative mx-auto drop-shadow-2xl" style={{ filter: "drop-shadow(0 8px 24px rgba(204,127,24,0.35))" }} />
            </div>
          </div>

          {/* Ornamental line */}
          <div className="flex items-center justify-center gap-3 mb-3 mt-1">
            <div className="h-px w-12 bg-amber-400/40" />
            <span style={{ color: "rgba(204,127,24,0.7)", fontSize: "18px" }}>✦</span>
            <div className="h-px w-12 bg-amber-400/40" />
          </div>

          {/* Title */}
          <h1 className="text-3xl font-extrabold tracking-tight animate-[fadeUp_0.6s_0.2s_ease_both] opacity-0 [animation-fill-mode:both]"
            style={{ textShadow: "0 2px 12px rgba(0,0,0,0.4)" }}>
            שאלון היכרות קהילתי
          </h1>
          <p className="mt-2 text-sm font-medium tracking-widest animate-[fadeUp_0.6s_0.4s_ease_both] opacity-0 [animation-fill-mode:both]"
            style={{ color: "rgba(204,127,24,0.85)" }}>
            קהילת חב״ד — רמת בית שמש ג׳
          </p>

          {/* Bottom ornament */}
          <div className="flex items-center justify-center gap-2 mt-4 animate-[fadeIn_0.8s_0.6s_ease_both] opacity-0 [animation-fill-mode:both]">
            <div className="h-px w-8 bg-white/20" />
            <div className="w-1.5 h-1.5 rounded-full bg-amber-400/50" />
            <div className="h-px w-16 bg-white/20" />
            <div className="w-1.5 h-1.5 rounded-full bg-amber-400/50" />
            <div className="h-px w-8 bg-white/20" />
          </div>
        </div>

        <form onSubmit={handleSubmit} noValidate>

          {/* Section 1 — Personal */}
          <div className={`${card} animate-[fadeUp_0.5s_0.1s_ease_both]`}>
            <h2 className={sectionTitle} style={{ color: "#511C24" }}>פרטים אישיים</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={lbl}>שם פרטי <span className="text-red-500">*</span></label>
                <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} className={inp} placeholder="ישראל" />
              </div>
              <div>
                <label className={lbl}>שם משפחה <span className="text-red-500">*</span></label>
                <input type="text" value={lastName} onChange={e => setLastName(e.target.value)} className={inp} placeholder="ישראלי" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <label className={lbl}>טלפון <span className="text-red-500">*</span></label>
                <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className={inp} placeholder="050-0000000" dir="ltr" />
              </div>
              <div>
                <label className={lbl}>כתובת מייל <span className="text-red-500">*</span></label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} className={inp} placeholder="mail@example.com" dir="ltr" />
              </div>
            </div>
            <div className="mt-4">
              <label className={lbl}>כתובת מגורים <span className="text-red-500">*</span></label>
              <input type="text" value={address} onChange={e => setAddress(e.target.value)} className={inp} />
            </div>
            <div className="mt-4">
              <label className={lbl}>מין <span className="text-red-500">*</span></label>
              <RadioGroup name="gender" value={gender} onChange={setGender} />
            </div>
          </div>

          {/* Section 2 — Spouse */}
          <div className={`${card} animate-[fadeUp_0.5s_0.15s_ease_both]`}>
            <h2 className={sectionTitle} style={{ color: "#511C24" }}>
              {byGender(gender, "בת זוג", "בן זוג", "בן / בת זוג")}
            </h2>

            <label className="flex items-center gap-3 mb-4 cursor-pointer select-none group" onClick={() => setNoSpouse(!noSpouse)}>
              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200 shrink-0 ${noSpouse ? "bg-[#511C24] border-[#511C24]" : "border-gray-300 group-hover:border-[#511C24]"}`}>
                {noSpouse && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 10 8"><path d="M1 4l3 3 5-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
              </div>
              <span className="text-sm font-medium text-gray-600">
                {byGender(gender, "אין לי בת זוג", "אין לי בן זוג", "אין לי בן / בת זוג")}
              </span>
            </label>

            {!noSpouse && (
              <div className="grid grid-cols-2 gap-4 animate-[fadeUp_0.3s_ease_both]">
                <div>
                  <label className={lbl}>שם מלא <span className="text-red-500">*</span></label>
                  <input type="text" value={spouseName} onChange={e => setSpouseName(e.target.value)} className={inp} placeholder="שם מלא" />
                </div>
                <div>
                  <label className={lbl}>טלפון <span className="text-red-500">*</span></label>
                  <input type="tel" value={spousePhone} onChange={e => setSpousePhone(e.target.value)} className={inp} placeholder="050-0000000" dir="ltr" />
                </div>
              </div>
            )}
          </div>

          {/* Section 3 — Birthday */}
          <div className={`${card} animate-[fadeUp_0.5s_0.2s_ease_both]`}>
            <h2 className={sectionTitle} style={{ color: "#511C24" }}>תאריך לידה</h2>
            <BirthdaySection
              onlyGregorian={onlyGregorian} setOnlyGregorian={setOnlyGregorian}
              gregorian={birthdayGregorian} setGregorian={setBirthdayGregorian}
              hebrew={hebrewBirthday} setHebrew={setHebrewBirthday}
              knowText={byGender(gender, "אני יודע רק את התאריך הלועזי", "אני יודעת רק את התאריך הלועזי", "אני יודע/ת רק את התאריך הלועזי")}
            />
          </div>

          {/* Section 4 — Children */}
          <div className={`${card} animate-[fadeUp_0.5s_0.25s_ease_both]`}>
            <h2 className={sectionTitle} style={{ color: "#511C24" }}>ילדים</h2>
            <div className="flex flex-col items-center gap-2">
              <label className={lbl}>מספר ילדים</label>
              <Stepper value={numChildren} onChange={handleNumChildren} />
            </div>

            {children.map((child, i) => (
              <div key={i} className="mt-6 animate-[fadeUp_0.35s_ease_both]">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex-1 h-0.5 rounded-full" style={{ background: "linear-gradient(to left, transparent, #511C2433)" }} />
                  <span className="text-xs font-bold tracking-widest px-4 py-1.5 rounded-full text-white whitespace-nowrap"
                    style={{ background: "linear-gradient(135deg, #511C24, #8E3040)" }}>
                    ✦ ילד/ה {i + 1}
                  </span>
                  <div className="flex-1 h-0.5 rounded-full" style={{ background: "linear-gradient(to right, transparent, #511C2433)" }} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={lbl}>שם פרטי <span className="text-red-500">*</span></label>
                    <input type="text" value={child.firstName} onChange={e => updateChild(i, "firstName", e.target.value)} className={inp} placeholder="שם" />
                  </div>
                  <div>
                    <label className={lbl}>שם משפחה <span className="text-red-500">*</span></label>
                    <input type="text" value={child.lastName} onChange={e => updateChild(i, "lastName", e.target.value)} className={inp} placeholder={lastName} />
                  </div>
                </div>
                <div className="mt-3">
                  <label className={lbl}>מין <span className="text-red-500">*</span></label>
                  <RadioGroup name={`cg-${i}`} value={child.gender} onChange={v => updateChild(i, "gender", v)} />
                </div>
                <div className="mt-3">
                  <BirthdaySection
                    label="תאריך לידה"
                    onlyGregorian={child.onlyGregorian} setOnlyGregorian={v => updateChild(i, "onlyGregorian", v)}
                    gregorian={child.birthdayGregorian} setGregorian={v => updateChild(i, "birthdayGregorian", v)}
                    hebrew={child.hebrew} setHebrew={v => updateChild(i, "hebrew", v)}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Section 5 — Yahrzeits */}
          <div className={`${card} animate-[fadeUp_0.5s_0.3s_ease_both]`}>
            <h2 className={sectionTitle} style={{ color: "#511C24" }}>יארצייטים</h2>
            <p className="text-sm text-gray-500 text-center mb-5">
              הוסף יארצייטים של בני משפחה או אנשים קרובים
              <br/><span className="text-xs text-gray-400">יתווספו ללוח התאריכים הקהילתי</span>
            </p>

            {yahrzeits.map((y, i) => (
              <div key={i} className="mb-5 animate-[fadeUp_0.3s_ease_both]">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex-1 h-px bg-gray-200" />
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold tracking-widest text-gray-500 bg-gray-100 px-3 py-1 rounded-full">יארצייט {i + 1}</span>
                    <button type="button" onClick={() => setYahrzeits(prev => prev.filter((_, idx) => idx !== i))}
                      className="text-gray-300 hover:text-red-400 transition-colors duration-200 text-xl leading-none">×</button>
                  </div>
                  <div className="flex-1 h-px bg-gray-200" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={lbl}>שם הנפטר/ת</label>
                    <input type="text" value={y.name} onChange={e => updateYahrzeit(i, "name", e.target.value)} className={inp} placeholder="שם מלא" />
                  </div>
                  <div>
                    <label className={lbl}>קשר</label>
                    <select value={y.relation} onChange={e => updateYahrzeit(i, "relation", e.target.value)} className={sel}>
                      <option value="">בחר</option>
                      {YAHRZEIT_RELATIONS.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                </div>
                <div className="mt-3">
                  <BirthdaySection
                    label="תאריך יארצייט"
                    onlyGregorian={y.onlyGregorian} setOnlyGregorian={v => updateYahrzeit(i, "onlyGregorian", v)}
                    gregorian={y.dateGregorian} setGregorian={v => updateYahrzeit(i, "dateGregorian", v)}
                    hebrew={y.hebrew} setHebrew={v => updateYahrzeit(i, "hebrew", v)}
                  />
                </div>
              </div>
            ))}

            <button type="button" onClick={() => setYahrzeits(prev => [...prev, emptyYahrzeit()])}
              className="mt-2 flex items-center gap-2 text-sm font-semibold px-4 py-3 rounded-xl border-2 border-dashed border-gray-300 text-gray-500 hover:border-[#511C24] hover:text-[#511C24] transition-all duration-200 w-full justify-center group">
              <span className="text-lg group-hover:scale-125 transition-transform duration-200">+</span>
              הוסף יארצייט
            </button>
          </div>

          {formError && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-4 text-sm animate-[fadeUp_0.3s_ease_both]">
              {formError}
            </div>
          )}

          <button type="submit" disabled={loading}
            className="w-full py-4 rounded-2xl text-white font-bold text-lg transition-all duration-200 disabled:opacity-60 shadow-lg hover:shadow-xl active:scale-[0.99] hover:-translate-y-0.5"
            style={{ background: loading ? "#aaa" : "linear-gradient(135deg, #511C24 0%, #8E3040 100%)" }}>
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                שולח...
              </span>
            ) : "שלח שאלון"}
          </button>

          <p className="text-center text-xs text-gray-400 mt-4 mb-8">
            הנתונים נשמרים באופן מאובטח ומשמשים לצורכי הקהילה בלבד
          </p>
        </form>
      </div>
    </main>
  );
}
