import { Kafka } from "kafkajs";

let kafkaInstance: Kafka | null = null;

export default function getKafka(): Kafka{

    if(kafkaInstance) return kafkaInstance;

    const KAFKA_ACCESS_KEY = process.env.KAFKA_ACCESS_KEY
    const KAFKA_CA_CERT = process.env.KAFKA_CA_CERT
    const KAFKA_ACCESS_CERT = process.env.KAFKA_ACCESS_CERT
    const KAFKA_BROKER = process.env.KAFKA_BROKER

    if(!KAFKA_ACCESS_CERT) throw new Error("Kafka access cert not provided")
    if(!KAFKA_CA_CERT) throw new Error("Kafka ca cert not provided")
    if(!KAFKA_ACCESS_KEY) throw new Error("Kafka access key not provided")
    if(!KAFKA_BROKER) throw new Error("Kafka access key not provided")

    kafkaInstance = new Kafka({
        brokers: KAFKA_BROKER.split(','),
        connectionTimeout: 30000,
        requestTimeout: 30000,
        retry: {
            initialRetryTime: 300,
            retries: 30
        },
        ...(process.env.KAFKA_SSL == "true" &&{
            ssl: {
                ca: [Buffer.from(KAFKA_CA_CERT, "base64").toString()],
                cert: Buffer.from(KAFKA_ACCESS_CERT, "base64").toString(),
                key: Buffer.from(KAFKA_ACCESS_KEY, "base64").toString()
            }
        })
    })
    return kafkaInstance
}
