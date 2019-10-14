import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { ChatComponent } from './chat/chat.component';
import { CardComponent } from './card/card.component';

const routes: Routes = [
  {path: '', component:LoginComponent},
  {path: 'chat', component:ChatComponent},
  {path: 'card', component:CardComponent}
];
@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
