import {ingestConsumer, PrReviewRequestPayload} from "@repo/kafka"
import {prisma} from "@repo/db"
import jwt from "jsonwebtoken"
import {RunTaskCommand, ECSClient} from "@aws-sdk/client-ecs"
import { escapeLeadingUnderscores } from "typescript"

const ecs = new ECSClient({
    region: process.env.REGION
})

// const ecs = new ECSClient({
//     region: process.env.REGION
// })

const ingestWorker = ingestConsumer(async(payload)=>{

    const {
        repositoryId,
        installationId,
        // cloneUrl,
        owner,
        repo,
        defaultBranch,
        provider
    } = payload

    const repository = await prisma.repository.findUnique({
        where: {
            id: payload.repositoryId
        }
    })
    
    if(!repository) throw new Error("No repository found")
        
        const token = await createInstallationAccessToken(
            payload.installationId,
            Number(payload.providerRepoId)
        )
        const repoCloneUrl = `https://x-access-token:${token}@github.com/${payload.fullName}.git`;
        
    try{
    const response = await ecs.send(
        new RunTaskCommand({
            cluster: process.env.CLUSTER,
            taskDefinition: process.env.TASK_DEFINITION,
            launchType: "FARGATE",
            networkConfiguration: {
                awsvpcConfiguration: {
                    subnets: process.env.SUBNET!.split(","),
                    securityGroups: process.env.SECURITY_GROUPS!.split(","),
                    assignPublicIp: "ENABLED",
                }
            },
            overrides: {
                containerOverrides: [{
                    name: process.env.TASK_WORKER_CONTAINER,
                    environment: [
                        {
                            name: "accessToken",
                            value: token
                        },
                        {
                            name: "repoCloneUrl",
                            value: repoCloneUrl
                        },
                    ]
                }]
            }
        })
    )

    if(response.failures?.length){
        console.log("Error spawning isolated task", response.failures)
    }
    else{
        console.log(response.$metadata)
    }
    
 }
 catch(error){
    console.log(error)
 }
})

function getGithubPrivateKey(){
    return Buffer.from(process.env.GITHUB_PRIVATE_KEY!, "base64").toString("utf-8")
}

function createGithubAppJwt() {
  const now = Math.floor(Date.now() / 1000);

  return jwt.sign(
    {
      iat: now - 60,
      exp: now + 10 * 60,
      iss: process.env.GITHUB_APP_ID!,
    },
    getGithubPrivateKey(),
    {
      algorithm: "RS256",
    },
  );
}

async function createInstallationAccessToken(installationId: string, repositoryId?: number){

    const appJwt = createGithubAppJwt()

    const body = repositoryId ?
        {
            repositoryId: [repositoryId],
            permissions: {
                contents: "read",
                metadata: "read",
                pull_requests: "write"
            }
        } 
        : undefined;

    try{
    const response = await fetch("https://api.github.com/app/installations/${installationId}/access_tokens", 
        {
        method: "POST",
        headers: {
                "Authorization": "Bearer ${appJwt}",
                "Accept": "application/vnd.github+json"
            },
        body: body? JSON.stringify(body): undefined
        }
    )
    const data = await response.json()
    return data.token
}
catch(error){
    throw new Error("Error getting the access token")
}
}