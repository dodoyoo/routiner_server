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
})();
