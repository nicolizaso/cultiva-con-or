from playwright.sync_api import sync_playwright
import time

def run():
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        try:
            print("Navigating to test page...")
            page.goto("http://localhost:3000/test-verification")

            print("Waiting for Agenda modal...")
            # If modal is open by default
            try:
                page.wait_for_selector("text=Agenda", timeout=5000)
            except:
                print("Modal not open by default, clicking open button...")
                page.click("text=Open Agenda Modal")
                page.wait_for_selector("text=Agenda", timeout=5000)

            time.sleep(2) # Animation

            # 1. Initial State
            print("Taking screenshot: agenda_all.png")
            page.screenshot(path="verification/agenda_all.png")

            # 2. Select Pending
            print("Selecting Pending...")
            selects = page.locator("select")
            status_select = selects.nth(1)
            status_select.select_option("pending")
            time.sleep(1)
            page.screenshot(path="verification/agenda_pending.png")

            # 3. Select Completed
            print("Selecting Completed...")
            status_select.select_option("completed")
            time.sleep(1)
            page.screenshot(path="verification/agenda_completed.png")

            # 4. Select Cycle 1
            print("Selecting Cycle 1...")
            cycle_select = selects.nth(0)
            cycle_select.select_option("1")
            time.sleep(1)
            page.screenshot(path="verification/agenda_cycle_1_completed.png")

        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/error.png")
        finally:
            browser.close()

if __name__ == "__main__":
    run()
