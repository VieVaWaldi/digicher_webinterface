import { withApiWrapper } from "app/api/apiClient";
import { apiSuccess } from "app/api/response";
import { cache } from "lib/cache";
import { NextRequest } from "next/server";

async function getCacheStats() {
  return apiSuccess(cache.getStats());
}

async function clearCache(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const key = searchParams.get("key");

  if (key) {
    cache.clear(key);
    return apiSuccess({ message: `Cache cleared for key: ${key}` });
  } else {
    cache.clear();
    return apiSuccess({ message: "All cache cleared" });
  }
}

export const GET = withApiWrapper(getCacheStats);
export const DELETE = withApiWrapper(clearCache);
