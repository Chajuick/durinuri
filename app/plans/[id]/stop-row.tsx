"use client";

import { useState } from "react";
import {
  MapPin,
  BookmarkCheck,
  Pencil,
  Trash2,
  X,
  Search,
  Loader2,
  Check,
} from "lucide-react";
import type { Stop } from "@/lib/types";
import type { PlaceHit } from "@/lib/geo/kakao";
import { formatTime } from "@/lib/format";
import {
  updateStop,
  deleteStop,
  searchPlacesAction,
  geocodeAddressAction,
} from "@/app/plans/actions";
import { NaverMapLink } from "@/components/NaverMapLink";

export function StopRow({
  stop,
  courseId,
}: {
  stop: Stop;
  courseId: string;
}) {
  const [editing, setEditing] = useState(false);

  return (
    <div className="rounded-md border border-border bg-surface shadow-soft">
      {!editing ? (
        <div className="flex items-center justify-between gap-2 px-4 py-3">
          <div className="flex min-w-0 items-center gap-2">
            <MapPin className="size-4 shrink-0 text-text-faint" strokeWidth={1.75} />
            <span className="truncate text-[14.5px] font-bold">{stop.name}</span>
            {stop.is_reserved && (
              <BookmarkCheck className="size-4 shrink-0 text-primary" strokeWidth={2} />
            )}
          </div>
          <div className="flex items-center gap-1">
            <span className="tnum mr-1 text-[15px] font-extrabold">
              {formatTime(stop.arrive_at) || "--:--"}
            </span>
            <NaverMapLink query={stop.place_query || stop.name} />
            <button
              onClick={() => setEditing(true)}
              aria-label="수정"
              className="grid size-7 place-items-center rounded-sm text-text-sub"
            >
              <Pencil className="size-4" strokeWidth={1.75} />
            </button>
          </div>
        </div>
      ) : (
        <form
          action={async (fd) => {
            await updateStop(fd);
            setEditing(false);
          }}
          className="flex flex-col gap-2.5 p-4"
        >
          <input type="hidden" name="id" value={stop.id} />
          <input type="hidden" name="course_id" value={courseId} />
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-bold text-text-sub">장소 수정</span>
            <button
              type="button"
              onClick={() => setEditing(false)}
              aria-label="닫기"
              className="text-text-faint"
            >
              <X className="size-4" strokeWidth={2} />
            </button>
          </div>
          <StopFields stop={stop} />
          <div className="mt-1 flex items-center gap-2">
            <button
              type="submit"
              className="h-10 flex-1 rounded-sm bg-primary text-sm font-bold text-white shadow-soft"
            >
              저장
            </button>
            <button
              type="submit"
              formAction={async (fd) => {
                await deleteStop(fd);
                setEditing(false);
              }}
              className="grid h-10 w-11 place-items-center rounded-sm border border-border text-danger"
              aria-label="삭제"
            >
              <Trash2 className="size-4" strokeWidth={1.75} />
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export function StopFields({
  stop,
  defaultDate,
}: {
  stop?: Stop;
  defaultDate?: string | null;
}) {
  const [name, setName] = useState(stop?.name ?? "");
  const [placeQuery, setPlaceQuery] = useState(stop?.place_query ?? "");
  const [coord, setCoord] = useState<{ lat: number; lng: number } | null>(
    stop?.lat != null && stop?.lng != null
      ? { lat: stop.lat, lng: stop.lng }
      : null,
  );
  const [pickedLabel, setPickedLabel] = useState<string | null>(null);

  const [term, setTerm] = useState("");
  const [results, setResults] = useState<PlaceHit[]>([]);
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);

  async function runSearch() {
    const q = term.trim();
    if (!q || searching) return;
    setSearching(true);
    setSearched(true);
    try {
      setResults(await searchPlacesAction(q));
    } catch {
      setResults([]);
    } finally {
      setSearching(false);
    }
  }

  function pick(h: PlaceHit) {
    setName(h.name);
    setPlaceQuery(h.name);
    setCoord({ lat: h.lat, lng: h.lng });
    setPickedLabel(h.roadAddress || h.address);
    setResults([]);
    setSearched(false);
    setTerm("");
  }

  // 주소로 직접 매칭 (장소검색이 안 될 때)
  const [addrOpen, setAddrOpen] = useState(false);
  const [addrTerm, setAddrTerm] = useState("");
  const [addrBusy, setAddrBusy] = useState(false);
  const [addrErr, setAddrErr] = useState(false);

  async function runAddress() {
    const a = addrTerm.trim();
    if (!a || addrBusy) return;
    setAddrBusy(true);
    setAddrErr(false);
    try {
      const r = await geocodeAddressAction(a);
      if (r) {
        setCoord({ lat: r.lat, lng: r.lng });
        setPickedLabel(r.address);
        if (!name.trim()) setName(a);
        setResults([]);
        setSearched(false);
        setAddrOpen(false);
        setAddrTerm("");
      } else {
        setAddrErr(true);
      }
    } catch {
      setAddrErr(true);
    } finally {
      setAddrBusy(false);
    }
  }

  return (
    <>
      {/* 장소 검색 */}
      <div className="flex flex-col gap-2 rounded-sm border border-border bg-surface-2/60 p-2.5">
        <div className="flex gap-1.5">
          <input
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                runSearch();
              }
            }}
            placeholder="장소 검색 (예: 을지로 백년안경)"
            className="h-10 flex-1 rounded-sm border border-border bg-bg px-3 text-[13px] outline-none focus:border-primary"
          />
          <button
            type="button"
            onClick={runSearch}
            disabled={searching || !term.trim()}
            aria-label="검색"
            className="grid h-10 w-11 shrink-0 place-items-center rounded-sm bg-primary text-white disabled:opacity-50"
          >
            {searching ? (
              <Loader2 className="size-4 animate-spin" strokeWidth={2} />
            ) : (
              <Search className="size-4" strokeWidth={2} />
            )}
          </button>
        </div>

        {results.length > 0 && (
          <ul className="flex max-h-60 flex-col gap-1 overflow-y-auto">
            {results.map((h) => (
              <li key={h.id}>
                <button
                  type="button"
                  onClick={() => pick(h)}
                  className="flex w-full flex-col gap-0.5 rounded-sm border border-border bg-surface px-3 py-2 text-left hover:border-primary"
                >
                  <span className="flex items-center gap-1.5">
                    <MapPin
                      className="size-3.5 shrink-0 text-primary"
                      strokeWidth={1.75}
                    />
                    <span className="text-[13.5px] font-bold">{h.name}</span>
                    {h.category && (
                      <span className="text-[11px] text-text-faint">
                        {h.category}
                      </span>
                    )}
                  </span>
                  <span className="pl-5 text-[12px] text-text-sub">
                    {h.roadAddress || h.address}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
        {searched && !searching && results.length === 0 && (
          <p className="px-1 text-[12px] text-text-faint">
            검색 결과가 없어요. 주소로 직접 넣어볼까?
          </p>
        )}

        {/* 주소로 직접 매칭 */}
        <div className="border-t border-border pt-2">
          {!addrOpen ? (
            <button
              type="button"
              onClick={() => setAddrOpen(true)}
              className="text-[12px] font-semibold text-primary-ink"
            >
              검색이 안 되면 · 주소로 직접 넣기
            </button>
          ) : (
            <div className="flex flex-col gap-1.5">
              <div className="flex gap-1.5">
                <input
                  value={addrTerm}
                  onChange={(e) => setAddrTerm(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      runAddress();
                    }
                  }}
                  placeholder="도로명·지번 주소 (예: 서울 중구 마른내로 34)"
                  className="h-10 flex-1 rounded-sm border border-border bg-bg px-3 text-[13px] outline-none focus:border-primary"
                />
                <button
                  type="button"
                  onClick={runAddress}
                  disabled={addrBusy || !addrTerm.trim()}
                  className="grid h-10 w-14 shrink-0 place-items-center rounded-sm bg-primary text-[13px] font-bold text-white disabled:opacity-50"
                >
                  {addrBusy ? (
                    <Loader2 className="size-4 animate-spin" strokeWidth={2} />
                  ) : (
                    "확인"
                  )}
                </button>
              </div>
              {addrErr && (
                <p className="px-1 text-[12px] font-semibold text-danger">
                  그 주소를 못 찾았어. 도로명·지번을 확인해줘.
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      <input
        name="name"
        required
        value={name}
        onChange={(e) => {
          setName(e.target.value);
          setCoord(null);
          setPickedLabel(null);
        }}
        placeholder="장소 이름 (예: 신당 오신돼지갈비)"
        className="h-11 rounded-sm border border-border bg-bg px-3 text-[14px] outline-none focus:border-primary"
      />
      <input
        name="place_query"
        value={placeQuery}
        onChange={(e) => {
          setPlaceQuery(e.target.value);
          setCoord(null);
          setPickedLabel(null);
        }}
        placeholder="지도 검색어 (비우면 이름으로 검색)"
        className="h-11 rounded-sm border border-border bg-bg px-3 text-[13px] outline-none focus:border-primary"
      />
      <input type="hidden" name="lat" value={coord?.lat ?? ""} />
      <input type="hidden" name="lng" value={coord?.lng ?? ""} />
      {coord && (
        <p className="flex items-center gap-1.5 px-1 text-[12px] font-semibold text-ok">
          <Check className="size-3.5" strokeWidth={2.25} />
          위치 확인됨{pickedLabel ? ` · ${pickedLabel}` : ""}
        </p>
      )}
      <label className="flex flex-col gap-1">
        <span className="text-[11.5px] font-semibold text-text-faint">
          날짜 (비우면 데이트 날짜)
        </span>
        <input
          name="date"
          type="date"
          defaultValue={stop?.date ?? defaultDate ?? ""}
          className="h-11 rounded-sm border border-border bg-bg px-3 text-[14px] outline-none focus:border-primary"
        />
      </label>
      <div className="flex gap-2">
        <label className="flex flex-1 flex-col gap-1">
          <span className="text-[11.5px] font-semibold text-text-faint">도착 시각</span>
          <input
            name="arrive_at"
            type="time"
            defaultValue={formatTime(stop?.arrive_at ?? null)}
            className="h-11 rounded-sm border border-border bg-bg px-3 text-[14px] outline-none focus:border-primary"
          />
        </label>
        <label className="flex w-28 flex-col gap-1">
          <span className="text-[11.5px] font-semibold text-text-faint">머무는(분)</span>
          <input
            name="stay_min"
            type="number"
            min={0}
            defaultValue={stop?.stay_min ?? ""}
            placeholder="선택"
            className="h-11 rounded-sm border border-border bg-bg px-3 text-[14px] outline-none focus:border-primary"
          />
        </label>
      </div>
      <label className="flex items-center gap-2 text-[13px] font-semibold text-text-sub">
        <input
          name="is_reserved"
          type="checkbox"
          defaultChecked={stop?.is_reserved ?? false}
          className="size-4 accent-[var(--primary)]"
        />
        예약함
      </label>
    </>
  );
}
