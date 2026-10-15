// production은 기존 생산기술 링크(#production)를 유지한다.
export type RoleId = 'planning' | 'production' | 'qc' | 'qa';
export type ToolId = 'production' | 'equipment' | 'inspection' | 'ncr' | 'regulation' | 'claim' | 'supplier' | 'hygiene';
export interface WorkItem {
  name: string; desc: string; cadence: 'routine' | 'event'; when: string;
  partners?: string; tool?: ToolId;
}
export interface WorkArea { id: string; name: string; desc: string; tasks: WorkItem[] }
export interface Scenario {
  id: string; name: string; trigger: string;
  steps: Array<{ name: string; desc: string; tool?: ToolId }>;
  output: string;
}
export interface Role {
  id: RoleId; name: string; question: string; mission: string; boundary: string;
  areas: WorkArea[]; scenarios: Scenario[];
  collaborations: Array<{ name: string; partners: string; contribution: string }>;
  problems: Array<{ problem: string; ai: string }>;
  split: { code: string; ai: string; human: string };
  tools: Array<{ id: ToolId; name: string; desc: string }>;
}
export const ROLE_SOURCES = [
  { name: 'LS · 생산관리·생산기술·설비보전', url: 'https://careers.lscablebiz.com/content/jobInfo/?locale=ko_KR' },
  { name: 'O*NET · 생산계획 업무', url: 'https://www.onetonline.org/link/summary/43-5061.00' },
  { name: 'O*NET · 제조 엔지니어 업무', url: 'https://www.onetonline.org/link/summary/17-2112.03' },
  { name: 'ASQ · QA와 QC의 중심 역할', url: 'https://asq.org/quality-resources/quality-assurance-vs-control' },
  { name: '오뚜기 · 식품 제조 적용 사례', url: 'https://www.otoki.com/about/job-intro' },
];
export const ROLE_SCOPE = '공식 직무 자료를 비교해 식품 제조 사례로 재구성한 학습용 안내입니다. 회사마다 업무 분장·승인 권한은 다르며, 실제 작업표준이나 안전·품질 절차를 대신하지 않습니다.';
const TOOL_INFO: Record<ToolId, Role['tools'][number]> = {
  production: { id: 'production', name: '생산지표 분석·보고서', desc: '생산관리·생산기술 공통 · 생산 실적 계산과 보고서 초안. 생산계획 자동 편성 기능은 아닙니다.' },
  equipment: { id: 'equipment', name: '설비 이상 진단 · 설비보전 협업', desc: '센서 이상 징후와 점검 초안. 현장 진단·정비 판단은 설비보전 담당과 협의합니다.' },
  inspection: { id: 'inspection', name: '검사 데이터 이상 탐지', desc: '관리도·공정능력·추세 계산과 해석 초안. 경고 자체가 출하 판정은 아닙니다.' },
  ncr: { id: 'ncr', name: '부적합 보고서 초안', desc: 'QC·QA 공통 · 현장 메모 구조화, 추가 질문과 인용 대조를 제공합니다.' },
  regulation: { id: 'regulation', name: '법규 개정 영향도 분석', desc: 'QC·QA 공통 · 제공한 조문의 영향 검토 초안. 최신 법규 자동 수집 기능은 아닙니다.' },
  claim: { id: 'claim', name: '클레임 분류·회신 초안', desc: 'QA·QC·고객상담 협업 · 접수 내용 분류와 조사 항목·회신 초안을 만듭니다.' },
  hygiene: { id: 'hygiene', name: '위생점검 분석', desc: 'QC·QA 공통 · 반복 지적·기한 초과 집계와 점검 중점 제안. 종결은 사람이 검토합니다.' },
  supplier: { id: 'supplier', name: '협력업체 통보서 초안', desc: 'QA·QC·구매 협업 · 메모·업체 이력을 대조하고 조사·시정조치 요청 초안을 만듭니다.' },
};
const tools = (...ids: ToolId[]) => ids.map((id) => TOOL_INFO[id]);

