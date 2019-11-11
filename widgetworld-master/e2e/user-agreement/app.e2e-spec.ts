import { browser, by, element, protractor, $$, ExpectedConditions, $ } from 'protractor';

describe('Terms and Conditions', () => {

  it('user agreed the terms and conditions', function() {

    browser.driver.getCurrentUrl().then(function(url) {
      if (/user-agreement/.test(url)) {
        const text =  element.all(by.className('button-primary')).first();
        text.click();
        browser.sleep(50000);
      }
    });
  });
});
