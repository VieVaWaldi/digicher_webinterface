/* Simple gzip compression for data sent over API
 * Written by claude https://claude.ai/chat/41a2748f-0159-4fda-ab1c-013fd64231ec
 */

import { gzip } from "zlib";
import { promisify } from "util";

const gzipAsync = promisify(gzip);

export async function compressJson<T>(data: T): Promise<Buffer> {
  const json = JSON.stringify(data);
  return gzipAsync(json);
}
