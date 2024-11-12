import { petNames } from '../drizzle/schema.js';
import { authenticateUser } from "./_apiUtils.js"
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const user = await authenticateUser(req);

    const { names } = req.body;

    if (!names || !Array.isArray(names)) {
      return res.status(400).json({ error: 'Names are required and should be an array' });
    }
    
    const sql = neon(process.env.NEON_DB_URL);
    const db = drizzle(sql);

    const insertData = names.map(name => ({
      name,
      userId: user.id
    }));

    const result = await db.insert(petNames).values(insertData).returning();

    res.status(201).json(result);
  } catch (error) {
    console.error('Error saving names:', error);
    if (error.message.includes('Authorization') || error.message.includes('token')) {
      res.status(401).json({ error: 'Authentication failed' });
    } else {
      res.status(500).json({ error: 'Error saving names' });
    }
  }
}