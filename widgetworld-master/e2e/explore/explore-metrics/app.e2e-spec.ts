import { browser, by, element, protractor, $ } from 'protractor';

describe('Explore Metrics', () => {


  it('inventory list', function() {

    browser.driver.getCurrentUrl().then(function(url) {
      if (/explore/.test(url)) {
        browser.waitForAngularEnabled(false);
        browser.sleep(20000).then(function() {
          // const market  =  element(by.css('.explore-filter-first-block')).element(by.tagName('a'));
          // market.click();
          // expect(element(by.id('market_0')).getAttribute('value')).toBe('58260bea-039b-45f0-85a0-b0f4a6595326');
          // var marketId = element(by.id('market-filter')).element(by.tagName('label'));
          // browser.sleep(500);
          // browser.actions().click(marketId).perform();
          // browser.sleep(3000);
          // var marketApply  =  element(by.css('.explore-filter-first-block')).element(by.buttonText('Apply'));
          // browser.actions().click(marketApply).perform();
          // browser.sleep(5000);

          // var elements = element.all(by.tagName('app-explore-panel'));
          // expect(elements.count()).toBeGreaterThanOrEqual(1);

          const mapviewDiv = element(by.xpath('//app-explore-panel[1]/div/div[2]/div[1]'));
          browser.actions().click(mapviewDiv).perform();
          browser.sleep(10000);

          //expect(element(by.css('.oppTitle')).getText()).toBe('LAMAR');

          const moreDetls  =  element(by.css('.open_inventory_card_btn'));
          browser.actions().click(moreDetls).perform();
          browser.sleep(5000);

          const pdfDownload  =  element(by.css('.download_us_pdf'));
          browser.actions().click(pdfDownload).perform();
          browser.sleep(10000);
          const map_box_popup_close_btn = $('button.mapboxgl-popup-close-button');
          browser.actions().mouseMove(map_box_popup_close_btn).perform();
          map_box_popup_close_btn.click();
          //browser.sleep(10000);
          //const map_zoom_out = $('.map-zoom-out button');
          //browser.actions().mouseMove(map_zoom_out).perform();
          //map_zoom_out.click();
          browser.sleep(5000);
        });
      }
    });
  });
});
