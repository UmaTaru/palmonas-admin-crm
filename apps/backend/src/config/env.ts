export const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
export const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

if (!ACCESS_SECRET || !REFRESH_SECRET) {
  throw new Error("JWT secrets must be defined in environment variables");
}