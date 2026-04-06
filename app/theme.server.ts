import { createCookieFactory, createCookieSessionStorageFactory } from "@remix-run/server-runtime";

import { Theme, isTheme } from "~/components/ThemeProvider";

const sessionSecret = process.env.SESSION_SECRET ?? "default-dev-secret";

const createCookie = createCookieFactory({
  sign: (value) => value,
  unsign: (value) => value
});

const createCookieSessionStorage = createCookieSessionStorageFactory(createCookie);

const themeStorage = createCookieSessionStorage({
  cookie: {
    name: "theme-cookie",
    secure: true,
    secrets: [sessionSecret],
    sameSite: "lax",
    path: "/",
    httpOnly: true,
  },
});

async function getThemeSession(request: Request) {
  const session = await themeStorage.getSession(request.headers.get("Cookie"));
  return {
    getTheme: () => {
      const themeValue = session.get("theme");
      return isTheme(themeValue) ? themeValue : "dark";
    },
    setTheme: (theme: Theme) => session.set("theme", theme),
    commit: () => themeStorage.commitSession(session),
  };
}

export { getThemeSession };
