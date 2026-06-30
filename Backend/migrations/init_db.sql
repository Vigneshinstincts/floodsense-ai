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
('KR Puram Underpass', 'K R Puram', 13.0088, 77.6964, 0.6, 70, 'High', 'poor'),
('Yelahanka Lake Bed', 'Yelahanka', 13.1007, 77.5963, 1.0, 60, 'Medium', 'moderate'),
('Hebbal Flyover', 'Hebbal', 13.0358, 77.5970, 0.5, 55, 'Medium', 'moderate'),
('Koramangala Sewage Drain', 'Koramangala', 12.9352, 77.6245, 0.6, 58, 'Medium', 'moderate'),
('Mahadevapura', 'Mahadevapura', 12.9908, 77.6960, 0.7, 62, 'Medium', 'poor'),
('Rajajinagar Underpass', 'Rajajinagar', 12.9911, 77.5554, 0.5, 50, 'Medium', 'moderate'),
('Indiranagar 100ft Road', 'Indiranagar', 12.9719, 77.6412, 0.4, 35, 'Low', 'good'),
('Jayanagar 4th Block', 'Jayanagar', 12.9254, 77.5832, 0.4, 30, 'Low', 'good'),
('Whitefield Main Road', 'Whitefield', 12.9698, 77.7500, 0.5, 45, 'Medium', 'moderate'),
('Electronic City Underpass', 'Electronic City', 12.8452, 77.6602, 0.6, 68, 'High', 'poor'),
('Banashankari Bus Stand', 'Banashankari', 12.9255, 77.5468, 0.4, 32, 'Low', 'good'),
('Domlur Flyover', 'Domlur', 12.9610, 77.6387, 0.5, 48, 'Medium', 'moderate');

-- ============================================================
-- SEED DATA — BMTC sample bus routes (approximate fares)
-- ============================================================
INSERT INTO bus_routes (route_number, route_name, origin_stop, dest_stop, origin_lat, origin_lon, dest_lat, dest_lon, base_fare_inr, per_km_fare_inr) VALUES
('500D', 'Silk Board - Hebbal', 'Silk Board', 'Hebbal', 12.9172, 77.6228, 13.0358, 77.5970, 10, 1.8),
('356', 'Majestic - Whitefield', 'Majestic Bus Stand', 'Whitefield', 12.9767, 77.5713, 12.9698, 77.7500, 10, 1.6),
('201', 'Jayanagar - Hebbal', 'Jayanagar', 'Hebbal', 12.9254, 77.5832, 13.0358, 77.5970, 8, 1.7),
('500K', 'Banashankari - KR Puram', 'Banashankari', 'KR Puram', 12.9255, 77.5468, 13.0088, 77.6964, 12, 1.7),
('210', 'Koramangala - Yelahanka', 'Koramangala', 'Yelahanka', 12.9352, 77.6245, 13.1007, 77.5963, 14, 1.8),
('335E', 'Electronic City - Marathahalli', 'Electronic City', 'Marathahalli', 12.8452, 77.6602, 12.9569, 77.7011, 12, 1.7),
('401K', 'Indiranagar - Domlur', 'Indiranagar', 'Domlur', 12.9719, 77.6412, 12.9610, 77.6387, 6, 1.5);

-- ============================================================
-- SEED DATA — Cab fare configuration (Bengaluru market rates, approx)
-- ============================================================
INSERT INTO fare_config (cab_type, base_fare_inr, per_km_inr, per_min_inr, surge_low_multiplier, surge_medium_multiplier, surge_high_multiplier, min_fare_inr) VALUES
('auto', 30, 15, 1.5, 1.0, 1.25, 1.6, 30),
('mini', 50, 12, 1.8, 1.0, 1.3, 1.8, 60),
('sedan', 65, 14, 2.0, 1.0, 1.3, 1.8, 80),
('suv', 90, 18, 2.5, 1.0, 1.35, 1.9, 120);