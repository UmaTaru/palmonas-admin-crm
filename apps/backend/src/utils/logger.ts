export function sanitizeBody(body: any) {
  if (!body) return body;

  const clone = { ...body };

  if (clone.password) clone.password = "***";
  if (clone.accessToken) clone.accessToken = "***";
  if (clone.refreshToken) clone.refreshToken = "***";

  return clone;
}
