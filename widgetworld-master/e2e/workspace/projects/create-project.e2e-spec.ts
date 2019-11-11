import { AppPage } from '../../app.po';
import { browser, by, element, protractor } from 'protractor';

by.addLocator('formControlName', function (value, opt_parentElement, opt_rootSelector) {
  const using = opt_parentElement || document;
  return using.querySelectorAll('[formControlName="' + value + '"]');
});

describe('Create a new project', () => {
  const page = new AppPage();
  it('click on the new project', () => {
    browser.driver.getCurrentUrl().then(function (url) {
      browser.waitForAngularEnabled(false);
      if ((/explore/).test(url)) {
        // browser.waitForAngularEnabled(false);
        browser.sleep(10000);
        const workSpaceBtn = element(by.css('.workspace-link'));
        browser.sleep(1000);
        workSpaceBtn.click();
        browser.sleep(10000);
      }
    });
    browser.driver.getCurrentUrl().then((url) => {
      if ((/v2/).test(url)) {
        const createNewProjectCardbtn = element(by.css('.new-project-card'));
        createNewProjectCardbtn.click();
        browser.sleep(10000);
        element.all(by.css('.mat-input-element')).then((item) => {
          item[0].click();
          browser.sleep(10000);
          element.all(by.css('.mat-card')).then((card) => {
            item[0].sendKeys('my first project' + card.length);
          });
          // item[0].sendKeys('my first project' + Math.floor(Math.random() * 100) + 1);
          // const projectDescription = element(by.css('#mat-input-20'));
          item[1].click();
          item[1].sendKeys('project description');
          browser.sleep(2000);
          const createBtn = element(by.css('.continue-btn'));
          createBtn.click();
          browser.sleep(10000);
        });
      }
    });
  });

  it('create tags', () => {
    browser.driver.getCurrentUrl().then(function (url) {
      if ((/v2/).test(url)) {
        const addTags = element(by.css('.placeholder-link'));
        addTags.click();
        browser.sleep(5000);
        const tagsInputField = element(by.css('.mat-chip-input'));
        const projectDescriptionField = element(by.css('.edit-input'));
        tagsInputField.click();
        browser.sleep(10000);
        tagsInputField.sendKeys('tags1');
        projectDescriptionField.click();
        browser.sleep(5000);
        tagsInputField.click();
        tagsInputField.sendKeys('tags2');
        projectDescriptionField.click();
        browser.sleep(5000);
        tagsInputField.click();
        tagsInputField.sendKeys('tags3');
        const saveBtn = element(by.css('.edit-save-btn'));
        saveBtn.click();
        browser.sleep(10000);
        const swal2Confirm = element(by.css('.swal2-confirm'));
        swal2Confirm.click();
        browser.sleep(5000);
      }
    });
  });

  it('create sub project and view attachment', () => {
    element.all(by.css('.mat-button')).then((item) => {
      if (item[0]) {
        item[0].click();
        browser.sleep(5000);
        element.all(by.css('.mat-menu-item')).then((meniItem) => {
          meniItem[1].click();
          browser.sleep(5000);
          element.all(by.css('.mat-tab-label')).then((tab) => {
            tab[1].click();
            browser.sleep(5000);
            const closeAttachments = element(by.css('.close'));
            closeAttachments.click();
            browser.sleep(5000);
          });
        });
      }
    });
    element.all(by.css('.new-sub-project-card')).then((card) => {
      if (card[0]) {
        card[0].click();
        browser.sleep(5000);
        element.all(by.css('.mat-input-element')).then((item) => {
          item[0].click();
          browser.sleep(1000);
          element.all(by.css('.mat-card')).then((cards) => {
            item[0].sendKeys('my first project' + cards.length);
          });
          // item[0].sendKeys('my first project' + Math.floor(Math.random() * 100) + 1);
          // const projectDescription = element(by.css('#mat-input-20'));
          item[1].click();
          item[1].sendKeys('project description');
          browser.sleep(2000);
          const createBtn = element(by.css('.continue-btn'));
          createBtn.click();
          browser.sleep(10000);
        });
      }
    });
  });

  it('test breadcrumbs', () => {
    browser.driver.getCurrentUrl().then(function (url) {
      if ((/v2/).test(url)) {
        const breadcrumbs = element(by.css('#tags1'));
        breadcrumbs.click();
        browser.sleep(10000);
      }
    });
  });

  it('create market plan', () => {
    browser.driver.getCurrentUrl().then(function (url) {
      if ((/v2/).test(url)) {
        const marketPlanBtn = element(by.css('.market-card'));
        marketPlanBtn.click();
        browser.sleep(5000);
        const planName = element(by.css('#planName'));
        planName.click();
        planName.sendKeys('my First market Plan11');
        browser.sleep(5000);
        const planDescription = element(by.css('#planDescription'));
        planDescription.click();
        planDescription.sendKeys('plan description');
        browser.sleep(5000);
        const selectOption = element(by.css('#assignProject'));
        selectOption.click();
        element.all(by.css('.mat-option')).then(function (items) {
          expect(items.length).toBeGreaterThanOrEqual(1);
          items[items.length - 1].click();
          browser.sleep(10000);
        });
        const createBtn = element(by.css('.continue-btn'));
        createBtn.click();
        browser.sleep(10000);
        element.all(by.css('.add-link')).then((items) => {
          items[0].click();
          browser.sleep(10000);
          element.all(by.css('.mat-list-option')).then((item) => {
            item[0].click();
            browser.sleep(10000);
            item[3].click();
            browser.sleep(10000);
          });
          const addSelectedBtn = element(by.css('.add-select-button'));
          addSelectedBtn.click();
          browser.sleep(10000);
          items[1].click();
          browser.sleep(20000);
          element.all(by.css('.mat-checkbox')).then((item) => {
            expect(items.length).toBeGreaterThanOrEqual(1);
            item[1].click();
            browser.sleep(20000);
            addSelectedBtn.click();
            browser.sleep(20000);
          });
          if (items[2]) {
            items[2].click();
            element.all(by.css('.mat-pseudo-checkbox')).then((check) => {
              check[0].click();
              browser.sleep(5000);
              addSelectedBtn.click();
              browser.sleep(20000);
            });
          }
          element.all(by.css('.new-project-card')).then((item) => {
            item[0].click();
            browser.sleep(10000);
          });
          element.all(by.css('.mat-checkbox')).then((item) => {
            item[2].click();
            browser.sleep(10000);
          });
          element.all(by.css('.btn-primary-color')).then((item) => {
            item[1].click();
            browser.sleep(10000);
          });
          const trp = element(by.css('.mat-input-element'));
          trp.click();
          browser.sleep(5000);
          trp.sendKeys(100);
          browser.sleep(5000);
          const generateBtn = element(by.css('.generate-btn'));
          generateBtn.click();
          browser.sleep(30000);
        });
      }
    });
  });

  it('edit the note', () => {
    element.all(by.css('.customer-asign-icon')).then((note) => {
      note[0].click();
      browser.sleep(5000);
      element.all(by.css('.assign-icon')).then((icon) => {
        icon[1].click();
        browser.sleep(5000);
      });
      const planNotes = element(by.css('.cdk-textarea-autosize'));
      planNotes.click();
      planNotes.sendKeys('new plan');
      browser.sleep(5000);
      const saveBtn = element(by.css('.note-save-button'));
      saveBtn.click();
      browser.sleep(10000);
      note[0].click();
      const cancel = element(by.css('.mat-icon-close'));
      cancel.click();
      browser.sleep(5000);
      const savePlan = element(by.css('.save-scenario'));
      savePlan.click();
      browser.sleep(10000);
    });
  });

  it('edit the plans', () => {
    browser.driver.getCurrentUrl().then(function (url) {
      if ((/v2/).test(url)) {
        element.all(by.css('.expanted-icon')).then((expand) => {
          expand[0].click();
          browser.sleep(20000);
        });
        element.all(by.css('.editable-value')).then((input) => {
          input[0].click();
          browser.sleep(20000);
          element.all(by.css('.edit-total')).then((item) => {
            item[0].click();
            browser.sleep(10000);
            item[0].sendKeys(1);
            browser.sleep(10000);
          });
          input[1].click();
          browser.sleep(10000);
        });
      }
    });
  });

  it('select audience should display plans by audience', () => {
    const matSelect = element(by.css('#selectedAudience'));
    matSelect.click();
    browser.sleep(10000);
    element.all(by.css('.mat-option')).then((option) => {
      option[option.length - 1].click();
      browser.sleep(10000);
    });
  });

  it('overview market plan', () => {
    browser.driver.getCurrentUrl().then(function (url) {
      if ((/v2/).test(url)) {
        const overview = element(by.css('.mat-slide-toggle'));
        overview.click();
        browser.sleep(10000);
      }
    });
  });

  it('delete a market plan', () => {
    browser.driver.getCurrentUrl().then(function (url) {
      if ((/v2/).test(url)) {
        const actionBtn = element(by.css('.scenario-action-menu'));
        actionBtn.click();
        browser.sleep(5000);
        element.all(by.css('.mat-menu-item')).then((item) => {
          item[item.length - 1].click();
          browser.sleep(5000);
          const swal2Confirm = element(by.css('.swal2-confirm'));
          swal2Confirm.click();
          browser.sleep(10000);
          swal2Confirm.click();
          browser.sleep(5000);
        });
        browser.sleep(5000);
      }
    });
  });

});
