import type { Context } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";

/**
 * RFC 9457 Problem Details error response.
 */
export interface ProblemDetails {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance?: string;
}

export function problemResponse(
  c: Context,
  status: ContentfulStatusCode,
  detail: string,
  type?: string,
): Response {
  const titles: Record<number, string> = {
    400: "Bad Request",
    401: "Unauthorized",
    403: "Forbidden",
    404: "Not Found",
    409: "Conflict",
    422: "Validation Error",
    429: "Too Many Requests",
    500: "Internal Server Error",
  };

  const body: ProblemDetails = {
    type: type ?? `https://api.salesreputationprotocol.org/errors/${titles[status]?.toLowerCase().replace(/ /g, "-") ?? "error"}`,
    title: titles[status] ?? "Error",
    status,
    detail,
    instance: c.req.path,
  };

  return c.json(body, status, {
    "Content-Type": "application/problem+json",
  });
}
