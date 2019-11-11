import { Filter } from '@interTypes/filter';

import { concatMap, debounceTime, map, skip, switchMap } from 'rxjs/operators';
import { ProjectDataStoreService } from '../../../dataStore/project-data-store.service';
import { MarketPlanService } from '../market-plan.service';
import { Component, ElementRef, OnInit, ViewChild, OnDestroy, AfterViewChecked } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatTabGroup } from '@angular/material/tabs';
import { MatSidenav } from '@angular/material/sidenav';
import { ActivatedRoute, Router } from '@angular/router';
import { CanExit } from '@interTypes/canExit';
import { AudienceBrowserDialogComponent } from '@shared/components/audience-browser-dialog/audience-browser-dialog.component';
import {
  AuthenticationService,
  CommonService,
  FormatService,
  LoaderService,
  TargetAudienceService,
  TitleService,
  WorkSpaceDataService,
  WorkSpaceService,
  CSVService,
  InventoryService
} from '../../../shared/services/index';
import swal from 'sweetalert2';
import { CustomValidators } from '../../../validators/custom-validators.validator';
import { DuplicateScenariosComponent } from '../../duplicate-scenarios/duplicate-scenarios.component';
import { ConvertPipe } from '@shared/pipes/convert.pipe';
import { Goals, MarketPlan, MarketPlanTargets, Plan, Query, WorkflowLables, ConfirmationDialog } from '@interTypes/workspaceV2';
import { NewWorkspaceService } from 'app/projects/new-workspace.service';
import { zip, Subject, Observable, pipe } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ENTER, COMMA, SEMICOLON } from '@angular/cdk/keycodes';
import { FilterOptionsComponent } from '../filter-options/filter-options.component';
import { ConfirmationDialogComponent } from '@shared/components/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-scenario-view',
  templateUrl: './scenario-view.component.html',
  styleUrls: ['./scenario-view.component.less'],
})
export class ScenarioViewComponent implements OnInit, CanExit, OnDestroy, AfterViewChecked {
  isEditScenarioName = false;
  isEnableDescription = false;
  isEnableTags = false;
  @ViewChild('sidenav' , {static : false}) sidenav: MatSidenav;
  reason: any = '';
  public scenarioEditForm: FormGroup;
  public currentAudience: any;
  public routeParams: any;
  public savedAudience;
  public markets;
  public dummyMarkets;
  public places: any = [];
  public planData: any = [];
  projectId: any;
  scenarioId: any;
  scenario: any = {};
  projectName: any;
  saveButtonText = 'save scenario';
  isSpinner = false;
  isSavedScenario = false;
  public selectedAudience: any;
  public selectedMarket: any;
  public selectedMarketType: any;
  isScenarioNameError = false;
  tags: any = [];
  scenarioName: any;
  project: any;
  errorMessage: string;
  editScenarioNote = false;
  scenarioNotes: any;
  dataSource: any = [];
  selectedPlaceSets: any = [];
  public selectedPlacesIds: any = [];
  public inventoryParam: any = {};
  @ViewChild('fName', {static: false}) focusNameRef: ElementRef;
  @ViewChild('fDescription', {static: false}) focusDescriptionRef: ElementRef;
  @ViewChild('tabGroup', {static: false}) tabGroup: MatTabGroup;
  mod_permission: any;
  isAddGoal = false;
  dayparts = [];
  numericPattern = '^[0-9,-]*$';
  allowInventory = '';
  audienceLicense = {};
  public currentAudienceTitle = '';
  public currentMarketTitle = '';
  public summaryPackage: any = {};
  updateScenarioStatus = false;
  isOpenedScenario = false;
  private inventoryDetails = {};
  private placesDetails = {};
  public selectedDefaultMarket = { id: 'us', name: 'United States' };
  public selectedDefaultAudience = { id: '', title: 'Select An Audience' };
  public labels: WorkflowLables;
  public selectedTab = 1;
  public isEnableMapInventory = true;
  public selectedMarketOptions: Filter[] = [];
  public selectedAudienceOptions: Filter[] = [];
  public selectedOperatorOptions: Filter[] = [];
  public goalFormData: any;
  public selectedMediaTypes: any = [];
  public generatedPlanData: any;
  public isEnableMyPlan = false;
  public activate = new FormControl();
  public setOverView = false;
  public mainPlanGoalData: any = [];
  public defaultAudiecne: any = {};
  public isEnableOperator = false;
  private projectPermission: any;
  public operatorModulePermission = false;
  public scenarioKeysCodes = [ENTER, COMMA, SEMICOLON];
  private operatorOptions: any;
  private unSubscribe: Subject<void> = new Subject<void>();
  public isInventoryExist = false;
  public isPlaceExist = false;
  public targetGoalFormData: any;
  private saveForm: Subject<any> = new Subject();
  public isExpandTarget = true;
  public isVisibleMarketPlanTab = true;
  public isVisibleInventoryTab = true;
  public selectedTabLabel = '';
  public isLoader: Boolean = false;
  constructor(private cService: CommonService,
    private tService: TitleService,
    private fb: FormBuilder,
    private router: Router,
    private workSpaceDataService: WorkSpaceDataService,
    private workSpaceService: WorkSpaceService,
    private formatService: FormatService,
    private loaderService: LoaderService,
    private activeRoute: ActivatedRoute,
    public dialog: MatDialog,
    private targetAudience: TargetAudienceService,
    private auth: AuthenticationService,
    private CSV: CSVService,
    private convert: ConvertPipe,
    private newWorkspaceService: NewWorkspaceService,
    private marketPlanService: MarketPlanService,
    private projectStore: ProjectDataStoreService,
    private inventoryService: InventoryService
  ) {
    this.marketPlanService.resetData();
  }
  ngOnInit() {
    this.saveForm.pipe(
      map(res => {
        let goals: Goals = null;
        const markets = this.selectedMarketOptions.map(i => {
          return {
            id: i.id,
            name: i.name,
          };
        });
        if (this.goalFormData) {
          goals = this.marketPlanService.prepareGoals(this.goalFormData);
        }
        const operators = this.selectedOperatorOptions.map(operator => operator.name);
        const targets: MarketPlanTargets = {
          audiences: this.selectedAudienceOptions,
          markets: markets,
          goals: goals,
          mediaTypeFilters: this.marketPlanService.cleanMediaTypeData(this.selectedMediaTypes),
          operators: operators
        };
        if (targets.operators.length <= 0) {
          delete targets.operators;
        }
        const marketPlan: MarketPlan = {
          targets: targets
        };
        return marketPlan;
      }),
      debounceTime(600),
      skip(2),
      concatMap((marketPlan: MarketPlan) => this.marketPlanService
        .autoSavePlanTargets(this.scenarioId, marketPlan)
      ),
      takeUntil(this.unSubscribe)
    ).subscribe((response) => {
      // this subscribe is important
    });
    this.isOpenedScenario = false;
    this.dayparts = this.workSpaceDataService.getDayparts();
    this.labels = this.newWorkspaceService.getLabels();
    this.saveButtonText = 'save ' + this.labels['scenario'][0];
    // Commented to use markets list from CSV by Jagadeesh on 03-10-2019 and here no need of this.markets
    // this.markets = this.activeRoute.snapshot.data['markets'] || [];
    this.markets = this.activeRoute.snapshot.data['dummyMarkets'] || [];
    this.dummyMarkets = this.activeRoute.snapshot.data['dummyMarkets'] || [];
    this.project = this.activeRoute.snapshot.data.project;
    this.operatorOptions = this.activeRoute.snapshot.data.operators;
    if (this.activeRoute.snapshot.data.places && this.activeRoute.snapshot.data.places['data']) {
      this.places = this.activeRoute.snapshot.data.places.data;
    }
    const planTab = this.activeRoute.snapshot.params['plan'] && this.activeRoute.snapshot.params['plan'] || 'inventory';
    this.savedAudience = this.activeRoute.snapshot.data.audiences['audienceList'];
    this.mod_permission = this.auth.getModuleAccess('explore');
    this.allowInventory = this.mod_permission['features']['gpInventory']['status'];
    this.audienceLicense = this.auth.getModuleAccess('gpAudience');

    /** Getting Project module permission */
    this.projectPermission = this.auth.getModuleAccess('projects');

    if (this.projectPermission['scenarios']['operators']['status'] === 'active') {
      this.operatorModulePermission = true;
      this.isEnableOperator = true;
    } else {
      this.operatorModulePermission = false;
      this.isEnableOperator = false;
    }

    if (this.projectPermission['scenarios'] && this.projectPermission['scenarios']['marketPlans'] && this.projectPermission['scenarios']['marketPlans']['status'] === 'active') {
      this.isVisibleMarketPlanTab = true;
    } else {
      this.isVisibleMarketPlanTab = false;
    }
    if (planTab === 'market' && this.isVisibleMarketPlanTab) {
      this.selectedTab = 0;
    } else if (planTab !== 'market' && !this.isVisibleMarketPlanTab) {
      this.selectedTab = 0;
    } else {
      this.selectedTab = 1;
    }

    if (this.projectPermission['scenarios'] && this.projectPermission['scenarios']['package'] && this.projectPermission['scenarios']['package']['status'] === 'active') {
      this.isVisibleInventoryTab = true;
    } else {
      this.isVisibleInventoryTab = false;
    }


    this.routeParams = this.activeRoute.snapshot.params;
    this.scenarioEditForm = this.fb.group({
      'scenario_tags': [[]],
      'name': new FormControl({ value: null, disabled: true }, Validators.required),
      'description': new FormControl({ value: null, disabled: true }),
      'inventory_set': [null],
      'default_audience': new FormControl({
        value: null,
        disabled: this.audienceLicense['status'] === 'disabled',
      }),
      'default_market': new FormControl({
        value: 'us',
        disabled: this.allowInventory === 'disabled'
      }),
      'default_market_type': new FormControl({
        value: 'DMA',
        disabled: this.allowInventory === 'disabled'
      }),
      'places': new FormControl({ value: null }),
      'notes': new FormControl({ value: null, disabled: true }),
      'when': this.fb.group({
        'start': [null],
        'end': [null],
      }, { validator: CustomValidators.validDateRange('start', 'end') }),
      'goals': this.fb.group({
        'impressions': [null, Validators.pattern(this.numericPattern)],
        'trp': [null, Validators.pattern(this.numericPattern)],
        'reach': [null, Validators.pattern(this.numericPattern)],
        'frequency': [null, Validators.pattern(this.numericPattern)]
      })
    });
    this.targetAudience.getDefaultAudience().pipe(takeUntil(this.unSubscribe))
      .subscribe(audience => {
        this.defaultAudiecne = audience;
      });
    this.activeRoute.params.subscribe(params => {
      this.projectId = params['id'];
      this.scenarioId = params['scenarioId'];
      this.loadScenario(this.projectId, this.scenarioId);
    });
    this.marketPlanService.getTargetData().pipe(takeUntil(this.unSubscribe))
      .subscribe((targetData: MarketPlanTargets) => {
        this.selectedTab = 0;
        this.selectedAudienceOptions = targetData.audiences;
        this.selectedMarketOptions = targetData.markets;
        if (targetData.operatorsArray) {
          if (targetData.operatorsArray[0].id === 'Select All') {
            targetData.operatorsArray[0].id = 'all';
          }
          this.selectedOperatorOptions = targetData.operatorsArray;
        }
        this.mainPlanGoalData = targetData.goals;
        this.selectedMediaTypes = targetData.mediaTypeFilters;
      });
    this.marketPlanService.getPlans().pipe(takeUntil(this.unSubscribe)).subscribe((plans) => {
      if (plans && plans.length > 0) {
        this.planData = this.formatPlanList(plans, this.selectedAudienceOptions, this.selectedMarketOptions);
        this.isEnableMyPlan = true;
        this.isExpandTarget = false;
      }
    });
    this.onChanges();
  }
  ngOnDestroy() {
    localStorage.removeItem('marketPlanData');
    localStorage.removeItem('scenarioExportColumn');
    this.unSubscribe.next();
    this.unSubscribe.complete();
  }
  public audienceChange($event) {
    const audience = $event.option.value;
    if (audience['_id'] !== 'createnew') {
      if (Object.keys(audience).length
        && audience['audiences']
        && audience['audiences'].length > 0) {
        this.scenarioEditForm.controls['default_audience'].setValue(audience._id);
        this.currentAudience = audience['audiences'][0]['key'];
        this.currentAudienceTitle = audience['title'];
      } else {
        this.currentAudience = '';
        this.currentAudienceTitle = '';
      }
    }
  }

