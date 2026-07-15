import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE = "ourdate_session";
const MAX_AGE = 60 * 60 * 24 * 60; // 60일

export interface SessionPayload {
  memberId: string;
  name: string;
}

function secretKey() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET 환경변수가 없습니다.");
  return new TextEncoder().encode(secret);
}

/** 세션 토큰 서명 (Node/Edge 공용) */
export async function signSession(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(secretKey());
}

/** 토큰 검증 → payload 또는 null (Edge 미들웨어에서도 사용) */
export async function verifySession(
  token: string | undefined,
): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey());
    if (typeof payload.memberId === "string" && typeof payload.name === "string") {
      return { memberId: payload.memberId, name: payload.name };
    }
    return null;
  } catch {
    return null;
  }
}

export const SESSION_MAX_AGE = MAX_AGE;
