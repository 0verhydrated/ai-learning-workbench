export type Language = 'en' | 'ko';
export const parts = ['Foundations', 'Working with AI', 'Building reliably', 'Advanced practice'] as const;
export const ui = {
 en: {
  book: 'The Vibe Coding Book', edition: 'A practical field guide', skip: 'Skip to content', chapters: 'Chapters', courseChapters: 'Course chapters', intro: 'Introduction', lessons: 'Lessons', overview: 'Course overview', language: 'Language', languageLabel: 'Select language', onPage: 'On this page', journey: 'A note for the journey', reminder: 'AI can write the code. Understanding it is still your job.', learn: 'Learn by building.', understand: 'Keep understanding what you ship.', footer: 'Built with Astro · Written in Markdown',
  partNames: ['Foundations', 'Working with AI', 'Building reliably', 'Advanced practice'], lesson: 'Lesson', reading: 'read', exercise: 'Includes a practical exercise', navigation: 'Lesson navigation', previous: 'Previous', next: 'Next lesson', complete: 'Course complete', return: 'Return to the curriculum'
 },
 ko: {
  book: '바이브 코딩 안내서', edition: '직접 만들며 배우는 AI 개발', skip: '본문으로 건너뛰기', chapters: '목차', courseChapters: '강의 목차', intro: '소개', lessons: '강의', overview: '전체 학습 과정', language: '언어', languageLabel: '언어 선택', onPage: '이 페이지의 내용', journey: '배우는 동안 기억할 점', reminder: '코드는 AI가 작성할 수 있습니다. 하지만 이해하고 확인하는 일은 우리의 몫입니다.', learn: '직접 만들며 배워 보세요.', understand: '배포하는 코드는 이해하고 있어야 합니다.', footer: 'Astro로 제작 · Markdown으로 작성',
  partNames: ['기초 다지기', 'AI와 함께 개발하기', '신뢰할 수 있는 코드 만들기', '심화 실습'], lesson: '강의', reading: '읽기', exercise: '실습 포함', navigation: '이전·다음 강의', previous: '이전', next: '다음 강의', complete: '학습 마무리', return: '전체 학습 과정으로'
 }
} as const;
