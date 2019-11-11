import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { CdkDragDrop, moveItemInArray, transferArrayItem} from '@angular/cdk/drag-drop';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  todo = [];
  done = [];
  index: number;
  
  addTodo(items:NgForm){ 
    this.todo.push(items) ; 
    // console.log(this.todo)
    }
      todoDrop(event:CdkDragDrop<string[]>){
        
      //  console.log('coming toDo event', event)

        this.todo.splice(event.currentIndex, 0 ,event.container.data);
        
        this.done.splice(event.previousIndex, 1);

        // console.log('event.container.datatodo',event.container.data)

      }

      doneDrop(event:CdkDragDrop<string[]>){
        
        // console.log('coming done event', event) 
        
        this.done.splice(event.currentIndex, 0, event.container.data);
        
        this.todo.splice(event.previousIndex, 1);
        
        // console.log('event.container.datadone',event.container.data)

      }
    }
    
    









 // drop(event: CdkDragDrop<string[]>) {

      //   if (event.previousContainer === event.container) {
      //     // moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
          
      //   } 
      //   else {
      //   //   transferArrayItem(event.previousContainer.data,
      //   //                     event.container.data,
      //   //                     event.previousIndex,
      //   //                     event.currentIndex);
      //   // }
      // }}
      

