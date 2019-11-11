import { browser, by, element, protractor, $$, ExpectedConditions, $ } from 'protractor';

describe('Landing on explore page', () => {

  it('intial explore page dom settings', function() {

    browser.driver.getCurrentUrl().then(function(url) {
      browser.waitForAngularEnabled(false);
      if ((/explore/).test(url)) {

        const username = element(by.xpath('//app-explore-filter/div[2]/user-navigation/div/div/div/ul/li/a'));
        expect(username.isDisplayed()).toBe(true);

        const audience_title = element(by.xpath('//app-explore-filter/div[2]/div/form/ul/li[1]/span'));
        if (expect(audience_title.getText()).toContain('SELECT AUDIENCE')) {
          expect(element(by.xpath('//app-explore-filter/div[2]/div/form/ul/li[1]/a/span')).getText())
          .toContain('Total Population (5+ yrs)');
          expect(element(by.xpath('//app-explore-filter/div[2]/div/form/ul/li[1]/a')).getCssValue('background-color')).
          toEqual('rgba(146, 42, 149, 1)');
        }
        const market_title = element(by.xpath('//app-explore-filter/div[2]/div/form/ul/li[2]/span'));
        if (expect(market_title.getText()).toContain('SELECT MARKET')) {
          expect(element(by.xpath('//app-explore-filter/div[2]/div/form/ul/li[2]/a/span')).getText())
          .toContain('Market');
        }
        const panel_title = element(by.xpath('//app-explore-filter/div[2]/div/form/ul/li[4]/span'));
        if (expect(panel_title.getText()).toContain('PANEL FILTERS')) {
          expect(element(by.xpath('//app-geo-explore/div/section/app-explore-filter/div[2]/div/form/ul/li[4]/ul/li[1]/a/span')).getText())
          .toContain('Media Types');

          // expect(element(by.xpath('//app-geo-explore/div/section/app-explore-filter/div[2]/div/form/ul/li[4]/ul/li[1]/a')).
          // getCssValue('background-color')).toBe('rgba(146, 42, 149, 1)');

          expect(element(by.xpath('//app-explore-filter/div[2]/div/form/ul/li[4]/ul/li[2]/a/span')).getText())
          .toContain('Operators');

          expect(element(by.xpath('//app-explore-filter/div[2]/div/form/ul/li[4]/ul/li[3]/a/span')).getText())
          .toContain('Location');

          expect(element(by.xpath('//app-explore-filter/div[2]/div/form/ul/li[4]/ul/li[4]/a/span')).getText())
          .toContain('More');
        }

        browser.sleep(50000);

        const sidebar_inventory = element(by.xpath('//app-geo-explore/div/div/section/div/div[2]/div/div[1]/app-explore-metrics'));

        if ( expect(sidebar_inventory.isDisplayed()).toBe(true) ) {
          const impr_div = element(by.xpath('//div/div[2]/div/div[1]/app-explore-metrics/div[1]/div'));
          if (expect(impr_div.isDisplayed()).toBe(true)) {
            const view_as_table = element(by.xpath('//app-explore-metrics/div[1]/div/div[1]/h6'));
            expect(view_as_table.isDisplayed()).toBe(true);
            expect(view_as_table.getCssValue('color')).toBe('rgba(146, 42, 149, 1)');

            // weekly metrics impressions;
            const weekly_metrics = element(by.xpath('//app-explore-metrics/div[1]/div/h6'));
            expect(weekly_metrics.isDisplayed()).toBe(true);

            // target impressions
            const tgt_impr_count = element(by.xpath('//app-explore-metrics/div[1]/div/div[2]/div[1]/h3'));
            const tgt_impr = element(by.xpath('//app-explore-metrics/div[1]/div/div[2]/div[1]/div'));

            expect(tgt_impr.isDisplayed()).toBe(true);
            expect(tgt_impr.getText()).toContain('TARGET');
            expect(tgt_impr_count.isDisplayed()).toBe(true);
            expect(tgt_impr_count.getCssValue('color')).toBe('rgba(27, 173, 168, 1)');

            // persons 5+ impressions
            const per_impr_count = element(by.xpath('//app-explore-metrics/div[1]/div/div[2]/div[2]/h3'));
            const per_impr = element(by.xpath('//app-explore-metrics/div[1]/div/div[2]/div[2]/div'));

            expect(per_impr.isDisplayed()).toBe(true);
            expect(per_impr.getText()).toContain('PERSONS 5+');
            expect(per_impr_count.isDisplayed()).toBe(true);
            expect(per_impr_count.getCssValue('color')).toBe('rgba(27, 173, 168, 1)');

            // target composition
            const tgt_comp_count = element(by.xpath('//app-explore-metrics/div[1]/div/div[2]/div[3]/h3'));
            const tgt_comp = element(by.xpath('//app-explore-metrics/div[1]/div/div[2]/div[3]/div'));

            expect(tgt_comp.isDisplayed()).toBe(true);
            expect(tgt_comp.getText()).toContain('COMPOSITION');
            expect(tgt_comp_count.isDisplayed()).toBe(true);
            expect(tgt_comp_count.getCssValue('color')).toBe('rgba(27, 173, 168, 1)');

            // audience and market block
            const aud_mkt_blk = element(by.xpath('//app-explore-metrics/div[1]/div/div[3]'));

            expect(aud_mkt_blk.isDisplayed()).toBe(true);

            const panels_count = element(by.xpath('//app-explore-metrics/div[2]'));

            expect(panels_count.isDisplayed()).toBe(true);


          }
        }
      }
    });
  });
});


