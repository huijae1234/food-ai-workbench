import { useEffect, useRef, useState } from 'react';
import type React from 'react';
import './styles.css';
import { api } from './api';
import { ArrowRight, BrandMark, RoleIcon } from './icons';
import { ROLES, type Role, type RoleId, type ToolId } from './roles';
import { RoleGuide, SourceNote } from './RoleGuide';
import { ClaimTool } from './tools/ClaimTool';
import { EquipmentTool } from './tools/EquipmentTool';
import { HygieneTool } from './tools/HygieneTool';
import { InspectionTool, NCR_PREFILL_EVENT } from './tools/InspectionTool';
import { NcrTool } from './tools/NcrTool';
import { ProductionTool } from './tools/ProductionTool';
import { RegulationTool } from './tools/RegulationTool';
import { SupplierReportTool } from './tools/SupplierReportTool';

type View = 'all' | RoleId;

const TOOL: Record<ToolId, () => React.JSX.Element> = {
  production: ProductionTool,
  equipment: EquipmentTool,
  inspection: InspectionTool,
  ncr: NcrTool,
  regulation: RegulationTool,
  claim: ClaimTool,
  supplier: SupplierReportTool,
  hygiene: HygieneTool,
};

function readHash(): View {
  const h = window.location.hash.replace('#', '');
  return ROLES.some((r) => r.id === h) ? (h as RoleId) : 'all';
}

