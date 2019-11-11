import { browser, by, element, protractor, $ } from 'protractor';
import { exec } from 'child_process';

describe('Explore Tabular Panel', () => {

  it('tabular panel', function() {
    browser.driver.getCurrentUrl().then(function(url) {
      if (/explore/.test(url)) {
        browser.waitForAngularEnabled(false);
        browser.sleep(20000).then(function() {
          const toggleButton = element(by.css('.explore-tabular-toggle-button'));
          browser.actions().click(toggleButton).perform();

          browser.sleep(10000);

          const tabHeader  =  element.all(by.css('.explore-tabular-table')).first().all(by.tagName('th'));
          //if ( expect(element(by.css('.explore-tabular-table')).isDisplayed()).toBe(true) ) {
          const tabSort7 = tabHeader.get(7);
          browser.actions().click(tabSort7).perform();
          browser.sleep(5000);
          const tabSort6 = tabHeader.get(6);
          browser.actions().click(tabSort6).perform();
          browser.sleep(5000);
          const tabSort5 = tabHeader.get(5);
          browser.actions().click(tabSort5).perform();
          browser.sleep(5000);
          const tabSort4 = tabHeader.get(4);
          browser.actions().click(tabSort4).perform();
          browser.sleep(5000);
          const tabSort3 = tabHeader.get(3);
          browser.actions().click(tabSort3).perform();
          browser.sleep(5000);
          const tabSort2 = tabHeader.get(2);
          browser.actions().click(tabSort2).perform();
          browser.sleep(5000);

          const csvDwnld  = element.all(by.id('select-button')).first();
          browser.actions().click(csvDwnld).perform();

          browser.sleep(2000);

          const csvDwnldButton  = element(by.xpath('//explore-tabular-panels/div/div[2]/div[3]/div[1]/div/div[3]/div/ul/li/a'));
          browser.actions().click(csvDwnldButton).perform();
          browser.sleep(1000);

          const toggleCloseButton = element(by.css('.explore-tabular-toggle-close-button'));
          browser.actions().click(toggleCloseButton).perform();
          const inventory_toggle = $('.inventory-toggle button');
          inventory_toggle.click();
          // const tabSelect =  element(by.xpath('//explore-tabular-panels/div/div[2]/div[3]/div[1]/div/div[2]/div/ul/li[2]/a'));
          // browser.actions().click(tabSelect).perform();

          // browser.sleep(5000);
          //}
        });
      }
    });
  });
  it('explore inventory with operator filter', function() {
    browser.driver.getCurrentUrl().then(function(url) {
      browser.waitForAngularEnabled(false);
      if ((/explore/).test(url)) {
        browser.sleep(20000);
        const operator_dropdown = element(by.xpath('//app-explore-filter/div[2]/div/form/ul/li[4]/ul/li[2]/a'));
        browser.actions().mouseMove(operator_dropdown).perform();
        browser.actions().click(operator_dropdown).perform();
        browser.sleep(2000);
        const operator_search = element(by.xpath('//app-explore-filter/div[2]/div/form/ul/li[4]/ul/li[2]/div[2]/div[1]/input'));
        operator_search.sendKeys('lam');
        browser.sleep(2000);
        const operator_1 = element(by.xpath('//app-explore-filter/div[2]/div/form/ul/li[4]/ul/li[2]/div[2]/div[2]/ul/li/label[1]/span[1]'));
        browser.actions().click(operator_1).perform();
        browser.sleep(500);

        const operator_apply = element(by.xpath('//app-explore-filter/div[2]/div/form/ul/li[4]/ul/li[2]/div[2]/div[3]/button[1]'));

        browser.actions().mouseMove(operator_apply).perform();
        operator_apply.click();
        browser.sleep(5000);
        expect(operator_dropdown.getCssValue('background-color')).toBe('rgba(146, 42, 149, 1)');
        const view_as_table = element(by.xpath('//app-explore-metrics/div[1]/div/div[1]/h6'));
        const select = element(by.id('select-button'));
        const collapse_table = $('.explore-tabular-toggle-close-button button');
        const inventory_toggle = $('.inventory-toggle button');
        const tabular_select = $('.pull-left #sort-button');
        const side_selected_count = element(by.xpath('//app-geo-explore/div/div/section/div/div[2]/div/div[1]/app-explore-metrics/div[2]'));
        const table_selected_count = element(by.xpath('//explore-tabular-panels/div/div[2]/div[3]/div[1]/div/div[1]/div'));
        const side_all = element(by.xpath('//app-geo-explore/div/div/section/div/div[2]/div/div[2]/div[2]/div/ul/li[1]/a'));
        const side_25 = element(by.xpath('//app-geo-explore/div/div/section/div/div[2]/div/div[2]/div[2]/div/ul/li[2]/a'));
        const side_50 = element(by.xpath('//app-geo-explore/div/div/section/div/div[2]/div/div[2]/div[2]/div/ul/li[3]/a'));
        const side_100 = element(by.xpath('//app-geo-explore/div/div/section/div/div[2]/div/div[2]/div[2]/div/ul/li[4]/a'));
        const side_none = element(by.xpath('//app-geo-explore/div/div/section/div/div[2]/div/div[2]/div[2]/div/ul/li[5]/a'));
        const side_custom = element(by.xpath('//app-geo-explore/div/div/section/div/div[2]/div/div[2]/div[2]/div/ul/li[6]/a'));

        const tabular_all = element(by.xpath('//explore-tabular-panels/div/div[2]/div[3]/div[1]/div/div[2]/div/ul/li[1]/a'));
        const tabular_25 = element(by.xpath('//explore-tabular-panels/div/div[2]/div[3]/div[1]/div/div[2]/div/ul/li[2]/a'));
        const tabular_50 = element(by.xpath('//explore-tabular-panels/div/div[2]/div[3]/div[1]/div/div[2]/div/ul/li[3]/a'));
        const tabular_100 = element(by.xpath('//explore-tabular-panels/div/div[2]/div[3]/div[1]/div/div[2]/div/ul/li[4]/a'));
        const tabular_none = element(by.xpath('//explore-tabular-panels/div/div[2]/div[3]/div[1]/div/div[2]/div/ul/li[5]/a'));
        const tabular_custom = element(by.xpath('//explore-tabular-panels/div/div[2]/div[3]/div[1]/div/div[2]/div/ul/li[6]/a'));

        browser.actions().mouseMove(select).perform();
        select.click();
        browser.actions().mouseMove(side_25).perform();
        browser.sleep(500);
        side_25.click();
        browser.sleep(2000);
        expect(select.getText()).toContain('Top 25');
        expect(side_selected_count.getText()).toContain('25 selected of');
        browser.actions().mouseMove(view_as_table).perform();
        view_as_table.click();
        browser.sleep(3000);
        expect(tabular_select.getText()).toContain('Top 25');
        expect(table_selected_count.getText()).toContain('25 selected of');
        browser.actions().mouseMove(tabular_select).perform();
        tabular_select.click();
        browser.actions().mouseMove(tabular_50).perform();
        browser.sleep(500);
        tabular_50.click();
        browser.sleep(2000);
        expect(tabular_select.getText()).toContain('Top 50');
        expect(table_selected_count.getText()).toContain('50 selected of');
        collapse_table.click();
        inventory_toggle.click();
        browser.sleep(2000);
        expect(select.getText()).toContain('Top 50');
        expect(side_selected_count.getText()).toContain('50 selected of');
        browser.actions().mouseMove(select).perform();
        select.click();
        browser.actions().mouseMove(side_100).perform();
        browser.sleep(500);
        side_100.click();
        browser.sleep(2000);
        expect(select.getText()).toContain('Top 100');
        expect(side_selected_count.getText()).toContain('100 selected of');
        browser.actions().mouseMove(view_as_table).perform();
        view_as_table.click();
        browser.sleep(2000);
        expect(tabular_select.getText()).toContain('Top 100');
        expect(table_selected_count.getText()).toContain('100 selected of');
        browser.actions().mouseMove(tabular_select).perform();
        tabular_select.click();
        browser.actions().mouseMove(tabular_custom).perform();
        browser.sleep(500);
        tabular_custom.click();
        browser.sleep(2000);
        expect(tabular_select.getText()).toContain('Custom');
        expect(table_selected_count.getText()).toContain('100 selected of');
        collapse_table.click();
        inventory_toggle.click();
        browser.sleep(2000);
        // expect(select.getText()).toContain('Custom');
        expect(side_selected_count.getText()).toContain('100 selected of');
        browser.actions().mouseMove(select).perform();
        select.click();
        browser.actions().mouseMove(side_none).perform();
        browser.sleep(500);
        side_none.click();
        browser.sleep(2000);
        expect(select.getText()).toContain('None');
        expect(side_selected_count.getText()).toContain('0 selected of');
        view_as_table.click();
        browser.sleep(2000);
        expect(tabular_select.getText()).toContain('None');
        expect(table_selected_count.getText()).toContain('0 selected of');
        browser.sleep(5000);
        collapse_table.click();
        inventory_toggle.click();
        const operator_clear_btn = element(by.xpath('//app-explore-filter/div[2]/div/form/ul/li[4]/ul/li[2]/div[2]/div[3]/button[2]'));
        browser.actions().click(operator_dropdown).perform();
        browser.sleep(2000);
        operator_clear_btn.click();
        browser.sleep(2000);
        // clear button in market dropdown
        const mkt_dropdown = element(by.xpath('//app-explore-filter/div[2]/div/form/ul/li[2]/a'));
        browser.actions().mouseMove(mkt_dropdown).perform();
        mkt_dropdown.click();
        browser.sleep(2000);
        const mkt_clr_btn = element(by.xpath('//app-explore-filter/div[2]/div/form/ul/li[2]/div/div[3]/button[2]'));
        browser.actions().mouseMove(mkt_clr_btn).perform();
        mkt_clr_btn.click();
        browser.sleep(2000);
        expect(mkt_dropdown.getCssValue('background-color')).toBe('rgba(254, 254, 254, 1)');
        const aud_mkt_blk_content = element(by.xpath('//app-explore-metrics/div[1]/div/div[3]/ul/li/span'));
        expect(aud_mkt_blk_content.getText()).not.toContain('Abilene-Sweetwa...');
        expect(aud_mkt_blk_content.getText()).toBe('Adult Populatio...');
        browser.sleep(5000);
      }
    });

  });
});
