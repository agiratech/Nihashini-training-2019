import { Component, ViewChild, ChangeDetectorRef} from '@angular/core';
import { NgForm,  } from '@angular/forms';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent { 
  todoArray=[];
  title:any;
 
  constructor(){}
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