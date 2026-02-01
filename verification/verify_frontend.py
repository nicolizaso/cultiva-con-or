from playwright.sync_api import sync_playwright

def verify(page):
    try:
        page.goto("http://localhost:3000")
        page.wait_for_timeout(3000) # Wait for load
        page.screenshot(path="verification/home.png")
        print("Screenshot taken: home.png")
    except Exception as e:
        print(f"Error: {e}")
        page.screenshot(path="verification/error.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        verify(page)
        browser.close()
