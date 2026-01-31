-- Rename house_types table to circle_types
ALTER TABLE house_types RENAME TO circle_types;

-- Rename house_type_id to circle_type_id in circles table
ALTER TABLE circles RENAME COLUMN house_type_id TO circle_type_id;

-- Update seed data codes and descriptions to match circle nomenclature
UPDATE circle_types SET 
  name = CASE 
    WHEN code = 'hourse' THEN 'Home Circle' 
    WHEN code = 'workplace' THEN 'Professional Circle'
    ELSE name 
  END,
  code = CASE 
    WHEN code = 'hourse' THEN 'home' 
    ELSE code 
  END,
  description = CASE 
    WHEN code = 'home' THEN 'Your main family or home circle'
    ELSE description
  END;
