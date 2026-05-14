"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

const HEBREW_DAYS = ["א'","ב'","ג'","ד'","ה'","ו'","ז'","ח'","ט'","י'","י\"א","י\"ב","י\"ג","י\"ד","ט\"ו","ט\"ז","י\"ז","י\"ח","י\"ט","כ'","כ\"א","כ\"ב","כ\"ג","כ\"ד","כ\"ה","כ\"ו","כ\"ז","כ\"ח","כ\"ט","ל'"];
const HEBREW_MONTHS = ["תשרי","חשון","כסלו","טבת","שבט","אדר","אדר א׳","אדר ב׳","ניסן","אייר","סיון","תמוז","אב","אלול"];
const HEBREW_YEARS = ["תש\"כ","תשכ\"א","תשכ\"ב","תשכ\"ג","תשכ\"ד","תשכ\"ה","תשכ\"ו","תשכ\"ז","תשכ\"ח","תשכ\"ט","תש\"ל","תשל\"א","תשל\"ב","תשל\"ג","תשל\"ד","תשל\"ה","תשל\"ו","תשל\"ז","תשל\"ח","תשל\"ט","תש\"מ","תשמ\"א","תשמ\"ב","תשמ\"ג","תשמ\"ד","תשמ\"ה","תשמ\"ו","תשמ\"ז","תשמ\"ח","תשמ\"ט","תש\"נ","תשנ\"א","תשנ\"ב","תשנ\"ג","תשנ\"ד","תשנ\"ה","תשנ\"ו","תשנ\"ז","תשנ\"ח","תשנ\"ט","תש\"ס","תשס\"א","תשס\"ב","תשס\"ג","תשס\"ד","תשס\"ה","תשס\"ו","תשס\"ז","תשס\"ח","תשס\"ט","תש\"ע","תשע\"א","תשע\"ב","תשע\"ג","תשע\"ד","תשע\"ה","תשע\"ו","תשע\"ז","תשע\"ח","תשע\"ט","תש\"פ","תשפ\"א","תשפ\"ב","תשפ\"ג","תשפ\"ד","תשפ\"ה","תשפ\"ו","תשפ\"ז"];
const YAHRZEIT_RELATIONS = ["אבא","אמא","סבא","סבתא","אח","אחות","בן זוג","חבר קרוב","רב","אחר"];

interface HebrewDate { day: string; month: string; year: string; }
interface Child {
  firstName: string; lastName: string; gender: string;
  birthdayGregorian: string; hasHebrew: boolean; hebrew: HebrewDate;
}
interface Yahrzeit {
  name: string; relation: string; dateGregorian: string;
  hasHebrew: boolean; hebrew: HebrewDate;
}

const emptyHebrew = (): HebrewDate => ({ day: "", month: "", year: "" });
const emptyChild = (): Child => ({ firstName: "", lastName: "", gender: "", birthdayGregorian: "", hasHebrew: false, hebrew: emptyHebrew() });
const emptyYahrzeit = (): Yahrzeit => ({ name: "", relation: "", dateGregorian: "", hasHebrew: false, hebrew: emptyHebrew() });

const input = "w-full border border-gray-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-[#511C24]/30 focus:border-[#511C24] bg-white transition";
const sel = "w-full border border-gray-200 rounded-xl px-3 py-3 text-base focus:outline-none focus:ring-2 focus:ring-[#511C24]/30 focus:border-[#511C24] bg-white transition";
const lbl = "block text-sm font-medium text-gray-700 mb-1.5";
const card = "bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-5";

