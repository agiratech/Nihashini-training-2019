import { Component, OnInit, Inject } from '@angular/core';
import { NoteserviceService } from '../noteservice.service';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { NotedialogueComponent } from '../notedialogue/notedialogue.component';
import Swal from 'sweetalert2';
import{DeleteconfirmationComponent} from '../deleteconfirmation/deleteconfirmation.component';
@Component({
  selector: 'app-note',
  templateUrl: './note.component.html',
  styleUrls: ['./note.component.css']
})


export class NoteComponent implements OnInit {
  val = [];
  arr = [];
  data: any;
  title: String;
  description: string;
  color = [];
  myobj: any
  delete: any;
  removeitem: any;
  dialogRef: MatDialogRef<DeleteconfirmationComponent>;

  constructor(public noteservice: NoteserviceService, public dialog: MatDialog) {
   
    this.arr = (noteservice.getNotes())[1];
    this.color = noteservice.getColor();
    this.val = (noteservice.getNotes())[0];
    console.log(this.arr,"this.arr this.arr this.arr")
   }

   ngOnInit(){
  
  }

  myclick(data: any) {
    this.arr.push(data);
    const index: number = this.val.indexOf(data);
    if (index !== -1) {
      this.val.splice(index, 1);
    
      this.noteservice.getNotesPinned(data).subscribe(
        response => {
        
          console.log('response', data.id);
          console.log(response);
          response['id'] = data.id;
          response['pinned'] = true;
          this.noteservice.updateNote(response);
        });
      }
  }

  unpin(data: any) {
    const index: number = this.arr.indexOf(data);
    if (index !== -1) {
      this.arr.splice(index, 1);
    }
    this.val.unshift(data);
    this.noteservice.getNotesPinned(data).subscribe(
      response => {
        console.log(response);
        response['id'] = data.id;
        response['pinned'] = false;
        this.noteservice.updateNote(response);
      }
    )}

  remove(data: any) {
    this.dialogRef = this.dialog.open(DeleteconfirmationComponent, {
      disableClose: false
    });
    this.dialogRef.componentInstance.confirmMessage = "Are you sure you want to delete?"
    this.dialogRef.afterClosed().subscribe(
        response => {
      const index: number = this.val.indexOf(data);
          if (index !== -1) {
            this.delete = this.val.splice(index, 1);
          this.noteservice.deleteNote(data.id).subscribe(
            response=>{
              console.log('response', data.id);
              console.log(response);
            }
          );
          console.log(response);
         }
        }
        );
       console.log('delete', this.delete);
    }


    removepin(data: any) {
      this.dialogRef = this.dialog.open(DeleteconfirmationComponent, {
        disableClose: false
      });
      this.dialogRef.componentInstance.confirmMessage = "Are you sure you want to delete?"
      this.dialogRef.afterClosed().subscribe(
          response => {
           const index: number = this.arr.indexOf(data);
    if (index !== -1) {
      this.delete = this.arr.splice(index, 1);
      this.noteservice.deleteNote(data.id).subscribe(
        response => {
          console.log('response', data.id);
          console.log(response);
        }
      );
      console.log(response);}
    });
}

  OnMatCard(data): void {
    const dialogRef = this.dialog.open(NotedialogueComponent, {
      data: data,
      width: '400px',

    });
   dialogRef.afterClosed().subscribe(result => {
  
      console.log('The dialog was closed');
      this.data = result;
      console.log(result);
      this.noteservice.updateNote(result);
    });
  }
}





