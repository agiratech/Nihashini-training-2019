import { AppPage } from '../app.po';
import { browser, by, element, protractor } from 'protractor';

/**
 * Here we have written the e2e test cases for places modules which are given by Bailey
 */

describe('Places: Bailey\'s flow', () => {
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
});

describe('Places: Bailey\'s flow', () => {
  const page = new AppPage();
  const newPlaceSetName = 'place-set-' + Date.now().toString(36) + Math.random().toString(36).substr(2);

  beforeEach(() => {
    browser.driver.getCurrentUrl().then(function (url) {
      return expect((/places/).test(url)).toBe(true);
    });
  });

  it('should be Search Places works', function () {
    browser.sleep(5000);
    const inputSearch = element(by.css('.e2e-search-place'));
    const searchBtn = element(by.css('.e2e-search-btn'));
    browser.sleep(1000);
    inputSearch.sendKeys('alaska');
    browser.sleep(1000);
    searchBtn.click();
    browser.sleep(5000);
    const searchTitle = element(by.css('.e2e-searched-title'));
    browser.sleep(2000);
    expect(searchTitle.getText()).toContain('alaska');
    browser.sleep(2000);
  });


  it('Go to place details page', function () {
    browser.sleep(2000);
    const firstPlace = element(by.className('mat-row')).all(by.className('e2e-place-name-link')).get(0);
    if (firstPlace) {
      const placeName = firstPlace.getText();
      firstPlace.click();
      browser.sleep(3000);
      const detailedPlace = element(by.className('mat-row')).all(by.className('e2e-place-name-link')).get(0);
      if (detailedPlace) {
        browser.sleep(1000);
        expect(detailedPlace.getText()).toContain(placeName);
        detailedPlace.click();
        browser.sleep(5000);
        const findDefineTab = element(by.id('define-target'));
        browser.actions().click(findDefineTab).perform();
        browser.sleep(3000);
        browser.actions().click(findDefineTab).perform();
        browser.sleep(5000);
      }
    }
  });

  it('Customize Columns', function () {
    browser.sleep(2000);
    const searchHide = element(by.css('.e2e-search-hide'));
    searchHide.click();
    browser.sleep(1000);
    const customizeBtn = element(by.css('.e2e-customize-column .mat-button-wrapper'));
    let existingColumnsLength = 0;
    element.all(by.className('e2e-mat-header')).then((items) => {
      existingColumnsLength = items.length;
    });
    browser.sleep(1000);
    customizeBtn.click();
    browser.sleep(2000);
    // Getting the reference of first column from list of current columns list
    const firstColumn = element.all(by.className('e2e-cust-col-item')).first();
    // removing first column and applying changes
    const removeColumnBtn = element.all(by.className('remove-column')).first();
    const applyBtn = element.all(by.className('e2e-custom-column-apply'));
    removeColumnBtn.click();
    browser.sleep(1000);
    applyBtn.click();
    browser.sleep(5000);
    element.all(by.className('e2e-mat-header')).then((items) => {
      expect(existingColumnsLength).not.toEqual(items.length);
    });
    browser.sleep(2000);
    customizeBtn.click();
    browser.sleep(2000);
    const selectBtn = element.all(by.className('e2e-select-column')).first();
    browser.sleep(1000);
    selectBtn.click();
    browser.sleep(2000);
    applyBtn.click();
    browser.sleep(5000);
    const searchShow = element(by.css('.show-filter-icon mat-icon'));
    expect(searchShow.getText()).toEqual('filter_list');
    browser.sleep(1000);
    searchShow.click();
    browser.sleep(4000);
  });
  it('Sort by City', function () {
    browser.sleep(2000);
    element.all(by.className('e2e-mat-header')).then((items) => {
      for (let i = 0; i < items.length; i++) {
        if (items[i].getText() === 'City') {
          items[i].click();
          browser.sleep(3000);
        }
      }
    });
  });

  it('Applying Place type filters', function () {
    browser.sleep(10000);
    element.all(by.className('e2e-result-back-btn')).first().click();
    browser.sleep(10000);
    const placeTypePanel = element.all(by.className('e2e-place-type')).first();
    page.hasClass(placeTypePanel, 'mat-expanded').then((classFound: boolean) => {
      if (!classFound) {
        placeTypePanel.click();
      }
    });
    const placeTypeOption = element.all(by.className('e2e-place-type-chk-box')).first();
    const placeTypeOptionCount = element.all(by.className('e2e-place-type-count')).first();
    if (placeTypeOption) {
      placeTypeOption.click();
      browser.sleep(5000);
      const summaryCount = element.all(by.className('e2e-summary-count')).first();
      expect(placeTypeOptionCount.getText()).toContain(summaryCount.getText());
      placeTypeOption.click();
      browser.sleep(5000);
    }
    const industryTypePanel = element.all(by.className('e2e-industriesList')).first();

    page.hasClass(industryTypePanel, 'mat-expanded').then((classFound: boolean) => {
      if (!classFound) {
        industryTypePanel.click();
      }
    });
    const industryOption = element.all(by.className('e2e-option-industriesList')).first();
    if (industryOption) {
      industryOption.click();
      browser.sleep(10000);
      const summaryCount = element.all(by.className('e2e-summary-count')).first();
      expect(industryOption.getText()).toContain(summaryCount.getText());
      browser.sleep(10000);
      industryOption.click();
      browser.sleep(5000);
    }
    const brandTypePanel = element.all(by.className('e2e-brandList')).first();
    page.hasClass(brandTypePanel, 'mat-expanded').then((classFound: boolean) => {
      if (!classFound) {
        brandTypePanel.click();
      }
    });
    const brandOption = element.all(by.className('e2e-option-brandList')).first();
    if (brandOption) {
      brandOption.click();
      browser.sleep(5000);
      const summaryCount = element.all(by.className('e2e-summary-count')).first();
      expect(brandOption.getText()).toContain(summaryCount.getText());
      browser.sleep(5000);
      brandOption.click();
      browser.sleep(5000);
    }
  });

  // it('Saving place sets', function () {
  //   browser.sleep(10000);
  //   const firstPlace = element(by.className('mat-row')).all(by.className('e2e-place-name-link')).get(0);
  //   if (firstPlace) {
  //     firstPlace.click();
  //     browser.sleep(5000);
  //     const savePlaceSetIcon = element.all(by.id('e2e-savePlaceSetIcon')).first();
  //     savePlaceSetIcon.click();
  //     browser.sleep(5000);
  //     const openSavePlaseSetDialog = element(by.id('e2e-openSavePlaseSetDialog'));
  //     const placeSetName = element(by.id('e2e-place-set-name'));
  //     openSavePlaseSetDialog.click();
  //     browser.sleep(3000);
  //     const savePlaceSetBtn = element(by.id('e2e-savePlaceSetBtn'));
  //     const swal2ConfirmBtn = element(by.css('.swal2-confirm'));
  //     placeSetName.sendKeys(newPlaceSetName);
  //     browser.sleep(5000);
  //     savePlaceSetBtn.click();
  //     browser.sleep(10000);
  //     swal2ConfirmBtn.click();
  //     browser.sleep(5000);
  //     savePlaceSetIcon.click();
  //     browser.sleep(2000);
  //     const openSaveToExistingPlaseSet = element(by.id('e2e-openSaveToExistingPlaseSet'));
  //     openSaveToExistingPlaseSet.click();
  //     browser.sleep(3000);
  //     const saveExitingPlaceSet = element.all(by.css('.e2e-saveExitingPlaceSet'));
  //     browser.sleep(3000);
  //     saveExitingPlaceSet.click();
  //     browser.sleep(5000);
  //     savePlaceSetBtn.click();
  //     browser.sleep(5000);
  //     swal2ConfirmBtn.click();
  //     browser.sleep(5000);
  //   }
  // });

  // it('Filtering My places', function () {
  //   browser.sleep(10000);
  //   const myPlaceTab = element(by.id('myplace-target'));
  //   page.hasClass(myPlaceTab, 'active').then((classFound: boolean) => {
  //     if (!classFound) {
  //       browser.actions().click(myPlaceTab).perform();
  //     }
  //   });
  //   browser.sleep(5000);
  //   const placeSetPanel = element.all(by.className('e2e-saved-place-sets-panel')).first();
  //   placeSetPanel.click();
  //   browser.sleep(3000);
  //   const plaseSearchField = element(by.css('.e2e-my-place-search'));
  //   browser.sleep(3000);
  //   plaseSearchField.sendKeys(newPlaceSetName);
  //   element.all(by.css('.e2e-save-place-list mat-radio-button')).then((items) => {
  //     if (items.length > 0 ) {
  //       items[0].click();
  //       items[0].getText().then((name) => {
  //         expect(name.toLowerCase()).toContain(newPlaceSetName);
  //       });
  //     } else {
  //       const placeNotFound = element(by.css('.no-item-found'));
  //       expect(placeNotFound.isPresent()).toBeTruthy();
  //       expect(placeNotFound.getText()).toBe('No place set found');
  //     }
  //   });
  //   browser.sleep(10000);
  // });

});