  public marketChange($event) {
    this.currentMarketTitle = '';
    this.scenarioEditForm.controls['default_market'].setValue($event.option.value['id']);
    this.selectedMarket = $event.option.value['id'];
    this.selectedMarketType = '';
    /**
     * If we select same value again and again, the variable value is not updated,
     * so here have added setTimeout condition to handle this scenario
     * */
    setTimeout(() => {
      this.currentMarketTitle = $event.option.value['name'];
    }, 100);
  }

  private loadScenario(projectId, scenarioID) {
    this.loaderService.display(true);
    this.workSpaceService.getScenariobyId(scenarioID).subscribe(
      response => {
        this.tService.updateTitle(response['scenario']['name']);
        const scenario = response['scenario'];
        this.scenario = response['scenario'];
        if (scenario.labels.length > 0) {
          this.tags = scenario.labels;
        }
        this.setFormValues(scenario);
        this.inventoryParam = { 'scenario': scenario._id };
        this.loaderService.display(false);
        this.workSpaceService.getProject(projectId).subscribe(
          responsePjct => {
            this.projectName = responsePjct['name'];
            const breadcrumb = this.cService.prepareBreadcrumbs({ id: this.projectId, name: responsePjct['name'] });
            const breadcrumbs = breadcrumb['breadCrumbs'];
            breadcrumbs.push({ label: scenario.name, url: '' });
            this.cService.setBreadcrumbs(breadcrumbs);
          });
        const targetData = response['scenario']['marketPlans']['targets'];
        if (targetData && targetData['audiences'].length <= 0) {
          this.selectedAudienceOptions = [{ id: this.defaultAudiecne.audienceKey, name: this.defaultAudiecne.description }];
        }
        if (response['scenario']['marketPlans'] && response['scenario']['marketPlans'].length > 0) {
          this.selectedTab = 0;
          const plans = response['scenario']['marketPlans'][0]['plans'];
          this.selectedAudienceOptions = plans['audiences'];
          this.selectedMarketOptions = plans['markets'];
          this.selectedOperatorOptions = plans['operators'];

          // TODO : Need to change the default plan values in the below line once the API changed

          // TODO changes main form and mediatypes based API

          if (response['scenario']['marketPlans'][0]['plans']['mainData']) {
            this.mainPlanGoalData = response['scenario']['marketPlans'][0]['plans']['mainData']['goals'];
            this.selectedMediaTypes = response['scenario']['marketPlans'][0]['plans']['mainData']['mediaTypes'];
          } else {
            this.mainPlanGoalData = response['scenario']['marketPlans'][0]['query']['goals'];
            this.selectedMediaTypes = response['scenario']['marketPlans'][0]['plans']['mediaTypes'];
          }
          const generatePlansData = response['scenario']['marketPlans']
            .map(plandata => plandata['plans']['data']);


          const generatedQueryData = response['scenario']['marketPlans']
            .map(generated => generated['query']);

          // Plan media types added in Query params
          response['scenario']['marketPlans']
            .map((mtype, index) => {
              generatedQueryData[index]['mediaTypes'] = mtype['plans']['mediaTypes'];
            });

          if (this.selectedOperatorOptions.length === 1) {
            if (this.selectedOperatorOptions[0]['id'] === 'all') {
              this.isEnableOperator = false;
            }
          }
          // store plan data to local storage will

          localStorage.setItem('marketPlanData', JSON.stringify(response['scenario']['marketPlans']));

          this.loadGenerateData(generatePlansData, this.selectedAudienceOptions, this.selectedMarketOptions, this.selectedOperatorOptions,
            this.mainPlanGoalData, this.selectedMediaTypes, this.isEnableOperator, generatedQueryData);

        } else {
          localStorage.setItem('marketPlanData', null);
          const selectAll = [{
            'id': 'all',
            'name': 'Select All',
            'count': 0
          }];
          // this.selectedOperatorOptions = selectAll;
          /*const daudience = {'id': this.defaultAudiecne.audienceKey, 'name': this.defaultAudiecne.description + ' (Default)'};
          this.selectedAudienceOptions = [daudience];*/
        }
        this.setPlanData(response['scenario']['marketPlans'], false);
      },
      error => {
        this.loaderService.display(false);
      });
  }
  private setFormValues(scenario: any) {
    this.selectedPlacesIds = scenario['places'];
    this.selectedPlaceSets = this.places.filter((placeObj) => {
      if (this.selectedPlacesIds.indexOf(placeObj._id) !== -1) {
        return placeObj;
      }
    });
    if (scenario['goals'] && scenario['goals'][0]) {
      this.isAddGoal = true;
    }
    this.scenarioEditForm.setValue({
      'name': scenario.name,
      'description': scenario.description || null,
      'inventory_set': scenario.package || [null],
      'default_audience': scenario['audience'] && scenario['audience']['audience_id'] || null,
      'default_market': scenario['audience'] && scenario['audience'].market_id || 'us',
      'default_market_type': scenario['audience'] && scenario['audience'].market_type || 'DMA',
      'places': scenario['places'] || null,
      'when': {
        'start': scenario['when'] && new Date(scenario['when'].start) || null,
        'end': scenario['when'] && new Date(scenario['when'].end) || null,
      },
      'scenario_tags': this.tags,
      'notes': null,
      'goals': {
        'impressions': scenario['goals'] && scenario['goals'].length > 0 && scenario['goals'][0].impressions || null,
        'trp': scenario['goals'] && scenario['goals'].length > 0 && scenario['goals'][0].trp || null,
        'reach': scenario['goals'] && scenario['goals'].length > 0 && scenario['goals'][0].reach || null,
        'frequency': scenario['goals'] && scenario['goals'].length > 0 && scenario['goals'][0].frequency || null
      }
    });
    this.selectedAudience = scenario['audience'] && scenario['audience']['audience_id'] || null;
    const filter = this.savedAudience.filter(audience => audience['_id'] === this.selectedAudience);
    if (filter.length > 0 && filter[0]['audiences'] && filter[0]['audiences'].length > 0) {
      this.currentAudience = filter[0]['audiences'][0]['key'];
      this.currentAudienceTitle = filter[0]['title'];
      this.selectedDefaultAudience = filter[0];
    } else {
      this.currentAudience = '';
      this.currentAudienceTitle = '';
    }
    this.selectedMarket = scenario['audience'] && scenario['audience']['market_id'] || 'us';
    this.selectedMarketType = scenario['audience'] && scenario['audience']['market_type'] || 'DMA';
    this.workSpaceDataService.scenarioName = scenario.name;
    this.workSpaceDataService.scenarioDescription = scenario.description;
    this.workSpaceDataService.scenarioTags = Object.assign([], scenario.labels);
    if (scenario['notes']) {
      this.scenarioNotes = scenario['notes'];
      this.scenarioEditForm['controls'].notes.patchValue(scenario['notes']);
    }
    if (scenario['audience'] && scenario['audience']['market_id']) {
      let marketName;
      if (scenario['audience']['market_type'] && scenario['audience']['market_type'] === 'CBSA') {
        this.inventoryService.getMarketByID(scenario['audience']['market_id'])
          .pipe(takeUntil(this.unSubscribe))
          .subscribe(data => {
            if (data && data['market']) {
              const tempMarket = {
                id: data['market']['id'],
                name: data['market']['name'],
                type: data['market']['type']
              };
              marketName = tempMarket;
              if (marketName) {
                this.currentMarketTitle = marketName['name'];
              }
              this.selectedDefaultMarket = marketName;
            }
          });
      } else {
        marketName = this.dummyMarkets.find(market => market['id'] === scenario['audience']['market_id']);
        if (marketName) {
          this.currentMarketTitle = marketName['name'];
        }
        this.selectedDefaultMarket = marketName;
      }
    } else {
      this.currentMarketTitle = 'United States';
    }
  }

