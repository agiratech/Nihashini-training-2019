import { Injectable } from '@angular/core';

export const dialogTheme = {
    'box-dialog-shadow' :' 0 1px 1px 0 rgba(0,0,0,0.14), 0 2px 1px -1px rgba(0,0,0,0.12), 0 1px 3px 0 rgba(0,0,0,0.2)',
    'close-btn-background': '#FAFAFA',
    'close-btn-font-color': 'rgba(117,117,117,1)',
    'ok-btn-background': 'rgb(110, 23, 148)',
    'ok-btn-color': '#ffffff'
};

@Injectable({ providedIn: 'root' })
export class DialogThemeService {
  themeFix() {
    this.setTheme(dialogTheme);
  }

  
  private setTheme(theme: {}) {
    Object.keys(theme).forEach(k =>
      document.documentElement.style.setProperty(`--${k}`, theme[k])
    );
  }
}