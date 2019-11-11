import { browser, by, element, protractor, $, $$ } from 'protractor';
import { AppPage } from '../app.po';

describe('search-places', () => {
    const page = new AppPage();
    it('Open Find and Define Filter', () => {
        browser.waitForAngularEnabled(false);
        browser.sleep(10000);
        const navPalceBtn = element(by.css('.places-link'));
        browser.sleep(5000);
        browser.actions().click(navPalceBtn).perform();
        browser.sleep(20000);
        browser.driver.getCurrentUrl().then((url) => {
            if (/places/.test(url)) {
                const findDefineTab = element(by.id('define-target'));
                browser.actions().click(findDefineTab).perform();
                browser.sleep(3000);
            }
        });
    });

    it('should be Search Places works', () => {
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

    it('should be able to view searched Places details', () => {
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

      it('should be able to click place set', () => {
        browser.driver.getCurrentUrl().then((url) => {
            if (/places/.test(url)) {
                browser.sleep(5000);
                const e2eSearchHide = element(by.css('.e2e-search-hide'));
                const savePlaceSetIcon = element(by.id('e2e-savePlaceSetIcon'));
                const openSavePlaseSetDialog = element(by.id('e2e-openSavePlaseSetDialog'));
                const placeSetName = element(by.id('e2e-place-set-name'));
                const savePlaceSetBtn = element(by.id('e2e-savePlaceSetBtn'));
                const openSaveToExistingPlaseSet = element(by.id('e2e-openSaveToExistingPlaseSet'));
                const swal2ConfirmBtn = element(by.css('.swal2-confirm'));
                browser.sleep(2000);
                e2eSearchHide.click();
                browser.sleep(3000);
                savePlaceSetIcon.click();
                browser.sleep(2000);
                openSavePlaseSetDialog.click();
                browser.sleep(3000);
                placeSetName.sendKeys('place-set-part-1');
                browser.sleep(4000);
                savePlaceSetBtn.click();
                browser.sleep(10000);
                swal2ConfirmBtn.click();
                browser.sleep(5000);
                savePlaceSetIcon.click();
                browser.sleep(5000);
                openSaveToExistingPlaseSet.click();
                browser.sleep(3000);
                const saveExitingPlaceSet = element.all(by.css('.e2e-saveExitingPlaceSet'));
                browser.sleep(3000);
                saveExitingPlaceSet.click();
                browser.sleep(5000);
                savePlaceSetBtn.click();
                browser.sleep(10000);
                // swal2ConfirmBtn.click();
                // browser.sleep(5000);
            }
        });
      });

});
