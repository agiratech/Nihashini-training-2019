import { AppPage } from './app.po';
import { browser, by, element} from 'protractor';

describe('login page', () => {
  const page = new AppPage();

  beforeEach(() => {
    page.navigateTo();
  });

  it('negative scenario of login credentials', function() {
    page.userEmail.sendKeys('nithin@intermx.com');
    page.userPass.sendKeys('Intermx@gira1');
    page.loginBtn.first().click();
    browser.sleep(2000);
    expect(element(by.css('.error-block-second')).getAttribute('style')).toBe('display: none;');
  });

/*it('positive scenario of login credentials with decline', function() {
    page.userEmail.sendKeys('nithin@intermx.com');
    page.userPass.sendKeys('Intermx@gira');
    page.loginBtn.first().click();
    browser.driver.wait(function() {
      browser.driver.getCurrentUrl().then(function(url) {
        if (/user-agreement/.test(url)) {
			const text =  element.all(by.className('geo-button-link')).first();
          	text.click();
          	browser.sleep(2000);
        }
      });
      });
  });*/

  it('positive scenario of login credentials with agree', function() {
    page.userEmail.sendKeys('nithin@intermx.com');
    page.userPass.sendKeys('Intermx@gira');
    page.loginBtn.first().click();
    browser.sleep(20000);
    browser.driver.getCurrentUrl().then(function(url) {
      if (/user-agreement/.test(url)) {
        const text =  element.all(by.className('waves-light')).first();
        text.click();
        browser.sleep(2000);
      }
    });
  });
});
