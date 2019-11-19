import { Component } from '@angular/core';
import {MatDialog} from '@angular/material';
import { NgForm } from '@angular/forms';

import { ConfirmationboxComponent } from './confirmationbox/confirmationbox.component';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  delete: any;
  todo = [];
  index: number;

  constructor(
    public dialog: MatDialog) {}
    addTodo(items:NgForm){ 
      this.todo.push(items) ; 
      // console.log(this.todo)
      }

  openDialog(){
        const dialogRef = this.dialog.open(ConfirmationboxComponent, {
      disableClose: false
    });
    dialogRef.componentInstance.confirmMessage = "Are you sure you want to delete?" ;
    dialogRef.afterClosed().subscribe(
      response => {})
    }
  }
