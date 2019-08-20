import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from "@angular/flex-layout";
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {MatInputModule} from '@angular/material/input';
import { MenuComponent } from './menu/menu.component';
import { NoteComponent } from './note/note.component';
import { NoteplaceComponent } from './noteplace/noteplace.component';
import { ReminderComponent } from './reminder/reminder.component';
import { EditComponent } from './edit/edit.component';
import { ArchiveComponent } from './archive/archive.component';
import { TrashComponent } from './trash/trash.component';

@NgModule({
  declarations: [
    AppComponent,
    MenuComponent,
    NoteComponent,
    NoteplaceComponent,
    ReminderComponent,
    EditComponent,
    ArchiveComponent,
    TrashComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    FlexLayoutModule,
    MatInputModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
