import time
from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    try:
        # Navigate to the test verification page
        print("Navigating to /test-verification...")
        page.goto("http://localhost:3000/test-verification", timeout=60000)

        # Check if we are on the right page
        if page.locator("text=Verification Page").count() == 0:
            print("Did not land on verification page. Current URL:", page.url)
            # Take a screenshot to debug
            page.screenshot(path="/home/jules/verification/debug_nav.png")

        # Wait for timeline content
        print("Waiting for timeline...")
        page.wait_for_selector("text=Riego Pendiente", timeout=10000)

        # Verify first pending task is visible
        if page.locator("text=Riego Pendiente").is_visible():
            print("First pending task is visible.")

        # Verify second pending task is HIDDEN (since accordion is collapsed)
        # Note: Depending on implementation, it might be in DOM but hidden via CSS or not in DOM.
        # My implementation removes it from DOM via slice.
        if page.locator("text=Fertilizante Futuro").count() == 0:
             print("Future task is initially not rendered (correct).")
        else:
             print("Future task is RENDERED (incorrect?). Check visibility.")

        # Click accordion to show all
        print("Expanding accordion...")
        # Button text logic: "Mostrar {hiddenCount} tarea{s} más"
        # hiddenCount = 1 -> "Mostrar 1 tarea más"
        page.click("text=Mostrar 1 tarea más")

        # Verify second pending task is now visible
        time.sleep(1) # wait for render
        if page.locator("text=Fertilizante Futuro").is_visible():
             print("Future task is now visible.")

        # Verify history items
        if page.locator("text=Foto de Ciclo").is_visible():
             print("History image item visible.")

        # Take screenshot
        print("Taking screenshot...")
        page.screenshot(path="/home/jules/verification/timeline_verified.png", full_page=True)
        print("Screenshot saved.")

    except Exception as e:
        print(f"Error: {e}")
        page.screenshot(path="/home/jules/verification/error.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
