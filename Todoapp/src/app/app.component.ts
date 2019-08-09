import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import {MatDialog} from '@angular/material/dialog';
import {DetailComponent} from './detail/detail.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})


export class AppComponent { 
  todoArray=[];
  title:string;
  note:string;
 
  constructor(private dialog:MatDialog ){}

    openDialog(todo): void {
      const dialogRef = this.dialog.open(DetailComponent, {
        width: '250px',
        data: todo

              
      });
  
      dialogRef.afterClosed().subscribe(result => {
        console.log('The dialog was closed');
        this.note = result;

       });
  }
  addTodo(forms:NgForm){ 
    
   this.todoArray.push(forms) ;
     
     }
   
  deleteItem(todo){   
    const index: number = this.todoArray.indexOf(todo);
    if (index !== -1) {
      this.todoArray.splice(this.todoArray.indexOf(todo),1);
    } 
  } 
}
  
