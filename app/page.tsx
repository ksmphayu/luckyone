// app/page.tsx
'use client';

import { useState, FormEvent } from 'react';
import { jobFortunes, moneyFortunes, loveFortunes, luckyColors } from './fortuneData';

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
  birthDay: string;
  birthMonth: string;
  birthYear: string;
  birthTime: string;
}

interface FortuneResult {
  profile: FormDataState;
  scores: { job: number; money: number; love: number };
  predictions: { job: string; money: string; love: string };
  luckyColor: string;
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
    birthDay: '',
    birthMonth: '',
    birthYear: '',
    birthTime: ''
  });

  const [result, setResult] = useState<FortuneResult | null>(null);

  const handleCalculate = (e: FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.birthDay || !formData.birthMonth || !formData.birthYear) {
      alert("กรุณากรอกชื่อและวันเกิดด้วยนะจ๊ะ");
      return;
    }

    const birthDate = `${formData.birthYear}-${formData.birthMonth}-${formData.birthDay}`;
    const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const seedString = `${formData.name}-${birthDate}-${formData.birthTime}-${formData.gender}-${todayStr}`;

    let seedNumber = 0;
    for (let i = 0; i < seedString.length; i++) {
      seedNumber += seedString.charCodeAt(i);
    }

    const jobIdx = seedNumber % jobFortunes.length;
    const moneyIdx = (seedNumber + 3) % moneyFortunes.length;
    const loveIdx = (seedNumber + 7) % loveFortunes.length;
    const colorIdx = (seedNumber + 11) % luckyColors.length;

    const jobScore = (seedNumber % 51) + 50;
    const moneyScore = ((seedNumber + 2) % 51) + 50;
    const loveScore = ((seedNumber + 4) % 51) + 50;

    setResult({
      profile: formData,
      scores: { job: jobScore, money: moneyScore, love: loveScore },
      predictions: { job: jobFortunes[jobIdx], money: moneyFortunes[moneyIdx], love: loveFortunes[loveIdx] },
      luckyColor: luckyColors[colorIdx]
    });
  };

  return (
    <main
      className="min-h-screen text-slate-100 flex flex-col items-center justify-center p-6 bg-cover bg-center bg-no-repeat relative overflow-hidden"
      style={{ backgroundImage: "url('/images/card-bg.png')" }}
    >
      {/* ==================== ⚡ ZONE: ANIMATION 2 (ENERGY FLOW ทอง-ม่วง) ==================== */}
      <div
        className="absolute inset-0 pointer-events-none z-0 mix-blend-screen opacity-30"
        style={{
          background: 'linear-gradient(90deg, transparent, #ffd700, #8a2be2, transparent)',
          backgroundSize: '200% 100%',
          animation: 'energyFlow 25s linear infinite' /* ต้องมี @keyframes energyFlow ในไฟล์ CSS */
        }}
      ></div>

      {/* ==================== ZONE: ANIMATION 1 (PARTICLES) ==================== */}
      <div className="absolute inset-y-0 left-0 w-1/4 pointer-events-none z-10 overflow-hidden">
        <div className="absolute bottom-0 left-[10%] w-2 h-2 bg-purple-400 rounded-full blur-[1px] animate-[floatUp_6s_linear_infinite]"></div>
        <div className="absolute bottom-0 left-[40%] w-3 h-3 bg-amber-300 rounded-full blur-[2px] animate-[floatUp_9s_linear_infinite] delay-200"></div>
        <div className="absolute bottom-0 left-[70%] w-1.5 h-1.5 bg-blue-300 rounded-full blur-[1px] animate-[floatUp_7s_linear_infinite] delay-500"></div>
      </div>
      <div className="absolute inset-y-0 right-0 w-1/4 pointer-events-none z-10 overflow-hidden">
        <div className="absolute bottom-0 right-[15%] w-3 h-3 bg-amber-200 rounded-full blur-[2px] animate-[floatUp_8s_linear_infinite]"></div>
        <div className="absolute bottom-0 right-[45%] w-1.5 h-1.5 bg-purple-400 rounded-full blur-[1px] animate-[floatUp_6s_linear_infinite] delay-300"></div>
        <div className="absolute bottom-0 right-[75%] w-2.5 h-2.5 bg-blue-200 rounded-full blur-[2px] animate-[floatUp_10s_linear_infinite] delay-1000"></div>
      </div>

      {/* ==================== 🔯 ZONE: SPINNING MAGIC CIRCLE & CARD ==================== */}
      <div className="relative w-full max-w-md z-20 flex items-center justify-center">

        {/* เลอย์วงเวทย์เบื้องหลัง */}
        <div className="absolute top-1/2 left-1/2 w-[130%] aspect-square -translate-x-1/2 -translate-y-1/2 pointer-events-none z-0 animate-[spin_200s_linear_infinite] text-blue-400 opacity-60">
          <MagicCircleSvg />
        </div>

        {/* ==================== ตัวกล่องเนื้อหาหลัก (z-10 เพื่อลอยอยู่บนวงเวทย์) ==================== */}
        <div className="relative z-10 w-full bg-slate-950/90 border border-slate-800 rounded-2xl p-6 shadow-[0_0_50px_rgba(0,0,0,0.6)]">
          <h1 className="text-3xl font-bold text-center text-blue-400 mb-2 drop-shadow-[0_0_10px_rgba(37,99,235,0.5)]">🔮 LuckyOne 🔮</h1>
          <p className="text-center text-sm text-blue-200/60 mb-6">เช็กดวงชะตารายวันและโปรไฟล์ของคุณ</p>

          <form onSubmit={handleCalculate} className="space-y-4 relative z-20">
            <div>
              <label className="block text-sm font-medium mb-1 text-slate-300">ชื่อของคุณ</label>
              <input
                type="text"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 text-sm transition-colors"
                placeholder="กรอกชื่อหรือชื่อเล่น"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-slate-300">เพศ</label>
                <select
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 text-sm transition-colors"
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                >
                  <option value="ชาย">ชาย</option>
                  <option value="หญิง">หญิง</option>
                  <option value="LGBTQ+">LGBTQ+</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-slate-300">เวลาเกิด (ไม่ใส่ก็ได้)</label>
                <input
                  type="time"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 text-sm transition-colors"
                  value={formData.birthTime}
                  onChange={(e) => setFormData({ ...formData, birthTime: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-slate-300">วันเกิดของคุณ</label>
              <div className="grid grid-cols-3 gap-2">
                <select
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-2 text-white focus:outline-none focus:border-blue-500 text-sm transition-colors cursor-pointer"
                  value={formData.birthDay}
                  onChange={(e) => setFormData({ ...formData, birthDay: e.target.value })}
                >
                  <option value="">วัน</option>
                  {days.map((d) => (
                    <option key={d} value={d}>{parseInt(d)}</option>
                  ))}
                </select>

                <select
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-2 text-white focus:outline-none focus:border-blue-500 text-sm transition-colors cursor-pointer"
                  value={formData.birthMonth}
                  onChange={(e) => setFormData({ ...formData, birthMonth: e.target.value })}
                >
                  <option value="">เดือน</option>
                  {months.map((m) => (
                    <option key={m.val} value={m.val}>{m.name}</option>
                  ))}
                </select>

                <select
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-2 text-white focus:outline-none focus:border-blue-500 text-sm transition-colors cursor-pointer"
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
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded-lg transition duration-200 mt-2 shadow-[0_0_20px_rgba(37,99,235,0.4)] text-sm cursor-pointer"
            >
              เปิดไพ่ดูดวงชะตา 🃏
            </button>
          </form>

          {result && (
            <div className="mt-8 border-t border-slate-800 pt-6 space-y-4 relative z-20">
              <div className="bg-blue-950/40 border border-blue-900/50 rounded-xl p-4 text-center">
                <h2 className="text-xl font-bold text-blue-400">โปรไฟล์ของคุณ {result.profile.name}</h2>
                <p className="text-xs text-blue-200/70 mt-1">
                  เพศ: {result.profile.gender} | เกิดวันที่: {parseInt(result.profile.birthDay)} {months.find(m => m.val === result.profile.birthMonth)?.name} พ.ศ. {parseInt(result.profile.birthYear) + 543}
                </p>
              </div>

              <div className="space-y-3">
                <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                  <div className="flex justify-between text-sm font-semibold mb-1">
                    <span className="text-slate-200">💼 การงาน / การเรียน</span>
                    <span className="text-blue-400">{result.scores.job}%</span>
                  </div>
                  <p className="text-xs text-slate-400">{result.predictions.job}</p>
                </div>

                <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                  <div className="flex justify-between text-sm font-semibold mb-1">
                    <span className="text-slate-200">💰 การเงิน</span>
                    <span className="text-amber-400">{result.scores.money}%</span>
                  </div>
                  <p className="text-xs text-slate-400">{result.predictions.money}</p>
                </div>

                <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                  <div className="flex justify-between text-sm font-semibold mb-1">
                    <span className="text-slate-200">💖 ความรัก</span>
                    <span className="text-pink-400">{result.scores.love}%</span>
                  </div>
                  <p className="text-xs text-slate-400">{result.predictions.love}</p>
                </div>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center text-sm">
                🎨 สีเสื้อมงคลเสริมดวงวันนี้: <span className="font-bold text-emerald-400">{result.luckyColor}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}