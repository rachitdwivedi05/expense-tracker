import dotenv from "dotenv";

dotenv.config();

const env = process.env;

// Production uses the new names; the old names are kept as fallbacks so local setups do not break.
export const mongoUri = env.MONGO_URI || env.DB_URL;
export const jwtSecret = env.JWT_SECRET || env.AUTH_SECRET;
export const forgotTokenSecret = env.FORGOT_TOKEN_SECRET || jwtSecret;
export const clientUrl = env.CLIENT_URL || env.DOMAIN || "";
export const isProduction = env.NODE_ENV === "production" || env.ENVIRONMENT === "PROD";

export const requiredEnv = {
  MONGO_URI: mongoUri,
  JWT_SECRET: jwtSecret,
  CLIENT_URL: clientUrl,
};

export const getClientOrigins = () =>
  clientUrl
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

export const getMongoUriDebugInfo = () => {
  try {
    const uri = new URL(mongoUri);

    return {
      host: uri.host,
      db: uri.pathname.replace("/", "") || "(default)",
      appName: uri.searchParams.get("appName") || "(none)",
      source: env.MONGO_URI ? "MONGO_URI" : "DB_URL",
    };
  } catch {
    return {
      host: "(invalid uri)",
      db: "(invalid uri)",
      appName: "(invalid uri)",
      source: env.MONGO_URI ? "MONGO_URI" : "DB_URL",
    };
  }
};

export const assertRequiredEnv = () => {
  const missing = Object.entries(requiredEnv)
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missing.length) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  }
};