export function App() {
  const [view, setView] = useState<View>(readHash);
  const [mode, setMode] = useState<string>('');

  useEffect(() => {
    const onHash = () => setView(readHash());
    window.addEventListener('hashchange', onHash);
    api<{ mode: string }>('/api/health').then((h) => setMode(h.mode)).catch(() => setMode('offline'));
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const go = (v: View) => {
    try {
      window.location.hash = v === 'all' ? '' : v;
    } catch {
      /* 해시를 못 바꾸는 환경에서는 화면 상태만 바꾼다 */
    }
    setView(v);
    window.scrollTo({ top: 0 });
  };
  const role = ROLES.find((r) => r.id === view);

  return (
    <div className="shell">
      <header className="topbar">
        <div className="container topbar-in">
          <button className="brand" onClick={() => go('all')} aria-label="처음 화면으로">
            <span className="brand-mark"><BrandMark /></span>
            <span className="brand-text">
              <strong>식품 제조 AI 워크벤치</strong>
              <small>생산 · 품질 업무 보조</small>
            </span>
          </button>
          <nav className="seg" aria-label="직무 선택">
            <button className={view === 'all' ? 'seg-btn active' : 'seg-btn'} aria-pressed={view === 'all'} onClick={() => go('all')}>전체</button>
            {ROLES.map((r) => (
              <button key={r.id} className={view === r.id ? 'seg-btn active' : 'seg-btn'} aria-pressed={view === r.id} onClick={() => go(r.id)}>{r.name}</button>
            ))}
          </nav>
        </div>
      </header>

      <div className="container">
        {mode === 'artifact' && (
          <div className="banner info">
            <b>공개용 화면입니다.</b> 샘플 입력의 AI 결과는 <b>미리 실행해 둔 실제 Claude 응답</b>이고, 숫자 계산·관리도·검증은 지금 이 화면에서 다시 실행됩니다. {typeof (window as { claude?: unknown }).claude !== 'undefined' ? '직접 입력한 내용은 Claude 사용을 허용하면 그 자리에서 분석합니다.' : '직접 입력한 내용의 AI 분석은 로컬에서 실행해야 동작합니다(저장소 README 참고).'}
          </div>
        )}
        {mode === 'demo' && <div className="banner demo">데모 모드: 미리 준비된 가짜 응답을 보여줍니다. 실제 Claude 분석이 아닙니다.</div>}
        {mode === 'offline' && <div className="banner error">서버에 연결할 수 없습니다. npm run dev:server 를 실행했는지 확인하세요.</div>}
        <main>{role ? <RoleView key={role.id} role={role} onBack={() => go('all')} /> : <Overview onPick={go} />}</main>
      </div>

      <footer className="container footer">가상의 식품회사 데이터로 만든 시연용 서비스입니다{mode === 'artifact' ? '' : ' · 로컬 Claude 인증 사용'} · AI 결과는 초안이며 최종 판단은 담당자가 합니다</footer>
    </div>
  );
}

function Overview({ onPick }: { onPick: (id: RoleId) => void }) {
  return (
    <>
      <section className="intro">
        <h2>직무를 고르면, 그 직무의 문제와 AI 도구만 남습니다</h2>
        <p>생산관리 · 생산기술 · 품질관리 · 품질보증의 책임 범위와 협업 관계를 살펴보세요. 상시 업무와 상황별 처리 절차를 구분하고, 필요한 곳에서 기존 8개 보조 도구를 연결합니다.</p>
        <SourceNote />
      </section>
      <div className="grid">
        {ROLES.map((r) => (
          <article className="role-card" key={r.id}>
            <div className="role-card-head">
              <span className="icon-bubble"><RoleIcon id={r.id} size={22} /></span>
              <div>
                <h3>{r.name}</h3>
              </div>
            </div>
            <p className="role-question">{r.question}</p>
            <p className="role-mission">{r.mission}</p>
            <h4 className="eyebrow">주요 업무 영역 · 순서 없음</h4>
            <ul className="pills">{r.areas.map((a) => <li key={a.id} className="pill">{a.name}</li>)}</ul>
            <details className="overview-tools">
              <summary>{r.tools.length}개 연결 도구 보기 · 공통 도구 포함</summary>
              <ul className="tool-list">
                {r.tools.map((t) => (
                  <li key={t.id}><b>{t.name}</b><span>{t.desc}</span></li>
                ))}
              </ul>
            </details>
            <button className="primary block" onClick={() => onPick(r.id)}>{r.name} 살펴보기 <ArrowRight /></button>
          </article>
        ))}
      </div>
    </>
  );
}
function RoleView({ role, onBack }: { role: Role; onBack: () => void }) {
  const [toolId, setToolId] = useState<ToolId>(role.tools[0]!.id);
  const active = role.tools.find((t) => t.id === toolId) ?? role.tools[0]!;
  const toolRef = useRef<HTMLDivElement>(null);

  const stats = [
    { n: role.areas.length, label: '업무 영역' },
    { n: role.scenarios.length, label: '상황별 사례' },
    { n: role.tools.length, label: '연결 도구' },
  ];

  const openTool = (id: ToolId) => {
    setToolId(id);
    toolRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // 검사 이상 탐지에서 "부적합 보고서 쓰기"를 누르면 보고서 탭으로 이동한다
  useEffect(() => {
    if (!role.tools.some((t) => t.id === 'ncr')) return;
    const go = () => openTool('ncr');
    window.addEventListener(NCR_PREFILL_EVENT, go);
    return () => window.removeEventListener(NCR_PREFILL_EVENT, go);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role.id]);

  return (
    <>
      <button className="back" onClick={onBack}>← 전체 보기</button>

      <section className="hero">
        <div className="hero-main">
          <span className="icon-bubble lg"><RoleIcon id={role.id} size={26} /></span>
          <div>
            <h2 className="role-title">{role.name}</h2>
            <p className="role-question">{role.question}</p>
            <p className="hero-lead">{role.mission}</p>
          </div>
        </div>
        <dl className="stats">
          {stats.map((s) => (
            <div key={s.label}><dd>{s.n}</dd><dt>{s.label}</dt></div>
          ))}
        </dl>
      </section>

      <p className="role-boundary">{role.boundary}</p>
      <SourceNote />
      <RoleGuide role={role} onTool={openTool} />

      <section className="panel" aria-labelledby="prob-h">
        <header className="panel-head">
          <h3 id="prob-h">업무의 어려움과 도구가 돕는 범위</h3>
        </header>
        <div className="problems">
          {role.problems.map((p) => (
            <div className="pair" key={p.problem}>
              <div className="pair-side bad"><span className="tag">문제</span><p>{p.problem}</p></div>
              <div className="pair-arrow" aria-hidden="true"><ArrowRight /></div>
              <div className="pair-side good"><span className="tag">AI 개선</span><p>{p.ai}</p></div>
            </div>
          ))}
        </div>
        <div className="division">
          <div><b>코드</b><span>{role.split.code}</span></div>
          <div><b>AI</b><span>{role.split.ai}</span></div>
          <div><b>사람</b><span>{role.split.human}</span></div>
        </div>
      </section>

      <div ref={toolRef} className="tool-col">
        <h3>업무 보조 도구</h3>
        <p className="tool-context">{active.desc}</p>
        {role.tools.length > 1 && (
          <div className="utabs" role="tablist" aria-label="도구 선택">
            {role.tools.map((t) => (
              <button key={t.id} role="tab" aria-selected={t.id === active.id} className={t.id === active.id ? 'utab active' : 'utab'} onClick={() => setToolId(t.id)}>
                {t.name}
              </button>
            ))}
          </div>
        )}
        {/* 모든 도구를 계속 띄워 두고 숨기기만 한다 → 탭을 바꿔도 선택과 결과가 사라지지 않는다 */}
        {role.tools.map((t) => {
          const Tool = TOOL[t.id];
          return (
            <div key={t.id} hidden={t.id !== active.id}>
              <Tool />
            </div>
          );
        })}
      </div>
    </>
  );
}
