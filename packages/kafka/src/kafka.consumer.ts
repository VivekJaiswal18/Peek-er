import {Consumer} from "kafkajs"
import getKafka from "./client"

const consumerInstance = new Map<string, Consumer>();

const getInstance = async (groupId: string): Promise<Consumer> =>{
    if(consumerInstance.has(groupId)) return consumerInstance.get(groupId)!

    const consumer = getKafka().consumer({groupId})
    await consumer.connect()
    consumerInstance.set(groupId, consumer)
    return consumer;
}

export const repoIngestConsumer = async(onIngest: ()=> void) => {
    
} 
export const prReviewConsumer = async(onIngest: ()=> void) => {

} 
export const prCommentConsumer = async(onIngest: ()=> void) => {

}