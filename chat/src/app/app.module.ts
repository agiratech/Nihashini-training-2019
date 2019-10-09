import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { FlexLayoutModule } from '@angular/flex-layout';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LogComponent } from './log/log.component';
import {RouterModule,Routes} from '@angular/router';
import { ChatlistComponent } from './chatlist/chatlist.component';
import { ChatAreaComponent } from './chat-area/chat-area.component';
import { ChatComponent } from './chat/chat.component';
import {MatMenuModule} from '@angular/material/menu';
import {MatIconModule} from '@angular/material/icon';


const routes:Routes=[
  {path:'',component:LogComponent},
  {path:'chat',component:ChatComponent}
];

@NgModule({
  declarations: [
    AppComponent,
    LogComponent,
    ChatlistComponent,
    ChatAreaComponent,
    ChatComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    BrowserAnimationsModule,
    MatInputModule,
    MatCardModule,
    FlexLayoutModule,
    RouterModule.forRoot(routes),
    MatMenuModule,
    MatIconModule

  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
