import getKafka from "./client"
import {Producer} from "kafkajs"
import {TOPICS} from "./topics"

let producerInstance: Producer | null = null;

type RepoIngestRequestPayload = {
  eventId: string;
  schemaVersion: 1;
  repositoryId: number;
  installationId: string;
  provider: "github";
  providerRepoId: number;
  owner: string;
  repo: string;
  fullName: string;
  defaultBranch: string;
  cloneUrl: string;
  ingestMode: "initial" | "incremental" | "reindex";
  requestedBy: "installation" | "manual" | "webhook";
  requestedAt: string;
}

type PrReviewRequestPayload = {
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

type PrCommentRequestPayload = {
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

const getProducerInstance = async() =>{
    if (producerInstance) return producerInstance;

    producerInstance = getKafka().producer()
    await producerInstance?.connect()
    return producerInstance;
}

export const ingestProducer = async(payload: RepoIngestRequestPayload) => {
    const producer = await getProducerInstance()
    await producer.send({
        topic: TOPICS.INGEST_JOB,
        messages:[{
            key: String(payload.repositoryId),
            value: JSON.stringify(payload)
        }]
    })
} 
export const reviewProducer = async(payload: PrReviewRequestPayload) => {
    const producer = await getProducerInstance()
    await producer.send({
        topic: "review-job",
        messages:[{
            key: String(payload.repositoryId),
            value: JSON.stringify(payload)
        }]
    })
} 

export const commentProducer = async(payload: PrCommentRequestPayload) => {
    const producer = await getProducerInstance()
    await producer.send({
        topic: "review-summary",
        messages:[{
            key: String(payload.repositoryId),
            value: JSON.stringify(payload)
        }]
    })

}
