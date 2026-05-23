-- Seed baseline Service categories, types, and representative offerings
-- Idempotent by service name to avoid duplicates on re-run
BEGIN;

-- Maintenance / Cleaning
INSERT INTO services (id, name, description, category, base_price, price_unit, duration_minutes, status, is_popular, available_24_7, image, response_level, seasonal_availability, rating, review_count, features, created_at, updated_at)
SELECT '0a1f2b34-5c67-48d9-8a10-1b2c3d4e5f60'::uuid, 'Weekly Pool Cleaning', 'Comprehensive weekly cleaning: skim, brush, vacuum, empty baskets, check equipment.', 'Maintenance', 65.00, 'service', 60, TRUE, TRUE, FALSE, NULL, 'routine', NULL, 4.85, 0, '["Skim & brush","Vacuum","Basket clean"]', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM services s WHERE lower(s.name)=lower('Weekly Pool Cleaning'));

INSERT INTO services (id, name, description, category, base_price, price_unit, duration_minutes, status, is_popular, available_24_7, image, response_level, seasonal_availability, rating, review_count, features, created_at, updated_at) 
SELECT '11aa22bb-33cc-44dd-88ee-99ff00aa11bb'::uuid, 'Bi-Weekly Pool Cleaning', 'Every other week service for well-maintained pools.', 'Maintenance', 55.00, 'service', 60, TRUE, FALSE, FALSE, NULL, 'routine', NULL, 4.70, 0, '["Skim & brush","Chem check"]', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM services s WHERE lower(s.name)=lower('Bi-Weekly Pool Cleaning'));

INSERT INTO services (id, name, description, category, base_price, price_unit, duration_minutes, status, is_popular, available_24_7, image, response_level, seasonal_availability, rating, review_count, features, created_at, updated_at)
SELECT '22cc33dd-44ee-55ff-99aa-00bb11cc22dd'::uuid, 'Monthly Maintenance Visit', 'Monthly professional check with light cleaning and system check.', 'Maintenance', 45.00, 'service', 45, TRUE, FALSE, FALSE, NULL, 'routine', NULL, 4.60, 0, '["Visual inspection","Light clean"]', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM services s WHERE lower(s.name)=lower('Monthly Maintenance Visit'));

INSERT INTO services (id, name, description, category, base_price, price_unit, duration_minutes, status, is_popular, available_24_7, image, response_level, seasonal_availability, rating, review_count, features, created_at, updated_at)
SELECT '33dd44ee-55ff-66aa-88bb-11cc22dd33ee'::uuid, 'Chemical Balancing', 'Test and balance chlorine, pH, alkalinity, stabilizer.', 'Maintenance', 35.00, 'service', 30, TRUE, TRUE, FALSE, NULL, 'routine', NULL, 4.65, 0, '["Full chem test","Adjust levels"]', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM services s WHERE lower(s.name)=lower('Chemical Balancing'));

INSERT INTO services (id, name, description, category, base_price, price_unit, duration_minutes, status, is_popular, available_24_7, image, response_level, seasonal_availability, rating, review_count, features, created_at, updated_at)
SELECT '44ee55ff-66aa-77bb-99cc-22dd33ee44ff'::uuid, 'Filter Cartridge Cleaning', 'Remove and deep-clean cartridges to restore flow and clarity.', 'Maintenance', 70.00, 'service', 60, TRUE, FALSE, FALSE, NULL, 'routine', NULL, 4.55, 0, '["Disassemble","Soak & rinse"]', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM services s WHERE lower(s.name)=lower('Filter Cartridge Cleaning'));

INSERT INTO services (id, name, description, category, base_price, price_unit, duration_minutes, status, is_popular, available_24_7, image, response_level, seasonal_availability, rating, review_count, features, created_at, updated_at)
SELECT '55ff66aa-77bb-88cc-90dd-33ee44ff55aa'::uuid, 'DE Filter Backwash & Recharge', 'Backwash DE filter and recharge with fresh DE powder.', 'Maintenance', 75.00, 'service', 60, TRUE, FALSE, FALSE, NULL, 'routine', NULL, 4.50, 0, '["Backwash","Recharge DE"]', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM services s WHERE lower(s.name)=lower('DE Filter Backwash & Recharge'));

