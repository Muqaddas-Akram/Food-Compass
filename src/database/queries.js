import { getDatabase } from './db';
import { SEED_RECIPES } from './seed';

let seedPromise = null;

// ========== SEEDING ==========

export async function seedDatabase() {
  if (!seedPromise) {
    seedPromise = (async () => {
      const db = await getDatabase();
      const count = await db.getFirstAsync('SELECT COUNT(*) as count FROM recipes');
      if (count.count > 0) return; // Already seeded

      for (const recipe of SEED_RECIPES) {
        const result = await db.runAsync(
          `INSERT INTO recipes (name, category, cookingTime, difficulty, description, servings, imageColor) 
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [recipe.name, recipe.category, recipe.cookingTime, recipe.difficulty, recipe.description, recipe.servings, recipe.imageColor]
        );
        const recipeId = result.lastInsertRowId;

        for (const ingredient of recipe.ingredients) {
          await db.runAsync(
            `INSERT INTO ingredients (recipeId, name, quantity, isRequired, alternatives) 
             VALUES (?, ?, ?, ?, ?)`,
            [recipeId, ingredient.name, ingredient.quantity, ingredient.isRequired, ingredient.alternatives]
          );
        }

        for (const step of recipe.steps) {
          await db.runAsync(
            `INSERT INTO steps (recipeId, stepNumber, instruction, duration) 
             VALUES (?, ?, ?, ?)`,
            [recipeId, step.stepNumber, step.instruction, step.duration]
          );
        }
      }
    })();
  }

  try {
    await seedPromise;
  } catch (error) {
    seedPromise = null;
    throw error;
  }
}

// ========== RECIPES ==========

export async function getAllRecipes() {
  const db = await getDatabase();
  return await db.getAllAsync(`
    SELECT r.*, 
      CASE WHEN f.recipeId IS NOT NULL THEN 1 ELSE 0 END as isFavorite
    FROM recipes r 
    LEFT JOIN favorites f ON r.id = f.recipeId
    ORDER BY r.name
  `);
}

export async function getRecipesByCategory(category) {
  const db = await getDatabase();
  return await db.getAllAsync(`
    SELECT r.*, 
      CASE WHEN f.recipeId IS NOT NULL THEN 1 ELSE 0 END as isFavorite
    FROM recipes r 
    LEFT JOIN favorites f ON r.id = f.recipeId
    WHERE r.category = ?
    ORDER BY r.name
  `, [category]);
}

export async function getRecipeById(id) {
  const db = await getDatabase();
  const recipe = await db.getFirstAsync(`
    SELECT r.*, 
      CASE WHEN f.recipeId IS NOT NULL THEN 1 ELSE 0 END as isFavorite
    FROM recipes r 
    LEFT JOIN favorites f ON r.id = f.recipeId
    WHERE r.id = ?
  `, [id]);
  return recipe;
}

export async function getQuickRecipes(maxTime = 15) {
  const db = await getDatabase();
  return await db.getAllAsync(`
    SELECT r.*, 
      CASE WHEN f.recipeId IS NOT NULL THEN 1 ELSE 0 END as isFavorite
    FROM recipes r 
    LEFT JOIN favorites f ON r.id = f.recipeId
    WHERE r.cookingTime <= ?
    ORDER BY r.cookingTime ASC
  `, [maxTime]);
}

export async function getRandomQuickRecipe(maxTime = 15) {
  const db = await getDatabase();
  return await db.getFirstAsync(`
    SELECT r.*, 
      CASE WHEN f.recipeId IS NOT NULL THEN 1 ELSE 0 END as isFavorite
    FROM recipes r 
    LEFT JOIN favorites f ON r.id = f.recipeId
    WHERE r.cookingTime <= ?
    ORDER BY RANDOM()
    LIMIT 1
  `, [maxTime]);
}

// ========== INGREDIENTS ==========

export async function getIngredients(recipeId) {
  const db = await getDatabase();
  return await db.getAllAsync(
    'SELECT * FROM ingredients WHERE recipeId = ? ORDER BY isRequired DESC, id',
    [recipeId]
  );
}

// ========== STEPS ==========

export async function getSteps(recipeId) {
  const db = await getDatabase();
  return await db.getAllAsync(
    'SELECT * FROM steps WHERE recipeId = ? ORDER BY stepNumber',
    [recipeId]
  );
}

// ========== FAVORITES ==========

export async function toggleFavorite(recipeId) {
  const db = await getDatabase();
  const existing = await db.getFirstAsync(
    'SELECT * FROM favorites WHERE recipeId = ?',
    [recipeId]
  );
  if (existing) {
    await db.runAsync('DELETE FROM favorites WHERE recipeId = ?', [recipeId]);
    return false;
  } else {
    await db.runAsync('INSERT INTO favorites (recipeId) VALUES (?)', [recipeId]);
    return true;
  }
}

export async function getFavorites() {
  const db = await getDatabase();
  return await db.getAllAsync(`
    SELECT r.*, 1 as isFavorite
    FROM recipes r 
    INNER JOIN favorites f ON r.id = f.recipeId
    ORDER BY f.createdAt DESC
  `);
}

export async function isFavorite(recipeId) {
  const db = await getDatabase();
  const result = await db.getFirstAsync(
    'SELECT * FROM favorites WHERE recipeId = ?',
    [recipeId]
  );
  return !!result;
}

// ========== STEP PROGRESS ==========

export async function getStepProgress(recipeId) {
  const db = await getDatabase();
  return await db.getAllAsync(
    'SELECT * FROM step_progress WHERE recipeId = ? ORDER BY stepNumber',
    [recipeId]
  );
}

export async function toggleStepComplete(recipeId, stepNumber) {
  const db = await getDatabase();
  const existing = await db.getFirstAsync(
    'SELECT * FROM step_progress WHERE recipeId = ? AND stepNumber = ?',
    [recipeId, stepNumber]
  );
  if (existing) {
    const newValue = existing.completed ? 0 : 1;
    await db.runAsync(
      'UPDATE step_progress SET completed = ? WHERE recipeId = ? AND stepNumber = ?',
      [newValue, recipeId, stepNumber]
    );
    return newValue === 1;
  } else {
    await db.runAsync(
      'INSERT INTO step_progress (recipeId, stepNumber, completed) VALUES (?, ?, 1)',
      [recipeId, stepNumber]
    );
    return true;
  }
}

export async function resetStepProgress(recipeId) {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM step_progress WHERE recipeId = ?', [recipeId]);
}

// ========== SEARCH ==========

export async function searchRecipes(query = '', category = null, maxTime = null) {
  const db = await getDatabase();
  let sql = `
    SELECT r.*, 
      CASE WHEN f.recipeId IS NOT NULL THEN 1 ELSE 0 END as isFavorite
    FROM recipes r 
    LEFT JOIN favorites f ON r.id = f.recipeId
    WHERE 1=1
  `;
  const params = [];

  if (query && query.trim()) {
    sql += ' AND r.name LIKE ?';
    params.push(`%${query.trim()}%`);
  }
  if (category) {
    sql += ' AND r.category = ?';
    params.push(category);
  }
  if (maxTime) {
    sql += ' AND r.cookingTime <= ?';
    params.push(maxTime);
  }

  sql += ' ORDER BY r.name';
  return await db.getAllAsync(sql, params);
}
