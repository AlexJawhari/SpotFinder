-- AUTO-GENERATED SEED DATA
-- Run this in Supabase SQL Editor to populate the map

-- 1. Create System User (if not exists)
INSERT INTO users (id, email, username, password_hash, profile_image)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'system@spotfinder.app', 'SpotFinderSystem', 'hash', 'https://ui-avatars.com/api/?name=System')
ON CONFLICT (email) DO NOTHING;

-- 2. Insert Locations

INSERT INTO locations (name, description, address, city, category, latitude, longitude, amenities, created_by)
VALUES ('New City Library', 'Great library in New York', 'North Main Street', 'New York', 'library', 41.1582663, -73.9879764, '{wifi, quiet, books}', '00000000-0000-0000-0000-000000000001');

INSERT INTO locations (name, description, address, city, category, latitude, longitude, amenities, created_by)
VALUES ('B. Elizabeth Strong Memorial Library', 'Great library in New York', 'East Main Street', 'New York', 'library', 43.6275248, -75.4098265, '{wifi, quiet, books}', '00000000-0000-0000-0000-000000000001');

INSERT INTO locations (name, description, address, city, category, latitude, longitude, amenities, created_by)
VALUES ('Clasons Point Branch New York Public Library', 'Great library in New York', 'Downtown', 'New York', 'library', 40.8294444, -73.8741667, '{wifi, quiet, books}', '00000000-0000-0000-0000-000000000001');

INSERT INTO locations (name, description, address, city, category, latitude, longitude, amenities, created_by)
VALUES ('Kibler Park', 'Great park in New York', 'Downtown', 'New York', 'park', 43.1655945, -78.6723302, '{nature, open_space}', '00000000-0000-0000-0000-000000000001');

INSERT INTO locations (name, description, address, city, category, latitude, longitude, amenities, created_by)
VALUES ('Hunters Creek County Park', 'Great park in New York', 'Downtown', 'New York', 'park', 42.7434857, -78.5537977, '{nature, open_space}', '00000000-0000-0000-0000-000000000001');

INSERT INTO locations (name, description, address, city, category, latitude, longitude, amenities, created_by)
VALUES ('Ontario Beach Park', 'Great park in New York', 'Downtown', 'New York', 'park', 42.8341507, -77.2565458, '{nature, open_space}', '00000000-0000-0000-0000-000000000001');

INSERT INTO locations (name, description, address, city, category, latitude, longitude, amenities, created_by)
VALUES ('Starbucks', 'Great cafe in New York', 'South Road- Route 9', 'New York', 'cafe', 41.6608461, -73.9310721, '{coffee, wifi}', '00000000-0000-0000-0000-000000000001');

INSERT INTO locations (name, description, address, city, category, latitude, longitude, amenities, created_by)
VALUES ('Scoops Downtown', 'Great cafe in New York', 'Downtown', 'New York', 'cafe', 44.6688614, -74.9854007, '{coffee, wifi}', '00000000-0000-0000-0000-000000000001');

INSERT INTO locations (name, description, address, city, category, latitude, longitude, amenities, created_by)
VALUES ('Cafe 482H', 'Great cafe in New York', 'Downtown', 'New York', 'cafe', 42.1111111, -75.9455556, '{coffee, wifi}', '00000000-0000-0000-0000-000000000001');

INSERT INTO locations (name, description, address, city, category, latitude, longitude, amenities, created_by)
VALUES ('Westchester-Loyola Village Branch Library', 'Great library in Los Angeles', 'West Manchester Avenue', 'Los Angeles', 'library', 33.9594189, -118.417116, '{wifi, quiet, books}', '00000000-0000-0000-0000-000000000001');

INSERT INTO locations (name, description, address, city, category, latitude, longitude, amenities, created_by)
VALUES ('Sunland-Tujunga Library', 'Great library in Los Angeles', 'Downtown', 'Los Angeles', 'library', 34.2582533, -118.3013483, '{wifi, quiet, books}', '00000000-0000-0000-0000-000000000001');

INSERT INTO locations (name, description, address, city, category, latitude, longitude, amenities, created_by)
VALUES ('Brentwood Branch Los Angeles Public Library', 'Great library in Los Angeles', 'Downtown', 'Los Angeles', 'library', 34.0526979, -118.4687138, '{wifi, quiet, books}', '00000000-0000-0000-0000-000000000001');

INSERT INTO locations (name, description, address, city, category, latitude, longitude, amenities, created_by)
VALUES ('Sepulveda Dam Recreation Area', 'Great park in Los Angeles', 'Downtown', 'Los Angeles', 'park', 34.1763942, -118.485361, '{nature, open_space}', '00000000-0000-0000-0000-000000000001');

INSERT INTO locations (name, description, address, city, category, latitude, longitude, amenities, created_by)
VALUES ('Arroyo Seco Park', 'Great park in Los Angeles', 'Downtown', 'Los Angeles', 'park', 34.104089, -118.1895507, '{nature, open_space}', '00000000-0000-0000-0000-000000000001');

