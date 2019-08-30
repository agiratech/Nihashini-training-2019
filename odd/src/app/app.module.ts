import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { Highlight } from './highlight/highlight.directive';
import { BetterDirectiveDirective } from '././better-directive.directive';

@NgModule({
  declarations: [
    AppComponent,
    Highlight,
    BetterDirectiveDirective
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
