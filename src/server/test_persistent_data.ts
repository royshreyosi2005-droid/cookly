import { createApp } from './app.js';
import { closeDatabase } from './db/database.js';
import type { Server } from 'http';
import fs from 'fs';
import path from 'path';

const TEST_PORT = 5995;
const TEST_DB_PATH = path.resolve(process.cwd(), 'data', 'cookly_test.db');

async function runPersistentDataTests() {
  console.log('===================================================');
  console.log('       COOKLY PERSISTENT DATA & AUTH TEST SUITE    ');
  console.log('===================================================');

  process.env.DATABASE_PATH = TEST_DB_PATH;
  closeDatabase();
  // Clean up any previous test DB
  if (fs.existsSync(TEST_DB_PATH)) {
    try { fs.unlinkSync(TEST_DB_PATH); } catch {}
  }
  const app = createApp();
  let server: Server | undefined;

  await new Promise<void>((resolve) => {
    server = app.listen(TEST_PORT, () => {
      console.log(`[Auth Test Server] Listening on http://localhost:${TEST_PORT}\n`);
      resolve();
    });
  });

  const baseUrl = `http://localhost:${TEST_PORT}/api`;
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, message: string) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    // -------------------------------------------------------------
    // Test 1: User Signup & Password Hashing
    // -------------------------------------------------------------
    console.log('[Test 1: User Registration]');
    const signupRes = await fetch(`${baseUrl}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Jane Doe',
        email: 'jane.doe@example.com',
        password: 'securePassword123'
      })
    });
    assert(signupRes.status === 201, 'Signup returns HTTP 201');
    const signupData: any = await signupRes.json();
    assert(signupData.success === true, 'Signup success is true');
    assert(Boolean(signupData.data.token), 'JWT token returned');
    assert(signupData.data.user.email === 'jane.doe@example.com', 'User email matches');
    assert(signupData.data.user.name === 'Jane Doe', 'User name matches');
    assert(signupData.data.user.passwordHash === undefined, 'Password hash never exposed to client');

    const user1Token = signupData.data.token;
    const user1Id = signupData.data.user.id;

    // Duplicate signup attempt
    const dupRes = await fetch(`${baseUrl}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Jane Clone',
        email: 'jane.doe@example.com',
        password: 'securePassword123'
      })
    });
    assert(dupRes.status === 409, 'Duplicate signup rejected with HTTP 409');

    // -------------------------------------------------------------
    // Test 2: User Login
    // -------------------------------------------------------------
    console.log('\n[Test 2: User Login]');
    const loginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'jane.doe@example.com',
        password: 'securePassword123'
      })
    });
    assert(loginRes.status === 200, 'Login returns HTTP 200');
    const loginData: any = await loginRes.json();
    assert(loginData.success === true, 'Login success is true');
    assert(Boolean(loginData.data.token), 'Login returns valid JWT');

    // Invalid password attempt
    const badLoginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'jane.doe@example.com',
        password: 'wrongPassword'
      })
    });
    assert(badLoginRes.status === 401, 'Invalid password rejected with HTTP 401');

    // -------------------------------------------------------------
    // Test 3: Authenticated Request /api/auth/me
    // -------------------------------------------------------------
    console.log('\n[Test 3: Authenticated Profile & Stats]');
    const meRes = await fetch(`${baseUrl}/auth/me`, {
      headers: { 'Authorization': `Bearer ${user1Token}` }
    });
    assert(meRes.status === 200, 'GET /api/auth/me returns HTTP 200');
    const meData: any = await meRes.json();
    assert(meData.data.user.id === user1Id, 'Correct user identity returned');
    assert(typeof meData.data.stats.savedCount === 'number', 'Stats savedCount present');
    assert(typeof meData.data.stats.pantryCount === 'number', 'Stats pantryCount present');

    // -------------------------------------------------------------
    // Test 4: Unauthorized Request
    // -------------------------------------------------------------
    console.log('\n[Test 4: Unauthorized Access Protection]');
    const unauthRes = await fetch(`${baseUrl}/auth/me`);
    assert(unauthRes.status === 401, 'Missing token rejected with HTTP 401');

    const fakeTokenRes = await fetch(`${baseUrl}/auth/me`, {
      headers: { 'Authorization': 'Bearer invalid.fake.token' }
    });
    assert(fakeTokenRes.status === 401, 'Invalid token rejected with HTTP 401');

    // -------------------------------------------------------------
    // Test 5: User Preferences & Profile Updates
    // -------------------------------------------------------------
    console.log('\n[Test 5: User Preferences & Profile Updates]');
    const updatePrefRes = await fetch(`${baseUrl}/profile/preferences`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${user1Token}`
      },
      body: JSON.stringify({
        foodPreferences: ['High-protein', 'Low-calorie'],
        dietaryPreferences: ['Gluten-Free'],
        nutritionGoals: ['High Protein (25g+/meal)'],
        allergies: ['Peanuts', 'Shellfish'],
        defaultServings: 4,
        maxCookTimeMinutes: 25
      })
    });
    assert(updatePrefRes.status === 200, 'PUT /api/profile/preferences returns HTTP 200');
    const prefData: any = await updatePrefRes.json();
    assert(prefData.data.foodPreferences.includes('High-protein'), 'Food preferences saved');
    assert(prefData.data.defaultServings === 4, 'Default servings updated to 4');
    assert(prefData.data.allergies.includes('Shellfish'), 'Allergies updated');

    // -------------------------------------------------------------
    // Test 6: User Pantry CRUD
    // -------------------------------------------------------------
    console.log('\n[Test 6: User Pantry CRUD]');
    // Add single ingredient
    const addPantryRes = await fetch(`${baseUrl}/user-pantry`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${user1Token}`
      },
      body: JSON.stringify({ ingredient: 'Eggs', quantity: 6, unit: 'pcs' })
    });
    assert(addPantryRes.status === 201, 'POST /api/user-pantry returns HTTP 201');

    // Batch add ingredients
    const batchPantryRes = await fetch(`${baseUrl}/user-pantry/batch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${user1Token}`
      },
      body: JSON.stringify({ ingredients: ['Potato', 'Onion', 'Garlic'] })
    });
    assert(batchPantryRes.status === 200, 'POST /api/user-pantry/batch returns HTTP 200');

    // Get pantry
    const getPantryRes = await fetch(`${baseUrl}/user-pantry`, {
      headers: { 'Authorization': `Bearer ${user1Token}` }
    });
    const pantryData: any = await getPantryRes.json();
    assert(pantryData.data.length === 4, 'Pantry has exactly 4 items (Eggs, Potato, Onion, Garlic)');

    // Delete single ingredient
    const delPantryRes = await fetch(`${baseUrl}/user-pantry/Eggs`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${user1Token}` }
    });
    assert(delPantryRes.status === 200, 'DELETE /api/user-pantry/Eggs returns HTTP 200');

    const getPantryRes2 = await fetch(`${baseUrl}/user-pantry`, {
      headers: { 'Authorization': `Bearer ${user1Token}` }
    });
    const pantryData2: any = await getPantryRes2.json();
    assert(pantryData2.data.length === 3, 'Pantry now has 3 items after deletion');

    // -------------------------------------------------------------
    // Test 7: Saved Recipes CRUD & Duplicate Prevention
    // -------------------------------------------------------------
    console.log('\n[Test 7: Saved Recipes Persistence]');
    const saveRes = await fetch(`${baseUrl}/saved`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${user1Token}`
      },
      body: JSON.stringify({
        recipeId: 'rec_shakshuka',
        recipeTitle: 'Classic Shakshuka with Feta',
        recipeImage: 'https://images.unsplash.com/photo-1590412200988-a436970781fa',
        source: 'curated'
      })
    });
    assert(saveRes.status === 201, 'POST /api/saved returns HTTP 201');

    // Duplicate save should update/idempotently succeed without crashing
    const dupSaveRes = await fetch(`${baseUrl}/saved`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${user1Token}`
      },
      body: JSON.stringify({
        recipeId: 'rec_shakshuka',
        recipeTitle: 'Classic Shakshuka with Feta',
        source: 'curated'
      })
    });
    assert(dupSaveRes.status === 201, 'Duplicate save handled idempotently');

    const getSavedRes = await fetch(`${baseUrl}/saved`, {
      headers: { 'Authorization': `Bearer ${user1Token}` }
    });
    const savedData: any = await getSavedRes.json();
    assert(savedData.data.length === 1, 'Saved recipes list contains exactly 1 unique item');
    assert(savedData.data[0].recipeTitle === 'Classic Shakshuka with Feta', 'Saved recipe title matches');

    // Delete saved recipe
    const delSavedRes = await fetch(`${baseUrl}/saved/rec_shakshuka`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${user1Token}` }
    });
    assert(delSavedRes.status === 200, 'DELETE /api/saved/rec_shakshuka returns HTTP 200');

    // -------------------------------------------------------------
    // Test 8: Shopping List CRUD
    // -------------------------------------------------------------
    console.log('\n[Test 8: Shopping List Persistence]');
    const addShopRes = await fetch(`${baseUrl}/shopping-list`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${user1Token}`
      },
      body: JSON.stringify({
        name: 'Olive Oil',
        amount: '500ml',
        category: 'Pantry'
      })
    });
    assert(addShopRes.status === 201, 'POST /api/shopping-list returns HTTP 201');
    const shopItem: any = ((await addShopRes.json()) as any).data;

    // Toggle check
    const toggleRes = await fetch(`${baseUrl}/shopping-list/${shopItem.id}/toggle`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${user1Token}` }
    });
    assert(toggleRes.status === 200, 'PATCH /api/shopping-list/:id/toggle returns HTTP 200');
    const toggledItem: any = ((await toggleRes.json()) as any).data;
    assert(toggledItem.checked === true, 'Item checked state toggled to true');

    // Batch add missing ingredients
    const batchShopRes = await fetch(`${baseUrl}/shopping-list/batch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${user1Token}`
      },
      body: JSON.stringify({
        items: [
          { name: 'Fresh Basil', amount: '1 bunch', category: 'Produce' },
          { name: 'Parmesan', amount: '100g', category: 'Dairy' }
        ]
      })
    });
    assert(batchShopRes.status === 200, 'POST /api/shopping-list/batch returns HTTP 200');
    const listData: any = await batchShopRes.json();
    assert(listData.data.length === 3, 'Shopping list now has 3 items');

    // Clear completed
    const clearCompRes = await fetch(`${baseUrl}/shopping-list/completed`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${user1Token}` }
    });
    assert(clearCompRes.status === 200, 'DELETE /api/shopping-list/completed returns HTTP 200');

    const getShopRes2 = await fetch(`${baseUrl}/shopping-list`, {
      headers: { 'Authorization': `Bearer ${user1Token}` }
    });
    const listData2: any = await getShopRes2.json();
    assert(listData2.data.length === 2, 'Shopping list has 2 active items after clearing completed');

    // -------------------------------------------------------------
    // Test 9: Cooking History Persistence
    // -------------------------------------------------------------
    console.log('\n[Test 9: Cooking History Logging]');
    const addHistRes = await fetch(`${baseUrl}/history`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${user1Token}`
      },
      body: JSON.stringify({
        recipeId: 'rec_momo',
        recipeName: 'Authentic Steamed Himalayan Chicken Momo',
        recipeImage: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb',
        servings: 3,
        rating: 5
      })
    });
    assert(addHistRes.status === 201, 'POST /api/history returns HTTP 201');

    const getHistRes = await fetch(`${baseUrl}/history`, {
      headers: { 'Authorization': `Bearer ${user1Token}` }
    });
    const histData: any = await getHistRes.json();
    assert(histData.data.length === 1, 'Cooking history retrieved');
    assert(histData.data[0].recipeName === 'Authentic Steamed Himalayan Chicken Momo', 'History item matches');

    // -------------------------------------------------------------
    // Test 10: Strict Multi-Tenant Isolation
    // -------------------------------------------------------------
    console.log('\n[Test 10: Strict Multi-Tenant Isolation]');
    // Create User 2
    const signup2Res = await fetch(`${baseUrl}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Bob Smith',
        email: 'bob.smith@example.com',
        password: 'bobPassword123'
      })
    });
    const user2Token = ((await signup2Res.json()) as any).data.token;

    // User 2's pantry must be completely empty (User 1's items must NOT bleed over)
    const user2PantryRes = await fetch(`${baseUrl}/user-pantry`, {
      headers: { 'Authorization': `Bearer ${user2Token}` }
    });
    const user2Pantry: any = await user2PantryRes.json();
    assert(user2Pantry.data.length === 0, 'User 2 has 0 pantry items (strict tenant isolation)');

    // User 2's shopping list must be completely empty
    const user2ShopRes = await fetch(`${baseUrl}/shopping-list`, {
      headers: { 'Authorization': `Bearer ${user2Token}` }
    });
    const user2Shop: any = await user2ShopRes.json();
    assert(user2Shop.data.length === 0, 'User 2 has 0 shopping items (strict tenant isolation)');

    // User 2 adds their own distinct pantry item
    await fetch(`${baseUrl}/user-pantry`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${user2Token}`
      },
      body: JSON.stringify({ ingredient: 'Tofu' })
    });

    // Verify User 1 still has only their original 3 items and does NOT see Tofu
    const user1PantryAgain = await fetch(`${baseUrl}/user-pantry`, {
      headers: { 'Authorization': `Bearer ${user1Token}` }
    });
    const u1PantryData: any = await user1PantryAgain.json();
    assert(!u1PantryData.data.some((i: any) => i.ingredient === 'Tofu'), 'User 1 cannot see User 2 items');

  } finally {
    if (server) {
      (server as Server).close();
    }
    console.log('\n[Auth Test Server] Shut down successfully.');
    // Clean up test db
    if (fs.existsSync(TEST_DB_PATH)) {
      try { fs.unlinkSync(TEST_DB_PATH); } catch {}
    }
  }

  console.log('\n===================================================');
  console.log(`Results: ${passed} PASSED, ${failed} FAILED`);
  console.log('===================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runPersistentDataTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
