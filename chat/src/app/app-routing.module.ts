import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LogComponent } from './log/log.component';
import { ChatlistComponent } from './chatlist/chatlist.component';
import { ChatAreaComponent } from './chat-area/chat-area.component';
import { ChatComponent } from './chat/chat.component';

const routes:Routes=[
  {path:'',component:LogComponent},
  {path:'chatList',component:ChatlistComponent},

];
@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

