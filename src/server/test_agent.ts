import { createApp } from './app.js';
import type { Server } from 'http';

const TEST_PORT = 5997;

async function runAgentTests() {
  console.log('===================================================');
  console.log('       COOKLY CENTRAL AI AGENT TEST SUITE          ');
  console.log('===================================================');

  const app = createApp();
  let server: Server;

  await new Promise<void>((resolve) => {
    server = app.listen(TEST_PORT, () => {
      console.log(`[Agent Test Server] Listening on http://localhost:${TEST_PORT}\n`);
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
    // Scenario 1: GENERAL SEARCH ("biryani")
    // -------------------------------------------------------------
    console.log('[Scenario 1: General Discovery - "biryani"]');
    const res1 = await fetch(`${baseUrl}/agent/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: 'biryani' })
    });
    assert(res1.status === 200, 'HTTP 200 returned');
    const data1: any = await res1.json();
    assert(data1.success === true, 'Success is true');
    assert(data1.data.intent === 'GENERAL_SEARCH', `Intent is GENERAL_SEARCH (got ${data1.data.intent})`);
    assert(data1.data.recipes.length > 0, `Returned ${data1.data.recipes.length} biryani recipes`);
    const biryaniRecipe = data1.data.recipes[0];
    assert(biryaniRecipe.name.toLowerCase().includes('biryani'), `Top recipe is biryani: "${biryaniRecipe.name}"`);
    assert(biryaniRecipe.image === null || typeof biryaniRecipe.image === 'string', 'Image follows 1:1 rule');

    // -------------------------------------------------------------
    // Scenario 2: PANTRY MATCH ("I have eggs, potato and onion")
    // -------------------------------------------------------------
    console.log('\n[Scenario 2: Pantry Match - "I have eggs, potato and onion"]');
    const res2 = await fetch(`${baseUrl}/agent/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: 'I have eggs, potato and onion' })
    });
    assert(res2.status === 200, 'HTTP 200 returned');
    const data2: any = await res2.json();
    assert(data2.data.intent === 'PANTRY_MATCH', `Intent is PANTRY_MATCH (got ${data2.data.intent})`);
    assert(data2.data.interpretedRequest.constraints.includedIngredients.length >= 3, 'Extracted >=3 ingredients');
    assert(data2.data.recipes.length > 0, `Returned ${data2.data.recipes.length} matched recipes`);
    const topPantry = data2.data.recipes[0];
    assert(typeof topPantry.matchScore === 'number' && topPantry.matchScore > 0, `Match score calculated: ${topPantry.matchScore}%`);
    assert(Array.isArray(topPantry.matchedIngredients) && topPantry.matchedIngredients.length > 0, 'Matched ingredients listed');
    assert(Array.isArray(topPantry.missingIngredients), 'Missing ingredients listed');
    console.log(`     Top Match: "${topPantry.name}" (${topPantry.matchScore}% match, Missing: ${topPantry.missingIngredients?.join(', ') || 'None'})`);

    // -------------------------------------------------------------
    // Scenario 3: HEALTHY SEARCH ("high protein chicken dinner")
    // -------------------------------------------------------------
    console.log('\n[Scenario 3: Healthy Search - "high protein chicken dinner"]');
    const res3 = await fetch(`${baseUrl}/agent/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: 'high protein chicken dinner' })
    });
    assert(res3.status === 200, 'HTTP 200 returned');
    const data3: any = await res3.json();
    assert(data3.data.intent === 'HEALTHY_SEARCH', `Intent is HEALTHY_SEARCH (got ${data3.data.intent})`);
    assert(data3.data.interpretedRequest.constraints.minProtein === 20, 'Extracted minProtein constraint (20g)');
    assert(data3.data.interpretedRequest.constraints.mealType === 'Dinner', 'Extracted mealType (Dinner)');
    assert(data3.data.recipes.length > 0, `Returned ${data3.data.recipes.length} healthy recipes`);
    for (const r of data3.data.recipes) {
      assert((r.protein || 0) >= 20, `Recipe "${r.name}" has >= 20g protein (${r.protein}g)`);
    }

    // -------------------------------------------------------------
    // Scenario 4: AI CHEF ("I have ₹150, 3 people, eggs and potatoes, healthy, under 30 minutes")
    // -------------------------------------------------------------
    console.log('\n[Scenario 4: AI Chef - "I have ₹150, 3 people, eggs and potatoes, healthy, under 30 minutes"]');
    const res4 = await fetch(`${baseUrl}/agent/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: 'I have ₹150, 3 people, eggs and potatoes, healthy, under 30 minutes' })
    });
    assert(res4.status === 200, 'HTTP 200 returned');
    const data4: any = await res4.json();
    assert(data4.data.intent === 'AI_CHEF', `Intent is AI_CHEF (got ${data4.data.intent})`);
    assert(data4.data.interpretedRequest.constraints.budget === 150, 'Extracted budget = ₹150');
    assert(data4.data.interpretedRequest.constraints.servings === 3, 'Extracted servings = 3 people');
    assert(data4.data.interpretedRequest.constraints.maxCookingTime === 30, 'Extracted maxCookingTime = 30 mins');
    assert(data4.data.interpretedRequest.constraints.isHealthy === true, 'Extracted isHealthy = true');
    assert(Array.isArray(data4.data.aiChefSuggestions) && data4.data.aiChefSuggestions.length > 0, 'Generated AI Chef suggestions');
    assert(data4.data.aiChefSummary !== undefined, 'Generated AI Chef summary');
    assert(data4.data.aiChefSummary.budget === 150, 'Summary budget is 150');
    assert(data4.data.aiChefSummary.estimatedCostNote.includes('₹50/person'), 'Calculated ₹50/person cost note');
    console.log(`     Summary: ${data4.data.aiChefSummary.estimatedCostNote}`);

    // -------------------------------------------------------------
    // Scenario 5: VEGETARIAN ("quick vegetarian Indian dinner")
    // -------------------------------------------------------------
    console.log('\n[Scenario 5: Vegetarian & Cuisine - "quick vegetarian Indian dinner"]');
    const res5 = await fetch(`${baseUrl}/agent/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: 'quick vegetarian Indian dinner' })
    });
    assert(res5.status === 200, 'HTTP 200 returned');
    const data5: any = await res5.json();
    assert(data5.data.interpretedRequest.constraints.cuisine === 'Indian', 'Extracted cuisine = Indian');
    assert(data5.data.interpretedRequest.constraints.dietaryTags.includes('Vegetarian'), 'Extracted Vegetarian dietary tag');
    assert(data5.data.interpretedRequest.constraints.maxCookingTime !== undefined && data5.data.interpretedRequest.constraints.maxCookingTime <= 30, 'Extracted quick cooking time');
    assert(data5.data.recipes.length > 0, `Returned ${data5.data.recipes.length} vegetarian Indian recipes`);
    for (const r of data5.data.recipes) {
      assert(r.cuisine?.toLowerCase() === 'indian', `Cuisine is Indian: "${r.name}"`);
      const hasMeat = r.ingredients.some((i: any) => /chicken|beef|meat|pork|mutton|fish/i.test(i.name));
      assert(!hasMeat, `Recipe contains no meat ingredients: "${r.name}"`);
    }

    // -------------------------------------------------------------
    // Scenario 6: CONSTRAINT ("pasta without dairy")
    // -------------------------------------------------------------
    console.log('\n[Scenario 6: Exclusion Constraint - "pasta without dairy"]');
    const res6 = await fetch(`${baseUrl}/agent/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: 'pasta without dairy' })
    });
    assert(res6.status === 200, 'HTTP 200 returned');
    const data6: any = await res6.json();
    assert(data6.data.interpretedRequest.constraints.excludedIngredients.length > 0, 'Extracted dairy exclusions');
    assert(data6.data.recipes.length > 0, `Returned ${data6.data.recipes.length} dairy-free pasta recipes`);
    for (const r of data6.data.recipes) {
      const hasDairy = r.ingredients.some((i: any) => /milk|cheese|butter|cream|dairy|parmesan|mozzarella/i.test(i.name));
      assert(!hasDairy, `Dairy strictly excluded from "${r.name}"`);
    }

  } catch (err) {
    console.error('Agent test suite execution error:', err);
    failed++;
  } finally {
    await new Promise<void>((resolve) => {
      server.close(() => {
        console.log('\n✓ Agent Test Server shut down successfully.');
        resolve();
      });
    });
    console.log(`\n===================================================`);
    console.log(`Results: ${passed} PASSED, ${failed} FAILED`);
    console.log(`===================================================`);
    if (failed > 0) {
      process.exit(1);
    }
  }
}

runAgentTests();
