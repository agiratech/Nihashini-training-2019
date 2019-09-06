import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AccountComponent } from './account/account.component';
import { NewaccountComponent } from './newaccount/newaccount.component';
import { AccountService } from './account.service';
import { LoggingService } from './logging.service';

@NgModule({
  declarations: [
    AppComponent,
    AccountComponent,
    NewaccountComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [AccountService, LoggingService],
  bootstrap: [AppComponent]
})
export class AppModule { }
