import "dotenv/config"
import express, {Request, Response} from "express";
import cors from "cors"
import bcrypt from "bcrypt"
import {generateAccessToken, generateRefreshToken} from "./utils/tokens"
import cookieParser from "cookie-parser";
import { z } from "zod";
import { prisma } from "@repo/db";
import { authenticate } from "./middlewares/auth.middleware";
import {
  connectGithubInstallation,
  recordGithubInstallation,
  verifyGithubWebhookSignature,
  type GitHubInstallation,
} from "./services/github.service";

const app = express();
const webOrigin = process.env.WEB_APP_URL ?? "http://localhost:3000";
const isProduction = process.env.NODE_ENV === "production";

app.use(cookieParser());
app.use(
  cors({
    origin: webOrigin,
    credentials: true,
  }),
);
app.use(
  express.json(
    // {
    // verify: (request, _response, buffer) => {
    //   (request as Request).rawBody = Buffer.from(buffer);
    // },
  // }
),
);

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        email: string;
      };
      rawBody?: Buffer;
    }
  }
}

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const signupSchema = credentialsSchema.extend({
  username: z.string().trim().min(2).max(80),
});

const installationSchema = z.object({
  installationId: z.string().regex(/^\d+$/),
  setupAction: z.string().max(80).nullish(),
});

function authCookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax" as const,
    domain: process.env.COOKIE_DOMAIN || undefined,
    path: "/",
    maxAge,
  };
}

async function setAuthCookies(
  response: Response,
  user: { id: number; username: string; email: string },
) {
  const accessToken = await generateAccessToken(user.id, user.email);
  const refreshToken = await generateRefreshToken(user.username, user.email);

  response.cookie(
    "accessToken",
    accessToken,
    authCookieOptions(6 * 60 * 60 * 1000),
  );
  response.cookie(
    "refreshToken",
    refreshToken,
    authCookieOptions(10 * 24 * 60 * 60 * 1000),
  );

  await prisma.user.update({
    where: { id: user.id },
    data: { refreshToken },
  });

  return accessToken;
}

app.get("/health", (_request, response) => {
  response.status(200).json({ status: "ok" });
});

app.post("/signup", async (request: Request, response: Response) => {
  const parsed = signupSchema.safeParse(request.body);
  if (!parsed.success) {
    return response.status(400).json({
      message:
        "Enter a valid name, email, and password of at least 8 characters",
    });
  }

  try {
    const { username, email, password } = parsed.data;
    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      return response.status(409).json({ message: "User already exists" });
    }

    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: await bcrypt.hash(password, 10),
      },
    });
    const accessToken = await setAuthCookies(response, user);

    return response.status(201).json({
      message: "User created successfully",
      accessToken,
      user: { id: user.id, username: user.username, email: user.email },
    });
  } catch (error) {
    console.error("Signup error", error);
    return response.status(500).json({ message: "Signup failed" });
  }
});

app.post("/login", async (request: Request, response: Response) => {
  const parsed = credentialsSchema.safeParse(request.body);
  if (!parsed.success) {
    return response
      .status(400)
      .json({ message: "Enter a valid email and password" });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: parsed.data.email },
    });
    if (!user || !(await bcrypt.compare(parsed.data.password, user.password))) {
      return response
        .status(401)
        .json({ message: "Invalid email or password" });
    }

    await setAuthCookies(response, user);
    return response.status(200).json({
      message: "Logged in successfully",
      user: { id: user.id, username: user.username, email: user.email },
    });
  } catch (error) {
    console.error("Login error", error);
    return response.status(500).json({ message: "Login failed" });
  }
});

app.post("/logout", (_request: Request, response: Response) => {
  const options = authCookieOptions(0);
  response.clearCookie("accessToken", options);
  response.clearCookie("refreshToken", options);
  return response.status(200).json({ message: "Logged out" });
});

// app.get("/me", authenticate, async (request: Request, response: Response) => {
//   const user = await prisma.user.findUnique({
//     where: { id: request.user!.id },
//     select: { id: true, username: true, email: true },
//   });
//   if (!user) return response.status(404).json({ message: "User not found" });
//   return response.status(200).json({ user });
// });

