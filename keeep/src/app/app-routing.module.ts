import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { NoteplaceComponent } from './noteplace/noteplace.component';
import { ReminderComponent } from './reminder/reminder.component';
import { EditComponent } from './edit/edit.component';
import { ArchiveComponent } from './archive/archive.component';
import { TrashComponent } from './trash/trash.component';
const routes: Routes = [
  {path: "noteplace", component:NoteplaceComponent},
  {path: "reminder", component:ReminderComponent},
  {path: "edit", component:EditComponent},
  {path: "archive", component:ArchiveComponent},
  {path: "trash", component:TrashComponent}  
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
