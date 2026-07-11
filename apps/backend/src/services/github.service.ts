import crypto from "crypto";
import jwt from "jsonwebtoken";
import { prisma } from "@repo/db";

const GITHUB_API = "https://api.github.com";

type GitHubInstallation = {
  id: number;
  account: {
    login: string;
    type: string;
  };
  suspended_at: string | null;
};

type GitHubRepository = {
  id: number;
  name: string;
  full_name: string;
  html_url: string;
  clone_url: string;
  default_branch: string;
};

type InstallationTokenResponse = {
  token: string;
  expires_at: string;
};

type InstallationRepositoriesResponse = {
  total_count: number;
  repositories: GitHubRepository[];
};

function requiredEnvironment(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not configured`);
  return value;
}

function githubPrivateKey(): string {
  const configuredKey = requiredEnvironment("GITHUB_PRIVATE_KEY");
  return configuredKey.includes("BEGIN")
    ? configuredKey.replace(/\\n/g, "\n")
    : Buffer.from(configuredKey, "base64").toString("utf8");
}

export function createGithubAppJwt(): string {
  const now = Math.floor(Date.now() / 1000);
  return jwt.sign(
    {
      iat: now - 60,
      exp: now + 9 * 60,
      iss: requiredEnvironment("GITHUB_APP_ID"),
    },
    githubPrivateKey(),
    { algorithm: "RS256" },
  );
}

async function githubRequest<T>(
  path: string,
  token: string,
  init: RequestInit = {},
): Promise<T> {
  const response = await fetch(`${GITHUB_API}${path}`, {
    ...init,
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "Peek-er",
      ...init.headers,
    },
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`GitHub API ${response.status}: ${detail.slice(0, 300)}`);
  }

  return (await response.json()) as T;
}

export async function getGithubInstallation(
  installationId: string,
): Promise<GitHubInstallation> {
  return githubRequest<GitHubInstallation>(
    `/app/installations/${installationId}`,
    createGithubAppJwt(),
  );
}

export async function createInstallationAccessToken(
  installationId: string,
): Promise<InstallationTokenResponse> {
  return githubRequest<InstallationTokenResponse>(
    `/app/installations/${installationId}/access_tokens`,
    createGithubAppJwt(),
    { method: "POST" },
  );
}

async function listInstallationRepositories(
  installationToken: string,
): Promise<GitHubRepository[]> {
  const repositories: GitHubRepository[] = [];
  let page = 1;

  while (true) {
    const result = await githubRequest<InstallationRepositoriesResponse>(
      `/installation/repositories?per_page=100&page=${page}`,
      installationToken,
    );
    repositories.push(...result.repositories);
    if (result.repositories.length < 100) break;
    page += 1;
  }

  return repositories;
}

export async function connectGithubInstallation(
  userId: number,
  installationId: string,
) {
  const remoteInstallation = await getGithubInstallation(installationId);

  if (String(remoteInstallation.id) !== installationId) {
    throw new Error("GitHub returned a different installation ID");
  }
  if (remoteInstallation.suspended_at) {
    throw new Error("This GitHub installation is suspended");
  }

  const installation = await prisma.gitInstallation.upsert({
    where: { installationId },
    update: {
      userId,
      provider: "github",
      accountLogin: remoteInstallation.account.login,
      accountType: remoteInstallation.account.type,
    },
    create: {
      userId,
      provider: "github",
      installationId,
      accountLogin: remoteInstallation.account.login,
      accountType: remoteInstallation.account.type,
    },
  });

  const installationToken = await createInstallationAccessToken(installationId);
  const githubRepositories = await listInstallationRepositories(
    installationToken.token,
  );

  const repositories = await Promise.all(
    githubRepositories.map(async (githubRepository) => {
      const [
        owner = remoteInstallation.account.login,
        name = githubRepository.name,
      ] = githubRepository.full_name.split("/");

      return prisma.repository.upsert({
        where: {
          provider_owner_name: {
            provider: "github",
            owner,
            name,
          },
        },
        update: {
          userId,
          gitInstallationId: installation.id,
          providerRepoId: String(githubRepository.id),
          repoUrl: githubRepository.html_url,
          defaultBranch: githubRepository.default_branch || "main",
        },
        create: {
          userId,
          gitInstallationId: installation.id,
          provider: "github",
          providerRepoId: String(githubRepository.id),
          owner,
          name,
          repoUrl: githubRepository.html_url,
          defaultBranch: githubRepository.default_branch || "main",
        },
      });
    }),
  );

  return {
    installation,
    repositories,
  };
}

export async function recordGithubInstallation(
  remoteInstallation: GitHubInstallation,
) {
  return prisma.gitInstallation.upsert({
    where: { installationId: String(remoteInstallation.id) },
    update: {
      provider: "github",
      accountLogin: remoteInstallation.account.login,
      accountType: remoteInstallation.account.type,
    },
    create: {
      provider: "github",
      installationId: String(remoteInstallation.id),
      accountLogin: remoteInstallation.account.login,
      accountType: remoteInstallation.account.type,
    },
  });
}

export function verifyGithubWebhookSignature(
  body: Buffer,
  signature: string | undefined,
): boolean {
  const secret = process.env.GITHUB_WEBHOOK_SECRET;
  if (!secret || !signature?.startsWith("sha256=")) return false;

  const expected = `sha256=${crypto
    .createHmac("sha256", secret)
    .update(body)
    .digest("hex")}`;
  const expectedBuffer = Buffer.from(expected);
  const signatureBuffer = Buffer.from(signature);

  return (
    expectedBuffer.length === signatureBuffer.length &&
    crypto.timingSafeEqual(expectedBuffer, signatureBuffer)
  );
}

export type { GitHubInstallation, GitHubRepository };
