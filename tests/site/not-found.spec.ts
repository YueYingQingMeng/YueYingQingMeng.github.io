import { expect, test } from "@playwright/test";

async function expectNotFoundShell(page: import("@playwright/test").Page) {
	await expect(page.locator("#swup-container")).toHaveAttribute(
		"data-current-page",
		"notFound",
	);
	await expect(page.locator("#swup-container h1")).toHaveText(
		"This page wandered off",
	);
	// The sidebar renders outside the Swup container, so on client-side
	// navigation its `hidden` markers are applied by a pass bound to Swup's
	// hooks. That binding used to race `window.swup` becoming available and
	// silently lose, leaving the sidebar at its SSR visibility; see
	// `SideBar.astro`. Direct loads get the marker from SSR immediately.
	await expect(page.locator('[data-sidebar-pages="home"]').first()).toHaveClass(
		/hidden/,
	);
}

test.describe("404 route", () => {
	test("uses its own shell state on direct load and Swup navigation", async ({
		page,
	}) => {
		await page.goto("/404/", { waitUntil: "domcontentloaded" });
		await expectNotFoundShell(page);

		await page.goto("/", { waitUntil: "domcontentloaded" });
		await page.waitForFunction(() => Boolean(window.swup?.hooks));
		await page.evaluate(() => window.swup?.navigate("/404/"));
		await page.waitForURL("**/404/");
		await expectNotFoundShell(page);
	});
});
