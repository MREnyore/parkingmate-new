import { eq } from 'drizzle-orm'
import { db } from '../config/database.js'
import { type NewUser, type User, users } from '../db/index.js'

export const adminUserService = {
  /**
   * Create a new admin user
   */
  async create(data: NewUser): Promise<User> {
    const [user] = await db.insert(users).values(data).returning()
    return user
  },

  /**
   * Find user by ID
   */
  async findById(id: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1)
    return user
  },

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1)
    return user
  },

  /**
   * Update user
   */
  async update(id: string, data: Partial<NewUser>): Promise<User | undefined> {
    const [updated] = await db
      .update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning()
    return updated
  },

  /**
   * Update password
   */
  async updatePassword(
    id: string,
    passwordHash: string
  ): Promise<User | undefined> {
    const [updated] = await db
      .update(users)
      .set({ passwordHash, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning()
    return updated
  },

  /**
   * Update profile picture URL
   */
  async updateProfilePicture(
    id: string,
    profilePictureUrl: string | null
  ): Promise<User | undefined> {
    const [updated] = await db
      .update(users)
      .set({ profilePictureUrl, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning()
    return updated
  },

  /**
   * Delete user (soft delete)
   */
  async delete(id: string): Promise<boolean> {
    const [deleted] = await db
      .update(users)
      .set({ status: 'inactive', updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning()
    return !!deleted
  }
}