  close(reason: string) {
    this.reason = reason;
    this.sidenav.close();
  }
  onEditScenarioName() {
    this.isEditScenarioName = true;
    this.scenarioEditForm['controls'].name.enable();
    this.scenarioEditForm['controls'].description.enable();

    setTimeout(() => {
      this.focusNameRef.nativeElement.focus();
    }, 100);

  }

  onSaveScenarioName() {
    if (this.isScenarioNameValid()) {
      setTimeout(() => {
        this.workSpaceDataService.scenarioName = this.scenarioEditForm['controls'].name.value;
        this.isEditScenarioName = false;

        this.workSpaceDataService.scenarioDescription = this.scenarioEditForm['controls'].description.value;
        this.scenarioEditForm['controls'].description.disable();
        this.scenarioEditForm.markAsDirty();
      }, 100);
    }
  }

  private isScenarioNameValid(): boolean {
    return !this.scenarioEditForm['controls'].name.hasError('required');
  }

  onCancelScenarioName() {
    if (this.isScenarioNameValid()) {
      this.isEditScenarioName = false;
      this.scenarioEditForm['controls'].name.setValue(this.workSpaceDataService.scenarioName);
      this.scenarioEditForm['controls'].name.disable();

      this.scenarioEditForm['controls'].description.patchValue(this.workSpaceDataService.scenarioDescription);
      this.scenarioEditForm['controls'].description.disable();

      this.tags = Object.assign([], this.workSpaceDataService.scenarioTags);
    }
  }

