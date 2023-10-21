import { PrismaClient } from "@prisma/client";
import { createClient } from "redis";

/*
Notes:
  => To run redis: docker run -p 6379:6379 -it redis/redis-stack-server:latest
*/
const REDIS_URL: string = process.env.REDIS_URL || "redis://localhost:6379";
const REDIS_CLIENT_OPTS = {
  url: REDIS_URL,
};

/**
 * Database class for storing the database
 * and cache related functions.
 */
export class Database {
  /**
   * The redis and prisma clients
   */
  private redisClient = createClient(REDIS_CLIENT_OPTS);
  private prismaClient = new PrismaClient();

  /**
   * Constructor for the database class
   */
  constructor() {
    this.connectRedis().then(async () => {
      console.log("Connected to redis!");

      // Load the cache
      await this.loadCache();
    });

    this.connectPrisma().then(() => {
      console.log("Connected to prisma!");
    });
  }

  // Connect to the redis client via async
  private async connectRedis(): Promise<void> {
    await this.redisClient.connect();
  }

  // Connect to the prisma client via async
  private async connectPrisma(): Promise<void> {
    await this.prismaClient.$connect();
  }

  /**
   * Add an user to the redis cache
   * @param discordId The user's discord id
   * @returns Promise<void>
   */
  public async addToCache(discordId: string): Promise<void> {
    this.redisClient.set(discordId, 1);
  }

  /**
   * Get all the users
   * @returns Promise<any[]>
   */
  public async getAllUsers(): Promise<any[]> {
    return await this.prismaClient.user.findMany();
  }

  /**
   * Load the redis cache for the users in the database
   * @returns Promise<void>
   */
  public async loadCache(): Promise<void> {
    const users = await this.getAllUsers();

    for (const user of users) {
      const alreadyExists = await this.userExists(user.discordId);
      if (!alreadyExists) {
        this.addToCache(user.discordId);
      }
    }

    console.log("Loaded the redis cache!");
  }

  /**
   * Check if an user exists. This will be used to verify
   * that the user has already been verified. This checks the
   * cache for the user so that we don't have to query the
   * database every time. (This just sames money and time,
   * especially for serverless functions :D)
   */
  public async userExists(discordId: string): Promise<boolean> {
    const user: string | null = await this.redisClient.get(discordId);
    return user ? true : false;
  }

  /**
   * Create a new user
   * @param discordId The user's discord id
   * @throws Error if failed to create user
   * @returns Promise<void>
   */
  public async createUser(discordId: string): Promise<void> {
    // Create the user
    const res = await this.prismaClient.user.create({
      data: {
        discordId: discordId,
      },
    });

    // If the result was successful, then add the user to the cache
    if (res) {
      this.addToCache(discordId);
      return;
    }

    throw new Error("Failed to create user");
  }

  /**
   * Check if the user already exists then create the user
   * @param discordId The user's discord id
   * @throws Error if failed to create user
   * @returns Promise<void>
   */
  public async createUserIfNotExists(discordId: string): Promise<void> {
    const userExists = await this.userExists(discordId);
    if (!userExists) {
      await this.createUser(discordId);
    }

    throw new Error("Failed to create user");
  }

  /**
   * Delete an user from the database
   * @param discordId The user's discord id
   * @throws Error if failed to delete user
   */
  public async deleteUser(discordId: string): Promise<void> {
    const res = await this.prismaClient.user.delete({
      where: {
        discordId: discordId,
      },
    });

    // Delete the user from the cache
    if (res) {
      this.redisClient.del(discordId);
      return;
    }

    throw new Error("Failed to delete user");
  }

  /**
   * Delete an user if they exist
   * @param discordId The user's discord id
   * @throws Error if failed to delete user
   */
  public async deleteUserIfExists(discordId: string): Promise<void> {
    const userExists = await this.userExists(discordId);
    if (userExists) {
      await this.deleteUser(discordId);
    }

    throw new Error("Failed to delete user");
  }
}

// Database constant
export const DATABASE = new Database();
