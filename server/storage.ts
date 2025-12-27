
import { type User, type InsertUser, type RentalApplication, type InsertRentalApplication } from "@shared/schema";
import { randomUUID } from "crypto";
import { pool } from "./db";
import { format, addDays } from 'date-fns';

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createRentalApplication(application: InsertRentalApplication): Promise<RentalApplication>;
  getRentalApplications(): Promise<RentalApplication[]>;
  getRentalApplication(id: string): Promise<RentalApplication | undefined>;
  getReservedDates(startDate: Date, endDate: Date): Promise<Date[]>;
  addReservedDate(date: Date, rentalApplicationId: string): Promise<void>;
  removeReservedDate(date: Date): Promise<void>;
  isDateRangeAvailable(startDate: string, endDate: string): Promise<boolean>;
  addReservedDates(rentalApplicationId: string, startDate: string, endDate: string): Promise<void>;
}

export class PostgresStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    return result.rows[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    return result.rows[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const result = await pool.query(
      'INSERT INTO users (id, username, password) VALUES ($1, $2, $3) RETURNING *',
      [id, insertUser.username, insertUser.password]
    );
    return result.rows[0];
  }

  async createRentalApplication(insertApplication: InsertRentalApplication): Promise<RentalApplication> {
    const id = randomUUID();
    const result = await pool.query(
      `INSERT INTO rental_applications 
       (id, name, phone, email, start_date, end_date, rental_period, additional_requests) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
       RETURNING *`,
      [
        id,
        insertApplication.name,
        insertApplication.phone,
        insertApplication.email ?? null,
        insertApplication.startDate,
        insertApplication.endDate,
        insertApplication.rentalPeriod,
        insertApplication.additionalRequests ?? null,
      ]
    );

    const application = result.rows[0];
    
    // Convert snake_case to camelCase
    return {
      id: application.id,
      name: application.name,
      phone: application.phone,
      email: application.email,
      startDate: application.start_date,
      endDate: application.end_date,
      rentalPeriod: application.rental_period,
      additionalRequests: application.additional_requests,
    };
  }

  async getRentalApplications(): Promise<RentalApplication[]> {
    const result = await pool.query('SELECT * FROM rental_applications ORDER BY start_date DESC');
    return result.rows.map(row => ({
      id: row.id,
      name: row.name,
      phone: row.phone,
      email: row.email,
      startDate: row.start_date,
      endDate: row.end_date,
      rentalPeriod: row.rental_period,
      additionalRequests: row.additional_requests,
    }));
  }

  async getRentalApplication(id: string): Promise<RentalApplication | undefined> {
    const result = await pool.query('SELECT * FROM rental_applications WHERE id = $1', [id]);
    if (result.rows.length === 0) return undefined;
    
    const row = result.rows[0];
    return {
      id: row.id,
      name: row.name,
      phone: row.phone,
      email: row.email,
      startDate: row.start_date,
      endDate: row.end_date,
      rentalPeriod: row.rental_period,
      additionalRequests: row.additional_requests,
    };
  }

  async getReservedDates(startDate: Date, endDate: Date): Promise<Date[]> {
    const result = await pool.query(
      `SELECT reserved_date FROM reserved_dates 
       WHERE reserved_date >= $1 AND reserved_date <= $2 
       ORDER BY reserved_date`,
      [format(startDate, 'yyyy-MM-dd'), format(endDate, 'yyyy-MM-dd')]
    );
    
    return result.rows.map(row => new Date(row.reserved_date));
  }

  async addReservedDate(date: Date, rentalApplicationId: string): Promise<void> {
    const dateString = format(date, 'yyyy-MM-dd');
    try {
      await pool.query(
        `INSERT INTO reserved_dates (rental_application_id, reserved_date) 
         VALUES ($1, $2) 
         ON CONFLICT (reserved_date) DO NOTHING`,
        [rentalApplicationId, dateString]
      );
      console.log(`Reserved date added: ${dateString} for application ${rentalApplicationId}`);
    } catch (error) {
      console.error(`Error adding reserved date ${dateString}:`, error);
      throw error;
    }
  }

  async removeReservedDate(date: Date): Promise<void> {
    const dateString = format(date, 'yyyy-MM-dd');
    await pool.query('DELETE FROM reserved_dates WHERE reserved_date = $1', [dateString]);
  }

  async isDateRangeAvailable(startDate: string, endDate: string): Promise<boolean> {
    const result = await pool.query(
      `SELECT COUNT(*) as count FROM reserved_dates 
       WHERE reserved_date >= $1 AND reserved_date <= $2`,
      [startDate, endDate]
    );
    
    return parseInt(result.rows[0].count) === 0;
  }

  async addReservedDates(rentalApplicationId: string, startDate: string, endDate: string): Promise<void> {
    const start = new Date(startDate);
    const end = new Date(endDate);
    let currentDate = new Date(start);
    
    while (currentDate <= end) {
      await this.addReservedDate(currentDate, rentalApplicationId);
      currentDate = addDays(currentDate, 1);
    }
  }
}

export const storage = new PostgresStorage();
