import { AppPage } from '../app.po';
import { browser, by, element, protractor } from 'protractor';

describe('Place: Go to Places module', () => {
  const page = new AppPage();
  it('Open Find and Defaine Filter', function () {
    browser.waitForAngularEnabled(false);
    browser.sleep(10000);
    const navPalceBtn = element(by.css('.places-link'));
    browser.sleep(1000);
    browser.actions().click(navPalceBtn).perform();
    browser.sleep(20000);
    browser.driver.getCurrentUrl().then((url) => {
      // expect(url.includes('/lists/')).toBe(true);
      if (/places/.test(url)) {
        const findDefineTab = element(by.id('define-target'));
        browser.actions().click(findDefineTab).perform();
        browser.sleep(3000);
      }
    });
  });

  it('should be Search Places works', function () {
    browser.driver.getCurrentUrl().then((url) => {
      if (/places/.test(url)) {
        browser.sleep(5000);
        const inputSearch = element(by.css('.e2e-search-place'));
        const searchBtn = element(by.css('.e2e-search-btn'));
        browser.sleep(1000);
        inputSearch.sendKeys('mcd');
        browser.sleep(1000);
        searchBtn.click();
        browser.sleep(2000);
      }
    });
  });

  it('should be able to view searched Places details', function () {
    browser.driver.getCurrentUrl().then((url) => {
      if (/places/.test(url)) {
        browser.sleep(5000);
        const searchTitle = element(by.css('.e2e-searched-title'));
        const placesList = element.all(by.css('.e2e-searched-place-list mat-tree-node'));
        browser.sleep(2000);
        expect(searchTitle.getText()).toContain('mcd');
        expect(placesList.count()).toBeGreaterThanOrEqual(1);
        browser.sleep(2000);
      }
    });
  });

  it('should be able to search hide & show', function () {
    browser.driver.getCurrentUrl().then((url) => {
      if (/places/.test(url)) {
        browser.sleep(5000);
        const searchHide = element(by.css('.e2e-search-hide'));
        searchHide.click();
        browser.sleep(1000);
        const searchShow = element(by.css('.show-filter-icon mat-icon'));
        expect(searchShow.getText()).toEqual('filter_list');
        browser.sleep(1000);
        searchShow.click();
        browser.sleep(2000);
      }
    });
  });

  it('should be able view Your Place Results', function () {
    browser.driver.getCurrentUrl().then((url) => {
      if (/places/.test(url)) {
        browser.sleep(2000);
        const defaultTitle = element(by.css('.result-header'));
        browser.sleep(1000);
        expect(defaultTitle.getText()).toEqual('Your Place Results');
        const summaryCount = element(by.css('.e2e-summary-count'));
        expect(summaryCount.getText()).toBeGreaterThanOrEqual(1);
        browser.sleep(2000);
      }
    });
  });

  it('should be able Your Place Results list view functionality', function () {
    browser.driver.getCurrentUrl().then((url) => {
      if (/places/.test(url)) {
        browser.sleep(5000);
        const customizeBtn = element(by.css('.e2e-customize-column .mat-button-wrapper'));
        browser.sleep(1000);
        expect(customizeBtn.isPresent()).toBeTruthy();
        browser.sleep(1000);
        const headerCheckbox = element(by.className('mat-header-cell')).all(by.className('mat-checkbox-inner-container')).get(0);
        const resultTotal = element(by.css('.e2e-result-total'));
        browser.sleep(2000);
        headerCheckbox.click();
        browser.sleep(2000);
        expect(resultTotal.getText()).toContain(0);
        browser.sleep(2000);
        headerCheckbox.click();
        const placeNameLink = element(by.className('mat-row')).all(by.className('e2e-place-name-link')).get(0);
        placeNameLink.click();
        browser.sleep(3000);
        const resultBackBtn = element(by.css('.e2e-result-back-btn .mat-button-wrapper'));
        browser.sleep(2000);
        expect(resultBackBtn.isPresent()).toBeTruthy();
        browser.sleep(2000);
        resultBackBtn.click();
        browser.sleep(20000);
      }
    });
  });

  it('should be able to switch to list to grid view functionality', function () {
    browser.driver.getCurrentUrl().then((url) => {
      if (/places/.test(url)) {
        browser.sleep(5000);
        const searchHide = element(by.css('.e2e-search-hide'));
        searchHide.click();
        browser.sleep(2000);
        const resultListBtn = element(by.css('.e2e-place-result-list'));
        browser.sleep(2000);
        resultListBtn.click();
        browser.sleep(2000);
        const resultGridBtn = element(by.css('.e2e-place-result-grid'));
        browser.sleep(2000);
        expect(resultGridBtn.getText()).toBe('list');
        const resultGridItems = element.all(by.css('.e2e-result-grid-items'));
        expect(resultGridItems.count()).toBeGreaterThanOrEqual(1);
        browser.sleep(2000);
        const resultDetailsLink = element.all(by.css('.e2e-result-details-link')).get(0);
        browser.sleep(2000);
        resultDetailsLink.click();
        browser.sleep(5000);
        const placeNameLink = element(by.className('mat-row')).all(by.className('e2e-place-name-link')).get(0);
        placeNameLink.click();
        browser.sleep(5000);
        const filterClose = element(by.css('.e2e-filter-close'));
        filterClose.click();
        browser.sleep(2000);
        const placePopup = element(by.css('.placePopup'));
        browser.sleep(2000);
        expect(placePopup.isPresent()).toBeTruthy();
        browser.sleep(20000);
      }
    });
  });

 /* it('should be find & refine search functionality', function () {
    browser.driver.getCurrentUrl().then((url) => {
      if (/places/.test(url)) {
        browser.sleep(5000);
        const findDefineTab = element(by.id('define-target'));
        browser.actions().click(findDefineTab).perform();
        browser.sleep(3000);
        const searchShow = element(by.css('.show-filter-icon mat-icon'));
        browser.sleep(1000);
        searchShow.click();
        browser.sleep(1000);
        const findDefineSearch = element(by.css('.e2e-find-refine-search'));
        browser.sleep(3000);
        const refineListCheckbox = element(by.className('mat-nested-tree-node')).all(by.className('mat-checkbox-inner-container')).get(0);
        refineListCheckbox.click();
        browser.sleep(3000);
        findDefineSearch.sendKeys('center');
        browser.sleep(5000);
        const refineApplybtn = element(by.css('.e2e-refine-apply'));
        refineApplybtn.click();
        browser.sleep(5000);
        browser.sleep(20000);
      }
    });
  });*/

});
