(() => {
  const {
    API_BASE = '/api',
    CATEGORY_ORDER = ['건강', '운동', '자기개발', '미용'],
    PAGE_SIZE = 50,
  } = window.__ROUTINER__ || {};

  const $tabs = document.getElementById('categories');
  const $list = document.getElementById('routineList');

  const endpoint = {
    all: (page = 1, pageSize = PAGE_SIZE) =>
      `${API_BASE}/routines?page=${page}&pageSize=${pageSize}`,
    byCategory: (category, page = 1, pageSize = PAGE_SIZE) =>
      `${API_BASE}/routines/${encodeURIComponent(
        category
      )}?page=${page}&pageSize=${pageSize}`,
    addUserRoutine: () => `${API_BASE}/user-routines`,
  };

  async function getJSON(url) {
    const token = window.localStorage.getItem('routiner_token');

    const headers = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(url, { credentials: 'include', headers });

    if (res.status === 401) {
      alert('로그인이 필요합니다. 로그인 페이지로 이동합니다.');
      window.location.href = './index.html';
      return { message: 'unauthorized', data: [] };
    }

    if (res.status === 404) {
      return { message: 'not found', data: [] };
    }

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`[${res.status}] ${text || '요청 실패'}`);
    }
    return res.json();
  }

  function requireAuth() {
    const token = window.localStorage.getItem('routiner_token');
    if (!token) {
      alert('로그인이 필요합니다. 로그인 페이지로 이동합니다.');
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

  async function addToMyRoutines(routineId) {
    const token = requireAuth();
    if (!token) return null;

    const userId = getUserIdFromToken();
    if (!userId) {
      window.localStorage.removeItem('routiner_token');
      alert('로그인이 만료되었습니다. 다시 로그인해 주세요.');
      window.location.href = './index.html';
      return null;
    }

    const res = await fetch(endpoint.addUserRoutine(), {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: Number(userId),
        routine_id: Number(routineId),
      }),
    });

    const payload = await (async () => {
      try {
        return await res.json();
      } catch {
        return null;
      }
    })();

    if (res.status === 401 || res.status === 403) {
      window.localStorage.removeItem('routiner_token');
      alert('로그인이 만료되었습니다. 다시 로그인해 주세요.');
      window.location.href = './index.html';
      return null;
    }

    if (!res.ok) {
      throw new Error(payload?.message || `추가 실패 (HTTP ${res.status})`);
    }

    return payload;
  }

  function showLoading() {
    $list.innerHTML = `<div class="loading">불러오는 중…</div>`;
  }
  function showError(err) {
    console.error(err);
    $list.innerHTML = `<div class="error">목록을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.</div>`;
  }
  function showEmpty() {
    $list.innerHTML = `<div class="empty">해당 카테고리에 등록된 루틴이 없습니다.</div>`;
  }

  function renderTabs(active) {
    const order = CATEGORY_ORDER || ['건강', '운동', '자기개발', '미용'];
    $tabs.innerHTML = order
      .map((name) => {
        const activeCls = name === active ? 'active' : '';
        return `<button type="button" class="tab ${activeCls}" data-category="${name}">${name}</button>`;
      })
      .join(' ');
  }

  function renderList(routines) {
    const arr = Array.isArray(routines) ? routines : routines.data || [];
    if (!arr || arr.length === 0) return showEmpty();

    if (!arr || arr.length === 0) return showEmpty();

    $list.innerHTML = arr
      .map((r) => {
        const categoryLabel =
          r.category?.name ?? r.category_name ?? r.category ?? '';
        return `
        <article class="routine-card">
            <div class="routine-title">${r.title}</div>
            <div class="routine-desc">${r.description || ''}</div>
            <div class="routine-meta">
                <span class="chip">${categoryLabel}</span>
            </div>
            <div class="routine-actions">
                <button class="btn-primary" data-routine-id="${
                  r.id
                }">추가</button>
            </div>
        </article>
            `;
      })
      .join('');

    $list.onclick = async (e) => {
      const btn = e.target.closest('button[data-routine-id]');
      if (!btn) return;

      const rid = btn.dataset.routineId;
      if (!rid) return;

      btn.disabled = true;
      const prev = btn.textContent;
      btn.textContent = '추가 중...';

      try {
        await addToMyRoutines(rid);
        alert('내 루틴 목록에 추가되었습니다.');
      } catch (err) {
        alert(err?.message || '루틴 추가 중 오류가 발생했습니다.');
      } finally {
        btn.disabled = false;
        btn.textContent = prev;
      }
    };
  }

  async function loadCategory(category) {
    showLoading();
    try {
      const json = await getJSON(endpoint.byCategory(category));
      renderList(json);
      // URL 유지(선택)
      const u = new URL(location.href);
      u.searchParams.set('category', category);
      history.replaceState(null, '', u);
    } catch (e) {
      showError(e);
    }
  }

  async function init() {
    // 탭 클릭
    $tabs.onclick = (e) => {
      const btn = e.target.closest('button[data-category]');
      if (!btn) return;
      const category = btn.dataset.category;

      // active 토글
      [...$tabs.querySelectorAll('.tab')].forEach((b) =>
        b.classList.toggle('active', b === btn)
      );

      loadCategory(category);
    };

    // 초기 탭 결정: URL ?category=… 또는 ‘건강’
    const url = new URL(location.href);
    const initial = url.searchParams.get('category') || CATEGORY_ORDER[0];

    renderTabs(initial);

    try {
      showLoading();
      await getJSON(endpoint.all()); // 사전 예열용 (응답은 사용 안 함)
      await loadCategory(initial);
    } catch (e) {
      showError(e);
    }
  }

  init();

  document.addEventListener('DOMContentLoaded', () => {
    // 기존에 루틴 목록 불러오는 코드가 여기 있을 거고, 그 아래에 추가하면 됩니다.

    const routeMap = {
      list: './routines.html',
      mine: './mine.html', // 나중에 파일 만들면 그 경로로
      exchange: './coupons.html', // 교환 페이지 경로
      mypage: './mypage.html', // 우리가 만든 마이페이지
    };

    document.querySelectorAll('.nav .nav-item').forEach((btn) => {
      btn.addEventListener('click', () => {
        const route = btn.dataset.route;
        const target = routeMap[route];
        if (target) {
          window.location.href = target;
        }
      });
    });
  });
})();
