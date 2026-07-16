-- ============================================================
--  여정(장소)별 코멘트: 서로 각자 한마디 남기기
--  Supabase SQL Editor 에서 한 번 실행.
--  (별점 없이 코멘트만. 데이트 전체 총평은 기존 reviews 그대로 유지.)
-- ============================================================
create table if not exists stop_reviews (
  id          uuid primary key default gen_random_uuid(),
  stop_id     uuid not null references stops(id) on delete cascade,
  author_id   uuid not null references members(id) on delete cascade,
  comment     text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (stop_id, author_id)         -- 여정당 사람 1개씩 → 서로 각자
);

create index if not exists idx_stop_reviews_stop on stop_reviews(stop_id);

-- updated_at 자동 갱신
drop trigger if exists trg_stop_reviews_updated on stop_reviews;
create trigger trg_stop_reviews_updated before update on stop_reviews
  for each row execute function set_updated_at();

-- RLS: 켜되 공개 정책 없음 → 서버(service_role)로만 접근
alter table stop_reviews enable row level security;
