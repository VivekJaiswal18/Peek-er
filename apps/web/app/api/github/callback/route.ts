import { type NextRequest, NextResponse } from "next/server";
import { appUrl } from "../../../lib/app-url";

function repositoriesUrl(request: NextRequest, status: string) {
  const url = appUrl("/repositories", request.url);
  url.searchParams.set("github", status);
  return url;
}

export async function GET(request: NextRequest) {
  const installationId = request.nextUrl.searchParams.get("installation_id");
  const setupAction = request.nextUrl.searchParams.get("setup_action");

  if (!installationId || !/^\d+$/.test(installationId)) {
    return NextResponse.redirect(repositoriesUrl(request, "invalid-callback"));
  }

  const accessToken = request.cookies.get("accessToken")?.value;
  if (!accessToken) {
    const loginUrl = appUrl("/login", request.url);
    loginUrl.searchParams.set("github", "authentication-required");
    return NextResponse.redirect(loginUrl);
  }

  const backendUrl = "http://peeker-backend-lb-999606264.ap-southeast-2.elb.amazonaws.com"
    // process.env.BACKEND_URL ??
    // process.env.NEXT_PUBLIC_API_URL ??
    // "http://localhost:8080";

  try {
    const response = await fetch(`${backendUrl}/github/installations`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ installationId, setupAction }),
      cache: "no-store",
    });

    if (response.status === 401) {
      const loginUrl = appUrl("/login", request.url);
      loginUrl.searchParams.set("github", "authentication-required");
      return NextResponse.redirect(loginUrl);
    }

    if (!response.ok) {
      console.error(
        "GitHub installation callback failed",
        response.status,
        (await response.text()).slice(0, 500),
      );
      return NextResponse.redirect(
        repositoriesUrl(request, "connection-failed"),
      );
    }

    const result = (await response.json()) as { repositoryCount?: number };
    const successUrl = repositoriesUrl(request, "connected");
    successUrl.searchParams.set(
      "repositories",
      String(result.repositoryCount ?? 0),
    );
    return NextResponse.redirect(successUrl);
  } catch (error) {
    console.error("GitHub callback could not reach the API", error);
    return NextResponse.redirect(repositoriesUrl(request, "connection-failed"));
  }
}
