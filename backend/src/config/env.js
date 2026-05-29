import dotenv from "dotenv";

dotenv.config();

const env = process.env;

// Production uses the new names; the old names are kept as fallbacks so local setups do not break.
export const mongoUri = env.MONGO_URI || env.DB_URL;
export const jwtSecret = env.JWT_SECRET || env.AUTH_SECRET;
export const forgotTokenSecret = env.FORGOT_TOKEN_SECRET || jwtSecret;
export const clientUrl = env.CLIENT_URL || env.DOMAIN || "";
export const emailUser = env.EMAIL_USER;
export const emailPass = env.EMAIL_PASS;
export const isProduction = env.NODE_ENV === "production" || env.ENVIRONMENT === "PROD";

export const requiredEnv = {
  MONGO_URI: mongoUri,
  JWT_SECRET: jwtSecret,
  CLIENT_URL: clientUrl,
  EMAIL_USER: emailUser,
  EMAIL_PASS: emailPass,
};

export const getClientOrigins = () =>
  clientUrl
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

export const assertRequiredEnv = () => {
  const missing = Object.entries(requiredEnv)
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missing.length) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  }
};
