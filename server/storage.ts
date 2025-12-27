import { type User, type InsertUser, type RentalApplication, type InsertRentalApplication } from "@shared/schema";
import { randomUUID } from "crypto";
import { pool } from "./db";
import { format, addDays, differenceInDays } from 'date-fns';

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createRentalApplication(application: InsertRentalApplication): Promise<RentalApplication>;
  getRentalApplications(): Promise<RentalApplication[]>;
  getRentalApplication(id: string): Promise<RentalApplication | undefined>;
  // New methods for reserved dates
  getReservedDates(startDate: Date, endDate: Date): Promise<Date[]>;
  addReservedDate(date: Date, rentalApplicationId: string): Promise<void>;
  removeReservedDate(date: Date): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private rentalApplications: Map<string, RentalApplication>;
  // In-memory storage for reserved dates (for demonstration, ideally use DB)
  private reservedDates: Map<string, { rentalApplicationId: string }>; // Key is date string YYYY-MM-DD

  constructor() {
    this.users = new Map();
    this.rentalApplications = new Map();
    this.reservedDates = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createRentalApplication(insertApplication: InsertRentalApplication): Promise<RentalApplication> {
    const id = randomUUID();
    const application: RentalApplication = { 
      id,
      name: insertApplication.name,
      phone: insertApplication.phone,
      email: insertApplication.email ?? null,
      startDate: insertApplication.startDate,
      endDate: insertApplication.endDate,
      rentalPeriod: insertApplication.rentalPeriod,
      additionalRequests: insertApplication.additionalRequests ?? null,
    };
    this.rentalApplications.set(id, application);

    // Add reserved dates to in-memory storage
    let currentDate = new Date(application.startDate);
    const endDate = new Date(application.endDate);
    while (currentDate <= endDate) {
      this.addReservedDate(currentDate, id); // Use the in-memory addReservedDate
      currentDate = addDays(currentDate, 1);
    }

    return application;
  }

  async getRentalApplications(): Promise<RentalApplication[]> {
    return Array.from(this.rentalApplications.values());
  }

  async getRentalApplication(id: string): Promise<RentalApplication | undefined> {
    return this.rentalApplications.get(id);
  }

  // --- Reserved Dates Management ---

  async getReservedDates(startDate: Date, endDate: Date): Promise<Date[]> {
    const reserved: Date[] = [];
    let currentDate = new Date(startDate);
    const end = new Date(endDate);

    while (currentDate <= end) {
      const dateString = format(currentDate, 'yyyy-MM-dd');
      if (this.reservedDates.has(dateString)) {
        reserved.push(new Date(currentDate));
      }
      currentDate = addDays(currentDate, 1);
    }
    return reserved;
  }

  async addReservedDate(date: Date, rentalApplicationId: string): Promise<void> {
    const dateString = format(date, 'yyyy-MM-dd');
    // In a real application, you'd insert into the 'reserved_dates' table
    // For MemStorage, we simulate it here.
    if (!this.reservedDates.has(dateString)) {
      this.reservedDates.set(dateString, { rentalApplicationId });
    } else {
      // Handle potential conflicts if needed, e.g., throw an error or update
      console.warn(`Date ${dateString} is already reserved.`);
    }
  }

  async removeReservedDate(date: Date): Promise<void> {
    const dateString = format(date, 'yyyy-MM-dd');
    // In a real application, you'd delete from the 'reserved_dates' table
    this.reservedDates.delete(dateString);
  }

  async isDateRangeAvailable(startDate: string, endDate: string): Promise<boolean> {
    const start = new Date(startDate);
    const end = new Date(endDate);
    let currentDate = new Date(start);
    
    while (currentDate <= end) {
      const dateString = format(currentDate, 'yyyy-MM-dd');
      if (this.reservedDates.has(dateString)) {
        return false;
      }
      currentDate = addDays(currentDate, 1);
    }
    return true;
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

export const storage = new MemStorage();