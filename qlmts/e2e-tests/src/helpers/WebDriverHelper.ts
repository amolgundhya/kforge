import { Builder, By, Key, until, WebDriver, WebElement } from 'selenium-webdriver';
import { Options as ChromeOptions } from 'selenium-webdriver/chrome';
import { Options as FirefoxOptions } from 'selenium-webdriver/firefox';

export class WebDriverHelper {
  private driver: WebDriver | null = null;
  private baseUrl: string;
  private browser: string;
  private headless: boolean;

  constructor(
    baseUrl: string = process.env.BASE_URL || 'http://localhost:3000',
    browser: string = process.env.BROWSER || 'chrome',
    headless: boolean = process.env.HEADLESS === 'true'
  ) {
    this.baseUrl = baseUrl;
    this.browser = browser;
    this.headless = headless;
  }

  async initialize(): Promise<void> {
    const builder = new Builder();

    if (this.browser === 'chrome') {
      const options = new ChromeOptions();
      if (this.headless) {
        options.addArguments('--headless');
      }
      options.addArguments('--disable-gpu');
      options.addArguments('--no-sandbox');
      options.addArguments('--disable-dev-shm-usage');
      options.addArguments('--window-size=1920,1080');
      
      this.driver = await builder
        .forBrowser('chrome')
        .setChromeOptions(options)
        .build();
    } else if (this.browser === 'firefox') {
      const options = new FirefoxOptions();
      if (this.headless) {
        options.addArguments('-headless');
      }
      
      this.driver = await builder
        .forBrowser('firefox')
        .setFirefoxOptions(options)
        .build();
    } else {
      throw new Error(`Unsupported browser: ${this.browser}`);
    }

    await this.driver.manage().setTimeouts({ implicit: 10000 });
    await this.driver.manage().window().maximize();
  }

  async quit(): Promise<void> {
    if (this.driver) {
      await this.driver.quit();
      this.driver = null;
    }
  }

  async navigateTo(path: string = '/'): Promise<void> {
    if (!this.driver) throw new Error('WebDriver not initialized');
    await this.driver.get(`${this.baseUrl}${path}`);
  }

  async findElement(locator: By): Promise<WebElement> {
    if (!this.driver) throw new Error('WebDriver not initialized');
    return await this.driver.findElement(locator);
  }

  async findElements(locator: By): Promise<WebElement[]> {
    if (!this.driver) throw new Error('WebDriver not initialized');
    return await this.driver.findElements(locator);
  }

  async waitForElement(locator: By, timeout: number = 10000): Promise<WebElement> {
    if (!this.driver) throw new Error('WebDriver not initialized');
    const element = await this.driver.wait(
      until.elementLocated(locator),
      timeout,
      `Element not found: ${locator}`
    );
    await this.driver.wait(
      until.elementIsVisible(element),
      timeout,
      `Element not visible: ${locator}`
    );
    return element;
  }

  async click(locator: By): Promise<void> {
    const element = await this.waitForElement(locator);
    await element.click();
  }

  async type(locator: By, text: string): Promise<void> {
    const element = await this.waitForElement(locator);
    await element.clear();
    await element.sendKeys(text);
  }

  async getText(locator: By): Promise<string> {
    const element = await this.waitForElement(locator);
    return await element.getText();
  }

  async getValue(locator: By): Promise<string> {
    const element = await this.waitForElement(locator);
    return await element.getAttribute('value');
  }

  async isDisplayed(locator: By): Promise<boolean> {
    try {
      const element = await this.findElement(locator);
      return await element.isDisplayed();
    } catch {
      return false;
    }
  }

  async selectDropdown(locator: By, value: string): Promise<void> {
    const element = await this.waitForElement(locator);
    await element.click();
    const option = await this.waitForElement(By.xpath(`//option[@value='${value}']`));
    await option.click();
  }

  async uploadFile(locator: By, filePath: string): Promise<void> {
    const element = await this.findElement(locator);
    await element.sendKeys(filePath);
  }

  async takeScreenshot(): Promise<string> {
    if (!this.driver) throw new Error('WebDriver not initialized');
    return await this.driver.takeScreenshot();
  }

  async executeScript(script: string, ...args: any[]): Promise<any> {
    if (!this.driver) throw new Error('WebDriver not initialized');
    return await this.driver.executeScript(script, ...args);
  }

  async waitForUrl(urlPattern: string | RegExp, timeout: number = 10000): Promise<void> {
    if (!this.driver) throw new Error('WebDriver not initialized');
    await this.driver.wait(
      async () => {
        const currentUrl = await this.driver!.getCurrentUrl();
        if (typeof urlPattern === 'string') {
          return currentUrl.includes(urlPattern);
        } else {
          return urlPattern.test(currentUrl);
        }
      },
      timeout,
      `URL pattern not matched: ${urlPattern}`
    );
  }

  getDriver(): WebDriver {
    if (!this.driver) throw new Error('WebDriver not initialized');
    return this.driver;
  }
}