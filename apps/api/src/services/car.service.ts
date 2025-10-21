import { and, eq } from 'drizzle-orm'
import { db } from '../config/database.js'
import { type Car, cars, type NewCar } from '../db/index.js'

export const carService = {
  /**
   * Create a new car
   */
  async create(data: NewCar): Promise<Car> {
    const [car] = await db.insert(cars).values(data).returning()
    return car
  },

  /**
   * Find car by ID
   */
  async findById(id: string): Promise<Car | undefined> {
    const [car] = await db.select().from(cars).where(eq(cars.id, id)).limit(1)
    return car
  },

  /**
   * Find car by license plate and organization
   */
  async findByLicensePlate(
    licensePlate: string,
    orgId: string
  ): Promise<Car | undefined> {
    const [car] = await db
      .select()
      .from(cars)
      .where(and(eq(cars.licensePlate, licensePlate), eq(cars.orgId, orgId)))
      .limit(1)
    return car
  },

  /**
   * Find all cars for a customer
   */
  async findByOwner(ownerId: string): Promise<Car[]> {
    return db.select().from(cars).where(eq(cars.ownerId, ownerId))
  },

  /**
   * Find all cars for an organization
   */
  async findByOrg(orgId: string): Promise<Car[]> {
    return db.select().from(cars).where(eq(cars.orgId, orgId))
  },

  /**
   * Update car
   */
  async update(id: string, data: Partial<NewCar>): Promise<Car | undefined> {
    const [updated] = await db
      .update(cars)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(cars.id, id))
      .returning()
    return updated
  },

  /**
   * Delete car
   */
  async delete(id: string): Promise<boolean> {
    const [deleted] = await db.delete(cars).where(eq(cars.id, id)).returning()
    return !!deleted
  },

  /**
   * Check if license plate exists for customer
   */
  async existsForCustomer(
    licensePlate: string,
    ownerId: string,
    excludeCarId?: string
  ): Promise<boolean> {
    const conditions = [
      eq(cars.licensePlate, licensePlate),
      eq(cars.ownerId, ownerId)
    ]

    if (excludeCarId) {
      // When updating, exclude the current car
      const result = await db
        .select()
        .from(cars)
        .where(and(...conditions))
        .limit(1)

      return result.length > 0 && result[0].id !== excludeCarId
    }

    const result = await db
      .select()
      .from(cars)
      .where(and(...conditions))
      .limit(1)

    return result.length > 0
  }
}
