import { console } from "inspector";

import { NextRequest, NextResponse } from "next/server";

interface ApiHandlerOptions<T> {
  requireParams?: string[];
  handler: (params: Record<string, string>) => Promise<T>;
}

export function createApiHandler<T>({
  requireParams,
  handler,
}: ApiHandlerOptions<T>) {
  return async function (request: NextRequest) {
    try {
      const searchParams = request.nextUrl.searchParams;
      const params: Record<string, string> = {};

      if (requireParams) {
        for (const param of requireParams) {
          const value = searchParams.get(param);
          if (!value) {
            return NextResponse.json(
              { error: `Missing required parameters: ${param}` },
              { status: 400 }
            );
          }
          params[param] = value;
        }
      }
      const data = await handler(params);
      return NextResponse.json(data);
    } catch (err) {
      console.error("API Error: ", err);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  };
}
