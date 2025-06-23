import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import type { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '@/lib/mongodb';
import { error } from 'console';
import { ObjectId } from 'mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session || !session.user?.id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const userId = session.user.id;
    const client = await clientPromise
    const db = client.db('enemiesDB')
    const collection = db.collection('enemies')

    switch (req.method) {
      case 'GET':
        try {
          const enemies = await collection.find({ userId: userId }).toArray();

          const formattedEnemies = enemies.map((enemy) => ({
            id: enemy._id.toString(), // Convert _id to string and rename
            name: enemy.name,
            grudgeLevel: enemy.grudgeLevel,
            description: enemy.description,
            avatar: enemy.avatar,
          }));

          return res.status(200).json(formattedEnemies);
        } catch (err) {
          console.error("Failed to fetch enemies:", err);
          return res.status(500).json({ error: "Failed to fetch enemies" });
        }
      case 'POST': {
        const { name, grudgeLevel, description, avatar } = req.body
        const doc = { name, grudgeLevel, description, avatar, userId };

        // Basic validation example:
        if (!name || !grudgeLevel) {
          return res.status(400).json({ error: 'Missing required fields: name, powerLevel' })
        }

        const result = await collection.insertOne(doc);
        return res.status(201).json({
          id: result.insertedId.toString(),  // Send id as string to frontend
          ...doc,
        });
      }
      case 'DELETE':
        try {
            const { id } = req.query;
            if (!id || typeof id !== 'string') {
                return res.status(400).json({ error: 'Missing or Invalid id' });
            }
            const result = await collection.deleteOne({ _id: new ObjectId(id), userId });

            if (result.deletedCount === 0) {
                return res.status(404).json({ error: 'Enemy not found' });
            }
            res.status(200).json({ message: `Enemy ID ${id} has been successfully deleted` });
        }
        catch (error) {
            res.status(500).json({ error: 'Failed delete enemy' });
        }
        break;
      case 'PUT':
        try {
          const { id } = req.query;

          if (!id || typeof id !== 'string') {
            return res.status(400).json({ error: 'Missing or invalid id' });
          }

          const objectId = new ObjectId(id);
          const updateData = req.body;

          if (!updateData || Object.keys(updateData).length === 0) {
            return res.status(400).json({ error: 'No update data provided' });
          }

          const result = await collection.findOneAndUpdate(
            { _id: objectId, userId },
            { $set: updateData },
            { returnDocument: "after" }
          );

          if (!result) {
            return res.status(404).json(result);
          }

          // Send back the updated document with `id` instead of `_id`
          const updated = {
            id: result._id.toString(),
            name: result.name,
            grudgeLevel: result.grudgeLevel,
            description: result.description,
            avatar: result.avatar,
          };

          return res.status(200).json(updated);
        } catch (error) {
          console.error('PUT error:', error);
          return res.status(500).json({ error: 'Failed to update enemy' });
        }



      default:
        res.setHeader('Allow', ['GET', 'POST', 'DELETE', 'PUT'])
        return res.status(405).end(`Method ${req.method} Not Allowed`)
    }
  } catch (error) {
    console.error('API error:', error)
    return res.status(500).json({ error: 'Internal Server Error' })
  }
}