  onEditDescription() {
    this.isEnableDescription = true;
    this.scenarioEditForm['controls'].description.enable();
    setTimeout(() => {
      this.focusDescriptionRef.nativeElement.focus();
    }, 100);
  }
  onSaveDescription() {
    setTimeout(() => {
      this.isEnableDescription = false;
      this.workSpaceDataService.scenarioDescription = this.scenarioEditForm['controls'].description.value;
      this.scenarioEditForm['controls'].description.disable();
      this.scenarioEditForm.markAsDirty();
    }, 100);
  }
  onCancelDescription() {
    this.isEnableDescription = false;
    this.scenarioEditForm['controls'].description.patchValue(this.workSpaceDataService.scenarioDescription);
    this.scenarioEditForm['controls'].description.disable();
  }
  onEnableTag() {
    this.isEnableTags = true;
  }
  onSaveScenarioTags() {
    setTimeout(() => {
      this.isEnableTags = false;
    }, 100);
  }
  onCancelScenarioTags() {
    this.isEnableTags = false;
    this.tags = Object.assign([], this.workSpaceDataService.scenarioTags);
  }
  onChanges(): void {
    this.scenarioEditForm.valueChanges.subscribe(val => {
      Object.keys(this.scenarioEditForm.controls).forEach(field => {
        const control = this.scenarioEditForm.get(field);
        if (this.isSavedScenario && this.scenarioEditForm.dirty) {
          this.isSavedScenario = false;
          this.saveButtonText = 'save ' + this.labels['scenario'][0];
        }
      });
    });
  }
  onSubmit() {
    Object.keys(this.scenarioEditForm.controls)
      .forEach(field => {
        const control = this.scenarioEditForm.get(field);
        control.markAsTouched({ onlySelf: true });
      });
    this.scenarioEditForm['controls'].name.enable();

    if (this.selectedTabLabel === 'Inventory' && !this.scenarioEditForm.valid) {
      return true;
    }

    // The extra scenario name condition is required because disabled field is not validated by default in angular

    if (this.scenarioEditForm['controls']['name'].valid) {
      this.isSpinner = true;
      this.saveButtonText = 'Saving ' + this.labels['scenario'][0] + '...';
      this.isSavedScenario = true;
      this.isScenarioNameError = false;
      this.loaderService.display(true);
      this.scenarioEditForm.markAsUntouched();
      this.scenarioEditForm.markAsPristine();
      const scenario = this.workSpaceService.formatScenarioData(this.scenarioEditForm);
      if (scenario['audience']) {
        if (!scenario.audience.audience_id) {
          delete scenario.audience.audience_id;
        }
        if (!scenario.audience.market_id) {
          delete scenario.audience.market_id;
          delete scenario.audience.market_type;
        }
        if (!scenario.audience['audience_id'] && !scenario.audience['market_id']) {
          delete scenario.audience;
        }
      }
      const updateFormatted = {
        scenario
      };
      const updateIds = {
        'id': this.projectId,
        'scenarioId': this.scenarioId
      };
      this.workSpaceDataService.scenarioName = scenario.name;
      this.workSpaceDataService.scenarioDescription = scenario.description;
      this.newWorkspaceService.updateScenario(updateIds, updateFormatted)
        .subscribe(
          response => {
            this.loaderService.display(false);
            scenario['_id'] = this.scenarioId;
            this.projectStore.addOrUpdateScenrio(scenario, this.projectId);
            this.isSpinner = false;
            if ((updateFormatted['scenario']['package'] && updateFormatted['scenario']['package'].length > 0)
              || (updateFormatted['scenario']['places'] && updateFormatted['scenario']['places'].length > 0)) {
              this.isInventoryExist = true;
            } else {
              this.isInventoryExist = false;
            }
            this.saveButtonText = this.labels['scenario'][0] + ' Saved';
            $('.scenario-spacing').click();
            this.scenarioEditForm.controls.name.patchValue(this.workSpaceDataService.scenarioName);
            this.scenarioEditForm['controls'].description.patchValue(this.workSpaceDataService.scenarioDescription);
            this.scenarioEditForm['controls'].notes.patchValue(scenario.notes);
            this.scenarioNotes = scenario.notes;
            this.workSpaceDataService.scenarioTags = Object.assign([], this.tags);
            this.closeScenarioNotes();
            this.updateScenarioStatus = !this.updateScenarioStatus;
          },
          error => {
            this.isScenarioNameError = true;
            if (error['error']['error'] === 'scenarioNameExists') {
              this.errorMessage = 'This ' + this.labels['scenario'][0] + ' Name already exists. Please try with another name';
            } else if (error['error']['error'] === 'scenarioNameZeroLength') {
              this.errorMessage = `The ${this.labels['scenario'][0]} name can't be empty`;
            }
            this.isSpinner = false;
            this.saveButtonText = 'Save ' + this.labels['scenario'][0];
            this.loaderService.display(false);
          }
        );
    }
  }
  /** Dublicate scenario function */
  onDuplicateScenario() {
    if (this.project && this.project.scenarios.length > 0) {
      this.scenarioName = this.formatService.getObjectTitle(this.project.scenarios, 'Scenario', 'name');
    } else {
      this.scenarioName = 'Untitled ' + this.labels['scenario'][0] + ' 1';
    }
    if (this.scenarioName === this.scenarioEditForm.controls.name.value) {
      const lastItemCount = this.scenarioName.split(' ')[2];
      if (parseInt(lastItemCount, 10)) {
        this.scenarioName = 'Untitled ' + this.labels['scenario'][0] + (parseInt(lastItemCount, 10) + 1);
      }
    }
    const data = {};
    const width = '500px';
    const height = 'auto';
    data['projectId'] = this.routeParams.id;
    data['scenarioId'] = this.routeParams.scenarioId;
    data['scenarioName'] = this.scenarioName;
    const browser = this.dialog.open(DuplicateScenariosComponent, {
      height: height,
      data: data,
      width: width,
      closeOnNavigation: true,
      panelClass: 'duplicate-scenario-container'
    }).afterClosed().subscribe(response => {
      if (!response) {
        return;
      }
      if (response['data'] && response['data']['id']) {
        const list = '/v2/projects/' + response['data']['id'].project + '/scenarios/' + response['data']['id'].scenario;
        swal('Success', `${this.labels['scenario'][0]} cloned successfully`, 'success').then((result) => {
          this.router.navigate([list]);
        });
      } else {
        swal('Error', 'Something went wrong, Please try again', 'error');
      }
    });
  }
  onDelete(pId, sId) {
    swal({
      title: 'Are you sure you want to delete this ' + this.labels['scenario'][0] + '?',
      text: '',
      type: 'warning',
      showCancelButton: true,
      cancelButtonText: 'NO',
      confirmButtonText: 'YES, DELETE',
      confirmButtonClass: 'waves-effect waves-light',
      cancelButtonClass: 'waves-effect waves-light'
    }).then((x) => {
      if (typeof x.value !== 'undefined' && x.value) {
        this.loaderService.display(true);
        this.workSpaceService.deleteScenarios(sId).subscribe(response => {
          this.projectStore.deleteScenario(sId, pId);
          this.loaderService.display(false);
          swal('Deleted!', this.labels['scenario'][0] + ' set deleted successfully', 'success');
          this.router.navigate(['/v2/projects/' + pId]);
        },
          e => {
            let message = '';
            if (typeof e.error !== 'undefined' && typeof e.error.message !== 'undefined') {
              message = 'An error has occurred. Please try again later.';
            }
            swal('Error', message, 'error');
            this.loaderService.display(false);
          });
      }
    }).catch(swal.noop);
  }
  onCancel() {
    const link = '/user/scenarios/' + this.routeParams.id + '/list';
    this.router.navigate([link]);
  }
  canDeactivate(): Promise<any> | boolean {
    return this.cService.confirmExit(this.scenarioEditForm,
      'You want to discard the changes you made to this ' + this.labels['scenario'][0] + '?');
  }
  editScenarioNotes() {
    this.editScenarioNote = true;
    this.scenarioEditForm['controls'].notes.enable();
  }
  cancelEditScenarioNotes() {
    this.editScenarioNote = false;
    this.scenarioEditForm['controls'].notes.disable();
    this.scenarioEditForm['controls'].notes.patchValue(this.scenarioNotes);
    this.dropdownStageChange(false);
  }
  closeScenarioNotes() {
    this.cancelEditScenarioNotes();
  }

