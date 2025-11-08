from playwright.sync_api import sync_playwright
import sys

def validate_auth():
    """Validate authentication page"""
    url = "https://streetcredrx1.fly.dev/auth"

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        print(f"Navigating to {url}...")
        try:
            # Navigate to auth page
            response = page.goto(url, wait_until='networkidle', timeout=30000)

            if response.status != 200:
                print(f"[ERROR] Received HTTP {response.status}")
                browser.close()
                return False

            print(f"[PASS] Auth page loaded with status {response.status}")

            # Wait for page to be fully loaded
            page.wait_for_load_state('networkidle')

            # Take screenshot
            page.screenshot(path="auth_validation.png", full_page=True)
            print("[PASS] Screenshot saved to auth_validation.png")

            # Check for form elements
            email_input = page.locator('input[type="email"]')
            password_input = page.locator('input[type="password"]')
            signin_button = page.locator('button[type="submit"]')

            if email_input.count() > 0:
                print("[PASS] Email input found")
            else:
                print("[ERROR] Email input not found")
                browser.close()
                return False

            if password_input.count() > 0:
                print("[PASS] Password input found")
            else:
                print("[ERROR] Password input not found")
                browser.close()
                return False

            if signin_button.count() > 0:
                print("[PASS] Sign in button found")
            else:
                print("[ERROR] Sign in button not found")
                browser.close()
                return False

            # Check for console errors
            console_messages = []
            page.on('console', lambda msg: console_messages.append(msg))
            page.reload(wait_until='networkidle')

            errors = [msg for msg in console_messages if msg.type == 'error']
            if errors:
                print(f"[WARN] {len(errors)} console errors:")
                for error in errors[:5]:
                    print(f"  - {error.text}")
            else:
                print("[PASS] No console errors")

            browser.close()
            print("\n" + "="*50)
            print("AUTH PAGE VALIDATION PASSED")
            print("="*50)
            return True

        except Exception as e:
            print(f"[ERROR] {str(e)}")
            browser.close()
            return False

def validate_site():
    """Validate that the deployed site renders correctly"""

    url = "https://streetcredrx1.fly.dev/"

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        print(f"Navigating to {url}...")
        try:
            # Navigate to the site
            response = page.goto(url, wait_until='networkidle', timeout=30000)

            if response.status != 200:
                print(f"[ERROR] Received HTTP {response.status}")
                browser.close()
                return False

            print(f"[PASS] Page loaded with status {response.status}")

            # Wait for the page to be fully loaded
            page.wait_for_load_state('networkidle')
            print("[PASS] Page reached networkidle state")

            # Take a screenshot
            screenshot_path = "site_validation.png"
            page.screenshot(path=screenshot_path, full_page=True)
            print(f"[PASS] Screenshot saved to {screenshot_path}")

            # Get page title
            title = page.title()
            print(f"[PASS] Page title: {title}")

            # Check for common React app indicators
            html_content = page.content()

            # Verify the page has content
            if len(html_content) < 100:
                print("[ERROR] Page appears to be empty or too small")
                browser.close()
                return False

            print(f"[PASS] Page has content ({len(html_content)} bytes)")

            # Check for the root div
            root_div = page.locator('#root')
            if root_div.count() > 0:
                print("[PASS] React root element found")
            else:
                print("[WARN] React root element not found")

            # Check for any visible text content
            body_text = page.locator('body').inner_text()
            if body_text.strip():
                print(f"[PASS] Page has visible text content ({len(body_text)} characters)")
            else:
                print("[WARN] No visible text content found")

            # Check console logs for errors
            console_messages = []
            page.on('console', lambda msg: console_messages.append(msg))

            # Reload to capture console logs
            page.reload(wait_until='networkidle')

            errors = [msg for msg in console_messages if msg.type == 'error']
            if errors:
                print(f"[WARN] {len(errors)} console errors found:")
                for error in errors[:5]:  # Show first 5 errors
                    print(f"  - {error.text}")
            else:
                print("[PASS] No console errors detected")

            browser.close()

            print("\n" + "="*50)
            print("SITE VALIDATION PASSED")
            print("="*50)
            return True

        except Exception as e:
            print(f"[ERROR] Error during validation: {str(e)}")
            browser.close()
            return False

if __name__ == "__main__":
    print("="*50)
    print("VALIDATING AUTH PAGE")
    print("="*50 + "\n")
    auth_success = validate_auth()

    print("\n" + "="*50)
    print("VALIDATING HOME PAGE")
    print("="*50 + "\n")
    site_success = validate_site()

    overall_success = auth_success and site_success
    sys.exit(0 if overall_success else 1)
