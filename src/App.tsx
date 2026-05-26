import { useState, useEffect } from "react";

/* ──────────────────────────────────────────
   타입 정의
─────────────────────────────────────────── */
type SectionData = {
  from: string;
  to: string;
  presenter: string;
  team: string;
  topic: string;
  summary: string;
};

type ScriptTexts = {
  opening: string;
  videoIntro: string;
  videoReason: string;
  planningTeam: string;
  closing: string;
  finalReport: string;
  ending: string;
};

type MeetingData = {
  month: string;
  meetingDate: string;
  endTime: string;
  videoTitle: string;
  videoSelector: string;
  videoReason: string;
  scripts: ScriptTexts;
  yeongUp: SectionData;
  gyeongIn1: SectionData;
  gyeongIn2: SectionData;
  yeongNam: SectionData;
  jungNam: SectionData;
  jegwa: SectionData;
};

const _now = new Date();
const _month = String(_now.getMonth() + 1);
const _year = String(_now.getFullYear());

const DEFAULT_DATA: MeetingData = {
  month: _month,
  meetingDate: `${_year}년 ${_month}월`,
  endTime: "11",
  videoTitle: "물류산업종사자만 78만명, 로봇은 정말 인간의 일자리를 뺏어갈까?",
  videoSelector: "인사총무팀",
  videoReason: "AI 및 자동화 기술이 물류 현장에 미치는 영향을 함께 고민하고자 선정하였습니다",
  scripts: {
    opening: "월 업무혁신회의를 시작하겠습니다.",
    videoIntro: "다음으로 동영상 시청이 있겠습니다. 금일 동영상은",
    videoReason: "이번 동영상은",
    planningTeam: "경영기획팀에서 월 경영전략회의 지시사항 팔로우업 해주시기 바랍니다.",
    closing: "각 팀별로 전달사항이나 특이사항 있으시면 공유해 주시기 바랍니다.",
    finalReport: "대표님, 금일 발표는 다 끝났습니다.",
    ending: "이상으로 월 업무혁신회의를 마치겠습니다.",
  },
  yeongUp: { from: "9:15", to: "9:30", presenter: "최배성본부장", team: "영업지원팀", topic: "3PL 표준요율 단가정립을 통한 견적업무 합리화", summary: "" },
  gyeongIn1: { from: "9:30", to: "9:45", presenter: "마영기상무", team: "유통사업3팀", topic: "입고 명세서 통일화 테스트 상황 및 향후 과제", summary: "" },
  gyeongIn2: { from: "9:45", to: "10:00", presenter: "안영준본부장", team: "경인사업2팀", topic: "AI 활용사례 : 전표처리 자동화", summary: "" },
  yeongNam: { from: "10:00", to: "10:15", presenter: "김태성본부장", team: "영남사업1팀", topic: "3PL 크레이트 세척 개선방안 검토", summary: "" },
  jungNam: { from: "10:15", to: "10:30", presenter: "하선호본부장", team: "중남사업1팀", topic: "유음료 배송노선 조정 검토", summary: "" },
  jegwa: { from: "10:30", to: "10:40", presenter: "표정우본부장", team: "제과사업2팀", topic: "자동화설비 도입을 통한 원가절감 방안", summary: "" },
};

/* ──────────────────────────────────────────
   인라인 편집 필드 (노란색 하이라이트)
─────────────────────────────────────────── */
function E({ value, onChange, w = "auto" }: { value: string; onChange: (v: string) => void; w?: string }) {
  return (
    <span
      contentEditable
      suppressContentEditableWarning
      onBlur={(e) => onChange(e.currentTarget.textContent ?? value)}
      title="클릭하여 수정"
      style={{ minWidth: w }}
      className="inline-block align-baseline px-1 rounded cursor-text font-bold text-amber-800 bg-yellow-100 border border-yellow-300 hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-colors"
    >
      {value}
    </span>
  );
}

