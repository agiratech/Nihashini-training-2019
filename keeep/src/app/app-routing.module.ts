import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MenuComponent } from './menu/menu.component';
import { NoteComponent } from './note/note.component';
import { ReminderComponent } from './reminder/reminder.component';
import { ArchiveComponent } from './archive/archive.component';
import { TrashComponent } from './trash/trash.component';

const routes: Routes = [
  { path: 'menu', component: MenuComponent },
  { path: 'notes', component: NoteComponent },
  { path: 'reminder', component: ReminderComponent },
  { path: 'archive', component: ArchiveComponent },
  { path: 'trash', component: TrashComponent }

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