  updateInventerySet(packageIds) {
    this.isSavedScenario = false;
    this.saveButtonText = 'save ' + this.labels['scenario'][0];
    this.scenarioEditForm['controls'].inventory_set.patchValue(packageIds);
  }
  public updatePlaces(placesIds) {
    this.scenarioEditForm['controls'].places.patchValue(placesIds);
  }
  public browserAudience() {
    const browser = this.dialog.open(AudienceBrowserDialogComponent, {
      height: '550px',
      data: { isScenario: false },
      width: '700px',
      closeOnNavigation: true,
      panelClass: 'audience-browser-container'
    }).afterClosed().subscribe(result => {
      if (result) {
        this.loaderService.display(true);
        this.targetAudience.getSavedAudiences()
          .subscribe(response => {
            this.savedAudience = response.audienceList;
            this.scenarioEditForm.controls['default_audience'].setValue(result.currentTargetId);
            const filter = this.savedAudience.filter(audience => audience['_id'] === result.currentTargetId);
            if (filter.length > 0 && filter[0]['audiences'] && filter[0]['audiences'].length > 0) {
              this.currentAudience = filter[0]['audiences'][0]['key'];
              this.currentAudienceTitle = filter[0]['title'];
              this.selectedDefaultAudience = filter[0];
            } else {
              this.currentAudience = '';
              this.currentAudienceTitle = '';
            }
            this.loaderService.display(false);
          });
      }
    });
  }
  onAddGoals() {
    this.isAddGoal = true;
  }
  deliveryGoalSummary(summary) {
    this.isInventoryExist = true;
    if (summary['assignSummary']) {
      this.summaryPackage = summary;
    }
    if (summary['clearSummary']) {
      this.summaryPackage = {};
      this.isInventoryExist = false;
    }
    // this.reachFrqPackage = summary;
  }
  updateInventory(inventory) {
    this.inventoryDetails = inventory;
  }
  updatePlacesData(places) {
    this.placesDetails = places;
    if (Object.keys(this.placesDetails).length > 0 && this.placesDetails['places'].length > 0) {
      this.isPlaceExist = true;

    } else {
      this.isPlaceExist = false;
    }
  }

