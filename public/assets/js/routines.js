// ----- 데이터 (필요 시 서버 API로 교체 가능) -----
const CATEGORY = {
  health: { id: 1, name: '건강', emoji: '🫀' },
  fitness: { id: 2, name: '운동', emoji: '🏃' },
  selfdev: { id: 3, name: '자기개발', emoji: '📚' },
  beauty: { id: 4, name: '미용', emoji: '✨' },
};

// 카테고리별 루틴 정의
const ROUTINES = {
  health: [
    { title: '아침 커피 구매안하기', desc: '카페인을 줄이는 루틴' },
    { title: '흡연하지 않기', desc: '유해물질을 하지 않는 루틴' },
  ],
  fitness: [
    { title: '런닝하기', desc: '다이어트와 체력을 늘리는 루틴' },
    { title: '스트레칭하기', desc: '굳은 몸을 풀어주는 루틴' },
  ],
  selfdev: [
    { title: '책 읽기', desc: '어휘력을 높이기 위한 루틴' },
    { title: 'SQL 문제 풀기', desc: '개발 공부를 꾸준히 하기' },
  ],
  beauty: [
    { title: '하루 물 2L 마시기', desc: '수분 섭취로 피부 건강 챙기기' },
    { title: '얼굴 팩 하기', desc: '피부 컨디션을 올리는 루틴' },
  ],
};

// ----- 렌더링 -----
const panel = document.getElementById('routine-panel');
const tabButtons = Array.from(document.querySelectorAll('.tab'));

// 루틴 카드 HTML 생성
function routineCard(emoji, title, desc) {
  return `
      <article class="routine-card" role="button" tabindex="0" aria-label="${title}">
        <div class="routine-bullet" aria-hidden="true">${emoji}</div>
        <div class="routine-main">
          <div class="routine-title">${title}</div>
          <div class="routine-desc">${desc}</div>
        </div>
      </article>
    `;
}

// 현재 카테고리 그리기
function renderCategory(categoryKey) {
  const cat = CATEGORY[categoryKey];
  const items = ROUTINES[categoryKey] || [];
  panel.setAttribute('aria-busy', 'true');

  if (!items.length) {
    panel.innerHTML = `<div class="empty">해당 카테고리에 등록된 루틴이 없습니다.</div>`;
  } else {
    panel.innerHTML = items
      .map((it) => routineCard(cat.emoji, it.title, it.desc))
      .join('');
  }

  // 접근성용 포커스 이동
  setTimeout(() => panel.setAttribute('aria-busy', 'false'), 150);
}

// 탭 활성화 토글
function setActiveTab(targetBtn) {
  tabButtons.forEach((btn) => {
    const active = btn === targetBtn;
    btn.classList.toggle('is-active', active);
    btn.setAttribute('aria-selected', active ? 'true' : 'false');
  });
}

// 이벤트 바인딩
tabButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    setActiveTab(btn);
    renderCategory(btn.dataset.category);
    // 해시 반영(딥링크)
    history.replaceState({}, '', `#${btn.dataset.category}`);
  });
  // 키보드 접근성(좌우 화살표로 이동)
  btn.addEventListener('keydown', (e) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    const idx = tabButtons.indexOf(btn);
    const next =
      e.key === 'ArrowRight'
        ? (idx + 1) % tabButtons.length
        : (idx - 1 + tabButtons.length) % tabButtons.length;
    tabButtons[next].focus();
    tabButtons[next].click();
  });
});

// 초기 로드(해시 우선)
(function init() {
  const hash = location.hash.replace('#', '');
  const first = tabButtons[0];
  const target = tabButtons.find((b) => b.dataset.category === hash) || first;
  setActiveTab(target);
  renderCategory(target.dataset.category);
})();
