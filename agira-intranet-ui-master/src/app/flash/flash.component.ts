import { Component, OnInit } from '@angular/core';
import { FlashService } from './flash.service';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/timer';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/take';

@Component({
  selector: 'app-flash',
  templateUrl: './flash.component.html',
  styleUrls: ['./flash.component.css']
})
export class FlashComponent implements OnInit {

  active:boolean = false;
  countDown ;
  counter = 1;
  constructor(
    private flashService : FlashService,
  ) {
    this.flashService.show = this.show.bind(this);
    this.flashService.hide = this.hide.bind(this);

   }
   text;
   className;
  ngOnInit() {
  }

  show(text,className) {
    this.active = true;
    this.text = text;
    this.className = className

    this.countDown       = Observable.timer(5000); // 5000 millisecond means 5 seconds
     this.countDown.subscribe(() => {
        this.active = false;
    });
  }
  hide() {
    this.active = false;
  }
}