  dropdownStageChange(state) {
    this.cService.setDropdownState(state);
  }
  exportCSV(exportFormat, label) {
    this.isLoader = true;
    if (label === 'Market Plan') {
      const scenarioId = this.activeRoute.snapshot.params.scenarioId;
      this.newWorkspaceService.exportCSV(scenarioId).pipe(takeUntil(this.unSubscribe))
      .subscribe(data => {
        let exportCSVData: any;
        this.isLoader = false;
        try {
          exportCSVData = JSON.parse(data);
        } catch (e) {
          exportCSVData = data;
        }
        if (!exportCSVData.code) {
          const a: any = document.createElement('a');
          const blob = new Blob([data], { type: 'text/csv' });
          const url = window.URL.createObjectURL(blob);
          a.href = url;
          a.download = `${this.scenario.name}.csv`;
          a.click();
          window.URL.revokeObjectURL(url);
          a.remove();
        } else {
          swal('Warning', exportCSVData.message, 'warning');
        }
      }, error => {
        const data: ConfirmationDialog = {
          notifyMessage: true,
          confirmTitle: 'Error',
          messageText: 'There is a problem generating the file. Please try again later.',
        };
        this.dialog.open(ConfirmationDialogComponent, {
          data: data,
          width: '450px',
        });
      });
    } else {
      let audienceData = '';
      const audienceId = this.scenarioEditForm.value['default_audience'];
      if (audienceId) {
        this.savedAudience.filter(audience => {
          if (audience._id === audienceId) {
            audienceData = audience.title;
          }
        });
      }
      let marketData = 'United States';
      if (this.selectedDefaultMarket && this.selectedDefaultMarket['name']) {
        marketData = this.selectedDefaultMarket['name'];
      }
      /* if (this.selectedMarket !== 'us') {
        this.dummyMarkets.filter(market => {
          if (market.id === this.selectedMarket) {
            marketData = market.name;
          }
        });
      } */

      const data = {};
      data['name'] = this.workSpaceDataService.scenarioName;
      data['descriptioin'] = this.workSpaceDataService.scenarioDescription;
      data['audience'] = audienceData;
      data['market'] = marketData;
      data['scenario'] = this.scenarioEditForm.value;
      data['summary'] = this.summaryPackage;
      data['inventoryDetails'] = this.inventoryDetails;
      data['placesDetails'] = this.placesDetails;
      const formatData = this.workSpaceDataService.formatCSVDoc(data);
      this.CSV
        .build(formatData, [], true)
        .download(data['name'], exportFormat);
        this.isLoader = false;
    }
  }