INSERT INTO services (id, name, description, category, base_price, price_unit, duration_minutes, status, is_popular, available_24_7, image, response_level, seasonal_availability, rating, review_count, features, created_at, updated_at)
SELECT '66aa77bb-88cc-99dd-a0ee-44ff55aa66bb'::uuid, 'Tile/Waterline Scrub', 'Remove scum line and mineral buildup along waterline.', 'Cleaning', 80.00, 'hour', 90, TRUE, FALSE, FALSE, NULL, 'routine', NULL, 4.40, 0, '["Scale removal","Detail brush"]', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM services s WHERE lower(s.name)=lower('Tile/Waterline Scrub'));

INSERT INTO services (id, name, description, category, base_price, price_unit, duration_minutes, status, is_popular, available_24_7, image, response_level, seasonal_availability, rating, review_count, features, created_at, updated_at)
SELECT '77bb88cc-99dd-aaee-b0ff-55aa66bb77cc'::uuid, 'Vacuum Service Add-on', 'Standalone manual vacuuming for debris-heavy pools.', 'Cleaning', 50.00, 'service', 45, TRUE, FALSE, FALSE, NULL, 'routine', NULL, 4.35, 0, '["Deep vacuum","Debris removal"]', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM services s WHERE lower(s.name)=lower('Vacuum Service Add-on'));

-- Repair
INSERT INTO services (id, name, description, category, base_price, price_unit, duration_minutes, status, is_popular, available_24_7, image, response_level, seasonal_availability, rating, review_count, features, created_at, updated_at)
SELECT '88cc99dd-aaee-bbff-c100-66bb77cc88dd'::uuid, 'Pump Repair', 'Diagnose and repair pump priming, leaks, bearings, or seals.', 'Repair', 95.00, 'hour', 60, TRUE, TRUE, FALSE, NULL, 'routine', NULL, 4.50, 0, '["Diagnosis","Seal/bearing"]', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM services s WHERE lower(s.name)=lower('Pump Repair'));

INSERT INTO services (id, name, description, category, base_price, price_unit, duration_minutes, status, is_popular, available_24_7, image, response_level, seasonal_availability, rating, review_count, features, created_at, updated_at)
SELECT '99ddaaee-bbff-cc00-d111-77cc88dd99ee'::uuid, 'Filter Repair', 'Repair or replace broken laterals, manifolds, or valves.', 'Repair', 95.00, 'hour', 60, TRUE, FALSE, FALSE, NULL, 'routine', NULL, 4.45, 0, '["Multiport valve","Laterals"]', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM services s WHERE lower(s.name)=lower('Filter Repair'));

INSERT INTO services (id, name, description, category, base_price, price_unit, duration_minutes, status, is_popular, available_24_7, image, response_level, seasonal_availability, rating, review_count, features, created_at, updated_at)
SELECT 'aaee bbff-cc00-dd11-ee22-88dd99eeaabb'::uuid, 'Heater Repair', 'Ignition failures, pressure switch, sensor diagnostics and repairs.', 'Repair', 110.00, 'hour', 60, TRUE, FALSE, FALSE, NULL, 'routine', NULL, 4.40, 0, '["Ignition","Sensors"]', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM services s WHERE lower(s.name)=lower('Heater Repair'));

INSERT INTO services (id, name, description, category, base_price, price_unit, duration_minutes, status, is_popular, available_24_7, image, response_level, seasonal_availability, rating, review_count, features, created_at, updated_at)
SELECT 'bbffcc00-dd11-ee22-ff33-99eeaabbcc00'::uuid, 'Leak Detection & Repair', 'Pressure testing and leak localization with minor repairs.', 'Repair', 150.00, 'service', 120, TRUE, FALSE, FALSE, NULL, 'routine', NULL, 4.35, 0, '["Pressure test","Dye test"]', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM services s WHERE lower(s.name)=lower('Leak Detection & Repair'));

