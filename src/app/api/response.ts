import { NextResponse } from "next/server";

export function apiSuccess<T>(data: T, status: number = 200) {
  return NextResponse.json(data, { status });
}

export function apiError(message: string, status: number = 500) {
  return NextResponse.json({ error: true, message }, { status });
}

export function apiNotFound(resource: string = "Resource") {
  return NextResponse.json(
    { error: true, message: `${resource} not found` },
    { status: 404 },
  );
}
