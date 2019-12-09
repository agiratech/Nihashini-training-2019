import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class DataService {
  private defaultProject = new BehaviorSubject('all');
  private defaultUser = new BehaviorSubject('');
  private defaultActivity = new BehaviorSubject('all');
  private defaultTime = new BehaviorSubject('this month');
  private defaultPgNo = new BehaviorSubject(1);
  private defaultStartDate = new BehaviorSubject("");
  private defaultEndDate = new BehaviorSubject("");
  private defaultUserReport = new BehaviorSubject("all");
  private defaultAssessmentYear = new BehaviorSubject("");
  private defaultQuarter = new BehaviorSubject("all");
  private defaultStatus = new BehaviorSubject("all");
  private defaultAssessmentGoalYear = new BehaviorSubject("");
  private defaultTeamGoalDuration = new BehaviorSubject("all");
  private defaultTeamGoalAssessmentYear = new BehaviorSubject("");
  private defaultTeamGoalStatus = new BehaviorSubject("all");
  private defaultTeamAccountName = new BehaviorSubject("");

  currentProject = this.defaultProject.asObservable();
  currentUser = this.defaultUser.asObservable();
  currentActivity = this.defaultActivity.asObservable();
  currentTime = this.defaultTime.asObservable();
  currentPgNo = this.defaultPgNo.asObservable();
  startDate = this.defaultStartDate.asObservable();
  endDate = this.defaultEndDate.asObservable();
  currentUserReport = this.defaultUserReport.asObservable();
  currentAssessmentYear = this.defaultAssessmentYear.asObservable();
  currentQuarter = this.defaultQuarter.asObservable();
  currentStatus = this.defaultStatus.asObservable();
  currentAssessmentGoalYear = this.defaultAssessmentGoalYear.asObservable();
  currentTeamGoalDuration = this.defaultTeamGoalDuration.asObservable();
  currentTeamGoalAssessmentYear = this.defaultTeamGoalAssessmentYear.asObservable();
  currentTeamGoalStatus = this.defaultTeamGoalStatus.asObservable();
  currentTeamAccountName = this.defaultTeamAccountName.asObservable();

  constructor() { }

  changeProject(project: string) {
    this.defaultProject.next(project)
  }

  changeUser(user: string) {
    this.defaultUser.next(user)
  }

  changeActivity(activity: string) {
    this.defaultActivity.next(activity)
  }

  changeTime(time: string){
    this.defaultTime.next(time)
  }

  changePgNo(pgno: number){
    this.defaultPgNo.next(pgno)
  }

  changeStartDate(date: string){
    this.defaultStartDate.next(date)
  }

  changeEndDate(date: string){
    this.defaultEndDate.next(date)
  }

  changeAssessmentYear(year: string){
    this.defaultAssessmentYear.next(year)
  }

  changeQuarter(quarter: string){
    this.defaultQuarter.next(quarter)
  }

  changeStatus(status: string){
    this.defaultStatus.next(status)
  }

  changeUserReport(user: string){
    this.defaultUserReport.next(user)
  }

  changeAssessmentGoalYear(year: string){
    this.defaultAssessmentGoalYear.next(year)
  }

  changeTeamGoalDuration(duration: string){
    this.defaultTeamGoalDuration.next(duration)
  }

  changeTeamGoalAssessmentYear(year: string){
    this.defaultTeamGoalAssessmentYear.next(year)
  }

  changeTeamGoalStatus(status: string){
    this.defaultTeamGoalStatus.next(status)
  }

  changeTeamAccountName(name: string){
    this.defaultTeamAccountName.next(name)
  }

}
