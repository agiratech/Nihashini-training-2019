import { browser, by, element, protractor, $$, ExpectedConditions, $ } from 'protractor';

describe('Explore: Landing on explore page', () => {
  beforeAll(function () {
    browser.waitForAngularEnabled(false);
    browser.sleep(10000);
    browser.driver.getCurrentUrl().then((url) => {
      if (!(/explore/.test(url))) {
        const navPalceBtn = element.all(by.css('.explore-link')).first();
        browser.sleep(1000);
        browser.actions().click(navPalceBtn).perform();
        browser.sleep(30000);
      }
    });
  });

  beforeEach(() => {
    browser.driver.getCurrentUrl().then((url) => {
      return expect((/explore/).test(url)).toBe(true);
    });
  });

  it('Able to have define target filter', function () {
    browser.waitForAngularEnabled(false);
    browser.sleep(5000);
    const defineTraget = element.all(by.id('define-target'));
    expect(defineTraget.getText()).toContain('DEFINE TARGET');
    defineTraget.click();
  });

  it('Able to open Select Audience from define target', function () {
    browser.sleep(5000);
    const selectAudience = element.all(by.css('.e2e-select-audience'));
    selectAudience.click();
  });

  it('Able to get the audience tab’s & if available open consumer profiles', function () {
    browser.sleep(5000);
    const audienceTab = element(by.css('app-audience-browser .mat-tab-group .mat-tab-header .mat-tab-list')).all(by.css('.mat-tab-label'));
    audienceTab.then(function (result) {
      expect(result.length).toBeGreaterThanOrEqual(2);
      const consumerProfile = result[2];
      browser.sleep(2000);
      consumerProfile.click();
      browser.sleep(5000);
    });
  });

  it('Able to click the first consumer profile audience from the list and click apply button and match it.', function () {
    browser.sleep(10000);
    const audienceTab = element(by.css('app-audience-browser .mat-tab-group .mat-tab-header .mat-tab-list')).all(by.css('.mat-tab-label'));
    audienceTab.then(function (result) {
      element.all(by.css('.single-selection-radio-group mat-radio-button')).then(function (items) {
        if (items.length > 0) {
          expect(items.length).toBeGreaterThanOrEqual(1);
          items[0].click();
          const selectedAudience = element(by.css('.audience-title'));
          expect(selectedAudience.getText()).toContain(items[0].getText());
          const applybtn = element(by.css('.e2e-audience-apply-btn'));
          applybtn.click();
          browser.sleep(10000);
          const applyiedAudience = element(by.css('.e2e-applyed-audience-name'));
          expect(selectedAudience.getText().toString()).toContain(applyiedAudience.getText().toString().split(' ')[0]);
          const defineTraget = element.all(by.id('define-target'));
          defineTraget.click();
          browser.sleep(2000);
        } else {
          const NotFound = element(by.css('.no-saved-list'));
          expect(NotFound.isPresent()).toBeTruthy();
          expect(NotFound.getText()).toBe("Your search didn't produce any results.");
        }
      });
      browser.sleep(10000);
    });
  });

  it('Able to Pick a Market', function () {
    browser.sleep(5000);
    const defineTraget = element.all(by.id('define-target'));
    defineTraget.click();
    browser.sleep(2000);
    const assignMarket = element.all(by.css('.e2e-assign-market'));
    assignMarket.click();
    browser.sleep(5000);

    const assignMarketSelection = element.all(by.css('.market-selection mat-radio-button'));
    assignMarketSelection.click();
    browser.sleep(5000);

    element.all(by.css('.radio-group-section mat-radio-button')).then(function (items) {
      if (items.length > 0) {
        expect(items.length).toBeGreaterThanOrEqual(1);
          items[0].click();
          browser.sleep(2000);
          const applyBtn = element(by.css('.e2e-apply-market-btn'));
          applyBtn.click();
          browser.sleep(5000);
          const selectedMarketName = element(by.css('.e2e-active-market-option'));
          browser.sleep(5000);
          const applyiedMarket = element(by.css('.e2e-applyed-market-name'));
          expect(selectedMarketName.getText().toString()).toContain(applyiedMarket.getText().toString().split(' ')[0]);
          browser.sleep(5000);
          defineTraget.click();
      } else {
        const NotFound = element(by.css('.e2e-no-market-found'));
          expect(NotFound.isPresent()).toBeTruthy();
          expect(NotFound.getText()).toBe('No Market Found');
      }
    });
  });



  it('Able to open key legend & close it', function () {
    browser.sleep(5000);
    const KeyLegend = element(by.css('.map-key-legend'));
    expect(KeyLegend).toBeTruthy();
    KeyLegend.click();
    const legentHeaderText = element(by.css('.legend-header p'));
    expect(legentHeaderText.getText()).toBe('Map Key');
    browser.sleep(5000);
    const closeBtn = element(by.css('.legend-header i'));
    closeBtn.click();
    element.all(by.css('.key-legends ul li')).then(function (items) {
      expect(items.length).toBeGreaterThanOrEqual(0);
    });
    browser.sleep(5000);
  });

  it('Pick specific media unit - Click on Detail Sheet', function () {
    browser.sleep(15000);
    element.all(by.css('app-explore-side-panel')).then(function (items) {
      if (items.length > 0) {
        expect(items.length).toBeGreaterThanOrEqual(1);
        const moreView = items[0].all(by.css('.e2e-more-view'));
        moreView.click();
        browser.sleep(10000);
        const inventoryPopup = element.all(by.css('.e2e-more-view'));
        expect(inventoryPopup.getText()).toBeTruthy();
        if (expect(inventoryPopup.getText()).toBeTruthy()) {
        const openInventory = element.all(by.css('.open_inventory_card_btn'));
        openInventory.click();
        browser.sleep(15000);
        // Details view sheet
        const detailView = element.all(by.css('.map-detail-view'));
        expect(detailView.getText()).toBeTruthy();
        const headerText = detailView.all(by.css('.header-body h5'));
        expect(headerText.getText()).toContain('INVENTORY DETAIL SHEET');
        }
      }
    });
  });

  it('Inventory Details sheet - top zip code &  top out of market , Pick Heat Map and get out', function () {
    browser.sleep(15000);
    const scrollToScript = 'document.getElementByClass("topzip-card").scrollIntoView();';
    // Top Zip Card
    const topzipCard = element(by.css('.topzip-card'));
    browser.actions().mouseMove(topzipCard).perform();
    const titleText = element(by.css('.topzip-card h5'));
    expect(titleText.getText()).toContain('Top Zip Codes');
    browser.sleep(10000);
    if (expect(titleText.getText()).toBeTruthy()) {
    const mapItZipBtn = element.all(by.id('map-it-zip'));
    mapItZipBtn.click();
    browser.sleep(15000);
    const isTopMapLegend = element.all(by.css('.topMapLegends'));
    expect(isTopMapLegend.getText()).toBeTruthy();
    const topZipClose = element.all(by.css('.map-top-zip-market button'));
    topZipClose.click();
    }

    // Top Zip market
    const topMarketCard = element(by.css('.topmarket-card'));
    browser.actions().mouseMove(topMarketCard).perform();
    const titleMarketText = element(by.css('.topmarket-card h5'));
    expect(titleMarketText.getText()).toContain('Top Market Areas');
    browser.sleep(15000);
    if (expect(titleMarketText.getText()).toBeTruthy()) {
    const mapItDMA = element.all(by.id('map-it-dma'));
    mapItDMA.click();
    browser.sleep(10000);
    const isTopMapLegend = element.all(by.css('.topMapLegends'));
    expect(isTopMapLegend.getText()).toBeTruthy();
    const topZipClose = element.all(by.css('.map-top-zip-market button'));
    topZipClose.click();
    browser.sleep(10000);
    const closeDetailPopup = element.all(by.css('.close_detailed_popup'));
    closeDetailPopup.click();
    browser.sleep(10000);
    element.all(by.css('.mapboxgl-popup-close-button')).click();
    browser.sleep(5000);
    }
  });

it('Perform sort by a field', function () {
    browser.sleep(10000);
    const invFiltersOprions = element.all(by.css('.e2e-sort-filters'));
    if (expect(invFiltersOprions.getText()).toBeTruthy()) {
        const sortByBtn = element.all(by.css('.sort-button'));
        sortByBtn.click();
        browser.sleep(5000);
        element.all(by.css('.side-filter-menu-item a')).then(function (items) {
        expect(items.length).toBeGreaterThanOrEqual(1);
        items[0].click();
        browser.sleep(10000);
        //expect(items[0].getText()).toContain(element.all(by.css('.sort-button')).getAttribute('title'));
        });
        browser.sleep(10000);
        sortByBtn.click();
        browser.sleep(10000);
        element.all(by.css('.side-filter-menu-item a')).then(function (items) {
        expect(items.length).toBeGreaterThanOrEqual(1);
        items[4].click();
        browser.sleep(10000);
        });
        browser.sleep(10000);
        // top 25 selection
      const topSortBtn = element.all(by.css('.top-sort-button'));
      topSortBtn.click();
      browser.sleep(10000);
      element.all(by.css('.e2e-sort-options a')).then(function (items) {
        expect(items.length).toBeGreaterThanOrEqual(1);
        items[1].click();
        browser.sleep(10000);
        const countValue = element(by.css('.e2e-inventory-count'));
        expect(countValue.getText()).toContain('25');
        });
      browser.sleep(10000);
    }
  });

  it('Save as inventory set', function () {
    browser.sleep(15000);
    const saveAsBtn = element.all(by.css('.e2e-saveas-inventory'));
    saveAsBtn.click();
    browser.sleep(10000);
    element.all(by.css('.e2e-saved-options a')).then(function (items) {
      items[0].click();
      browser.sleep(10000);
      const rNumber = Math.random();
      const utc = new Date().toJSON().slice(0, 10).replace(/-/g, '');

    const packageName	=	$$('.workspaceForm #defaultForm-name').first().sendKeys('Test Inv name ' + utc + rNumber);
    const packageNotes	=	$('#exampleFormControlTextarea1').sendKeys('Test notes');

    const applyBtn = element.all(by.css('.test-inv-submit-btn'));
    applyBtn.click();
    browser.sleep(10000);
    const inOk = element(by.css('.swal2-confirm'));
    inOk.click();
    browser.sleep(5000);
    });
    browser.sleep(10000);
  });

  it('Able to open Tabular view & customize column then do columns customization in table', function () {
      browser.sleep(10000);
      const viewTable = element(by.css('.card-heading a'));
      expect(viewTable).toBeTruthy();
      viewTable.click();
      browser.sleep(20000);

      const tabularHeaderText = element(by.css('.explore-tabular-action .explore-tabular-title h4'));
      if (tabularHeaderText) {
        expect(tabularHeaderText.getText()).toBe('Inventory List');
      }
      browser.sleep(10000);

      // customise cloumn move and remove testing
      const customizeColumn = element(by.css('#customize-column span'));
      expect(customizeColumn.getText()).toBe('Customize Columns');

      const customizeColumnBtn = element(by.css('#customize-column'));
      expect(customizeColumnBtn).toBeTruthy();
      customizeColumnBtn.click();
      browser.sleep(10000);

      const customizeColumnPopup = element(by.css('app-customize-column .mat-dialog-content'));
      expect(customizeColumnPopup).toBeTruthy();

      const customizeColumnPopupText1 = element(by.css('app-customize-column .mat-dialog-content .modal-body .data-container .subject-info-box-1 h5'));
      expect(customizeColumnPopupText1.getText()).toBe('Available Data');

      const customizeColumnPopupText2 = element(by.css('app-customize-column .mat-dialog-content .modal-body .data-container .subject-info-box-2 h5'));
      expect(customizeColumnPopupText2.getText()).toBe('Your Current View');

      const removebtn1 = element.all(by.css('#lstBox2 #boxContent .remove-column')).first();
      removebtn1.click();
      browser.sleep(10000);
      const removebtn2 = element.all(by.css('#lstBox2 #boxContent .remove-column')).first();
      removebtn2.click();
      browser.sleep(10000);
      const removebtn3 = element.all(by.css('#lstBox2 #boxContent .remove-column')).first();
      removebtn3.click();
      browser.sleep(10000);
      const removebtn4 = element.all(by.css('#lstBox2 #boxContent .remove-column')).first();
      removebtn4.click();
      browser.sleep(10000);
      const removebtn5 = element.all(by.css('#lstBox2 #boxContent .remove-column')).first();
      removebtn5.click();
      browser.sleep(10000);
      
      const customizeColumnPopupApply = element(by.css('app-customize-column .mat-dialog-content .modal-footer .apply-btn'));
      expect(customizeColumnPopupApply).toBeTruthy();

      customizeColumnPopupApply.click();
      browser.sleep(30000);

      customizeColumnBtn.click();
      browser.sleep(10000);

      const customizeColumnMoveRight = element(by.css('app-customize-column .mat-dialog-content .modal-body .data-container #btnRight'));
      customizeColumnMoveRight.click();
      customizeColumnMoveRight.click();
      customizeColumnMoveRight.click();
      browser.sleep(10000);

      customizeColumnPopupApply.click();
      browser.sleep(30000);

      const unselect = element.all(by.className('e2e-checked')).first();
      if (unselect) {
        unselect.click();
        browser.sleep(10000);
      }

      if (unselect) {
        unselect.click();
        browser.sleep(10000);
      }

      const close = element(by.css('.explore-tabular-toggle-close-button .mapboxgl-ctrl button'));
      close.click();
      browser.sleep(10000);
  });

});


