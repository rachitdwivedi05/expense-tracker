import { isProduction } from "../config/env.js";

const isHttpsRequest = (req) =>
  isProduction ||
  req.secure ||
  req.headers["x-forwarded-proto"] === "https" ||
  req.hostname?.endsWith(".onrender.com");

export const getAuthCookieOptions = (req, maxAge = 86400000) => {
  const secure = isHttpsRequest(req);

  return {
    httpOnly: true,
    secure,
    sameSite: secure ? "none" : "lax",
    partitioned: secure,
    path: "/",
    maxAge,
  };
};

export const getClearAuthCookieOptions = (req) => {
  const { maxAge, ...options } = getAuthCookieOptions(req);

  return options;
};
