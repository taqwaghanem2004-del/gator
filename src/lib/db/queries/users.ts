import { db } from "../index.js";
import { users, feeds, feedFollows, posts, Feed, User, Post, NewPost } from "../../../schema.js";
import { eq, and, desc, sql } from "drizzle-orm";

export async function createUser(name: string) {
  const [result] = await db.insert(users).values({ name: name }).returning();
  return result;
}

export async function getUserByName(name: string) {
  const [result] = await db.select().from(users).where(eq(users.name, name));
  return result;
}

export async function resetUsers() {
  await db.delete(users);
}

export async function getUsers() {
  const result = await db.select().from(users);
  return result;
}

export async function createFeed(name: string, url: string, userId: string): Promise<Feed> {
  const [result] = await db.insert(feeds).values({ name, url, userId }).returning();
  return result;
}

export async function getFeedsWithUsers() {
  const result = await db
    .select({
      feedName: feeds.name,
      feedUrl: feeds.url,
      userName: users.name,
    })
    .from(feeds)
    .innerJoin(users, eq(feeds.userId, users.id));
  return result;
}

export async function getFeedByUrl(url: string) {
  const [result] = await db.select().from(feeds).where(eq(feeds.url, url));
  return result;
}

export async function createFeedFollow(userId: string, feedId: string) {
  const [result] = await db
    .insert(feedFollows)
    .values({ userId, feedId })
    .returning();

  const [insertedFollow] = await db
    .select({
      id: feedFollows.id,
      createdAt: feedFollows.createdAt,
      updated_at: feedFollows.updated_at,
      userId: feedFollows.userId,
      feedId: feedFollows.feedId,
      userName: users.name,
      feedName: feeds.name,
    })
    .from(feedFollows)
    .innerJoin(users, eq(feedFollows.userId, users.id))
    .innerJoin(feeds, eq(feedFollows.feedId, feeds.id))
    .where(eq(feedFollows.id, result.id));

  return insertedFollow;
}

export async function getFeedFollowsForUser(userName: string) {
  const result = await db
    .select({
      id: feedFollows.id,
      userName: users.name,
      feedName: feeds.name,
    })
    .from(feedFollows)
    .innerJoin(users, eq(feedFollows.userId, users.id))
    .innerJoin(feeds, eq(feedFollows.feedId, feeds.id))
    .where(eq(users.name, userName));

  return result;
}

export async function deleteFeedFollow(userId: string, url: string) {
  const feed = await getFeedByUrl(url);
  if (!feed) {
    throw new Error(`Feed with URL '${url}' not found.`);
  }

  await db
    .delete(feedFollows)
    .where(
      and(
        eq(feedFollows.userId, userId),
        eq(feedFollows.feedId, feed.id)
      )
    );
}

export async function markFeedFetched(feedId: string) {
  await db
    .update(feeds)
    .set({
      lastFetchedAt: new Date(),
      updated_at: new Date(),
    })
    .where(eq(feeds.id, feedId));
}

export async function getNextFeedToFetch() {
  const [result] = await db
    .select()
    .from(feeds)
    .orderBy(sql`${feeds.lastFetchedAt} ASC NULLS FIRST`);
  return result;
}

export async function createPost(newPost: NewPost) {
  const [result] = await db
    .insert(posts)
    .values(newPost)
    .onConflictDoNothing()
    .returning();
  return result;
}

export async function getPostsForUser(userName: string, limit: number = 2) {
  const result = await db
    .select({
      id: posts.id,
      title: posts.title,
      url: posts.url,
      description: posts.description,
      publishedAt: posts.publishedAt,
      feedName: feeds.name,
    })
    .from(posts)
    .innerJoin(feeds, eq(posts.feedId, feeds.id))
    .innerJoin(feedFollows, eq(feedFollows.feedId, feeds.id))
    .innerJoin(users, eq(users.id, feedFollows.userId))
    .where(eq(users.name, userName))
    .orderBy(sql`${posts.publishedAt} DESC NULLS LAST`)
    .limit(limit);

  return result;
}
