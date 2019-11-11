import { AppPage } from './app.po';
import { browser, by, element, protractor } from 'protractor';

describe('Login into the application', () => {
  const page = new AppPage();

  beforeEach(() => {
    browser.waitForAngularEnabled(false);
    page.navigateTo();

  });

  it('negative scenario of login credentials', function() {
    browser.waitForAngularEnabled(true);
    browser.sleep(10000);
    page.userEmail.sendKeys('cobra_jaggu@intermx.com');
    page.userPass.sendKeys('Intermx@gira1');
    page.loginBtn.first().click();
    browser.sleep(20000);
    expect(element(by.css('.error-block-second')).getAttribute('style')).toContain('display: flex;');
  });

 /* it('positive scenario of login credentials with decline', function() {
    browser.waitForAngularEnabled(true);
    browser.sleep(10000);
    page.userEmail.sendKeys('cobra_jaggu@intermx.com');
    page.userPass.sendKeys('Agira@jaggu!');
    page.loginBtn.first().click();
    browser.sleep(20000);
    browser.driver.getCurrentUrl().then(function(url) {
      if (/user-agreement/.test(url)) {
          const text =  element.all(by.className('button-primary-link')).first();
          text.click();
          browser.sleep(5000);
      }
    });
  });*/
  it('positive scenario of login credentials', function() {
    browser.waitForAngularEnabled(true);
    browser.sleep(10000);
    page.userEmail.sendKeys('cobra_ken@intermx.com');
    page.userPass.sendKeys('Agira@123');
    page.loginBtn.first().click();
    browser.sleep(50000);
  });
});
