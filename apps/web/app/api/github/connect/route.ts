import { NextResponse } from "next/server";
import { appUrl } from "../../../lib/app-url";

export function GET(request: Request) {
  const configuredUrl = process.env.GITHUB_APP_INSTALL_URL;
  const appSlug = process.env.GITHUB_APP_SLUG;

  if (!configuredUrl && !appSlug) {
    const fallback = appUrl("/repositories", request.url);
    fallback.searchParams.set("github", "not-configured");
    return NextResponse.redirect(fallback);
  }

  const installUrl = configuredUrl ?? `https://github.com/apps/${appSlug}/installations/new`;
  return NextResponse.redirect(installUrl);
}
