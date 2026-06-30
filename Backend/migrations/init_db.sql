-- ============================================================
-- FloodSense AI — Database Schema
-- Run this against your Clever Cloud MySQL instance
-- ============================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ─── flood_zones ────────────────────────────────────────────
DROP TABLE IF EXISTS flood_zones;
CREATE TABLE flood_zones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    area_name VARCHAR(200) NOT NULL,
    locality VARCHAR(200),
    lat FLOAT NOT NULL,
    lon FLOAT NOT NULL,
    radius_km FLOAT DEFAULT 0.5,
    base_risk_score FLOAT DEFAULT 50.0,
    risk_level ENUM('Low','Medium','High') NOT NULL DEFAULT 'Medium',
    drainage_quality VARCHAR(20) DEFAULT 'poor',
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_area_name (area_name),
    INDEX idx_lat_lon (lat, lon)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─── bus_routes ─────────────────────────────────────────────
DROP TABLE IF EXISTS bus_routes;
CREATE TABLE bus_routes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    route_number VARCHAR(20) NOT NULL,
    route_name VARCHAR(300) NOT NULL,
    origin_stop VARCHAR(200) NOT NULL,
    dest_stop VARCHAR(200) NOT NULL,
    origin_lat FLOAT NOT NULL,
    origin_lon FLOAT NOT NULL,
    dest_lat FLOAT NOT NULL,
    dest_lon FLOAT NOT NULL,
    base_fare_inr FLOAT NOT NULL DEFAULT 5.0,
    per_km_fare_inr FLOAT DEFAULT 1.5,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_route_number (route_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─── fare_config ────────────────────────────────────────────
DROP TABLE IF EXISTS fare_config;
CREATE TABLE fare_config (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cab_type VARCHAR(50) NOT NULL,
    base_fare_inr FLOAT NOT NULL,
    per_km_inr FLOAT NOT NULL,
    per_min_inr FLOAT NOT NULL,
    surge_low_multiplier FLOAT DEFAULT 1.0,
    surge_medium_multiplier FLOAT DEFAULT 1.3,
    surge_high_multiplier FLOAT DEFAULT 1.8,
    min_fare_inr FLOAT DEFAULT 30.0,
    is_active BOOLEAN DEFAULT TRUE,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─── route_audit_logs ───────────────────────────────────────
DROP TABLE IF EXISTS route_audit_logs;
CREATE TABLE route_audit_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    origin_name VARCHAR(200) NOT NULL,
    dest_name VARCHAR(200) NOT NULL,
    origin_lat FLOAT,
    origin_lon FLOAT,
    dest_lat FLOAT,
    dest_lon FLOAT,
    distance_km FLOAT,
    duration_min FLOAT,
    flood_risk_level VARCHAR(20),
    weather_description VARCHAR(100),
    rain_mm FLOAT DEFAULT 0.0,
    cab_fare_min FLOAT,
    cab_fare_max FLOAT,
    bus_fare FLOAT NULL,
    requested_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_requested_at (requested_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- SEED DATA — Bengaluru known flood-prone areas (real locations)
-- ============================================================
INSERT INTO flood_zones (area_name, locality, lat, lon, radius_km, base_risk_score, risk_level, drainage_quality) VALUES
('Silk Board Junction', 'BTM Layout', 12.9172, 77.6228, 0.8, 75, 'High', 'poor'),
('Bellandur Lake Area', 'Bellandur', 12.9258, 77.6649, 1.2, 80, 'High', 'poor'),
('Marathahalli Bridge', 'Marathahalli', 12.9569, 77.7011, 0.7, 65, 'High', 'poor'),
('KR Puram Underpass', 'K R Puram', 13.0088,