import { browser, by, element } from 'protractor';

export class AppPage {
  navigateTo() {
    return browser.get('/');
  }
  getPageTitle() {
    return browser.getTitle();
  }


  userEmail	=	element(by.id('defaultForm-email'));
  userPass	=	element(by.id('defaultForm-pass'));
  loginBtn	=	element.all(by.css('.login-btn'));
}
