import { getDatabase } from './connection';
import fs from 'fs';
import path from 'path';

export function seedDatabase() {
  const db = getDatabase();

  // Read mock data
  const profileData = JSON.parse(
    fs.readFileSync(path.join(process.cwd(), 'data', 'mock-profile.json'), 'utf-8')
  );
  const foodsData = JSON.parse(
    fs.readFileSync(path.join(process.cwd(), 'data', 'mock-foods.json'), 'utf-8')
  );
  const supplementsData = JSON.parse(
    fs.readFileSync(path.join(process.cwd(), 'data', 'mock-supplements.json'), 'utf-8')
  );

  // Insert profile
  const insertProfile = db.prepare(`
    INSERT OR REPLACE INTO profile 
    (id, age, weight, height, gender, activity_level, health_conditions, allergies, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertProfile.run(
    profileData.id,
    profileData.age,
    profileData.weight,
    profileData.height,
    profileData.gender,
    profileData.activityLevel,
    JSON.stringify(profileData.healthConditions),
    JSON.stringify(profileData.allergies),
    profileData.createdAt,
    profileData.updatedAt
  );

  // Insert foods
  const insertFood = db.prepare(`
    INSERT OR REPLACE INTO foods 
    (id, name, serving_size, serving_unit, calories, protein, carbs, fat, fiber, allergens, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  foodsData.forEach((food: any) => {
    insertFood.run(
      food.id,
      food.name,
      food.servingSize,
      food.servingUnit,
      food.nutritionPer100g.calories,
      food.nutritionPer100g.protein,
      food.nutritionPer100g.carbs,
      food.nutritionPer100g.fat,
      food.nutritionPer100g.fiber || 0,
      JSON.stringify(food.allergens || []),
      new Date().toISOString()
    );
  });

  // Insert supplements
  const insertSupplement = db.prepare(`
    INSERT OR REPLACE INTO supplements
    (id, name, brand, serving_size, nutrients, notes, color, dosage_frequency, dosage_quantity, dosage_notes, supplement_type, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  supplementsData.forEach((supp: any) => {
    insertSupplement.run(
      supp.id,
      supp.name,
      supp.brand,
      supp.servingSize,
      JSON.stringify(supp.nutrients),
      supp.notes || null,
      supp.color || '#6366f1',
      supp.dosageFrequency || 'daily',
      supp.dosageQuantity || 1,
      supp.dosageNotes || null,
      supp.supplementType || 'nutrient',
      new Date().toISOString()
    );
  });

  console.log('✅ Database seeded successfully');
}

// Run seeding if this script is executed directly
if (require.main === module) {
  seedDatabase();
}
