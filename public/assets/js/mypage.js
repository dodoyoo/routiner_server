(function () {
  const { API_BASE = '/api' } = window.__ROUTINER__ || {};

  const $ = (selector) => document.querySelector(selector);

  async function fetchProfile() {
    try {
      const response = await fetch(PROFILE_ENDPOINT, {
        credentials: 'include',
      });

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
    navItems.forEach((item) => {
      item.addEventListener('click', () => {
        const target = item.getAttribute('data-target');
        if (target) {
          window.location.href = target;
        }
      });
    });
  }

  function setupActions() {
    const couponBtn = document.getElementById('openCouponButton');
    if (couponBtn) {
      couponBtn.addEventListener('click', () => {
        // 실제 쿠폰 페이지가 있다면 그쪽으로 이동하도록 수정
        window.location.href = './coupons.html';
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
            // 실제 로그아웃 API 엔드포인트에 맞게 수정
            handleLogout();
            break;
          default:
            break;
        }
      });
    });
  }

  async function handleLogout() {
    try {
      const res = await fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });

      if (!res.ok) {
        throw new Error('Logout failed');
      }

      window.location.href = './index.html'; // 로그인 페이지 경로에 맞게 수정
    } catch (e) {
      console.error(e);
      alert('로그아웃 중 오류가 발생했습니다. 다시 시도해 주세요.');
    }
  }

  // 초기화
  document.addEventListener('DOMContentLoaded', () => {
    setupNav();
    setupActions();
    fetchProfile();
  });
})();
