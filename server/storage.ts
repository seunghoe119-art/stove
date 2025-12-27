import { type User, type InsertUser, type RentalApplication, type InsertRentalApplication } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createRentalApplication(application: InsertRentalApplication): Promise<RentalApplication>;
  getRentalApplications(): Promise<RentalApplication[]>;
  getRentalApplication(id: string): Promise<RentalApplication | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private rentalApplications: Map<string, RentalApplication>;

  constructor() {
    this.users = new Map();
    this.rentalApplications = new Map();
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
    return application;
  }

  async getRentalApplications(): Promise<RentalApplication[]> {
    return Array.from(this.rentalApplications.values());
  }

  async getRentalApplication(id: string): Promise<RentalApplication | undefined> {
    return this.rentalApplications.get(id);
  }
}

export const storage = new MemStorage();
