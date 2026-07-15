# 우리 데이트 💑 (our-date)

둘이 함께 **계획하고(갈 데이트)** **기억하는(간 데이트)** 데이트 기록 웹앱.
공유 비밀번호로 로그인하고, 각자 이름을 정해 서로 사진·리뷰를 남깁니다.

- **갈 데이트**: 코스/장소 일정 관리 + 구간별 **차/대중교통 이동시간 & 여유/촉박** 표시
- **간 데이트**: 사진 업로드(작성자 표시) + **서로 별점·한줄평**
- 스택: Next.js 14 (App Router) · Supabase(Postgres+Storage) · 카카오/ODsay · Tailwind

> 설계 문서: [`DESIGN.md`](./DESIGN.md) · 디자인 규칙: [`DESIGN-LANGUAGE.md`](./DESIGN-LANGUAGE.md)
> 스타일 프리뷰(목업): [`mockup/style-preview.html`](./mockup/style-preview.html)

---

## 1. 로컬 실행

```bash
npm install
cp .env.example .env.local   # 값 채우기 (아래 참고)
npm run dev                  # http://localhost:3000
```

## 2. Supabase 준비

1. [supabase.com](https://supabase.com) 에서 프로젝트 생성
2. **SQL Editor** 에서 아래 두 파일을 순서대로 실행
   - `supabase/schema.sql` — 테이블 5개 + 인덱스 + 트리거 + RLS + `date-photos` 버킷
   - `supabase/seed.sql` — 금/토 초기 스케줄 (날짜는 파일에서 수정 가능)
3. **Settings → API** 에서 키 복사
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` → `SUPABASE_SERVICE_ROLE_KEY` *(서버 전용, 절대 노출 금지)*

> 인증은 **공유 비밀번호**로 처리하고 모든 DB 접근은 서버(서비스 롤)를 통해서만 합니다.
> RLS는 켜져 있고 공개 정책이 없어 anon 키로는 데이터에 직접 접근할 수 없습니다.

## 3. 지도/이동시간 키 (선택)

없어도 앱은 동작하며, 이동시간은 "계산 안 됨"으로 표시됩니다.

- **카카오** (지오코딩 + 자동차 길찾기): [developers.kakao.com](https://developers.kakao.com)
  앱 생성 → **REST API 키** → `KAKAO_REST_KEY`.
  자동차 길찾기는 **카카오모빌리티 길찾기 API** 사용 신청이 필요할 수 있어요.
- **ODsay** (대중교통): [lab.odsay.com](https://lab.odsay.com) 가입 → API 키 → `ODSAY_KEY`

## 4. 로그인 설정

- `SHARE_PASSWORD` — 둘이 함께 쓸 공유 비밀번호
- `SESSION_SECRET` — 세션 쿠키 서명용 랜덤 문자열
  ```bash
  # 예: 안전한 시크릿 생성
  node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
  ```

## 5. 환경변수 정리 (`.env.local` / Vercel)

| 이름 | 설명 |
|------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 프로젝트 URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon public 키 |
| `SUPABASE_SERVICE_ROLE_KEY` | service_role 키 (서버 전용) |
| `SHARE_PASSWORD` | 공유 로그인 비밀번호 |
| `SESSION_SECRET` | 세션 서명 시크릿 |
| `KAKAO_REST_KEY` | 카카오 REST 키 (선택) |
| `ODSAY_KEY` | ODsay 키 (선택) |

---

## 6. Vercel 배포

1. 코드를 GitHub 저장소에 푸시
   ```bash
   git init && git add -A && git commit -m "init our-date"
   git branch -M main
   git remote add origin <your-repo-url>
   git push -u origin main
   ```
2. [vercel.com](https://vercel.com) → **New Project** → 저장소 선택 (프레임워크 자동 인식: Next.js)
3. **Environment Variables** 에 위 표의 값 전부 입력
4. **Deploy** — 이후 `main` 에 푸시하면 자동 재배포

배포 후:
- 첫 접속 시 `/login` → 공유 비밀번호 + 이름 입력
- 서로 다른 이름으로 각자 로그인하면 사진·리뷰에 이름표로 구분됩니다
- 이름은 **설정**에서 언제든 변경 가능 (기존 기록의 작성자 표시도 함께 갱신)

---

## 프로젝트 구조

```
app/
  page.tsx              홈 피드 (다가오는 데이트 + 최근 추억)
  login/                공유 비번 + 이름 로그인
  settings/             이름 변경 / 로그아웃
  new/                  코스 생성
  plans/                갈 데이트 목록
    [id]/               갈 데이트 상세 (타임라인 + 이동시간 + 편집)
  memories/             간 데이트 목록
    [id]/               간 데이트 상세 (사진 + 서로 리뷰)
components/             BottomNav, TravelBlock, Stars, MemberBadge
lib/
  supabase/admin.ts     서버 전용 Supabase(service_role)
  session.ts, auth.ts   세션 서명/검증
  geo/                  kakao(지오코딩·차) · odsay(대중교통) · travel(구간 계산)
  data.ts, format.ts, types.ts
supabase/               schema.sql · seed.sql
middleware.ts           미인증 → /login
```
