import { Component, OnInit } from '@angular/core';
import { NotecardService } from '../notecard.service';
import { NgForm } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { EditComponent } from '../edit/edit.component';
import { LabelsService } from '../labels.service'

@Component({
  selector: 'app-note',
  templateUrl: './note.component.html',
  styleUrls: ['./note.component.css']
})
export class NoteComponent implements OnInit {
  notes: [];
  title: string;
  subTitle: string;
  dateTime: string;
  label: string;

  labels;
  dialogRef: any;

  constructor(public NoteCard: NotecardService,
    public dialog: MatDialog,
    public labelService: LabelsService) { }

  ngOnInit() {
    this.labels = this.labelService.getlabel();
  }

  openDialog() {
    const editDialog = this.dialog.open(EditComponent, {
      width: '300px'
    });
    editDialog.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });

  }
  createNote(formData: NgForm) {
    this.NoteCard.storeCards(formData.value).subscribe(response => {
      this.NoteCard.setNote(response['name']);
    })
  }

}





