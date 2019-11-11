import { browser, by, element, protractor, $ } from 'protractor';

by.addLocator('formControlName', function(value, opt_parentElement, opt_rootSelector) {
    const using = opt_parentElement || document;
    return using.querySelectorAll('[formControlName="' + value + '"]');
  });
let trimProjectName;
let invPackageName;
describe('WorkSpace: Scenario View Page', () => {
  /* beforeEach(() => {
    page.navigateTo();
  });*/

    it('Go to Projects View page', function() {
    browser.waitForAngularEnabled(false);
    browser.sleep(10000);
    const workSpaceBtn	=	element(by.css('.workspace-link')).element(by.tagName('a'));
    browser.sleep(1000);
    browser.actions().click(workSpaceBtn).perform();
    browser.sleep(15000);
    browser.driver.getCurrentUrl().then((url) => {
        if (/lists/.test(url)) {
          browser.sleep(1000);
          const searchBtn = element(by.tagName('app-project-list a.parent-search-icon'));
          searchBtn.click();
          const searchField = element(by.tagName('app-project-list input.mat-input-element'));
          searchField.sendKeys('Untitled Project 2');
          browser.sleep(1000);

            trimProjectName	=	element.all(by.css('.mat-row')).get(0).element(by.tagName('a')).getText().
            then(function(text){ return text.toUpperCase().substring(0, 10); });
            const projectNameLink	=	element.all(by.css('.mat-row')).get(0).element(by.tagName('a'));
            browser.actions().click(projectNameLink).perform();
            browser.sleep(10000);
            /* browser.actions().click(pjctNote).perform();
            browser.sleep(5000); */
            /* if (expect(element.all(by.tagName('mat-row')).count()).toBeGreaterThanOrEqual(1)) {

            } else {
              expect(element(by.css('.noDataFound')).isPresent()).toBe(true);
            } */
            // expect(element(by.tagName('mat-row'))).toBeGreaterThanOrEqual(1);
        }
     });
   });

it('Go to scenario viw/edit page & check breadcrumbs', function() {
    browser.driver.getCurrentUrl().then((url) => {
      if (url.includes('/projects/')) {
        const sceCount  = element.all(by.tagName('mat-row')).count().then(function(count) {
            // return count;
          if (count > 0) {
        const scenarioName	=	element.all(by.css('.mat-row')).get(0).element(by.tagName('a')).getText().
            then(function(text){ return text.toUpperCase().substring(0, 10); });
        const scenarioNameLink	=	element.all(by.css('.mat-row')).get(0).element(by.tagName('a'));
        browser.actions().click(scenarioNameLink).perform();
        browser.sleep(10000);

        const firstLink = element(by.css('.breadcrumb-label:first-child'));
        const secondLink = element(by.tagName('.breadcrumb-label:nth-child(3)'));
        const thirdLink = element(by.tagName('.breadcrumb-label:nth-child(5)'));
        const fourthLink = element(by.css('.breadcrumb-label:last-child'));
        const projectName = thirdLink.getText();
        browser.sleep(3000);
        expect(firstLink.getText()).toEqual('WORKSPACE');
        expect(secondLink.getText()).toEqual('MY PROJECTS');
        expect(projectName).toContain(trimProjectName);
        expect(fourthLink.getText()).toContain(scenarioName);
          }
        });
      }
    });
  });

  it('Go to scenario notes in scenario View page', function() {
    browser.driver.getCurrentUrl().then((url) => {
        if (url.includes('/scenarios/')) {
            browser.sleep(10000);
            const pjctNote  =   element(by.css('.customer-asign-icon'));
            browser.actions().click(pjctNote).perform();
            browser.sleep(5000);
            const editNote = element.all(by.css('.assign-icon')).get(1);
            browser.actions().click(editNote).perform();
            browser.sleep(10000);

            const sceNoteField = element(by.formControlName('notes'));
            sceNoteField.sendKeys('test notes');
            browser.sleep(500);
            const saveNoteBtn   =   element(by.css('.note-save-button'));
            browser.actions().click(saveNoteBtn).perform();
            browser.sleep(5000);
        }
    });
  });

   it('Go to scenario edits in scenario View page', function() {
    browser.driver.getCurrentUrl().then((url) => {
    if (url.includes('/scenarios/')) {
        browser.sleep(10000);
        const editDesc = element(by.tagName('h2')).element(by.css('.hide-when-edit'));
        browser.actions().click(editDesc).perform();
        browser.sleep(10000);

        const sceDesField = element(by.formControlName('description'));
        const scenarioTags = element(by.formControlName('scenario_tags'));

        sceDesField.sendKeys('Sample description.');
        browser.sleep(1000);
        scenarioTags.click();
        browser.sleep(500);
        element(by.tagName('tag-input-form')).element(by.tagName('input')).sendKeys('test3');
        browser.actions().sendKeys(protractor.Key.ENTER).perform();
        browser.sleep(1000);

        const audienceTag = element(by.formControlName('default_audience'));
        browser.actions().click(audienceTag).perform();
        browser.sleep(5000);
        const audMatOption1 = element.all(by.tagName('mat-option')).get(1);
        // expect(matOption1.getText()).toBe('fdsffds');
        browser.actions().mouseMove(audMatOption1).perform();
        audMatOption1.click();
        browser.sleep(5000);

        const marketTag = element(by.formControlName('default_market'));
        browser.actions().click(marketTag).perform();
        browser.sleep(5000);
        const marketMatOption1 = element.all(by.tagName('mat-option')).get(1);
        // expect(matOption1.getText()).toBe('fdsffds');
        browser.actions().mouseMove(marketMatOption1).perform();
        marketMatOption1.click();
        browser.sleep(5000);

        const startDate = element(by.formControlName('start'));
        browser.actions().click(startDate).perform();
        browser.sleep(5000);

        const secondDate    =   element.all(by.css('.mat-calendar-body-cell')).get(2);
        browser.actions().click(secondDate).perform();
        browser.sleep(5000);

        const endDate = element(by.formControlName('end'));
        browser.actions().click(endDate).perform();
        browser.sleep(5000);

        const endDateCal    =   element.all(by.css('.mat-calendar-body-cell')).get(4);
        browser.actions().click(endDateCal).perform();
        browser.sleep(5000);

        const selectInventory = $('.select-inventory');
        invPackageName = selectInventory.element(by.css('.mat-select-value-text')).element(by.tagName('span')).getText().
        then(function(text){ return text.substring(0, 5); });
        browser.actions().click(selectInventory).perform();
        browser.sleep(10000);
        const invMatOption = element.all(by.tagName('mat-option')).get(2);
        // expect(matOption1.getText()).toBe('fdsffds');
        browser.actions().mouseMove(invMatOption).perform();
        invMatOption.click();
        browser.sleep(5000);
        expect(element.all(by.tagName('mat-row')).count()).toBeGreaterThanOrEqual(1);

        const saveScenarioBtn = element(by.css('mat-toolbar .button-primary'));
        browser.sleep(1000);
        saveScenarioBtn.click();
        browser.sleep(5000);
        expect(element(by.css('.button-primary')).element(by.tagName('span')).getText()).toBe('SCENARIO SAVED');

        }
    });
  });

   it('Go to map inventory', function() {
    browser.driver.getCurrentUrl().then((url) => {
      if (url.includes('/scenarios/')) {
        browser.sleep(5000);
        const mapInvBtn = element(by.css('.map-inventory'));
        browser.sleep(1000);
        mapInvBtn.click();
        browser.sleep(10000);

        browser.driver.getCurrentUrl().then((cururl) => {
             expect(cururl.includes('/explore')).toBe(true);
             const invPackage = element.all(by.css('.filter-button')).get(5).element(by.tagName('span')).getText();
              expect(invPackage).toContain(invPackageName);
        });
      }
    });
  });

   it('Duplicate Scenario in list options in scenario View page', function() {
    browser.get('/projects/lists');
    browser.driver.getCurrentUrl().then((url) => {
    browser.sleep(10000);
    // expect(url.includes('/lists/')).toBe(true);
      if (/lists/.test(url)) {

            browser.sleep(1000);
            const searchBtn = element(by.tagName('app-project-list a.parent-search-icon'));
            searchBtn.click();
            const searchField = element(by.tagName('app-project-list input.mat-input-element'));
            searchField.sendKeys('Untitled Project 2');
            browser.sleep(1000);

          const projectName	=	element.all(by.css('.mat-row')).get(0).element(by.tagName('a'));
          browser.actions().click(projectName).perform();
          browser.sleep(10000);
          const sceCount  = element.all(by.tagName('mat-row')).count().then(function(count) {
            // return count;
          if (count > 0) {

            const scenarioNameLink	=	element.all(by.css('.mat-row')).get(0).element(by.tagName('a'));
            browser.actions().click(scenarioNameLink).perform();
            browser.sleep(10000);

            const scenarioOptions = element(by.css('.scenario-action-menu'));
            browser.actions().click(scenarioOptions).perform();
            browser.sleep(5000);
            const dupScenario = element.all(by.css('.mat-menu-item')).get(0);
            browser.actions().click(dupScenario).perform();
            browser.sleep(10000);

            const createScebtn = element(by.css('.geo-button'));
            browser.actions().click(createScebtn).perform();
            browser.sleep(5000);

            browser.driver.getCurrentUrl().then((cururl) => {
              expect(cururl.includes('/scenarios/')).toBe(true);
            });
          }
        });
        }
    });
  });

  it('Delete Scenario in list options in scenario View page', function() {
    browser.get('/projects/lists');
    browser.driver.getCurrentUrl().then((url) => {
    browser.sleep(10000);
    // expect(url.includes('/lists/')).toBe(true);
      if (/lists/.test(url)) {
            browser.sleep(1000);
            const searchBtn = element(by.tagName('app-project-list a.parent-search-icon'));
            searchBtn.click();
            const searchField = element(by.tagName('app-project-list input.mat-input-element'));
            searchField.sendKeys('Untitled Project 2');
            browser.sleep(1000);

          const projectName	=	element.all(by.css('.mat-row')).get(0).element(by.tagName('a'));
          browser.actions().click(projectName).perform();
          browser.sleep(10000);
          const sceCount  = element.all(by.tagName('mat-row')).count().then(function(count) {
            // return count;
          if (count > 0) {

            const scenarioNameLink	=	element.all(by.css('.mat-row')).get(0).element(by.tagName('a'));
            browser.actions().click(scenarioNameLink).perform();
            browser.sleep(10000);

            const scenarioOptions = element(by.css('.scenario-action-menu'));
            browser.actions().click(scenarioOptions).perform();
            browser.sleep(5000);
            const delScenario = element.all(by.css('.mat-menu-item')).get(1);
            browser.actions().click(delScenario).perform();
            browser.sleep(10000);

            const sceDel	=	$('.swal2-buttonswrapper').all(by.tagName('button')).get(0);
            browser.actions().click(sceDel).perform();
            browser.sleep(10000);
            expect(element(by.tagName('div.swal2-content')).getText()).toEqual('Scenario set deleted successfully');
            const delOK	=	$('.swal2-buttonswrapper').all(by.tagName('button')).get(0);
            browser.actions().click(delOK).perform();
            browser.sleep(5000);

          }
        });
        }
    });
  });


});
