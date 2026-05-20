// app/page.tsx
'use client';

import { useState, FormEvent, useEffect, useRef } from 'react';
import { jobFortunes, moneyFortunes, singleLoveFortunes, coupleLoveFortunes, complicatedLoveFortunes, luckyColors, summaryFortunes, guardianDeities, luckyDeities } from './fortuneData';
import { toPng } from 'html-to-image';

// ✅ COMPONENT: SVG วงเวทย์แบบกลมสมบูรณ์
const MagicCircleSvg = () => (
  <svg
    className="w-full h-full text-blue-400 opacity-50 drop-shadow-[0_0_15px_rgba(37,99,235,0.8)]"
    viewBox="0 0 500 500"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    pointerEvents="none"
  >
    {/* วงแหวนขอบนอก */}
    <circle cx="250" cy="250" r="240" strokeWidth="2" />
    <circle cx="250" cy="250" r="225" strokeDasharray="6 12" strokeWidth="3" />
    <circle cx="250" cy="250" r="190" strokeWidth="1" />

    {/* ดาวหกแฉก (Hexagram) */}
    <polygon points="250,60 414.5,345 85.5,345" strokeWidth="2" />
    <polygon points="250,440 85.5,155 414.5,155" strokeWidth="2" />

    {/* วงแหวนด้านใน */}
    <circle cx="250" cy="250" r="110" strokeWidth="2" />
    <circle cx="250" cy="250" r="90" strokeDasharray="10 15" strokeWidth="2" />

    {/* จุดศูนย์กลาง */}
    <circle cx="250" cy="250" r="40" strokeWidth="1" />
    <circle cx="250" cy="250" r="10" fill="currentColor" />

    {/* เส้นแกนพลังงาน 4 ทิศ */}
    <line x1="250" y1="10" x2="250" y2="60" strokeWidth="2" />
    <line x1="250" y1="440" x2="250" y2="490" strokeWidth="2" />
    <line x1="10" y1="250" x2="60" y2="250" strokeWidth="2" />
    <line x1="440" y1="250" x2="490" y2="250" strokeWidth="2" />

    {/* จุดอักขระเวทมนตร์จำลองรอบวงนอก */}
    {Array.from({ length: 12 }).map((_, i) => (
      <circle key={i} cx="250" cy="30" r="5" fill="currentColor" transform={`rotate(${i * 30} 250 250)`} />
    ))}
  </svg>
);
// =========================================================================================

interface FormDataState {
  name: string;
  gender: string;
  relationshipStatus: string;
  birthDay: string;
  birthMonth: string;
  birthYear: string;
  birthTime: string;
}

interface DeityInfo {
  name: string;
  image: string;
  desc?: string;
  element?: string;
  blessing?: string;
}

interface FortuneResult {
  profile: FormDataState;
  scores: { job: number; money: number; love: number; average: number };
  predictions: { job: string; money: string; love: string; summary: string };
  luckyColor: string;
  guardianDeity: DeityInfo;
  luckyDeity: DeityInfo;
  birthDayName: string;
}

const days = Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, '0'));
const months = [
  { val: "01", name: "มกราคม" },
  { val: "02", name: "กุมภาพันธ์" },
  { val: "03", name: "มีนาคม" },
  { val: "04", name: "เมษายน" },
  { val: "05", name: "พฤษภาคม" },
  { val: "06", name: "มิถุนายน" },
  { val: "07", name: "กรกฎาคม" },
  { val: "08", name: "สิงหาคม" },
  { val: "09", name: "กันยายน" },
  { val: "10", name: "ตุลาคม" },
  { val: "11", name: "พฤศจิกายน" },
  { val: "12", name: "ธันวาคม" }
];
const currentYear = new Date().getFullYear();
const years = Array.from({ length: 100 }, (_, i) => currentYear - i); // 100 years back

