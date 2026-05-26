import { useState, useEffect, useRef } from "react";
import * as XLSX from "xlsx";

/* ──────────────────────────────────────────
   타입 정의
─────────────────────────────────────────── */
type DiscussionItem = {
  agenda: string;
  relatedDept: string;
  keyContent: string;
  discussionPoints: string;
  risks: string;
};

type SectionData = {
  from: string;
  to: string;
  dept: string;
  presenter: string;
  team: string;
  topic: string;
  summary: string;
  discussion: DiscussionItem[];
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
  videoSummary: string;
  videoPresentDept: string;
  scripts: ScriptTexts;
  presentations: SectionData[];
};

const _now = new Date();
const _month = String(_now.getMonth() + 1);
const _year = String(_now.getFullYear());

const DEFAULT_DATA: MeetingData = {
  month: _month,
  meetingDate: `${_year}년 ${_month}월`,
  endTime: "11",
  videoTitle: "고성과 조직에는 반드시 '이것'이 확보되어 있습니다.",
  videoSelector: "유통물류사업부",
  videoReason: "고 성과 조직의 핵심 요소를 함께 고민하고 조직에 적용하는 방법론에 대한 강의입니다",
  videoPresentDept: "영업본부",
  videoSummary: "강연자: 황성현 ㈜권팀인사이트(경영컨설팅 전문회사) 대표\n- 고성과 조직은 \"실패하더라도 불이익을 받지 않는다\"는 \"심리적 안정감\"을 구축하고 있음\n- 미래 사회와 인공지능 시대의 조직은 정답을 맞추는 것보다 다양한 해답을 찾는 힘이 필요하며, 실패를 담당히 공유하는 시스템을 구축해야함\n- 과거의 성공방식에 매몰되지 않고, 새로운 세대가 도전을 하도록 리더와 경영진이 심리적 공간을 마련해주는 것이 핵심임",
  scripts: {
    opening: "월 업무혁신회의를 시작하겠습니다.",
    videoIntro: "다음으로 동영상 시청이 있겠습니다. 금일 동영상은",
    videoReason: "이번 동영상은",
    planningTeam: "경영기획팀에서 월 경영전략회의 지시사항 팔로우업 해주시기 바랍니다.",
    closing: "각 팀별로 전달사항이나 특이사항 있으시면 공유해 주시기 바랍니다.",
    finalReport: "대표님, 금일 발표는 다 끝났습니다.",
    ending: "이상으로",
  },
  presentations: [
    {
      from: "9:25", to: "9:50", dept: "관리담당", presenter: "서선범 팀장", team: "정보전략팀",
      topic: "유통물류 시스템 모바일 PWA 전환 추진 결과 보고",
      summary: "유통물류 가맹점 점주의 스마트폰 접속 편의성 향상을 위해 앱과 유사한 방식의 간편 접속 기능에 대한 지속적인 요구사항을 반영하여 시스템 개발\n- 앱 개발 없이 앱 수준의 편의성 제공 (유지보수 비용발생 無)\n- 안드로이드·맥·윈도우 하나의 코드로 각각의 코드 동시 지원",
      discussion: [
        { agenda: "근무 체계 변경 및 고령 근로자 노무 관리", relatedDept: "인사팀, 노무팀, 안전보건팀", keyContent: "영업시간 연장에 따른 교대 근무조 편성, 고령 근로자 근무시간 확대, 본사 및 타부서 백업 프로세스 구축", discussionPoints: "고령 근로자 건강 및 안전 문제, 1인 근무 보안 대책, 근로계약서 재작성 절차", risks: "고령 근로자 안전사고 위험, 건강 문제, 보안 취약점" },
        { agenda: "최고가격제 대응 및 수배송 단가 인상안", relatedDept: "기획팀, 재무팀, 물류운영팀", keyContent: "최고가격제 시행에 따른 주유소 이익률 개선 방안, 단가 인상(게시가 +50원→+120원) 및 물류비 전가 가능성 분석", discussionPoints: "협력 운송사의 단가 반발 및 이탈 위험, 회사 전체 손익 분석, 주유소 손익과 통합 손익 간 균형", risks: "협력사 이탈 가능성, 비용 증가, 전사 손익 악화 위험" },
        { agenda: "셀프 주유소 전환 타이밍 및 실효성 검토", relatedDept: "경영전략팀, 재무팀, 시설관리팀", keyContent: "초기 투자비 1.2억 원 대비 투자회수 기간 3.6년 검토, 임대 계약 중도 변경 협의, 인원 감축과 매출 영향 분석", discussionPoints: "매출 감소 대비 인건비 절감 효과, 대형 차량 셀프 주유 제한 문제 해결", risks: "투자 회수 불확실성, 매출 감소 위험, 고객 불만 가능성" },
        { agenda: "관계사 물량 Lock-in 및 사내 공동 판촉 활성화", relatedDept: "총무팀, 홍보팀, B2B영업팀", keyContent: "관계사 및 차량 주유 유치 활성화, 사내 프로모션 및 캠페인 추진, 물량 급감 원인 분석", discussionPoints: "임직원 이용 증대 방안, 캠페인 효과 측정, 홍보 및 정산 시스템 편의성", risks: "물량 감소에 따른 매출 하락 우려, 지속적인 관계 관리 필요" },
        { agenda: "수요 예측 기반 재고 및 매입 단가 관리", relatedDept: "물류기획팀, 구매팀", keyContent: "할인 월별 주유량 분석, 가동률·계절별 물동량 데이터 공유, 최적 매입 시점 조정", discussionPoints: "재고 부족 및 과잉 예방, 본사 예측 데이터와 매입 연계 강화", risks: "재고 관리 실패로 인한 비용 증가 및 공급 차질 위험" },
      ],
    },
    {
      from: "9:50", to: "10:15", dept: "영업담당", presenter: "신두삼 팀장", team: "영업지원팀",
      topic: "이커머스 사업 구축 전략",
      summary: "상품 판매 전략을 기존 고객사 중심의 판매를 넘어 인터넷 기반의 불특정 다수 고객 대상으로 확대함으로써 판매채널 다변화를 추진\n가. 사전 검토 사항 (구축사항)\n나. 향후 운영 전략 (상품군, 플랫폼 등)",
      discussion: [
        {
          agenda: "초기 상품 구성 및 체화재고 활용 방안",
          relatedDept: "영업, 구매, 물류운영",
          keyContent: "PB상품 2종, 범용상품 8종(총 10종 내외) 품목 확정 및 마진율 시뮬레이션\n- 물류창고 체화재고 중 이커머스 판매 전환 가능 품목 발굴 및 리스크 감소 방안 협의",
          discussionPoints: "품목별 수익성 분석 및 출시 우선순위 결정\n- 장기재고 활용을 통한 재고 부담 완화와 판매 확대 전략",
          risks: "체화재고 품목의 판매 가능성 및 이커머스 적합성 미확실성\n- 재고 리스크 관리 및 판매 전환 실패 시 비용 발생",
        },
        {
          agenda: "법적 리스크 정비 및 인허가·라벨 수정",
          relatedDept: "인사총무, 구매, 현업",
          keyContent: "유통전문판매업 인허가 취득 일정 점검\n- PB상품 라벨 및 표시사항 수정 작업\n- 생산자배상책임보험 가입 조건 및 범위 검토",
          discussionPoints: "인허가 지연 가능성 관리\n- 라벨 수정에 따른 법적 요건 충족과 소비자 안전 우선",
          risks: "인허가 지연 시 마케팅 일정 및 판매 일정 차질\n- 보험 가입 범위 미흡 시 법적 분쟁 위험",
        },
        {
          agenda: "마케팅·콘텐츠 역량 보완 및 상품 등록",
          relatedDept: "마케팅, 디자인, 영업",
          keyContent: "초기 브랜드 인지도 확보를 위한 검색 유입 및 리뷰 축적 방안\n- 상세 페이지 이미지 및 스토리텔링 콘텐츠 제작 인력 배정\n- 네이버 스마트스토어 상품정보 등록 프로세스 수립",
          discussionPoints: "콘텐츠 제작과 등록 절차의 일정 조율\n- 구매 전환율을 높이기 위한 고객 관점 콘텐츠 기획",
          risks: "부실한 콘텐츠 시 브랜드 인지도 저하 우려\n- 상품 등록 지연으로 인한 판매 기회 손실 가능성",
        },
        {
          agenda: "라이브 오픈을 위한 운영 시스템 구축",
          relatedDept: "정보전략, 재경",
          keyContent: "사방넷(OMS) 도입 및 기존 물류 시스템 연동 협의\n- 네이버쇼핑 API 활용 가격 동향 및 손익분기점 분석 시스템 구축",
          discussionPoints: "시스템 연동 실무 협력 및 데이터 정확성 확보\n- BEP 분석을 통한 가격정책 최적화",
          risks: "시스템 연동 오류 및 안정성 문제\n- 데이터 미흡 시 가격 전략 실패 가능성",
        },
        {
          agenda: "물류/CS 협력사 프로세스 조율",
          relatedDept: "물류운영, 고객지원",
          keyContent: "이천운영팀 택배사 '한박스더' 출고 마감 시간 및 요일 조율\n- CS 대행 협력사 'CS쉐어링' 이커머스 전용 고객 문의 매뉴얼 및 정산 프로세스 정립",
          discussionPoints: "택배 출고 일정 조율 및 지연 최소화 방안\n- CS 대응 문의 표준화 및 업무 프로세스 명확화",
          risks: "출고 지연에 따른 고객 불만 및 신뢰 하락 위험\n- CS 대응 미비에 따른 고객 이탈 가능성",
        },
      ],
    },
    {
      from: "10:15", to: "10:40", dept: "운영담당", presenter: "한성갑 팀장", team: "김해운영2팀",
      topic: "스마일 주유소 김해점 매출확대 및 손익개선방안",
      summary: "스마일 주유소 김해점 매출확대 및 손익개선을 위한 판매전략 개선\n가. 주유소 운영시간 변경검토\n  - 기존: 05:30~22:30(평일), 06:00~21:00(주말)\n  - 변경: 05:30~24:00(평일), 06:00~21:00(주말)\n  ※ 공동물류차량 주유확대 및 협력운송사 주유 확대 전략 구축\n나. 손익 개선 전략\n  - 셀프 주유소 전환 검토(추후 재계약 시, 계약 반영)",
      discussion: [
        { agenda: "근무 체계 변경 및 고령 근로자 노무 관리", relatedDept: "인사팀, 노무팀, 안전보건팀", keyContent: "영업시간 연장에 따른 근무조 편성, 고령 근로자 근무 확대, 백업 프로세스 구축", discussionPoints: "고령 근로자 건강 안전, 1인 근무 보안 대책, 근로계약서 재작성", risks: "인전사고 위험, 건강 리스크, 보안 사고 가능성" },
        { agenda: "최고가격제 대응 및 수배송 단가 인상안", relatedDept: "기획팀, 재무팀, 물류운영팀", keyContent: "최고가격제 시행 후 이익률 개선 방안, 수배송 단가 인상 기준 조정", discussionPoints: "단가 인상에 따른 협력사 반발, 회사 전체 손익 영향 분석", risks: "협력사 이탈 가능성, 전사 손익 균형 문제" },
        { agenda: "셀프 주유소 전환 타이밍 및 실효성 검토", relatedDept: "경영전략팀, 재무팀, 시설관리팀", keyContent: "초기 투자비 대비 투자회수 기간, 임대 계약 중도 변경 협의, 인원 감축 연계", discussionPoints: "매출 감소 리스크, 대형 차량 셀프 주유 제한 해소 방안", risks: "투자회수 불확실성, 매출 감소 대비 인건비 절감 균형" },
        { agenda: "관계사 물량 Lock-in 및 사내 공동 판촉 활성화", relatedDept: "총무팀, 홍보팀, B2B영업팀", keyContent: "관계사 차량 주유 유치, 사내 판촉 활동, 물량 감급 원인 분석", discussionPoints: "캠페인 효과, 홍보 및 정산 시스템 편의성 강화", risks: "물량 감소에 따른 매출 영향, 지속적 관계 관리 필요" },
        { agenda: "수요 예측 기반 재고 및 매입 단가 관리", relatedDept: "물류기획팀, 구매팀", keyContent: "할인 주유량 변동 분석, 가동률 및 계절별 물동량 공유, 매입 최적화", discussionPoints: "재고 부족/과잉 방지, 본사 예측 데이터 연동 강화", risks: "재고 관리 실패에 따른 비용 증가 위험" },
      ],
    },
  ],
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
      "dept": "담당 구분 (예: 관리담당, 영업담당, 없으면 빈 문자열)",
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
    const updated: Partial<MeetingData> = {};
    if (aiResult.month) updated.month = aiResult.month;
    if (aiResult.meetingDate) updated.meetingDate = aiResult.meetingDate;
    if (aiResult.endTime) updated.endTime = aiResult.endTime;
    if (aiResult.videoTitle) updated.videoTitle = aiResult.videoTitle;
    if (aiResult.videoSelector) updated.videoSelector = aiResult.videoSelector;
    if (aiResult.videoReason) updated.videoReason = aiResult.videoReason;
    updated.presentations = (aiResult.presentations || []).map((p) => ({
      from: p.from || "", to: p.to || "",
      dept: (p as { dept?: string }).dept || "",
      presenter: p.presenter || "", team: p.team || "",
      topic: p.topic || "", summary: "", discussion: [],
    }));
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

  const setPres = (i: number, field: keyof SectionData, val: string) =>
    setLocal((p) => {
      const arr = [...p.presentations];
      arr[i] = { ...arr[i], [field]: val };
      return { ...p, presentations: arr };
    });

  const addRow = () =>
    setLocal((p) => ({
      ...p,
      presentations: [...p.presentations, { from: "", to: "", dept: "", presenter: "", team: "", topic: "", summary: "", discussion: [] }],
    }));

  const removeRow = (i: number) =>
    setLocal((p) => ({ ...p, presentations: p.presentations.filter((_, idx) => idx !== i) }));

  const handleSave = () => {
    onChange(local);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50">
      {/* 마스터 헤더 */}
      <div className="bg-white border-b border-gray-200 px-8 py-5 flex items-center justify-between sticky top-0 z-10">
        <div>
          <h2 className="text-lg font-bold text-gray-900">회의 설정</h2>
          <p className="text-xs text-gray-400 mt-0.5">회의 기본 정보와 각 본부별 발표 시간 / 발표자를 설정합니다</p>
        </div>
        <div className="flex items-center gap-3">
          {saved && (
            <p className="text-xs text-emerald-600 font-medium hidden sm:block">
              ✓ 저장 완료! 사이드바 <strong>[진행자 멘트]</strong>에서 최종 스크립트를 확인하세요.
            </p>
          )}
          <button
            onClick={handleSave}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm ${
              saved ? "bg-emerald-500 text-white" : "bg-indigo-600 hover:bg-indigo-700 text-white"
            }`}
          >
            {saved ? "✓ 저장됨" : "저장하기"}
          </button>
        </div>
      </div>

      <div className="px-8 py-6 max-w-4xl space-y-6">

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
            <Field label="동영상 선정사유 발표 부서" value={local.videoPresentDept ?? "영업본부"} onChange={(v) => set("videoPresentDept", v)} />
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
                  { label: "동영상 시청", from: "9:00", to: "9:18" },
                  { label: "경영기획팀 보고", from: "9:18", to: "9:25" },
                  { label: "전체 공유", from: "", to: "" },
                  { label: "대표님 보고 → 맺음말", from: "", to: `${local.endTime}:00` },
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
          <div className="p-6 space-y-3 overflow-x-auto">
            {local.presentations.length === 0 ? (
              <div className="text-center py-8 text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-xl">
                <p className="text-2xl mb-2">📋</p>
                <p>AI 일정 추출 또는 + 버튼으로 발표 일정을 추가하세요</p>
              </div>
            ) : (
              <table className="w-full border-collapse border border-gray-200">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-600 text-center w-8">#</th>
                    <th className="border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-600 text-center w-24">시작</th>
                    <th className="border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-600 text-center w-24">종료</th>
                    <th className="border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-600 text-center w-28">담당구분</th>
                    <th className="border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-600 text-center w-28">발표자</th>
                    <th className="border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-600 text-center w-32">소속팀</th>
                    <th className="border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-600 text-left">발표주제</th>
                    <th className="border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-600 text-left">회의내용요약</th>
                    <th className="border border-gray-200 px-2 py-2 w-8"></th>
                  </tr>
                </thead>
                <tbody>
                  {local.presentations.map((s, i) => (
                    <tr key={i} className="hover:bg-indigo-50/30">
                      <td className="border border-gray-200 px-2 py-2 text-center text-xs text-gray-400 font-mono">{i + 1}</td>
                      {(["from", "to"] as (keyof SectionData)[]).map((f) => (
                        <td key={f} className="border border-gray-200 px-2 py-2">
                          <input type="text" value={s[f]} onChange={(e) => setPres(i, f, e.target.value)}
                            className="w-full border border-gray-200 rounded px-2 py-1 text-xs text-center focus:outline-none focus:ring-1 focus:ring-indigo-400" />
                        </td>
                      ))}
                      {(["dept", "presenter", "team", "topic", "summary"] as (keyof SectionData)[]).map((f) => (
                        <td key={f} className="border border-gray-200 px-2 py-2">
                          <input type="text" value={s[f]} onChange={(e) => setPres(i, f, e.target.value)}
                            className="w-full border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-400" />
                        </td>
                      ))}
                      <td className="border border-gray-200 px-2 py-2 text-center">
                        <button onClick={() => removeRow(i)}
                          className="text-red-400 hover:text-red-600 text-xs font-bold transition">✕</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            <button onClick={addRow}
              className="flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-800 transition border border-indigo-200 hover:border-indigo-400 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100">
              + 행 추가
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────
   멘트 시트 화면
─────────────────────────────────────────── */
function ScriptPage({ data, onDataChange, isOnline, onOpenModal }: { data: MeetingData; onDataChange: (d: MeetingData) => void; isOnline: boolean; onOpenModal: (idx: number) => void }) {
  const { month, meetingDate, endTime, videoTitle, videoSelector, videoReason, videoPresentDept, scripts, presentations } = data;

  const set = (key: keyof MeetingData) => (v: string) => onDataChange({ ...data, [key]: v });
  const setPresTopic = (i: number) => (v: string) => {
    const arr = [...presentations];
    arr[i] = { ...arr[i], topic: v };
    onDataChange({ ...data, presentations: arr });
  };
  const setPresSummary = (i: number) => (v: string) => {
    const arr = [...presentations];
    arr[i] = { ...arr[i], summary: v };
    onDataChange({ ...data, presentations: arr });
  };

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

  type RowItem = { from: string; to: string; label: string; dept?: string; presenter: string; topic?: string; summary?: string; presIdx?: number; hasDetail?: boolean; onSummaryChange?: (v: string) => void; script: React.ReactNode; notes: string; bg?: string };

  const presRows: RowItem[] = presentations.map((p, i) => ({
    from: p.from, to: p.to, label: p.team, dept: p.dept || `발표 ${i + 1}`, presenter: p.presenter,
    topic: p.topic, summary: p.summary, presIdx: i,
    hasDetail: true,
      script: (
        <div className="space-y-1">
        <p>○ {p.team === "정보전략팀"
          ? `${p.team} 발표드리겠습니다.`
          : `${p.team || p.dept || ""} 발표해 주시기 바랍니다.`}
        </p>
        {p.topic && (
          <p className="text-[13px] text-blue-600 pl-3">→ <E value={p.topic} onChange={setPresTopic(i)} w="220px" /></p>
        )}
        {(p.discussion?.length ?? 0) > 0 && (
          <div className="pl-3 mt-1.5 space-y-1">
            <button
              onClick={(e) => { e.stopPropagation(); onOpenModal(i); }}
              className="text-[13px] text-violet-600 font-semibold hover:text-violet-800 hover:underline transition-colors"
            >
              📋 토의 안건 {p.discussion.length}건 →
            </button>
            <ul className="pl-1 space-y-0.5">
              {p.discussion.map((d, di) => (
                <li key={di} className="text-[13px] text-gray-500 flex items-start gap-1">
                  <span className="text-gray-300 flex-shrink-0 mt-0.5">·</span>
                  <span className="leading-snug">{d.agenda}</span>
                </li>
              ))}
            </ul>
        </div>
        )}
        </div>
      ),
    notes: "",
  }));

  const rows: RowItem[] = [
    {
      from: "9:00", to: "9:18", label: "동영상 시청", dept: "", presenter: videoSelector, bg: "bg-slate-50",
      summary: data.videoSummary,
      onSummaryChange: (v) => onDataChange({ ...data, videoSummary: v }),
      script: (
        <div className="space-y-1.5">
          <p>○ <E value={month} onChange={set("month")} w="28px" />월 {scripts.opening}{" "}
            <span className="text-gray-400 italic">[상호 인사]</span></p>
          <p className="text-gray-500">(시간표) 금일 회의는 동영상 시청 및 각 본부별 업무개선사항 발표 후{" "}
            <E value={endTime} onChange={set("endTime")} w="24px" />시에 종료하도록 하겠습니다.</p>
          <p>○ {scripts.videoIntro} 「<E value={videoTitle} onChange={set("videoTitle")} w="220px" />」입니다.</p>
          <p className="text-gray-500">
            : {scripts.videoReason}{" "}
            <E value={videoSelector} onChange={set("videoSelector")} w="80px" />에서 선정한 동영상으로,{" "}
            <E value={videoReason} onChange={set("videoReason")} w="260px" />
          </p>
          <p>○ <E value={videoPresentDept ?? "영업본부"} onChange={set("videoPresentDept")} w="72px" />에서 동영상 선정사유 설명해 주시기 바랍니다.</p>
        </div>
      ),
      notes: "",
    },
    {
      from: "9:18", to: "9:25", label: "기획담당", dept: "기획담당", presenter: "경영기획팀",
      script: <p>○ {scripts.planningTeam.replace("월", `${month}월`)}</p>,
      notes: "",
    },
    ...presRows,
    {
      from: "10:40", to: "10:50", label: "전체", dept: "전체", presenter: "회의진행", bg: "bg-gray-50",
      script: (
        <div className="space-y-1">
          <p>○ {scripts.closing}</p>
          <p className="font-semibold text-gray-700">○ {scripts.finalReport}</p>
        </div>
      ),
      notes: "",
    },
    {
      from: "", to: `${endTime}:00`, label: "전체", dept: "전체", presenter: "사장님", bg: "bg-blue-50",
      script: (
        <p>
          ○ 대표님 맺음말{" "}
          <span className="text-gray-400 italic ml-1">[발언 후]</span>
          {" "}→ {scripts.ending} <E value={month} onChange={set("month")} w="28px" />월 업무혁신회의를 마치겠습니다.{" "}
          <span className="text-gray-400 italic">[상호 인사]</span>
        </p>
      ),
      notes: "",
    },
  ];

  const hdrColor = "#2d3e56";

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
              <h1 className="text-[13px] font-bold tracking-tight text-white">업무혁신회의 — 진행자 멘트</h1>
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
        <div className="flex flex-wrap gap-x-5 gap-y-1 text-[11px] text-gray-400 items-center">
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-2.5 h-2.5 rounded bg-yellow-100 border border-yellow-300" />
            노란 박스 = 클릭하여 직접 수정
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-2.5 h-2.5 rounded bg-indigo-100 border border-indigo-300" />
            담당/팀 셀 클릭 = 세부 토의 안건 페이지로 이동
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-2.5 h-2.5 rounded bg-blue-100 border border-blue-200" />
            요약 셀 = 클릭하여 회의 내용 직접 입력
          </span>
        </div>
      </div>

      {/* 빈 일정 안내 배너 */}
      {presentations.length === 0 && (
        <div className="mx-6 mb-2 no-print bg-amber-50 border border-amber-200 rounded-xl px-5 py-4 flex gap-3 items-start">
          <span className="text-xl mt-0.5 flex-shrink-0">📌</span>
          <div>
            <p className="text-sm font-semibold text-amber-800 mb-1">발표 일정이 없습니다</p>
            <p className="text-xs text-amber-700 leading-relaxed">
              사이드바 <strong>[AI 일정 추출]</strong>에서 회의 시간표 이미지를 업로드하거나,{" "}
              <strong>[회의 설정]</strong>에서 직접 발표자를 추가하세요.
            </p>
          </div>
        </div>
      )}

      {/* 메인 테이블 */}
      <div className="px-6 pb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-300 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse min-w-[700px]" style={{ borderColor: "#b0b8c4" }}>
              <thead>
                {/* 1행: 대분류 헤더 */}
                <tr style={{ backgroundColor: hdrColor }} className="text-white text-[13px]">
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
                <tr style={{ backgroundColor: hdrColor }} className="text-white text-[12px]">
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
                      <td className="border border-gray-300 px-3 py-3 text-center font-bold text-[13px] text-gray-700 whitespace-nowrap align-middle"
                        style={isLast ? { fontWeight: 800 } : {}}>
                        <span style={isLast ? { textDecoration: "underline" } : {}}>
                      {row.from}
                        </span>
                        <span className="mx-1.5 text-gray-400 font-normal">-</span>
                        <span style={isLast ? { fontWeight: 800, textDecoration: "underline" } : {}}>
                      {row.to}
                        </span>
                    </td>
                      {/* 담당 */}
                      <td
                        className={`border border-gray-300 px-3 py-3 text-center text-[13px] font-bold text-gray-700 align-middle whitespace-nowrap ${row.hasDetail ? "cursor-pointer hover:bg-indigo-50 hover:text-indigo-700 transition-colors group" : ""}`}
                        onClick={row.hasDetail && row.presIdx !== undefined ? () => onOpenModal(row.presIdx!) : undefined}
                        title={row.hasDetail ? "클릭하여 세부 토의 안건 보기" : undefined}
                      >
                        {row.dept || row.label}
                        {row.hasDetail && (
                          <span className="block text-[10px] text-indigo-400 font-normal mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            세부보기 →
                      </span>
                        )}
                    </td>
                      {/* 팀/발표자 */}
                      <td
                        className={`border border-gray-300 px-3 py-3 text-center text-[13px] text-gray-600 align-middle leading-snug ${row.hasDetail ? "cursor-pointer hover:bg-indigo-50 transition-colors" : ""}`}
                        onClick={row.hasDetail && row.presIdx !== undefined ? () => onOpenModal(row.presIdx!) : undefined}
                      >
                        <div className="font-semibold text-gray-800">{row.label !== row.dept ? row.label : ""}</div>
                        {row.presenter && row.presenter !== row.label && (
                          <div className="text-gray-500 text-[13px] mt-0.5">({row.presenter})</div>
                        )}
                    </td>
                      {/* 발표내용 + 진행자 멘트 */}
                      <td className="border border-gray-300 px-4 py-3 text-[13px] text-gray-800 align-top leading-relaxed">
                      {row.script}
                      <Notes text={row.notes} />
                    </td>
                      {/* 회의내용 요약 */}
                      <td className="border border-gray-300 px-4 py-3 text-[13px] text-gray-700 align-top leading-relaxed">
                        {(row.presIdx !== undefined || row.onSummaryChange) ? (
                          <span
                            contentEditable
                            suppressContentEditableWarning
                            onBlur={(e) => {
                              const val = e.currentTarget.textContent ?? "";
                              if (row.presIdx !== undefined) setPresSummary(row.presIdx)(val);
                              else row.onSummaryChange?.(val);
                            }}
                            className="block w-full min-h-[40px] whitespace-pre-wrap focus:outline-none focus:ring-1 focus:ring-indigo-300 rounded px-1"
                            title="클릭하여 요약 입력"
                          >
                            {row.summary || ""}
                          </span>
                        ) : row.summary ? (
                          <div className="whitespace-pre-wrap">{row.summary}</div>
                        ) : (
                          <span className="text-gray-300 text-xs italic">-</span>
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
   세부 토의 페이지
─────────────────────────────────────────── */
const DISC_COLS: { key: keyof DiscussionItem; label: string; width: string }[] = [
  { key: "agenda",           label: "안건",             width: "w-40" },
  { key: "relatedDept",      label: "관련 부서",         width: "w-32" },
  { key: "keyContent",       label: "핵심 발표 내용",    width: "w-56" },
  { key: "discussionPoints", label: "주요 논의 포인트",  width: "w-56" },
  { key: "risks",            label: "리스크 및 검토 사항", width: "w-48" },
];

function DetailPage({
  pres, onBack, onUpdate,
}: {
  pres: SectionData;
  onBack: () => void;
  onUpdate: (items: DiscussionItem[]) => void;
}) {
  const [items, setItems] = useState<DiscussionItem[]>(pres.discussion ?? []);
  const [toast, setToast] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const setCell = (i: number, key: keyof DiscussionItem, val: string) => {
    setItems((prev) => {
      const next = [...prev];
      next[i] = { ...next[i], [key]: val };
      return next;
    });
  };

  const addRow = () =>
    setItems((p) => [...p, { agenda: "", relatedDept: "", keyContent: "", discussionPoints: "", risks: "" }]);

  const removeRow = (i: number) => setItems((p) => p.filter((_, idx) => idx !== i));

  const handleSave = () => {
    onUpdate(items);
    setToast(true);
    setTimeout(() => setToast(false), 2000);
  };

  const handleExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const wb = XLSX.read(ev.target?.result, { type: "array" });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rows: string[][] = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" }) as string[][];
      const dataRows = rows.filter((r) => r.some((c) => String(c).trim()));
      const headerRow = dataRows[0] ?? [];
      const isHeader = headerRow.some((h) =>
        ["안건", "관련", "핵심", "주요", "리스크"].some((kw) => String(h).includes(kw))
      );
      const body = isHeader ? dataRows.slice(1) : dataRows;
      const parsed: DiscussionItem[] = body.map((r) => ({
        agenda:           String(r[0] ?? ""),
        relatedDept:      String(r[1] ?? ""),
        keyContent:       String(r[2] ?? ""),
        discussionPoints: String(r[3] ?? ""),
        risks:            String(r[4] ?? ""),
      }));
      setItems(parsed);
    };
    reader.readAsArrayBuffer(file);
    e.target.value = "";
  };

  const handleDownloadTemplate = () => {
    const ws = XLSX.utils.aoa_to_sheet([
      ["안건", "관련 부서", "핵심 발표 내용", "주요 논의 포인트", "리스크 및 검토 사항"],
      ["", "", "", "", ""],
    ]);
    ws["!cols"] = [{ wch: 24 }, { wch: 20 }, { wch: 32 }, { wch: 32 }, { wch: 28 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "토의안건");
    XLSX.writeFile(wb, "토의안건_양식.xlsx");
  };

  return (
    <div className="h-full flex flex-col bg-slate-100 overflow-hidden">
      {/* 저장 토스트 */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-[60] bg-emerald-600 text-white px-5 py-3 rounded-xl shadow-lg text-sm font-medium flex items-center gap-2 pointer-events-none">
          ✓ 저장되었습니다
        </div>
      )}
      {/* 헤더 */}
      <header className="flex-shrink-0 text-white shadow-md"
        style={{ background: "linear-gradient(90deg, #0f172a 0%, #1e1b4b 60%, #312e81 100%)", borderBottom: "1px solid rgba(139,92,246,0.25)" }}>
        <div className="px-4 py-2.5 flex items-center gap-4">
          <button onClick={() => { handleSave(); onBack(); }}
            className="flex items-center gap-1.5 text-sm text-white/70 hover:text-white transition whitespace-nowrap">
            ← 진행자 멘트로 돌아가기 (자동 저장)
          </button>
          <div className="w-px h-5 bg-white/20" />
          <div>
            <p className="text-[11px] text-indigo-300 font-medium">{pres.dept} · {pres.team} ({pres.presenter})</p>
            <h1 className="text-[14px] font-bold text-white truncate max-w-xl">{pres.topic}</h1>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <button onClick={handleDownloadTemplate}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white/10 hover:bg-white/20 text-white transition">
              ↓ 양식 다운로드
            </button>
            <button onClick={() => fileRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-500 hover:bg-emerald-400 text-white transition">
              📂 엑셀 업로드
            </button>
            <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={handleExcel} />
            <button onClick={() => { handleSave(); onBack(); }}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold bg-indigo-500 hover:bg-indigo-400 text-white transition">
              저장 후 닫기
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-auto p-3">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden h-full flex flex-col">
          <div className="px-4 py-2.5 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
            <div>
              <h2 className="text-sm font-bold text-gray-800">세부 토의 안건</h2>
              <p className="text-xs text-gray-400">엑셀 업로드 또는 직접 입력하여 내용을 관리하세요.</p>
            </div>
            <div className="text-xs text-gray-400">{items.length}개 안건</div>
          </div>

          <div className="overflow-auto flex-1">
            <table className="w-full border-collapse text-[13px]">
              <thead>
                <tr className="bg-gray-700 text-white">
                  <th className="border border-gray-600 px-3 py-2.5 text-center font-semibold w-8 text-[11px]">#</th>
                  {DISC_COLS.map((c) => (
                    <th key={c.key} className={`border border-gray-600 px-3 py-2.5 text-left font-semibold ${c.width}`}>{c.label}</th>
                  ))}
                  <th className="border border-gray-600 px-2 py-2.5 w-8"></th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-16 text-center text-gray-400">
                      <p className="text-2xl mb-2">📋</p>
                      <p className="text-sm">엑셀 업로드 또는 + 버튼으로 안건을 추가하세요</p>
                    </td>
                  </tr>
                ) : (
                  items.map((item, i) => (
                    <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                      <td className="border border-gray-200 px-2 py-2 text-center text-[11px] text-gray-400 font-mono">{i + 1}</td>
                      {DISC_COLS.map((c) => (
                        <td key={c.key} className="border border-gray-200 px-2 py-1.5 align-top">
                          <textarea
                            value={item[c.key]}
                            onChange={(e) => setCell(i, c.key, e.target.value)}
                            rows={2}
                            className="w-full resize-none text-[12px] text-gray-700 leading-relaxed focus:outline-none focus:ring-1 focus:ring-indigo-400 rounded px-1 py-0.5 bg-transparent hover:bg-indigo-50/30 transition"
                          />
                        </td>
                      ))}
                      <td className="border border-gray-200 px-2 py-2 text-center align-top">
                        <button onClick={() => removeRow(i)} className="text-red-400 hover:text-red-600 text-xs font-bold transition">✕</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="px-4 py-2.5 border-t border-gray-100 flex items-center gap-3 flex-shrink-0">
            <button onClick={addRow}
              className="flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-800 transition border border-indigo-200 hover:border-indigo-400 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100">
              + 행 추가
            </button>
            <button onClick={handleSave}
              className="flex items-center gap-1.5 text-xs font-medium text-emerald-700 hover:text-emerald-900 transition border border-emerald-200 hover:border-emerald-400 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100">
              ✓ 저장
            </button>
          </div>
        </div>
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
  const [detailModal, setDetailModal] = useState<number | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  // localStorage에서 데이터 로드 또는 기본값 사용
  const [data, setData] = useState<MeetingData>(() => {
    try {
      const saved = localStorage.getItem("meeting_data_v6");
      return saved ? JSON.parse(saved) : DEFAULT_DATA;
    } catch {
      return DEFAULT_DATA;
    }
  });
  
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // 데이터 변경 시 자동 저장
  useEffect(() => {
    localStorage.setItem("meeting_data_v6", JSON.stringify(data));
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
    { id: "script", icon: "📋", label: "진행자 멘트",  sub: "회의 당일 진행 스크립트 확인·출력" },
    { id: "ai",     icon: "✨", label: "AI 일정 추출", sub: "회의 시간표 이미지 → 자동 일정 생성" },
    { id: "master", icon: "⚙️", label: "회의 설정",    sub: "발표자·시간·주제·멘트 문구 관리" },
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
          {sidebarOpen && (
            <div className="mx-0.5 mb-3 px-3 py-2 rounded-lg text-[10px]"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <p className="font-semibold mb-1" style={{ color: "rgba(148,163,184,0.5)" }}>사용 순서</p>
              <p style={{ color: "rgba(167,139,250,0.8)" }}>✨ AI 추출 → ⚙️ 회의 설정 → 📋 출력</p>
            </div>
          )}
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
        <ScriptPage
          data={data}
          onDataChange={setData}
          isOnline={isOnline}
          onOpenModal={(idx) => setDetailModal(idx)}
        />
      )}

      {/* ── 세부 토의 안건 모달 ── */}
      {detailModal !== null && data.presentations[detailModal] && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-2"
          style={{ background: "rgba(0,0,0,0.65)" }}
          onClick={() => setDetailModal(null)}
        >
          <div
            className="relative bg-white rounded-xl shadow-2xl flex flex-col overflow-hidden"
            style={{ width: "98vw", height: "96vh", maxWidth: "none" }}
            onClick={(e) => e.stopPropagation()}
          >
            <DetailPage
              pres={data.presentations[detailModal]}
              onBack={() => setDetailModal(null)}
              onUpdate={(items) => {
                const updated = [...data.presentations];
                updated[detailModal] = { ...updated[detailModal], discussion: items };
                setData({ ...data, presentations: updated });
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
