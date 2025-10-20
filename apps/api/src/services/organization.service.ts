import { eq } from 'drizzle-orm'
import { db } from '../config/database'
import { type NewOrganization, type Organization, organizations } from '../db'

export const organizationService = {
  /**
   * Create a new organization
   */
  async create(data: NewOrganization): Promise<Organization> {
    const [organization] = await db
      .insert(organizations)
      .values(data)
      .returning()
    return organization
  },

  /**
   * Find organization by ID
   */
  async findById(id: string): Promise<Organization | undefined> {
    const [organization] = await db
      .select()
      .from(organizations)
      .where(eq(organizations.id, id))
      .limit(1)
    return organization
  },

  /**
   * Find all active organizations
   */
  async findAll(): Promise<Organization[]> {
    return db
      .select()
      .from(organizations)
      .where(eq(organizations.status, 'active'))
  },

  /**
   * Update organization
   */
  async update(
    id: string,
    data: Partial<NewOrganization>
  ): Promise<Organization | undefined> {
    const [updated] = await db
      .update(organizations)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(organizations.id, id))
      .returning()
    return updated
  },

  /**
   * Delete organization (soft delete by setting status)
   */
  async delete(id: string): Promise<boolean> {
    const [deleted] = await db
      .update(organizations)
      .set({ status: 'inactive', updatedAt: new Date() })
      .where(eq(organizations.id, id))
      .returning()
    return !!deleted
  }
}