INSERT INTO services (id, name, description, category, base_price, price_unit, duration_minutes, status, is_popular, available_24_7, image, response_level, seasonal_availability, rating, review_count, features, created_at, updated_at)
SELECT 'cc00dd11-ee22-ff33-0011-aabbcc00ddee'::uuid, 'Plumbing Repair', 'Fix broken fittings, unions, and suction/return lines.', 'Repair', 95.00, 'hour', 60, TRUE, FALSE, FALSE, NULL, 'routine', NULL, 4.30, 0, '["PVC work","Leak fix"]', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM services s WHERE lower(s.name)=lower('Plumbing Repair'));

INSERT INTO services (id, name, description, category, base_price, price_unit, duration_minutes, status, is_popular, available_24_7, image, response_level, seasonal_availability, rating, review_count, features, created_at, updated_at)
SELECT 'dd11ee22-ff33-0011-2233-bbcc00ddeeff'::uuid, 'Skimmer Replacement', 'Replace cracked skimmer body or throat with proper plumbing.', 'Repair', 450.00, 'project', 180, TRUE, FALSE, FALSE, NULL, 'routine', NULL, 4.25, 0, '["Demolition","New skimmer"]', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM services s WHERE lower(s.name)=lower('Skimmer Replacement'));

INSERT INTO services (id, name, description, category, base_price, price_unit, duration_minutes, status, is_popular, available_24_7, image, response_level, seasonal_availability, rating, review_count, features, created_at, updated_at)
SELECT 'ee22ff33-0011-2233-4455-cc00ddeeff11'::uuid, 'Light Fixture Repair', 'Troubleshoot and repair pool light fixtures and conduits.', 'Repair', 95.00, 'hour', 60, TRUE, FALSE, FALSE, NULL, 'routine', NULL, 4.30, 0, '["Gasket","Wiring"]', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM services s WHERE lower(s.name)=lower('Light Fixture Repair'));

-- Installation / Upgrades
INSERT INTO services (id, name, description, category, base_price, price_unit, duration_minutes, status, is_popular, available_24_7, image, response_level, seasonal_availability, rating, review_count, features, created_at, updated_at)
SELECT 'ff330011-2233-4455-6677-ddeeff110022'::uuid, 'Pump Installation', 'Install new single-speed or variable-speed pump with priming.', 'Installation', 350.00, 'project', 120, TRUE, TRUE, FALSE, NULL, 'routine', NULL, 4.60, 0, '["VS pump ready","New unions"]', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM services s WHERE lower(s.name)=lower('Pump Installation'));

INSERT INTO services (id, name, description, category, base_price, price_unit, duration_minutes, status, is_popular, available_24_7, image, response_level, seasonal_availability, rating, review_count, features, created_at, updated_at)
SELECT '00112233-4455-6677-8899-eeff11002233'::uuid, 'Filter Installation', 'Install new cartridge, DE, or sand filter with proper plumbing.', 'Installation', 325.00, 'project', 120, TRUE, FALSE, FALSE, NULL, 'routine', NULL, 4.55, 0, '["Level pad","New valves"]', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM services s WHERE lower(s.name)=lower('Filter Installation'));

INSERT INTO services (id, name, description, category, base_price, price_unit, duration_minutes, status, is_popular, available_24_7, image, response_level, seasonal_availability, rating, review_count, features, created_at, updated_at)
SELECT '11223344-5566-7788-99aa-ff1100223344'::uuid, 'Heater Installation', 'Install gas or electric heater; test pressure and ignition.', 'Installation', 500.00, 'project', 180, TRUE, FALSE, FALSE, NULL, 'routine', NULL, 4.50, 0, '["Gas/electric","Startup test"]', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM services s WHERE lower(s.name)=lower('Heater Installation'));

