import { Component, OnInit, ViewChild, AfterViewInit, ChangeDetectionStrategy } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-market-plan-list',
  templateUrl: './market-plan-list.component.html',
  styleUrls: ['./market-plan-list.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MarketPlanListComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['name', 'description', 'units', 'audiences', 'markets', 'created', 'modified' , 'action'];
  dataSource = new MatTableDataSource([]);
  sortingElement: String = '';
  isSameColumnSort = 0;
  @ViewChild(MatSort, {static: false}) sort: MatSort;
  fDatas = [
    {
      'created': '2018-07-19T10:24:15.429Z',
      'description': 'Description sample text goes here lorem ipsum',
      'modified': '2018-07-25T12:29:24.100Z',
      'name': 'Custom Sample Scenario Name #1',
      'id': '5b5066cf5047074419317d2a',
      'units': 25,
      'audiences': 5,
      'markets': 5
    },
    {
      'created': '2018-07-19T10:24:15.429Z',
      'description': 'Description sample text goes here lorem ipsum',
      'modified': '2018-07-26T12:29:24.100Z',
      'name': 'Custom Sample Scenario Name #2',
      'id': '5b5066cf5047074419317d2b',
      'units': 27,
      'audiences': 2,
      'markets': 16
    }];
  constructor() { }

  ngOnInit() {
    this.dataSource.data = this.fDatas;
  }
  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
  }
  public onSortting(sortValue: String) {
    if (this.sortingElement === '' || this.sortingElement !== sortValue) {
      this.isSameColumnSort = 1;
    } else if (this.sortingElement === sortValue) {
      ++ this.isSameColumnSort;
    }
    if (this.isSameColumnSort < 3) {
      this.sortingElement = sortValue;
    } else {
      this.sortingElement = '';
    }
  }

}