function HebrewDateFields({ value, onChange }: { value: HebrewDate; onChange: (v: HebrewDate) => void }) {
  return (
    <div className="grid grid-cols-3 gap-2 mt-2">
      <div>
        <label className="text-xs text-gray-500 block mb-1">יום</label>
        <select value={value.day} onChange={e => onChange({ ...value, day: e.target.value })} className={sel}>
          <option value="">בחר</option>
          {HEBREW_DAYS.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>
      <div>
        <label className="text-xs text-gray-500 block mb-1">חודש</label>
        <select value={value.month} onChange={e => onChange({ ...value, month: e.target.value })} className={sel}>
          <option value="">בחר</option>
          {HEBREW_MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
      </div>
      <div>
        <label className="text-xs text-gray-500 block mb-1">שנה</label>
        <select value={value.year} onChange={e => onChange({ ...value, year: e.target.value })} className={sel}>
          <option value="">בחר</option>
          {HEBREW_YEARS.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>
    </div>
  );
}

export default function CommunityForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [gender, setGender] = useState("");
  const [spouseName, setSpouseName] = useState("");

  const [birthdayGregorian, setBirthdayGregorian] = useState("");
  const [hasHebrewBirthday, setHasHebrewBirthday] = useState(false);
  const [hebrewBirthday, setHebrewBirthday] = useState<HebrewDate>(emptyHebrew());

  const [numChildren, setNumChildren] = useState(0);
  const [children, setChildren] = useState<Child[]>([]);
  const [yahrzeits, setYahrzeits] = useState<Yahrzeit[]>([]);

  function handleNumChildren(n: number) {
    const clamped = Math.max(0, Math.min(15, n));
    setNumChildren(clamped);
    setChildren(prev => {
      const next = [...prev];
      while (next.length < clamped) next.push(emptyChild());
      return next.slice(0, clamped);
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
    if (!firstName || !lastName || !phone) {
      setError("שם פרטי, שם משפחה וטלפון הם שדות חובה");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName, lastName, phone, email, address, gender, spouseName,
          birthdayGregorian,
          hebrewDay: hasHebrewBirthday ? hebrewBirthday.day : "",
          hebrewMonth: hasHebrewBirthday ? hebrewBirthday.month : "",
          hebrewYear: hasHebrewBirthday ? hebrewBirthday.year : "",
          children: children.map(c => ({
            firstName: c.firstName,
            lastName: c.lastName || lastName,
            gender: c.gender,
            birthdayGregorian: c.birthdayGregorian,
            hebrewDay: c.hasHebrew ? c.hebrew.day : "",
            hebrewMonth: c.hasHebrew ? c.hebrew.month : "",
            hebrewYear: c.hasHebrew ? c.hebrew.year : "",
          })),
          yahrzeits: yahrzeits.map(y => ({
            name: y.name, relation: y.relation, dateGregorian: y.dateGregorian,
            hebrewDay: y.hasHebrew ? y.hebrew.day : "",
            hebrewMonth: y.hasHebrew ? y.hebrew.month : "",
            hebrewYear: y.hasHebrew ? y.hebrew.year : "",
          })),
        }),
      });
      if (!res.ok) throw new Error();
      router.push("/success");
    } catch {
      setError("אירעה שגיאה בשמירת הנתונים. נסה שוב.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen py-8 px-4">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="text-center mb-8">
          <Image src="/logo.png" alt="חב״ד רמת בית שמש ג׳" width={130} height={165} className="mx-auto mb-4" />
          <h1 className="text-2xl font-bold" style={{ color: "#511C24" }}>שאלון היכרות קהילתי</h1>
          <p className="text-gray-500 text-sm mt-1">קהילת חב״ד רמת בית שמש ג׳</p>
        </div>

        <form onSubmit={handleSubmit}>

          {/* Section 1 */}
          <div className={card}>
            <h2 className="text-lg font-bold mb-5 pb-3 border-b border-gray-100" style={{ color: "#511C24" }}>פרטים אישיים</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={lbl}>שם פרטי *</label>
                <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} className={input} placeholder="ישראל" required />
              </div>
              <div>
                <label className={lbl}>שם משפחה *</label>
                <input type="text" value={lastName} onChange={e => setLastName(e.target.value)} className={input} placeholder="ישראלי" required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <label className={lbl}>טלפון *</label>
                <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className={input} placeholder="050-0000000" required dir="ltr" />
              </div>
              <div>
                <label className={lbl}>כתובת מייל</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} className={input} placeholder="mail@example.com" dir="ltr" />
              </div>
            </div>
            <div className="mt-4">
              <label className={lbl}>כתובת מגורים</label>
              <input type="text" value={address} onChange={e => setAddress(e.target.value)} className={input} placeholder="רחוב, עיר" />
            </div>
            <div className="mt-4">
              <label className={lbl}>מין</label>
              <div className="flex gap-6">
                {["זכר", "נקבה"].map(g => (
                  <label key={g} className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="gender" value={g} checked={gender === g} onChange={() => setGender(g)} className="accent-[#511C24] w-4 h-4" />
                    <span className="text-sm">{g}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="mt-4">
              <label className={lbl}>שם בן / בת זוג</label>
              <input type="text" value={spouseName} onChange={e => setSpouseName(e.target.value)} className={input} placeholder="שם מלא" />
            </div>
          </div>

          {/* Section 2 */}
          <div className={card}>
            <h2 className="text-lg font-bold mb-5 pb-3 border-b border-gray-100" style={{ color: "#511C24" }}>תאריך לידה</h2>
            <div>
              <label className={lbl}>תאריך לידה לועזי</label>
              <input type="date" value={birthdayGregorian} onChange={e => setBirthdayGregorian(e.target.value)} className={input} dir="ltr" />
            </div>
            <label className="flex items-center gap-2 mt-4 cursor-pointer select-none">
              <input type="checkbox" checked={hasHebrewBirthday} onChange={e => setHasHebrewBirthday(e.target.checked)} className="accent-[#511C24] w-4 h-4" />
              <span className="text-sm text-gray-700">יש לי גם תאריך לידה עברי</span>
            </label>
            {hasHebrewBirthday && <HebrewDateFields value={hebrewBirthday} onChange={setHebrewBirthday} />}
          </div>

          {/* Section 3 */}
          <div className={card}>
            <h2 className="text-lg font-bold mb-5 pb-3 border-b border-gray-100" style={{ color: "#511C24" }}>ילדים</h2>
            <div>
              <label className={lbl}>מספר ילדים</label>
              <input type="number" min={0} max={15} value={numChildren} onChange={e => handleNumChildren(parseInt(e.target.value) || 0)} className={`${input} w-28`} />
            </div>
            {children.map((child, i) => (
              <div key={i} className="mt-5 pt-5 border-t border-gray-100">
                <p className="text-sm font-semibold text-gray-400 mb-3">ילד/ה {i + 1}</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={lbl}>שם פרטי</label>
                    <input type="text" value={child.firstName} onChange={e => updateChild(i, "firstName", e.target.value)} className={input} placeholder="שם" />
                  </div>
                  <div>
                    <label className={lbl}>שם משפחה</label>
                    <input type="text" value={child.lastName} onChange={e => updateChild(i, "lastName", e.target.value)} className={input} placeholder={lastName || "משפחה"} />
                  </div>
                </div>
                <div className="mt-3">
                  <label className={lbl}>מין</label>
                  <div className="flex gap-6">
                    {["זכר", "נקבה"].map(g => (
                      <label key={g} className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name={`cg-${i}`} value={g} checked={child.gender === g} onChange={() => updateChild(i, "gender", g)} className="accent-[#511C24] w-4 h-4" />
                        <span className="text-sm">{g}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="mt-3">
                  <label className={lbl}>תאריך לידה לועזי</label>
                  <input type="date" value={child.birthdayGregorian} onChange={e => updateChild(i, "birthdayGregorian", e.target.value)} className={input} dir="ltr" />
                </div>
                <label className="flex items-center gap-2 mt-3 cursor-pointer select-none">
                  <input type="checkbox" checked={child.hasHebrew} onChange={e => updateChild(i, "hasHebrew", e.target.checked)} className="accent-[#511C24] w-4 h-4" />
                  <span className="text-sm text-gray-700">יש תאריך לידה עברי</span>
                </label>
                {child.hasHebrew && <HebrewDateFields value={child.hebrew} onChange={v => updateChild(i, "hebrew", v)} />}
              </div>
            ))}
          </div>

          {/* Section 4 */}
          <div className={card}>
            <h2 className="text-lg font-bold mb-3 pb-3 border-b border-gray-100" style={{ color: "#511C24" }}>יארצייטים</h2>
            <p className="text-sm text-gray-500 mb-4">הוסף יארצייטים של בני משפחה או אנשים קרובים — יתווספו ללוח התאריכים הקהילתי</p>
            {yahrzeits.map((y, i) => (
              <div key={i} className="relative mb-5 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setYahrzeits(prev => prev.filter((_, idx) => idx !== i))} className="absolute top-3 left-0 text-gray-400 hover:text-red-500 text-2xl leading-none">×</button>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={lbl}>שם הנפטר/ת</label>
                    <input type="text" value={y.name} onChange={e => updateYahrzeit(i, "name", e.target.value)} className={input} placeholder="שם מלא" />
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
                  <label className={lbl}>תאריך יארצייט לועזי</label>
                  <input type="date" value={y.dateGregorian} onChange={e => updateYahrzeit(i, "dateGregorian", e.target.value)} className={input} dir="ltr" />
                </div>
                <label className="flex items-center gap-2 mt-3 cursor-pointer select-none">
                  <input type="checkbox" checked={y.hasHebrew} onChange={e => updateYahrzeit(i, "hasHebrew", e.target.checked)} className="accent-[#511C24] w-4 h-4" />
                  <span className="text-sm text-gray-700">יש תאריך יארצייט עברי</span>
                </label>
                {y.hasHebrew && <HebrewDateFields value={y.hebrew} onChange={v => updateYahrzeit(i, "hebrew", v)} />}
              </div>
            ))}
            <button type="button" onClick={() => setYahrzeits(prev => [...prev, emptyYahrzeit()])} className="mt-2 flex items-center gap-2 text-sm font-medium px-4 py-3 rounded-xl border-2 border-dashed border-gray-300 text-gray-500 hover:border-[#511C24] hover:text-[#511C24] transition w-full justify-center">
              <span className="text-lg">+</span> הוסף יארצייט
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-4 text-sm">{error}</div>
          )}

          <button type="submit" disabled={loading} className="w-full py-4 rounded-2xl text-white font-bold text-lg transition disabled:opacity-60 shadow-lg hover:shadow-xl active:scale-[0.99]" style={{ background: loading ? "#aaa" : "linear-gradient(135deg, #511C24 0%, #8E3040 100%)" }}>
            {loading ? "שולח..." : "שלח שאלון"}
          </button>

          <p className="text-center text-xs text-gray-400 mt-4 mb-8">
            הנתונים נשמרים באופן מאובטח ומשמשים לצורכי הקהילה בלבד
          </p>
        </form>
      </div>
    </main>
  );
}
