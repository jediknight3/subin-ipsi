/* ===========================================================
 * 공통 유틸 + API + 라우팅
 * 시트 연동 + LocalStorage 폴백 (오프라인 OK)
 * =========================================================== */

const SHEETS = ['todos','grades','schedule','universities','interview','notes'];
const LS_KEY = (s) => `subin_${s}`;

const App = {
  cache: {},
  syncing: false,
  online: navigator.onLine,

  // ===== 데이터 IO =====
  async load(sheet) {
    const cached = this._readLocal(sheet);
    if (cached) this.cache[sheet] = cached;
    if (CONFIG.API_URL) {
      try {
        this._setSync('동기화중...');
        const r = await fetch(`${CONFIG.API_URL}?sheet=${sheet}`, { method: 'GET' });
        const j = await r.json();
        if (j.ok) {
          this.cache[sheet] = j.data;
          this._writeLocal(sheet, j.data);
          this._setSync('ok', '시트 동기화 완료');
        } else {
          this._setSync('err', j.err || '응답 오류');
        }
      } catch (e) {
        this._setSync('err', '오프라인 (로컬 데이터)');
      }
    } else {
      this._setSync('', '로컬 모드 (시트 미연결)');
    }
    return this.cache[sheet] || [];
  },

  async upsert(sheet, row) {
    const list = this.cache[sheet] || [];
    const idx = list.findIndex(r => r.id === row.id);
    if (idx >= 0) list[idx] = { ...list[idx], ...row };
    else list.push(row);
    this._writeLocal(sheet, list);

    if (CONFIG.API_URL) {
      try {
        this._setSync('동기화중...');
        const r = await fetch(CONFIG.API_URL, {
          method: 'POST',
          body: JSON.stringify({ sheet, action: 'upsert', row })
        });
        const j = await r.json();
        if (j.ok) {
          this.cache[sheet] = j.data;
          this._writeLocal(sheet, j.data);
          this._setSync('ok', '저장 완료');
        } else {
          this._setSync('err', j.err);
        }
      } catch (e) {
        this._setSync('err', '오프라인 - 로컬 저장됨');
      }
    } else {
      this._setSync('', '로컬 저장됨');
    }
    return this.cache[sheet];
  },

  async remove(sheet, id) {
    const list = (this.cache[sheet] || []).filter(r => r.id !== id);
    this.cache[sheet] = list;
    this._writeLocal(sheet, list);
    if (CONFIG.API_URL) {
      try {
        this._setSync('동기화중...');
        await fetch(CONFIG.API_URL, {
          method: 'POST',
          body: JSON.stringify({ sheet, action: 'delete', id })
        });
        this._setSync('ok', '삭제 완료');
      } catch (e) {
        this._setSync('err', '오프라인 - 로컬만 삭제');
      }
    }
    return list;
  },

  _readLocal(sheet) {
    try { return JSON.parse(localStorage.getItem(LS_KEY(sheet)) || 'null'); }
    catch (e) { return null; }
  },
  _writeLocal(sheet, data) {
    try { localStorage.setItem(LS_KEY(sheet), JSON.stringify(data)); } catch (e) {}
  },
  _setSync(state, msg) {
    const el = document.getElementById('sync-status');
    if (!el) return;
    el.className = 'sync-status ' + (state === 'ok' ? 'ok' : state === 'err' ? 'err' : '');
    el.innerHTML = `<span class="sync-dot"></span> ${msg || state}`;
  },

  // ===== D-day =====
  daysTo(dateStr) {
    const today = new Date(); today.setHours(0,0,0,0);
    const target = new Date(dateStr); target.setHours(0,0,0,0);
    return Math.floor((target - today) / 86400000);
  },

  // ===== 등급 평균 =====
  weightedAvg(grades, filterFn = null) {
    const pool = filterFn ? grades.filter(filterFn) : grades;
    let num = 0, den = 0;
    pool.forEach(g => {
      const grade = Number(g.grade);
      if (!grade || grade < 1 || grade > 9) return;
      const w = 1; // 단순 평균. 학점 가중 원하면 g.credit 추가
      num += grade * w;
      den += w;
    });
    return den ? (num / den) : 0;
  },

  // ===== ID 생성 =====
  newId(prefix = 'x') {
    return prefix + Date.now().toString(36) + Math.random().toString(36).slice(2,5);
  },

  // ===== 탭바 =====
  renderTabbar(active) {
    const tabs = [
      { id: 'home',   label: '홈',     ic: '🏠', href: 'index.html' },
      { id: 'todo',   label: '투두',   ic: '✅', href: 'todo.html' },
      { id: 'grade',  label: '성적',   ic: '📊', href: 'grades.html' },
      { id: 'cal',    label: '일정',   ic: '📅', href: 'calendar.html' },
      { id: 'univ',   label: '대학',   ic: '🎓', href: 'universities.html' },
      { id: 'qa',     label: '면접',   ic: '💬', href: 'interview.html' }
    ];
    const html = `<nav class="tabbar">${tabs.map(t =>
      `<a href="${t.href}" class="${t.id === active ? 'active' : ''}"><span class="ic">${t.ic}</span><span>${t.label}</span></a>`
    ).join('')}</nav>`;
    document.body.insertAdjacentHTML('beforeend', html);
  },

  // ===== 헤더 =====
  renderHeader(title, sub) {
    const dExam = this.daysTo(CONFIG.EXAM_DATE);
    const html = `
      <div class="header">
        <div>
          <div class="header-title">${title}</div>
          ${sub ? `<div class="header-sub">${sub}</div>` : ''}
        </div>
        <div id="sync-status" class="sync-status"><span class="sync-dot"></span> 로딩...</div>
      </div>`;
    const main = document.querySelector('.app');
    if (main) main.insertAdjacentHTML('afterbegin', html);
  },

  // 등급 색상
  gradeClass(g) {
    g = Number(g);
    if (g <= 3) return 'g-good';
    if (g <= 6) return 'g-mid';
    return 'g-bad';
  }
};

window.App = App;
