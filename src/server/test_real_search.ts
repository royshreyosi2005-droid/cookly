import { createApp } from './app.js';
import type { Server } from 'http';

const TEST_PORT = 5998;

async function runTests() {
  console.log('--- Starting Real Search & Provider Integration Test Suite ---');
  const app = createApp();
  let server: Server;

  await new Promise<void>((resolve) => {
    server = app.listen(TEST_PORT, () => {
      console.log(`[Test Server] Live on port ${TEST_PORT}`);
      resolve();
    });
  });

  const baseUrl = `http://localhost:${TEST_PORT}/api`;
  let failed = 0;
  let passed = 0;

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
    // 1. Healthcheck
    console.log('\n[Suite 1: Healthcheck]');
    const healthRes = await fetch(`${baseUrl}/health`);
    assert(healthRes.status === 200, 'GET /api/health returned 200');
    const healthData: any = await healthRes.json();
    assert(healthData.status === 'ok' || healthData.data?.status === 'ok', 'Status is "ok"');

    // 2. Real Search Queries
    const testQueries = [
      'biryani',
      'momo',
      'pasta',
      'paneer tikka',
      'chicken soup',
      'chocolate cake'
    ];

    console.log('\n[Suite 2: Real Provider Searches]');
    for (const query of testQueries) {
      console.log(`\n  Testing query: "${query}"`);
      const res = await fetch(`${baseUrl}/recipes/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, limit: 10 })
      });

      assert(res.status === 200, `POST /api/recipes/search for "${query}" returned 200`);
      const body: any = await res.json();
      assert(body.success === true, `Response success is true for "${query}"`);
      assert(Array.isArray(body.data?.recipes), `Recipes array returned for "${query}"`);

      const recipes = body.data?.recipes || [];
      console.log(`    Found ${recipes.length} recipes for "${query}"`);
      assert(recipes.length > 0, `At least 1 recipe returned for "${query}"`);

      if (recipes.length > 0) {
        const first = recipes[0];
        assert(!!first.id, `Recipe has valid ID: ${first.id}`);
        assert(!!first.name, `Recipe has non-empty name: "${first.name}"`);
        assert(first.image === null || typeof first.image === 'string', `Recipe image adheres to 1:1 rule: ${first.image ? 'Valid URL' : 'null'}`);
        assert(!!first.source, `Source is recorded: ${first.source}`);
        assert(Array.isArray(first.ingredients) && first.ingredients.length > 0, `Ingredients array populated (${first.ingredients.length} items)`);

        // Test Recipe Details lookup for this ID
        const detailRes = await fetch(`${baseUrl}/recipes/${first.id}`);
        assert(detailRes.status === 200, `GET /api/recipes/${first.id} returned 200`);
        const detailBody: any = await detailRes.json();
        assert(detailBody.success === true, `Detail lookup success is true for ${first.id}`);
        assert(detailBody.data?.id === first.id, `Detail ID matches search result ID`);
        assert(detailBody.data?.name === first.name, `Detail name matches search result name`);
        assert(detailBody.data?.image === first.image, `Detail image strictly matches search result image`);
      }
    }

    // 3. Pagination & Limit verification
    console.log('\n[Suite 3: Pagination Verification]');
    const page1Res = await fetch(`${baseUrl}/recipes/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: 'chicken', limit: 2, offset: 0 })
    });
    const page1Body: any = await page1Res.json();
    assert(page1Body.data?.recipes?.length === 2, 'Page 1 limit 2 returned exactly 2 recipes');

    const page2Res = await fetch(`${baseUrl}/recipes/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: 'chicken', limit: 2, offset: 2 })
    });
    const page2Body: any = await page2Res.json();
    assert(page2Body.data?.recipes?.length === 2, 'Page 2 limit 2 offset 2 returned 2 recipes');

    if (page1Body.data?.recipes?.length === 2 && page2Body.data?.recipes?.length === 2) {
      assert(page1Body.data.recipes[0].id !== page2Body.data.recipes[0].id, 'Page 1 and Page 2 recipes are distinct');
    }

    // 4. Unknown Recipe 404 test
    console.log('\n[Suite 4: 404 NotFound Handling]');
    const notFoundRes = await fetch(`${baseUrl}/recipes/nonexistent-unknown-id-12345`);
    assert(notFoundRes.status === 404, 'GET invalid ID returned 404');
    const notFoundBody: any = await notFoundRes.json();
    assert(notFoundBody.success === false, '404 response success is false');
    assert(notFoundBody.error?.code === 'NOT_FOUND', 'Error code is "NOT_FOUND"');

  } catch (err) {
    console.error('Test suite error:', err);
    failed++;
  } finally {
    server!.close();
    console.log(`\n========================================`);
    console.log(`Results: ${passed} PASSED, ${failed} FAILED`);
    console.log(`========================================`);
    if (failed > 0) {
      process.exit(1);
    }
  }
}

runTests();
