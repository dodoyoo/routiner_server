(function () {
  const API_BASE = window.__ROUTINER__?.API_BASE || '/api';

  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => document.querySelectorAll(selector);

  function requireAuth() {
    const token = window.localStorage.getItem('routiner_token');
    if (!token) {
      alert('로그인이 필요합니다.');
      window.location.href = './index.html';
      return null;
    }
    return token;
  }

  function parseJwt(token) {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;

      const base64Url = parts[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        window
          .atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );

      return JSON.parse(jsonPayload);
    } catch (e) {
      console.error('JWT 파싱 실패', e);
      return null;
    }
  }

  function getUserIdFromToken() {
    const token = window.localStorage.getItem('routiner_token');
    if (!token) return null;

    const payload = parseJwt(token);
    return payload?.userId ?? null;
  }

  function formatToday() {
    const d = new Date();
    const month = `${d.getMonth() + 1}`.padStart(2, '0');
    const date = `${d.getDate()}`.padStart(2, '0');
    return `${month}.${date} 오늘`;
  }

  function setupNav() {
    const navItems = $$('.nav-item[data-target]');
    const routeToPath = {
      list: './routines.html',
      mine: './mine.html',
      exchange: './exchange.html',
      mypage: './mypage.html',
    };

    navItems.forEach((item) => {
      item.addEventListener('click', () => {
        const key = item.getAttribute('data-target');
        const target = key && routeToPath[key];
        if (target) {
          window.location.href = target;
        }
      });
    });
  }

  function setupFilters(onFilterChange) {
    const filterTabs = $$('.filter-tab');
    filterTabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        filterTabs.forEach((t) => t.classList.remove('active'));
        tab.classList.add('active');

        const status = tab.getAttribute('data-filter') || 'all';
        onFilterChange(status);
      });
    });
  }

  function buildRoutineItem(routine) {
    const li = document.createElement('li');
    li.className = 'routine-item';

    const { title, description, status, progressPercent, timeText, tags } =
      routine;

    // 상단 영역
    const top = document.createElement('div');
    top.className = 'routine-top';

    const left = document.createElement('div');

    const titleEl = document.createElement('p');
    titleEl.className = 'routine-title';
    titleEl.textContent = title || '이름 없는 루틴';

    const timeEl = document.createElement('p');
    timeEl.className = 'routine-time';
    timeEl.textContent = timeText || '';

    left.appendChild(titleEl);
    left.appendChild(timeEl);

    if (tags && tags.length) {
      const tagsWrap = document.createElement('div');
      tagsWrap.className = 'routine-tags';

      tags.forEach((tag) => {
        const span = document.createElement('span');
        span.className = 'routine-tag';
        span.textContent = String(tag);
        tagsWrap.appendChild(span);
      });

      left.appendChild(tagsWrap);
    }

    const statusBadge = document.createElement('span');
    statusBadge.className = 'routine-status-badge';

    let statusLabel = '미지정';
    if (status === 'ACTIVE') {
      statusBadge.classList.add('active');
      statusLabel = '진행 중';
    } else if (status === 'COMPLETED') {
      statusBadge.classList.add('completed');
      statusLabel = '완료';
    } else if (status === 'PAUSED') {
      statusBadge.classList.add('paused');
      statusLabel = '잠시 쉼';
    }
    statusBadge.textContent = statusLabel;

    top.appendChild(left);
    top.appendChild(statusBadge);

    // 진행도 영역
    const progressRow = document.createElement('div');
    progressRow.className = 'routine-progress-row';

    const track = document.createElement('div');
    track.className = 'progress-track';

    const bar = document.createElement('div');
    bar.className = 'progress-bar';
    const pct = progressPercent ?? 0;
    bar.style.width = `${pct}%`;

    track.appendChild(bar);

    const progressLabel = document.createElement('span');
    progressLabel.className = 'progress-label';
    progressLabel.textContent = `${pct}%`;

    progressRow.appendChild(track);
    progressRow.appendChild(progressLabel);

    // 하단 영역
    const bottom = document.createElement('div');
    bottom.className = 'routine-bottom';

    const note = document.createElement('p');
    note.className = 'routine-note';
    note.textContent = description || '작은 실천이 습관을 만듭니다.';

    const actions = document.createElement('div');
    actions.className = 'routine-actions';

    const completeBtn = document.createElement('button');
    completeBtn.className = 'routine-btn primary';
    completeBtn.textContent = '완료';

    const resetBtn = document.createElement('button');
    resetBtn.className = 'routine-btn';
    resetBtn.textContent = '다시 시작';

    if (status === 'COMPLETED') {
      completeBtn.style.display = 'none';
      resetBtn.style.display = 'inline-flex';
    } else {
      completeBtn.style.display = 'inline-flex';
      resetBtn.style.display = 'none';
    }

    completeBtn.addEventListener('click', () => {
      alert('완료 처리 API를 연동해주세요 🙂');
    });

    resetBtn.addEventListener('click', () => {
      alert('다시 시작 API를 연동해주세요 🙂');
    });

    actions.appendChild(completeBtn);
    actions.appendChild(resetBtn);

    bottom.appendChild(note);
    bottom.appendChild(actions);

    // li에 모두 조립
    li.appendChild(top);
    li.appendChild(progressRow);
    li.appendChild(bottom);

    return li;
  }

  function renderRoutines(routines) {
    const listEl = $('#routineList');
    const emptyText = $('#emptyRoutineText');
    if (!listEl || !emptyText) return;

    listEl.innerHTML = '';

    if (!routines.length) {
      emptyText.hidden = false;
      return;
    }

    emptyText.hidden = true;
    routines.forEach((routine) => {
      listEl.appendChild(buildRoutineItem(routine));
    });
  }

  function updateSummary(routines) {
    const totalEl = $('#totalRoutines');
    const activeEl = $('#activeRoutines');
    const completedEl = $('#completedRoutines');

    const total = routines.length;
    const active = routines.filter((r) => r.status === 'ACTIVE').length;
    const completed = routines.filter((r) => r.status === 'COMPLETED').length;

    if (totalEl) totalEl.textContent = String(total);
    if (activeEl) activeEl.textContent = String(active);
    if (completedEl) completedEl.textContent = String(completed);
  }

  async function fetchRoutines(statusFilter) {
    const token = requireAuth();
    if (!token) return;

    const userId = getUserIdFromToken();
    if (!userId) {
      alert('유저 정보를 불러올 수 없습니다. 다시 로그인해 주세요.');
      window.localStorage.removeItem('routiner_token');
      window.location.href = './index.html';
      return;
    }

    try {
      const url = new URL(
        `${API_BASE}/user-routines/${userId}`,
        window.location.origin
      );
      //   if (statusFilter && statusFilter !== 'all') {
      //     url.searchParams.set('status', statusFilter);
      //   }

      const res = await fetch(url.toString(), {
        headers: {
          Authorization: `Bearer ${token}`,
        },

        cache: 'no-store',
      });

      if (res.status === 304) {
        console.log('루틴 응답 304여서 이전 데이터 유지');
        return;
      }

      if (!res.ok) {
        throw new Error(`Failed to fetch routines: ${res.status}`);
      }

      const json = await res.json();
      console.log('루틴 API 응답:', json);

      const data = json.data || json.routines || json || [];
      // 예상 형태: [{ id, title, status, progressPercent, ... }, ...]

      const routines = data.map((r) => ({
        id: r.id,
        title: r.routine?.title || r.routine?.name || '이름 없는 루틴',
        description: r.routine?.description || r.memo || '',
        status: r.status || 'ACTIVE',
        progressPercent: r.progressPercent ?? r.progress ?? 0,
        timeText: r.routineTimes?.[0]
          ? new Date(r.routineTimes[0].date).toLocaleTimeString('ko-KR', {
              hour: '2-digit',
              minute: '2-digit',
            })
          : '',
        tags: r.routine?.category ? [r.routine.category.name] : [],
      }));

      renderRoutines(routines);
      updateSummary(routines);
    } catch (err) {
      console.error(err);
      renderRoutines([]);
    }
  }

  function setupAddButton() {
    const addBtn = $('#addRoutineButton');
    if (!addBtn) return;

    addBtn.addEventListener('click', () => {
      // TODO: 루틴 생성 페이지 또는 모달 연결
      alert('루틴 추가 화면으로 이동하도록 연결해주세요 🙂');
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    const todayText = $('#todayText');
    if (todayText) {
      todayText.textContent = formatToday();
    }

    setupNav();
    setupAddButton();

    setupFilters((status) => {
      fetchRoutines(status);
    });

    // 초기 로딩: 전체
    fetchRoutines('all');
  });
})();
