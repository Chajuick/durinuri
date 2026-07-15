// 도메인 타입 (DESIGN.md 데이터 모델과 일치)

export type CourseStatus = "planned" | "done";
export type Transport = "car" | "transit";

export interface Member {
  id: string;
  name: string;
  color: string | null;
  created_at: string;
}

export interface Course {
  id: string;
  title: string;
  date: string | null; // YYYY-MM-DD
  status: CourseStatus;
  memo: string | null;
  cover_photo: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Stop {
  id: string;
  course_id: string;
  sort_order: number;
  name: string;
  place_query: string | null;
  lat: number | null;
  lng: number | null;
  arrive_at: string | null; // HH:MM[:SS]
  stay_min: number | null;
  is_reserved: boolean;
  memo: string | null;
}

export interface Review {
  id: string;
  course_id: string;
  author_id: string;
  rating: number | null;
  one_line: string | null;
  created_at: string;
  updated_at: string;
}

export interface Photo {
  id: string;
  course_id: string;
  stop_id: string | null;
  author_id: string | null;
  url: string;
  caption: string | null;
  taken_at: string | null;
  created_at: string;
}

// 이동시간 계산 결과 (저장하지 않음)
export interface TravelLeg {
  mode: Transport;
  minutes: number | null; // 이동 소요(분), null=계산 불가
  transfers?: number | null; // 대중교통 환승 횟수
  slackMinutes: number | null; // 여유(분), 음수=촉박
}

export interface Segment {
  fromStopId: string;
  toStopId: string;
  gapMinutes: number | null; // 두 도착시각 간격(분)
  legs: TravelLeg[];
}