export default function Home() {
  const [formData, setFormData] = useState<FormDataState>({
    name: '',
    gender: 'ชาย',
    relationshipStatus: 'โสด',
    birthDay: '',
    birthMonth: '',
    birthYear: '',
    birthTime: ''
  });

  const [result, setResult] = useState<FortuneResult | null>(null);
  const [isFormExpanded, setIsFormExpanded] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  const handleDownloadImage = async () => {
    if (!cardRef.current) return;
    try {
      setIsExporting(true);
      
      // ให้เวลาเบราว์เซอร์เตรียมและเรนเดอร์ Element เล็กน้อยเพื่อความชัวร์ (โดยเฉพาะฟอนต์ภาษาไทย Kanit)
      await new Promise((resolve) => setTimeout(resolve, 300));
      
      const dataUrl = await toPng(cardRef.current, {
        cacheBust: true,
        pixelRatio: 2, // เพิ่มความละเอียดเป็นสองเท่า เพื่อความคมชัดแบบ HD
        style: {
          position: 'static',
          transform: 'none',
          left: '0',
          top: '0',
        }
      });
      
      const link = document.createElement('a');
      link.download = `luckyone-fortune-${formData.name || 'card'}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Failed to capture fortune card:', error);
      alert('เกิดข้อผิดพลาดในการบันทึกรูปภาพ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsExporting(false);
    }
  };

  // โหลดข้อมูลโปรไฟล์จาก localStorage เมื่อเปิดเว็บครั้งแรก (Client-side Only เพื่อป้องกัน Hydration Error)
  useEffect(() => {
    try {
      const savedProfile = localStorage.getItem('luckyone_profile');
      if (savedProfile) {
        const parsed = JSON.parse(savedProfile);
        setFormData({
          name: parsed.name || '',
          gender: parsed.gender || 'ชาย',
          relationshipStatus: parsed.relationshipStatus || 'โสด',
          birthDay: parsed.birthDay || '',
          birthMonth: parsed.birthMonth || '',
          birthYear: parsed.birthYear || '',
          birthTime: parsed.birthTime || ''
        });
      }
    } catch (e) {
      console.error("Failed to load profile from localStorage", e);
    }
  }, []);

  const handleCalculate = (e: FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.birthDay || !formData.birthMonth || !formData.birthYear) {
      alert("กรุณากรอกชื่อและวันเกิดด้วยนะจ๊ะ");
      return;
    }

    // 1. ตัดเว้นวรรคส่วนเกินและแปลงเป็นอักษรพิมพ์เล็ก เพื่อให้ค่าดวงชะตามีความเสถียร (Case-insensitive & Space-insensitive)
    const cleanName = formData.name.trim().toLowerCase();

    // 2. ปรับการเปลี่ยนวันใหม่ตามโซนเวลาของเบราว์เซอร์ผู้ใช้งานจริง (เปลี่ยนวันใหม่ตรงเวลาเที่ยงคืนเป๊ะของประเทศไทย)
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const todayStr = `${yyyy}${mm}${dd}`;

    const birthDate = `${formData.birthYear}-${formData.birthMonth}-${formData.birthDay}`;
    const seedString = `${cleanName}-${birthDate}-${formData.birthTime}-${formData.gender}-${formData.relationshipStatus}-${todayStr}`;

    let seedNumber = 0;
    for (let i = 0; i < seedString.length; i++) {
      seedNumber += seedString.charCodeAt(i);
    }

    const jobIdx = seedNumber % jobFortunes.length;
    const moneyIdx = (seedNumber + 3) % moneyFortunes.length;
    
    // เลือกหมวดหมู่ความรักตามสถานะ
    let lovePrediction = "";
    if (formData.relationshipStatus === 'มีคู่แล้ว') {
      lovePrediction = coupleLoveFortunes[seedNumber % coupleLoveFortunes.length];
    } else if (formData.relationshipStatus === 'คนคุย/ไม่ชัดเจน') {
      lovePrediction = complicatedLoveFortunes[seedNumber % complicatedLoveFortunes.length];
    } else {
      lovePrediction = singleLoveFortunes[seedNumber % singleLoveFortunes.length];
    }

    const colorIdx = (seedNumber + 11) % luckyColors.length;
    const summaryIdx = seedNumber % summaryFortunes.length;

    const jobScore = (seedNumber % 51) + 50;
    const moneyScore = ((seedNumber + 2) % 51) + 50;
    const loveScore = ((seedNumber + 4) % 51) + 50;
    const averageScore = Math.round((jobScore + moneyScore + loveScore) / 3);

    // 4. คำนวณวันเกิดในสัปดาห์ (Day of Week) จากวัน-เดือน-ปี ค.ศ. เพื่อหาเทพคุ้มครองประจำชะตา
    const adYear = parseInt(formData.birthYear);
    const birthDateObj = new Date(adYear, parseInt(formData.birthMonth) - 1, parseInt(formData.birthDay));
    const birthDayOfWeek = birthDateObj.getDay(); // 0 = อาทิตย์, 1 = จันทร์, ..., 6 = เสาร์
    const dayNames = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'];
    const guardian = guardianDeities[birthDayOfWeek];

    // 5. คำนวณเทพนำโชคประจำวัน (Daily Lucky Deity) จาก Seed สุ่มรายวัน
    const luckyDeityIdx = (seedNumber + 13) % luckyDeities.length;
    const dailyLucky = luckyDeities[luckyDeityIdx];

    // 6. บันทึกข้อมูลโปรไฟล์ผู้ใช้ลง localStorage ปลอดภัยแบบ Client-side
    try {
      localStorage.setItem('luckyone_profile', JSON.stringify(formData));
    } catch (e) {
      console.error("Failed to save profile to localStorage", e);
    }

    setResult({
      profile: formData,
      scores: { job: jobScore, money: moneyScore, love: loveScore, average: averageScore },
      predictions: {
        job: jobFortunes[jobIdx],
        money: moneyFortunes[moneyIdx],
        love: lovePrediction,
        summary: summaryFortunes[summaryIdx]
      },
      luckyColor: luckyColors[colorIdx],
      guardianDeity: guardian,
      luckyDeity: dailyLucky,
      birthDayName: dayNames[birthDayOfWeek]
    });
    setIsFormExpanded(false);
  };

  return (
    <main
      className="min-h-screen text-slate-100 flex flex-col items-center justify-start md:justify-center p-4 md:p-6 bg-cover bg-center bg-no-repeat bg-fixed relative"
      style={{ backgroundImage: "url('/images/card-bg.png')" }}
    >
      {/* ==================== ⚡ ZONE: ANIMATION 2 (ENERGY FLOW ทอง-ม่วง) ==================== */}
      <div
        className="fixed inset-0 pointer-events-none z-0 mix-blend-screen opacity-30"
        style={{
          background: 'linear-gradient(90deg, transparent, #ffd700, #8a2be2, transparent)',
          backgroundSize: '200% 100%',
          animation: 'energyFlow 25s linear infinite' /* ต้องมี @keyframes energyFlow ในไฟล์ CSS */
        }}
      ></div>

      {/* ==================== ZONE: ANIMATION 1 (PARTICLES) ==================== */}
      <div className="fixed inset-y-0 left-0 w-1/4 pointer-events-none z-10 overflow-hidden">
        <div className="absolute bottom-0 left-[10%] w-2 h-2 bg-purple-400 rounded-full blur-[1px] animate-[floatUp_6s_linear_infinite]"></div>
        <div className="absolute bottom-0 left-[40%] w-3 h-3 bg-amber-300 rounded-full blur-[2px] animate-[floatUp_9s_linear_infinite] delay-200"></div>
        <div className="absolute bottom-0 left-[70%] w-1.5 h-1.5 bg-blue-300 rounded-full blur-[1px] animate-[floatUp_7s_linear_infinite] delay-500"></div>
      </div>
      <div className="fixed inset-y-0 right-0 w-1/4 pointer-events-none z-10 overflow-hidden">
        <div className="absolute bottom-0 right-[15%] w-3 h-3 bg-amber-200 rounded-full blur-[2px] animate-[floatUp_8s_linear_infinite]"></div>
        <div className="absolute bottom-0 right-[45%] w-1.5 h-1.5 bg-purple-400 rounded-full blur-[1px] animate-[floatUp_6s_linear_infinite] delay-300"></div>
        <div className="absolute bottom-0 right-[75%] w-2.5 h-2.5 bg-blue-200 rounded-full blur-[2px] animate-[floatUp_10s_linear_infinite] delay-1000"></div>
      </div>

      {/* ==================== 🔯 ZONE: SPINNING MAGIC CIRCLE & CARD ==================== */}
      <div className={`relative w-full z-20 flex items-start justify-center transition-all duration-500 ${result ? 'max-w-md md:max-w-5xl lg:max-w-6xl' : 'max-w-md'}`}>

        {!result ? (
          <>
            {/* เลเยอร์วงเวทย์เบื้องหลัง */}
            <div className="absolute top-1/2 left-1/2 w-[130%] aspect-square -translate-x-1/2 -translate-y-1/2 pointer-events-none z-0 animate-[spin_200s_linear_infinite] text-blue-400 opacity-60">
              <MagicCircleSvg />
            </div>

            {/* ==================== ตัวกล่องเนื้อหาหลัก (z-10 เพื่อลอยอยู่บนวงเวทย์) ==================== */}
            <div className="relative z-10 w-full bg-slate-950/90 border border-slate-800 rounded-2xl p-6 shadow-[0_0_50px_rgba(0,0,0,0.6)]">
              <h1 className="text-3xl font-extrabold text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 mb-2 drop-shadow-[0_0_15px_rgba(168,85,247,0.4)]">🔮 LuckyOne 🔮</h1>
              <p className="text-center text-sm font-light text-blue-200/80 tracking-wide mb-6">เช็กดวงชะตารายวันและโปรไฟล์ของคุณ</p>

              <form onSubmit={handleCalculate} className="space-y-4 relative z-20">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs uppercase tracking-wider font-semibold mb-1.5 text-blue-300/80">ชื่อของคุณ</label>
                    <input
                      type="text"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-blue-500 text-sm transition-colors"
                      placeholder="กรอกชื่อหรือชื่อเล่น"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider font-semibold mb-1.5 text-blue-300/80">สถานะความรัก</label>
                    <select
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-blue-500 text-sm transition-colors cursor-pointer"
                      value={formData.relationshipStatus}
                      onChange={(e) => setFormData({ ...formData, relationshipStatus: e.target.value })}
                    >
                      <option value="โสด">โสด</option>
                      <option value="มีคู่แล้ว">มีคู่แล้ว</option>
                      <option value="คนคุย/ไม่ชัดเจน">คนคุย/ไม่ชัดเจน</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs uppercase tracking-wider font-semibold mb-1.5 text-blue-300/80">เพศ</label>
                    <select
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-blue-500 text-sm transition-colors cursor-pointer"
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    >
                      <option value="ชาย">ชาย</option>
                      <option value="หญิง">หญิง</option>
                      <option value="LGBTQ+">LGBTQ+</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider font-semibold mb-1.5 text-blue-300/80">เวลาเกิด (ไม่ใส่ก็ได้)</label>
                    <input
                      type="time"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-blue-500 text-sm transition-colors cursor-pointer"
                      value={formData.birthTime}
                      onChange={(e) => setFormData({ ...formData, birthTime: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold mb-1.5 text-blue-300/80">วันเกิดของคุณ</label>
                  <div className="grid grid-cols-3 gap-2">
                    <select
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-2.5 text-white focus:outline-none focus:border-blue-500 text-sm transition-colors cursor-pointer"
                      value={formData.birthDay}
                      onChange={(e) => setFormData({ ...formData, birthDay: e.target.value })}
                    >
                      <option value="">วัน</option>
                      {days.map((d) => (
                        <option key={d} value={d}>{parseInt(d)}</option>
                      ))}
                    </select>

                    <select
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-2.5 text-white focus:outline-none focus:border-blue-500 text-sm transition-colors cursor-pointer"
                      value={formData.birthMonth}
                      onChange={(e) => setFormData({ ...formData, birthMonth: e.target.value })}
                    >
                      <option value="">เดือน</option>
                      {months.map((m) => (
                        <option key={m.val} value={m.val}>{m.name}</option>
                      ))}
                    </select>

                    <select
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-2.5 text-white focus:outline-none focus:border-blue-500 text-sm transition-colors cursor-pointer"
                      value={formData.birthYear}
                      onChange={(e) => setFormData({ ...formData, birthYear: e.target.value })}
                    >
                      <option value="">ปี พ.ศ.</option>
                      {years.map((y) => (
                        <option key={y} value={String(y)}>
                          {y + 543}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full btn-magic text-white font-bold py-3.5 px-4 rounded-xl text-sm cursor-pointer flex items-center justify-center overflow-hidden relative mt-2"
                >
                  <span className="relative z-10 tracking-wider">เปิดไพ่ดูดวงชะตา</span>
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="w-full flex flex-col md:grid md:grid-cols-12 md:gap-4 lg:gap-6 items-start justify-center">

            {/* คอลัมน์ซ้าย (เทพคุ้มครอง + เทพนำโชค) */}
            <div className="md:col-span-4 w-full flex flex-col gap-4 order-2 md:order-1 mt-4 md:mt-0">

              {/* 👑 เทพคุ้มครองประจำชะตา (จากวันเกิดจริง) - ภาพใหญ่ */}
              <div className="bg-gradient-to-br from-amber-950/40 to-slate-900/80 p-5 rounded-xl border border-amber-500/25 shadow-lg relative overflow-hidden transition-all hover:-translate-y-1 hover:shadow-[0_0_25px_rgba(245,158,11,0.25)] duration-300">
                <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/5 via-transparent to-purple-500/5 pointer-events-none"></div>
                <div className="relative z-10 flex flex-col items-center text-center">
                  <div className="text-xs font-bold text-amber-300 mb-3 tracking-wide drop-shadow-[0_0_6px_rgba(245,158,11,0.3)]">👑 เทพคุ้มครองประจำชะตา</div>
                  <img src={result.guardianDeity.image} alt={result.guardianDeity.name} className="w-28 h-28 rounded-full border-3 border-amber-500/50 shadow-[0_0_25px_rgba(245,158,11,0.4)] object-cover mb-3" />
                  <div className="text-base font-extrabold text-amber-200 drop-shadow-[0_0_8px_rgba(245,158,11,0.3)]">{result.guardianDeity.name}</div>
                  <div className="text-[11px] text-amber-300/70 mt-1">เกิดวัน{result.birthDayName} • ธาตุ{result.guardianDeity.element}</div>
                  <p className="text-xs text-slate-300 leading-relaxed mt-2">{result.guardianDeity.desc}</p>
                </div>
              </div>

              {/* ✨ เทพนำโชคประจำวัน - ภาพใหญ่ */}
              <div className="bg-gradient-to-br from-purple-950/40 to-slate-900/80 p-5 rounded-xl border border-purple-500/25 shadow-lg relative overflow-hidden transition-all hover:-translate-y-1 hover:shadow-[0_0_25px_rgba(168,85,247,0.25)] duration-300">
                <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/5 via-transparent to-blue-500/5 pointer-events-none"></div>
                <div className="relative z-10 flex flex-col items-center text-center">
                  <div className="text-xs font-bold text-purple-300 mb-3 tracking-wide drop-shadow-[0_0_6px_rgba(168,85,247,0.3)]">✨ เทพนำโชคประจำวัน</div>
                  <img src={result.luckyDeity.image} alt={result.luckyDeity.name} className="w-28 h-28 rounded-full border-3 border-purple-500/50 shadow-[0_0_25px_rgba(168,85,247,0.4)] object-cover mb-3" />
                  <div className="text-base font-extrabold text-purple-200 drop-shadow-[0_0_8px_rgba(168,85,247,0.3)]">{result.luckyDeity.name}</div>
                  <p className="text-xs text-slate-300 leading-relaxed mt-2">{result.luckyDeity.blessing}</p>
                </div>
              </div>

            </div>

            {/* คอลัมน์กลาง (โปรไฟล์ + แบบฟอร์มกรอกข้อมูลแบบเดิม) */}
            <div className="md:col-span-4 w-full relative order-1 md:order-2">
              {/* เลเยอร์วงเวทย์เบื้องหลังเฉพาะคอลัมน์กลาง */}
              <div className="absolute top-1/2 left-1/2 w-[130%] aspect-square -translate-x-1/2 -translate-y-1/2 pointer-events-none z-0 animate-[spin_200s_linear_infinite] text-blue-400 opacity-60">
                <MagicCircleSvg />
              </div>

              <div className="relative z-10 w-full bg-slate-950/95 border border-slate-800 rounded-2xl p-6 shadow-[0_0_50px_rgba(0,0,0,0.6)] flex flex-col gap-4">
                <div className="bg-blue-950/40 border border-blue-900/50 rounded-xl p-4 text-center">
                  <h2 className="text-lg font-bold text-blue-300">โปรไฟล์ของคุณ {result.profile.name}</h2>
                  <p className="text-xs text-blue-200/80 mt-1">
                    เพศ: {result.profile.gender} | สถานะ: {result.profile.relationshipStatus} <br /> 
                    เกิดวันที่: {parseInt(result.profile.birthDay)} {months.find(m => m.val === result.profile.birthMonth)?.name} พ.ศ. {parseInt(result.profile.birthYear) + 543}
                  </p>
                </div>

                {/* 🔮 การ์ดสรุปดวงชะตาภาพรวมวันนี้ */}
                <div className="bg-gradient-to-br from-slate-900/90 to-blue-950/80 border border-amber-500/30 rounded-xl p-5 shadow-lg relative overflow-hidden group">
                  {/* เอฟเฟกต์แสงวิบวับขอบสีทอง */}
                  <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 via-transparent to-purple-500/10 opacity-30 pointer-events-none"></div>
                  
                  <div className="relative z-10 flex flex-col gap-2.5">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-bold text-amber-300 drop-shadow-[0_0_8px_rgba(245,158,11,0.4)]">🔮 ดวงภาพรวมวันนี้</span>
                      <span className="bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold px-2.5 py-0.5 rounded-full whitespace-nowrap shrink-0">
                        {result.scores.average >= 90 ? 'ดีเลิศที่สุด' : result.scores.average >= 80 ? 'ดีมาก' : result.scores.average >= 70 ? 'ปานกลาง' : 'เน้นมีสติ'}
                      </span>
                    </div>

                    {/* ดาวระดับความโชคดี */}
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => {
                        const scoreThresholds = [50, 65, 78, 88, 95];
                        const isActive = result.scores.average >= scoreThresholds[i];
                        return (
                          <span 
                            key={i} 
                            className={`text-base ${isActive ? 'text-amber-400 drop-shadow-[0_0_6px_rgba(250,204,21,0.8)]' : 'text-slate-700'}`}
                          >
                            ⭐
                          </span>
                        );
                      })}
                      <span className="text-xs text-slate-400 font-semibold ml-1.5">(เฉลี่ย {result.scores.average}%)</span>
                    </div>

                    <p className="text-xs text-slate-200 leading-relaxed font-light mt-1 text-center bg-slate-950/50 p-3 rounded-lg border border-slate-900">
                      &ldquo;{result.predictions.summary}&rdquo;
                    </p>

                    {/* 📸 ปุ่มบันทึกรูปเพื่อแชร์ */}
                    <button
                      type="button"
                      disabled={isExporting}
                      onClick={handleDownloadImage}
                      className="w-full mt-3 bg-gradient-to-r from-amber-500/20 via-amber-500/30 to-amber-500/20 hover:from-amber-500/30 hover:via-amber-500/45 hover:to-amber-500/30 disabled:from-slate-800 disabled:to-slate-800 active:scale-[0.98] border border-amber-500/40 hover:border-amber-400 rounded-lg text-xs font-bold py-2.5 px-3 flex items-center justify-center gap-2 transition-all cursor-pointer text-amber-200 hover:text-amber-100 hover:shadow-[0_0_12px_rgba(245,158,11,0.25)] select-none"
                    >
                      {isExporting ? (
                        <>
                          <svg className="animate-spin h-3.5 w-3.5 text-amber-300" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          <span>กำลังบันทึกรูปดวงชะตา...</span>
                        </>
                      ) : (
                        <>
                          <span>📸 บันทึกรูปดวงชะตาเพื่อแชร์</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* ปุ่มย่อ/ขยายฟอร์มแก้ไขข้อมูลบนหน้าจอมือถือเพื่อไม่ให้เบียดบังคำทำนาย */}
                <button
                  type="button"
                  onClick={() => setIsFormExpanded(!isFormExpanded)}
                  className="md:hidden w-full bg-slate-900/90 border border-slate-800 hover:border-slate-700 active:scale-[0.98] text-blue-300 hover:text-blue-200 text-xs font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
                >
                  {isFormExpanded ? (
                    <>
                      <span>🔼 ซ่อนเครื่องมือแก้ไขข้อมูล</span>
                    </>
                  ) : (
                    <>
                      <span>📝 แก้ไขข้อมูลโปรไฟล์ / ดูดวงใหม่</span>
                    </>
                  )}
                </button>

                <form onSubmit={handleCalculate} className={`space-y-4 ${isFormExpanded ? 'block' : 'hidden md:block'}`}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs uppercase tracking-wider font-semibold mb-1.5 text-blue-300/80">ชื่อของคุณ</label>
                      <input
                        type="text"
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-blue-500 text-sm transition-colors"
                        placeholder="กรอกชื่อหรือชื่อเล่น"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-xs uppercase tracking-wider font-semibold mb-1.5 text-blue-300/80">สถานะความรัก</label>
                      <select
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-blue-500 text-sm transition-colors cursor-pointer"
                        value={formData.relationshipStatus}
                        onChange={(e) => setFormData({ ...formData, relationshipStatus: e.target.value })}
                      >
                        <option value="โสด">โสด</option>
                        <option value="มีคู่แล้ว">มีคู่แล้ว</option>
                        <option value="คนคุย/ไม่ชัดเจน">คนคุย/ไม่ชัดเจน</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs uppercase tracking-wider font-semibold mb-1.5 text-blue-300/80">เพศ</label>
                      <select
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-blue-500 text-sm transition-colors cursor-pointer"
                        value={formData.gender}
                        onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                      >
                        <option value="ชาย">ชาย</option>
                        <option value="หญิง">หญิง</option>
                        <option value="LGBTQ+">LGBTQ+</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs uppercase tracking-wider font-semibold mb-1.5 text-blue-300/80">เวลาเกิด (ไม่ใส่ก็ได้)</label>
                      <input
                        type="time"
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-blue-500 text-sm transition-colors cursor-pointer"
                        value={formData.birthTime}
                        onChange={(e) => setFormData({ ...formData, birthTime: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider font-semibold mb-1.5 text-blue-300/80">วันเกิดของคุณ</label>
                    <div className="grid grid-cols-3 gap-2">
                      <select
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-2.5 text-white focus:outline-none focus:border-blue-500 text-sm transition-colors cursor-pointer"
                        value={formData.birthDay}
                        onChange={(e) => setFormData({ ...formData, birthDay: e.target.value })}
                      >
                        <option value="">วัน</option>
                        {days.map((d) => (
                          <option key={d} value={d}>{parseInt(d)}</option>
                        ))}
                      </select>

                      <select
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-2.5 text-white focus:outline-none focus:border-blue-500 text-sm transition-colors cursor-pointer"
                        value={formData.birthMonth}
                        onChange={(e) => setFormData({ ...formData, birthMonth: e.target.value })}
                      >
                        <option value="">เดือน</option>
                        {months.map((m) => (
                          <option key={m.val} value={m.val}>{m.name}</option>
                        ))}
                      </select>

                      <select
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-2.5 text-white focus:outline-none focus:border-blue-500 text-sm transition-colors cursor-pointer"
                        value={formData.birthYear}
                        onChange={(e) => setFormData({ ...formData, birthYear: e.target.value })}
                      >
                        <option value="">ปี พ.ศ.</option>
                        {years.map((y) => (
                          <option key={y} value={String(y)}>
                            {y + 543}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full btn-magic text-white font-bold py-3.5 px-4 rounded-xl text-sm cursor-pointer flex items-center justify-center overflow-hidden relative mt-2"
                  >
                    <span className="relative z-10 tracking-wider">อัปเดตเปิดไพ่ใหม่</span>
                  </button>
                </form>
              </div>
            </div>

            {/* คอลัมน์ขวา (การงาน + การเงิน + ความรัก + สีเสื้อมงคล) */}
            <div className="md:col-span-4 w-full flex flex-col gap-4 order-3 mt-4 md:mt-0">
              <div className="bg-slate-900/60 p-5 rounded-xl border border-slate-800 transition-all hover:bg-slate-900/80 hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(37,99,235,0.25)] shadow-lg duration-300">
                <div className="flex justify-between text-sm font-bold mb-2 tracking-wide">
                  <span className="text-slate-200">💼 การงาน / การเรียน</span>
                  <span className="text-blue-400 font-extrabold">{result.scores.job}%</span>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed">{result.predictions.job}</p>
              </div>

              <div className="bg-slate-900/60 p-5 rounded-xl border border-slate-800 transition-all hover:bg-slate-900/80 hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(245,158,11,0.25)] shadow-lg duration-300">
                <div className="flex justify-between text-sm font-bold mb-2 tracking-wide">
                  <span className="text-slate-200">💰 การเงิน</span>
                  <span className="text-amber-400 font-extrabold">{result.scores.money}%</span>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed">{result.predictions.money}</p>
              </div>

              <div className="bg-slate-900/60 p-5 rounded-xl border border-slate-800 transition-all hover:bg-slate-900/80 hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(236,72,153,0.25)] shadow-lg duration-300">
                <div className="flex justify-between text-sm font-bold mb-2 tracking-wide">
                  <span className="text-slate-200">💖 ความรัก</span>
                  <span className="text-pink-400 font-extrabold">{result.scores.love}%</span>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed">{result.predictions.love}</p>
              </div>

              <div className="bg-slate-900/40 p-5 rounded-xl border border-slate-800 text-center text-sm font-semibold text-slate-200 shadow-lg transition-all hover:bg-slate-900/65 hover:-translate-y-1 duration-300">
                🎨 สีเสื้อมงคลเสริมดวงวันนี้: <br />
                <span className="font-extrabold text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.3)] block mt-2 text-base">{result.luckyColor}</span>
              </div>
            </div>

          </div>
        )}

        {/* ==================== 📸 HIDDEN EXPORTABLE COSMIC CARD (OFF-SCREEN) ==================== */}
        {result && (
          <div className="absolute -left-[9999px] top-0 pointer-events-none select-none">
            <div
              ref={cardRef}
              className="w-[500px] h-[700px] flex flex-col justify-between p-8 bg-slate-950 text-slate-100 relative overflow-hidden border-4 border-double border-amber-500/40"
              style={{
                backgroundImage: "url('/images/card-bg.png')",
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            >
              {/* 1. วงเวทย์พื้นหลังแบบจาง */}
              <div className="absolute top-1/2 left-1/2 w-[110%] aspect-square -translate-x-1/2 -translate-y-1/2 pointer-events-none z-0 opacity-15 text-blue-400">
                <MagicCircleSvg />
              </div>

              {/* 2. ฟิลเตอร์แสงออร่าสีทอง-ม่วงวิบวับ */}
              <div className="absolute inset-0 bg-gradient-to-tr from-purple-950/40 via-transparent to-amber-950/30 opacity-40 pointer-events-none z-0"></div>

              <div className="relative z-10 flex flex-col h-full justify-between">
                {/* ส่วนหัวการ์ด */}
                <div className="text-center border-b border-slate-800/80 pb-4">
                  <div className="text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 drop-shadow-[0_0_10px_rgba(168,85,247,0.4)]" style={{ fontFamily: 'var(--font-geist-sans), Inter, sans-serif' }}>
                    🔮 LuckyOne
                  </div>
                  <div className="text-[10px] uppercase tracking-[0.25em] text-blue-300/60 mt-0.5">
                    Daily Cosmic Fortune
                  </div>
                </div>

                {/* ข้อมูลโปรไฟล์ */}
                <div className="bg-slate-900/80 border border-blue-900/40 rounded-xl p-4 my-2.5 text-center">
                  <div className="text-sm font-bold text-blue-300">
                    ดวงชะตาของ คุณ{result.profile.name}
                  </div>
                  <div className="text-[11px] text-blue-200/70 mt-1">
                    เพศ: {result.profile.gender} | สถานะ: {result.profile.relationshipStatus} <br />
                    เกิด: {parseInt(result.profile.birthDay)} {months.find(m => m.val === result.profile.birthMonth)?.name} พ.ศ. {parseInt(result.profile.birthYear) + 543}
                  </div>
                </div>

                {/* ดวงภาพรวมและเรตติ้งดาว */}
                <div className="bg-gradient-to-br from-slate-900/90 to-blue-950/80 border border-amber-500/30 rounded-xl p-5 shadow-lg relative overflow-hidden">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-bold text-amber-300">🔮 ดวงภาพรวมวันนี้</span>
                    <span className="bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold px-2.5 py-0.5 rounded-full whitespace-nowrap shrink-0">
                      {result.scores.average >= 90 ? 'ดีเลิศที่สุด' : result.scores.average >= 80 ? 'ดีมาก' : result.scores.average >= 70 ? 'ปานกลาง' : 'เน้นมีสติ'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 mb-3">
                    {Array.from({ length: 5 }).map((_, i) => {
                      const scoreThresholds = [50, 65, 78, 88, 95];
                      const isActive = result.scores.average >= scoreThresholds[i];
                      return (
                        <span 
                          key={i} 
                          className={`text-base ${isActive ? 'text-amber-400 drop-shadow-[0_0_6px_rgba(250,204,21,0.8)]' : 'text-slate-700'}`}
                        >
                          ⭐
                        </span>
                      );
                    })}
                    <span className="text-xs text-slate-400 font-semibold ml-1">(เฉลี่ย {result.scores.average}%)</span>
                  </div>

                  <p className="text-xs text-slate-200 leading-relaxed font-light text-center bg-slate-950/60 p-3 rounded-lg border border-slate-900">
                    &ldquo;{result.predictions.summary}&rdquo;
                  </p>
                </div>

                {/* คะแนนทั้ง 3 ด้าน */}
                <div className="grid grid-cols-3 gap-2.5 my-2.5">
                  {/* การงาน */}
                  <div className="bg-slate-900/60 border border-slate-800/80 p-3 rounded-lg flex flex-col items-center text-center">
                    <span className="text-[10px] text-slate-400 mb-1">💼 การงาน</span>
                    <span className="text-sm font-black text-blue-400">{result.scores.job}%</span>
                    <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden mt-1.5 border border-slate-800">
                      <div className="bg-blue-500 h-full" style={{ width: `${result.scores.job}%` }}></div>
                    </div>
                  </div>

                  {/* การเงิน */}
                  <div className="bg-slate-900/60 border border-slate-800/80 p-3 rounded-lg flex flex-col items-center text-center">
                    <span className="text-[10px] text-slate-400 mb-1">💰 การเงิน</span>
                    <span className="text-sm font-black text-amber-400">{result.scores.money}%</span>
                    <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden mt-1.5 border border-slate-800">
                      <div className="bg-amber-500 h-full" style={{ width: `${result.scores.money}%` }}></div>
                    </div>
                  </div>

                  {/* ความรัก */}
                  <div className="bg-slate-900/60 border border-slate-800/80 p-3 rounded-lg flex flex-col items-center text-center">
                    <span className="text-[10px] text-slate-400 mb-1">💖 ความรัก</span>
                    <span className="text-sm font-black text-pink-400">{result.scores.love}%</span>
                    <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden mt-1.5 border border-slate-800">
                      <div className="bg-pink-500 h-full" style={{ width: `${result.scores.love}%` }}></div>
                    </div>
                  </div>
                </div>

                {/* สีเสื้อมงคล */}
                <div className="bg-slate-900/50 border border-slate-800/80 p-3 rounded-xl text-center flex flex-col items-center justify-center">
                  <span className="text-[10px] uppercase tracking-wider text-slate-400">🎨 สีเสื้อมงคลเสริมดวงวันนี้</span>
                  <span className="font-extrabold text-emerald-400 drop-shadow-[0_0_6px_rgba(52,211,153,0.3)] mt-1.5 text-sm">
                    {result.luckyColor}
                  </span>
                </div>

                {/* เทพคุ้มครอง + เทพนำโชค (ในการ์ดแชร์) */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-amber-950/30 border border-amber-500/20 p-4 rounded-xl flex flex-col items-center text-center">
                    <img src={result.guardianDeity.image} alt={result.guardianDeity.name} className="w-20 h-20 rounded-full border-2 border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.2)] object-cover mb-2" />
                    <span className="text-[10px] text-amber-300/60 mb-1">👑 เทพคุ้มครอง</span>
                    <span className="text-sm font-bold text-amber-200">{result.guardianDeity.name}</span>
                    <span className="text-[10px] text-slate-400">เกิดวัน{result.birthDayName}</span>
                  </div>
                  <div className="bg-purple-950/30 border border-purple-500/20 p-4 rounded-xl flex flex-col items-center text-center">
                    <img src={result.luckyDeity.image} alt={result.luckyDeity.name} className="w-20 h-20 rounded-full border-2 border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.2)] object-cover mb-2" />
                    <span className="text-[10px] text-purple-300/60 mb-1">✨ เทพนำโชควันนี้</span>
                    <span className="text-sm font-bold text-purple-200">{result.luckyDeity.name}</span>
                  </div>
                </div>

                {/* ท้ายการ์ด / แบรนด์ */}
                <div className="text-center pt-3 border-t border-slate-800/80 flex items-center justify-between text-[9px] text-slate-500">
                  <span>📅 วันที่เช็กดวง: {new Date().toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                  <span className="font-semibold tracking-wide bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent opacity-80">
                    🔮 luckyone.app
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </main>
  );
}