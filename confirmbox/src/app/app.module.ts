import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatCardModule } from '@angular/material/card';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ConfirmationboxComponent } from './confirmationbox/confirmationbox.component';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    AppComponent,
    ConfirmationboxComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    MatDialogModule,
    MatCardModule,
    FormsModule,
    BrowserAnimationsModule
  ],
  
  entryComponents: [
    ConfirmationboxComponent
  ],

  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
