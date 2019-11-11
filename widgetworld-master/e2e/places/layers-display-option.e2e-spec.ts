import { AppPage } from '../app.po';
import { browser, by, element } from 'protractor';

describe('Place: Go to Places module', () => {
  it('Open Layers & Display Options Filter', function () {
    browser.waitForAngularEnabled(false);
    browser.sleep(10000);
    const navPalceBtn = element(by.css('.places-link'));
    browser.sleep(1000);
    // Opening places page
    browser.actions().click(navPalceBtn).perform();
    browser.sleep(20000);
    browser.driver.getCurrentUrl().then((url) => {
      // expect(url.includes('/lists/')).toBe(true);
      if (/places/.test(url)) {
        const layersTab = element(by.id('layers-display-target'));
        browser.actions().click(layersTab).perform();
        browser.sleep(3000);
      }
    });
  });
});

describe('Place: Go to Places module', () => {
  const page = new AppPage();

  beforeEach(() => {
    browser.driver.getCurrentUrl().then(function (url) {
      return expect((/places/).test(url)).toBe(true);
    });
  });

  it('Test Toggle on/off Map Controls', function () {
    browser.sleep(20000);
    // Getting display options tab reference and clicking on it
    const displayOptionsTab =  element.all(by.className('test-display-options')).first();
    expect(displayOptionsTab.getText()).toBe('Display Options');
    displayOptionsTab.click();
    browser.sleep(2000);

    // Getting the apply button reference
    const applyBtn = element.all(by.className('test-apply-btn')).first();
    expect(applyBtn.getText()).toContain('APPLY VIEW');

    // Getting the Map controls check box reference
    const mapControls = element(by.className('test-map-controls'));

    // Getting the map controls div reference
    let isShowMapControls = element(by.className('notShowMapControls'));
    // By default map controls have to display
    expect(isShowMapControls.isPresent()).toBe(false);

    // disabling the map controls
    mapControls.click();
    browser.sleep(5000);
    applyBtn.click();
    browser.sleep(8000);

    // Getting the map controls div reference
    isShowMapControls = element(by.className('notShowMapControls'));
    // Checking whether mapcontrols hidden or not
    expect(isShowMapControls.isPresent()).toBe(true);
    browser.sleep(5000);


    // enabling the map controls
    mapControls.click();
    browser.sleep(5000);
    applyBtn.click();
    browser.sleep(8000);

    // Getting the map controls div reference
    isShowMapControls = element(by.className('notShowMapControls'));
    // Now options have to display
    expect(isShowMapControls.isPresent()).toBe(false);
  });


  it('Test Toggle on/off Map Legends', function () {
    browser.sleep(10000);
    // Getting display options tab reference and clicking on it
    const displayOptionsTab =  element.all(by.className('test-display-options')).first();
    expect(displayOptionsTab.getText()).toBe('Display Options');
    displayOptionsTab.click();
    browser.sleep(2000);

    // Getting the apply button reference
    const applyBtn = element.all(by.className('test-apply-btn')).first();
    expect(applyBtn.getText()).toContain('APPLY VIEW');

    // Getting the Map Legends check box reference
    const mapLegends = element(by.className('test-map-legend'));

    // Getting the map legends div reference
    let isShowMapControls = element(by.className('notShowMapLegends'));
    // By default map legends have to display
    expect(isShowMapControls.isPresent()).toBe(false);

    // disabling the map legends
    mapLegends.click();
    browser.sleep(5000);
    applyBtn.click();
    browser.sleep(8000);

    // Getting the map legeds div reference
    isShowMapControls = element(by.className('notShowMapLegends'));
    // Checking whether mapcontrols hidden or not
    expect(isShowMapControls.isPresent()).toBe(true);
    browser.sleep(5000);


    // enabling the map legends
    mapLegends.click();
    browser.sleep(5000);
    applyBtn.click();
    browser.sleep(8000);

    // Getting the map legends div reference
    isShowMapControls = element(by.className('notShowMapLegends'));
    // Now options have to display
    expect(isShowMapControls.isPresent()).toBe(false);
  });
  
  it('Testing Custom text functionality', function () {
    browser.sleep(10000);
    // Getting display options tab reference and clicking on it
    const displayOptionsTab =  element.all(by.className('test-display-options')).first();
    expect(displayOptionsTab.getText()).toBe('Display Options');
    displayOptionsTab.click();
    browser.sleep(2000);

    // Getting the apply button reference
    const applyBtn = element.all(by.className('test-apply-btn')).first();
    expect(applyBtn.getText()).toContain('APPLY VIEW');

    // Testing custom text
    const displayCustomText = element.all(by.className('test-custom-text-title')).first();
    const displayCustomTextCheckbox = element(by.className('test-custom-text-checkbox'))
      .element(by.className('mat-checkbox-layout'));
    expect(displayCustomText.getText()).toContain('Custom Text');
    displayCustomTextCheckbox.click();
    browser.sleep(1000);

    // Applying custom text with background
    const displayCustomTextTextBox = element.all(by.className('test-custom-text-textbox')).first();
    displayCustomTextTextBox.sendKeys('Custom Text');
    const displayCustomTextBgCheckBox = element.all(by.className('test-custom-text-bg-checkbox')).first();
    displayCustomTextBgCheckBox.click();
    browser.sleep(3000);
    applyBtn.click();
    browser.sleep(8000);

    const customTextDiv = element(by.id('customTextElement'));
    expect(customTextDiv.isPresent()).toBe(true);
    expect(page.hasClass(customTextDiv, 'white-bg')).toBe(true, 'white-bg not applied in customTextElement');
    browser.sleep(8000);

    // Applying custom text with out background
    displayCustomTextBgCheckBox.click();
    browser.sleep(3000);
    applyBtn.click();
    browser.sleep(8000);
    expect(customTextDiv.isPresent()).toBe(true);
    expect(page.hasClass(customTextDiv, 'white-bg')).toBe(false, 'white-bg applied in customTextElement');
  });


  it('Testing Base Map functionality', function () {
    browser.sleep(10000);
    // Getting display options tab reference and clicking on it
    const displayOptionsTab =  element.all(by.className('test-display-options')).first();
    expect(displayOptionsTab.getText()).toBe('Display Options');
    displayOptionsTab.click();
    browser.sleep(2000);

    // Getting the apply button reference
    const applyBtn = element.all(by.className('test-apply-btn')).first();
    expect(applyBtn.getText()).toContain('APPLY VIEW');

    // start of base map testcase
    const baseMapPanel = element(by.className('test-base-map'));
    baseMapPanel.click();
    browser.sleep(5000);

    const satelliteMap = element(by.className('test-map-satellite'));
    satelliteMap.click();
    browser.sleep(5000);
    applyBtn.click();
    browser.sleep(15000);
    const mapDiv =  element.all(by.className('mapboxgl-map')).first();
    expect(mapDiv.isPresent()).toBe(true);
    expect(page.hasClass(mapDiv, 'satellite')).toBe(true, 'satellite layer not applied');

    const baseMap = element(by.className('test-map-light'));
    baseMap.click();
    browser.sleep(5000);
    applyBtn.click();
    browser.sleep(15000);
    expect(mapDiv.isPresent()).toBe(true);
    expect(page.hasClass(mapDiv, 'light')).toBe(true, 'light layer not applied');
  });


  it('Testing Custom Logo functionality', function () {
    const fileToUpload = '../test-logo.png';
    const path = require('path'),
    remote = require('selenium-webdriver/remote');
    browser.sleep(10000);
    // Getting display options tab reference and clicking on it
    const displayOptionsTab =  element.all(by.className('test-display-options')).first();
    expect(displayOptionsTab.getText()).toBe('Display Options');
    displayOptionsTab.click();
    browser.sleep(2000);

    // Getting the apply button reference
    const applyBtn = element.all(by.className('test-apply-btn')).first();
    expect(applyBtn.getText()).toContain('APPLY VIEW');

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
    const displayCustomLogoBgCheckBox = element.all(by.className('test-custom-logo-bg-radio')).first();
    displayCustomLogoBgCheckBox.click();
    browser.sleep(3000);

    applyBtn.click();
    browser.sleep(8000);
    const customLogoDiv = element(by.id('customLogoElement'));
    expect(customLogoDiv.isPresent()).toBe(true);
    expect(page.hasClass(customLogoDiv, 'white-bg')).toBe(true, 'white-bg not applied in customLogoElement');
    browser.sleep(5000);
  });

  it('layers with custom layers with apply view', function() {
    browser.sleep(10000);
    browser.waitForAngularEnabled(false);
    browser.sleep(8000);
    const layersTab =   element.all(by.className('test-layers')).first();
    layersTab.click();
    browser.sleep(5000);

    const availableLayer = element.all(by.className('test-available-layer')).first();

    expect(availableLayer.getText()).toContain('Available Layers');


    const selectedLayers = element.all(by.className('test-selected-layer')).first();

    expect(selectedLayers.getText()).toContain('Selected Layers');


    const placeSetPanel = element.all(by.className('test-place-sets')).first();
    expect(placeSetPanel.getText()).toContain('Place Sets');

    const singlePlacePanel = element.all(by.className('test-single-place')).first();
    expect(singlePlacePanel.getText()).toContain('Single Place');

    const singlePlaceGeoPanel = element.all(by.className('test-single-place-geo')).first();
    expect(singlePlaceGeoPanel.getText()).toContain('Specific Geography');

    const clearBtn = element.all(by.className('test-clear-all-btn')).first();

    const applyBtn = element.all(by.className('test-apply-btn')).first();

    // Selecting a place set from place set list
    browser.sleep(5000);
    placeSetPanel.click();
    const firstPlaceSet = element.all(by.className('test-place-set-item')).first().all(by.tagName('button')).first();
    browser.sleep(1000);
    firstPlaceSet.isPresent().then(function(result) {
      if (result) {
        firstPlaceSet.click();
      }
    });
    // Searching and finding a place
    singlePlacePanel.click();
    browser.sleep(1000);
    const singlePlaceInput = element.all(by.className('test-place-search')).first();

    browser.sleep(10000);

    singlePlaceInput.isPresent().then(function(result) {

      if (result) {
        singlePlaceInput.click();
        browser.sleep(8000);
        singlePlaceInput.sendKeys('alaska');
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


    // Searching places by Geography

    singlePlaceGeoPanel.click();
    browser.sleep(1000);
    const singlePlaceGeoInput = element.all(by.className('test-place-geo-search')).first();

    browser.sleep(10000);

    singlePlaceGeoInput.isPresent().then(function(result) {

      if (result) {
        singlePlaceGeoInput.click();
        browser.sleep(8000);
        singlePlaceGeoInput.sendKeys('alaska');
        browser.sleep(10000);
      }

    });
    const firstSinglePlaceGeo = element.all(by.className('geography-autocomplete-layer'))
    .all(by.tagName('mat-list-item')).get(0).all(by.tagName('button')).first();
    firstSinglePlaceGeo.isPresent().then(function(result) {
      if (result) {
        firstSinglePlaceGeo.click();
        browser.sleep(8000);
      }
    });
    browser.sleep(8000);
    applyBtn.click();
    browser.sleep(8000);
    clearBtn.click();
  });

  it('clear selected layers & display options', function() {
    browser.waitForAngularEnabled(false);
    browser.sleep(10000);
    // Getting display options tab reference and clicking on it
    const displayOptionsTab =  element.all(by.className('test-display-options')).first();
    expect(displayOptionsTab.getText()).toBe('Display Options');
    displayOptionsTab.click();
    browser.sleep(2000);

    const clearBtn = element.all(by.className('test-clear-all-btn')).first();
    clearBtn.click();
    browser.sleep(5000);

    // Getting the map controls div reference
    const isShowMapControls = element(by.className('notShowMapControls'));
    // By default map controls have to display
    expect(isShowMapControls.isPresent()).toBe(false);
  });

});
