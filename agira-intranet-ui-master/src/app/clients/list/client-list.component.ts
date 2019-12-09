import { Component, OnInit } from '@angular/core';
import { ClientService } from '../../services/client.service';
import { Router } from '@angular/router';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
import { ErrorService } from '../../services/error.service';


@Component({
  selector: 'app-client-list',
  templateUrl: './client-list.component.html',
  styleUrls: ['./client-list.component.css']
})
export class ClientListComponent implements OnInit {

  clients ;
  no_record: boolean = false;

  constructor(
    private clientservice: ClientService,
    private router: Router,
    private spinnerService: Ng4LoadingSpinnerService,
    private errorService: ErrorService
  ) { }

  ngOnInit() {
    this.getClients();
  }

  getClients() {
    this.clientservice.getClients().subscribe(
      data => {
        this.clients = data.body['result'];
        this.no_record = this.clients.length > 0 ? false : true;
      },
      error => {
        this.errorService.errorHandling(error);
      }
    );
  }
  delete(id) {
    this.spinnerService.show();
    this.clientservice.deleteClient(id).subscribe(
      data => {
        this.spinnerService.hide();
        if (data.body['success'] == true) {
          this.getClients();
        }
      },
      error => {
        this.spinnerService.hide();
        this.errorService.errorHandling(error);
      }
    );
  }

}
