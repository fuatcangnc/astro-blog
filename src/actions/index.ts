import { ActionError, defineAction } from "astro:actions";
import { z } from "astro/zod";

const cmsUrl = (import.meta.env.REY_CMS_URL || "http://localhost:3000").replace(
  /\/$/,
  ""
);

const copySessionCookies = (
  response: Response,
  cookies: {
    set: (
      name: string,
      value: string,
      options: Record<string, unknown>
    ) => void;
  }
) => {
  for (const header of response.headers.getSetCookie?.() ?? []) {
    const [cookiePart] = header.split(";");
    const separator = cookiePart.indexOf("=");
    if (separator < 1) continue;
    cookies.set(
      cookiePart.slice(0, separator),
      cookiePart.slice(separator + 1),
      {
        path: "/",
        httpOnly: true,
        sameSite: "lax",
        secure: import.meta.env.PROD,
      }
    );
  }
};

const requestCmsAuth = async (
  path: string,
  body: Record<string, string>,
  context: { cookies: Parameters<typeof copySessionCookies>[1] }
) => {
  let response: Response;
  try {
    response = await fetch(`${cmsUrl}/api/auth${path}`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        cookie: context.cookies.header("cookie") || "",
      },
      body: JSON.stringify(body),
    });
  } catch {
    throw new ActionError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Authentication service is unavailable.",
    });
  }
  const payload = (await response.json().catch(() => null)) as {
    message?: string;
  } | null;
  if (!response.ok)
    throw new ActionError({
      code: "BAD_REQUEST",
      message: payload?.message || "Authentication request failed.",
    });
  copySessionCookies(response, context.cookies);
  return payload;
};

export const server = {
  requestOtp: defineAction({
    accept: "form",
    input: z.object({ email: z.string().email() }),
    handler: async ({ email }, context) => {
      await requestCmsAuth(
        "/email-otp/send-verification-otp",
        { email, type: "sign-in" },
        context
      );
      return { email, message: "Verification code sent." };
    },
  }),
  verifyOtp: defineAction({
    accept: "form",
    input: z.object({ email: z.string().email(), otp: z.string().length(6) }),
    handler: async ({ email, otp }, context) => {
      await requestCmsAuth("/sign-in/email-otp", { email, otp }, context);
      return { message: "You are signed in." };
    },
  }),
};
