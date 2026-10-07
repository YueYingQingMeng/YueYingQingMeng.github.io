import { expect, test } from "@playwright/test";

/**
 * Shared assertion for the feature pages that follow the same shell contract:
 * `/games/`, `/projects/`, `/devices/`, `/skills/`, `/timeline/`.
 *
 * These pages render outside the Swup container, so arriving at one through the
 * persistent top bar has to sync three separate things: the container's
 * `data-current-page`, the nav item's `aria-current`, and the sidebar's page
 * filter. The five copies of that test differed only in the card selector and
 * the expected count.
 *
 * Cases whose assertions genuinely differ stay in their own spec — an earlier
 * survey found "直接加载时导航高亮" uses `a[data-nav-key=…]` on one page and
 * `[data-nav-key=…]` on another, which is an assertion-strength difference
 * rather than a copy-paste artefact.
 */

export interface PersistentShellSyncCase {
	/** Nav `pageKey`, also written to `data-current-page`. */
	key: string;
	/** Page the test starts on, to make the click a real Swup navigation. */
	fromPath: string;
	/** Path asserted after the click, e.g. `/games/`. */
	toPath: RegExp;
	/** Card class for this feature, e.g. `game-card`. */
	cardSelector: string;
	/** Expected number of cards after arriving. */
	cardCount: number;
}

/** Sidebar widgets every feature page is expected to show. */
const EXPECTED_WIDGETS = ["categories", "tags"];

export function registerPersistentShellSync(
	title: string,
	testCase: PersistentShellSyncCase,
): void {
	test(title, async ({ page }) => {
		await page.goto(testCase.fromPath, { waitUntil: "domcontentloaded" });
		await page.getByRole("button", { name: "More", exact: true }).click();
		await page.locator(`a[data-nav-key="${testCase.key}"]`).click();

		await expect(page).toHaveURL(testCase.toPath);
		await expect(page.locator("#swup-container")).toHaveAttribute(
			"data-current-page",
			testCase.key,
		);
		await expect(page.locator(`.${testCase.cardSelector}`)).toHaveCount(
			testCase.cardCount,
		);
		await expect(
			page.locator(`a[data-nav-key="${testCase.key}"]`),
		).toHaveAttribute("aria-current", "page");
		for (const widget of EXPECTED_WIDGETS) {
			await expect(
				page.locator(`widget-layout[data-id="${widget}"]`),
			).toBeVisible();
		}
	});
}
