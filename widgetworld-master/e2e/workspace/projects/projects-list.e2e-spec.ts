import { AppPage } from '../../app.po';
import { browser, by, element, protractor } from 'protractor';

describe('WorkSpace: Projects List Page', () => {
  const page = new AppPage();

  it('Projects List page', function() {
    browser.get('/explore');
    browser.waitForAngularEnabled(false);
    browser.sleep(10000);
    const workSpaceBtn	=	element(by.css('.workspace-link'));
    workSpaceBtn.click();
    browser.sleep(15000);
    browser.driver.getCurrentUrl().then((url) => {
      if (url.includes('/projects/start')) {
        /** No project exist. Create Your First Project */
        // Checking the url
        expect(url.includes('/projects/start')).toBe(true);
      } else {
        /** If projects exist. Go to Projects list */
        expect(url.includes('/projects/list')).toBe(true);
      }
    });
  });

  it('Checking breadcrumbs Presents', function() {
    browser.driver.getCurrentUrl().then((url) => {
      if (url.includes('/projects/list')) {
        browser.sleep(8000);
        expect(element(by.css('breadcrumbs')).all(by.tagName('span')).get(0).getText()).toBe('WORKSPACE');
        expect(element(by.css('breadcrumbs')).all(by.tagName('span')).get(2).getText()).toBe('MY PROJECTS');
      }
    });
  });

  it('Checking Page Heading text', function() {
    browser.driver.getCurrentUrl().then((url) => {
      if (url.includes('/projects/list')) {
        browser.sleep(5000);
        expect(element(by.tagName('app-project-list h1')).getText()).toEqual('My Projects');
      }
    });
  });

  it('Testing the Projects Search functionality positive scenario', function() {
    browser.driver.getCurrentUrl().then((url) => {
      if (url.includes('/projects/list')) {
        browser.sleep(5000);
        const searchBtn = element(by.tagName('app-project-list a.parent-search-icon'));
        searchBtn.click();
        const searchField = element(by.tagName('app-project-list input.mat-input-element'));
        searchField.sendKeys('Untitled Project 1');
        browser.sleep(5000);
        const closeBtn = element(by.tagName('app-project-list i.close-project-field')).parentElementArrayFinder;
        browser.sleep(5000);
        closeBtn.click();
        browser.sleep(5000);
      }
    });
  });

  it('Testing the Projects Search functionality negative scenario', function() {
    browser.driver.getCurrentUrl().then((url) => {
      if (url.includes('/projects/list')) {
        browser.sleep(8000);
        const searchBtn = element(by.tagName('app-project-list a.parent-search-icon'));
        searchBtn.click();
        const searchField = element(by.tagName('app-project-list input.mat-input-element'));
        searchField.clear();
        browser.sleep(3000);
        searchField.sendKeys('!@#$%^');
        browser.sleep(5000);
        expect(element(by.css('mat-row')).isPresent()).toBe(false);
        browser.sleep(5000);
        const closeBtn = element(by.tagName('app-project-list i.close-project-field')).parentElementArrayFinder;
        browser.sleep(5000);
        closeBtn.click();
        browser.sleep(5000);
      }
    });
  });

  it('Testing the sorting', function() {
    browser.driver.getCurrentUrl().then((url) => {
      if (url.includes('/projects/list')) {
        browser.sleep(8000);
        const tableHeaderBtn =	element(by.tagName('app-project-list mat-header-cell'));
        browser.sleep(5000);
        tableHeaderBtn.click();
        browser.sleep(5000);
        expect(element(by.css('mat-cell.sort')).isPresent()).toBe(true);
      }
    });
  });

  it('Deleting the project', function() {
    browser.driver.getCurrentUrl().then((url) => {
      if (url.includes('/projects/list')) {
        browser.sleep(8000);
        const newProjectBtn =	element(by.tagName('button.mat-icon-button'));
        browser.sleep(5000);
        newProjectBtn.click();
        browser.sleep(5000);
        const deleteBtn = element(by.tagName('button.mat-menu-item'));
        deleteBtn.click();
        browser.sleep(3000);
        const deleteConfirmBtn = element(by.tagName('button.swal2-confirm'));
        deleteConfirmBtn.click();
        browser.sleep(5000);
        expect(element(by.tagName('div.swal2-content')).getText()).toEqual('Project set deleted successfully');
        const deleteSuccessBtn = element(by.tagName('button.swal2-confirm'));
        deleteSuccessBtn.click();
        browser.sleep(5000);
      }
    });
  });

  it('Go to new project page', function() {
    browser.driver.getCurrentUrl().then((url) => {
      if (url.includes('/projects/list')) {
        browser.sleep(8000);
        const menuBtn =	element(by.css('a.new-project'));
        browser.sleep(5000);
        menuBtn.click();
        browser.sleep(5000);
        browser.driver.getCurrentUrl().then((createUrl) => {
          // checking the url
          expect(createUrl.includes('/projects/create-project')).toBe(true);
        });
      }
    });
  });
});
