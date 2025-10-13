import { AppDataSource } from '../../models/dataSource';
import { Routines } from '../../domain/routines/routineEntity';

const seedRoutines = async () => {
  const routines = [
    // 건강
    {
      title: '아침 스트레칭',
      description: '하루를 상쾌하게 시작하는 스트레칭',
      icon_url: 'stretch.png',
      category: '건강',
    },
    {
      title: '물 2리터 마시기',
      description: '하루 권장 수분 섭취량을 지켜요',
      icon_url: 'water.png',
      category: '건강',
    },
    {
      title: '아침 식사 거르지 않기',
      description: '건강한 식습관을 위해 아침 챙기기',
      icon_url: 'breakfast.png',
      category: '건강',
    },
    {
      title: '비타민 복용',
      description: '필요한 영양소 챙기기',
      icon_url: 'vitamin.png',
      category: '건강',
    },
    {
      title: '10분 명상',
      description: '하루 10분 마음을 정리하는 시간',
      icon_url: 'meditation.png',
      category: '건강',
    },
    {
      title: '과일 하나 먹기',
      description: '비타민 섭취를 위해 과일 섭취',
      icon_url: 'fruit.png',
      category: '건강',
    },
    {
      title: '저녁 과식 금지',
      description: '소화에 부담 없는 식습관',
      icon_url: 'dinner.png',
      category: '건강',
    },
    {
      title: '하루 1만 보 걷기',
      description: '꾸준한 건강 관리',
      icon_url: 'walk.png',
      category: '건강',
    },
    {
      title: '스트레칭 3세트',
      description: '혈액 순환을 돕는 스트레칭',
      icon_url: 'stretching.png',
      category: '건강',
    },
    {
      title: '정시 취침',
      description: '건강한 수면 패턴 유지',
      icon_url: 'sleep.png',
      category: '건강',
    },
    {
      title: '카페인 줄이기',
      description: '카페인 섭취량을 조절하기',
      icon_url: 'coffee.png',
      category: '건강',
    },
    {
      title: '식사 전 손 씻기',
      description: '기본 위생 관리 습관',
      icon_url: 'hand.png',
      category: '건강',
    },
    {
      title: '식사 후 양치',
      description: '치아 건강 지키기',
      icon_url: 'teeth.png',
      category: '건강',
    },
    {
      title: '단 음식 줄이기',
      description: '혈당 조절과 체중 관리',
      icon_url: 'food.png',
      category: '건강',
    },
    {
      title: '하루 비타민 C 섭취',
      description: '면역력 강화',
      icon_url: 'vitaminC.png',
      category: '건강',
    },

    // 운동
    {
      title: '조깅 30분',
      description: '체력 향상을 위한 유산소 운동',
      icon_url: 'jogging.png',
      category: '운동',
    },
    {
      title: '홈트 20분',
      description: '집에서도 간단히 운동하기',
      icon_url: 'homeTraining.png',
      category: '운동',
    },
    {
      title: '플랭크 1분',
      description: '코어 강화 운동',
      icon_url: 'core.png',
      category: '운동',
    },
    {
      title: '스쿼트 30회',
      description: '하체 근육 강화 운동',
      icon_url: 'squat.png',
      category: '운동',
    },
    {
      title: '팔굽혀펴기 20회',
      description: '상체 근력 향상',
      icon_url: 'pushUp.png',
      category: '운동',
    },
    {
      title: '줄넘기 300회',
      description: '유산소 운동 및 다리 근력 강화',
      icon_url: 'jump.png',
      category: '운동',
    },
    {
      title: '자전거 타기 1시간',
      description: '유산소와 하체 근육 강화',
      icon_url: 'bike.png',
      category: '운동',
    },
    {
      title: '런지 20회',
      description: '허벅지와 엉덩이 강화',
      icon_url: 'lunge.png',
      category: '운동',
    },
    {
      title: '요가 30분',
      description: '유연성과 집중력 향상',
      icon_url: 'yoga.png',
      category: '운동',
    },
    {
      title: '계단 오르기',
      description: '심폐지구력 향상',
      icon_url: 'stair.png',
      category: '운동',
    },
    {
      title: '복근 운동 3세트',
      description: '복부 근육 강화',
      icon_url: 'strength.png',
      category: '운동',
    },
    {
      title: '등 운동 3세트',
      description: '자세 교정 및 등 근육 강화',
      icon_url: 'back.png',
      category: '운동',
    },
    {
      title: '마사지 마무리',
      description: '운동 후 근육 이완',
      icon_url: 'massage.png',
      category: '운동',
    },
    {
      title: '벽밀기 자세 유지 2분',
      description: '등과 어깨 스트레칭',
      icon_url: 'wall.png',
      category: '운동',
    },
    {
      title: '수영하기',
      description: '쳬력 증진',
      icon_url: 'swim.png',
      category: '운동',
    },

    // 개발
    {
      title: '코딩 1시간',
      description: '꾸준한 실력 향상',
      icon_url: 'coding.png',
      category: '개발',
    },
    {
      title: '알고리즘 문제 1개 풀기',
      description: '논리력과 사고력 향상',
      icon_url: 'algorithm.png',
      category: '개발',
    },
    {
      title: 'Git 커밋 남기기',
      description: '하루의 기록 남기기',
      icon_url: 'commit.png',
      category: '개발',
    },
    {
      title: '리팩토링 1개',
      description: '코드 품질 향상',
      icon_url: 'refactor.png',
      category: '개발',
    },
    {
      title: '기술 블로그 읽기',
      description: '최신 트렌드 파악',
      icon_url: 'blog.png',
      category: '개발',
    },
    {
      title: '오픈소스 코드 보기',
      description: '실무 코드 학습',
      icon_url: 'openapi.png',
      category: '개발',
    },
    {
      title: '타입스크립트 공부',
      description: '정적 타입에 익숙해지기',
      icon_url: 'study.png',
      category: '개발',
    },
    {
      title: 'SQL 쿼리 연습',
      description: '데이터 다루는 능력 향상',
      icon_url: 'sql.png',
      category: '개발',
    },
    {
      title: 'JS 문법 복습',
      description: '기초 문법 다지기',
      icon_url: 'grammar.png',
      category: '개발',
    },
    {
      title: '리액트 공식문서 읽기',
      description: 'React 이해도 높이기',
      icon_url: 'react.png',
      category: '개발',
    },
    {
      title: '디버깅 훈련',
      description: '문제 해결 능력 향상',
      icon_url: 'debug.png',
      category: '개발',
    },
    {
      title: '코드리뷰 참여',
      description: '협업 능력 향상',
      icon_url: 'review.png',
      category: '개발',
    },
    {
      title: '새로운 라이브러리 학습',
      description: '생산성 향상',
      icon_url: 'live.png',
      category: '개발',
    },
    {
      title: 'API 문서 정리',
      description: '명확한 커뮤니케이션',
      icon_url: 'api.png',
      category: '개발',
    },
    {
      title: '개발 유튜브 시청',
      description: '지식 확장',
      icon_url: 'watching.png',
      category: '개발',
    },

    // 뷰티
    {
      title: '스킨케어 루틴 지키기',
      description: '기초 케어는 기본',
      icon_url: 'skin.png',
      category: '뷰티',
    },
    {
      title: '자외선 차단제 바르기',
      description: '피부 보호의 첫걸음',
      icon_url: 'sunstick.png',
      category: '뷰티',
    },
    {
      title: '클렌징 꼼꼼히 하기',
      description: '노폐물 제거',
      icon_url: 'cleansing.png',
      category: '뷰티',
    },
    {
      title: '수분크림 바르기',
      description: '피부 보습 유지',
      icon_url: 'cream.png',
      category: '뷰티',
    },
    {
      title: '팩 하기',
      description: '피부 컨디션 회복',
      icon_url: 'pack.png',
      category: '뷰티',
    },
    {
      title: '헤어 트리트먼트',
      description: '모발 관리',
      icon_url: 'hair.png',
      category: '뷰티',
    },
    {
      title: '손톱 정리하기',
      description: '청결하고 깔끔한 인상',
      icon_url: 'nail.png',
      category: '뷰티',
    },
    {
      title: '각질 제거',
      description: '피부결 정돈',
      icon_url: 'dirty.png',
      category: '뷰티',
    },
    {
      title: '립밤 바르기',
      description: '건조한 입술 케어',
      icon_url: 'lip.png',
      category: '뷰티',
    },
    {
      title: '세안 후 토너 바르기',
      description: '피부 밸런스 유지',
      icon_url: 'tonner.png',
      category: '뷰티',
    },
    {
      title: '잠들기 전 수분 팩',
      description: '밤 사이 피부 회복',
      icon_url: 'sleep_pag.png',
      category: '뷰티',
    },
    {
      title: '주 1회 필링',
      description: '묵은 각질 제거',
      icon_url: 'filling.png',
      category: '뷰티',
    },
    {
      title: '아이크림 바르기',
      description: '눈가 주름 예방',
      icon_url: 'eyeCream.png',
      category: '뷰티',
    },
    {
      title: '머리감기 전 브러싱',
      description: '두피 건강 관리',
      icon_url: 'brushing.png',
      category: '뷰티',
    },
    {
      title: '향수 뿌리기',
      description: '기분 좋은 하루의 시작',
      icon_url: 'perfume.png',
      category: '뷰티',
    },
  ];

  try {
    await AppDataSource.initialize();
    const routineRepo = AppDataSource.getRepository(Routines);

    for (const data of routines) {
      const exists = await routineRepo.findOneBy({ title: data.title });
      if (!exists) {
        const routine = routineRepo.create(data);
        await routineRepo.save(routine);
      }
    }

    console.log('✅ Routines seed completed!');
  } catch (error) {
    console.error('❌ Seed failed:', error);
  } finally {
    await AppDataSource.destroy();
  }
};

seedRoutines();