app.post(
  "/github/installations",
  authenticate,
  async (request: Request, response: Response) => {
    const parsed = installationSchema.safeParse(request.body);
    if (!parsed.success) {
      return response
        .status(400)
        .json({ message: "Invalid GitHub installation ID" });
    }

    try {
      const result = await connectGithubInstallation(
        request.user!.id,
        parsed.data.installationId,
      );

      return response.status(200).json({
        message: "GitHub installation connected successfully",
        setupAction: parsed.data.setupAction ?? null,
        installation: {
          id: result.installation.id,
          installationId: result.installation.installationId,
          accountLogin: result.installation.accountLogin,
          accountType: result.installation.accountType,
        },
        repositoryCount: result.repositories.length,
      });
    } catch (error) {
      console.error("Connect GitHub installation error", error);
      return response.status(502).json({
        message:
          error instanceof Error
            ? error.message
            : "Could not connect GitHub installation",
      });
    }
  },
);

app.get(
  "/github/installations",
  authenticate,
  async (request: Request, response: Response) => {
    const installations = await prisma.gitInstallation.findMany({
      where: { userId: request.user!.id },
      select: {
        id: true,
        installationId: true,
        accountLogin: true,
        accountType: true,
        createdAt: true,
        updatedAt: true,
        _count: { select: { repository: true } },
      },
    });
    return response.status(200).json({ installations });
  },
);

app.get(
  "/github/repositories",
  authenticate,
  async (request: Request, response: Response) => {
    const repositories = await prisma.repository.findMany({
      where: { userId: request.user!.id, provider: "github" },
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        owner: true,
        name: true,
        repoUrl: true,
        defaultBranch: true,
        createdAt: true,
        updatedAt: true,
        gitInstallation: {
          select: { accountLogin: true, accountType: true },
        },
        _count: { select: { pullRequests: true } },
      },
    });
    return response.status(200).json({ repositories });
  },
);

app.post("/github/webhook", async (request: Request, response: Response) => {
  const signatureHeader = request.headers["x-hub-signature-256"];
  const signature = Array.isArray(signatureHeader)
    ? signatureHeader[0]
    : signatureHeader;

  if (
    !request.rawBody ||
    !verifyGithubWebhookSignature(request.rawBody, signature)
  ) {
    return response
      .status(401)
      .json({ message: "Invalid GitHub webhook signature" });
  }

  const eventHeader = request.headers["x-github-event"];
  const event = Array.isArray(eventHeader) ? eventHeader[0] : eventHeader;
  const body = request.body as {
    action?: string;
    installation?: GitHubInstallation;
  };

  try {
    if (event === "ping") {
      return response.status(200).json({ message: "pong" });
    }

    if (event === "installation" && body.installation) {
      if (body.action === "deleted") {
        await prisma.gitInstallation.updateMany({
          where: { installationId: String(body.installation.id) },
          data: { userId: null },
        });
        return response
          .status(200)
          .json({ message: "Installation disconnected" });
      }

      await recordGithubInstallation(body.installation);
      return response.status(202).json({ message: "Installation recorded" });
    }

    if (event === "installation_repositories" && body.installation) {
      const installation = await prisma.gitInstallation.findUnique({
        where: { installationId: String(body.installation.id) },
      });
      if (installation?.userId) {
        await connectGithubInstallation(
          installation.userId,
          installation.installationId,
        );
      }
      return response
        .status(202)
        .json({ message: "Repository access synchronized" });
    }

    return response.status(200).json({ message: "Event ignored" });
  } catch (error) {
    console.error("GitHub webhook error", error);
    return response
      .status(500)
      .json({ message: "GitHub webhook processing failed" });
  }
});

app.post(
  "/review-run",
  authenticate,
  (_request: Request, response: Response) => {
    return response
      .status(501)
      .json({ message: "Review job publishing is not implemented" });
  },
);

// const port = Number(process.env.PORT ?? 8080);
// app.listen(port, () => {
//   console.log(`Peek-er API listening on port ${port}`);
// });
