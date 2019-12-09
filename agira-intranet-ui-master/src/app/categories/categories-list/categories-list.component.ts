import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CategoryService } from '../../services/category.service';
import { ErrorService } from '../../services/error.service';
import { FlashService } from '../../flash/flash.service';



@Component({
  selector: 'app-categories-list',
  templateUrl: './categories-list.component.html',
  styleUrls: ['./categories-list.component.css']
})
export class CategoriesListComponent implements OnInit {

  constructor(
    private categoryService: CategoryService,
    private flashService: FlashService,
    private errorService: ErrorService
  ) { }

  categories;
  no_record:boolean = false;
  submit_button; 
  name = '';
  @ViewChild('closeModal') close: ElementRef;
  id ;


  ngOnInit() {
    this.getCategories()
  }

  getCategories(){
    this.categoryService.getCategories().subscribe(
      data => {
        this.categories = data.body['result'];
        this.no_record = this.categories.length>0 ? false : true;
      },
      error => {
        this.errorService.errorHandling(error) 
      }
    )
  }

  delete(id) {
    this.categoryService.deleteCategory(id).subscribe(
      data => {
        if(data.body['success'] == true){
          this.getCategories()
        }
      },
      error => {
        this.errorService.errorHandling(error) 
      }
    )
  }

  createCategories(){
    let value:any = {}
    let category = {
      id: this.id,
      name: this.name
    }
    value.category = category
    this.close.nativeElement.click();
    if(!this.id){
      this.categoryService.createCategory(value).subscribe(
        data => {
          this.id = null;
          if(data.body['success']){
            this.getCategories()
            this.flashService.show(data.body['message'],"alert-success")
          }else{
            this.flashService.show(data.body['message'],"alert-danger")
          }
        }, error => {
        }
      )
    }else{
      this.categoryService.updateCategory(value).subscribe(
        data => {
          if(data.body['success']){
            this.getCategories()
            this.flashService.show(data.body['message'],"alert-success")
          }else{
            this.flashService.show(data.body['message'],"alert-danger")
          }
        }, error => {
        }
      )   
    }

  }

  editCategory(id){
    this.id = id
    this.submit_button = "Edit Category"
    this.categoryService.showCategory(id).subscribe(
      data => {
        if(data.body['success']){
          this.name = data.body['result'].name
        }else{
        }
      }
    )
  }

  createCategory(){
    this.id = null;
    this.name = '';
    this.submit_button = "Create Category"
  }
}
