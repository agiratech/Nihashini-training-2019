import { browser, by, element } from 'protractor';

export class AppPage {
  userEmail	=	element(by.id('defaultForm-email'));
  userPass	=	element(by.id('defaultForm-pass'));
  loginBtn	=	element.all(by.css('.login-btn'));

  navigateTo() {
    return browser.get('/');
  }

  getPageTitle() {
    return browser.getTitle();
  }

  hasClass(ele, cls) {
    return ele.getAttribute('class').then((classes) => {
      return classes.split(' ').indexOf(cls) !== -1;
    });
  }
}
