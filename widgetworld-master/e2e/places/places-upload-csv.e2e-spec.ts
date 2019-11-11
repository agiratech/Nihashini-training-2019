import { AppPage } from '../app.po';
import { browser, by, element } from 'protractor';

describe('Place: CSV upload fuctionality ', () => {
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

  it('Open My places Filter Tab', () => {
    browser.waitForAngularEnabled(false);
    browser.sleep(5000);
    const myPlaceTab = element(by.id('myplace-target'));
    page.hasClass(myPlaceTab, 'active').then((classFound: boolean) => {
      if (!classFound) {
        browser.actions().click(myPlaceTab).perform();
      }
    });
    browser.sleep(3000);
  });

  it('should open the assign customer popup and assign customer', () => {
    browser.sleep(3000);
    const importJobsPanel = element.all(by.className('e2e-import-jobs-panel')).first();
    importJobsPanel.click();
    browser.sleep(3000);
    // Getting select option reference
    const dropdown = element.all(by.className('e2e-place-import-select')).first();
    dropdown.click();
    // Getting reference for group import option
    const option = element.all(by.className('e2e-group-place-import')).first();
    option.click();
    browser.sleep(3000);
    // Getting reference of popup
    const popupReference = element.all(by.className('e2e-places-upload-popup')).first();
    expect(popupReference.isPresent()).toBe(true);
    browser.sleep(3000);
  });

});


