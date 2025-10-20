import { and, eq, gt } from 'drizzle-orm'
import { db } from '../config/database'
import { type Guest, type GuestStatus, guests, type NewGuest } from '../db'

export const guestService = {
  /**
   * Create a new guest entry
   */
  async create(data: NewGuest): Promise<Guest> {
    const [guest] = await db.insert(guests).values(data).returning()
    return guest
  },

  /**
   * Find guest by ID
   */
  async findById(id: string): Promise<Guest | undefined> {
    const [guest] = await db
      .select()
      .from(guests)
      .where(eq(guests.id, id))
      .limit(1)
    return guest
  },

  /**
   * Find pending guest by license plate
   */
  async findPendingByPlate(
    licensePlate: string,
    orgId: string
  ): Promise<Guest | undefined> {
    const now = new Date()
    const [guest] = await db
      .select()
      .from(guests)
      .where(
        and(
          eq(guests.licensePlate, licensePlate),
          eq(guests.orgId, orgId),
          eq(guests.status, 'PendingConfirmation'),
          gt(guests.expiresAt, now)
        )
      )
      .limit(1)
    return guest
  },

  /**
   * Find confirmed guest by license plate
   */
  async findConfirmedByPlate(
    licensePlate: string,
    orgId: string
  ): Promise<Guest | undefined> {
    const now = new Date()
    const [guest] = await db
      .select()
      .from(guests)
      .where(
        and(
          eq(guests.licensePlate, licensePlate),
          eq(guests.orgId, orgId),
          eq(guests.status, 'Confirmed'),
          gt(guests.expiresAt, now)
        )
      )
      .limit(1)
    return guest
  },

  /**
   * Update guest
   */
  async update(
    id: string,
    data: Partial<NewGuest>
  ): Promise<Guest | undefined> {
    const [updated] = await db
      .update(guests)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(guests.id, id))
      .returning()
    return updated
  },

  /**
   * Confirm guest (update status and extend expiry)
   */
  async confirm(id: string, expiresAt: Date): Promise<Guest | undefined> {
    const [confirmed] = await db
      .update(guests)
      .set({
        status: 'Confirmed',
        confirmedAt: new Date(),
        expiresAt,
        updatedAt: new Date()
      })
      .where(eq(guests.id, id))
      .returning()
    return confirmed
  },

  /**
   * Expire guest
   */
  async expire(id: string): Promise<Guest | undefined> {
    const [expired] = await db
      .update(guests)
      .set({
        status: 'Expired',
        updatedAt: new Date()
      })
      .where(eq(guests.id, id))
      .returning()
    return expired
  },

  /**
   * Delete guest
   */
  async delete(id: string): Promise<boolean> {
    const [deleted] = await db
      .delete(guests)
      .where(eq(guests.id, id))
      .returning()
    return !!deleted
  }
}
