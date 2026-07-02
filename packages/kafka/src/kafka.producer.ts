import getKafka from "./client"
import {Producer} from "kafkajs"

let producerInstance: Producer | null = null;

const getProducerInstance = async() =>{
    if (producerInstance) return producerInstance;

    producerInstance = getKafka().producer()
    await producerInstance?.connect()
    return producerInstance;
}

export const repoIngestProducer = async(onIngest: (jobId: string, code: string[])=> void) => {
    
} 
export const prReviewProducer = async(onReview: ()=> void) => {

} 
export const prCommentProducer = async(onComment: ()=> void) => {

}
