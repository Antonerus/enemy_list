// pages/api/auth/signup.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import clientPromise from '@/lib/mongodb'
import bcrypt from 'bcrypt'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).end('Method Not Allowed')
  }

  const { username, password } = req.body

  if (!username || !password) {
    return res.status(400).json({ error: 'Missing username or password' })
  }

  const client = await clientPromise
  const db = client.db('enemiesDB')
  const users = db.collection('users')

  const existingUser = await users.findOne({ username })
  if (existingUser) {
    return res.status(400).json({ error: 'Username already exists' })
  }

  const hashedPassword = await bcrypt.hash(password, 10)

  const result = await users.insertOne({
    username,
    password: hashedPassword,
  })

  res.status(201).json({ message: 'User created', userId: result.insertedId })
}
