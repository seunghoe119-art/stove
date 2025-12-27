import { pgTable, text, varchar, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id", { length: 36 }).primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const rentalApplications = pgTable("rental_applications", {
  id: varchar("id", { length: 36 }).primaryKey(),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  email: text("email"),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  rentalPeriod: text("rental_period").notNull(),
  additionalRequests: text("additional_requests"),
});

export const insertRentalApplicationSchema = createInsertSchema(rentalApplications).omit({
  id: true,
});

export type InsertRentalApplication = z.infer<typeof insertRentalApplicationSchema>;
export type RentalApplication = typeof rentalApplications.$inferSelect;

export const rentalPeriods = [
  { value: "1night2days", label: "1박 2일 (19,000원)", price: 19000 },
  { value: "2nights3days", label: "2박 3일 (29,000원)", price: 29000 },
  { value: "3nights4days", label: "3박 4일 (39,000원)", price: 39000 },
  { value: "4nightsPlus", label: "4박 5일 이상 (10,000원/1박 추가)", price: null },
] as const;
