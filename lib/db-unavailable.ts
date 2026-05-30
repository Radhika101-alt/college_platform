export const DB_UNAVAILABLE_MESSAGE =
  "Database is temporarily unavailable. Please try again in a minute.";

export function isDbUnavailableError(error: unknown): boolean {
  if (!error) return false;

  const anyErr = error as any;
  const name = typeof anyErr?.name === "string" ? anyErr.name : "";
  const code = typeof anyErr?.code === "string" ? anyErr.code : "";
  const message =
    typeof anyErr?.message === "string" ? anyErr.message : String(error);

  // Prisma common connectivity errors:
  // - P1001: Can't reach database server
  // - P1002: The database server was reached but timed out
  if (code === "P1001" || code === "P1002") return true;

  // Prisma initialization error tends to contain this phrase.
  if (name.includes("PrismaClientInitializationError")) return true;

  // Fallback string checks for Neon/PG connectivity failures.
  const msg = message.toLowerCase();
  if (msg.includes("can't reach database server")) return true;
  if (msg.includes("connect econnrefused")) return true;
  if (msg.includes("etimedout")) return true;

  return false;
}
