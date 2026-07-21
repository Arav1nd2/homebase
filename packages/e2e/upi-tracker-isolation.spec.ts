import { expect, test } from "@playwright/test";
import { signInAs } from "./upi-auth-helper";

// quickstart.md Scenario 7 (FR-018): a second allow-listed user has zero
// visibility into the first user's tags/transactions, including direct
// id-guessing against the API (expect 404, not 403, so existence is
// never leaked across users).
test("cross-user isolation holds on tags and transactions, including id-guessing (FR-018)", async ({
  browser,
}) => {
  const suffix = Date.now();

  const contextA = await browser.newContext();
  const pageA = await contextA.newPage();
  await signInAs(pageA, "test-upi-isolation-a@example.com");

  const tagRes = await pageA.request.post("/api/upi-tracker/tags", {
    data: { name: `Private ${suffix}`, color: "teal" },
  });
  const { data: tagA } = (await tagRes.json()) as { data: { id: string } };
  const txRes = await pageA.request.post("/api/upi-tracker/transactions", {
    data: {
      payeeVpa: `private-${suffix}@upi`,
      amountPaise: 100,
      origin: "manual",
      status: "success",
      occurredAt: "2026-07-01T00:00:00.000Z",
      tagIds: [tagA.id],
    },
  });
  const { data: txA } = (await txRes.json()) as { data: { id: string } };

  const contextB = await browser.newContext();
  const pageB = await contextB.newPage();
  await signInAs(pageB, "test-upi-isolation-b@example.com");

  const listRes = await pageB.request.get("/api/upi-tracker/transactions");
  const { data: listB } = (await listRes.json()) as { data: Array<{ id: string }> };
  expect(listB.some((tx) => tx.id === txA.id)).toBe(false);

  const tagsListRes = await pageB.request.get("/api/upi-tracker/tags");
  const { data: tagsB } = (await tagsListRes.json()) as { data: Array<{ id: string }> };
  expect(tagsB.some((t) => t.id === tagA.id)).toBe(false);

  const directTxPatch = await pageB.request.patch(`/api/upi-tracker/transactions/${txA.id}`, {
    data: { status: "failed" },
  });
  expect(directTxPatch.status()).toBe(404);

  const directTagPatch = await pageB.request.patch(`/api/upi-tracker/tags/${tagA.id}`, {
    data: { name: "Hijacked" },
  });
  expect(directTagPatch.status()).toBe(404);

  const directTagDelete = await pageB.request.delete(`/api/upi-tracker/tags/${tagA.id}`);
  expect(directTagDelete.status()).toBe(404);

  await contextA.close();
  await contextB.close();
});
