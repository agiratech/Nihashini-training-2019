import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MatButtonModule, MatInputModule, MatFormFieldModule, MatIconModule, MatCardModule} from '@angular/material';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ColorPickerModule } from 'ngx-color-picker';
import {MatDialogModule} from '@angular/material/dialog';
import { NoteComponent } from './note/note.component';
import { NoteserviceService } from './noteservice.service';
import { NotedialogueComponent } from './notedialogue/notedialogue.component';
import { TextNoteComponent } from './text-note/text-note.component';
import {FirebaseModule} from 'angular-firebase';
import {HttpClientModule } from  '@angular/common/http';
import { LoginformComponent } from './loginform/loginform.component';
import {RouterModule,Routes} from '@angular/router';
import { RegisterationComponent } from './registeration/registeration.component';
import { AuthserviceService} from './authservice.service';
import { AuthGuardService } from './auth-guard.service';
import { SweetAlert2Module } from '@toverux/ngx-sweetalert2';
import { environment } from '../environments/environment';
// import { AngularFireModule } from 'angularfire2';
// import { AngularFireDatabaseModule } from 'angularfire2/database';
import { DeleteconfirmationComponent } from './deleteconfirmation/deleteconfirmation.component';

const routes:Routes=[
  {path:'',component:LoginformComponent},
  {path:'register',component:RegisterationComponent},
  {path:'keep',component: TextNoteComponent,canActivate: [AuthGuardService]}
];


@NgModule({
  declarations: [
    AppComponent,
    NoteComponent,
    NotedialogueComponent,
    TextNoteComponent,
    LoginformComponent,
    RegisterationComponent,
    DeleteconfirmationComponent,
   
  ],
  imports: [
    BrowserModule,
    FlexLayoutModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    MatInputModule,
    MatButtonModule,
    MatFormFieldModule,
    MatCardModule,
    MatIconModule,
    ColorPickerModule,
    MatDialogModule,
    FirebaseModule,
    HttpClientModule,
    RouterModule.forRoot(routes),
    SweetAlert2Module.forRoot(),
    // AngularFireModule.initializeApp(environment.firebase,"angular-note"),
    // AngularFireDatabaseModule
    ],
  entryComponents: [
  NotedialogueComponent,DeleteconfirmationComponent
  ],
  providers: [
    NoteserviceService,AuthserviceService,AuthGuardService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