  public closeFilterOption(options) {
    this.onApply(options);
  }

  public onApply(options) {
    if (options.filter === 'DMA Market') {
      this.selectedMarketOptions = options.result;
    } else if (options.filter === 'Audience') {
      this.selectedAudienceOptions = options.result;
    } else if (options.filter === 'Operator') {
      this.selectedOperatorOptions = options.result;
      // Note: this variable have all operators data, if user selected 'All' please use this. 
      this.operatorOptions = options.optionsData;
    }
    this.saveForm.next();
  }
  private validateTargetData() {
    if (this.selectedAudienceOptions.length < 1) {
      swal('Warning', 'Please Select atleast one audience', 'warning');
      return false;
    }
    if (this.selectedMarketOptions.length < 1) {
      swal('Warning', 'Please Select atleast one market type', 'warning');
      return false;
    }
    if (this.selectedMediaTypes.length < 1) {
      swal('Warning', 'Please Select atleast one media type', 'warning');
      return false;
    }
    if (this.goalFormData.trp === null) {
      swal('Warning', 'Please enter trp value', 'warning');
      return false;
    }
    return true;
  }
  onGeneratePlanData() {
    if (!this.validateTargetData()) {
      return;
    }
    const operators = this.selectedOperatorOptions.map(operator => operator.name);
    let operatorNames = [];
    if (this.selectedOperatorOptions[0] && this.selectedOperatorOptions[0]['id'] === 'all') {
      operatorNames = this.operatorOptions.map(operater => operater.name);
    } else {
      operatorNames = operators;
    }
    // looping over operator and media type and building the api expected format
    // const mediaTypes = this.marketPlanService.prepareMediaType(operators, this.selectedMediaTypes);
    // Changing the goals value as api expecting
    const goals: Goals = this.marketPlanService.prepareGoals(this.goalFormData);
    // Creating the plans query data by looping over audience and market
    const plans: Plan[] = [];
    this.selectedAudienceOptions.forEach((audience: Filter) => {
      this.selectedMarketOptions.forEach((market: Filter) => {
        const marketData: Filter = {
          id: market.id,
          name: market.name,
        };
        const query: Query = {
          audience: audience,
          market: marketData,
          operators: operatorNames,
          goals: goals,
          mediaTypeFilters: this.marketPlanService.cleanMediaTypeData(this.selectedMediaTypes),
        };
        if (query.operators && query.operators.length === 0) {
          delete query['operators'];
        }
        plans.push({
          query: query
        });
      });
    });
    const markets = this.selectedMarketOptions.map(i => {
      return {
        id: i.id,
        name: i.name,
      };
    });
    // Building the request object
    const marketPlan: MarketPlan = {
      targets: {
        audiences: this.selectedAudienceOptions,
        markets: markets,
        goals: goals,
        mediaTypeFilters: this.marketPlanService.cleanMediaTypeData(this.selectedMediaTypes),
        operators: operators
      },
      plans: plans,
    };
    if (marketPlan.targets.operators && marketPlan.targets.operators.length === 0) {
      delete marketPlan.targets.operators;
    }
    this.marketPlanService.generatePlans(this.scenarioId, marketPlan, this.isEnableMyPlan)
      .pipe(switchMap((data) => {
        return this.marketPlanService.getMarketPlans(this.scenarioId);
      }))
      .subscribe((data: MarketPlan) => {
        this.setPlanData(data);
      });
  }

