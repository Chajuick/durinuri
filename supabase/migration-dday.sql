-- ============================================================
--  D-day 기능 추가 마이그레이션
--  기존 DB에 app_settings(만난 시작일) 테이블만 추가한다.
--  Supabase SQL Editor 에서 한 번 실행하세요.
-- ============================================================

create table if not exists app_settings (
  id          int primary key default 1,
  since_date  date,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  constraint app_settings_single check (id = 1)
);

insert into app_settings (id) values (1) on conflict (id) do nothing;

alter table app_settings enable row level security;

-- updated_at 자동 갱신
drop trigger if exists trg_settings_updated on app_settings;
create trigger trg_settings_updated before update on app_settings
  for each row execute function set_updated_at();

-- 서버(service_role) 접근 권한
grant all on app_settings to service_role;
