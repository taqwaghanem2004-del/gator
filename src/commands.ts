import { createUser, getUserByName, resetUsers, getUsers, createFeed, getFeedsWithUsers, getFeedByUrl, createFeedFollow, getFeedFollowsForUser, deleteFeedFollow, markFeedFetched, getNextFeedToFetch, createPost, getPostsForUser } from "./lib/db/queries/users.js";
import { setUser, readConfig } from "./config.js";

export class CommandsRegistry {
  commands: { [key: string]: Function } = {};
  register(name: string, callback: Function) {
    this.commands[name] = callback;
  }
  async run(name: string, args: string[]) {
    const handler = this.commands[name];
    if (!handler) {
      console.error(`Error: Command '${name}' not found.`);
      process.exit(1);
    }
    await handler(args);
  }
}

export const registry = new CommandsRegistry();

export function registerCommand(reg: CommandsRegistry, name: string, callback: Function) {
  reg.register(name, callback);
}

export async function runCommand(reg: CommandsRegistry, cmdName: string, args: string[]) {
  await reg.run(cmdName, args);
}

export function middlewareLoggedIn(handler: Function): Function {
  return async function (args: string[], user: any) {
    const config = readConfig();
    const currentUserName = config.currentUserName;
    if (!currentUserName) {
      console.error("Error: No user logged in.");
      process.exit(1);
    }
    const dbUser = await getUserByName(currentUserName);
    if (!dbUser) {
      console.error(`Error: User '${currentUserName}' not found in database.`);
      process.exit(1);
    }
    return handler(args, dbUser);
  };
}

export async function handlerLogin(args: string[]) {
  if (args.length === 0) {
    console.error("Error: Username is required.");
    process.exit(1);
  }
  const name = args[0];
  const user = await getUserByName(name);
  if (!user) {
    console.error(`Error: User '${name}' not found.`);
    process.exit(1);
  }
  setUser(name);
  console.log(`User has been set to '${name}'.`);
}

export async function handlerRegister(args: string[]) {
  if (args.length === 0) {
    console.error("Error: Username is required.");
    process.exit(1);
  }
  const name = args[0];
  const existingUser = await getUserByName(name);
  if (existingUser) {
    console.log(`User '${name}' already exists.`);
    process.exit(1);
  }
  const user = await createUser(name);
  setUser(name);
  console.log("User created successfully:");
  console.log(user);
}

export async function handlerReset(args: string[]) {
  await resetUsers();
  console.log("Database has been reset successfully.");
}

export async function handlerUsers(args: string[]) {
  const users = await getUsers();
  for (const user of users) {
    console.log(`* ${user.name}`);
  }
}

export async function handlerAgg(args: string[]) {
  if (args.length === 0) {
    console.error("Error: Time between requests is required.");
    process.exit(1);
  }
  console.log(`Collecting feeds every ${args[0]}`);
}

export async function handlerAddFeed(args: string[], user: any) {
  if (args.length < 2) {
    console.error("Error: Feed name and URL are required.");
    process.exit(1);
  }
  const name = args[0];
  const url = args[1];
  const feed = await createFeed(name, url, user.id);
  console.log("Feed created successfully:");
  console.log(feed);
  await createFeedFollow(user.id, feed.id);
  console.log(`Feed follow created successfully for user '${user.name}'.`);
}

export async function handlerFeeds(args: string[]) {}
export async function handlerFollow(args: string[], user: any) {}
export async function handlerFollowing(args: string[], user: any) {}
export async function handlerUnfollow(args: string[], user: any) {}
export async function handlerBrowse(args: string[], user: any) {}