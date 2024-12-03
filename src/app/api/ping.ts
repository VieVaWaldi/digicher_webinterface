import { pingNeon } from "lib/db";

export async function GET() {
  try {
    await pingNeon();
    return new Response("OK");
  } catch (error) {
    console.error("Ping failed:", error); // Add error logging
    return new Response("Error", { status: 500 });
  }
}
