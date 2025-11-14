(() => {
  const { GOOGLE_LOGIN_URL, KAKAO_LOGIN_URL, API_BASE } =
    window.__ROUTINER__ || {};

  document.getElementById('googleLoginBtn')?.addEventListener('click', () => {
    location.href = GOOGLE_LOGIN_URL || '/auth/google';
  });
  document.getElementById('kakaoLoginBtn')?.addEventListener('click', () => {
    location.href = KAKAO_LOGIN_URL || '/auth/kakao';
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

  // (예시) API 핑 찍어보기
  // fetch(`${API_BASE}/health`).then(r => r.json()).then(console.log).catch(console.error);
})();
