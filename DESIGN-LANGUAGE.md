# 디자인 언어 규칙 (Design Language)

> 이 문서의 규칙은 **모든 화면·컴포넌트·코드에 강제 적용**된다.
> 방향: **하이브리드** — 갈 데이트(일정)는 토스톤(깔끔·명확), 간 데이트(추억)는 썸원톤(몽글·감성).
> 컬러/타이포/아이콘/여백 토큰은 **하나로 통일**하고, 두 톤은 그 토큰의 "밀도·크기·따뜻함"만 다르게 쓴다.

---

## 0. 절대 규칙

1. **이모지 금지.** UI 어디에도 이모지(🚗😀❤️…) 사용 금지. 모든 아이콘은 **SVG 라인 아이콘**.
   - 라이브러리: **lucide-react** (line, stroke 1.5~1.75).
   - 상태/의미 전달도 아이콘 + 색 + 텍스트로. 절대 이모지로 대체하지 않는다.
2. **컴포넌트로만 만든다.** 임의 색/여백 하드코딩 금지 → 아래 토큰(Tailwind 변수) 사용.
3. **모바일 우선.** 기준 폭 375~430px. 터치 타깃 최소 44px.

---

## 1. 컬러 토큰

따뜻한 뉴트럴 베이스 + 코랄 포인트. (Tailwind `theme.extend.colors` 또는 CSS 변수로 등록)

```
/* Neutral (warm) */
--bg          #FBF8F6   화면 배경 (웜 오프화이트)
--surface     #FFFFFF   카드/시트
--surface-2   #F5F0EC   서브 배경(구분 영역)
--border      #ECE5DF   경계선
--text        #2B2A28   본문 (웜 블랙)
--text-sub    #837C75   보조 텍스트
--text-faint  #B4ACA4   placeholder/캡션

/* Brand (coral) */
--primary     #F0806A   메인 포인트(버튼/링크/강조)
--primary-ink #C85B47   진한 코랄(텍스트/hover)
--primary-bg  #FCEDE8   연한 코랄 배경(뱃지/선택)

/* Semantic — 이동시간 여유/촉박 */
--ok          #3FA37A   여유(초록)
--ok-bg       #E7F4EE
--warn        #E0A34A   촉박(앰버)
--warn-bg     #FBF1DF
--danger      #E06B5C   지각 위험(레드)
--danger-bg   #FBEAE7
```

- 다크모드는 v2. 우선 라이트 단일 테마로 완성.
- 색은 브랜드 정체성이라 나중에 통으로 교체 가능하게 **토큰으로만** 참조.

---

## 2. 타이포그래피

- **기본 서체: Pretendard** (UI 전체). 한글 가독성·현대감 = 토스/지마켓 톤 담당.
- **감성 악센트 서체: 라운드 손글씨형**(예: Gaegu / Ownglyph 계열) — **간 데이트 제목·한줄평에만** 제한적으로.
  - 남용 금지. "추억" 화면의 타이틀/한줄평 정도만. 본문·숫자·일정엔 절대 안 씀.

```
Display  28 / 700   화면 대표 타이틀
Title    20 / 700   섹션·카드 제목
Body     15 / 500   본문
Label    13 / 600   뱃지·메타(시간, 예약 등)
Caption  12 / 500   보조 설명
```
- 숫자(시간/소요분)는 항상 Pretendard, `tabular-nums`로 정렬 흔들림 방지.

---

## 3. 형태 토큰 (라운드·그림자·여백)

몽글한 감성 = **넉넉한 라운드 + 부드럽고 낮은 그림자**.

```
radius-sm   10px   버튼/인풋
radius-md   16px   카드(일정)
radius-lg   20px   카드(추억)/사진/시트
radius-full 999px  칩/아바타

shadow-soft   0 2px 8px rgba(43,42,40,.06)     기본 카드
shadow-float  0 8px 24px rgba(43,42,40,.10)    떠있는 시트/모달

space scale   4 / 8 / 12 / 16 / 20 / 24 / 32   (Tailwind 기본 4px 그리드)
```

- 갈 데이트(토스톤): radius-md, 여백 타이트, 그림자 약하게, 정보 밀도↑.
- 간 데이트(썸원톤): radius-lg, 여백 넉넉, 사진 큼직, 그림자 부드럽게.

---

## 4. 아이콘 규칙 (lucide)

| 용도 | 아이콘 | 색 |
|------|--------|-----|
| 차량 이동 | `car` | text-sub |
| 대중교통 | `train-front` / `bus` | text-sub |
| 대기시간 | `hourglass` | text-sub |
| 시간/간격 | `clock` | text-sub |
| 예약됨 | `bookmark-check` | primary |
| 여유 | `check-circle` | ok |
| 촉박/경고 | `alert-triangle` | warn/danger |
| 사진 | `image` / `camera` | text-sub |
| 별점 | `star` (fill=별점, outline=빈칸) | primary |
| 위치 | `map-pin` | text-sub |

- 기본 크기 20px, 인라인 라벨 옆 16px. stroke 1.5.
- 아이콘 단독으로 의미 전달 금지 → 항상 텍스트/라벨 동반(접근성).

---

## 5. 두 톤의 적용 (하이브리드 매핑)

### 갈 데이트 — 토스/지마켓톤
- 흰 카드 + 얇은 border, 명확한 타임라인.
- 이동시간 블록: 좌측 세로선(timeline rail) + 차/대중교통 2줄, 여유/촉박은 semantic 색 칩.
- 숫자·시간 강조, 장식 최소. "정보를 빠르게 읽는" 화면.

### 간 데이트 — 썸원톤
- 큰 라운드 사진(radius-lg), 부드러운 그림자, 넉넉한 여백.
- 제목/한줄평에 감성 악센트 서체, primary-bg 톤의 포근한 배경 카드.
- 별점은 코랄 `star`, 갤러리는 세로 스크롤 카드.

### 공통
- 상·하단 내비, 버튼, 인풋, 컬러/타이포/아이콘 세트는 **완전히 동일**.
- 두 화면을 오갈 때 "같은 앱"이라는 일관감 유지 — 톤 차이는 밀도·크기·따뜻함으로만.

---

## 6. 핵심 컴포넌트 사양(초안)

- **Button**: primary(코랄 채움/흰 텍스트, radius-sm), secondary(surface+border), ghost(텍스트만).
- **Card**: surface + shadow-soft. 일정=radius-md, 추억=radius-lg.
- **Badge/Chip**: 예약=primary-bg, 여유=ok-bg, 촉박=warn/danger-bg. 아이콘16 + Label13.
- **TravelBlock**(구간 이동 표시): timeline rail + `car`/`train` 2행 + 여유 칩. (일정 화면 핵심)
- **StarRating**: `star` 5개, primary fill.
- **PhotoCard**: radius-lg 이미지 + 캡션. 추억 화면 핵심.
- **BottomNav**: 홈 / 갈 데이트 / 간 데이트 / (설정). lucide 아이콘 + Label.

---

## 7. 모션(절제)

- 전환은 짧고 부드럽게: 150~200ms, ease-out.
- 카드 진입 시 살짝 fade+up(8px) 정도. 과한 애니메이션 금지.
- 사진 열람 시 부드러운 확대. 그 외엔 정적·정갈하게.
