import { useState } from 'react';
import { ROLE_SCOPE, ROLE_SOURCES, type Role, type ToolId, type WorkItem } from './roles';

export function SourceNote() {
  return (
    <details className="source-note">
      <summary>직무 구분의 근거와 적용 범위</summary>
      <p>{ROLE_SCOPE}</p>
      <ul>{ROLE_SOURCES.map((s) => <li key={s.url}><a href={s.url} target="_blank" rel="noreferrer">{s.name}</a></li>)}</ul>
      <p>검토일: 2026-10-16 · 아래 업무와 처리 사례는 자료를 종합한 프로젝트의 설명이며 특정 회사의 공식 절차가 아닙니다.</p>
    </details>
  );
}

export function RoleGuide({ role, onTool }: { role: Role; onTool: (tool: ToolId) => void }) {
  const [areaId, setAreaId] = useState(role.areas[0]!.id);
  const [scenarioId, setScenarioId] = useState(role.scenarios[0]!.id);
  const area = role.areas.find((a) => a.id === areaId) ?? role.areas[0]!;
  const scenario = role.scenarios.find((s) => s.id === scenarioId) ?? role.scenarios[0]!;
  return (
    <>
      <section className="panel" aria-labelledby="areas-h">
        <header className="panel-head">
          <h3 id="areas-h">주요 업무 영역</h3>
          <span className="muted">순서가 아닌 책임 범위입니다. 영역을 골라 업무를 살펴보세요.</span>
        </header>
        <div className="area-choices" role="group" aria-label="업무 영역 선택">
          {role.areas.map((a) => (
            <button className="ghost area-choice" key={a.id} aria-pressed={a.id === area.id} aria-controls="area-content" onClick={() => setAreaId(a.id)}>
              <strong>{a.name}</strong><span>{a.desc}</span>
            </button>
          ))}
        </div>
        <div id="area-content" className="area-content" aria-label={area.name}>
          <h4 className="area-heading">{area.name}</h4>
          <div className="work-groups">
            <TaskGroup title="상시·정기 업무" note="평소 또는 정해진 주기에 수행 · 목록의 순서는 작업 순서가 아닙니다." tasks={area.tasks.filter((t) => t.cadence === 'routine')} onTool={onTool} />
            <TaskGroup title="상황 발생 시 업무" note="특정 사건이나 변경이 있을 때 수행 · 순서 없는 업무 목록입니다." tasks={area.tasks.filter((t) => t.cadence === 'event')} onTool={onTool} />
          </div>
        </div>
        <p className="scope-note">‘도구 열기’가 있는 업무만 현재 앱의 보조 기능으로 연결됩니다. 그 외는 직무 설명이며 자동화된 기능이 아닙니다.</p>
      </section>
      <section className="panel" aria-labelledby="scenario-h">
        <header className="panel-head">
          <h3 id="scenario-h">상황별 처리 절차</h3>
          <span className="muted">선택한 상황 안에서만 순서가 있습니다.</span>
        </header>
        <label className="field scenario-picker">
          <span>살펴볼 상황</span>
          <select value={scenario.id} onChange={(e) => setScenarioId(e.target.value)}>
            {role.scenarios.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </label>
        <p className="scenario-trigger"><b>시작 조건</b> {scenario.trigger}</p>
        <ol className="stepper">
          {scenario.steps.map((s, i) => (
            <li key={s.name} className="step">
              <div className="step-btn static">
                <span className="step-no" aria-hidden="true">{i + 1}</span>
                <span className="step-name">{s.name}</span>
                <span className="step-desc">{s.desc}</span>
                {s.tool && <button className="ghost" onClick={() => onTool(s.tool!)}>도구 열기</button>}
              </div>
            </li>
          ))}
        </ol>
        <p className="scenario-output"><b>남길 결과</b> {scenario.output}</p>
        <p className="scope-note">이해를 돕는 처리 예시입니다. 실제 절차·담당·승인 권한과 긴급 대응 기준을 우선합니다. 절차 실행·승인·기록 저장을 자동화하지는 않습니다.</p>
      </section>
      <section className="panel" aria-labelledby="collaboration-h">
        <header className="panel-head"><h3 id="collaboration-h">공통·협업 업무</h3><span className="muted">직무의 경계는 업무의 단절이 아닙니다.</span></header>
        <ul className="collaboration-list">{role.collaborations.map((c) => (
          <li key={c.name}><span className="partner-tag">{c.partners}</span><h4>{c.name}</h4><p>{c.contribution}</p></li>
        ))}</ul>
      </section>
    </>
  );
}

function TaskGroup({ title, note, tasks, onTool }: { title: string; note: string; tasks: WorkItem[]; onTool: (tool: ToolId) => void }) {
  return (
    <section className="work-group" aria-label={title}>
      <h4>{title}</h4><p className="muted">{note}</p>
      {tasks.length ? <ul className="task-list">{tasks.map((t) => (
        <li key={t.name}>
          <div className="task-meta"><span>{t.when}</span>{t.partners && <span className="partner-tag">{t.partners}</span>}</div>
          <h4>{t.name}</h4><p>{t.desc}</p>
          {t.tool ? <button className="ghost" onClick={() => onTool(t.tool!)}>도구 열기</button> : <small>업무 안내 · 연결 도구 없음</small>}
        </li>
      ))}</ul> : <p className="empty-work">이 영역에는 별도 상황 업무를 나열하지 않았습니다. 다른 영역이나 아래 처리 사례를 살펴보세요.</p>}
    </section>
  );
}
