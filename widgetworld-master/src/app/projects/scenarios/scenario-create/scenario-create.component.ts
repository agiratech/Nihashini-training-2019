import { Component, ElementRef, OnDestroy, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import {ProjectDataStoreService} from '../../../dataStore/project-data-store.service';
import { CanExit } from '../../../Interfaces/canExit';
import { AudienceBrowserDialogComponent } from '../../../shared/components/audience-browser-dialog/audience-browser-dialog.component';
import {
  AuthenticationService,
  CommonService,
  FormatService,
  LoaderService,
  TargetAudienceService,
  WorkSpaceDataService,
  WorkSpaceService,
  TitleService
} from '../../../shared/services/index';
import swal from 'sweetalert2';
import { CustomValidators } from '../../../validators/custom-validators.validator';
import { NewWorkspaceService } from 'app/projects/new-workspace.service';
import { WorkflowLables } from '../../../Interfaces/workspaceV2';
import { zip } from 'rxjs';
import { ENTER, COMMA, SEMICOLON } from '@angular/cdk/keycodes';

@Component({
  selector: 'app-scenario-create',
  templateUrl: './scenario-create.component.html',
  styleUrls: ['./scenario-create.component.less']
})
export class ScenarioCreateComponent implements OnInit, OnDestroy, CanExit, AfterViewInit {
  isEditScenarioName = false;
  saveButtonText = 'save Scenario';
  isSpinner = false;
  isSavedScenario = false;
  public currentAudience: any;
  public selectedMarket: any = '';
  private unSubscribe = true;
  public scenarioStep2Form: FormGroup;
  public savedAudience: any;
  public markets: any;
  public inventory: any;
  private project: any;
  public projectId;
  public projectName;
  scenarioName = '';
  editScenarioNote = false;
  scenarioNotes: any;
  dataSource: any = [];
  tags: any = [];
  public places: any = [];
  mod_permission: any;
  isAddGoal = false;
  @ViewChild('fName', {static: false}) focusNameRef: ElementRef;
  numericPattern = '^[0-9,-]*$';
  dayparts = [];
  scenario = {};
  allowInventory = '';
  audienceLicense = {};
  public currentAudienceTitle = '';
  public currentMarketTitle = '';
  public summaryPackage: any = {};
  isOpenedScenario = false;
  public selectedDefaultMarket = { id: 'us', name: 'United States' };
  public selectedDefaultAudience = { id: '', title: 'Select An Audience' };
  public labels: WorkflowLables;
  public selectedTab = 1;
  public selectedMarketOptions: any = [];
  public selectedAudienceOptions: any = [];
  public selectedOperatorOptions: any = [];
  public goalFormData: any;
  public selectedMediaTypes: any = [];
  public generatedPlanData: any;
  public isEnableMyPlan: Boolean = false;
  public activate = new FormControl();
  public setOverView = false;
  public isEnableMyPlanBtn = false;
  private isInitialLoad = true;
  public isEnableOperator = false;
  private projectPermission: any;
  public operatorModulePermission = false;
  private isScenarioCreated = false;
  public scenarioId;
  public scenarioKeysCodes = [ENTER, COMMA, SEMICOLON];
  constructor(private fb: FormBuilder,
    private workSpaceData: WorkSpaceDataService,
    private workSpace: WorkSpaceService,
    private common: CommonService,
    private formatService: FormatService,
    private router: Router,
    private activeRoute: ActivatedRoute,
    private loader: LoaderService,
    public dialog: MatDialog,
    private targetAudience: TargetAudienceService,
    private auth: AuthenticationService,
    private workspaceService: NewWorkspaceService,
    private titleService: TitleService,
    private projectStore: ProjectDataStoreService) {
  }

  ngOnInit() {
    this.isOpenedScenario = false;
    this.loader.display(true);
    this.labels = this.workspaceService.getLabels();
    this.titleService.updateTitle(this.labels['scenario'][1]);
    this.saveButtonText = 'Save ' + this.labels['scenario'][0];
    this.dayparts = this.workSpaceData.getDayparts();
    this.mod_permission = this.auth.getModuleAccess('explore');
    this.allowInventory = this.mod_permission['features']['gpInventory']['status'];
    // Commented to use markets list from CSV by Jagadeesh on 03-10-2019
    // this.markets = this.activeRoute.snapshot.data['markets'] || [];
    this.markets = this.activeRoute.snapshot.data['dummyMarkets'] || [];
    this.audienceLicense = this.auth.getModuleAccess('gpAudience');
    this.places = this.activeRoute.snapshot.data.places && this.activeRoute.snapshot.data.places.places || [];
    this.project = this.activeRoute.snapshot.data.project;
    this.savedAudience = this.activeRoute.snapshot.data.audiences['audienceList'];
    this.projectId = this.project._id;
    this.projectName = this.project.name;
    const planTab = this.activeRoute.snapshot.params['plan'] && this.activeRoute.snapshot.params['plan'] || 'inventory';
      if (planTab === 'market') {
        this.selectedTab = 0;
      } else {
        this.selectedTab = 1;
      }
    if (this.project.scenarios.length > 0) {
      this.scenarioName = this.formatService.getObjectTitle(this.project.scenarios, this.labels['scenario'][0], 'name');
    } else {
      this.scenarioName = 'Untitled ' + this.labels['scenario'][0] + ' 1';
    }
    const breadcrumb = this.common.prepareBreadcrumbs({ id: this.projectId, name: this.projectName });
    const breadcrumbs = breadcrumb['breadCrumbs'];
    breadcrumbs.push({ label: this.scenarioName, url: '' });
    this.common.setBreadcrumbs(breadcrumbs);

    /* this.common.setBreadcrumbs([
      {label: 'WORKSPACE', url: ''},
      {label: 'MY ' + this.labels['project'][1] , url: '/v2/projects/lists'},
      {label: this.project.name, url: '/v2/projects/' + this.project._id},
      {label: this.scenarioName, url: ''}
    ]); */
    this.workSpace.getExplorePackages().subscribe(response => {
      this.inventory = response;
    });
    const scenarioDefaults = this.project.scenarios;
    this.scenarioStep2Form = this.fb.group({
      'scenario_tags': [this.tags],
      'name': new FormControl({ value: this.scenarioName, disabled: true }, Validators.required),
      'description': [null],
      'inventory_set': [null],
      'default_audience': new FormControl({
        value: scenarioDefaults.audience || '',
        disabled: this.audienceLicense['status'] === 'disabled',
      }),
      'default_market': new FormControl({
        value: scenarioDefaults.market || 'us',
        disabled: this.allowInventory === 'disabled'
      }),
      'places': [null],
      'notes': new FormControl({ value: null, disabled: true }),
      'when': this.fb.group({
        'start': [scenarioDefaults.timeFrame && new Date(scenarioDefaults.timeFrame.startDate) || null],
        'end': [scenarioDefaults.timeFrame && new Date(scenarioDefaults.timeFrame.endDate) || null],
      }, { validator: CustomValidators.validDateRange('start', 'end') }),
      'goals': this.fb.group({
        'impressions': [null, Validators.pattern(this.numericPattern)],
        'trp': [null, Validators.pattern(this.numericPattern)],
        'reach': [null, Validators.pattern(this.numericPattern)],
        'frequency': [null, Validators.pattern(this.numericPattern)]
      })
    });

    /** Getting Project module permission */
    this.projectPermission = this.auth.getModuleAccess('projects');
    if (this.projectPermission['scenarios']['operators']['status'] === 'active') {
      this.operatorModulePermission = true;
    } else {
      this.operatorModulePermission = false;
      this.isEnableOperator = false;
    }
    const selectAll = [{
      'id': 'all',
      'name': 'Select All',
      'count': 0
    }];
    // this.selectedOperatorOptions = selectAll;
    this.loader.display(false);
    // this.common.setWorkSpaceState('');
  }

  ngAfterViewInit() {
    this.isEnableMyPlanBtn = false;
  }

  public audienceChange($event) {
    const audience = $event.option.value;
    if (Object.keys(audience).length
      && audience['audiences']
      && audience['audiences'].length > 0) {
      this.scenarioStep2Form.controls['default_audience'].setValue(audience._id);
      this.currentAudience = audience['audiences'][0]['key'];
      this.currentAudienceTitle = audience['title'];
      this.selectedDefaultAudience = audience;
    }
  }

  public marketChange($event) {
    this.selectedMarket = $event.option.value['id'];
    this.scenarioStep2Form.controls['default_market'].setValue($event.option.value['id']);
    this.currentMarketTitle = $event.option.value['name'];
    this.selectedDefaultMarket = $event.option.value;
  }

  onEditScenarioName(event) {
    if (event && event['value'] === true && this.isScenarioNameValid()) {
      this.onCancelScenarioName();
    } else {
      this.scenarioStep2Form.controls.name.enable();
      this.isEditScenarioName = true;
      setTimeout(() => {
        this.focusNameRef.nativeElement.focus();
      }, 100);
    }
  }

  private isScenarioNameValid(): boolean {
    return !this.scenarioStep2Form.controls.name.hasError('required');
  }

  onCancelScenarioName() {
    this.isEditScenarioName = false;
    this.scenarioStep2Form.controls.name.setValue(this.scenarioName);
    this.scenarioStep2Form.controls.name.disable();
  }

  onSubmit(isSaveScenario = true) {
    Object.keys(this.scenarioStep2Form.controls)
      .forEach(field => {
        const control = this.scenarioStep2Form.get(field);
        control.markAsTouched({ onlySelf: true });
      });
    if (this.scenarioStep2Form.valid && this.isScenarioNameValid()) {
      this.isSpinner = true;
      this.saveButtonText = 'Saving ' + this.labels['scenario'][0] + '...';
      this.isSavedScenario = true;
      this.loader.display(true);
      const formatted = this.workSpace.formatScenarioData(this.scenarioStep2Form);
      this.workSpace
        .createScenario(this.project._id, formatted)
        .subscribe(response => {
          formatted['_id'] = response.data.scenario;
          this.projectStore.addOrUpdateScenrio(formatted, this.project._id);
          this.isSpinner = false;
          this.saveButtonText = this.labels['scenario'][0] + ' Saved';
          this.scenarioStep2Form.markAsPristine();
          if (isSaveScenario) {
            swal('Success', this.labels['scenario'][0] + ' added successfully.', 'success').then((result) => {
              this.router.navigate([
                '/v2/projects/' +
                this.project._id +
                '/scenarios/' +
                response.data.id.scenario
              ]);
            });
            this.loader.display(false);
          } else {
            this.isScenarioCreated = true;
            this.scenarioId = response.data.id.scenario;
            this.onGenerateScenarioPlan(this.project._id, response.data.id.scenario);
          }

        }, error => {
          if (error.error.message) {
            swal(error.error.message);
          } else {
            swal('Something went wrong');
          }
          this.loader.display(false);
          this.isSavedScenario = false;
          this.isSpinner = false;
          this.saveButtonText = 'save ' + this.labels['scenario'][0];
          $('.scenario-spacing').click();
        });
    }
  }

  ngOnDestroy() {
    this.unSubscribe = false;
  }

  canDeactivate(): Promise<any> | boolean {
    return this.common.confirmExit(this.scenarioStep2Form,
      'Your changes to this ' + this.labels['scenario'][0] + ' have not been saved. Do you want to leave without saving?');
  }

  editScenarioNotes() {
    this.editScenarioNote = true;
    this.scenarioStep2Form['controls'].notes.enable();
  }
  cancelEditScenarioNotes() {
    this.editScenarioNote = false;
    this.scenarioStep2Form['controls'].notes.disable();
    this.scenarioStep2Form['controls'].notes.patchValue(this.scenarioNotes);
    this.dropdownStageChange(false);
  }
  closeScenarioNotes() {
    this.cancelEditScenarioNotes();
  }
  updateInventerySet(packageIds) {
    this.scenarioStep2Form['controls'].inventory_set.patchValue(packageIds);
  }

  public updatePlaces(placesIds) {
    this.scenarioStep2Form['controls'].places.patchValue(placesIds);
  }
  public browserAudience() {
    const browser = this.dialog.open(AudienceBrowserDialogComponent, {
      height: '500px',
      width: '660px',
      data: { isScenario: false },
      closeOnNavigation: true,
      panelClass: 'audience-browser-container',
    }).afterClosed().subscribe(result => {
      if (result) {
        this.loader.display(true);
        this.targetAudience.getSavedAudiences()
          .subscribe(response => {
            this.savedAudience = response.audienceList;
            this.scenarioStep2Form.controls['default_audience'].setValue(result.currentTargetId);
            this.loader.display(false);
            this.selectedDefaultAudience = this.savedAudience.find((audience) => audience['_id'] === result.currentTargetId);
          });
      }
    });
  }
  onAddGoals() {
    this.isAddGoal = true;
  }
  deliveryGoalSummary(summary) {
    if (summary['assignSummary']) {
      this.summaryPackage = summary;
    }
  }
  dropdownStageChange(state) {
    this.common.setDropdownState(state);
  }

  public closeFilterOption(options) {
    this.onApply(options);
  }

  public onApply(options) {
    this.isEnableMyPlanBtn = true;
    if (options.filter === 'Market') {
      this.selectedMarketOptions = options.result;
    } else if (options.filter === 'Audience') {
      this.selectedAudienceOptions = options.result;
    } else if (options.filter === 'Operator') {
      this.selectedOperatorOptions = options.result;
    }
  }
  onGeneratePlan() {
    if (this.selectedAudienceOptions.length < 1) {
      swal('Warning', 'Please Select atleast one audience', 'warning');
      return true;
    }
    if (this.selectedMarketOptions.length < 1) {
      swal('Warning', 'Please Select atleast one market type', 'warning');
      return true;
    }
    // commented on 20/05/2019
    /*if (this.selectedOperatorOptions.length < 1) {
      swal('Warning', 'Please Select atleast one operator type', 'warning');
      return true;
    }*/
    if (this.selectedMediaTypes.length < 1) {
      swal('Warning', 'Please Select atleast one media type', 'warning');
      return true;
    }
    if (this.goalFormData.trp === null) {
      swal('Warning', 'Please enter trp value', 'warning');
      return true;
    }
    if (!this.isScenarioCreated) {
      this.onSubmit(false);
    } else {
      this.onGenerateScenarioPlan(this.projectId, this.scenarioId);
    }

  }
  onGenerateScenarioPlan(projectId, scenarioId) {
    const operaterName = this.selectedOperatorOptions.map(operater => operater.name);
    /*const mediaTypeList = [];
    const classificationType = [];
    if (this.selectedMediaTypes && this.selectedMediaTypes.length > 0) {
      this.selectedMediaTypes.filter(mediaType => {
        mediaTypeList.push(...mediaTypeList, ...mediaType.ids.medias);
        classificationType.push(...classificationType, ...mediaType.ids.environments);
      });
    }*/

    const isOperatorSelectedALL = this.selectedOperatorOptions.filter(opt => opt['id'] === 'all');

    const mediaTypeGroupList = [];
    if (isOperatorSelectedALL.length === 1 || this.selectedOperatorOptions === 0 || !this.operatorModulePermission) {
        this.selectedMediaTypes.filter(mediaType => {
            const groupList =  {
              'frame_media_name_list': mediaType.ids.medias
            };
            if (mediaType.ids.environments.length > 0) {
              groupList['classification_type_list'] = mediaType.ids.environments;
            }
            mediaTypeGroupList.push(groupList);
        });
        this.isEnableOperator = false;
    } else {
      this.isEnableOperator = true;
      operaterName.filter(operator => {
        this.selectedMediaTypes.filter(mediaType => {
            const groupList =  {
              'operator_name_list': [operator],
              'frame_media_name_list': mediaType.ids.medias
            };
            if (mediaType.ids.environments.length > 0) {
              groupList['classification_type_list'] = mediaType.ids.environments;
            }
            mediaTypeGroupList.push(groupList);
        });
      });
    }
    const generatePlanAPI = [];
    if (this.selectedAudienceOptions.length > 0 && this.selectedMarketOptions.length > 0) {
      this.selectedAudienceOptions.filter(audience => {
        this.selectedMarketOptions.filter(market => {
          const apiData = {
            'target_segment': audience['id'],
            'target_geography': market.id,
            'allocation_method': this.goalFormData.allocation,
            'goal': {
              'measure': 'trp',
              'period_days': this.goalFormData.duration,
              'value': this.goalFormData.trp
            },
            'media_type_group_list': mediaTypeGroupList
          };
          generatePlanAPI.push(this.workspaceService.generatePlan(apiData)
          );
        });
      });
      zip(...generatePlanAPI).subscribe(result => {
        const scenarioSavePlan = [];
        result.filter((data, index) => {
          const param = {
            'query': {
              'audience': data['allocation_list'][0]['measures']['target_segment'],
              'market': data['allocation_list'][0]['measures']['target_geo'],
              'goals': {
                'trp': this.goalFormData.trp,
                'reach': this.goalFormData.reach,
                'frequency': this.goalFormData.frequency,
                'duration': this.goalFormData.duration,
                'effectiveReach': this.goalFormData.effectiveReach,
                'allocationMethod': this.goalFormData.allocationMethod
              }
            },
            'plans': {
              'data': data,
              'audiences': this.selectedAudienceOptions,
              'markets': this.selectedMarketOptions,
              'operators': this.selectedOperatorOptions,
              'mediaTypes': this.selectedMediaTypes
            }
          };
          scenarioSavePlan.push(this.workspaceService.createScenarioPlan(scenarioId, param));
        });
        zip(...scenarioSavePlan).subscribe(scenario => {
          this.loader.display(false);
          swal('Success', this.labels['scenario'][0] + ' added successfully.', 'success').then((res) => {
            this.router.navigate([
              '/v2/projects/' +
              projectId +
              '/scenarios/' +
              scenarioId
            ]);
          });
        });
      },
      error => {
        this.loader.display(false);
        swal('Error',
        'There are some issues while creating the plans, can you please try again?',
        'error');
      });
    } else {
      this.router.navigate([
        '/v2/projects/' +
        projectId +
        '/scenarios/' +
        scenarioId
      ]);
    }
  }
  onGoalDetails(goalFormData) {
    this.goalFormData = goalFormData;
    this.isEnableMyPlanBtn = true;
  }
  updateSelectedMediaType(mediaType) {
    this.selectedMediaTypes = mediaType;
    this.isEnableMyPlanBtn = true;
  }
  onToggleChange() {
    const toggleValue = this.activate.value;
    if (!toggleValue) {
      this.setOverView = true;
    } else {
      this.setOverView = false;
    }
  }

}
