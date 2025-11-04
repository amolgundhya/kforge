import { By } from 'selenium-webdriver';
import { WebDriverHelper } from '../helpers/WebDriverHelper';

export abstract class BasePage {
  protected driver: WebDriverHelper;
  protected url: string;

  constructor(driver: WebDriverHelper, url: string) {
    this.driver = driver;
    this.url = url;
  }

  async navigate(): Promise<void> {
    await this.driver.navigateTo(this.url);
  }

  async getTitle(): Promise<string> {
    const titleElement = await this.driver.findElement(By.tagName('title'));
    return await titleElement.getAttribute('innerText');
  }

  async waitForPageLoad(): Promise<void> {
    await this.driver.executeScript('return document.readyState').then(async (readyState) => {
      if (readyState !== 'complete') {
        await new Promise(resolve => setTimeout(resolve, 1000));
        await this.waitForPageLoad();
      }
    });
  }

  async isElementPresent(locator: By): Promise<boolean> {
    return await this.driver.isDisplayed(locator);
  }

  async getErrorMessage(): Promise<string | null> {
    try {
      return await this.driver.getText(By.className('error-message'));
    } catch {
      return null;
    }
  }

  async getSuccessMessage(): Promise<string | null> {
    try {
      return await this.driver.getText(By.className('success-message'));
    } catch {
      return null;
    }
  }
}