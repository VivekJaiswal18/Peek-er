import "dotenv/config"
import express, {Request, Response} from "express";
import cors from "cors"
import bcrypt from "bcrypt"
import {generateAccessToken, generateRefreshToken} from "./utils/tokens"
import cookieParser from "cookie-parser";
import {authenticate} from "./middlewares/auth.middleware"
import {ingestProducer, reviewProducer, RepoIngestRequestPayload, PrReviewRequestPayload} from "@repo/kafka"
import {prisma} from "@repo/db"
import {v4} from "uuid"

const app = express()
app.use(cookieParser())
app.use(cors())
app.use(express.json());

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        email: string;
      };
    }
  }
}

app.post("/signup", async (req: Request, res: Response)=>{
    try{
    const {username, email, password} = req.body
    
    const existingUser = await prisma.user.findUnique({
      where:{
        email
      }
    }
    )

    if(existingUser){
        return res.status(409).json("User already exists")
    }

    const passwordHash = await bcrypt.hash(password, 10)
    
    const refreshToken = await generateRefreshToken(username, email)
    
    const user = await prisma.user.create({
      data:{
        username,
        email,
        password: passwordHash,
        refreshToken
      }
    })
    
    res.cookie("refreshToken", refreshToken, {httpOnly: true, secure: false, sameSite: "lax", maxAge: 10 * 24 * 60 * 60 * 1000})
    const accesshToken = await generateAccessToken(user.id, email)
    
    return res.status(200).json({
        message: "User successfully signed in",
        accesshToken: accesshToken
    })
    }
    catch(error){
      console.log(error)
        res.status(500).json({message: "Signup failed"})
    }
}
)

// app.post("signin", authenticate, async(req, res)=>{
// })

// app.post("/ingest-repo", (req, res)=>{
//     ingestProducer()
// })

app.post("/github/webhook", authenticate, async (req, res) => {
  const event = req.headers["x-github-event"];
  const deliveryId = String(req.headers["x-github-delivery"] ?? v4());
  const body = req.body;

  if (event === "installation" && body.action === "created") {
    const installationId = String(body.installation.id);

    const installation = await prisma.gitInstallation.upsert({
  where: {
    installationId: String(body.installation.id),
  },
  update: {
    accountLogin: body.installation.account.login,
    accountType: body.installation.account.type,
  },
  create: {
    provider: "github",
    installationId: String(body.installation.id),
    accountLogin: body.installation.account.login,
    accountType: body.installation.account.type,
  },
});



    for (const githubRepo of body.repositories ?? []) {
      const [owner, repoName]: string = githubRepo.full_name.split("/");

      const repo = await prisma.repository.upsert({
        where: {
          provider_owner_name: {
            provider: "github",
            owner,
            name: repoName,
          },
        },
        update: {
          providerRepoId: String(githubRepo.id),
          repoUrl: githubRepo.html_url,
          defaultBranch: githubRepo.default_branch ?? "main",
          // isPrivate: githubRepo.private ?? false,
        },
        create: {
          provider: "github",
          gitInstallationId: installation.id,
          providerRepoId: String(githubRepo.id),
          owner,
          name: repoName,
          repoUrl: String(githubRepo.html_url),
          defaultBranch: String(githubRepo.default_branch) ?? "main",
          // isPrivate: githubRepo.private ?? false,
          userId: req.user!.id, // replace with your actual connected user/org owner
        },
      });

      // await ingestProducer({
      //   eventId: deliveryId,
      //   schemaVersion: 1,
      //   repositoryId: repo.id,
      //   installationId,
      //   provider: "github",
      //   owner,
      //   repo: repoName,
      //   fullName: githubRepo.full_name,
      //   defaultBranch: githubRepo.default_branch ?? "main",
      //   cloneUrl: githubRepo.clone_url ?? `https://github.com/${githubRepo.full_name}.git`,
      //   ingestMode: "initial",
      //   requestedBy: "installation",
      //   requestedAt: new Date().toISOString(),
      // });
    }

    return res.status(202).json({ message: "Repo ingest jobs queued" });
  }

  return res.status(200).json({ message: "Ignored event" });
});

app.post("/review-run", authenticate, async(req, res)=>{

  // const payload: PrReviewRequestPayload = {
  //   eventId: string;
  //   schemaVersion: 1;
  //   repositoryId: number;
  //   pullRequestId: number;
  //   reviewRunId: number;
  //   installationId: string;
  //   owner: string;
  //   repo: string;
  //   pullNumber: number;
  //   baseSha: string;
  //   headSha: string;
  //   requestedAt:
  // }
  // reviewProducer(payload)
})


app.listen(8080)