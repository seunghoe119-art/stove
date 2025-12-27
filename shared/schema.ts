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
  heaterType: text("heater_type").notNull(),
  additionalRequests: text("additional_requests"),
});

export const insertRentalApplicationSchema = createInsertSchema(rentalApplications).omit({
  id: true,
});

export type InsertRentalApplication = z.infer<typeof insertRentalApplicationSchema>;
export type RentalApplication = typeof rentalApplications.$inferSelect;

export const heaterTypes = [
  { value: "basic", label: "기본형 난로 (15,000원/1박2일)", price: 15000 },
  { value: "premium", label: "프리미엄 난로 (25,000원/1박2일)", price: 25000 },
  { value: "large", label: "대형 난로 (35,000원/1박2일)", price: 35000 },
] as const;
