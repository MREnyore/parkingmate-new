import { and, eq } from 'drizzle-orm'
import { db } from '../config/database'
import {
  type Customer,
  customers,
  type MembershipStatus,
  type NewCustomer
} from '../db'

export const customerService = {
  /**
   * Create a new customer
   */
  async create(data: NewCustomer): Promise<Customer> {
    const [customer] = await db.insert(customers).values(data).returning()
    return customer
  },

  /**
   * Find customer by ID
   */
  async findById(id: string): Promise<Customer | undefined> {
    const [customer] = await db
      .select()
      .from(customers)
      .where(eq(customers.id, id))
      .limit(1)
    return customer
  },

  /**
   * Find customer by email and organization
   */
  async findByEmail(
    email: string,
    orgId: string
  ): Promise<Customer | undefined> {
    const [customer] = await db
      .select()
      .from(customers)
      .where(and(eq(customers.email, email), eq(customers.orgId, orgId)))
      .limit(1)
    return customer
  },

  /**
   * Find all customers for an organization
   */
  async findByOrg(orgId: string): Promise<Customer[]> {
    return db.select().from(customers).where(eq(customers.orgId, orgId))
  },

  /**
   * Update customer
   */
  async update(
    id: string,
    data: Partial<NewCustomer>
  ): Promise<Customer | undefined> {
    const [updated] = await db
      .update(customers)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(customers.id, id))
      .returning()
    return updated
  },

  /**
   * Mark customer as registered
   */
  async markAsRegistered(id: string): Promise<Customer | undefined> {
    const [updated] = await db
      .update(customers)
      .set({ registered: true, updatedAt: new Date() })
      .where(eq(customers.id, id))
      .returning()
    return updated
  },

  /**
   * Update membership status
   */
  async updateMembership(
    id: string,
    status: MembershipStatus,
    expiryDate?: Date
  ): Promise<Customer | undefined> {
    const [updated] = await db
      .update(customers)
      .set({
        membershipStatus: status,
        membershipExpiryDate: expiryDate,
        updatedAt: new Date()
      })
      .where(eq(customers.id, id))
      .returning()
    return updated
  },

  /**
   * Delete customer (soft delete by setting status)
   */
  async delete(id: string): Promise<boolean> {
    const [deleted] = await db
      .update(customers)
      .set({ status: 'inactive', updatedAt: new Date() })
      .where(eq(customers.id, id))
      .returning()
    return !!deleted
  }
}
