import { type User, type InsertUser, type RentalApplication, type InsertRentalApplication } from "@shared/schema";
import { randomUUID } from "crypto";
import { supabase } from "./supabase";
import { format, addDays } from 'date-fns';

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createRentalApplication(application: InsertRentalApplication): Promise<RentalApplication>;
  getRentalApplications(): Promise<RentalApplication[]>;
  getRentalApplication(id: string): Promise<RentalApplication | undefined>;
  getReservedDates(): Promise<string[]>;
  isDateRangeAvailable(startDate: string, endDate: string): Promise<boolean>;
  addReservedDates(rentalApplicationId: string, startDate: string, endDate: string): Promise<void>;
}

export class SupabaseStorage implements IStorage {
  private users: Map<string, User> = new Map();

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createRentalApplication(insertApplication: InsertRentalApplication): Promise<RentalApplication> {
    if (!supabase) {
      throw new Error('Supabase not configured');
    }

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

    try {
      const { error } = await supabase
        .from('rental_applications')
        .insert({
          id: application.id,
          name: application.name,
          phone: application.phone,
          email: application.email,
          start_date: application.startDate,
          end_date: application.endDate,
          rental_period: application.rentalPeriod,
          additional_requests: application.additionalRequests,
        });

      if (error) {
        console.error('Error creating rental application:', error);
        throw error;
      }

      console.log(`Created rental application ${id} for ${application.name}`);
      return application;
    } catch (error) {
      console.error('Error creating rental application:', error);
      throw error;
    }
  }

  async getRentalApplications(): Promise<RentalApplication[]> {
    return [];
  }

  async getRentalApplication(id: string): Promise<RentalApplication | undefined> {
    return undefined;
  }

  async getReservedDates(): Promise<string[]> {
    if (!supabase) {
      console.warn('Supabase not configured');
      return [];
    }

    try {
      const { data, error } = await supabase
        .from('reserved_dates')
        .select('reserved_date')
        .gte('reserved_date', format(new Date(), 'yyyy-MM-dd'))
        .order('reserved_date', { ascending: true });

      if (error) {
        console.error('Error fetching reserved dates:', error);
        return [];
      }

      return data?.map(row => row.reserved_date) || [];
    } catch (error) {
      console.error('Error fetching reserved dates:', error);
      return [];
    }
  }

  async isDateRangeAvailable(startDate: string, endDate: string): Promise<boolean> {
    if (!supabase) {
      console.warn('Supabase not configured');
      return true;
    }

    try {
      const { data, error } = await supabase
        .from('reserved_dates')
        .select('reserved_date')
        .gte('reserved_date', startDate)
        .lte('reserved_date', endDate);

      if (error) {
        console.error('Error checking date availability:', error);
        return false;
      }

      return !data || data.length === 0;
    } catch (error) {
      console.error('Error checking date availability:', error);
      return false;
    }
  }

  async addReservedDates(rentalApplicationId: string, startDate: string, endDate: string): Promise<void> {
    if (!supabase) {
      console.warn('Supabase not configured');
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const dates: { rental_application_id: string; reserved_date: string }[] = [];
    
    let currentDate = new Date(start);
    while (currentDate <= end) {
      dates.push({
        rental_application_id: rentalApplicationId,
        reserved_date: format(currentDate, 'yyyy-MM-dd'),
      });
      currentDate = addDays(currentDate, 1);
    }

    try {
      const { error } = await supabase
        .from('reserved_dates')
        .insert(dates);

      if (error) {
        console.error('Error adding reserved dates:', error);
        throw error;
      }

      console.log(`Reserved ${dates.length} dates for application ${rentalApplicationId}`);
    } catch (error) {
      console.error('Error adding reserved dates:', error);
      throw error;
    }
  }
}

export const storage = new SupabaseStorage();
