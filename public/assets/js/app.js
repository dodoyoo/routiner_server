(() => {
  const { GOOGLE_LOGIN_URL, KAKAO_LOGIN_URL, API_BASE } =
    window.__ROUTINER__ || {};

  document.getElementById('googleLoginBtn')?.addEventListener('click', () => {
    location.href = GOOGLE_LOGIN_URL || '/google/login';
  });
  document.getElementById('kakaoLoginBtn')?.addEventListener('click', () => {
    location.href = KAKAO_LOGIN_URL || '/kakao/login';
  });
  document
    .querySelector('[data-route="list"]')
    ?.addEventListener('click', () => {
      window.location.href = '/routines.html';
    });

  const navItems = document.querySelectorAll('.nav-item');
  navItems.forEach((btn) => {
    btn.addEventListener('click', () => {
      navItems.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      const route = btn.getAttribute('data-route');
      // 라우트별 컨텐츠 스위칭(필요 시 구현)
      console.log('route:', route);
    });
  });
  // ===== 일반 로그인 폼 처리 =====
  const basicLoginForm = document.getElementById('basicLoginForm');
  const basicLoginMessage = document.getElementById('basicLoginMessage');

  basicLoginForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!basicLoginMessage) return;

    basicLoginMessage.textContent = '';
    basicLoginMessage.classList.remove('is-error', 'is-success');

    const emailInput = document.getElementById('loginEmail');
    const passwordInput = document.getElementById('loginPassword');

    const email = emailInput?.value.trim();
    const password = passwordInput?.value;

    if (!email || !password) {
      basicLoginMessage.textContent = '이메일과 비밀번호를 모두 입력해 주세요.';
      basicLoginMessage.classList.add('is-error');
      return;
    }

    try {
      // 백엔드 sign-in API 경로에 맞게 수정해서 사용하세요
      const url = `${API_BASE || ''}/sign-in`;

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        basicLoginMessage.textContent =
          data.message || '로그인에 실패했습니다. 다시 시도해 주세요.';
        basicLoginMessage.classList.add('is-error');
        return;
      }

      // 도팔님이 만든 signIn 응답 형식에 맞춰 토큰 저장
      // 예: { user: { token, email } }
      const token = data.user?.token || data.token;
      if (token) {
        window.localStorage.setItem('routiner_token', token);
      }

      basicLoginMessage.textContent = '로그인 성공! 내 루틴으로 이동합니다.';
      basicLoginMessage.classList.add('is-success');

      // 성공 후 루틴 페이지로 이동
      setTimeout(() => {
        window.location.href = '/routines.html';
      }, 600);
    } catch (error) {
      console.error(error);
      basicLoginMessage.textContent =
        '네트워크 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.';
      basicLoginMessage.classList.add('is-error');
    }
  });
})();
