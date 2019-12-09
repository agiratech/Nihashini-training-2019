import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-show-template',
  templateUrl: './show-template.component.html',
  styleUrls: ['./show-template.component.css']
})
export class ShowTemplateComponent implements OnInit {

  template_id;
  constructor(
    private route: ActivatedRoute,
  ) { }

  ngOnInit() {
    /* Getting Template Id from URL   */
    this.route.params.subscribe(
      params => {
        this.template_id = params['id'];
      }
    );

  }

}
