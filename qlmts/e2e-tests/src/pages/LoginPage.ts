import { By } from 'selenium-webdriver';
import { BasePage } from './BasePage';
import { WebDriverHelper } from '../helpers/WebDriverHelper';

export class LoginPage extends BasePage {
  // Locators
  private emailInput = By.id('email');
  private passwordInput = By.id('password');
  private loginButton = By.id('login-button');
  private rememberMeCheckbox = By.id('remember-me');
  private forgotPasswordLink = By.id('forgot-password');
  private errorAlert = By.className('alert-danger');
  private successAlert = By.className('alert-success');

  constructor(driver: WebDriverHelper) {
    super(driver, '/login');
  }

  async login(email: string, password: string, rememberMe: boolean = false): Promise<void> {
    await this.driver.type(this.emailInput, email);
    await this.driver.type(this.passwordInput, password);
    
    if (rememberMe) {
      await this.driver.click(this.rememberMeCheckbox);
    }
    
    await this.driver.click(this.loginButton);
  }

  async getEmailValidationError(): Promise<string | null> {
    try {
      const emailField = await this.driver.findElement(this.emailInput);
      const parentDiv = await emailField.findElement(By.xpath('..'));
      const errorSpan = await parentDiv.findElement(By.className('text-danger-500'));
      return await errorSpan.getText();
    } catch {
      return null;
    }
  }

  async getPasswordValidationError(): Promise<string | null> {
    try {
      const passwordField = await this.driver.findElement(this.passwordInput);
      const parentDiv = await passwordField.findElement(By.xpath('..'));
      const errorSpan = await parentDiv.findElement(By.className('text-danger-500'));
      return await errorSpan.getText();
    } catch {
      return null;
    }
  }

  async isLoginButtonEnabled(): Promise<boolean> {
    const button = await this.driver.findElement(this.loginButton);
    return await button.isEnabled();
  }

  async clickForgotPassword(): Promise<void> {
    await this.driver.click(this.forgotPasswordLink);
  }

  async waitForDashboardRedirect(): Promise<void> {
    await this.driver.waitForUrl('/dashboard', 10000);
  }

  async getLoginError(): Promise<string | null> {
    try {
      return await this.driver.getText(this.errorAlert);
    } catch {
      return null;
    }
  }
}