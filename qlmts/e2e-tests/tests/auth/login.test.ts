import { WebDriverHelper } from '../../src/helpers/WebDriverHelper';
import { LoginPage } from '../../src/pages/LoginPage';

describe('Login Tests', () => {
  let driver: WebDriverHelper;
  let loginPage: LoginPage;

  beforeAll(async () => {
    driver = new WebDriverHelper();
    await driver.initialize();
    loginPage = new LoginPage(driver);
  });

  afterAll(async () => {
    await driver.quit();
  });

  beforeEach(async () => {
    await loginPage.navigate();
  });

  describe('Login Form Validation', () => {
    it('should show validation error for empty email', async () => {
      await loginPage.login('', 'password123');
      const error = await loginPage.getEmailValidationError();
      expect(error).toContain('Email is required');
    });

    it('should show validation error for invalid email format', async () => {
      await loginPage.login('invalid-email', 'password123');
      const error = await loginPage.getEmailValidationError();
      expect(error).toContain('Valid email required');
    });

    it('should show validation error for empty password', async () => {
      await loginPage.login('test@example.com', '');
      const error = await loginPage.getPasswordValidationError();
      expect(error).toContain('Password is required');
    });

    it('should show validation error for short password', async () => {
      await loginPage.login('test@example.com', '123');
      const error = await loginPage.getPasswordValidationError();
      expect(error).toContain('Password must be at least 8 characters');
    });
  });

  describe('Login Functionality', () => {
    it('should login successfully with valid credentials', async () => {
      await loginPage.login('admin@qlmts.com', 'Admin@123');
      await loginPage.waitForDashboardRedirect();
      
      const currentUrl = await driver.getDriver().getCurrentUrl();
      expect(currentUrl).toContain('/dashboard');
    });

    it('should show error message for invalid credentials', async () => {
      await loginPage.login('wrong@email.com', 'wrongpassword');
      const error = await loginPage.getLoginError();
      expect(error).toContain('Invalid email or password');
    });

    it('should remember user when remember me is checked', async () => {
      await loginPage.login('admin@qlmts.com', 'Admin@123', true);
      await loginPage.waitForDashboardRedirect();
      
      // Check if remember me cookie is set
      const cookies = await driver.getDriver().manage().getCookies();
      const rememberCookie = cookies.find(c => c.name === 'remember_token');
      expect(rememberCookie).toBeDefined();
    });

    it('should navigate to forgot password page', async () => {
      await loginPage.clickForgotPassword();
      await driver.waitForUrl('/forgot-password');
      
      const currentUrl = await driver.getDriver().getCurrentUrl();
      expect(currentUrl).toContain('/forgot-password');
    });
  });

  describe('Login Security', () => {
    it('should rate limit after multiple failed attempts', async () => {
      // Attempt login 5 times with wrong credentials
      for (let i = 0; i < 5; i++) {
        await loginPage.login('test@example.com', 'wrongpassword');
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      // 6th attempt should be rate limited
      await loginPage.login('test@example.com', 'wrongpassword');
      const error = await loginPage.getLoginError();
      expect(error).toContain('Too many login attempts');
    });

    it('should sanitize XSS attempts in email field', async () => {
      const xssPayload = '<script>alert("XSS")</script>@example.com';
      await loginPage.login(xssPayload, 'password123');
      
      // Check that script is not executed
      const alerts = await driver.getDriver().switchTo().alert().then(
        () => true,
        () => false
      );
      expect(alerts).toBe(false);
    });
  });
});