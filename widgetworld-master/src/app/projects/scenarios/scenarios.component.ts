import {Component, OnInit} from '@angular/core';
import {TitleService} from '../../shared/services/index';

@Component({
  selector: 'app-scenarios',
  templateUrl: './scenarios.component.html',
  styleUrls: ['./scenarios.component.less']
})
export class ScenariosComponent implements OnInit {
  pageTitle = '';
  constructor(private titleService: TitleService) { }

  ngOnInit() {
    let title = this.titleService.getTitle();
  	const titleArray = title.split(' :: ');
  	this.pageTitle = titleArray[0];
  }

}
