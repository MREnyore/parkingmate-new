import { and, eq, isNull } from 'drizzle-orm'
import { db } from '../config/database'
import {
  type NewParkingSession,
  type ParkingSession,
  parkingSessions
} from '../db'

export const parkingSessionService = {
  /**
   * Create a new parking session
   */
  async create(data: NewParkingSession): Promise<ParkingSession> {
    const [session] = await db.insert(parkingSessions).values(data).returning()
    return session
  },

  /**
   * Find parking session by ID
   */
  async findById(id: string): Promise<ParkingSession | undefined> {
    const [session] = await db
      .select()
      .from(parkingSessions)
      .where(eq(parkingSessions.id, id))
      .limit(1)
    return session
  },

  /**
   * Find active session for a car
   */
  async findActiveByCarId(carId: string): Promise<ParkingSession | undefined> {
    const [session] = await db
      .select()
      .from(parkingSessions)
      .where(
        and(
          eq(parkingSessions.carId, carId),
          eq(parkingSessions.status, 'active'),
          isNull(parkingSessions.exitTime)
        )
      )
      .limit(1)
    return session
  },

  /**
   * Find active session for a customer
   */
  async findActiveByCustomerId(customerId: string): Promise<ParkingSession[]> {
    return db
      .select()
      .from(parkingSessions)
      .where(
        and(
          eq(parkingSessions.customerId, customerId),
          eq(parkingSessions.status, 'active'),
          isNull(parkingSessions.exitTime)
        )
      )
  },

  /**
   * Find all sessions for a customer
   */
  async findByCustomerId(
    customerId: string,
    limit = 50
  ): Promise<ParkingSession[]> {
    return db
      .select()
      .from(parkingSessions)
      .where(eq(parkingSessions.customerId, customerId))
      .limit(limit)
  },

  /**
   * Find all sessions for an organization
   */
  async findByOrg(orgId: string, limit = 100): Promise<ParkingSession[]> {
    return db
      .select()
      .from(parkingSessions)
      .where(eq(parkingSessions.orgId, orgId))
      .limit(limit)
  },

  /**
   * Update parking session
   */
  async update(
    id: string,
    data: Partial<NewParkingSession>
  ): Promise<ParkingSession | undefined> {
    const [updated] = await db
      .update(parkingSessions)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(parkingSessions.id, id))
      .returning()
    return updated
  },

  /**
   * Complete a parking session (set exit time and status)
   */
  async complete(
    id: string,
    exitEventId: string
  ): Promise<ParkingSession | undefined> {
    const [completed] = await db
      .update(parkingSessions)
      .set({
        exitEventId,
        exitTime: new Date(),
        status: 'completed',
        updatedAt: new Date()
      })
      .where(eq(parkingSessions.id, id))
      .returning()
    return completed
  },

  /**
   * Add penalty to a session
   */
  async addPenalty(
    id: string,
    penaltyAmount: string
  ): Promise<ParkingSession | undefined> {
    const [updated] = await db
      .update(parkingSessions)
      .set({
        penaltyAmount,
        status: 'penalized',
        updatedAt: new Date()
      })
      .where(eq(parkingSessions.id, id))
      .returning()
    return updated
  }
}
