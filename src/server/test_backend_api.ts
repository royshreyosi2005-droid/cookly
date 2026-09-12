import { createApp } from './app.js';
import type { Server } from 'http';

async function runApiTests() {
  console.log('===================================================');
  console.log('       COOKLY BACKEND INTEGRATION TEST SUITE       ');
  console.log('===================================================');

  const app = createApp();
  const PORT = 5999;
  
  const server: Server = await new Promise((resolve) => {
    const s = app.listen(PORT, () => {
      console.log(`✓ Test Server listening on http://localhost:${PORT}`);
      resolve(s);
    });
  });

  const baseUrl = `http://localhost:${PORT}/api`;
  let failures = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`  ✓ ${testName}`);
    } else {
      console.error(`  ✗ FAILED: ${testName}`);
      failures++;
    }
  }

  try {
    // 1. Test GET /api/health
    console.log('\n[1. Testing GET /api/health]');
    const healthRes = await fetch(`${baseUrl}/health`);
    const healthData: any = await healthRes.json();
    assert(healthRes.status === 200, 'Health endpoint returns HTTP 200');
    assert(healthData.status === 'ok', 'Health status is "ok"');

    // 2. Test POST /api/recipes/search
    console.log('\n[2. Testing POST /api/recipes/search]');
    const searchRes = await fetch(`${baseUrl}/recipes/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: 'shakshuka' })
    });
    const searchData: any = await searchRes.json();
    assert(searchRes.status === 200, 'Search endpoint returns HTTP 200');
    assert(searchData.success === true, 'Search response success is true');
    assert(searchData.data.recipes.length >= 1, 'Search finds Shakshuka recipe');
    assert(searchData.data.recipes[0].name.includes('Shakshuka'), 'Recipe name matched');

    // 2b. Test Search Filter by Cuisine (Indian)
    const indianRes = await fetch(`${baseUrl}/recipes/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cuisine: 'Indian' })
    });
    const indianData: any = await indianRes.json();
    assert(indianData.data.recipes.length >= 2, 'Cuisine filter returns Indian recipes');

    // 3. Test GET /api/recipes/:id
    console.log('\n[3. Testing GET /api/recipes/:id]');
    const detailRes = await fetch(`${baseUrl}/recipes/rec_1`);
    const detailData: any = await detailRes.json();
    assert(detailRes.status === 200, 'Detail endpoint returns HTTP 200 for valid ID');
    assert(detailData.data.id === 'rec_1', 'Detail returned recipe ID rec_1');
    assert(detailData.data.ingredients.length > 0, 'Detail includes ingredients');
    assert(detailData.data.instructions.length > 0, 'Detail includes instructions');

    // 3b. Test 404 for invalid ID
    const notFoundRes = await fetch(`${baseUrl}/recipes/non_existent_id_999`);
    const notFoundData: any = await notFoundRes.json();
    assert(notFoundRes.status === 404, 'Detail endpoint returns HTTP 404 for missing ID');
    assert(notFoundData.success === false, 'Error response success is false');
    assert(notFoundData.error.code === 'NOT_FOUND', 'Error code is NOT_FOUND');

    // 4. Test POST /api/pantry/match
    console.log('\n[4. Testing POST /api/pantry/match]');
    const pantryRes = await fetch(`${baseUrl}/pantry/match`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ingredients: ['Eggs', 'Tomato', 'Onion', 'Garlic'],
        searchMode: 'best_match'
      })
    });
    const pantryData: any = await pantryRes.json();
    assert(pantryRes.status === 200, 'Pantry match endpoint returns HTTP 200');
    assert(pantryData.success === true, 'Pantry match success is true');
    assert(pantryData.data.recipes.length > 0, 'Pantry match returns candidate recipes');
    assert(typeof pantryData.data.recipes[0].matchScore === 'number', 'Match includes numeric matchScore');
    console.log(`     Top match: ${pantryData.data.recipes[0].recipe.name} (${pantryData.data.recipes[0].matchScore}%)`);

    // 5. Test POST /api/healthy/search
    console.log('\n[5. Testing POST /api/healthy/search]');
    const healthyRes = await fetch(`${baseUrl}/healthy/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        minProtein: 20
      })
    });
    const healthyData: any = await healthyRes.json();
    assert(healthyRes.status === 200, 'Healthy search returns HTTP 200');
    assert(healthyData.data.recipes.length > 0, 'High protein filter returns recipes');
    for (const r of healthyData.data.recipes) {
      assert((r.protein || 0) >= 20, `Recipe "${r.name}" has >= 20g protein (${r.protein}g)`);
    }

    // 6. Test POST /api/ai-chef
    console.log('\n[6. Testing POST /api/ai-chef]');
    const aiChefRes = await fetch(`${baseUrl}/ai-chef`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: 'I have ₹150 and 2 people, quick healthy dinner',
        budget: 150,
        peopleCount: 2,
        maxCookTimeMinutes: 30,
        foodPreference: 'Vegetarian',
        ingredients: ['Eggs', 'Potato']
      })
    });
    const aiChefData: any = await aiChefRes.json();
    assert(aiChefRes.status === 200, 'AI Chef endpoint returns HTTP 200');
    assert(aiChefData.data.suggestions.length > 0, 'AI Chef returns recommendations');
    assert(aiChefData.data.budgetSummary.totalBudget === 150, 'Budget summary parsed correctly');
    console.log(`     AI Chef Suggestion: "${aiChefData.data.suggestions[0].title}" (₹${aiChefData.data.suggestions[0].costPerPerson}/person)`);

    // 7. Test Validation Error on Invalid Payload
    console.log('\n[7. Testing Zod Validation Error handling]');
    const invalidRes = await fetch(`${baseUrl}/pantry/match`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ingredients: 'not-an-array' // should fail schema validation
      })
    });
    const invalidData: any = await invalidRes.json();
    assert(invalidRes.status === 400, 'Invalid payload triggers HTTP 400');
    assert(invalidData.success === false, 'Validation error success is false');
    assert(invalidData.error.code === 'VALIDATION_ERROR', 'Error code is VALIDATION_ERROR');

  } catch (err) {
    console.error('Test execution exception:', err);
    failures++;
  } finally {
    await new Promise<void>((resolve) => {
      server.close(() => {
        console.log('\n✓ Test Server shut down successfully.');
        resolve();
      });
    });
  }

  console.log('\n===================================================');
  if (failures === 0) {
    console.log('  ALL BACKEND INTEGRATION TESTS PASSED (100%)!');
  } else {
    console.error(`  TEST FAILED WITH ${failures} FAILURE(S)`);
    process.exit(1);
  }
  console.log('===================================================\n');
}

runApiTests();
