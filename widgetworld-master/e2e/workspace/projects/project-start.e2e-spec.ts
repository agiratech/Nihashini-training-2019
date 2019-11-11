import { AppPage } from '../../app.po';
import { browser, by, element, protractor } from 'protractor';

describe('WorkSpace: Projects Start Page', () => {
  const page = new AppPage();

  it('Projects Start page', function() {
    // page.navigateTo();
    browser.waitForAngularEnabled(false);
    browser.sleep(20000);
    const workSpaceBtn	=	element(by.css('.workspace-link'));
    browser.sleep(1000);
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
      if (url.includes('/projects/start')) {
        browser.sleep(1000);
        expect(element(by.css('.breadcrumb-div')).all(by.tagName('span')).get(0).getText()).toBe('WORKSPACE');
        expect(element(by.css('.breadcrumb-div')).all(by.tagName('span')).get(2).getText()).toBe('CREATE NEW PRO...');
      }
    });
  });

  it('Checking Page Heading text', function() {
    browser.driver.getCurrentUrl().then((url) => {
      if (url.includes('/projects/start')) {
        browser.sleep(1000);
        expect(element(by.tagName('app-project-home h1')).getText()).toEqual('Create Your First Project');
      }
    });
  });

  it('Checking Page description text', function() {
    browser.driver.getCurrentUrl().then((url) => {
      if (url.includes('/projects/start')) {
        browser.sleep(1000);
        expect(element(by.css('.body-1-override')).getText())
        .toBe('Create and analyze inventory scenarios with all the relevant data: markets, audiences, inventory sets and measurements.');
      }
    });
  });

  it('Checking Create button text, color and redirect url', function() {
    browser.driver.getCurrentUrl().then((url) => {
      if (url.includes('/projects/start')) {
        browser.sleep(1000);
        const getStarted = element(by.tagName('app-project-home a'));
        expect(getStarted.getText()).toEqual('GET STARTED');
        expect(getStarted.getCssValue('background-color')).toBe('rgba(146, 42, 149, 1)');
        browser.sleep(500);
        getStarted.click();
        browser.sleep(10000);
        browser.driver.getCurrentUrl().then((createUrl) => {
          // checking the url
          expect(createUrl.includes('/projects/create-project')).toBe(true);
        });
      }
    });
  });
});
