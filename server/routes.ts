import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertRentalApplicationSchema } from "@shared/schema";
import { sendApplicationNotification } from "./email";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.post("/api/rental-applications", async (req, res) => {
    try {
      const parsed = insertRentalApplicationSchema.safeParse(req.body);
      
      if (!parsed.success) {
        return res.status(400).json({ 
          error: "Invalid request data",
          details: parsed.error.issues 
        });
      }

      const application = await storage.createRentalApplication(parsed.data);
      
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
