import { AppPage } from './app.po';
import { browser, by, element, protractor } from 'protractor';

describe('Intermx App', () => {
  const page = new AppPage();

  beforeEach(() => {
    page.navigateTo();
  });

  it('Map search', function() {
    /*page.userEmail.sendKeys('nithin@intermx.com');
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
    });*/

    browser.driver.getCurrentUrl().then(function(url) {
      if (/explore/.test(url)) {
        
      browser.sleep(20000).then(function() {
        
        const map = element(by.css('div.map-div'));
        browser.actions().doubleClick(map).perform();
        browser.actions().doubleClick(map).perform();
        browser.actions().doubleClick(map).perform();
        browser.actions().doubleClick(map).perform();
        browser.actions().doubleClick(map).perform();
        //browser.executeScript(colorFrameZoomIn);
        browser.sleep(5000);
        const mapsearch = element(by.css('.dynamic-map-view-div')).element(by.tagName('label'));
        browser.actions().mouseMove(mapsearch).click().perform();
        
        browser.sleep(15000);
        
        const mapcontent=  element(by.xpath('//app-explore-panel[1]/div/div[2]/div[1]'));
        //const mapviewDiv = element(by.xpath('//app-explore-panel[1]/div/div[2]/div[1]'));
        browser.actions().mouseMove(mapcontent).click().perform();
        
        browser.sleep(5000);
        
        const popupclose = element(by.css('.mapboxgl-popup-close-button'));
        browser.actions().mouseMove(popupclose).click().perform();
        
        browser.sleep(10000);
   });
        browser.waitForAngularEnabled(false);
    }
 });   
 });
});
