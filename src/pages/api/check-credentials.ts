import { NextApiRequest, NextApiResponse } from "next";
import clientPromise from '@/lib/mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const client = await clientPromise;
    const db = client.db('enemiesDB');
    const collection = db.collection('users');
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: "Username and password required" });
    }

    const isUsername = await collection.findOne({ username: username });
    const isPassword = await collection.findOne({ password: password });

    if (isUsername || isPassword) {
        return res.status(409).json({ error: "Username or password already taken" });
    }
    return res.status(200).json({ message: "Username and password valid" });
}