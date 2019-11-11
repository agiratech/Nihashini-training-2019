import { AppPage } from '../app.po';
import { browser, by, element } from 'protractor';

describe('Place: My places tab ', () => {
  const page = new AppPage();

  beforeAll(() => {
    browser.waitForAngularEnabled(false);
    browser.sleep(10000);
    browser.driver.getCurrentUrl().then((url) => {
      if (!(/places/.test(url))) {
        const navPalceBtn = element.all(by.css('.places-link')).first();
        browser.sleep(1000);
        browser.actions().click(navPalceBtn).perform();
        browser.sleep(30000);
      }
    });
  });

  beforeEach(() => {
    browser.driver.getCurrentUrl().then((url) => {
      return expect((/places/).test(url)).toBe(true);
    });
  });

  it('Open my places Filter', function () {
    browser.waitForAngularEnabled(false);
    browser.sleep(5000);
    const myPlaceTab = element(by.id('myplace-target'));
    page.hasClass(myPlaceTab, 'active').then((classFound: boolean) => {
      if (!classFound) {
        browser.actions().click(myPlaceTab).perform();
      }
    });
    browser.sleep(3000);
    const placeSetPanel = element.all(by.className('e2e-saved-place-sets-panel')).first();
    placeSetPanel.click();
    browser.sleep(3000);
  });

  it('should be my saved place list', () => {
    browser.sleep(3000);
    const plaseSearchField = element(by.css('.e2e-my-place-search'));
    browser.sleep(1000);
    expect(plaseSearchField.isPresent()).toBeTruthy();
    browser.sleep(3000);
    element.all(by.css('.e2e-save-place-list mat-radio-button')).then(function(items) {
      if (items.length > 0 ) {
        expect(items.length).toBeGreaterThanOrEqual(1);
        items[0].click();
      } else {
        const placeNotFound = element(by.css('.no-item-found'));
        expect(placeNotFound.isPresent()).toBeTruthy();
        expect(placeNotFound.getText()).toBe('No place set found');
      }
    });
    browser.sleep(20000);
  });

  it('should be search my saved place', () => {
    browser.sleep(3000);
    const plaseSearchField = element(by.css('.e2e-my-place-search'));
    browser.sleep(1000);
    expect(plaseSearchField.isPresent()).toBeTruthy();
    browser.sleep(3000);
    plaseSearchField.sendKeys('place');
    element.all(by.css('.e2e-save-place-list mat-radio-button')).then(function(items) {
      if (items.length > 0 ) {
        items[0].getText().then(function(name) {
        expect(name.toLowerCase()).toContain('place');
      });
      } else {
        const placeNotFound = element(by.css('.no-item-found'));
        expect(placeNotFound.isPresent()).toBeTruthy();
        expect(placeNotFound.getText()).toBe('No place set found');
      }
    });
    browser.sleep(10000);
  });

  it('should be delete my saved place', () => {
    browser.sleep(3000);
    const plaseSearchField = element(by.css('.e2e-my-place-search'));
    browser.sleep(1000);
    expect(plaseSearchField.isPresent()).toBeTruthy();
    browser.sleep(3000);
    plaseSearchField.clear();
    plaseSearchField.sendKeys(' ');
    browser.sleep(2000);
    element.all(by.css('.e2e-save-place-list mat-radio-button')).then(function(items) {
      if (items.length > 0 ) {
      element.all(by.css('.e2e-delete-place-set')).then(function(placeSet) {
        placeSet[0].click();
        browser.sleep(3000);
        const deleteConfirmPopup = element(by.css('.swal2-container'));
        const yesButton = element(by.css('.swal2-confirm'));
        const CancelBtn = element(by.css('.swal2-cancel'));
        expect(deleteConfirmPopup.isPresent()).toBeTruthy();
        expect(yesButton.isPresent()).toBeTruthy();
        expect(CancelBtn.isPresent()).toBeTruthy();
        browser.sleep(1000);
        CancelBtn.click();
      });
      } else {
        const placeNotFound = element(by.css('.no-item-found'));
        expect(placeNotFound.isPresent()).toBeTruthy();
        expect(placeNotFound.getText()).toBe('No place set found');
      }
    });
    browser.sleep(10000);
  });

  it('should be able to view selected place functionality', () => {
    browser.sleep(3000);
    element.all(by.css('.e2e-save-place-list mat-radio-button')).then(function(place) {
      if (place.length > 0 ) {
      place[0].click();
      browser.sleep(3000);
      const selectedPlaceName = element(by.css('.result-header'));
      browser.sleep(1000);
      expect(place[0].getText()).toContain(selectedPlaceName.getText());
      const headerCheckbox = element(by.className('mat-header-cell')).all(by.className('mat-checkbox-inner-container')).get(0);
      const resultTotal = element(by.css('.e2e-result-total'));
      browser.sleep(3000);
      headerCheckbox.click();
      browser.sleep(3000);
      expect(resultTotal.getText()).toContain(0);
      browser.sleep(3000);
      headerCheckbox.click();
      const placeNameLink = element(by.className('mat-row')).all(by.className('e2e-place-name-link')).get(0);
      placeNameLink.click();
      browser.sleep(5000);
      const myPlaceTab = element(by.id('myplace-target'));
      browser.actions().click(myPlaceTab).perform();
      browser.sleep(2000);
      } else {
        const placeNotFound = element(by.css('.no-item-found'));
        expect(placeNotFound.isPresent()).toBeTruthy();
        expect(placeNotFound.getText()).toBe('No place set found');
      }
    });
    browser.sleep(10000);
  });

});


