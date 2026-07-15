-- ============================================================
--  우리 데이트 · 초기 스케줄 seed
--  schema.sql 실행 후, SQL Editor 에서 실행하세요.
--  (금 2026-07-17 / 토 2026-07-18 기준. 날짜는 필요 시 수정)
-- ============================================================

-- 금요일 데이트
with c as (
  insert into courses (title, date, status)
  values ('금요일 데이트', '2026-07-17', 'planned')
  returning id
)
insert into stops (course_id, sort_order, name, place_query, arrive_at, is_reserved)
select c.id, v.sort_order, v.name, v.place_query, v.arrive_at::time, true
from c, (values
  (0, '신당 오신돼지갈비', '신당 오신돼지갈비', '16:00'),
  (1, '하남 미미사 양꼬치', '하남 미미사 양꼬치', '20:00')
) as v(sort_order, name, place_query, arrive_at);

-- 토요일 데이트
with c as (
  insert into courses (title, date, status)
  values ('토요일 데이트', '2026-07-18', 'planned')
  returning id
)
insert into stops (course_id, sort_order, name, place_query, arrive_at, is_reserved)
select c.id, v.sort_order, v.name, v.place_query, v.arrive_at::time, true
from c, (values
  (0, '강동 홍대닭갈비', '강동 홍대닭갈비', '11:00'),
  (1, '명동 반지야놀자', '명동 반지야놀자', '13:00'),
  (2, '용산 체크인', '용산 체크인', '18:30')
) as v(sort_order, name, place_query, arrive_at);
