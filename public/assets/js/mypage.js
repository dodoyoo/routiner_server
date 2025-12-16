(function () {
  const API_BASE = window.__ROUTINER__?.API_BASE || '/api';
  const PROFILE_ENDPOINT = `${API_BASE}/users/me`;
  const COUPON_ISSUE_ENDPOINT = `${API_BASE}/coupon/issue`;

  const $ = (selector) => document.querySelector(selector);

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
  async function safeReadJson(res) {
    try {
      return await res.json();
    } catch {
      return null;
    }
  }

  function extractErrorMessage(payload, fallback) {
    if (!payload) return fallback;
    return (
      payload.message ||
      payload.error ||
      payload.msg ||
      (Array.isArray(payload.errors) && payload.errors[0]?.message) ||
      fallback
    );
  }

  function getUserIdFromToken() {
    const token = window.localStorage.getItem('routiner_token');
    if (!token) return null;
    const payload = parseJwt(token);
    return payload?.userId ?? null;
  }

  async function fetchProfile() {
    const token = requireAuth();
    if (!token) return;
    try {
      const response = await fetch(PROFILE_ENDPOINT, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401 || response.status === 403) {
        // 토큰 만료 등
        window.localStorage.removeItem('routiner_token');
        alert('로그인이 만료되었습니다. 다시 로그인해 주세요.');
        window.location.href = './index.html';
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }

      const data = await response.json();

      updateProfileUI({
        nickname: data.nickname || '루티너',
        email: data.email || '',
        profileImage: data.profileImageUrl || './assets/img/mypage.png',
        couponCount: data.couponCount ?? 0,
        streakDays: data.streakDays ?? 0,
        completedCount: data.completedRoutineCount ?? 0,
        activeCount: data.activeRoutineCount ?? 0,
        createdAt: data.createdAt,
      });
    } catch (error) {
      console.error(error);
      // API 없을 때 데모용 더미 데이터
      updateProfileUI({
        nickname: '루티너',
        email: 'routiner@example.com',
        profileImage: './assets/img/mypage.png',
        couponCount: 3,
        streakDays: 5,
        completedCount: 24,
        activeCount: 4,
        createdAt: '2025-01-01T00:00:00.000Z',
      });
    }
  }

  async function fetchRoutineStats(rangeDays) {
    const token = requireAuth();
    if (!token) return null;

    const userId = getUserIdFromToken();
    if (!userId) {
      window.localStorage.removeItem('routiner_token');
      window.location.href = './index.html';
      return null;
    }

    try {
      const url = new URL(
        `${API_BASE}/user-routines/${userId}`,
        window.location.origin
      );

      const res = await fetch(url.toString(), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: 'no-store',
      });

      if (!res.ok) {
        throw new Error(`Failed to fetch routines: ${res.status}`);
      }

      const json = await res.json();
      const data = json.data || [];

      // routineTimes 전체를 모아 날짜별로 완료여부 계산
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      const fromDate = new Date(today);
      fromDate.setDate(fromDate.getDate() - (rangeDays - 1)); // N일 범위 시작

      // 날짜 문자열: YYYY-MM-DD
      const toDateStr = today.toISOString().split('T')[0];
      const fromDateStr = fromDate.toISOString().split('T')[0];

      const completedDateSet = new Set();

      data.forEach((ur) => {
        const routineTimes = ur.routineTimes || [];
        routineTimes.forEach((rt) => {
          if (!rt.date) return;
          const d = new Date(rt.date);
          const ds = d.toISOString().split('T')[0];

          // 기간 범위 안에 있는지
          if (ds < fromDateStr || ds > toDateStr) return;

          if (rt.progress >= 100) {
            completedDateSet.add(ds);
          }
        });
      });

      const totalDays = rangeDays;
      const completedDays = completedDateSet.size;
      const percent =
        totalDays > 0 ? Math.round((completedDays / totalDays) * 100) : 0;

      return { percent, completedDays, totalDays };
    } catch (err) {
      console.error('루틴 통계 조회 실패:', err);
      return null;
    }
  }

  function renderStats(rangeDays, stats) {
    const circle = document.getElementById('circleGraph');
    const percentEl = document.getElementById('statPercentLabel');
    const rangeLabelEl = document.getElementById('statRangeLabel');
    const summaryEl = document.getElementById('statSummaryText');

    if (!circle || !percentEl || !rangeLabelEl || !summaryEl) return;

    const percent = stats?.percent ?? 0;
    const completedDays = stats?.completedDays ?? 0;
    const totalDays = stats?.totalDays ?? rangeDays;

    // 원형 그래프 채우기
    circle.style.setProperty('--percent', percent);

    // 가운데 숫자
    percentEl.textContent = String(percent);

    // 범위 라벨
    rangeLabelEl.textContent =
      rangeDays === 7
        ? '최근 7일'
        : rangeDays === 30
        ? '최근 30일'
        : `최근 ${rangeDays}일`;

    // 설명 텍스트
    if (completedDays === 0) {
      summaryEl.textContent =
        rangeDays === 7
          ? '최근 7일 동안 루틴을 완료한 날이 아직 없습니다. 오늘 하나부터 시작해볼까요?'
          : '최근 30일 동안 루틴을 완료한 날이 아직 없습니다. 이번 달 목표를 새로 잡아보세요.';
    } else {
      summaryEl.innerHTML = `
        <strong>최근 ${rangeDays}일</strong> 동안
        <strong>${completedDays}일</strong>에 루틴을 완료하셨어요.
        전체 기간 대비 약 <strong>${percent}%</strong>의 달성률입니다.
      `;
    }
  }

  function formatDate(iso) {
    if (!iso) return '-';
    const d = new Date(iso);
    const year = d.getFullYear();
    const month = `${d.getMonth() + 1}`.padStart(2, '0');
    const day = `${d.getDate()}`.padStart(2, '0');
    return `${year}.${month}.${day}`;
  }

  function updateProfileUI(profile) {
    const nicknameEl = $('#nickname');
    const emailEl = $('#email');
    const joinedAtEl = $('#joinedAt');
    const avatarEl = $('#profileAvatar');
    const couponCountEl = $('#couponCount');
    const streakDaysEl = $('#streakDays');
    const completedCountEl = $('#completedCount');
    const activeCountEl = $('#activeCount');

    if (nicknameEl) nicknameEl.textContent = profile.nickname;
    if (emailEl) emailEl.textContent = profile.email || '이메일 미설정';
    if (joinedAtEl)
      joinedAtEl.textContent = `가입일: ${formatDate(profile.createdAt)}`;
    if (avatarEl) avatarEl.src = profile.profileImage;
    if (couponCountEl) couponCountEl.textContent = profile.couponCount;
    if (streakDaysEl) streakDaysEl.textContent = profile.streakDays;
    if (completedCountEl) completedCountEl.textContent = profile.completedCount;
    if (activeCountEl) activeCountEl.textContent = profile.activeCount;
  }

  function setupNav() {
    const navItems = document.querySelectorAll('.nav-item[data-target]');
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

  function toKstYmd(dateLike) {
    const d = new Date(dateLike);
    const kst = new Date(d.getTime() + 9 * 60 * 60 * 1000);
    return kst.toISOString().slice(0, 10); // YYYY-MM-DD
  }

  function addDays(dateLike, days) {
    const d = new Date(dateLike);
    d.setDate(d.getDate() + days);
    return d;
  }

  async function pickCompleted7DaysUserRoutineId() {
    const token = requireAuth();
    if (!token) return null;

    const userId = getUserIdFromToken();
    if (!userId) return null;

    const url = new URL(
      `${API_BASE}/user-routines/${userId}`,
      window.location.origin
    );

    const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });

    if (!res.ok) {
      throw new Error(`유저 루틴 조회 실패 (HTTP ${res.status})`);
    }

    const json = await res.json();
    const routines = json.data || [];

    // start_date DESC로 이미 정렬되어 오므로, "가장 최신 성공 루틴"부터 검사
    for (const ur of routines) {
      if (!ur?.id || !ur?.start_date || !ur?.end_date) continue;

      const completedSet = new Set();

      (ur.routineTimes || []).forEach((rt) => {
        // rt.date / rt.progress 는 도팔님 기존 프론트(fetchRoutineStats)에서도 쓰고 계신 형태라 가정
        if (!rt?.date) return;
        if ((rt.progress ?? 0) >= 100) {
          completedSet.add(toKstYmd(rt.date));
        }
      });

      const start = new Date(ur.start_date);
      // end_date는 +6로 저장하셨으니 7일 체크
      let allDone = true;
      for (let i = 0; i < 7; i++) {
        const ymd = toKstYmd(addDays(start, i));
        if (!completedSet.has(ymd)) {
          allDone = false;
          break;
        }
      }

      if (allDone) return ur.id; // 이게 user_routine_id
    }

    return null;
  }

  async function issueCoupon(category) {
    const token = requireAuth();
    if (!token) return null;

    const userId = getUserIdFromToken();
    if (!userId) throw new Error('토큰에서 userId를 찾을 수 없습니다.');

    const userRoutineId = await pickCompleted7DaysUserRoutineId();
    if (!userRoutineId) {
      throw new Error('7일 연속 성공한 루틴을 찾지 못했습니다.');
    }

    const res = await fetch(COUPON_ISSUE_ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-type': 'application/json',
      },
      body: JSON.stringify({
        user_id: userId,
        user_routine_id: userRoutineId,
        category,
      }),
    });

    if (res.status === 401 || res.status === 403) {
      window.localStorage.removeItem('routiner_token');
      addListener('로그인이 만료되었습니다. 다시 로그인 해주세요');
      window.location.href = './index.html';
      return null;
    }

    const payload = await safeReadJson(res);

    if (!res.ok) {
      const msg = extractErrorMessage(
        payload,
        `쿠폰 발급 실패 (HTTP ${res.status})`
      );
      throw new Error(msg);
    }
    return payload;
  }

  function setupActions() {
    const couponBtn = document.getElementById('openCouponButton');
    if (couponBtn) {
      couponBtn.addEventListener('click', async () => {
        const category = 'MONTHLY';
        couponBtn.disabled = true;
        const prevText = couponBtn.textContent;
        couponBtn.textContent = '쿠폰 발급 중...';

        try {
          const result = await issueCoupon(category);
          if (!result) return;

          alert('쿠폰이 발급되었습니다.');
          await fetchProfile();
        } catch (e) {
          alert(e?.message || '쿠폰 발급 중 오류가 발생했습니다.');
        } finally {
          couponBtn.disabled = false;
          couponBtn.textContent = prevText;
        }

        // window.location.href = './coupons.html';
      });
    }

    const avatarBtn = document.getElementById('changeAvatarButton');
    if (avatarBtn) {
      avatarBtn.addEventListener('click', () => {
        alert('프로필 이미지 변경 기능은 나중에 API 연동 후 구현해주세요 🙂');
      });
    }

    document.querySelectorAll('.setting-item').forEach((btn) => {
      btn.addEventListener('click', () => {
        const action = btn.getAttribute('data-action');
        switch (action) {
          case 'edit-profile':
            alert('프로필 수정 화면으로 이동하도록 연결해 주세요.');
            break;
          case 'notification':
            alert('알림 설정 화면으로 이동하도록 연결해 주세요.');
            break;
          case 'help':
            alert('도움말 / 문의 페이지로 이동하도록 연결해 주세요.');
            break;
          case 'logout':
            handleLogout();
            break;
          default:
            break;
        }
      });
    });
  }

  function setupStatsRangeTabs() {
    const buttons = document.querySelectorAll('.range-btn[data-range]');
    if (!buttons.length) return;

    buttons.forEach((btn) => {
      btn.addEventListener('click', async () => {
        buttons.forEach((b) => {
          b.classList.remove('active');
          b.setAttribute('aria-pressed', 'false');
        });

        btn.classList.add('active');
        btn.setAttribute('aria-pressed', 'true');

        const rangeStr = btn.getAttribute('data-range') || '7';
        const rangeDays = Number(rangeStr) || 7;

        const stats = await fetchRoutineStats(rangeDays);
        renderStats(rangeDays, stats);
      });
    });
  }

  async function handleLogout() {
    const token = window.localStorage.getItem('routiner_token');

    try {
      const res = await fetch(`${API_BASE}/auth/sign-out`, {
        method: 'POST',
        headers: token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : {
              'Content-Type': 'application/json',
            },
      });

      if (!res.ok) {
        console.warn('서버 로그아웃 응답이 없습니다.', res.status);
      }
    } catch (e) {
      console.error('로그아웃 API 호출 중 오류', e);
    } finally {
      window.localStorage.removeItem('routiner_token');
      window.location.href = './index.html';
    }
  }

  // 초기화
  document.addEventListener('DOMContentLoaded', async () => {
    setupNav();
    setupActions();
    fetchProfile();

    setupStatsRangeTabs();

    const initialRange = 7;
    const stats = await fetchRoutineStats(initialRange);
    renderStats(initialRange, stats);
  });
})();
