-- VoltStation — Supabase Database Schema
-- Run this in: Supabase Dashboard -> SQL Editor -> New Query

-- ─────────────────────────────────────────────────────────────────
-- TABLES
-- ─────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS stations (
  id          BIGSERIAL PRIMARY KEY,
  name        VARCHAR(100) NOT NULL,
  address     VARCHAR(200),
  city        VARCHAR(50)  DEFAULT 'Karachi',
  lat         DECIMAL(9,6),
  lng         DECIMAL(9,6),
  open_hours  VARCHAR(50)  DEFAULT '24/7',
  phone       VARCHAR(20),
  created_at  TIMESTAMPTZ  DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS chargers (
  id            BIGSERIAL PRIMARY KEY,
  station_id    BIGINT REFERENCES stations(id) ON DELETE CASCADE,
  charger_code  VARCHAR(10) UNIQUE NOT NULL,
  type          VARCHAR(20) NOT NULL CHECK (type IN ('DC_ULTRA','DC_FAST','AC_LEVEL2')),
  power_kw      INT NOT NULL,
  status        VARCHAR(20) DEFAULT 'available' CHECK (status IN ('available','busy','waiting','maintenance')),
  enabled       BOOLEAN DEFAULT TRUE,
  bay_location  VARCHAR(20),
  sessions_today INT DEFAULT 0,
  current_customer VARCHAR(100),
  elapsed_min   INT DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS users (
  id             BIGSERIAL PRIMARY KEY,
  name           VARCHAR(100) NOT NULL,
  phone          VARCHAR(20) UNIQUE NOT NULL,
  email          VARCHAR(100),
  car_model      VARCHAR(100),
  car_plate      VARCHAR(20),
  is_member      BOOLEAN DEFAULT FALSE,
  total_sessions INT DEFAULT 0,
  total_kwh      DECIMAL(10,2) DEFAULT 0,
  total_spent    DECIMAL(10,2) DEFAULT 0,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS admins (
  id          BIGSERIAL PRIMARY KEY,
  name        VARCHAR(100) NOT NULL,
  username    VARCHAR(50) UNIQUE NOT NULL,
  password    VARCHAR(255) NOT NULL,
  role        VARCHAR(20) DEFAULT 'operator' CHECK (role IN ('super_admin','manager','operator')),
  station_id  BIGINT REFERENCES stations(id),
  last_login  TIMESTAMPTZ,
  is_active   BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS bookings (
  id            BIGSERIAL PRIMARY KEY,
  booking_ref   VARCHAR(20) UNIQUE NOT NULL,
  user_id       BIGINT REFERENCES users(id),
  charger_id    BIGINT REFERENCES chargers(id),
  charger_type  VARCHAR(20),
  booked_at     TIMESTAMPTZ NOT NULL,
  status        VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending','confirmed','cancelled','completed')),
  wash_pkg      VARCHAR(20)  CHECK (wash_pkg IN ('basic','premium','deluxe') OR wash_pkg IS NULL),
  estimated_amt DECIMAL(8,2),
  notes         TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sessions (
  id              BIGSERIAL PRIMARY KEY,
  session_ref     VARCHAR(20) UNIQUE NOT NULL,
  charger_id      BIGINT REFERENCES chargers(id),
  user_id         BIGINT REFERENCES users(id),
  booking_id      BIGINT REFERENCES bookings(id),
  start_time      TIMESTAMPTZ NOT NULL,
  end_time        TIMESTAMPTZ,
  duration_min    INT,
  energy_kwh      DECIMAL(8,2),
  avg_speed_kw    DECIMAL(8,2),
  cost            DECIMAL(8,2),
  improvement_pct DECIMAL(5,2),
  status          VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active','completed')),
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS queue (
  id           BIGSERIAL PRIMARY KEY,
  charger_id   BIGINT REFERENCES chargers(id),
  user_id      BIGINT REFERENCES users(id),
  booking_id   BIGINT REFERENCES bookings(id),
  position     INT NOT NULL,
  car_model    VARCHAR(100),
  car_plate    VARCHAR(20),
  charger_pref VARCHAR(20),
  joined_at    TIMESTAMPTZ DEFAULT NOW(),
  notified     BOOLEAN DEFAULT FALSE,
  status       VARCHAR(20) DEFAULT 'waiting' CHECK (status IN ('waiting','assigned','left'))
);

CREATE TABLE IF NOT EXISTS shops (
  id             BIGSERIAL PRIMARY KEY,
  station_id     BIGINT REFERENCES stations(id) ON DELETE CASCADE,
  name           VARCHAR(100) NOT NULL,
  type           VARCHAR(50),
  icon           VARCHAR(10) DEFAULT '🏪',
  hours          VARCHAR(50),
  is_open        BOOLEAN DEFAULT TRUE,
  revenue_share  DECIMAL(4,2) DEFAULT 5.0,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS car_wash (
  id         BIGSERIAL PRIMARY KEY,
  user_id    BIGINT REFERENCES users(id),
  session_id BIGINT REFERENCES sessions(id),
  package    VARCHAR(20) NOT NULL CHECK (package IN ('basic','premium','deluxe')),
  price      DECIMAL(8,2),
  bay        VARCHAR(10),
  booked_at  TIMESTAMPTZ,
  status     VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled','in_progress','done')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS revenue (
  id          BIGSERIAL PRIMARY KEY,
  station_id  BIGINT REFERENCES stations(id),
  source      VARCHAR(30) CHECK (source IN ('charging','car_wash','shop_commission','other')),
  amount      DECIMAL(10,2),
  session_id  BIGINT REFERENCES sessions(id),
  recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────────
-- SEED DATA
-- ─────────────────────────────────────────────────────────────────

INSERT INTO stations (id,name,address,city,lat,lng,open_hours,phone) VALUES
  (1,'VoltStation Karachi Hub-1','Plot 42, Shahrah-e-Faisal','Karachi',24.8607,67.0011,'24/7','+92-21-111-8658-1'),
  (2,'VoltStation Karachi Hub-2','Block 5, Clifton','Karachi',24.8138,67.0300,'6AM-12AM','+92-21-111-8658-2'),
  (3,'VoltStation Lahore Hub-1','Main Boulevard, Gulberg','Lahore',31.5204,74.3587,'24/7','+92-42-111-8658-1')
ON CONFLICT (id) DO NOTHING;

-- Reset sequence after manual id inserts
SELECT setval('stations_id_seq', 3);

INSERT INTO chargers (station_id,charger_code,type,power_kw,bay_location,status,sessions_today) VALUES
  (1,'C-01','DC_ULTRA',150,'Bay-A1','busy',8),
  (1,'C-02','DC_ULTRA',150,'Bay-A2','available',6),
  (1,'C-03','DC_ULTRA',150,'Bay-A3','busy',5),
  (1,'C-04','DC_FAST',50,'Bay-B1','available',4),
  (1,'C-05','DC_FAST',50,'Bay-B2','busy',7),
  (1,'C-06','DC_FAST',50,'Bay-B3','available',3),
  (1,'C-07','DC_FAST',50,'Bay-B4','maintenance',0),
  (1,'C-08','DC_FAST',50,'Bay-B5','available',5),
  (1,'C-09','AC_LEVEL2',22,'Bay-C1','available',9),
  (1,'C-10','AC_LEVEL2',22,'Bay-C2','waiting',2),
  (1,'C-11','AC_LEVEL2',22,'Bay-C3','available',6),
  (1,'C-12','AC_LEVEL2',22,'Bay-C4','waiting',4)
ON CONFLICT (charger_code) DO NOTHING;

INSERT INTO shops (station_id,name,type,icon,hours,is_open,revenue_share) VALUES
  (1,'Volt Café','Food & Beverages','☕','6AM–12AM',true,5.0),
  (1,'QuickMart','Convenience Store','🛒','24/7',true,3.0),
  (1,'Auto Care','Car Accessories','🔧','9AM–9PM',true,8.0),
  (1,'DetailPro','Car Detailing','🧴','8AM–8PM',true,12.0),
  (1,'MedPoint','Pharmacy','💊','9AM–9PM',false,4.0),
  (1,'TechFix','Mobile Repair','📱','10AM–10PM',true,6.0),
  (1,'Slice Zone','Fast Food','🍕','11AM–2AM',true,5.0),
  (1,'Play Lounge','Entertainment','🎮','12PM–12AM',true,10.0)
ON CONFLICT DO NOTHING;

INSERT INTO users (name,phone,email,car_model,car_plate,is_member) VALUES
  ('Ali Raza','03124445566','ali@gmail.com','Toyota bZ4X','KHI-101',true),
  ('Sara Ahmed','03217778899','sara@yahoo.com','BMW iX3','LHR-332',true),
  ('Usman Khan','03331112233','usman@gmail.com','Nissan Leaf','KHI-887',false),
  ('Fatima Ali','03459990011','fatima@gmail.com','MG ZS EV','ISB-220',false),
  ('Hassan Mir','03005556677','hassan@gmail.com','Changan Oshan X','KHI-442',false),
  ('Zara Sheikh','03111234567','zara@gmail.com','BYD Atto 3','LHR-891',true)
ON CONFLICT (phone) DO NOTHING;

-- Monthly revenue seed
INSERT INTO revenue (station_id,source,amount,recorded_at) VALUES
  (1,'charging',65000,'2025-10-15'),
  (1,'car_wash',9100,'2025-10-15'),
  (1,'shop_commission',3250,'2025-10-15'),
  (1,'charging',72000,'2025-11-15'),
  (1,'car_wash',10080,'2025-11-15'),
  (1,'shop_commission',3600,'2025-11-15'),
  (1,'charging',85000,'2025-12-15'),
  (1,'car_wash',11900,'2025-12-15'),
  (1,'shop_commission',4250,'2025-12-15'),
  (1,'charging',78000,'2026-01-15'),
  (1,'car_wash',10920,'2026-01-15'),
  (1,'shop_commission',3900,'2026-01-15'),
  (1,'charging',90000,'2026-02-15'),
  (1,'car_wash',12600,'2026-02-15'),
  (1,'shop_commission',4500,'2026-02-15'),
  (1,'charging',105000,'2026-03-15'),
  (1,'car_wash',14700,'2026-03-15'),
  (1,'shop_commission',5250,'2026-03-15'),
  (1,'charging',118000,'2026-04-01'),
  (1,'car_wash',16520,'2026-04-01'),
  (1,'shop_commission',5900,'2026-04-01')
ON CONFLICT DO NOTHING;

-- NOTE: Admins are inserted via /api/seed endpoint (passwords need bcrypt hashing)
-- Run: POST /api/seed  after setting up the app
