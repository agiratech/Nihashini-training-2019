import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-calculator',
  templateUrl: './calculator.component.html',
  styleUrls: ['./calculator.component.css']
})

export class CalculatorComponent implements OnInit {
  billed_hours;
  target_percentage;
  target_hours;
  billed_percentage;
  rating;
  check_rating;
  show_result = false;
  total_percentage;
  constructor() { }

  ngOnInit() {
  }

  calculate() {
    this.target_hours = (this.target_percentage / 100) * 480;
    this.billed_percentage = (this.billed_hours / this.target_hours) * 100;
    this.check_rating = parseInt(this.billed_percentage);
    this.total_percentage = (this.billed_hours / 480) * 100;
    switch (true) {
      case this.check_rating >= 100 :
      this.rating = 5;
      break;
      case this.check_rating >= 90 && this.check_rating < 100:
      this.rating = 4;
      break;
      case this.check_rating >= 75 && this.check_rating < 90:
      this.rating = 3;
      break;
      case this.check_rating >= 60 && this.check_rating < 75:
      this.rating = 2;
      break;
      case this.check_rating >= 0 && this.check_rating < 60:
      this.rating = 1;
      break;
      default:
      this.rating = 1;
    }
    this.show_result = true;
  }

}
