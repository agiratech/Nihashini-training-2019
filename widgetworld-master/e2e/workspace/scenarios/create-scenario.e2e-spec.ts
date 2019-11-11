import { browser, by, element, protractor } from 'protractor';

by.addLocator('formControlName', function(value, opt_parentElement, opt_rootSelector) {
  const using = opt_parentElement || document;
  return using.querySelectorAll('[formControlName="' + value + '"]');
});

describe('WorkSpace: Scenario Create Page', () => {

  it('Go to Scenario create page from project view page', function() {
    browser.get('/projects/lists');
    browser.sleep(10000);
    /* const workspaceTab = element(by.css('[module="projects"] span'));
    expect(workspaceTab.getText()).toBe('WORKSPACE');
    workspaceTab.click();
    browser.sleep(3000);
    const selectAnyProject = element(by.css('.mat-cell .geo-button-link'));
    browser.sleep(1000);
    selectAnyProject.click();
    browser.sleep(2000); */
    browser.sleep(1000);
    const searchBtn = element(by.tagName('app-project-list a.parent-search-icon'));
    searchBtn.click();
    const searchField = element(by.tagName('app-project-list input.mat-input-element'));
    searchField.sendKeys('Untitled Project 2');
    browser.sleep(1000);

    const projectName	=	element.all(by.css('.mat-row')).first().element(by.tagName('a'));
    browser.actions().click(projectName).perform();
    browser.sleep(10000);

    const addScenarioLink = element(by.css('.new-project'));
    browser.sleep(2000);
    addScenarioLink.click();
    browser.sleep(2000);
  });
  /* it('Breadcrumbs for scenario create page', function(){
    browser.sleep(2000);
    browser.driver.getCurrentUrl().then((createUrl) => {
      if (/create-scenario/.test(createUrl)) {
        browser.sleep(1000);
        const firstLink = element(by.css('.breadcrumb-label:first-child'));
        const secondLink = element(by.tagName('.breadcrumb-label:nth-child(3)'));
        const thirdLink = element(by.tagName('.breadcrumb-label:nth-child(5)'));
        const fourthLink = element(by.css('.breadcrumb-label:last-child'));
        const projectName = thirdLink.getText();
        browser.sleep(3000);
        expect(firstLink.getText()).toEqual('WORKSPACE');
        expect(secondLink.getText()).toEqual('MY PROJECTS');
        expect(fourthLink.getText()).toEqual('UNTITLED SCENAR...');
      }
    });
  }); */

  it('Checking toolbar items  Presents(Backlink,Note button,save & map inventory button)', function() {
    browser.driver.getCurrentUrl().then((createUrl) => {
      if (/create-scenario/.test(createUrl)) {
        browser.sleep(1000);
        const backLink = element(by.css('mat-toolbar>a'));
        const projectNoteLink = element(by.css('.customer-asign-icon mat-icon'));
        const saveBtn = element(by.css('mat-toolbar .button-primary'));
        const mapInventoryBtn = element(by.css('mat-toolbar .map-inventory'));

        expect(backLink.getText()).toContain('arrow_back Back to');
        expect(projectNoteLink.getText()).toEqual('assignment');
        expect(saveBtn.getText()).toEqual('SAVE SCENARIO');
        expect(mapInventoryBtn.getText()).toEqual('MAP INVENTORY');

        /** scenario note, map inventory and save button colors */
        expect(projectNoteLink.getCssValue('color')).toBe('rgba(33, 33, 33, 0.384)');
        expect(saveBtn.getCssValue('background-color')).toBe('rgba(146, 42, 149, 1)');
        expect(mapInventoryBtn.getCssValue('background-color')).toBe('rgba(255, 255, 255, 1)');
      }
    });
  });

  it('Scenario name, description and tags checking and sending keys', function() {
    browser.driver.getCurrentUrl().then((createUrl) => {
      if (/create-scenario/.test(createUrl)) {
        browser.sleep(1000);
        const scenarioName = element(by.css('.h1-letterspacing'));
        const editTitleIcon = element(by.css('.h1-letterspacing mat-icon'));
        expect(scenarioName.getText()).toContain('Untitled Scenario');
        expect(editTitleIcon.getCssValue('color')).toBe('rgba(213, 213, 213, 1)');
        editTitleIcon.click();
        browser.sleep(2000);
        const scenarioEditName = element(by.css('.name-edit-input input[formcontrolname="name"]'));

        expect(scenarioEditName.getTagName()).toBe('input');
        scenarioEditName.clear();
        browser.sleep(500);
        scenarioEditName.sendKeys('Scenario1');

        const sceDesField = element(by.formControlName('description'));
        const scenarioTags = element(by.formControlName('scenario_tags'));

        expect(sceDesField.getAttribute('placeholder')).toEqual('Scenario description');
        expect(scenarioTags.getAttribute('placeholder')).toEqual('Scenario Tags. To enter multiple tags, press Enter after each tag.');

        expect(sceDesField.getTagName()).toBe('textarea');
        expect(scenarioTags.getTagName()).toBe('tag-input');
        sceDesField.click();
        browser.sleep(500);
        sceDesField.sendKeys('Sample description. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce orci elit, accumsan nec neque pulvinar, eleifend luctus sem. Maecenas mattis mauris sed ante suscipit. Fusce orci elit, accumsan nec neque pulvinar, eleifend luctus sem. Maecenas mattis mauris sed ante suscipit.');
        browser.sleep(1000);
        scenarioTags.click();
        browser.sleep(1000);

        element(by.tagName('tag-input-form')).element(by.tagName('input')).sendKeys('tag1');
        browser.actions().sendKeys(protractor.Key.ENTER).perform();
        browser.sleep(2000);
      }
    });
  });

  it('Default Scenario Values', function(){
    browser.driver.getCurrentUrl().then((createUrl) => {
      if (/create-scenario/.test(createUrl)) {
        browser.sleep(1000);
        const defaultScenario = element.all(by.css('h5')).get(1);
        expect(defaultScenario.getText()).toEqual('Default Scenario Values');
        const audienceLabel = element.all(by.css('label.placeholder-text')).get(0);

        const marketLabel = element.all(by.css('label.placeholder-text')).get(1);

        const startDateLabel = element.all(by.css('label.placeholder-text')).get(2);

        const endDateLabel = element.all(by.css('label.placeholder-text')).get(3);

        expect(audienceLabel.getText()).toBe('AUDIENCE');
        expect(marketLabel.getText()).toBe('MARKET');
        expect(startDateLabel.getText()).toContain('PLANNED START DATE');
        expect(endDateLabel.getText()).toContain('PLANNED END DATE');

        const audienceTag = element(by.formControlName('default_audience'));
        const marketTag = element(by.formControlName('default_market'));

        const startDate = element(by.formControlName('start'));
        const endDate = element(by.formControlName('end'));
        
        expect(audienceTag.getTagName()).toBe('mat-select');
        expect(marketTag.getTagName()).toBe('mat-select');
        expect(startDate.getTagName()).toBe('input');
        expect(endDate.getTagName()).toBe('input');

        const inventoryUnitsText = element.all(by.css('h5')).get(2);
        expect(inventoryUnitsText.getText()).toBe('Inventory Units in this Scenario (0)');

        const selectInventory = element(by.css('.select-inventory'));
        expect(selectInventory.getTagName()).toBe('mat-select');
        const selectInventoryPlaceHolder =  element.all(by.css('.select-inventory .mat-select-placeholder')).get(0);
        expect(selectInventoryPlaceHolder.getText()).toBe('Select Inventory Set');
        selectInventory.click();
        browser.sleep(500);
        const matOption1 = element.all(by.tagName('mat-option')).get(1);
        // expect(matOption1.getText()).toBe('fdsffds');
        browser.actions().mouseMove(matOption1).perform();
        matOption1.click();
        browser.sleep(1000);
        const swal2Title = element(by.css('.swal2-title'));
        expect(swal2Title.getText()).toEqual('You have to choose audience before selecting inventory set.');
        const okBtn = element(by.css('.swal2-confirm'));
        expect(okBtn.getText()).toBe('OK');
        browser.sleep(1000);
        okBtn.click();
        browser.sleep(1000);
        audienceTag.click();
        browser.sleep(500);
        const audienceOption = element.all(by.tagName('mat-option')).get(1);
        // expect(audienceOption.getText()).toBe('Ads on mobile phones provide useful info');
        audienceOption.click();
        browser.sleep(500);

        marketTag.click();
        browser.sleep(500);
        const marketOption = element.all(by.tagName('mat-option')).get(1);
        // expect(marketOption.getText()).toBe('Abilene-Sweetwater, TX');
        marketOption.click();
        browser.sleep(500);
        startDate.click();
        browser.sleep(500);
        const startDateSel = element.all(by.css('.mat-calendar-body-cell')).get(2);
        browser.actions().click(startDateSel).perform();
        browser.sleep(2000);
        const matError = element(by.css('mat-error'));
        expect(matError.getText()).toBe('Both start and end date must be entered or left blank');
        browser.sleep(1000);

        endDate.click();
        browser.sleep(500);
        browser.actions().click(startDateSel).perform();
        browser.sleep(1000);

        expect(matError.getText()).toBe('Start Date should be less than End Date');
        browser.sleep(500);
        endDate.click();
        browser.sleep(1000);
        const endDateSel = element.all(by.css('.mat-calendar-body-cell')).get(4);
        browser.actions().click(endDateSel).perform();
        browser.sleep(1000);

        selectInventory.click();
        browser.sleep(1000);
        const matOption0 = element.all(by.tagName('mat-option')).get(0);
        browser.actions().mouseMove(matOption1).perform();
        matOption0.click();
        browser.sleep(7000);
        
      }
    });
  });

  it('Scenario Notes', function(){
    browser.driver.getCurrentUrl().then((createUrl) => {
      if (/create-scenario/.test(createUrl)) {
        browser.sleep(2000);
        const scenarioNoteLink = element(by.css('.customer-asign-icon mat-icon'));
        scenarioNoteLink.click();
        browser.sleep(1000);
        const scenarioEditable = element(by.css('.scenario-note-content h5'));
        expect(scenarioEditable.getText()).toContain('Scenario Notes');
        browser.sleep(2000);
        scenarioEditable.click();

        const scenarioNotes = element(by.css('.scenario-note-content textarea[formcontrolname="notes"]'));

        scenarioNotes.sendKeys('Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centurie');

        browser.sleep(500);
        const saveButton = element(by.css('.note-save-button'));
        expect(saveButton.getText()).toBe('SAVE');
        browser.sleep(1000);
        scenarioNoteLink.click();

        // saveButton.click();
        browser.sleep(1000);

        const saveScenarioBtn = element(by.css('mat-toolbar .button-primary'));
        saveScenarioBtn.click();
        browser.sleep(10000);
        

      }
    });
  });
});
