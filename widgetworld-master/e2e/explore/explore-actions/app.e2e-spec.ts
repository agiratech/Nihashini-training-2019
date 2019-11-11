import { browser, by, element, protractor } from 'protractor';

describe('Explore Action Filter', () => {

  it('Checking for Action filter availability', function() {
    browser.sleep(5000);
    browser.driver.getCurrentUrl().then(function(url) {
      browser.waitForAngularEnabled(false);
      if (/explore/.test(url)) {
        browser.sleep(5000);
        const actionMenu =  element.all(by.className('test-action-menu')).first();
        expect(actionMenu.getText()).toBe('ACTIONS');
        actionMenu.click();
        browser.sleep(8000);
      }
    });
  });


 it('Save the current view', function() {
  browser.sleep(8000);
  browser.driver.getCurrentUrl().then(function(url) {
    browser.waitForAngularEnabled(false);
    if (/explore/.test(url)) {
      browser.sleep(8000);

      const actionMenu =  element.all(by.className('test-action-menu')).first();
      // actionMenu.click();
      const actionSaveCurrentViewPanel =  element.all(by.className('test-action-save-view-option')).first();
      browser.sleep(8000);
      expect(actionSaveCurrentViewPanel.getText()).toBe('Save View');
      actionSaveCurrentViewPanel.click();
      browser.sleep(8000);
      const actionSaveCurrentViewButton =  element.all(by.className('test-action-current-save-view-btn')).first();
      browser.sleep(5000);
      actionSaveCurrentViewButton.click();
      browser.sleep(8000);

      //open model save view dialog
      //checking model title
      
      const matDialogTitle =  element.all(by.className('mat-dialog-title')).first();
      expect(matDialogTitle.getText()).toBe('Saved Views');
      browser.sleep(8000);

      //get the save view name
      const saveViewName =  element.all(by.className('test-saved-view-name')).getAttribute('value');

      const saveViewAPIButton =  element.all(by.className('test-dialog-saveview-button')).first();
      expect(saveViewAPIButton.getText()).toContain('SAVE');
      saveViewAPIButton.click();
      browser.sleep(8000);

      expect(element(by.tagName('div.swal2-content')).getText()).toEqual('Layer view saved successfully.');
      const saveOkBtn = element(by.tagName('button.swal2-confirm'));
      saveOkBtn.click();
      browser.sleep(8000);

      const actionSaveViewPanel =  element.all(by.className('test-action-save-view')).first();
      expect(actionSaveViewPanel.getText()).toBe('Retrieve Saved View');
      actionSaveViewPanel.click();
      browser.sleep(8000);

      const listSavedView = element(by.className('test-saved-view-list')).all(by.tagName('mat-list-item')).last();
      listSavedView.click();
      expect(listSavedView.getText()).toContain(saveViewName);
      actionSaveViewPanel.click();
      browser.sleep(10000);
      actionMenu.click();
    }
  });
}); 


  it('Checking Retrieve Saved View Options & load the selected view', function() {
    browser.sleep(3000);
    browser.driver.getCurrentUrl().then(function(url) {
      browser.waitForAngularEnabled(false);
      if (/explore/.test(url)) {
        browser.sleep(8000);
        const actionMenu =  element.all(by.className('test-action-menu')).first();
        actionMenu.click();
        browser.sleep(5000);
        const actionSaveViewPanel =  element.all(by.className('test-action-save-view')).first();
        expect(actionSaveViewPanel.getText()).toBe('Retrieve Saved View');
        actionSaveViewPanel.click();
        browser.sleep(8000);
        const listSavedView = element(by.className('test-saved-view-list')).all(by.tagName('mat-list-item'));
        expect(listSavedView.count()).toBeGreaterThan(0);
        listSavedView.last().click();
        const actionLoadViewButton =  element.all(by.className('test-action-loadView')).first();
        browser.sleep(5000);
        actionLoadViewButton.click();
        actionMenu.click();
        browser.sleep(20000);
        // actionMenu.click();
      }
    });
  });

  // To test print is woking or not
  /* it('Able to print the MAP', function() {
    browser.sleep(3000);
    browser.driver.getCurrentUrl().then(function(url) {
      browser.waitForAngularEnabled(false);
      if (/explore/.test(url)) {
        browser.sleep(5000);

        const actionMenu =  element.all(by.className('test-action-menu')).first();
        actionMenu.click();
        browser.sleep(8000);
        const actionPrintPanel =  element.all(by.className('test-action-print')).first();
        // browser.sleep(8000);
        expect(actionPrintPanel.getText()).toBe('Print View');
        actionPrintPanel.click();
        browser.sleep(8000);
        const actionPrintButton =  element.all(by.className('test-action-print-btn')).first();
        browser.sleep(5000);
        const result = browser.executeAsyncScript(function (elm, callback) {
          function listener() {
              callback(true);
          }
          window.print = listener;
          elm.click();
      }, actionPrintButton.getWebElement());
      // actionPrintButton.click();
      browser.sleep(5000);
      expect(result).toBe(true);
        // actionMenu.click();
        browser.sleep(10000);
        actionMenu.click();
      }
    });
  }); */


    // To test print is woking or not
    it('Clear the load view', function() {
      browser.sleep(8000);
      browser.driver.getCurrentUrl().then(function(url) {
        browser.waitForAngularEnabled(false);
        if (/explore/.test(url)) {
          browser.sleep(8000);
          const actionMenu =  element.all(by.className('test-action-menu')).first();
          actionMenu.click();
          const actionClearViewPanel =  element.all(by.className('test-action-clear-view')).first();
          browser.sleep(8000);
          expect(actionClearViewPanel.getText()).toBe('Clear View');
          actionClearViewPanel.click();
          browser.sleep(8000);
          const actionPrintButton =  element.all(by.className('test-action-clear-view-btn')).first();
          // actionMenu.click();
          browser.sleep(10000);
          actionMenu.click();
        }
      });
    });

});