  private setPlanData(data: MarketPlan, generatePlans = true): void {
    this.marketPlanService.setMarketPlanData(data);
    let receivedPlans = [];
    if (data && data.plans) {
      receivedPlans = data.plans;
      this.targetGoalFormData = data['targets']['goals'];
      receivedPlans.map(pl => {
        if (pl.query.operators && pl.query.operators.length === 0) {
          delete pl.query.operators;
        }
      });
    }
    this.marketPlanService.setPlanData(receivedPlans);
    if (generatePlans) {
      this.marketPlanService.generatePlansFromGP(receivedPlans, this.scenarioId);
    }
  }

  loadGenerateData(apiData, audiences, markets, operators, goalForm, mediaTypes = [], isOperator, queryData = []) {
    this.generatedPlanData = {
      'data': apiData,
      'queries': queryData,
      'audiences': audiences,
      'markets': markets,
      'operators': operators,
      'goalForm': goalForm,
      'mediaTypes': mediaTypes,
      'enableOperator': isOperator
    };
    this.planData = this.formatPlanList(
      Object.assign([], this.generatedPlanData.data), this.generatedPlanData.audiences, this.generatedPlanData.markets);
    this.isEnableMyPlan = true;
  }

  formatPlanList(planList, audiences, markets) {
    const fDatas = [];
    if (planList[0]['plan']['summaries']) {
      // Group by audience
      const groupByAudience = planList.reduce(function (r, a) {
        if (typeof a['plan']['summaries'] !== 'undefined') {
          r[a['plan']['summaries']['total']['measures']['target_segment']] = r[a['plan']['summaries']['total']['measures']['target_segment']] || [];

          r[a['plan']['summaries']['total']['measures']['target_segment']].push(a);
        }
        return r;
      }, Object.create(null));
      Object.keys(groupByAudience).forEach((audienceKey, index) => {
        let audienceName = '';
        let audienceID = '';
        let trp = 0;
        let spots = 0;
        groupByAudience[audienceKey].filter(plan => {
          audienceName = audiences.filter(data => data.id === Number(plan['plan']['summaries']['total']['measures']['target_segment']));
          audienceID = plan['plan']['summaries']['total']['measures']['target_segment'];
          trp += plan['plan']['summaries']['total']['measures']['trp'];
          spots += plan['plan']['summaries']['total']['measures']['spots'];
        });
        if (audienceName.length > 0) {
          const list = {
            'audience': audienceName[0]['name'],
            'id': audienceID,
            'trp': trp,
            'spots': spots
          };
          fDatas.push(list);
        }
      });
    } else {
      this.selectedAudienceOptions.filter(audience => {
        const list = {
          'audience': audience['name'],
          'id': audience['id'],
          'trp': '',
          'spots': ''
        };
        fDatas.push(list);
      });
    }
    return fDatas;
  }
  onGoalDetails(goalFormData) {
    this.goalFormData = goalFormData;
    this.saveForm.next();
  }
  updateSelectedMediaType(mediaType) {
    this.selectedMediaTypes = mediaType;
    this.saveForm.next();
  }
  onToggleChange() {
    const toggleValue = this.activate.value;
    if (!toggleValue) {
      this.setOverView = true;
    } else {
      this.setOverView = false;
    }
  }
  ngAfterViewChecked() {
    if (this.tabGroup['_tabs'] && this.tabGroup['_tabs']['_results']) {
      this.tabGroup['_tabs']['_results'].map(tab => {
        if (tab['isActive']) {
          this.selectedTabLabel = tab['textLabel'];
        }
      });
    }
  }
  // single select market popup.
  openMarketPopup() {
    let selectedMarket = {};
    if (this.selectedMarket) {
      selectedMarket = this.dummyMarkets.find(market => {
        return market['id'] === this.selectedMarket;
      });
    }
    const data = {
      title: 'Add Market',
      buttonText: 'Add Selected',
      optionsData: this.dummyMarkets,
      selectedData: this.selectedDefaultMarket,
      type: 'Market',
      method: 'single',
      enableCBSA: true
    };
    this.dialog.open(FilterOptionsComponent, {
      width: '460px',
      data: data
    }).afterClosed().subscribe(result => {
      if (result && result.selectedOption && result.selectedOption.id) {
        this.selectedMarket = result.selectedOption.id;
        this.selectedMarketType = result.type;
        this.currentMarketTitle = result.selectedOption.name;
        this.selectedDefaultMarket = result.selectedOption;
        this.scenarioEditForm.controls['default_market'].setValue(result.selectedOption.id);
        this.scenarioEditForm.controls['default_market_type'].setValue(result.marketType);
      }
    });
  }
  removeMarketFromList() {
    this.selectedMarket = 'us';
    this.currentMarketTitle = 'United States';
    this.scenarioEditForm.controls['default_market'].setValue('us');
    this.scenarioEditForm.controls['default_market_type'].setValue('DMA');
  }
}
