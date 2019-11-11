import { AppPage } from './app.po';
import { browser, by, element, protractor } from 'protractor';

describe('Intermx App', () => {
  const page = new AppPage();

  beforeEach(() => {
    page.navigateTo();
  });

  it('market filter', function() {
    page.userEmail.sendKeys('nithin@intermx.com');
    page.userPass.sendKeys('Intermx@gira');
    page.loginBtn.first().click();
    browser.sleep(15000);
    browser.driver.getCurrentUrl().then(function(url) {
      console.log(url);
      if (/user-agreement/.test(url)) {
      const text =  element.all(by.className('waves-light')).first();
            text.click();
            browser.sleep(5000);
        }
    });

    browser.driver.getCurrentUrl().then(function(url) {
      if (/explore/.test(url)) {
        
        browser.sleep(20000).then(function() {
        var market  =  element(by.css('.explore-filter-first-block')).element(by.tagName('a'));
        
        market.click();
        expect(element(by.id('market_0')).getAttribute('value')).toBe('58260bea-039b-45f0-85a0-b0f4a6595326');
        
        var marketId = element(by.id('market-filter')).element(by.tagName('label'));
        
        browser.sleep(500);
        browser.actions().click(marketId).perform();
      
        browser.sleep(3000);
        var marketApply  =  element(by.css('.explore-filter-first-block')).element(by.buttonText('Apply'));
        browser.actions().click(marketApply).perform();
        browser.sleep(5000);

        var elements = element.all(by.tagName('app-explore-panel'));
        expect(elements.count()).toBeGreaterThanOrEqual(1);

        const mapviewDiv = element(by.xpath('//app-explore-panel[1]/div/div[2]/div[1]'));
        browser.actions().click(mapviewDiv).perform();
        browser.sleep(10000);

        const moreDetls  =  element(by.css('.open_inventory_card_btn'));
        browser.actions().click(moreDetls).perform();
        browser.sleep(5000);

        const pdfDownload  =  element(by.css('.download_us_pdf'));
        browser.actions().click(pdfDownload).perform();
        browser.sleep(5000);
        });
      
      browser.waitForAngularEnabled(false);
    }
 });

          
  });
});
