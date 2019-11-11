import { browser, by, element, protractor, $$, ExpectedConditions, $ } from 'protractor';

describe('logout the user', () => {

  it('logout the user', function(){
    browser.driver.getCurrentUrl().then(function(url) {
      browser.waitForAngularEnabled(false);
      if ((/explore/).test(url)) {
        browser.sleep(10000);
        const user_nav = element(by.xpath('//user-navigation/div/div/div/ul/li/a'));
        browser.actions().mouseMove(user_nav).perform();
        browser.actions().click(user_nav).perform();
        browser.sleep(1000);

        const logout = element(by.xpath('//user-navigation/div/div/div/ul/li/ul/li[3]/a'));
        browser.actions().mouseMove(logout).perform();
        browser.actions().click(logout).perform();
      }
    });
  });


});