INSERT INTO services (id, name, description, category, base_price, price_unit, duration_minutes, status, is_popular, available_24_7, image, response_level, seasonal_availability, rating, review_count, features, created_at, updated_at)
SELECT '22334455-6677-8899-aabb-110022334455'::uuid, 'Salt System Installation', 'Install and commission saltwater chlorination system.', 'Installation', 420.00, 'project', 150, TRUE, TRUE, FALSE, NULL, 'routine', NULL, 4.55, 0, '["Cell mount","Control setup"]', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM services s WHERE lower(s.name)=lower('Salt System Installation'));

INSERT INTO services (id, name, description, category, base_price, price_unit, duration_minutes, status, is_popular, available_24_7, image, response_level, seasonal_availability, rating, review_count, features, created_at, updated_at)
SELECT '33445566-7788-99aa-bbcc-002233445566'::uuid, 'Automation Controller Install', 'Install automation hub and configure schedules & relays.', 'Installation', 450.00, 'project', 180, TRUE, FALSE, FALSE, NULL, 'routine', NULL, 4.45, 0, '["App setup","Schedules"]', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM services s WHERE lower(s.name)=lower('Automation Controller Install'));

INSERT INTO services (id, name, description, category, base_price, price_unit, duration_minutes, status, is_popular, available_24_7, image, response_level, seasonal_availability, rating, review_count, features, created_at, updated_at)
SELECT '44556677-8899-aabb-ccdd-223344556677'::uuid, 'LED Pool Light Installation', 'Install energy-efficient LED pool/spa light assemblies.', 'Installation', 275.00, 'project', 90, TRUE, FALSE, FALSE, NULL, 'routine', NULL, 4.50, 0, '["LED upgrade","Color modes"]', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM services s WHERE lower(s.name)=lower('LED Pool Light Installation'));

INSERT INTO services (id, name, description, category, base_price, price_unit, duration_minutes, status, is_popular, available_24_7, image, response_level, seasonal_availability, rating, review_count, features, created_at, updated_at)
SELECT '55667788-99aa-bbcc-ddee-334455667788'::uuid, 'Variable-Speed Pump Upgrade', 'Replace legacy pump with high-efficiency VS pump.', 'Installation', 399.00, 'project', 150, TRUE, TRUE, FALSE, NULL, 'routine', NULL, 4.65, 0, '["Energy savings","Rebate help"]', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM services s WHERE lower(s.name)=lower('Variable-Speed Pump Upgrade'));

-- Inspection / Diagnostics
INSERT INTO services (id, name, description, category, base_price, price_unit, duration_minutes, status, is_popular, available_24_7, image, response_level, seasonal_availability, rating, review_count, features, created_at, updated_at)
SELECT '66778899-aabb-ccdd-eeff-445566778899'::uuid, 'Equipment Inspection & Tune-up', 'Comprehensive health check and optimization of pool equipment.', 'Inspection', 89.00, 'service', 60, TRUE, TRUE, FALSE, NULL, 'routine', NULL, 4.55, 0, '["Pressure test","Tune-up"]', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM services s WHERE lower(s.name)=lower('Equipment Inspection & Tune-up'));

INSERT INTO services (id, name, description, category, base_price, price_unit, duration_minutes, status, is_popular, available_24_7, image, response_level, seasonal_availability, rating, review_count, features, created_at, updated_at)
SELECT '778899aa-bbcc-ddee-ff00-5566778899aa'::uuid, 'Electrical Diagnostics', 'Diagnostics for electrical issues with pumps, lights, and automation.', 'Inspection', 95.00, 'hour', 60, TRUE, FALSE, FALSE, NULL, 'routine', NULL, 4.45, 0, '["Continuity","Load test"]', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM services s WHERE lower(s.name)=lower('Electrical Diagnostics'));

