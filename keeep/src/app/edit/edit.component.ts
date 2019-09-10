import { Component } from '@angular/core';
import {MatDialogRef} from '@angular/material/dialog';
import {LabelsService} from '../labels.service'
@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.css']
})
export class EditComponent {
  
  label: { name }={ name : ""};
  
  constructor(
    public editDialog: MatDialogRef <EditComponent>,
    public labelService: LabelsService ) { }
  
    createLabel(){
    this.labelService.createLabel(this.label);
    this.label = { name : ""};
  }

  onNoClick(): void {
    this.editDialog.close();
  }

}
