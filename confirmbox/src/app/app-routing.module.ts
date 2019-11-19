import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ConfirmationboxComponent } from './confirmationbox/confirmationbox.component';
const routes: Routes = [
  {path:'confirm',component:ConfirmationboxComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
