import { NextRequest, NextResponse } from "next/server";

type ApiHandler = (request: NextRequest) => Promise<NextResponse>;

export function withApiWrapper(handler: ApiHandler): ApiHandler {
  return async (request: NextRequest) => {
    const startTime = Date.now();
    const { method, url } = request;

    console.log(`[${method}] ${url} - Started`);

    try {
      const response = await handler(request);
      const duration = Date.now() - startTime;

      console.log(`[${method}] ${url} - ${response.status} (${duration}ms)`);
      return response;
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(`[${method}] ${url} - Error (${duration}ms):`, error);

      return NextResponse.json(
        {
          error: "Internal server error",
          message: error instanceof Error ? error.message : "Unknown error",
        },
        { status: 500 },
      );
    }
  };
}
