import { describe, expect, it } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { ROLES, ROLE_SOURCES, type ToolId } from './roles';
import { RoleGuide } from './RoleGuide';

describe('직무 구분과 도구 연결', () => {
  it('네 직무를 구분하고 기존 생산기술 해시를 유지한다', () => {
    expect(ROLES.map((r) => r.name)).toEqual(['생산관리', '생산기술', '품질관리', '품질보증']);
    expect(ROLES.find((r) => r.id === 'production')?.name).toBe('생산기술');
    expect(new Set(ROLES.map((r) => r.id)).size).toBe(4);
    expect(ROLES.every((r) => !('where' in r) && !('flow' in r))).toBe(true);
  });
  it('기존 8개 도구를 보존하고 모든 업무·절차 링크가 해당 직무에서 열린다', () => {
    const ids: ToolId[] = ['production', 'equipment', 'inspection', 'ncr', 'regulation', 'claim', 'supplier', 'hygiene'];
    expect([...new Set(ROLES.flatMap((r) => r.tools.map((t) => t.id)))].sort()).toEqual(ids.sort());
    for (const r of ROLES) {
      const available = r.tools.map((t) => t.id);
      expect(new Set(available).size).toBe(available.length);
      expect(new Set(r.areas.map((a) => a.id)).size).toBe(r.areas.length);
      expect(new Set(r.scenarios.map((s) => s.id)).size).toBe(r.scenarios.length);
      for (const item of [...r.areas.flatMap((a) => a.tasks), ...r.scenarios.flatMap((s) => s.steps)]) {
        if (item.tool) expect(available, r.name + ': ' + item.name).toContain(item.tool);
      }
      for (const a of r.areas) for (const t of a.tasks) {
        expect(['routine', 'event']).toContain(t.cadence);
        expect(t.when.length).toBeGreaterThan(0);
      }
      expect(r.scenarios).toHaveLength(2);
      for (const s of r.scenarios) {
        expect(s.trigger).toBeTruthy();
        expect(s.output).toBeTruthy();
        expect(s.steps.length).toBeGreaterThan(1);
      }
    }
  });
  it('QC·QA 공통 도구와 설비보전 협업을 명시한다', () => {
    for (const id of ['qc', 'qa']) {
      const r = ROLES.find((r) => r.id === id)!;
      expect(r.tools.map((t) => t.id)).toEqual(expect.arrayContaining(['ncr', 'hygiene', 'regulation']));
      expect(r.collaborations.some((c) => c.partners.includes('QC') && c.partners.includes('QA'))).toBe(true);
    }
    expect(ROLES.find((r) => r.id === 'production')!.tools.find((t) => t.id === 'equipment')!.name).toContain('설비보전 협업');
    expect(ROLE_SOURCES.length).toBeGreaterThanOrEqual(4);
  });
  it.each(ROLES)('$name: 업무 목록과 순서 있는 사례를 별도 구조로 렌더링한다', (r) => {
    const html = renderToStaticMarkup(createElement(RoleGuide, { role: r, onTool: () => {} }));
    expect(html).toContain('상시·정기 업무');
    expect(html).toContain('상황 발생 시 업무');
    expect(html).toContain('공통·협업 업무');
    expect(html).toContain('업무 안내 · 연결 도구 없음');
    expect(html.match(/<ol\b/g)).toHaveLength(1);
    expect(html).toContain('상황별 처리 절차');
    expect(html).not.toContain('공장 (');
    expect(html).not.toContain('본사 (서울)');
  });
});