/* ──────────────────────────────────────────
   추가 검토사항 접기/펼치기
─────────────────────────────────────────── */
function Notes({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  if (!text) return null;
  return (
    <div className="mt-2 no-print">
      <button
        onClick={() => setOpen((p) => !p)}
        className="flex items-center gap-1 text-[10px] font-medium text-slate-500 hover:text-slate-700 transition-colors"
      >
        <span className={`transition-transform duration-200 ${open ? "rotate-90" : ""}`}>▶</span>
        추가 검토사항
      </button>
      {open && (
        <div className="mt-1.5 text-[11px] text-slate-600 leading-relaxed whitespace-pre-wrap rounded-lg border-l-2 border-amber-400 bg-amber-50 px-3 py-2">
          {text}
        </div>
      )}
    </div>
  );
}

/* ──────────────────────────────────────────
   입력 필드 컴포넌트
─────────────────────────────────────────── */
function Field({ label, value, onChange, wide }: { label: string; value: string; onChange: (v: string) => void; wide?: boolean }) {
  return (
    <div className={`flex flex-col gap-1 ${wide ? "col-span-2" : ""}`}>
      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent bg-white transition"
      />
    </div>
  );
}

/* ──────────────────────────────────────────
   AI 추출 타입
─────────────────────────────────────────── */
type AiPresentation = { from: string; to: string; presenter: string; team: string; topic: string };
type AiExtracted = { month?: string; meetingDate?: string; endTime?: string; videoTitle?: string; videoSelector?: string; videoReason?: string; presentations: AiPresentation[] };

/* ──────────────────────────────────────────
   AI 추출 페이지
─────────────────────────────────────────── */
function AiExtractPage({ onApply }: { onApply: (data: Partial<MeetingData>) => void }) {
  const [apiKey, setApiKey] = useState(() => localStorage.getItem("claude_api_key") || "");
  const [apiKeyVisible, setApiKeyVisible] = useState(false);
  const [imagePreview, setImagePreview] = useState("");
  const [imageType, setImageType] = useState("image/jpeg");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");
  const [aiResult, setAiResult] = useState<AiExtracted | null>(null);

  const handleApiKeySave = () => {
    localStorage.setItem("claude_api_key", apiKey);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageType(file.type || "image/jpeg");
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target?.result as string);
    reader.readAsDataURL(file);
    setAiResult(null);
    setAiError("");
  };

  const handleExtract = async () => {
    if (!apiKey || !imagePreview) return;
    setAiLoading(true);
    setAiError("");
    setAiResult(null);

    const base64 = imagePreview.split(",")[1];
    const prompt = `이 회의 일정표 이미지에서 발표 일정 정보를 추출해서 아래 JSON 형식으로만 반환해주세요.
응답에 JSON 외 다른 텍스트는 절대 포함하지 마세요.

{
  "month": "회의 월 숫자만 (예: 9, 모르면 빈 문자열)",
  "meetingDate": "회의 일자 (예: 2024년 9월, 모르면 빈 문자열)",
  "endTime": "회의 종료 시간 숫자만 (예: 11, 모르면 빈 문자열)",
  "videoTitle": "동영상 제목 (있으면, 없으면 빈 문자열)",
  "videoSelector": "동영상 선정 팀명 (있으면, 없으면 빈 문자열)",
  "videoReason": "동영상 선정 사유 (있으면, 없으면 빈 문자열)",
  "presentations": [
    {
      "from": "시작시간 (예: 9:25)",
      "to": "종료시간 (예: 9:50)",
      "presenter": "발표자 이름/직책 (없으면 빈 문자열)",
      "team": "팀/부서명 (없으면 빈 문자열)",
      "topic": "발표 주제"
    }
  ]
}

동영상 시청, 전체 공유·토론, 대표님 맺음말 등 고정 항목은 presentations에 포함하지 말고, 실제 발표/보고 항목만 포함하세요.`;

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "content-type": "application/json",
          "anthropic-dangerous-direct-browser-access": "true",
        },
        body: JSON.stringify({
          model: "claude-opus-4-5",
          max_tokens: 2048,
          messages: [{
            role: "user",
            content: [
              { type: "image", source: { type: "base64", media_type: imageType, data: base64 } },
              { type: "text", text: prompt },
            ],
          }],
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || `API 오류 (${res.status})`);

      const text: string = json.content?.[0]?.text ?? "";
      const match = text.match(/\{[\s\S]*\}/);
      if (!match) throw new Error("JSON을 찾을 수 없습니다. 응답: " + text.slice(0, 100));

      const extracted: AiExtracted = JSON.parse(match[0]);
      setAiResult(extracted);
    } catch (e) {
      setAiError(e instanceof Error ? e.message : "알 수 없는 오류");
    } finally {
      setAiLoading(false);
    }
  };

  const handleApplyClick = () => {
    if (!aiResult) return;
    const slotKeys: string[] = ["yeongUp", "gyeongIn1", "gyeongIn2", "yeongNam", "jungNam", "jegwa"];
    const updated: Partial<MeetingData> = {};
    if (aiResult.month) updated.month = aiResult.month;
    if (aiResult.meetingDate) updated.meetingDate = aiResult.meetingDate;
    if (aiResult.endTime) updated.endTime = aiResult.endTime;
    if (aiResult.videoTitle) updated.videoTitle = aiResult.videoTitle;
    if (aiResult.videoSelector) updated.videoSelector = aiResult.videoSelector;
    if (aiResult.videoReason) updated.videoReason = aiResult.videoReason;
    (aiResult.presentations || []).forEach((p, i) => {
      if (i < slotKeys.length) {
        (updated as Record<string, unknown>)[slotKeys[i]] = {
          from: p.from || "", to: p.to || "",
          presenter: p.presenter || "", team: p.team || "", topic: p.topic || "",
        };
      }
    });
    onApply(updated);
    setAiResult(null);
    setImagePreview("");
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50">
      <div className="bg-white border-b border-gray-200 px-8 py-5 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #7c3aed, #4f46e5)", boxShadow: "0 0 16px rgba(124,58,237,0.4)" }}>
            <span className="text-xl">✨</span>
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">AI 일정 자동 추출</h2>
            <p className="text-xs text-gray-400 mt-0.5">회의 시간표 이미지를 업로드하면 Claude AI가 자동으로 일정을 인식합니다</p>
          </div>
        </div>
      </div>

      <div className="px-8 py-6 max-w-3xl mx-auto space-y-6">
        {/* API Key */}
        <section className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-violet-50 to-indigo-50 border-b border-gray-200 px-6 py-3">
            <h3 className="font-semibold text-gray-800 text-sm">🔑 Claude API Key 설정</h3>
          </div>
          <div className="p-6 space-y-3">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type={apiKeyVisible ? "text" : "password"}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="sk-ant-..."
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-violet-400 pr-10"
                />
                <button
                  onClick={() => setApiKeyVisible(p => !p)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
                >
                  {apiKeyVisible ? "숨김" : "보기"}
                </button>
              </div>
              <button
                onClick={handleApiKeySave}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition"
              >
                저장
              </button>
            </div>
            <p className="text-[11px] text-gray-400">
              🔒 API Key는 이 브라우저에만 저장됩니다.{" "}
              <a href="https://console.anthropic.com/" target="_blank" rel="noreferrer" className="text-violet-500 underline">
                Anthropic Console
              </a>에서 발급받으세요.
            </p>
          </div>
        </section>

        {/* 이미지 업로드 */}
        <section className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-sky-50 to-cyan-50 border-b border-gray-200 px-6 py-3">
            <h3 className="font-semibold text-gray-800 text-sm">📷 회의 시간표 이미지 업로드</h3>
          </div>
          <div className="p-6">
            <label className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl cursor-pointer transition-colors ${imagePreview ? "border-violet-300 bg-violet-50" : "border-gray-200 bg-gray-50 hover:border-violet-300 hover:bg-violet-50"}`}>
              {imagePreview ? (
                <div className="w-full p-4">
                  <img src={imagePreview} alt="업로드된 이미지" className="max-h-64 mx-auto rounded-lg object-contain shadow-sm" />
                  <p className="text-center text-xs text-violet-600 mt-3 font-medium">클릭하여 이미지 변경</p>
                </div>
              ) : (
                <div className="py-12 text-center px-4">
                  <p className="text-4xl mb-2">📷</p>
                  <p className="text-sm text-gray-500 font-medium">이미지를 클릭하여 업로드</p>
                  <p className="text-xs text-gray-400 mt-1">PNG, JPG, WEBP 지원</p>
                </div>
              )}
              <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
            </label>
          </div>
        </section>

        {/* 추출 버튼 */}
        <button
          onClick={handleExtract}
          disabled={!apiKey || !imagePreview || aiLoading}
          className="w-full py-4 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white shadow-lg"
        >
          {aiLoading ? (
            <>
              <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              AI 분석 중...
            </>
          ) : "✨ AI로 일정 추출하기"}
        </button>

        {/* 오류 */}
        {aiError && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700 flex items-start gap-2">
            <span className="flex-shrink-0 mt-0.5">⚠️</span>
            <span>{aiError}</span>
          </div>
        )}

        {/* 추출 결과 */}
        {aiResult && (
          <section className="bg-emerald-50 border-2 border-emerald-200 rounded-xl overflow-hidden">
            <div className="px-6 py-4 bg-emerald-100 border-b border-emerald-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">✅</span>
                <span className="text-sm font-semibold text-emerald-800">추출 완료 — 발표 {aiResult.presentations?.length ?? 0}건</span>
              </div>
              <button onClick={() => setAiResult(null)} className="text-emerald-500 hover:text-emerald-700 text-xs font-medium">취소</button>
            </div>
            <div className="p-6 space-y-3">
              {aiResult.month && <p className="text-xs text-gray-600">📅 <span className="font-medium">{aiResult.month}월</span> {aiResult.meetingDate && `· ${aiResult.meetingDate}`}</p>}
              {aiResult.videoTitle && <p className="text-xs text-gray-600">🎬 {aiResult.videoTitle}</p>}
              <div className="mt-3 space-y-2">
                {(aiResult.presentations || []).map((p, i) => (
                  <div key={i} className="bg-white rounded-lg border border-emerald-100 px-4 py-3 text-xs">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-gray-500 text-[11px]">{p.from} – {p.to}</span>
                      <span className="text-gray-300">|</span>
                      {p.team && <span className="text-gray-600 font-medium">{p.team}</span>}
                      {p.presenter && <span className="text-gray-400"> ({p.presenter})</span>}
                    </div>
                    {p.topic && <p className="text-indigo-700 font-medium">{p.topic}</p>}
                  </div>
                ))}
              </div>
              <button
                onClick={handleApplyClick}
                className="w-full mt-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold transition"
              >
                회의 설정에 적용하기 →
              </button>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────
   마스터 화면
─────────────────────────────────────────── */
function MasterPage({ data, onChange }: { data: MeetingData; onChange: (d: MeetingData) => void }) {
  const [local, setLocal] = useState<MeetingData>(data);
  const [saved, setSaved] = useState(false);

  const set = (key: keyof MeetingData, val: string) =>
    setLocal((p) => ({ ...p, [key]: val }));

  const setSection = (key: keyof MeetingData, field: keyof SectionData, val: string) =>
    setLocal((p) => ({ ...p, [key]: { ...(p[key] as SectionData), [field]: val } }));

  const handleSave = () => {
    onChange(local);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const sections: { key: keyof MeetingData; label: string; color: string }[] = [
    { key: "yeongUp", label: "발표 1", color: "bg-violet-50 border-violet-200" },
    { key: "gyeongIn1", label: "발표 2", color: "bg-sky-50 border-sky-200" },
    { key: "gyeongIn2", label: "발표 3", color: "bg-sky-50 border-sky-200" },
    { key: "yeongNam", label: "발표 4", color: "bg-emerald-50 border-emerald-200" },
    { key: "jungNam", label: "발표 5", color: "bg-amber-50 border-amber-200" },
    { key: "jegwa", label: "발표 6", color: "bg-rose-50 border-rose-200" },
  ];

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50">
      {/* 마스터 헤더 */}
      <div className="bg-white border-b border-gray-200 px-8 py-5 flex items-center justify-between sticky top-0 z-10">
        <div>
          <h2 className="text-lg font-bold text-gray-900">회의 설정</h2>
          <p className="text-xs text-gray-400 mt-0.5">회의 기본 정보와 각 본부별 발표 시간 / 발표자를 설정합니다</p>
        </div>
        <button
          onClick={handleSave}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm ${
            saved ? "bg-emerald-500 text-white" : "bg-indigo-600 hover:bg-indigo-700 text-white"
          }`}
        >
          {saved ? "✓ 저장됨" : "저장하기"}
        </button>
      </div>

      <div className="px-8 py-6 max-w-4xl space-y-6">

        {/* ── AI 일정 추출 ── */}
        <section className="bg-white rounded-2xl border-2 border-violet-200 shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-4 flex items-center gap-3">
            <span className="text-2xl">✨</span>
            <div>
              <h3 className="font-bold text-white text-sm">AI로 일정 자동 추출</h3>
              <p className="text-violet-200 text-xs mt-0.5">회의 시간표 이미지를 업로드하면 Claude AI가 일정을 자동으로 인식합니다</p>
            </div>
          </div>

          <div className="p-6 space-y-5">
            {/* API Key */}
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">
                Claude API Key
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type={apiKeyVisible ? "text" : "password"}
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="sk-ant-..."
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-violet-400 pr-10"
                  />
                  <button
                    onClick={() => setApiKeyVisible(p => !p)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
                  >
                    {apiKeyVisible ? "숨김" : "보기"}
                  </button>
                </div>
                <button
                  onClick={handleApiKeySave}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition"
                >
                  저장
                </button>
              </div>
              <p className="text-[11px] text-gray-400 mt-1.5">
                🔒 API Key는 이 브라우저에만 저장됩니다.{" "}
                <a href="https://console.anthropic.com/" target="_blank" rel="noreferrer" className="text-violet-500 underline">
                  Anthropic Console
                </a>에서 발급받으세요.
              </p>
            </div>

            {/* 이미지 업로드 */}
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">
                회의 시간표 이미지
              </label>
              <label className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl cursor-pointer transition-colors ${imagePreview ? "border-violet-300 bg-violet-50" : "border-gray-200 bg-gray-50 hover:border-violet-300 hover:bg-violet-50"}`}>
                {imagePreview ? (
                  <div className="w-full p-3">
                    <img src={imagePreview} alt="업로드된 이미지" className="max-h-48 mx-auto rounded-lg object-contain shadow-sm" />
                    <p className="text-center text-xs text-violet-600 mt-2 font-medium">클릭하여 이미지 변경</p>
                  </div>
                ) : (
                  <div className="py-8 text-center px-4">
                    <p className="text-3xl mb-2">📷</p>
                    <p className="text-sm text-gray-500 font-medium">이미지를 클릭하여 업로드</p>
                    <p className="text-xs text-gray-400 mt-1">PNG, JPG, WEBP 지원</p>
                  </div>
                )}
                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              </label>
            </div>

            {/* 추출 버튼 */}
            <button
              onClick={handleExtract}
              disabled={!apiKey || !imagePreview || aiLoading}
              className="w-full py-3 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white shadow-sm"
            >
              {aiLoading ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  AI 분석 중...
                </>
              ) : "✨ AI로 일정 추출하기"}
            </button>

            {/* 오류 */}
            {aiError && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700 flex items-start gap-2">
                <span className="flex-shrink-0 mt-0.5">⚠️</span>
                <span>{aiError}</span>
              </div>
            )}

            {/* 추출 결과 미리보기 */}
            {aiResult && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl overflow-hidden">
                <div className="px-4 py-3 bg-emerald-100 border-b border-emerald-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span>✅</span>
                    <span className="text-sm font-semibold text-emerald-800">추출 완료 — 발표 {aiResult.presentations?.length ?? 0}건</span>
                  </div>
                  <button onClick={() => setAiResult(null)} className="text-emerald-500 hover:text-emerald-700 text-xs">취소</button>
                </div>
                <div className="p-4 space-y-2">
                  {aiResult.month && <p className="text-xs text-gray-600">📅 <span className="font-medium">{aiResult.month}월</span> {aiResult.meetingDate && `· ${aiResult.meetingDate}`}</p>}
                  {aiResult.videoTitle && <p className="text-xs text-gray-600">🎬 {aiResult.videoTitle}</p>}
                  <div className="mt-2 space-y-1.5">
                    {(aiResult.presentations || []).map((p, i) => (
                      <div key={i} className="bg-white rounded-lg border border-emerald-100 px-3 py-2 text-xs">
                        <span className="font-mono text-gray-500 text-[11px]">{p.from} – {p.to}</span>
                        <span className="mx-1.5 text-gray-300">|</span>
                        {p.team && <span className="text-gray-600 font-medium">{p.team}</span>}
                        {p.presenter && <span className="text-gray-400"> ({p.presenter})</span>}
                        {p.topic && <p className="text-indigo-700 mt-0.5 font-medium">{p.topic}</p>}
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={handleApply}
                    className="w-full mt-3 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold transition"
                  >
                    이 일정 적용하기 →
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>
        {/* 기본 정보 */}
        <section className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="bg-indigo-50 border-b border-indigo-100 px-6 py-3 flex items-center gap-2">
            <span className="text-indigo-600 text-base">📋</span>
            <h3 className="font-semibold text-indigo-900 text-sm">기본 정보</h3>
          </div>
          <div className="p-6 grid grid-cols-2 gap-4">
            <Field label="회의 월" value={local.month} onChange={(v) => set("month", v)} />
            <Field label="회의 일자" value={local.meetingDate} onChange={(v) => set("meetingDate", v)} />
            <Field label="종료 예정 시간" value={local.endTime} onChange={(v) => set("endTime", v)} />
            <Field label="동영상 선정 팀" value={local.videoSelector} onChange={(v) => set("videoSelector", v)} />
            <Field label="동영상 제목" value={local.videoTitle} onChange={(v) => set("videoTitle", v)} wide />
            <Field label="동영상 선정 사유" value={local.videoReason} onChange={(v) => set("videoReason", v)} wide />
          </div>
        </section>

        {/* 진행자 멘트 */}
        <section className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="bg-purple-50 border-b border-purple-100 px-6 py-3 flex items-center gap-2">
            <span className="text-purple-600 text-base">💬</span>
            <h3 className="font-semibold text-purple-900 text-sm">진행자 멘트</h3>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">오프닝 멘트</label>
              <input
                type="text"
                value={local.scripts.opening}
                onChange={(e) => setLocal((p) => ({ ...p, scripts: { ...p.scripts, opening: e.target.value } }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white"
                placeholder="예: 월 업무혁신회의를 시작하겠습니다."
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">동영상 소개</label>
              <input
                type="text"
                value={local.scripts.videoIntro}
                onChange={(e) => setLocal((p) => ({ ...p, scripts: { ...p.scripts, videoIntro: e.target.value } }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white"
                placeholder="예: 다음으로 동영상 시청이 있겠습니다. 금일 동영상은"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">동영상 선정 사유 멘트</label>
              <input
                type="text"
                value={local.scripts.videoReason}
                onChange={(e) => setLocal((p) => ({ ...p, scripts: { ...p.scripts, videoReason: e.target.value } }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white"
                placeholder="예: 이번 동영상은"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">경영기획팀 멘트</label>
              <input
                type="text"
                value={local.scripts.planningTeam}
                onChange={(e) => setLocal((p) => ({ ...p, scripts: { ...p.scripts, planningTeam: e.target.value } }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white"
                placeholder="예: 경영기획팀에서 월 경영전략회의 지시사항 팔로우업 해주시기 바랍니다."
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">전체 공유 멘트</label>
              <input
                type="text"
                value={local.scripts.closing}
                onChange={(e) => setLocal((p) => ({ ...p, scripts: { ...p.scripts, closing: e.target.value } }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white"
                placeholder="예: 각 팀별로 전달사항이나 특이사항 있으시면 공유해 주시기 바랍니다."
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">대표님 보고 멘트</label>
              <input
                type="text"
                value={local.scripts.finalReport}
                onChange={(e) => setLocal((p) => ({ ...p, scripts: { ...p.scripts, finalReport: e.target.value } }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white"
                placeholder="예: 대표님, 금일 발표는 다 끝났습니다."
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">마무리 멘트</label>
              <input
                type="text"
                value={local.scripts.ending}
                onChange={(e) => setLocal((p) => ({ ...p, scripts: { ...p.scripts, ending: e.target.value } }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white"
                placeholder="예: 이상으로 월 업무혁신회의를 마치겠습니다."
              />
            </div>
          </div>
        </section>

        {/* 고정 일정 */}
        <section className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="bg-gray-50 border-b border-gray-100 px-6 py-3 flex items-center gap-2">
            <span className="text-gray-500 text-base">🕘</span>
            <h3 className="font-semibold text-gray-700 text-sm">고정 일정</h3>
          </div>
          <div className="p-6 overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse">
              <thead>
                <tr className="text-xs text-gray-400 border-b border-gray-100">
                  <th className="pb-2 pr-4 font-semibold">구분</th>
                  <th className="pb-2 pr-4 font-semibold w-24">시작</th>
                  <th className="pb-2 font-semibold w-24">종료</th>
                </tr>
              </thead>
              <tbody className="text-gray-600">
                {[
                  { label: "동영상 시청", from: "9:00", to: "9:08" },
                  { label: "경영기획팀 보고", from: "9:08", to: "9:15" },
                  { label: "전체 공유", from: "10:40", to: "10:50" },
                  { label: "대표님 보고 → 맺음말", from: "10:50", to: "11:00" },
                ].map((r) => (
                  <tr key={r.label} className="border-b border-gray-50">
                    <td className="py-2.5 pr-4 text-gray-500">{r.label}</td>
                    <td className="py-2.5 pr-4">
                      <span className="font-mono bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-xs">{r.from}</span>
                    </td>
                    <td className="py-2.5">
                      <span className="font-mono bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-xs">{r.to}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="text-xs text-gray-400 mt-3">※ 고정 일정은 멘트 시트에서 직접 수정할 수 있습니다</p>
          </div>
        </section>

        {/* 본부별 발표 */}
        <section className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="bg-indigo-900 px-6 py-3 flex items-center gap-2">
            <span className="text-indigo-200 text-base">🏢</span>
            <h3 className="font-semibold text-white text-sm">본부별 발표 일정</h3>
          </div>
          <div className="divide-y divide-gray-100">
            {sections.map(({ key, label, color }) => {
              const s = local[key] as SectionData;
              return (
                <div key={key} className={`px-6 py-5 ${color} border-l-4`}>
                  <p className="text-xs font-bold text-gray-600 mb-3 uppercase tracking-wide">{label}</p>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="시작 시간" value={s.from} onChange={(v) => setSection(key, "from", v)} />
                    <Field label="종료 시간" value={s.to} onChange={(v) => setSection(key, "to", v)} />
                    <Field label="발표자" value={s.presenter} onChange={(v) => setSection(key, "presenter", v)} />
                    <Field label="소속 팀" value={s.team} onChange={(v) => setSection(key, "team", v)} />
                    <Field label="발표 주제" value={s.topic} onChange={(v) => setSection(key, "topic", v)} wide />
                    <Field label="회의내용 요약" value={s.summary} onChange={(v) => setSection(key, "summary", v)} wide />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────
   멘트 시트 화면
─────────────────────────────────────────── */
function ScriptPage({ data, onDataChange, isOnline }: { data: MeetingData; onDataChange: (d: MeetingData) => void; isOnline: boolean }) {
  const { month, meetingDate, endTime, videoTitle, videoSelector, videoReason, scripts, yeongUp, gyeongIn1, gyeongIn2, yeongNam, jungNam, jegwa } = data;

  const set = (key: keyof MeetingData) => (v: string) => onDataChange({ ...data, [key]: v });
  const setSection = (key: keyof MeetingData, field: keyof SectionData) => (v: string) =>
    onDataChange({ ...data, [key]: { ...(data[key] as SectionData), [field]: v } });

  useEffect(() => {
    const style = document.createElement("style");
    style.id = "print-style";
    style.textContent = `
      @media print {
        .no-print { display: none !important; }
        aside { display: none !important; }
        header { background: #312e81 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        .bg-indigo-50 { background: #eef2ff !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        span[contenteditable] { border: none !important; background: #fef9c3 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        body { font-size: 10px; }
        tr { page-break-inside: avoid; }
      }
    `;
    document.head.appendChild(style);
    return () => { document.getElementById("print-style")?.remove(); };
  }, []);

  type RowItem = { from: string; to: string; label: string; dept?: string; presenter: string; topic?: string; summary?: string; script: React.ReactNode; notes: string; bg?: string };

  const rows: RowItem[] = [
    {
      from: "9:00", to: "9:08", label: "동영상 시청", dept: "", presenter: videoSelector, bg: "bg-slate-50",
      script: (
        <div className="space-y-1.5">
          <p>○ <E value={month} onChange={set("month")} w="28px" />월 {scripts.opening}{" "}
            <span className="text-gray-400 italic text-[11px]">[상호 인사]</span></p>
          <p className="text-gray-500 text-[11px]">(시간표) 금일 회의는 동영상 시청 및 각 본부별 업무개선사항 발표 후{" "}
            <E value={endTime} onChange={set("endTime")} w="24px" />시에 종료하도록 하겠습니다.</p>
          <p>○ {scripts.videoIntro} 「<E value={videoTitle} onChange={set("videoTitle")} w="220px" />」입니다.</p>
          <p className="text-gray-500 text-[11px]">
            : {scripts.videoReason}{" "}
            <E value={videoSelector} onChange={set("videoSelector")} w="80px" />에서 선정한 동영상으로,{" "}
            <E value={videoReason} onChange={set("videoReason")} w="260px" />
          </p>
        </div>
      ),
      notes: "○ 결론을 낸다.\n○ 내용이 길고 복잡할 경우, 발표한 내용을 반복해서 요약 정리해준다.\n○ 각 부서별 의견을 묻는다.\n○ 팀별 질문에 대한 대답 요청",
    },
    {
      from: "9:08", to: "9:15", label: "기획담당", dept: "기획담당", presenter: "경영기획팀",
      script: <p>○ {scripts.planningTeam.replace("월", `${month}월`)}</p>,
      notes: "",
    },
    {
      from: yeongUp.from, to: yeongUp.to, label: yeongUp.team, dept: "발표 1", presenter: `${yeongUp.presenter}`, topic: yeongUp.topic, summary: yeongUp.summary,
      script: (
        <div className="space-y-1">
          <p>○ 영업본부 주요 개선사항 발표해 주시기 바랍니다.</p>
          <p className="text-[11px] text-blue-600 pl-3">→ <E value={yeongUp.topic} onChange={setSection("yeongUp", "topic")} w="220px" /></p>
        </div>
      ),
      notes: "○ 당사 일마감 프로젝트 수행 시 매출정산 유형이 30가지, 세분화하면 80가지 이상이어서 어려움이 있음. 전사 투명하고 표준화된 관리를 위한 PI 시도로 판단됨.\n○ 현재 많은 회사들이 영업효율화 및 전략수립을 위해 견적자동화 솔루션을 도입하고 있음(부릉-한국야쿠르트 등). 데이터기반 견적생성, 견적템플릿 관리, 실시간 단가 업데이트, 승인워크플로우 자동화 등.",
    },
    {
      from: gyeongIn1.from, to: gyeongIn1.to, label: gyeongIn1.team, dept: "발표 2", presenter: `${gyeongIn1.presenter}`, topic: gyeongIn1.topic, summary: gyeongIn1.summary,
      script: (
        <div className="space-y-1">
          <p>○ 이어서 경인사업1본부 발표해 주시기 바랍니다.</p>
          <p className="text-[11px] text-blue-600 pl-3">→ <E value={gyeongIn1.topic} onChange={setSection("gyeongIn1", "topic")} w="220px" /></p>
        </div>
      ),
      notes: "○ 사내 AI 교육 6/12일, 사내 지식경영을 통해 교육 게시물 업데이트 중.\n○ 7/22 영업본부 워크샵 시 영업부문 경진대회, 올해 하반기 전사 경진대회 검토.\n→ 사내 AI 활용 수준이 높고 상당히 고무적임.\n○ 회사 볼륨이 커질수록 IT 요구사항 증가. AI를 통해 충분히 사용성을 검토 후 개발요청 시 업무효율 증가 예상.",
    },
    {
      from: gyeongIn2.from, to: gyeongIn2.to, label: gyeongIn2.team, dept: "발표 3", presenter: `${gyeongIn2.presenter}`, topic: gyeongIn2.topic, summary: gyeongIn2.summary,
      script: (
        <div className="space-y-1">
          <p>○ 경인사업2본부 발표해 주시기 바랍니다.</p>
          <p className="text-[11px] text-blue-600 pl-3">→ <E value={gyeongIn2.topic} onChange={setSection("gyeongIn2", "topic")} w="220px" /></p>
        </div>
      ),
      notes: "○ AI 활용을 위한 좋은 시도로 생각됨.\n○ 기업의 AI 활용에 대한 보안/윤리적 제한에 대해서도 고민 필요.\n○ 전표 등 민감정보에 대해서는 유관부서와 사전 공유 및 IT 부서의 가이드라인을 따르는 것이 중요할 것으로 판단됨.",
    },
    {
      from: yeongNam.from, to: yeongNam.to, label: yeongNam.team, dept: "발표 4", presenter: `${yeongNam.presenter}`, topic: yeongNam.topic, summary: yeongNam.summary,
      script: (
        <div className="space-y-1">
          <p>○ 영남사업본부 발표해 주시기 바랍니다.</p>
          <p className="text-[11px] text-blue-600 pl-3">→ <E value={yeongNam.topic} onChange={setSection("yeongNam", "topic")} w="220px" /></p>
        </div>
      ),
      notes: "",
    },
    {
      from: jungNam.from, to: jungNam.to, label: jungNam.team, dept: "발표 5", presenter: `${jungNam.presenter}`, topic: jungNam.topic, summary: jungNam.summary,
      script: (
        <div className="space-y-1">
          <p>○ 중남사업본부 발표해 주시기 바랍니다.</p>
          <p className="text-[11px] text-blue-600 pl-3">→ <E value={jungNam.topic} onChange={setSection("jungNam", "topic")} w="220px" /></p>
        </div>
      ),
      notes: "○ 중남사업부는 차량당 배송 커버지역이 넓어 운행거리가 많음. 배송 거래처 증가 시 노선 수 조정 관련 배송기사 반발 여부 확인 필요.\n○ 대리점 도착시간에 문제가 없는지?",
    },
    {
      from: jegwa.from, to: jegwa.to, label: jegwa.team, dept: "발표 6", presenter: `${jegwa.presenter}`, topic: jegwa.topic, summary: jegwa.summary,
      script: (
        <div className="space-y-1">
          <p>○ 제과사업부 발표해 주시기 바랍니다.</p>
          <p className="text-[11px] text-blue-600 pl-3">→ <E value={jegwa.topic} onChange={setSection("jegwa", "topic")} w="220px" /></p>
        </div>
      ),
      notes: "",
    },
    {
      from: "10:40", to: "10:50", label: "전체", dept: "전체", presenter: "회의진행", bg: "bg-gray-50",
      script: <p>○ {scripts.closing}</p>,
      notes: "",
    },
    {
      from: "10:50", to: "10:50", label: "전체", dept: "전체", presenter: "회의진행",
      script: <p className="font-semibold text-gray-700">○ {scripts.finalReport}</p>,
      notes: "",
    },
    {
      from: "10:50", to: "11:00", label: "전체", dept: "전체", presenter: "사장님", bg: "bg-blue-50",
      script: (
        <p>
          ○ 대표님 맺음말{" "}
          <span className="text-gray-400 italic text-[11px] ml-1">[발언 후]</span>
          {" "}→ <E value={month} onChange={set("month")} w="28px" />월 {scripts.ending}{" "}
          <span className="text-gray-400 italic text-[11px]">[상호 인사]</span>
        </p>
      ),
      notes: "",
    },
  ];

  const hdrColor = "#2d3e56";
  const tdBase = "border border-gray-300 px-3 py-2.5 text-[13px] align-middle leading-relaxed";

  return (
    <div className="flex-1 overflow-y-auto bg-slate-100">
      {/* 헤더 */}
      <header className="no-print text-white shadow-md"
        style={{ background: "linear-gradient(90deg, #0f172a 0%, #1e1b4b 60%, #312e81 100%)", borderBottom: "1px solid rgba(139,92,246,0.25)" }}>
        <div className="px-6 py-3 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: "linear-gradient(135deg, #7c3aed, #4f46e5)", boxShadow: "0 0 12px rgba(124,58,237,0.4)" }}>
              <span className="text-sm">📋</span>
            </div>
            <div>
              <h1 className="text-[13px] font-bold tracking-tight text-white">업무혁신회의 — 진행자 멘트 시트</h1>
              <p className="text-[11px] mt-0.5" style={{ color: "rgba(167,139,250,0.7)" }}>
                <span className="bg-yellow-300 text-yellow-900 px-1.5 py-0.5 rounded text-[10px] font-bold mr-1">노란색 항목</span>
                클릭하여 수정 가능
              </p>
            </div>
          </div>
          <button
            onClick={() => window.print()}
            className="no-print flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-[11px] font-semibold transition shadow-sm"
            style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", color: "#e2e8f0" }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.15)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; }}
          >
            🖨️ 인쇄 / PDF 저장
          </button>
        </div>
      </header>

      {/* 오프라인 경고 배너 */}
      {!isOnline && (
        <div className="no-print bg-amber-500 border-b border-amber-600 px-6 py-2 flex items-center gap-2">
          <span className="text-amber-900 text-sm">⚠️</span>
          <p className="text-[11px] text-amber-900 font-medium">
            오프라인 모드 — 마지막 저장된 데이터를 표시 중입니다. 변경사항은 로컬에 저장됩니다.
          </p>
        </div>
      )}

      {/* 회의 기본정보 카드 */}
      <div className="px-6 pt-4 pb-2">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 px-5 py-3 flex flex-wrap gap-x-6 gap-y-2 items-center">
          <div className="flex items-center gap-1.5 text-[13px]">
            <span className="text-gray-500 font-medium">📅 회의명</span>
            <E value={month} onChange={set("month")} w="28px" />
            <span className="text-gray-700">월 업무혁신회의</span>
          </div>
          <div className="flex items-center gap-1.5 text-[13px]">
            <span className="text-gray-500 font-medium">🗓 일자</span>
            <E value={meetingDate} onChange={set("meetingDate")} w="110px" />
          </div>
          <div className="flex items-center gap-1.5 text-[13px]">
            <span className="text-gray-500 font-medium">⏰ 종료예정</span>
            <E value={endTime} onChange={set("endTime")} w="24px" />
            <span className="text-gray-700">시</span>
          </div>
          <div className="ml-auto text-[11px] text-gray-400 no-print italic hidden md:block">
            ※ 사전에 각 부서별 질문사항 미리 확인 후 통화 (회의자료 확인)
          </div>
        </div>
      </div>

      {/* 범례 */}
      <div className="px-6 py-1.5 no-print">
        <div className="flex flex-wrap gap-3 text-[11px] text-gray-400 items-center">
          <span className="flex items-center gap-1">
            <span className="inline-block w-2.5 h-2.5 rounded bg-yellow-100 border border-yellow-300" />
            수정 가능 항목
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block w-2.5 h-2.5 rounded bg-blue-100 border border-blue-200" />
            발표 주제
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block w-2.5 h-2.5 rounded bg-indigo-50 border border-indigo-200" />
            오프닝 / 클로징
          </span>
        </div>
      </div>

      {/* 메인 테이블 */}
      <div className="px-6 pb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-300 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse min-w-[700px]" style={{ borderColor: "#b0b8c4" }}>
              <thead>
                {/* 1행: 대분류 헤더 */}
                <tr style={{ backgroundColor: hdrColor }} className="text-white text-[12px]">
                  <th
                    rowSpan={2}
                    className="border border-white/20 px-4 py-2.5 font-bold text-center w-28 whitespace-nowrap tracking-widest"
                    style={{ letterSpacing: "0.15em" }}
                  >
                    시 간
                  </th>
                  <th
                    colSpan={2}
                    className="border border-white/20 px-4 py-2.5 font-bold text-center tracking-widest"
                    style={{ letterSpacing: "0.15em" }}
                  >
                    발 표 부 서
                  </th>
                  <th
                    rowSpan={2}
                    className="border border-white/20 px-4 py-2.5 font-bold text-center tracking-widest"
                    style={{ letterSpacing: "0.1em" }}
                  >
                    발 표 내 용
                  </th>
                  <th
                    rowSpan={2}
                    className="border border-white/20 px-4 py-2.5 font-bold text-center w-80 tracking-widest"
                    style={{ letterSpacing: "0.1em" }}
                  >
                    회의내용 요약
                  </th>
                </tr>
                {/* 2행: 소분류 헤더 */}
                <tr style={{ backgroundColor: hdrColor }} className="text-white text-[11px]">
                  <th className="border border-white/20 px-3 py-2 font-semibold text-center w-24 whitespace-nowrap tracking-wider">담 당</th>
                  <th className="border border-white/20 px-3 py-2 font-semibold text-center w-36 whitespace-nowrap tracking-wider">팀 / 발표자</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => {
                  const isLast = i === rows.length - 1;
                  const rowBg = row.bg === "bg-blue-50" ? "#dce8f8"
                    : row.bg === "bg-slate-50" ? "#f8fafc"
                    : row.bg === "bg-gray-50" ? "#f9fafb"
                    : i % 2 === 0 ? "#ffffff" : "#f8f9fb";
                  return (
                    <tr
                      key={i}
                      style={{ backgroundColor: rowBg }}
                      className={`transition-all ${!isLast ? "hover:brightness-97" : ""}`}
                    >
                      {/* 시간 */}
                      <td className="border border-gray-300 px-3 py-3 text-center font-semibold text-[13px] text-gray-700 whitespace-nowrap align-middle"
                        style={isLast ? { fontWeight: 700 } : {}}>
                        <span style={isLast ? { textDecoration: "underline", textDecorationStyle: "solid" } : {}}>
                          {row.from}
                        </span>
                        <span className="mx-1.5 text-gray-400">-</span>
                        <span style={isLast ? { fontWeight: 700, textDecoration: "underline" } : {}}>
                          {row.to}
                        </span>
                      </td>
                      {/* 담당 */}
                      <td className="border border-gray-300 px-3 py-3 text-center text-[12px] font-semibold text-gray-700 align-middle whitespace-nowrap">
                        {row.dept || row.label}
                      </td>
                      {/* 팀/발표자 */}
                      <td className="border border-gray-300 px-3 py-3 text-center text-[11px] text-gray-600 align-middle leading-snug">
                        <div className="font-semibold text-gray-800">{row.label !== row.dept ? row.label : ""}</div>
                        {row.presenter && row.presenter !== row.label && (
                          <div className="text-gray-500 text-[10px] mt-0.5">({row.presenter})</div>
                        )}
                      </td>
                      {/* 발표내용 + 진행자 멘트 */}
                      <td className="border border-gray-300 px-4 py-3 text-gray-800 align-top">
                        {row.script}
                        <Notes text={row.notes} />
                      </td>
                      {/* 회의내용 요약 */}
                      <td className="border border-gray-300 px-4 py-3 text-[12px] text-gray-700 align-top leading-relaxed">
                        {row.summary ? (
                          <div className="whitespace-pre-wrap">{row.summary}</div>
                        ) : (
                          <span className="text-gray-300 text-xs italic">요약 없음</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
        <p className="mt-3 text-center text-[11px] text-gray-400 no-print">
          인쇄 시 추가 검토사항은 숨겨집니다. 브라우저 인쇄 설정에서 "배경 그래픽 포함"을 체크하면 색상이 유지됩니다.
        </p>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────
   메인 앱 (사이드바 + 라우팅)
─────────────────────────────────────────── */
type Page = "script" | "master" | "ai";

export default function App() {
  const [page, setPage] = useState<Page>("script");
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  // localStorage에서 데이터 로드 또는 기본값 사용
  const [data, setData] = useState<MeetingData>(() => {
    try {
      const saved = localStorage.getItem("meeting_data");
      return saved ? JSON.parse(saved) : DEFAULT_DATA;
    } catch {
      return DEFAULT_DATA;
    }
  });
  
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // 데이터 변경 시 자동 저장
  useEffect(() => {
    localStorage.setItem("meeting_data", JSON.stringify(data));
  }, [data]);

  // 온라인/오프라인 상태 감지
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const navItems: { id: Page; icon: string; label: string; sub: string }[] = [
    { id: "ai", icon: "✨", label: "AI 일정 추출", sub: "이미지에서 자동 인식" },
    { id: "master", icon: "⚙️", label: "회의 설정", sub: "발표자 · 시간 · 주제" },
    { id: "script", icon: "📋", label: "진행자 멘트 시트", sub: "회의 진행 스크립트" },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-slate-100 font-sans">
      {/* ── 사이드바 ── */}
      <aside
        className={`no-print flex-shrink-0 flex flex-col transition-all duration-300 border-r border-slate-700/60 ${
          sidebarOpen ? "w-56" : "w-14"
        }`}
        style={{ background: "linear-gradient(180deg, #0f172a 0%, #1e1b4b 100%)" }}
      >
        {/* 로고 */}
        <div className={`flex items-center gap-2 px-4 py-4 ${!sidebarOpen && "justify-center"}`}
          style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
          {sidebarOpen && (
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-violet-400 shadow" style={{ boxShadow: "0 0 6px #a78bfa" }} />
                <p className="text-[11px] font-bold text-white tracking-wide truncate">업무혁신회의</p>
              </div>
              <p className="text-[10px] truncate" style={{ color: "rgba(167,139,250,0.6)" }}>{data.meetingDate}</p>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen((p) => !p)}
            className="transition p-1 rounded-lg text-[10px]"
            style={{ color: "rgba(148,163,184,0.6)" }}
            title={sidebarOpen ? "사이드바 닫기" : "사이드바 열기"}
          >
            {sidebarOpen ? "◀" : "▶"}
          </button>
        </div>

        {/* 메뉴 */}
        <nav className="flex-1 py-4 space-y-1 px-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setPage(item.id)}
              title={!sidebarOpen ? item.label : undefined}
              className={`w-full flex items-center gap-3 px-2.5 py-2.5 rounded-xl text-left transition-all duration-200 ${
                !sidebarOpen && "justify-center"
              }`}
              style={page === item.id ? {
                background: "linear-gradient(135deg, rgba(139,92,246,0.25) 0%, rgba(99,102,241,0.2) 100%)",
                border: "1px solid rgba(139,92,246,0.3)",
                color: "#e2e8f0",
              } : {
                border: "1px solid transparent",
                color: "rgba(148,163,184,0.7)",
              }}
              onMouseEnter={(e) => {
                if (page !== item.id) {
                  e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                  e.currentTarget.style.color = "#e2e8f0";
                }
              }}
              onMouseLeave={(e) => {
                if (page !== item.id) {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "rgba(148,163,184,0.7)";
                }
              }}
            >
              <span className="text-sm flex-shrink-0">{item.icon}</span>
              {sidebarOpen && (
                <div className="min-w-0">
                  <p className="text-[12px] font-semibold leading-tight">{item.label}</p>
                  <p className="text-[10px] leading-tight mt-0.5" style={{ color: page === item.id ? "rgba(167,139,250,0.7)" : "rgba(100,116,139,0.8)" }}>
                    {item.sub}
                  </p>
                </div>
              )}
              {page === item.id && sidebarOpen && (
                <span className="ml-auto w-1 h-1 rounded-full bg-violet-400 flex-shrink-0" />
              )}
            </button>
          ))}
        </nav>

        {/* 하단 배지 */}
        {sidebarOpen && (
          <div className="px-4 py-3 space-y-2" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
            <p className="text-[10px] leading-relaxed" style={{ color: "rgba(100,116,139,0.8)" }}>
              {data.month}월 회의 &middot; 종료 {data.endTime}시
            </p>
            <div className="flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? "bg-emerald-400" : "bg-red-400"}`}
                style={{ boxShadow: isOnline ? "0 0 6px #34d399" : "0 0 6px #f87171" }} />
              <span className="text-[10px]" style={{ color: isOnline ? "rgba(52,211,153,0.9)" : "rgba(248,113,113,0.9)" }}>
                {isOnline ? "온라인" : "오프라인"}
              </span>
            </div>
          </div>
        )}
      </aside>

      {/* ── 콘텐츠 영역 ── */}
      {page === "ai" ? (
        <AiExtractPage onApply={(partial) => setData((prev) => ({ ...prev, ...partial }))} />
      ) : page === "master" ? (
        <MasterPage data={data} onChange={setData} />
      ) : (
        <ScriptPage data={data} onDataChange={setData} isOnline={isOnline} />
      )}
    </div>
  );
}
