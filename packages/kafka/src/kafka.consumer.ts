import {Consumer, EachMessagePayload} from "kafkajs"
import getKafka from "./client"
import {TOPICS} from "./topics"

const consumerInstance = new Map<string, Consumer>();

export type RepoIngestRequestPayload = {
  eventId: string;
  schemaVersion: 1;
  repositoryId: number;
  providerRepoId: number;
  installationId: string;
  provider: "github";
  owner: string;
  repo: string;
  fullName: string;
  defaultBranch: string;
  cloneUrl: string;
  ingestMode: "initial" | "incremental" | "reindex";
  requestedBy: "installation" | "manual" | "webhook";
  requestedAt: string;
}

export type PrReviewRequestPayload = {
  eventId: string;
  schemaVersion: 1;
  repositoryId: number;
  pullRequestId: number;
  reviewRunId: number;
  installationId: string;
  owner: string;
  repo: string;
  pullNumber: number;
  baseSha: string;
  headSha: string;
  requestedAt: string;
};

export type PrCommentRequestPayload = {
  eventId: string;
  schemaVersion: 1;
  repositoryId: number;
  pullRequestId: number;
  reviewRunId: number;
  installationId: string;
  owner: string;
  repo: string;
  pullNumber: number;
  requestedAt: string;
};

const getInstance = async (groupId: string): Promise<Consumer> =>{
    if(consumerInstance.has(groupId)) return consumerInstance.get(groupId)!

    const consumer = getKafka().consumer({groupId})
    await consumer.connect()
    consumerInstance.set(groupId, consumer)
    return consumer;
}

export const ingestConsumer = async(onIngest: (payload: RepoIngestRequestPayload)=> void) => {
// export const ingestConsumer = async(onIngest: (repositoryId: string, installationId: string, cloneUrl: string)=> void) => {
    const consumer = await getInstance("repo-ingest-consumer")
    await consumer.subscribe({topic: TOPICS.INGEST_JOB, fromBeginning: false})
    await consumer.run({
        eachMessage: async({message}: EachMessagePayload) =>{
            const payload = JSON.parse(message.value?.toString() || '{}')
            // const {repositoryId, installationId, cloneUrl} = JSON.parse(message.value?.toString() || '{}')
            if (!payload.repositoryId) return
            onIngest(payload)
            // if (repositoryId) onIngest(repositoryId, installationId, cloneUrl)
        }
    })
} 

export const reviewConsumer = async(onReview: (payload: PrReviewRequestPayload )=> void) => {
    const consumer = await getInstance("pr-review-consumer")
    await consumer.subscribe({topic: TOPICS.REVIEW_SUMMARY, fromBeginning: false})
    consumer.run({
        eachMessage: async ({message}: EachMessagePayload) =>{
        const {payload} = JSON.parse(message.value?.toString() || '{}')
            // const {repositoryId} = JSON.parse(message.value?.toString() || '{}')
            if (payload.repositoryId) onReview(payload)
            // if(repositoryId) onReview(repositoryId)
        }
    })
} 

export const commentConsumer = async(onComment: (payload: PrCommentRequestPayload)=> void) => {
    const consumer = await getInstance("pr-comment-consumer")
    await consumer.subscribe({topic: TOPICS.REVIEW_SUMMARY, fromBeginning: false})
    consumer.run({
        eachMessage: async ({message}: EachMessagePayload) =>{
            const {payload} = JSON.parse(message.value?.toString() || '{}')
            // const {repositoryId} = JSON.parse(message.value?.toString() || '{}')
            // if(repositoryId) onComment(repositoryId)
            if (payload.repositoryId) onComment(payload)
        }
    })
}

// repoReindexProducer
// embeddingProducer
// notificationProducer
// billingUsageProducer