INSERT INTO services (id, name, description, category, base_price, price_unit, duration_minutes, status, is_popular, available_24_7, image, response_level, seasonal_availability, rating, review_count, features, created_at, updated_at)
SELECT '8899aabb-ccdd-eeff-0011-66778899aabb'::uuid, 'Water Quality Assessment', 'Advanced testing including metals, phosphates, and TDS.', 'Inspection', 49.00, 'service', 30, TRUE, FALSE, FALSE, NULL, 'routine', NULL, 4.40, 0, '["Metals","Phosphates"]', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM services s WHERE lower(s.name)=lower('Water Quality Assessment'));

INSERT INTO services (id, name, description, category, base_price, price_unit, duration_minutes, status, is_popular, available_24_7, image, response_level, seasonal_availability, rating, review_count, features, created_at, updated_at)
SELECT '99aabbcc-ddee-ff00-1122-778899aabbcc'::uuid, 'Pre-Sale Pool Inspection', 'Detailed inspection report for home buyers and sellers.', 'Inspection', 199.00, 'service', 120, TRUE, FALSE, FALSE, NULL, 'routine', NULL, 4.60, 0, '["Report","Photos"]', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM services s WHERE lower(s.name)=lower('Pre-Sale Pool Inspection'));

-- Seasonal
INSERT INTO services (id, name, description, category, base_price, price_unit, duration_minutes, status, is_popular, available_24_7, image, response_level, seasonal_availability, rating, review_count, features, created_at, updated_at)
SELECT 'aabbccdd-eeff-0011-2233-8899aabbccdd'::uuid, 'Pool Opening (Spring)', 'Remove cover, reassemble equipment, start up and balance water.', 'Seasonal', 249.00, 'service', 120, TRUE, TRUE, FALSE, NULL, 'seasonal', 'spring', 4.70, 0, '["Cover removal","Startup"]', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM services s WHERE lower(s.name)=lower('Pool Opening (Spring'));

INSERT INTO services (id, name, description, category, base_price, price_unit, duration_minutes, status, is_popular, available_24_7, image, response_level, seasonal_availability, rating, review_count, features, created_at, updated_at)
SELECT 'bbccddeeff-0011-2233-4455-99aabbccdde0'::uuid, 'Pool Closing (Fall)', 'Winterize lines, add winter chemicals, secure cover.', 'Seasonal', 229.00, 'service', 120, TRUE, TRUE, FALSE, NULL, 'seasonal', 'fall', 4.70, 0, '["Blow lines","Winter kit"]', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM services s WHERE lower(s.name)=lower('Pool Closing (Fall'));

INSERT INTO services (id, name, description, category, base_price, price_unit, duration_minutes, status, is_popular, available_24_7, image, response_level, seasonal_availability, rating, review_count, features, created_at, updated_at)
SELECT 'ccddee00-1122-3344-5566-aabbccddeeff'::uuid, 'Winterization Service', 'Protect pool and equipment for freezing temperatures.', 'Seasonal', 199.00, 'service', 90, TRUE, FALSE, FALSE, NULL, 'seasonal', 'winter', 4.60, 0, '["Anti-freeze","Equipment prep"]', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM services s WHERE lower(s.name)=lower('Winterization Service'));

INSERT INTO services (id, name, description, category, base_price, price_unit, duration_minutes, status, is_popular, available_24_7, image, response_level, seasonal_availability, rating, review_count, features, created_at, updated_at)
SELECT 'ddeeff00-1122-3344-5566-aabbccdd0011'::uuid, 'Summer Startup Shock & Balance', 'Open-season chemical shock and full balancing.', 'Seasonal', 119.00, 'service', 45, TRUE, FALSE, FALSE, NULL, 'seasonal', 'summer', 4.55, 0, '["Shock","Balance"]', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM services s WHERE lower(s.name)=lower('Summer Startup Shock & Balance'));

