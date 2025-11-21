import { db } from './db';
import { links } from './schema';
import { eq, sql, ilike, or, desc } from 'drizzle-orm';
import { generateCode } from './utils';
import { Link } from './schema'; // Import Link type from schema

export async function createLink(targetUrl: string, customCode?: string): Promise<Link> {
  let code = customCode || generateCode();
  let attempts = 0;
  const maxAttempts = 5;

  while (attempts < maxAttempts) {
    try {
      const existing = await db.select().from(links).where(eq(links.code, code)).limit(1);
      
      if (existing.length > 0) {
        if (customCode) {
          throw new Error('CODE_EXISTS');
        }
        code = generateCode();
        attempts++;
        continue;
      }

      const result = await db.insert(links).values({
        code,
        targetUrl,
        totalClicks: 0,
        lastClickedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }).returning();

      return result[0];
    } catch (error) {
      if (error instanceof Error && error.message === 'CODE_EXISTS') {
        throw error;
      }
      if (!customCode && attempts < maxAttempts - 1) {
        code = generateCode();
        attempts++;
      } else {
        throw error;
      }
    }
  }

  throw new Error('Failed to generate unique code after multiple attempts');
}

export async function getAllLinks(searchTerm?: string): Promise<Link[]> {
  const query = searchTerm
    ? db.select()
        .from(links)
        .where(
          or(
            ilike(links.code, `%${searchTerm}%`),
            ilike(links.targetUrl, `%${searchTerm}%`)
          )
        )
    : db.select().from(links);

  return query.orderBy(desc(links.createdAt));
}

export async function getLinkByCode(code: string): Promise<Link | null> {
  const result = await db.select().from(links).where(eq(links.code, code)).limit(1);
  return result[0] || null;
}

export async function incrementClick(code: string): Promise<Link | null> {
  const result = await db.update(links)
    .set({
      totalClicks: sql`${links.totalClicks} + 1`,
      lastClickedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(links.code, code))
    .returning();
  
  return result[0] || null;
}

export async function deleteLink(code: string): Promise<boolean> {
  const result = await db.delete(links).where(eq(links.code, code)).returning();
  return result.length > 0;
}