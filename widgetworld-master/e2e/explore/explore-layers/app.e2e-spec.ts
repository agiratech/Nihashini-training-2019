import { browser, by, element, protractor, $, $$ } from 'protractor';

describe('Explore Filter', () => {
   const fileToUpload = 'test-logo.png';
   it('layers with custom layers with apply view', function() {
    browser.sleep(10000);
    browser.driver.getCurrentUrl().then(function(url) {
      browser.waitForAngularEnabled(false);
      if (/explore/.test(url)) {
        browser.sleep(8000);
        const layersMenu =  element.all(by.className('display-layer')).first();
        expect(layersMenu.getText()).toBe('LAYERS & DISPLAY OPTIONS');
        layersMenu.click();
        browser.sleep(10000);

        const layersHeader = element.all(by.className('layers-filter-header')).first();
        expect(layersHeader.getText()).toBe('Layers and Display Options');

        const matTabLabel1 = element.all(by.className('test-layers')).first();
        expect(matTabLabel1.getText()).toContain('Layers');

        const matTabLabel2 = element.all(by.className('test-display-options'));
        expect(matTabLabel2.getText()).toContain('Display Options');

        const matTabLabel3 = element.all(by.className('test-saved-view-tab')).first();
        expect(matTabLabel3.getText()).toContain('Load Saved View');

        const availableLayer = element.all(by.className('test-available-layer')).first();

        expect(availableLayer.getText()).toContain('Available Layers');

        const inventorySet = element.all(by.className('test-inventory-sets')).first();

        expect(inventorySet.getText()).toContain('Inventory Sets');

        const placeSet = element.all(by.className('test-place-sets')).first();

        expect(placeSet.getText()).toContain('Place Sets');

        const singlePlace = element.all(by.className('test-single-place')).first();

        expect(singlePlace.getText()).toContain('Single Place');

        const singleUnit = element.all(by.className('test-single-unit')).first();

        expect(singleUnit.getText()).toContain('Single Unit');

        const selectedLayer = element.all(by.className('test-selected-layer')).first();


        expect(selectedLayer.getText()).toContain('Selected Layers');

        const noSelectedLayer = element.all(by.className('test-no-selected-layers')).first();

        expect(noSelectedLayer.getText()).toContain('No layers added. Please add layers from left column and apply them to the map.');

        const clearBtn = element.all(by.className('test-clear-all-btn')).first();
        expect(clearBtn.getText()).toContain('CLEAR ALL');

        const saveViewBtn = element.all(by.className('test-save-view-btn')).first();
        expect(saveViewBtn.getText()).toContain('SAVE VIEW');

        const applyBtn = element.all(by.className('test-apply-btn')).first();
        expect(applyBtn.getText()).toContain('APPLY VIEW');

        browser.sleep(5000);

        inventorySet.click();

        const firstInventorySet = element
                                  .all(by.className('test-inventory-set-item')).first()
                                  .all(by.className('test-forward-button')).first();

        browser.sleep(1000);
        firstInventorySet.isPresent().then(function(result) {
          if (result) {
            firstInventorySet.click();
          }
        });
        const secondInventorySet = element
                                  .all(by.className('test-inventory-set-item')).get(1)
                                  .all(by.className('test-forward-button')).first();

        browser.sleep(1000);
        secondInventorySet.isPresent().then(function(result) {
          if (result) {
            secondInventorySet.click();
          }
        });
        browser.sleep(5000);
        placeSet.click();
        const firstPlaceSet = element.all(by.className('test-place-set-item')).first().all(by.tagName('button')).first();
        browser.sleep(1000);
        firstPlaceSet.isPresent().then(function(result) {
          if (result) {
            firstPlaceSet.click();
          }
        });
        const secondPlaceSet = element.all(by.className('test-place-set-item')).get(1).all(by.tagName('button')).first();

        secondPlaceSet.isPresent().then(function(result) {
          if (result) {
            secondPlaceSet.click();
          }
        });
        browser.sleep(8000);

        // single unit section start

        singleUnit.click();

        const singleUnitInput = element.all(by.css('input#singleUnitSearch')).first();

        browser.sleep(10000);

        singleUnitInput.isPresent().then(function(result) {

          if (result) {
            singleUnitInput.click();
            browser.sleep(8000);
            singleUnitInput.sendKeys('30123');
            browser.sleep(10000);
          }

        });

        const firstSingleMarket = element.all(by.className('suggestion-autocomplete'))
        .all(by.tagName('mat-list-item')).get(0).all(by.tagName('button')).first();
        firstSingleMarket.isPresent().then(function(result) {
          if (result) {
            firstSingleMarket.click();
            browser.sleep(8000);
            expect(element(by.className('test-notify-message')).getText()).toContain('please remove the current unit');
          }
        });

        const closeUnit = element(by.className('test-close-select-unit'));
        closeUnit.click();
        browser.sleep(5000);

        const zipCodeOption = element(by.className('test-single-unit-options')).all(by.tagName('mat-radio-button')).get(0);
        zipCodeOption.click();
        browser.sleep(5000);

        singleUnitInput.isPresent().then(function(result) {

          if (result) {
            singleUnitInput.click();
            singleUnitInput.clear();
            browser.sleep(8000);
            singleUnitInput.sendKeys('30123');
            browser.sleep(10000);
          }

        });

        firstSingleMarket.isPresent().then(function(result) {
          if (result) {
            firstSingleMarket.click();
            browser.sleep(8000);
            expect(element(by.className('test-notify-message')).getText()).toContain('please remove the current unit');
          }
        });

        // single unit section end
        browser.sleep(8000);

        singlePlace.click();

        const singlePlaceInput = element.all(by.css('input#search')).first();

        browser.sleep(10000);

        singlePlaceInput.isPresent().then(function(result) {

          if (result) {
            singlePlaceInput.click();
            browser.sleep(8000);
            singlePlaceInput.sendKeys('ikea');
            browser.sleep(10000);
          }

        });

        const firstSinglePlace = element.all(by.className('place-suggestion-autocomplete'))
        .all(by.tagName('mat-list-item')).get(0).all(by.tagName('button')).first();
        firstSinglePlace.isPresent().then(function(result) {
          if (result) {
            firstSinglePlace.click();
            browser.sleep(8000);
          }
        });

        const secondSinglePlace = element.all(by.className('place-suggestion-autocomplete'))
        .all(by.tagName('mat-list-item')).get(1).all(by.tagName('button')).first();

        secondSinglePlace.isPresent().then(function(result) {
          if (result) {
            secondSinglePlace.click();
            browser.sleep(8000);
          }
        });

        const firstSelPlaceCl = element.all(by.className('test-selected-places')).get(0).all(by.css('button.select'));

        firstSelPlaceCl.isPresent().then(function(result) {

          if (result) {
            applyBtn.click();

            browser.sleep(8000);

            layersMenu.click();

            browser.sleep(8000);
          }

        });

      }
    });
  });

  it('display options with apply view', function() {
    const hasClass = function (ele, cls) {
        return ele.getAttribute('class').then(function (classes) {
            return classes.split(' ').indexOf(cls) !== -1;
        });
    };
    browser.sleep(10000);
    const path = require('path'),
    remote = require('selenium-webdriver/remote');

    browser.driver.getCurrentUrl().then(function(url) {
      browser.waitForAngularEnabled(false);
      if (/explore/.test(url)) {
        const layersMenu =  element.all(by.className('display-layer')).first();
        expect(layersMenu.getText()).toBe('LAYERS & DISPLAY OPTIONS');
        layersMenu.click();
        browser.sleep(5000);

        const applyBtn = element.all(by.className('test-apply-btn')).first();
        expect(applyBtn.getText()).toContain('APPLY VIEW');

        const matTabLabel2 = element.all(by.className('test-display-options'));
        expect(matTabLabel2.getText()).toContain('Display Options');
        matTabLabel2.click();
        browser.sleep(8000);

        // testing map legend option and enable/disable radio button

        const mapLegend = element(by.className('test-map-legend'));
        mapLegend.click();
        browser.sleep(8000);

        applyBtn.click();
        browser.sleep(8000);

        const keyLegendDiv = element(by.tagName('app-explore-legends'));
        expect(keyLegendDiv.isPresent()).toBe(false);
        browser.sleep(8000);

        // end of map legends test

        // start of Zoom and Other map controls testcase

        const mapControls = element(by.className('test-map-controls'));
        mapControls.click();
        browser.sleep(5000);
        applyBtn.click();
        browser.sleep(8000);

        const isShowMapControls = element(by.className('notShowMapControls'));
        expect(isShowMapControls.isPresent()).toBe(true);
        browser.sleep(5000);

        // end of Zoom and Other map controls testcase

        // start of base map testcase
        const baseMap = element(by.className('test-base-map'));
        baseMap.click();
        browser.sleep(5000);

        const satelliteMap = element(by.className('test-map-satellite'));
        satelliteMap.click();
        browser.sleep(5000);
        applyBtn.click();
        browser.sleep(15000);

        // end of base map testcase

        // start of custom logo
        // TODO: need to analyze how to implement file upload
        const displayCustomLogo = element.all(by.className('test-custom-logo-title')).first();
        const displayCustomLogoCheckbox = element(by.className('test-custom-logo-checkbox'))
            .element(by.className('mat-checkbox-layout'));
        expect(displayCustomLogo.getText()).toContain('Custom Logo');
        displayCustomLogoCheckbox.click();
        browser.sleep(1000);

        browser.setFileDetector(new remote.FileDetector());
        const displayCustomLogoTextBox = element(by.id('customLogoTextbox'));
        browser.executeScript("arguments[0].style.visibility = 'visible'; arguments[0].style.height = '1px'; arguments[0].style.width = '1px';  arguments[0].style.opacity = 1", displayCustomLogoTextBox.getWebElement());

        const absolutePath = path.resolve(__dirname, fileToUpload);
        displayCustomLogoTextBox.sendKeys(absolutePath);
        browser.sleep(10000);
        const displayCustomLogoBgRadioBtn = element.all(by.className('test-custom-logo-bg-radio')).first();
        displayCustomLogoBgRadioBtn.click();
        browser.sleep(3000);

        applyBtn.click();
        browser.sleep(8000);
        const customLogoDiv = element(by.id('customLogoElement'));
        expect(customLogoDiv.isPresent()).toBe(true);
        expect(hasClass(customLogoDiv, 'white-bg')).toBe(true, 'white-bg not applied in customLogoElement');
        browser.sleep(5000);
        // end of custom logo

        // start of custom text
        const displayCustomText = element.all(by.className('test-custom-text-title')).first();
        const displayCustomTextCheckbox = element(by.className('test-custom-text-checkbox'))
          .element(by.className('mat-checkbox-layout'));
        expect(displayCustomText.getText()).toContain('Custom Text');
        displayCustomTextCheckbox.click();
        browser.sleep(1000);

        const displayCustomTextTextBox = element.all(by.className('test-custom-text-textbox')).first();
        displayCustomTextTextBox.sendKeys('Custom Text');
        const displayCustomTextBgRadioBtn = element.all(by.className('test-custom-text-bg-radio')).first();
        displayCustomTextBgRadioBtn.click();
        browser.sleep(3000);
        applyBtn.click();
        browser.sleep(8000);

        const customTextDiv = element(by.id('customTextElement'));
        expect(customTextDiv.isPresent()).toBe(true);
        expect(hasClass(customTextDiv, 'white-bg')).toBe(true, 'white-bg not applied in customTextElement');

        // end of custom text
        layersMenu.click();
        browser.sleep(5000);

      }
    });
  });

  it('layers with custom layers and display options with save view and load saved view', function() {
    browser.sleep(10000);
    browser.driver.getCurrentUrl().then(function(url) {
      browser.waitForAngularEnabled(false);
      if (/explore/.test(url)) {
        const layersMenu =  element.all(by.className('display-layer')).first();
        expect(layersMenu.getText()).toBe('LAYERS & DISPLAY OPTIONS');
        layersMenu.click();
        browser.sleep(8000);

        const saveViewBtn = element.all(by.className('test-save-view-btn')).first();
        expect(saveViewBtn.getText()).toContain('SAVE VIEW');
        saveViewBtn.click();
        browser.sleep(8000);

        const savedDialogTitle = element.all(by.className('test-saved-dialog-title')).first();
        expect(savedDialogTitle.getText()).toContain('Saved Views');

        const savedDialogName = element(by.className('test-saved-view-name'));
        expect(savedDialogName.getAttribute('placeholder')).toEqual('View Name');

        const dialogSaveBtn = element.all(by.className('test-dialog-saveview-button')).first();
        expect(dialogSaveBtn.getText()).toContain('SAVE');
        dialogSaveBtn.click();
        browser.sleep(8000);

        expect(element(by.tagName('div.swal2-content')).getText()).toEqual('Layer view saved successfully.');
        const saveOkBtn = element(by.tagName('button.swal2-confirm'));
        saveOkBtn.click();
        browser.sleep(8000);

        const matTabLabel3 = element.all(by.className('test-saved-view-tab')).first();
        expect(matTabLabel3.getText()).toContain('Load Saved View');
        matTabLabel3.click();
        browser.sleep(8000);

        const savedViewSearch = element.all(by.css('input#search')).first();
        browser.sleep(8000);
        savedViewSearch.isPresent().then(function(result) {

          if (result) {
            savedViewSearch.click();
            browser.sleep(5000);
            savedViewSearch.sendKeys('Untitled');
            browser.sleep(10000);
          }

        });

        const searchResultOne = element(by.className('test-saved-view-list')).all(by.tagName('mat-list-item')).last();
        searchResultOne.click();
        browser.sleep(10000);

       }
    });
  });

  it('pills in display options', function() {
    browser.sleep(10000);
    browser.driver.getCurrentUrl().then(function(url) {
      browser.waitForAngularEnabled(false);
      if (/explore/.test(url)) {
        const layersMenu =  element.all(by.className('display-layer')).first();
        const selectAudience = element(by.className('pills-body')).all(by.className('mat-checkbox-inner-container')).get(0);
        const selectFilter   = element(by.className('pills-body')).all(by.className('mat-checkbox-inner-container')).get(1);
        const selectMarket   = element(by.className('pills-body')).all(by.className('mat-checkbox-inner-container')).get(2);
        const selectSaveView = element(by.className('pills-body')).all(by.className('mat-checkbox-inner-container')).get(3);

        const targetMenu = element(by.id('define-target'));
        targetMenu.click();
        browser.sleep(8000);

        const marketHeader = element(by.className('target-filters')).all(by.className('target-expansion-panel-header')).get(1);
        marketHeader.click();
        browser.sleep(8000);

        const firstMarket = element.all(by.className('test-market-name')).get(0);
        firstMarket.click();
        browser.sleep(8000);

        const applyButton = element(by.className('action-container')).all(by.tagName('button')).get(1);
        applyButton.click();
        browser.sleep(8000);

        const filterMenu = element(by.className('test-filter-inventory'));
        filterMenu.click();
        browser.sleep(8000);

        const selectMedia = element(by.tagName('app-media-filter')).all(by.className('mat-checkbox-inner-container')).get(2);
        selectMedia.click();
        browser.sleep(8000);

        applyButton.click();
        browser.sleep(8000);

        layersMenu.click();
        browser.sleep(5000);

        const applyBtn = element.all(by.className('test-apply-btn')).first();
        expect(applyBtn.getText()).toContain('APPLY VIEW');

        const matTabLabel2 = element.all(by.className('test-display-options'));
        expect(matTabLabel2.getText()).toContain('Display Options');
        matTabLabel2.click();
        browser.sleep(8000);
         // start filter pills testcase

        const filterPills = element(by.className('test-pills'));
        filterPills.click();
        browser.sleep(5000);

        selectAudience.click();
        browser.sleep(8000);
        applyBtn.click();
        browser.sleep(8000);
        expect(element(by.className('mat-chip-list')).all(by.tagName('mat-chip')).count()).toBe(3);
        layersMenu.click();
        browser.sleep(5000);
        layersMenu.click();
        browser.sleep(5000);

        selectFilter.click();
        browser.sleep(8000);
        applyBtn.click();
        browser.sleep(8000);
        expect(element(by.className('mat-chip-list')).all(by.tagName('mat-chip')).count()).toBe(2);
        layersMenu.click();
        browser.sleep(5000);
        layersMenu.click();
        browser.sleep(5000);

        selectMarket.click();
        browser.sleep(8000);
        applyBtn.click();
        browser.sleep(8000);
        expect(element(by.className('mat-chip-list')).all(by.tagName('mat-chip')).count()).toBe(1);
        layersMenu.click();
        browser.sleep(5000);
        layersMenu.click();
        browser.sleep(5000);

        selectSaveView.click();
        browser.sleep(8000);
        applyBtn.click();
        browser.sleep(8000);
        expect(element(by.className('mat-chip-list')).all(by.tagName('mat-chip')).count()).toBe(0);
        layersMenu.click();
        browser.sleep(8000);
        layersMenu.click();
        browser.sleep(5000);

        const matTabLabel3 = element.all(by.className('test-saved-view-tab')).first();
        expect(matTabLabel3.getText()).toContain('Load Saved View');
        matTabLabel3.click();
        browser.sleep(8000);

        const savedViewSearch = element.all(by.css('input#search')).first();
        browser.sleep(8000);
        savedViewSearch.isPresent().then(function(result) {

          if (result) {
            savedViewSearch.click();
            browser.sleep(5000);
            savedViewSearch.clear();
            browser.sleep(5000);
            savedViewSearch.sendKeys('Untitled');
            browser.sleep(10000);
          }

        });

        const searchResultOne = element.all(by.className('mat-radio-container')).last();
        browser.sleep(10000);
        const deleteFirst = element(by.className('test-saved-view-list')).all(by.className('test-saved-view-action')).last().element(by.tagName('mat-icon'));

        // const deleteFirst = searchResultOne.all(by.className('test-saved-view-action')).first().all(by.tagName('mat-icon')).get(0);
        deleteFirst.click();
        browser.sleep(8000);
        const deleteConfirmBtn = element(by.tagName('button.swal2-confirm'));
        deleteConfirmBtn.click();
        browser.sleep(8000);
        expect(element(by.tagName('div.swal2-content')).getText()).toContain('Deleted Successfully');
        const deleteSuccessBtn = element(by.tagName('button.swal2-confirm'));
        deleteSuccessBtn.click();
        browser.sleep(8000);
        savedViewSearch.clear();

        layersMenu.click();
        browser.sleep(8000);
        // end filter pills testcase
      }
    });
  });

    it('clear selected layers and clear all view', function() {
    browser.driver.getCurrentUrl().then(function(url) {
      browser.waitForAngularEnabled(false);

      if (/explore/.test(url)) {
        const layersMenu =  element.all(by.className('display-layer')).first();

        expect(layersMenu.getText()).toBe('LAYERS & DISPLAY OPTIONS');
        layersMenu.click();
        browser.sleep(5000);

        const matTabLabel1 = element.all(by.className('test-layers')).first();
        expect(matTabLabel1.getText()).toContain('Layers');
        matTabLabel1.click();
        browser.sleep(3000);

        const clearBtn = element.all(by.className('test-clear-all-btn')).first();

        clearBtn.click();
        browser.sleep(15000);
        layersMenu.click();
        browser.sleep(5000);

      }
    });
  });
});
