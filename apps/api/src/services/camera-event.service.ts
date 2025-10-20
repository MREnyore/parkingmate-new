import { and, desc, eq } from 'drizzle-orm'
import { db } from '../config/database'
import { type CameraEvent, cameraEvents, type NewCameraEvent } from '../db'

export const cameraEventService = {
  /**
   * Create a new camera event
   */
  async create(data: NewCameraEvent): Promise<CameraEvent> {
    const [event] = await db.insert(cameraEvents).values(data).returning()
    return event
  },

  /**
   * Find camera event by ID
   */
  async findById(id: string): Promise<CameraEvent | undefined> {
    const [event] = await db
      .select()
      .from(cameraEvents)
      .where(eq(cameraEvents.id, id))
      .limit(1)
    return event
  },

  /**
   * Find camera events by license plate
   */
  async findByLicensePlate(
    licensePlate: string,
    orgId: string,
    limit = 10
  ): Promise<CameraEvent[]> {
    return db
      .select()
      .from(cameraEvents)
      .where(
        and(
          eq(cameraEvents.licensePlate, licensePlate),
          eq(cameraEvents.orgId, orgId)
        )
      )
      .orderBy(desc(cameraEvents.timestamp))
      .limit(limit)
  },

  /**
   * Find recent camera event by license plate and direction
   */
  async findRecentByPlateAndDirection(
    licensePlate: string,
    orgId: string,
    direction: 'entry' | 'exit',
    withinMinutes: number
  ): Promise<CameraEvent | undefined> {
    const cutoffTime = new Date(Date.now() - withinMinutes * 60 * 1000)

    const events = await db
      .select()
      .from(cameraEvents)
      .where(
        and(
          eq(cameraEvents.licensePlate, licensePlate),
          eq(cameraEvents.orgId, orgId),
          eq(cameraEvents.direction, direction)
        )
      )
      .orderBy(desc(cameraEvents.timestamp))
      .limit(1)

    const event = events[0]
    if (event && event.timestamp >= cutoffTime) {
      return event
    }

    return undefined
  },

  /**
   * Find all camera events for an organization
   */
  async findByOrg(orgId: string, limit = 100): Promise<CameraEvent[]> {
    return db
      .select()
      .from(cameraEvents)
      .where(eq(cameraEvents.orgId, orgId))
      .orderBy(desc(cameraEvents.timestamp))
      .limit(limit)
  },

  /**
   * Find camera events by camera ID
   */
  async findByCameraId(
    cameraId: string,
    orgId: string,
    limit = 50
  ): Promise<CameraEvent[]> {
    return db
      .select()
      .from(cameraEvents)
      .where(
        and(eq(cameraEvents.cameraId, cameraId), eq(cameraEvents.orgId, orgId))
      )
      .orderBy(desc(cameraEvents.timestamp))
      .limit(limit)
  }
}
