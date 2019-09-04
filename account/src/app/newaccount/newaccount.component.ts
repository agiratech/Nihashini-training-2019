import { Component } from '@angular/core';
import { LoggingService } from '../logging.service';
import { AccountService } from '../account.service';
@Component({
  selector: 'app-newaccount',
  templateUrl: './newaccount.component.html',
  styleUrls: ['./newaccount.component.css'],
  providers: [LoggingService, AccountService]
})
export class NewaccountComponent {
  // @Output() accountAdded = new EventEmitter <{name: string, status: string}>();
 
constructor(private loggingService: LoggingService,
            private accountService: AccountService) {}

  onCreateAccount(accountName: string, accountStatus: string){
    // this.accountAdded.emit({
    //   name: accountName,
    //   status: accountStatus
    // });
    this.loggingService.logStatusChange(accountStatus);
    this.accountService.addAccount(accountName, accountStatus);
  }  
}
