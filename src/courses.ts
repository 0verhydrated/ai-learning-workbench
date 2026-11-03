import { getCollection } from 'astro:content';
import type { Language } from './i18n';
export const courseIds = ['ai-foundations', 'vibe-coding', 'agents-tools', 'automation'] as const;
export type CourseId = typeof courseIds[number];
export const courses = {
 'ai-foundations': {
  en: {title:'AI fundamentals',level:'Start here',description:'Understand the systems behind the chat box: models, tokens, context, inference, and retrieval.',outcome:'Compare models for a task, estimate inference costs, and design a source-grounded answer.',prerequisite:'No AI background required. Basic Python helps with the optional code examples.',topics:'Models · Tokens · Context · Cost · Embeddings · RAG'},
  ko: {title:'AI 기초 이해하기',level:'처음 시작하는 분께',description:'채팅 화면 뒤에서 작동하는 모델, 토큰, 맥락, 추론, 검색의 원리를 이해합니다.',outcome:'작업에 맞는 모델을 비교하고, 추론 비용을 추산하며, 출처에 근거한 답변을 설계합니다.',prerequisite:'AI 사전 지식은 필요하지 않습니다. 선택 실습에는 기초 Python 지식이 도움이 됩니다.',topics:'모델 · 토큰 · 맥락 · 비용 · 임베딩 · RAG'}
 },
 'vibe-coding': {
  en: {title:'Build with AI',level:'Hands-on development',description:'Take a small reading-list app from its first page to testing, security review, and deployment.',outcome:'Build and inspect a browser app, debug it, and verify it before publishing.',prerequisite:'A computer and browser. The setup lesson covers an editor, Node.js, and Git.',topics:'Web basics · Debugging · Tests · Data · Deployment'},
  ko: {title:'AI와 함께 앱 만들기',level:'개발 실습',description:'작은 독서 목록 앱을 만들며 첫 페이지부터 테스트, 보안 점검, 배포까지 경험합니다.',outcome:'브라우저 앱을 만들고 코드를 살펴보며, 오류를 수정하고 배포 전에 검증합니다.',prerequisite:'컴퓨터와 브라우저가 필요합니다. 편집기, Node.js, Git은 개발 환경 강의에서 준비합니다.',topics:'웹 기초 · 디버깅 · 테스트 · 데이터 · 배포'}
 },
 'agents-tools': {
  en: {title:'Agents & integrations',level:'Understand and connect',description:'Learn how agents act, how tools and MCP connect systems, and where skills and identity files belong.',outcome:'Design a bounded agent, review an MCP connection, and separate reusable skills from identity and memory.',prerequisite:'AI fundamentals, or familiarity with models, context, and basic JSON.',topics:'Agent loops · Tool calling · MCP · Skills · SOUL.md · Memory'},
  ko: {title:'에이전트와 도구 연결',level:'구조 이해와 연결',description:'에이전트의 동작과 도구·MCP의 연결 구조를 배우고, 스킬과 정체성 파일의 역할을 구분합니다.',outcome:'범위가 정해진 에이전트를 설계하고 MCP 연결을 검토하며, 스킬·정체성·메모리를 구분합니다.',prerequisite:'AI 기초 과정 또는 모델, 맥락, 기본 JSON에 대한 이해가 필요합니다.',topics:'에이전트 루프 · 도구 호출 · MCP · 스킬 · SOUL.md · 메모리'}
 },
 automation: {
  en: {title:'Automation & reliability',level:'Operate responsibly',description:'Move beyond a successful demo: schedule jobs, handle retries, evaluate output, and observe failures.',outcome:'Design a weekly news workflow with source checks, safe retries, approval gates, and deployment verification.',prerequisite:'Agents & integrations recommended. Basic Python and Git help with the examples.',topics:'Cron · Webhooks · Idempotency · Evals · Tracing · Permissions'},
  ko: {title:'자동화와 신뢰성',level:'안정적인 운영',description:'한 번의 성공을 넘어 작업 예약, 재시도, 출력 평가, 장애 관찰까지 다룹니다.',outcome:'출처 검증, 안전한 재시도, 승인 단계, 배포 확인을 갖춘 주간 뉴스 작업을 설계합니다.',prerequisite:'에이전트와 도구 연결 과정을 권장합니다. 기초 Python과 Git 지식이 예제 이해에 도움이 됩니다.',topics:'크론 · 웹훅 · 멱등성 · 평가 · 추적 · 권한'}
 }
} as const;
export async function courseLessons(course:CourseId, lang:Language){
 if(course==='vibe-coding') return (await getCollection(lang==='ko'?'korean':'lessons')).map(l=>({id:l.id,data:l.data})).sort((a,b)=>a.data.order-b.data.order);
 return (await getCollection('academy')).filter(l=>l.data.course===course && l.data.lang===lang).map(l=>({id:l.id.split('/').at(-1)!,data:l.data})).sort((a,b)=>a.data.order-b.data.order);
}
export function lessonPath(course:CourseId,id:string){return course==='vibe-coding'?`lessons/${id}/`:`courses/${course}/${id}/`;}
