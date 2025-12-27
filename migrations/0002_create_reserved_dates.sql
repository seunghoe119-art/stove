
CREATE TABLE IF NOT EXISTS reserved_dates (
  rental_application_id VARCHAR(36) NOT NULL,
  reserved_date DATE NOT NULL,
  PRIMARY KEY (reserved_date),
  FOREIGN KEY (rental_application_id) REFERENCES rental_applications(id) ON DELETE CASCADE
);

CREATE INDEX idx_reserved_dates_date ON reserved_dates(reserved_date);
CREATE INDEX idx_reserved_dates_application ON reserved_dates(rental_application_id);
