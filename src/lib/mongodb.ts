import { MongoClient } from "mongodb";

if (!process.env.MONGODB_URI) {
    throw new Error("Please ensure a valid MongoDB key");
}

const uri = process.env.MONGODB_URI;

const options = {};

let client: MongoClient;

/* eslint-disable no-var */
declare global {
    var _mongoClientPromise: Promise<MongoClient>;
}
/* eslint-enable no-var */

if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
}

const clientPromise: Promise<MongoClient> = global._mongoClientPromise;

export default clientPromise;