INSERT INTO locations (name, description, address, city, category, latitude, longitude, amenities, created_by)
VALUES ('Cabrillo Beach Park', 'Great park in Los Angeles', 'Downtown', 'Los Angeles', 'park', 33.7098918, -118.2834937, '{nature, open_space}', '00000000-0000-0000-0000-000000000001');

INSERT INTO locations (name, description, address, city, category, latitude, longitude, amenities, created_by)
VALUES ('Backdoor Bakery', 'Great cafe in Los Angeles', 'Downtown', 'Los Angeles', 'cafe', 34.2599805, -118.3152399, '{coffee, wifi}', '00000000-0000-0000-0000-000000000001');

INSERT INTO locations (name, description, address, city, category, latitude, longitude, amenities, created_by)
VALUES ('Starbucks', 'Great cafe in Los Angeles', 'Hollywood Boulevard', 'Los Angeles', 'cafe', 34.1017216, -118.3373325, '{coffee, wifi}', '00000000-0000-0000-0000-000000000001');

INSERT INTO locations (name, description, address, city, category, latitude, longitude, amenities, created_by)
VALUES ('Barbara''s', 'Great cafe in Los Angeles', 'Downtown', 'Los Angeles', 'cafe', 34.0645693, -118.2181096, '{coffee, wifi}', '00000000-0000-0000-0000-000000000001');

INSERT INTO locations (name, description, address, city, category, latitude, longitude, amenities, created_by)
VALUES ('Northwestern University Law Library', 'Great library in Chicago', 'North Lake Shore Drive', 'Chicago', 'library', 41.8965181, -87.6173152, '{wifi, quiet, books}', '00000000-0000-0000-0000-000000000001');

INSERT INTO locations (name, description, address, city, category, latitude, longitude, amenities, created_by)
VALUES ('Columbia College Chicago Library', 'Great library in Chicago', 'South Michigan Avenue', 'Chicago', 'library', 41.8735823, -87.6245054, '{wifi, quiet, books}', '00000000-0000-0000-0000-000000000001');

INSERT INTO locations (name, description, address, city, category, latitude, longitude, amenities, created_by)
VALUES ('Campbell Park', 'Great park in Chicago', 'Downtown', 'Chicago', 'park', 41.8725818, -87.6825384, '{nature, open_space}', '00000000-0000-0000-0000-000000000001');

INSERT INTO locations (name, description, address, city, category, latitude, longitude, amenities, created_by)
VALUES ('Six Corner''s Parklet', 'Great park in Chicago', 'Downtown', 'Chicago', 'park', 41.9531075, -87.7499215, '{nature, open_space}', '00000000-0000-0000-0000-000000000001');

INSERT INTO locations (name, description, address, city, category, latitude, longitude, amenities, created_by)
VALUES ('McGee Park', 'Great park in Chicago', 'Downtown', 'Chicago', 'park', 41.9958368, -87.6787441, '{nature, open_space}', '00000000-0000-0000-0000-000000000001');

INSERT INTO locations (name, description, address, city, category, latitude, longitude, amenities, created_by)
VALUES ('Park Place Cafe', 'Great cafe in Chicago', 'Downtown', 'Chicago', 'cafe', 41.9208448, -87.6332051, '{coffee, wifi}', '00000000-0000-0000-0000-000000000001');

INSERT INTO locations (name, description, address, city, category, latitude, longitude, amenities, created_by)
VALUES ('Starbucks', 'Great cafe in Chicago', 'West Montrose Avenue', 'Chicago', 'cafe', 41.9616382, -87.6761596, '{coffee, wifi}', '00000000-0000-0000-0000-000000000001');

INSERT INTO locations (name, description, address, city, category, latitude, longitude, amenities, created_by)
VALUES ('Starbucks', 'Great cafe in Chicago', 'West North Avenue', 'Chicago', 'cafe', 41.9113009, -87.6348879, '{coffee, wifi}', '00000000-0000-0000-0000-000000000001');

INSERT INTO locations (name, description, address, city, category, latitude, longitude, amenities, created_by)
VALUES ('Texas State Law Library', 'Great library in Austin', 'Downtown', 'Austin', 'library', 30.2762364, -97.741983, '{wifi, quiet, books}', '00000000-0000-0000-0000-000000000001');

INSERT INTO locations (name, description, address, city, category, latitude, longitude, amenities, created_by)
VALUES ('Lantana Free Tiny Library', 'Great library in Austin', 'Downtown', 'Austin', 'library', 30.2481061, -97.874167, '{wifi, quiet, books}', '00000000-0000-0000-0000-000000000001');

INSERT INTO locations (name, description, address, city, category, latitude, longitude, amenities, created_by)
VALUES ('Austin Public Library - St. John Branch', 'Great library in Austin', 'Blessing Avenue', 'Austin', 'library', 30.332052, -97.6937228, '{wifi, quiet, books}', '00000000-0000-0000-0000-000000000001');

