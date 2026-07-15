-- ============================================================
--  우리 데이트 · Supabase 스키마
--  Supabase 대시보드 > SQL Editor 에 붙여넣고 실행하세요.
--  (인증은 앱의 공유 비밀번호로 처리 → 모든 DB 접근은 서버(서비스 롤)를 통해서만.
--   RLS를 켜고 공개 정책을 두지 않아 anon 키로는 데이터에 접근 불가.)
-- ============================================================

-- 멤버 = 우리 둘 (로그인 시 이름 정함, 변경 가능)
create table if not exists members (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  color       text,                       -- 이름표 색(구분용)
  created_at  timestamptz not null default now()
);

-- 커플 공용 설정 (단일 행: D-day 만난 시작일 등)
create table if not exists app_settings (
  id          int primary key default 1,
  since_date  date,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  constraint app_settings_single check (id = 1)
);
insert into app_settings (id) values (1) on conflict (id) do nothing;

-- 코스 = 하루 데이트
create table if not exists courses (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  date        date,
  status      text not null default 'planned'
                check (status in ('planned', 'done')),
  memo        text,
  cover_photo text,
  updated_by  uuid references members(id) on delete set null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- 장소 = 코스 안의 개별 일정
create table if not exists stops (
  id          uuid primary key default gen_random_uuid(),
  course_id   uuid not null references courses(id) on delete cascade,
  sort_order  int  not null default 0,
  name        text not null,
  place_query text,                        -- 카카오 검색 원문
  lat         double precision,            -- 지오코딩 결과 캐시
  lng         double precision,
  arrive_at   time,                        -- 도착/예약 시각
  stay_min    int,                         -- 머무는 시간(분), 선택
  is_reserved boolean not null default false,
  memo        text
);

-- 리뷰 = 서로 각자 남김 (사람당 한 데이트에 1개)
create table if not exists reviews (
  id          uuid primary key default gen_random_uuid(),
  course_id   uuid not null references courses(id) on delete cascade,
  author_id   uuid not null references members(id) on delete cascade,
  rating      int check (rating between 1 and 5),
  one_line    text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (course_id, author_id)
);

-- 사진 = 서로 업로드
create table if not exists photos (
  id          uuid primary key default gen_random_uuid(),
  course_id   uuid not null references courses(id) on delete cascade,
  stop_id     uuid references stops(id) on delete set null,
  author_id   uuid references members(id) on delete set null,
  url         text not null,
  caption     text,
  taken_at    timestamptz,
  created_at  timestamptz not null default now()
);

-- 인덱스
create index if not exists idx_stops_course   on stops(course_id, sort_order);
create index if not exists idx_reviews_course on reviews(course_id);
create index if not exists idx_photos_course  on photos(course_id, created_at);
create index if not exists idx_courses_status on courses(status, date);

-- updated_at 자동 갱신 트리거
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists trg_courses_updated on courses;
create trigger trg_courses_updated before update on courses
  for each row execute function set_updated_at();

drop trigger if exists trg_reviews_updated on reviews;
create trigger trg_reviews_updated before update on reviews
  for each row execute function set_updated_at();

drop trigger if exists trg_settings_updated on app_settings;
create trigger trg_settings_updated before update on app_settings
  for each row execute function set_updated_at();

-- ============================================================
--  RLS: 켜되 공개 정책 없음 → anon/authenticated 직접 접근 차단.
--  서버에서 service_role 키로만 접근(서비스 롤은 RLS 우회).
-- ============================================================
alter table members      enable row level security;
alter table app_settings enable row level security;
alter table courses enable row level security;
alter table stops   enable row level security;
alter table reviews enable row level security;
alter table photos  enable row level security;

-- 서버 전용 키(service_role)에만 접근 권한 부여.
-- (프로젝트 생성 시 "Automatically expose new tables"를 꺼도 서버 접근이 되도록.)
-- anon/authenticated 에는 권한을 주지 않아 외부 직접 접근은 계속 차단됩니다.
grant usage on schema public to service_role;
grant all on all tables in schema public to service_role;
grant all on all sequences in schema public to service_role;
alter default privileges in schema public grant all on tables to service_role;
alter default privileges in schema public grant all on sequences to service_role;

-- ============================================================
--  Storage 버킷: date-photos (공개 읽기)
--  아래는 SQL로도 생성 가능하지만, 대시보드 Storage에서
--  "date-photos" 버킷을 Public 으로 만들어도 됩니다.
-- ============================================================
insert into storage.buckets (id, name, public)
values ('date-photos', 'date-photos', true)
on conflict (id) do nothing;
