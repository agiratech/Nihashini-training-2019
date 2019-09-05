import { Component } from '@angular/core';
import {MatDialogRef} from '@angular/material/dialog';

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.css']
})
export class EditComponent {

  constructor(     public editDialog: MatDialogRef <EditComponent>,
    ) { }
  onNoClick(): void {
    this.editDialog.close();
  }

}
