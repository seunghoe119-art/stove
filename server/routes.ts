import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertRentalApplicationSchema } from "@shared/schema";
import { sendApplicationNotification } from "./email";
import { format } from 'date-fns';

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.get("/api/reserved-dates", async (req, res) => {
    try {
      const reservedDates = await storage.getReservedDates();
      console.log('Reserved dates being returned:', reservedDates);
      res.json({ reservedDates });
    } catch (error) {
      console.error('Error fetching reserved dates:', error);
      res.status(500).json({ error: 'Failed to fetch reserved dates' });
    }
  });

  app.post("/api/rental-applications", async (req, res) => {
    try {
      const parsed = insertRentalApplicationSchema.safeParse(req.body);

      if (!parsed.success) {
        return res.status(400).json({ 
          error: "Invalid request data",
          details: parsed.error.issues 
        });
      }

      // Check if date range is available
      const isAvailable = await storage.isDateRangeAvailable(
        parsed.data.startDate,
        parsed.data.endDate
      );

      if (!isAvailable) {
        return res.status(409).json({ 
          error: "선택한 날짜에 이미 예약이 있습니다. 다른 날짜를 선택해주세요." 
        });
      }

      const application = await storage.createRentalApplication(parsed.data);

      // Add reserved dates
      await storage.addReservedDates(
        application.id,
        parsed.data.startDate,
        parsed.data.endDate
      );

      // Send email notification (non-blocking)
      sendApplicationNotification(application).catch(err => {
        console.error("Failed to send email notification:", err);
      });

      return res.status(201).json(application);
    } catch (error) {
      console.error("Error creating rental application:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/rental-applications", async (req, res) => {
    try {
      const applications = await storage.getRentalApplications();
      return res.json(applications);
    } catch (error) {
      console.error("Error fetching rental applications:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/rental-applications/:id", async (req, res) => {
    try {
      const application = await storage.getRentalApplication(req.params.id);
      if (!application) {
        return res.status(404).json({ error: "Application not found" });
      }
      return res.json(application);
    } catch (error) {
      console.error("Error fetching rental application:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  return httpServer;
}