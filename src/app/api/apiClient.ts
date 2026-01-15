/* Simple server side in-memory cache with TTL
 * Written by claude https://claude.ai/chat/41a2748f-0159-4fda-ab1c-013fd64231ec
 */

import { NextRequest, NextResponse } from "next/server";
import { cache } from "lib/cache";
import { compressJson } from "lib/compression";

type ApiHandler = (request: NextRequest) => Promise<NextResponse>;

type CacheOptions = {
  enabled?: boolean;
  key?: string;
  ttl?: number;
  compress?: boolean;
};

// Auto-detect if route should be cached based on URL
function shouldAutoCache(url: string): CacheOptions | null {
  // Cache all view routes by default
  if (url.includes("/api/views/map/")) {
    const routeName = url.split("/api/views/map/")[1]?.split("?")[0];
    return {
      enabled: true,
      key: `map-view-${routeName}`,
      ttl: 7 * 24 * 60 * 60 * 1000, // 7 days
      compress: true,
    };
  }

  // Add more auto-cache patterns here if needed
  // if (url.includes("/api/topic/")) { ... }

  return null;
}

export function withApiWrapper(
  handler: ApiHandler,
  cacheOptions?: CacheOptions,
): ApiHandler {
  return async (request: NextRequest) => {
    const startTime = Date.now();
    const { method, url } = request;

    console.log(`[${method}] ${url} - Started`);

    try {
      // Auto-detect caching if not explicitly provided
      const finalCacheOptions = cacheOptions ?? shouldAutoCache(url);

      // Try cache first if enabled
      if (finalCacheOptions?.enabled && finalCacheOptions.key) {
        const cached = cache.get(finalCacheOptions.key, finalCacheOptions.ttl);
        if (cached) {
          const duration = Date.now() - startTime;
          console.log(`[${method}] ${url} - 200 (${duration}ms) [CACHED]`);

          // If compressed cache, return as-is
          if (finalCacheOptions.compress && Buffer.isBuffer(cached)) {
            return new NextResponse(cached, {
              status: 200,
              headers: {
                "Content-Type": "application/json",
                "Content-Encoding": "gzip",
              },
            });
          }

          return NextResponse.json(cached);
        }
      }

      // Cache miss - call handler
      const response = await handler(request);
      const duration = Date.now() - startTime;

      // Cache the response if enabled and successful
      if (
        finalCacheOptions?.enabled &&
        finalCacheOptions.key &&
        response.status === 200
      ) {
        const data = await response.json();

        if (finalCacheOptions.compress) {
          // Compress and cache the buffer
          const compressed = await compressJson(data);
          cache.set(finalCacheOptions.key, compressed);
          console.log(
            `[${method}] ${url} - ${response.status} (${duration}ms) [CACHED & COMPRESSED]`,
          );
          return new NextResponse(compressed, {
            status: 200,
            headers: {
              "Content-Type": "application/json",
              "Content-Encoding": "gzip",
            },
          });
        } else {
          // Cache the plain data
          cache.set(finalCacheOptions.key, data);
          console.log(
            `[${method}] ${url} - ${response.status} (${duration}ms) [CACHED]`,
          );
          return NextResponse.json(data);
        }
      }

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

/* Old version before claudes changes */

// import { NextRequest, NextResponse } from "next/server";

// type ApiHandler = (request: NextRequest) => Promise<NextResponse>;

// export function withApiWrapper(handler: ApiHandler): ApiHandler {
//   return async (request: NextRequest) => {
//     const startTime = Date.now();
//     const { method, url } = request;

//     console.log(`[${method}] ${url} - Started`);

//     try {
//       const response = await handler(request);
//       const duration = Date.now() - startTime;

//       console.log(`[${method}] ${url} - ${response.status} (${duration}ms)`);
//       return response;
//     } catch (error) {
//       const duration = Date.now() - startTime;
//       console.error(`[${method}] ${url} - Error (${duration}ms):`, error);

//       return NextResponse.json(
//         {
//           error: "Internal server error",
//           message: error instanceof Error ? error.message : "Unknown error",
//         },
//         { status: 500 },
//       );
//     }
//   };
// }
