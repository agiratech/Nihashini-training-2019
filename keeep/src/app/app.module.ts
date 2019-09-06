import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from "@angular/flex-layout";
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatInputModule } from '@angular/material/input';
import { MenuComponent } from './menu/menu.component';
import { NoteComponent } from './note/note.component';
import { MatMenuModule } from '@angular/material/menu';
import { HighlightDirective } from './highlight/highlight.directive';
import { MatDialogModule } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import {MatExpansionModule} from '@angular/material/expansion';
import { ReminderComponent } from './reminder/reminder.component';
import { ArchiveComponent } from './archive/archive.component';
import { TrashComponent } from './trash/trash.component';
import { EditComponent } from './edit/edit.component';
import {MatIconModule} from '@angular/material/icon';
import {MatSidenavModule} from '@angular/material/sidenav';



@NgModule({
  declarations: [
    AppComponent,
    MenuComponent,
    NoteComponent,
    HighlightDirective,
    ReminderComponent,
    ArchiveComponent,
    TrashComponent,
    EditComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    FlexLayoutModule,
    MatInputModule,
    MatMenuModule,
    MatDialogModule,
    MatCardModule,
    MatExpansionModule,
    MatIconModule,
    MatSidenavModule
  ],
  providers: [],
  bootstrap: [AppComponent],
  entryComponents:[EditComponent]
})
export class AppModule { }