INSERT INTO locations (name, description, address, city, category, latitude, longitude, amenities, created_by)
VALUES ('Gus Fruh Park', 'Great park in Austin', 'Downtown', 'Austin', 'park', 30.2449344, -97.793054, '{nature, open_space}', '00000000-0000-0000-0000-000000000001');

INSERT INTO locations (name, description, address, city, category, latitude, longitude, amenities, created_by)
VALUES ('Bee Caves Preserve', 'Great park in Austin', 'Downtown', 'Austin', 'park', 30.2924221, -97.7902926, '{nature, open_space}', '00000000-0000-0000-0000-000000000001');

INSERT INTO locations (name, description, address, city, category, latitude, longitude, amenities, created_by)
VALUES ('Northeast Park', 'Great park in Austin', 'Downtown', 'Austin', 'park', 30.3146519, -97.6469478, '{nature, open_space}', '00000000-0000-0000-0000-000000000001');

INSERT INTO locations (name, description, address, city, category, latitude, longitude, amenities, created_by)
VALUES ('Starbucks', 'Great cafe in Austin', 'Downtown', 'Austin', 'cafe', 30.2682668, -97.7429695, '{coffee, wifi}', '00000000-0000-0000-0000-000000000001');

INSERT INTO locations (name, description, address, city, category, latitude, longitude, amenities, created_by)
VALUES ('Starbucks', 'Great cafe in Austin', 'Downtown', 'Austin', 'cafe', 30.271876, -97.7411784, '{coffee, wifi}', '00000000-0000-0000-0000-000000000001');

INSERT INTO locations (name, description, address, city, category, latitude, longitude, amenities, created_by)
VALUES ('Starbucks', 'Great cafe in Austin', 'Escarpment Boulevard', 'Austin', 'cafe', 30.2026426, -97.878822, '{coffee, wifi}', '00000000-0000-0000-0000-000000000001');

INSERT INTO locations (name, description, address, city, category, latitude, longitude, amenities, created_by)
VALUES ('Mission Bay Branch Library', 'Great library in San Francisco', '4th Street', 'San Francisco', 'library', 37.7753882, -122.3932, '{wifi, quiet, books}', '00000000-0000-0000-0000-000000000001');

INSERT INTO locations (name, description, address, city, category, latitude, longitude, amenities, created_by)
VALUES ('Far West Library for Educational Research and Development', 'Great library in San Francisco', 'Downtown', 'San Francisco', 'library', 37.7671519, -122.414971, '{wifi, quiet, books}', '00000000-0000-0000-0000-000000000001');

INSERT INTO locations (name, description, address, city, category, latitude, longitude, amenities, created_by)
VALUES ('Anne Bremer Memorial Library', 'Great library in San Francisco', 'Downtown', 'San Francisco', 'library', 37.8035397, -122.4169157, '{wifi, quiet, books}', '00000000-0000-0000-0000-000000000001');

INSERT INTO locations (name, description, address, city, category, latitude, longitude, amenities, created_by)
VALUES ('Harding Park', 'Great park in San Francisco', 'Downtown', 'San Francisco', 'park', 37.722374, -122.4908797, '{nature, open_space}', '00000000-0000-0000-0000-000000000001');

INSERT INTO locations (name, description, address, city, category, latitude, longitude, amenities, created_by)
VALUES ('Lake Merced Sports Center', 'Great park in San Francisco', 'Downtown', 'San Francisco', 'park', 37.7254875, -122.4994167, '{nature, open_space}', '00000000-0000-0000-0000-000000000001');

INSERT INTO locations (name, description, address, city, category, latitude, longitude, amenities, created_by)
VALUES ('Louis Sutter Playground', 'Great park in San Francisco', 'Downtown', 'San Francisco', 'park', 37.7224769, -122.4136718, '{nature, open_space}', '00000000-0000-0000-0000-000000000001');

INSERT INTO locations (name, description, address, city, category, latitude, longitude, amenities, created_by)
VALUES ('Blue Bottle', 'Great cafe in San Francisco', 'Downtown', 'San Francisco', 'cafe', 37.7923271, -122.4346848, '{coffee, wifi}', '00000000-0000-0000-0000-000000000001');

INSERT INTO locations (name, description, address, city, category, latitude, longitude, amenities, created_by)
VALUES ('Brickhouse Cafe and Bar', 'Great cafe in San Francisco', 'Downtown', 'San Francisco', 'cafe', 37.7795947, -122.3951729, '{coffee, wifi}', '00000000-0000-0000-0000-000000000001');

INSERT INTO locations (name, description, address, city, category, latitude, longitude, amenities, created_by)
VALUES ('Caffe Trieste', 'Great cafe in San Francisco', 'Vallejo Street', 'San Francisco', 'cafe', 37.7986732, -122.4072962, '{coffee, wifi}', '00000000-0000-0000-0000-000000000001');