-- Emergency
INSERT INTO services (id, name, description, category, base_price, price_unit, duration_minutes, status, is_popular, available_24_7, image, response_level, seasonal_availability, rating, review_count, features, created_at, updated_at)
SELECT 'eeff0011-2233-4455-6677-bbccddeeff00'::uuid, 'Emergency Green Pool Cleanup', 'Rapid algae treatment and debris removal to restore clarity.', 'Emergency', 249.00, 'project', 180, TRUE, TRUE, TRUE, NULL, 'emergency', NULL, 4.40, 0, '["Shock treatment","Floc & vac"]', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM services s WHERE lower(s.name)=lower('Emergency Green Pool Cleanup'));

INSERT INTO services (id, name, description, category, base_price, price_unit, duration_minutes, status, is_popular, available_24_7, image, response_level, seasonal_availability, rating, review_count, features, created_at, updated_at)
SELECT 'ff001122-3344-5566-7788-ccddeeff0011'::uuid, 'Emergency Equipment Failure Response', 'Priority response to pump/heater failures preventing damage.', 'Emergency', 149.00, 'service', 60, TRUE, TRUE, TRUE, NULL, 'emergency', NULL, 4.45, 0, '["Priority dispatch","Temporary fix"]', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM services s WHERE lower(s.name)=lower('Emergency Equipment Failure Response'));

INSERT INTO services (id, name, description, category, base_price, price_unit, duration_minutes, status, is_popular, available_24_7, image, response_level, seasonal_availability, rating, review_count, features, created_at, updated_at)
SELECT '00112233-4455-6677-8899-ddeeff001122'::uuid, 'Storm Debris Cleanup', 'Post-storm debris removal, basket clearing, and filter clean.', 'Emergency', 129.00, 'service', 60, TRUE, TRUE, TRUE, NULL, 'emergency', NULL, 4.35, 0, '["Debris removal","Filter clean"]', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM services s WHERE lower(s.name)=lower('Storm Debris Cleanup'));

-- Renovation / Upgrades (advisory or scoped projects)
INSERT INTO services (id, name, description, category, base_price, price_unit, duration_minutes, status, is_popular, available_24_7, image, response_level, seasonal_availability, rating, review_count, features, created_at, updated_at)
SELECT '11223344-5566-7788-99aa-ddeeff112233'::uuid, 'Tile Replacement Consultation', 'On-site assessment and quote for tile replacement scope.', 'Renovation', 79.00, 'service', 45, TRUE, FALSE, FALSE, NULL, 'routine', NULL, 4.30, 0, '["Scope assess","Estimate"]', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM services s WHERE lower(s.name)=lower('Tile Replacement Consultation'));

INSERT INTO services (id, name, description, category, base_price, price_unit, duration_minutes, status, is_popular, available_24_7, image, response_level, seasonal_availability, rating, review_count, features, created_at, updated_at)
SELECT '22334455-6677-8899-aabb-eeff11223344'::uuid, 'Resurfacing Consultation', 'Surface condition check and resurfacing options review.', 'Renovation', 79.00, 'service', 45, TRUE, FALSE, FALSE, NULL, 'routine', NULL, 4.30, 0, '["Surface check","Options"]', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM services s WHERE lower(s.name)=lower('Resurfacing Consultation'));

INSERT INTO services (id, name, description, category, base_price, price_unit, duration_minutes, status, is_popular, available_24_7, image, response_level, seasonal_availability, rating, review_count, features, created_at, updated_at)
SELECT '33445566-7788-99aa-bbcc-ff1122334455'::uuid, 'Coping Repair', 'Spot repairs of cracked or loose coping stones.', 'Renovation', 120.00, 'hour', 60, TRUE, FALSE, FALSE, NULL, 'routine', NULL, 4.35, 0, '["Mortar set","Seal"]', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM services s WHERE lower(s.name)=lower('Coping Repair'));

COMMIT;