export const ROLES: Role[] = [
  {
    id: 'planning', name: '생산관리', question: '무엇을, 얼마나, 언제까지 만들 것인가?',
    mission: '수요·재고·생산능력을 맞춰 계획을 운영하고, 자원과 일정을 조율해 납기를 관리합니다.',
    boundary: '공정조건 개선은 생산기술과, 설비 정비는 설비보전과 협의합니다. 납기를 이유로 안전·품질 기준을 생략하지 않습니다.',
    areas: [
      { id: 'plan', name: '생산계획·일정', desc: '수요와 생산 제약을 연결합니다.', tasks: [
        { name: '생산계획 검토', desc: '주문·재고·라인 능력·작업 가능 시간을 확인해 일정과 수량을 조율합니다.', cadence: 'routine', when: '일·주·월 계획 주기', partners: '영업·자재·현장' },
        { name: '변경 주문 대응', desc: '납기 영향과 대체 일정을 비교하고 관련 부서와 합의합니다.', cadence: 'event', when: '주문·입고 일정 변경 시', partners: '영업·구매' },
      ] },
      { id: 'resources', name: '자재·인력·라인 조율', desc: '계획에 필요한 자원을 점검합니다.', tasks: [
        { name: '가용 자원 확인', desc: '원부자재 입고, 작업 인원, 설비 가용시간과 검사 대기 물량을 확인합니다.', cadence: 'routine', when: '생산 준비·교대 시', partners: '자재·현장·QC' },
        { name: '부족 자원 조정', desc: '생산 순서와 입고 조정 대안을 검토합니다. 대체 원료는 승인 절차를 따릅니다.', cadence: 'event', when: '자재 부족·결원·설비 정지 시', partners: '구매·QA·설비보전' },
      ] },
      { id: 'performance', name: '실적·손실 관리', desc: '계획과 실행의 차이를 확인합니다.', tasks: [
        { name: '생산지표 점검', desc: '생산량·수율·가동률과 기록 누락을 확인하고 보고를 준비합니다.', cadence: 'routine', when: '일·주·월 실적 마감', partners: '생산관리·생산기술 공통', tool: 'production' },
        { name: '계획 차이 조사', desc: '입력한 계획·실적의 달성률과 미달 경고를 확인하고 지연 원인을 조사합니다. 계획 재편성은 사람이 수행합니다.', cadence: 'event', when: '생산 미달·지연 시', partners: '생산기술·현장', tool: 'production' },
      ] },
    ],
    scenarios: [
      { id: 'delay', name: '입고 지연으로 생산계획을 바꿔야 할 때', trigger: '원료 입고가 늦어져 기존 계획의 실행이 어려운 상황', steps: [
        { name: '영향 확인', desc: '사용 가능한 재고, 부족 수량, 영향 주문과 납기를 확인합니다.' },
        { name: '대안 비교', desc: '입고 앞당기기·생산 순서 변경의 납기·비용·품질 제약을 비교합니다.' },
        { name: '합의·계획 변경', desc: '구매·영업·현장과 승인된 조정안을 공유합니다.' },
        { name: '실행·재점검', desc: '입고와 생산 진척을 확인하고 실적·차이를 기록합니다.', tool: 'production' },
      ], output: '수정 계획, 협의 기록, 납기 영향과 실행 결과 — 계획 변경 자체는 사람이 수행합니다.' },
      { id: 'shortfall', name: '생산 실적이 계획보다 부족할 때', trigger: '마감 시 목표 물량 미달을 발견한 상황', steps: [
        { name: '기록 확인', desc: '생산 CSV의 지표와 실제 기록을 확인합니다.', tool: 'production' },
        { name: '원인 분리', desc: '자재·인원·설비·품질 대기 원인을 담당자와 확인합니다.' },
        { name: '복구안 조율', desc: '생산능력과 안전·품질 기준 안에서 일정 조정안을 협의합니다.' },
        { name: '결과 공유', desc: '회복 물량과 남은 위험을 보고하고 다음 계획에 반영합니다.' },
      ], output: '실적 보고와 복구 일정·확인할 사항' },
    ],
    collaborations: [
      { name: '수율·생산성 개선', partners: '생산관리 · 생산기술', contribution: '생산관리는 실적·납기 영향을, 생산기술은 공정·작업방법 개선을 검토합니다.' },
      { name: '설비 정지 대응', partners: '생산관리 · 설비보전 · 생산기술', contribution: '일정 조율, 현장 진단·정비, 공정 영향 검토를 나누어 협의합니다.' },
    ],
    problems: [{ problem: '생산 실적을 취합하고 설명하는 일이 반복된다', ai: '계산한 지표를 바탕으로 보고서 초안을 작성합니다. 일정 자동 최적화는 제공하지 않습니다.' }],
    split: { code: '생산 실적 지표·이상치 계산', ai: '실적 해석·원인 가설·보고서 초안', human: '계획 수립, 자원·납기 조정과 부서 간 합의' },
    tools: tools('production'),
  },
  {
    id: 'production', name: '생산기술', question: '어떻게 안정적이고 효율적으로 만들 것인가?',
    mission: '공정조건과 작업방법을 개선하고, 설비·품질 담당과 함께 생산성과 공정 안정성을 높입니다.',
    boundary: '물량·납기 중심 계획 운영과 구분합니다. 설비 이상 도구는 설비보전과의 협업 보조이며 고장 확정·수리 지시를 대신하지 않습니다.',
    areas: [
      { id: 'process', name: '공정조건·작업 표준', desc: '일관되게 생산하는 방법을 관리합니다.', tasks: [
        { name: '공정조건 점검', desc: '온도·속도 등 관리 조건과 실제 작업의 차이를 확인합니다.', cadence: 'routine', when: '공정 운영·정기 검토', partners: '현장·QC' },
        { name: '작업방법 변경 검토', desc: '시험 범위·위험·검증 기준을 정하고 승인 후 표준에 반영합니다.', cadence: 'event', when: '작업방법·조건 변경 시', partners: 'QA·현장' },
      ] },
      { id: 'improvement', name: '수율·병목 개선', desc: '손실을 기술적 개선 과제로 연결합니다.', tasks: [
        { name: '손실 추세 분석', desc: '수율·가동률과 정지 기록을 보고 개선할 구간을 찾습니다.', cadence: 'routine', when: '주·월 개선 검토', partners: '생산관리·생산기술 공통', tool: 'production' },
        { name: '개선 시험', desc: '원인 가설을 바탕으로 시험하고 개선 전후를 같은 조건에서 비교합니다.', cadence: 'event', when: '병목·수율 저하 발견 시', partners: 'QC·생산관리' },
      ] },
      { id: 'equipment', name: '설비 적용·양산 준비', desc: '생산 조건과 설비의 연결을 검토합니다.', tasks: [
        { name: '설비 징후 공동 검토', desc: '센서 변화와 운전 조건을 정리해 설비보전 담당에게 전달합니다.', cadence: 'routine', when: '정기 점검·징후 검토', partners: '설비보전 협업', tool: 'equipment' },
        { name: '신제품·신설비 시험생산', desc: '라인 적용성·생산능력·품질 조건을 확인하고 양산을 준비합니다.', cadence: 'event', when: '신제품·설비 도입 시', partners: '개발·QA·설비보전' },
      ] },
    ],
    scenarios: [
      { id: 'yield', name: '수율 저하의 개선 효과를 확인할 때', trigger: '동일 품목의 손실이 늘어 개선이 필요한 상황', steps: [
        { name: '현상 정의', desc: '기간·품목·손실을 정리하고 데이터 오류부터 확인합니다.', tool: 'production' },
        { name: '가설·검증 설계', desc: '원인 후보와 반례, 시험의 비교 조건을 정합니다.' },
        { name: '승인된 시험', desc: '품질·안전 영향을 검토하고 제한된 범위에서 효과를 측정합니다.' },
        { name: '표준화·추적', desc: '효과·부작용 확인 후 작업 표준과 교육에 반영하고 추적합니다.' },
      ], output: '시험 기록, 전후 비교, 승인·표준 변경 기록' },
      { id: 'equipment-signal', name: '설비 이상 징후를 발견했을 때', trigger: '센서 경고 또는 작업자의 이상 보고가 들어온 상황', steps: [
        { name: '안전 확보', desc: '위험 징후는 현장 안전 절차에 따라 보고·조치합니다. AI를 기다리지 않습니다.' },
        { name: '운전 정보 정리', desc: '이상 시점·부하·센서 변화를 모아 설비보전과 공유합니다.', tool: 'equipment' },
        { name: '진단·정비 협의', desc: '설비보전이 현장 진단·정비 필요성을 확인하고 생산관리와 일정을 협의합니다.' },
        { name: '재가동 검증', desc: '담당자 승인 아래 설비·공정·제품 상태를 확인하고 기록합니다.' },
      ], output: '보전 담당에게 전달할 근거와 점검·재가동 확인 기록' },
    ],
    collaborations: [
      { name: '설비 이상 진단', partners: '생산기술 · 설비보전', contribution: '생산기술은 운전 조건·공정 영향을, 설비보전은 설비 상태·정비를 검토합니다. 도구 결과는 참고용입니다.' },
      { name: '공정 변경 검증', partners: '생산기술 · QC · QA', contribution: '변경안, 검사 근거, 변경 절차·검증 기록을 함께 검토합니다.' },
    ],
    problems: [
      { problem: '수율 하락 원인을 단정하기 쉽다', ai: '지표 기반 가설을 제안하되 현장 확인과 개선 시험으로 검증합니다.' },
      { problem: '센서 로그의 변화가 정비 협의로 이어지지 않는다', ai: '이상 징후와 점검 초안을 정리해 설비보전 담당의 판단을 돕습니다.' },
    ],
    split: { code: '수율·가동률·센서 기준선 이탈 계산', ai: '원인 가설·점검 우선순위·보고서 초안', human: '현장 확인, 변경 승인·효과 검증, 보전 담당의 정비 판단' },
    tools: tools('production', 'equipment'),
  },
  {
    id: 'qc', name: '품질관리', question: '제품과 공정이 정해진 기준을 충족하는가?',
    mission: '입고·공정·완제품의 검사와 데이터를 통해 품질 상태를 확인하고 이상을 관리합니다.',
    boundary: '통계 경고와 제품 규격 판정은 다릅니다. 출하 승인·재작업·폐기는 회사 절차와 권한에 따라 결정합니다. QA와 협업하며 검사만으로 품질을 보장하지 않습니다.',
    areas: [
      { id: 'inspection', name: '검사·시험 신뢰성', desc: '검사 결과를 믿을 수 있게 관리합니다.', tasks: [
        { name: '입고·공정·완제품 검사', desc: '정해진 시료 채취·시험방법으로 측정하고 규격·로트·기록을 확인합니다.', cadence: 'routine', when: '검사 계획에 따른 주기', partners: '현장·자재', tool: 'inspection' },
        { name: '측정기·시험방법 점검', desc: '교정 상태·표준물질·시험 조건을 확인합니다. 의심값은 정해진 조사 절차를 따릅니다.', cadence: 'routine', when: '시험 전·정기 점검', partners: '시험실·계측 담당' },
      ] },
      { id: 'control', name: '공정 품질·이상 대응', desc: '변화의 신호와 제품 적합성을 구분합니다.', tasks: [
        { name: '공정 품질 추세 검토', desc: '관리도와 규격 이탈을 구분하고 측정 조건·공정 안정성을 확인합니다.', cadence: 'routine', when: '검사 결과 취합 시', partners: '생산기술', tool: 'inspection' },
        { name: '부적합 조사·기록', desc: '로트와 영향 범위를 확인하고 격리·보고·처분 승인에 필요한 근거를 남깁니다.', cadence: 'event', when: '규격 이탈·부적합 발견 시', partners: 'QC·QA 공통', tool: 'ncr' },
      ] },
      { id: 'compliance', name: '위생·규격·기록', desc: '현장에서 기준이 지켜지는지 확인합니다.', tasks: [
        { name: '위생·관리 기록 검토', desc: '현장 점검과 중요관리점 기록의 누락·반복 지적을 추적합니다.', cadence: 'routine', when: '현장 점검·기록 검토 주기', partners: 'QC·QA 공통', tool: 'hygiene' },
        { name: '규격 변경 영향 확인', desc: '제공된 법규·규격 변경이 검사 항목과 현장 기준에 미치는 영향을 검토합니다.', cadence: 'event', when: '법규·제품 규격 변경 시', partners: 'QC·QA·법규 담당 공통', tool: 'regulation' },
      ] },
    ],
    scenarios: [
      { id: 'nonconformance', name: '검사에서 규격 이탈을 발견했을 때', trigger: '검사 결과가 제품 기준을 벗어난 상황', steps: [
        { name: '대상·측정 확인', desc: '시료·단위·시험조건·로트·규격을 확인합니다. 경고만으로 원인을 확정하지 않습니다.', tool: 'inspection' },
        { name: '보고·영향 통제', desc: '절차에 따라 물량을 식별·보류하고 영향 범위를 담당자와 확인합니다.' },
        { name: '조사·처분 검토', desc: '근거와 추가 질문을 기록하고 권한자의 처분 승인을 받습니다.', tool: 'ncr' },
        { name: '재확인·기록', desc: '승인된 조치 후 결과와 재발 여부를 확인하고 QA와 공유합니다.' },
      ], output: '검사 근거, 부적합 보고, 처분 승인과 재확인 기록' },
      { id: 'drift', name: '규격 안에서 변화 추세가 보일 때', trigger: '제품은 규격 안이지만 통계적 변화 신호가 나타난 상황', steps: [
        { name: '신호 검토', desc: '기준선·표본·측정 조건과 경고를 확인합니다.', tool: 'inspection' },
        { name: '현장 확인', desc: '공정조건·원료·측정기 변화를 생산기술과 조사합니다.' },
        { name: '조치 협의', desc: '추가 검사·점검 범위를 정하고 변경은 승인 절차를 따릅니다.' },
        { name: '후속 관찰', desc: '같은 기준으로 이후 데이터를 비교합니다. 추세 연장은 확정 예측이 아닙니다.' },
      ], output: '변화 조사와 후속 관찰 기록 — 통계 경고는 자동 불합격이 아닙니다.' },
    ],
    collaborations: [
      { name: '부적합·재발 방지', partners: 'QC · QA 공통', contribution: 'QC는 검사·현장 증거를, QA는 시정조치 절차와 효과 확인·종결 근거를 함께 관리합니다.' },
      { name: '위생·법규·규격', partners: 'QC · QA · 현장 · 법규 담당', contribution: '현장 준수 확인과 기준 변경·교육·검증을 나누어 맡습니다. 한 직무의 전용 업무가 아닙니다.' },
    ],
    problems: [
      { problem: '합격 여부만 보면 공정의 변화 신호를 놓친다', ai: '관리도·공정능력·추세 계산을 해석합니다. 기준선과 적용 조건은 사람이 검토합니다.' },
      { problem: '현장 메모가 짧아 부적합 조사 근거가 부족하다', ai: '보고서 초안과 추가 질문을 만들고 메모 인용을 대조합니다.' },
    ],
    split: { code: '검사 통계·위생점검 집계·인용 대조', ai: '변화 해석·추가 질문·보고서 초안', human: '시험 신뢰성 확인, 규격 판정, 권한에 따른 처분·출하 결정' },
    tools: tools('inspection', 'ncr', 'hygiene', 'regulation'),
  },
  {
    id: 'qa', name: '품질보증', question: '기준을 지속적으로 지킨다는 것을 어떻게 입증하는가?',
    mission: '품질 기준·절차·검증 기록을 연결해 품질체계를 운영하고, 변경과 재발 위험을 관리합니다.',
    boundary: '고객불만 대응만 하는 직무가 아닙니다. QC·생산·개발·구매와 협업하며 출하·회수·대외 보고 권한은 회사 절차를 따릅니다.',
    areas: [
      { id: 'system', name: '품질체계·문서·심사', desc: '기준과 실제 이행의 일치를 확인합니다.', tasks: [
        { name: '문서·교육·심사 관리', desc: '최신 기준서·교육 기록과 내부·외부 심사 준비 및 이행 상태를 확인합니다.', cadence: 'routine', when: '문서·교육·심사 계획 주기', partners: '각 부서·QC' },
        { name: '위생점검 후속 검토', desc: '반복 지적·기한 초과와 완료 증빙·재발 여부를 검토합니다.', cadence: 'routine', when: '점검·시정조치 검토 주기', partners: 'QC·QA 공통', tool: 'hygiene' },
      ] },
      { id: 'change', name: '변경·사전 검증', desc: '문제가 생기기 전 영향을 검토합니다.', tasks: [
        { name: '법규·표시 기준 검토', desc: '공식 최신 자료를 확인하고 제품·표시·절차 변경과 교육 필요성을 검토합니다.', cadence: 'routine', when: '정기 모니터링·개정 확인', partners: 'QC·QA·법규 담당 공통', tool: 'regulation' },
        { name: '신제품·원료·공정 변경 검증', desc: '위험과 확인 항목·승인 기준을 정하고 검증 자료를 검토합니다.', cadence: 'event', when: '신제품·원료·공정 변경 시', partners: '개발·생산기술·QC' },
      ] },
      { id: 'corrective', name: '부적합·재발 방지', desc: '처리 완료와 효과 확인을 구분합니다.', tasks: [
        { name: '시정조치 진행 관리', desc: '원인 조사, 담당·기한, 증빙과 효과 확인 계획을 검토합니다.', cadence: 'routine', when: '미종결 과제 검토 주기', partners: 'QC·QA 공통', tool: 'ncr' },
        { name: '클레임·품질 사고 협업', desc: '영향 조사·위험 검토를 조율하고 고객상담과 사실 기반 회신을 준비합니다.', cadence: 'event', when: '고객불만·품질 사고 접수 시', partners: 'QC·고객상담·생산', tool: 'claim' },
      ] },
      { id: 'supplier', name: '협력업체 품질', desc: '공급 단계의 기준과 개선을 확인합니다.', tasks: [
        { name: '업체 평가·개선 확인', desc: '납품 품질과 평가·심사 자료, 미해결 조치를 검토합니다.', cadence: 'routine', when: '위험도 기반 평가 주기', partners: '구매·QC' },
        { name: '업체 이슈 통보', desc: '사실·영향·요청 자료·기한을 정리하되 귀책을 조사 전에 단정하지 않습니다.', cadence: 'event', when: '협력업체 품질 이슈 시', partners: '구매·QC', tool: 'supplier' },
      ] },
    ],
    scenarios: [
      { id: 'recurrence', name: '같은 위생 지적이 반복될 때', trigger: '조치 완료 기록 후 동일 지적이 다시 발생한 상황', steps: [
        { name: '이력·영향 확인', desc: '반복·기한·관련 공정과 즉시 통제 필요성을 검토합니다.', tool: 'hygiene' },
        { name: '원인·조치 합의', desc: 'QC·현장과 근거를 확인하고 담당·기한·효과 확인 기준을 정합니다.', tool: 'ncr' },
        { name: '이행 증빙 확인', desc: '수정된 절차·교육·현장 적용 기록을 확인합니다.' },
        { name: '효과 검증·종결', desc: '정한 관찰 기간·표본으로 재발 여부를 확인합니다. 부족하면 다시 조사합니다.' },
      ], output: '원인·조치·증빙·효과 확인·종결 승인 기록' },
      { id: 'change-review', name: '원료나 공정을 변경하려 할 때', trigger: '기존 승인 조건과 다른 원료·공정·표시를 적용하려는 상황', steps: [
        { name: '변경 범위 정의', desc: '변경 전후와 적용 품목·로트를 식별합니다.' },
        { name: '위험·요구사항 검토', desc: '관련 부서가 품질·안전·표시·규격 영향을 검토합니다. 도구는 제공 조문만 분석합니다.', tool: 'regulation' },
        { name: '검증·승인', desc: '시험과 자료를 검토하고 권한자의 적용 승인을 받습니다.' },
        { name: '배포·후속 확인', desc: '문서·교육·현장 조건을 갱신하고 적용 후 품질을 확인합니다.' },
      ], output: '변경 검토서, 검증 근거, 승인·교육·후속 확인 기록' },
    ],
    collaborations: [
      { name: '부적합·위생·법규', partners: 'QC · QA 공통', contribution: '도구는 공유하되 QC의 현장·검사 근거와 QA의 기준·검증·종결 관점을 구분합니다.' },
      { name: '클레임·업체 대응', partners: 'QA · QC · 고객상담 · 구매', contribution: '조사는 함께 수행하며 고객 회신·업체 통보는 정해진 권한으로 검토·발송합니다.' },
    ],
    problems: [
      { problem: '완료 표시만 있고 재발 방지 효과는 확인되지 않는다', ai: '반복·기한 초과를 찾아 후속 검토를 돕습니다. 효과 검증·종결은 사람이 수행합니다.' },
      { problem: '대외 문서에 확인되지 않은 원인·책임이 들어간다', ai: '사실과 조사 질문을 구분한 초안을 만들고 인용·책임 단정 표현을 점검합니다.' },
    ],
    split: { code: '점검 집계·인용 대조·표현 경고', ai: '영향 검토·조사 질문·대외 문서 초안', human: '변경·검증 승인, 시정조치 효과 확인, 출하·회수·대외 대응 결정' },
    tools: tools('hygiene', 'ncr', 'regulation', 'claim', 'supplier'),
  },
];
