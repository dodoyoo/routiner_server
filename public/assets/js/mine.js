(function () {
  const API_BASE = window.__ROUTINER__?.API_BASE || '/api';
  const ROUTINE_ENDPOINT = `${API_BASE}/user-routines`; // 실제 엔드포인트에 맞게 수정

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
    const template = document.getElementById('routineItemTemplate');
    if (!template) return document.createElement('li');

    const fragment = template.contentType.cloneNode(true);
    const li = fragment.querySelector('.routine-item');

    const { title, description, status, progressPercent, timeText, tags } =
      routine;

    const titleEl = li.querySelector('.routine-title');
    const timeEl = li.querySelector('.routine-time');
    const tagsEl = li.querySelector('.routine-tags');
    const statusBadgeEl = li.querySelector('.routine-status-badge');
    const progressBarEl = li.querySelector('.progress-bar');
    const progressLabelEl = li.querySelector('.progress-label');
    const noteEl = li.querySelector('.routine-note');

    // 버튼 이벤트 (완료/리셋 등)
    const completeBtn = li.querySelector('[data-action="complete"]');
    const resetBtn = li.querySelector('[data-action="reset"]');

    if (titleEl) titleEl.textContent = title || '이름 없는 루틴';
    if (timeEl) timeEl.textContent = timeText || '';

    // 태그 채우기
    if (tagsEl) {
      tagsEl.innerHTML = '';
      if (tags && tags.length) {
        tags.forEach((tag) => {
          const span = document.createElement('span');
          span.className = 'routine-tag';
          span.textContent = String(tag);
          tagsEl.appendChild(span);
        });
      } else {
        // 태그 없으면 감춰도 됨
        tagsEl.style.display = 'none';
      }
    }

    // 상태 뱃지
    if (statusBadgeEl) {
      statusBadgeEl.classList.remove('active', 'completed', 'paused');
      let label = '미지정';

      if (status === 'ACTIVE') {
        statusBadgeEl.classList.add('active');
        label = '진행 중';
      } else if (status === 'COMPLETED') {
        statusBadgeEl.classList.add('completed');
        label = '완료';
      } else if (status === 'PAUSED') {
        statusBadgeEl.classList.add('paused');
        label = '잠시 쉼';
      }

      statusBadgeEl.textContent = label;
    }

    // 진행도
    const pct = progressPercent ?? 0;
    if (progressBarEl) {
      progressBarEl.style.width = `${pct}%`;
    }
    if (progressLabelEl) {
      progressLabelEl.textContent = `${pct}%`;
    }

    // 메모/설명
    if (noteEl) {
      noteEl.textContent = description || '작은 실천이 습관을 만듭니다.';
    }

    // 버튼 표시 제어
    if (completeBtn && resetBtn) {
      if (status === 'COMPLETED') {
        completeBtn.style.display = 'none';
        resetBtn.style.display = 'inline-flex';
      } else {
        completeBtn.style.display = 'inline-flex';
        resetBtn.style.display = 'none';
      }

      completeBtn.addEventListener('click', () => {
        // TODO: 완료 API 연동
        alert('완료 처리 API를 연동해주세요 🙂');
      });

      resetBtn.addEventListener('click', () => {
        // TODO: 다시 시작 API 연동
        alert('다시 시작 API를 연동해주세요 🙂');
      });
    }

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

    try {
      const url = new URL(ROUTINE_ENDPOINT, window.location.origin);
      if (statusFilter && statusFilter !== 'all') {
        url.searchParams.set('status', statusFilter);
      }

      const res = await fetch(url.toString(), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error('Failed to fetch routines');
      }

      const data = await res.json();
      // 예상 형태: [{ id, title, status, progressPercent, ... }, ...]

      const routines = (data.routines || data || []).map((r) => ({
        id: r.id,
        title: r.title || r.name || '이름 없는 루틴',
        description: r.description || r.memo || '',
        status: r.status || 'ACTIVE',
        progressPercent: r.progressPercent ?? r.progress ?? 0,
        timeText: r.timeText || r.time_range || '',
        tags: r.tags || r.labels || [],
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
