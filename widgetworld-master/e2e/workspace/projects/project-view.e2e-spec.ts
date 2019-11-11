import { AppPage } from '../../app.po';
import { browser, by, element, protractor, $ } from 'protractor';

by.addLocator('formControlName', function(value, opt_parentElement, opt_rootSelector) {
  const using = opt_parentElement || document;
  return using.querySelectorAll('[formControlName="' + value + '"]');
});

describe('WorkSpace: Project View Page', () => {
  const page = new AppPage();

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
      // expect(url.includes('/lists/')).toBe(true);
        if (/lists/.test(url)) {

          browser.sleep(1000);
          const searchBtn = element(by.tagName('app-project-list a.parent-search-icon'));
          searchBtn.click();
          const searchField = element(by.tagName('app-project-list input.mat-input-element'));
          searchField.sendKeys('Untitled Project 2');
          browser.sleep(1000);

          const projectName	=	element.all(by.css('.mat-row')).get(0).element(by.tagName('a')).getText().
          then(function(text){ return text.toUpperCase().substring(0, 10); });
          const projectNameLink	=	element.all(by.css('.mat-row')).get(0).element(by.tagName('a'));
          browser.actions().click(projectNameLink).perform();
          browser.sleep(10000);
          const firstLink = element(by.css('.breadcrumb-label:first-child'));
          const secondLink = element(by.tagName('.breadcrumb-label:nth-child(3)'));
          const thirdLink = element(by.css('.breadcrumb-label:last-child'));
          browser.sleep(3000);
          expect(firstLink.getText()).toEqual('WORKSPACE');
          expect(secondLink.getText()).toEqual('MY PROJECTS');
          expect(thirdLink.getText()).toContain(projectName);
          const editDesc = element(by.tagName('h2')).element(by.css('.hide-when-edit'));
          browser.actions().click(editDesc).perform();
          browser.sleep(10000);
          // element.all(by.tagName('mat-form-field')).get(3).element(by.css('.body-1')).sendKeys('test description');
          // expect(element.all(by.tagName('mat-form-field')).getAttribute('placeholder')).;
          const pjctDesField = element(by.formControlName('description'));
          pjctDesField.sendKeys('test description');
          element(by.tagName('tag-input-form')).element(by.tagName('input')).sendKeys('test3');
          browser.actions().sendKeys(protractor.Key.ENTER).perform();
          browser.sleep(5000);
          const saveBtn   =   element(by.css('.button-primary'));
          browser.actions().click(saveBtn).perform();
          browser.sleep(5000);
          expect(element(by.css('.button-primary')).element(by.tagName('span')).getText()).toBe('PROJECT SAVED');

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

   it('Scenarios in this project check', function() {
    browser.driver.getCurrentUrl().then((url) => {
      if (url.includes('/projects/')) {
        const sceCount  = element.all(by.tagName('mat-row')).count().then(function(count) {
            const sceText = 'Scenarios in This Project (' + count + ')';
          expect(element(by.css('.heading-5')).getText()).toBe(sceText);

          });
      }
    });
  });

   it('Search scenarios in projects View page with positive', function() {
    browser.driver.getCurrentUrl().then((url) => {
      if (url.includes('/projects/')) {
        const sceCount  = element.all(by.tagName('mat-row')).count().then(function(count) {
          // return count;
        if (count > 0) {
        const searchIcon  =   element(by.css('.parent-search-icon'));
        browser.actions().click(searchIcon).perform();
        browser.sleep(5000);

        const scenarioName = element(by.css('.search-place')).element(by.tagName('input')).sendKeys('Dup');
        browser.sleep(5000);
        const closeBtn = element(by.tagName('app-project-view i.close-project-field')).parentElementArrayFinder;
        browser.sleep(1000);
        closeBtn.click();
        browser.sleep(1000);
        }
      });
      }
    });
  });

  /* it('Search scenarios in projects View page with negative', function() {
    browser.driver.getCurrentUrl().then((url) => {
      if (url.includes('/projects/')) {
        const searchIcon  =   element(by.css('.parent-search-icon'));
        browser.actions().click(searchIcon).perform();
        browser.sleep(5000);

        const scenarioName = element(by.css('.search-place')).element(by.tagName('input')).sendKeys('!@#$');
        browser.sleep(5000);
        expect(element(by.tagName('app-project-view div.noDataFound')).getText()).toEqual('No Record Found');
        const closeBtn = element(by.tagName('app-project-view i.close-project-field')).parentElementArrayFinder;
        browser.sleep(1000);
        closeBtn.click();
        browser.sleep(1000);
      }
    });
  }); */

   it('Go to projects notes in projects View page', function() {
      browser.sleep(10000);
      const pjctNote  =   element(by.css('.customer-asign-icon'));
      browser.actions().click(pjctNote).perform();
      browser.sleep(5000);
      const editNote = element.all(by.tagName('h4')).get(1).element(by.css('.hide-when-edit'));
      browser.actions().click(editNote).perform();
      browser.sleep(10000);

      const projectNotes = element(by.css('.project-notes-field textarea[formcontrolname="notes"]'));
      const customerName = element(by.css('.customer-name-field input[formcontrolname="name"]'));
      const customerEmail = element(by.formControlName('email'));
      const customerNotes = element(by.css('.customer-notes-field textarea[formcontrolname="notes"]'));

      projectNotes.sendKeys('Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centurie');
      browser.sleep(500);
      customerName.clear().then(function(){
        customerName.sendKeys('Sample customer name');
      });
      browser.sleep(500);
      customerEmail.clear().then(function(){
        customerEmail.sendKeys('sample@email.com');
      });
      browser.sleep(500);
      customerNotes.sendKeys('Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centurie');
      browser.sleep(500);
      const saveButton = element(by.css('.save-button'));
      browser.sleep(1000);
      saveButton.click();
      browser.sleep(5000);

      /* element(by.id('mat-input-2')).sendKeys('test notes');
      browser.sleep(500);
      element(by.id('mat-input-3')).clear().then(function() {
        element(by.id('mat-input-3')).sendKeys('nithin');
      });
      browser.sleep(500);
      element(by.id('mat-input-4')).clear().then(function() {
        element(by.id('mat-input-4')).sendKeys('nithin@test.com');
      });
      browser.sleep(500);
      element(by.id('mat-input-5')).sendKeys('customer notes');
      browser.sleep(500);
      const saveNoteBtn   =   element(by.css('.geo-button-primary'));
      browser.actions().click(saveNoteBtn).perform();
      browser.sleep(5000); */
  });

  it('Go to Scenario list in projects View page', function() {
    browser.sleep(10000);
    const newScenarioBtn   =   element(by.css('.new-project'));
    browser.sleep(1000);
    browser.actions().click(newScenarioBtn).perform();
    browser.sleep(10000);

    browser.driver.getCurrentUrl().then((url) => {
       expect(url.includes('/create-scenario')).toBe(true);
    });
  });

  it('Go to Scenario list options in projects View page', function() {
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

            const projectName	=	element.all(by.css('.mat-row')).first().element(by.tagName('a'));
            browser.actions().click(projectName).perform();
            browser.sleep(10000);

            const sceCount  = element.all(by.tagName('mat-row')).count().then(function(count) {
              // return count;
            if (count > 0) {
              const scenarioOptions = element.all(by.css('.width80px')).get(1).element(by.css('mat-icon'));
              browser.actions().click(scenarioOptions).perform();
              browser.sleep(5000);
              expect(element.all(by.css('.mat-menu-item')).get(1).getText()).toBe('Edit Scenario');
              browser.sleep(5000);
              expect(element.all(by.css('.mat-menu-item')).get(2).getText()).toBe('Duplicate Scenario');
              browser.sleep(5000);
              expect(element.all(by.css('.mat-menu-item')).get(3).getText()).toBe('Delete Scenario');
              browser.sleep(5000);
              browser.actions().click(scenarioOptions).perform();
              browser.sleep(5000);
            }
          });
          }
      });
  });

  it('Edit Scenario in list options in projects View page', function() {
    const sceCount  = element.all(by.tagName('mat-row')).count().then(function(count) {
      // return count;
      if (count > 0) {
        const scenarioOptions = element.all(by.css('.width80px')).get(1).element(by.css('mat-icon'));
        browser.actions().click(scenarioOptions).perform();
        browser.sleep(5000);
        const editScenario = element.all(by.css('.mat-menu-item')).get(1);
        browser.actions().click(editScenario).perform();
        browser.sleep(10000);

        browser.driver.getCurrentUrl().then((url) => {
          expect(url.includes('/scenarios/')).toBe(true);
        });
      }
    });
    });

    it('Duplicate Scenario in list options in projects View page', function() {
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

            const projectName	=	element.all(by.css('.mat-row')).first().element(by.tagName('a'));
            browser.actions().click(projectName).perform();
            browser.sleep(10000);
            const sceCount  = element.all(by.tagName('mat-row')).count().then(function(count) {
              // return count;
            if (count > 0) {
              const scenarioOptions = element.all(by.css('.width80px')).get(1).element(by.css('mat-icon'));
              browser.actions().click(scenarioOptions).perform();
              browser.sleep(5000);
              const dupScenario = element.all(by.css('.mat-menu-item')).get(2);
              browser.actions().click(dupScenario).perform();
              browser.sleep(10000);

              const scenarioName = element(by.css('.width90')).element(by.tagName('input')).sendKeys('Dup Scenario 22');
              browser.sleep(5000);
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

    it('Delete Scenario in list options in projects View page', function() {
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

            const projectName	=	element.all(by.css('.mat-row')).first().element(by.tagName('a'));
            browser.actions().click(projectName).perform();
            browser.sleep(10000);
            const sceCount  = element.all(by.tagName('mat-row')).count().then(function(count) {
              // return count;
            if (count > 0) {
              const scenarioOptions = element.all(by.css('.width80px')).get(1).element(by.css('mat-icon'));
              browser.actions().click(scenarioOptions).perform();
              browser.sleep(5000);
              const delScenario = element.all(by.css('.mat-menu-item')).get(3);
              browser.actions().click(delScenario).perform();
              browser.sleep(10000);

              const sceDel	=	$('.swal2-buttonswrapper').all(by.tagName('button')).get(0);
              browser.actions().click(sceDel).perform();
              browser.sleep(10000);

              const delOK	=	$('.swal2-buttonswrapper').all(by.tagName('button')).get(0);
              browser.actions().click(delOK).perform();
              browser.sleep(5000);
              }
            });
          }
      });
    });

     it('Add new project in toolbar options in projects View page', function() {
      // browser.get('/user/projects/lists');
      browser.driver.getCurrentUrl().then((url) => {
      browser.sleep(10000);
      // expect(url.includes('/lists/')).toBe(true);
        const pjctOptions = element.all(by.tagName('button')).get(1).element(by.css('mat-icon'));
        browser.actions().click(pjctOptions).perform();
        browser.sleep(5000);
        const newPrjct = element.all(by.css('.mat-menu-item')).get(0);
        browser.actions().click(newPrjct).perform();
        browser.sleep(10000);
        browser.driver.getCurrentUrl().then((cururl) => {
          expect(cururl.includes('/create-project')).toBe(true);
        });
      });
    });

     it('Delete Project in header options in projects View page', function() {
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

            const projectName	=	element.all(by.css('.mat-row')).first().element(by.tagName('a'));
            browser.actions().click(projectName).perform();
            browser.sleep(10000);

            const pjctOptions = element.all(by.tagName('button')).get(1).element(by.css('mat-icon'));
            browser.actions().click(pjctOptions).perform();
            browser.sleep(5000);
            const delPrjct = element.all(by.css('.mat-menu-item')).get(1);
            browser.actions().click(delPrjct).perform();
            browser.sleep(10000);

            const pjctDel	=	$('.swal2-buttonswrapper').all(by.tagName('button')).get(0);
            browser.actions().click(pjctDel).perform();
            browser.sleep(10000);

            const delOK	=	$('.swal2-buttonswrapper').all(by.tagName('button')).get(0);
            browser.actions().click(delOK).perform();
            browser.sleep(5000);
          }
      });
    });

    it('Delete Project in header options in projects View page', function() {
      browser.get('/projects/lists');
      browser.driver.getCurrentUrl().then((url) => {
      browser.sleep(10000);
      // expect(url.includes('/lists/')).toBe(true);
        if (/lists/.test(url)) {
            browser.sleep(1000);
            const searchBtn = element(by.tagName('app-project-list a.parent-search-icon'));
            searchBtn.click();
            const searchField = element(by.tagName('app-project-list input.mat-input-element'));
            searchField.sendKeys('Untitled Project 3');
            browser.sleep(1000);

            const projectName	=	element.all(by.css('.mat-row')).first().element(by.tagName('a'));
            browser.actions().click(projectName).perform();
            browser.sleep(10000);

            const pjctOptions = element.all(by.tagName('button')).get(1).element(by.css('mat-icon'));
            browser.actions().click(pjctOptions).perform();
            browser.sleep(5000);
            const delPrjct = element.all(by.css('.mat-menu-item')).get(1);
            browser.actions().click(delPrjct).perform();
            browser.sleep(10000);

            const pjctDel	=	$('.swal2-buttonswrapper').all(by.tagName('button')).get(0);
            browser.actions().click(pjctDel).perform();
            browser.sleep(10000);

            const delOK	=	$('.swal2-buttonswrapper').all(by.tagName('button')).get(0);
            browser.actions().click(delOK).perform();
            browser.sleep(5000);
          }
      });
    });

});
