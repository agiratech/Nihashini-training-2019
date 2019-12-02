import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogThemeService } from './theme.service';


@NgModule({
  declarations: [],
  imports: [
    CommonModule
  ]
})
export class ThemeModule {
  popupdialogTheme;

  constructor(private themeService: DialogThemeService) {
    this.popupdialogTheme.subscribe(value => {
        this.themeService.themeFix()
      
    });
 }
}
