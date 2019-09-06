import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { Highlight } from './highlight/highlight.directive';
import { BetterHighlightDirective } from './better-highlight/better-highlight.directive';
@NgModule({
  declarations: [
    AppComponent,
    Highlight,
    BetterHighlightDirective
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
