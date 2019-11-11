
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA, Component, SimpleChange } from '@angular/core';
import { of } from 'rxjs';
import { ScenariosInventoriesComponent } from './scenarios-inventories.component';
import { RouterTestingModule } from '@angular/router/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { ConvertPipe } from '../../../shared/pipes/convert.pipe';
import { ExploreService, WorkSpaceService, FormatService, WorkSpaceDataService, LoaderService, InventoryService } from '../../../shared/services/index';
import { ExploreSavePackageComponent } from '../../../shared/components/explore-save-package/explore-save-package.component';
import { TruncatePipe } from '../../../shared/pipes/truncate.pipe';
import { ActivatedRoute } from '@angular/router';

@Component({ selector: 'app-scenarios-inventory-list', template: '' })
class ScenariosInnerListComponent { }

@Component({ selector: 'app-scenario-filters', template: '' })
class ScenarioFiltersComponent { }

describe('ScenariosInventoriesComponent', () => {

  let component: ScenariosInventoriesComponent;
  let fixture: ComponentFixture<ScenariosInventoriesComponent>;
  let exploreService: ExploreService;
  let workSpaceService: WorkSpaceService;
  let formatService: FormatService;
  let workspaceDataService: WorkSpaceDataService;
  let loaderService: LoaderService;
  let inventoryService: InventoryService;
  const dialogRefSpyObj = jasmine.createSpyObj({ afterClosed: of({}), close: null });
  let dialogSpy: jasmine.Spy;
  let dialogRef;


  const filter = {
    'filter': {
      'fids': [398287],
      'invalidIds': {
        'GeopanelIds': ['140949'],
        'plantIds': []
      },
      'mAttr': [],
      'mtid': [],
      'opp': []
    }
  };

  beforeEach(async(() => {
    exploreService = jasmine.createSpyObj('ExploreService', [
      'getInventoryFilters',
      'getInventorySummary'
    ]);
    workSpaceService = jasmine.createSpyObj('WorkSpaceService', [
      'getExplorePackages'
    ]);

    formatService = jasmine.createSpyObj('FormatService', [
      'getExplorePackages',
      'convertToPercentageFormat'
    ]);
    workspaceDataService = jasmine.createSpyObj('WorkSpaceDataService', [
      'setCustomizedColumnEmitter'
    ]);
    loaderService = jasmine.createSpyObj('LoaderService', [
      'display'
    ]);
    dialogRef = jasmine.createSpyObj('MatDialogRef', [
      'data'
    ]);
    inventoryService = jasmine.createSpyObj('InventoryService', [
      'normalizeFilterDataNew',
      'getSummary',
      'getInventoryIds',
      'getInventories'
    ]);

    const audience = {
      'audienceKey': 'pf_pop',
      'description': 'Persons 0+ yrs'
    };

    const formattedFilter = {
      id_list: [193369],
      id_type: 'spot_id',
      sort: {
        measure: 'pct_comp_imp_target',
        type: 'asc'
      },
      target_segment: 2009
    };
    const filterData = {
      inventory_summary: {
        frame_id_list: [193227],
        inventory_count: 934,
        pagination: {
          page: 1,
          page_size: 500001,
          number_of_pages: 1
        }
      }
    };
    const summary = {
      inventory_count: 1776,
      total_impressions: 89307991,
      target_impressions: 74929618,
      target_inMarket_impressions: 74929618,
      target_population: 241019694,
      total_population: 326533070,
      trp: 31.08858745691104,
      comp_index: 113.66790108738371,
      reach: 3.3702795152050435,
      freq: 9.224335048963928,
    };

    (<jasmine.Spy>inventoryService.normalizeFilterDataNew).and.returnValue(of(formattedFilter));
    (<jasmine.Spy>inventoryService.getSummary).and.returnValue(of(summary));
    (<jasmine.Spy>inventoryService.getInventoryIds).and.returnValue(of(filterData));
    (<jasmine.Spy>inventoryService.getInventories).and.returnValue(of(formattedFilter));

    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule.withRoutes([]),
        FormsModule,
        BrowserAnimationsModule,
        ReactiveFormsModule,
        FlexLayoutModule,
        MatIconModule,
        MatMenuModule,
        MatDialogModule,
        MatButtonModule
      ],
      declarations: [
        ScenariosInventoriesComponent,
        ConvertPipe,
        ExploreSavePackageComponent,
        ScenariosInnerListComponent,
        ScenarioFiltersComponent,
        TruncatePipe
      ],
      providers: [
        { provide: ExploreService, useValue: exploreService },
        { provide: WorkSpaceService, useValue: workSpaceService },
        { provide: FormatService, useValue: formatService },
        { provide: WorkSpaceDataService, useValue: workspaceDataService },
        { provide: LoaderService, useValue: loaderService },
        { provide: MatDialogRef, useValue: dialogRef },
        { provide: InventoryService, useValue: inventoryService },
        {
          provide: ActivatedRoute, useValue: {
            snapshot: {
              'data': {
                'defaultAudience': audience
              }
            }
          }
        },
      ],
      schemas: [NO_ERRORS_SCHEMA]
    });
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ScenariosInventoriesComponent);
    component = fixture.componentInstance;
    dialogSpy = spyOn(TestBed.get(MatDialog), 'open').and.returnValue(dialogRefSpyObj);

  });

  /* it(`should create 'Scenarios Inventories Component'`, () => {
    expect(component).toBeTruthy();
    fixture.detectChanges();
  });

  it(`should able to get 'Scenarios Inventories section'`, () => {
    fixture.detectChanges();
    const addInventory = fixture.nativeElement.querySelector('.test-add-inventory-btn') as HTMLButtonElement;
    expect(component.addInventoryToogle).toBeFalsy();
    addInventory.click();
    fixture.detectChanges();
    expect(component.addInventoryToogle).toBeTruthy();
  });

  it(`should able to get 'Inventory Metric , Map Inventory && Customize Columns'`, () => {
    fixture.detectChanges();
    const addInventory = fixture.nativeElement.querySelector('.test-add-inventory-btn') as HTMLButtonElement;
    expect(component.addInventoryToogle).toBeFalsy();
    addInventory.click();
    fixture.detectChanges();
    expect(component.addInventoryToogle).toBeTruthy();
    const inventoryMetric = fixture.nativeElement.querySelector('.test-inventory-metric') as HTMLElement;
    const mapInventory = fixture.nativeElement.querySelector('.test-map-inventory') as HTMLButtonElement;
    const testCustomize = fixture.nativeElement.querySelector('.test-customize') as HTMLButtonElement;
    expect(inventoryMetric.innerHTML).toBeTruthy();
    expect(mapInventory.innerHTML).toBeTruthy();
    expect(testCustomize.innerHTML).toBeTruthy();

  });

  it(`should able to render the 'ngOnChanges scenario component'`, () => {
    fixture.detectChanges();
    const addInventory = fixture.nativeElement.querySelector('.test-add-inventory-btn') as HTMLButtonElement;
    expect(component.addInventoryToogle).toBeFalsy();
    addInventory.click();
    fixture.detectChanges();
    expect(component.addInventoryToogle).toBeTruthy();
    expect(component.summary).toEqual({});

    const scenario = {
      'package': ['5b72799666269f3cdf68d209'],
      '_id': '5c18dd41d41be837c0b171d1'
    };
    const audienceId = 'pf_pop';
    component.ngOnChanges({
      scenario: new SimpleChange(null, scenario, true),
      audienceId: new SimpleChange(true, audienceId, true),
      marketId: new SimpleChange(null, 'us', true)
    });
    fixture.detectChanges();
    expect(component.scenarioId).toBe(scenario._id);
    expect(component.selectedInventorySets).toBe(scenario.package);
    expect(component.marketId).toBe('');
  });


  it(`should render the 'Selected Filters'`, () => {
    fixture.detectChanges();
    const addInventory = fixture.nativeElement.querySelector('.test-add-inventory-btn') as HTMLButtonElement;
    expect(component.addInventoryToogle).toBeFalsy();
    addInventory.click();
    fixture.detectChanges();
    expect(component.addInventoryToogle).toBeTruthy();
    expect(component.summary).toEqual({});
    const filterInfo = {
      'filterType': 'Inventory',
      'initial': true,
      'selectedFilters': {
        'additionalData': [{
          '_id': '5b72799666269f3cdf68d209'
        }],
        'data': [140949],
        'selected': 'packagePanel'
      }
    };
    spyOn(component, 'selectedFilters').and.callThrough();
    component.selectedFilters(filterInfo);
    fixture.detectChanges();
    expect(component.selectedFilters).toHaveBeenCalled();
  });

  it(`should able to get the 'Inventory Items'`, () => {
    fixture.detectChanges();
    const addInventory = fixture.nativeElement.querySelector('.test-add-inventory-btn') as HTMLButtonElement;
    expect(component.addInventoryToogle).toBeFalsy();
    addInventory.click();
    fixture.detectChanges();
    expect(component.addInventoryToogle).toBeTruthy();
    expect(component.summary).toEqual({});

    component.getInventoryItems(true, true);
    fixture.detectChanges();

    // call the calculateMetrics function
    spyOn(component, 'calculateMetrics').and.callThrough();
    let selectedInventory = [{
        checked: true,
        compi: 15.712428039,
        compinmi: 0.0004346057596,
        cwi: 0.0004346057596,
        fid: 193024,
        freq: 14.882010136,
        mt: "Poster",
        opp: "Lamar",
        pid: "6281",
        reach: 0.0003654857298,
        status: "open",
        tgtinmi: 1,
        tgtinmp: 1,
        tgtmp: 903317,
        tgtwi: 49.132878039,
        totinmi: 113051.603570032,
        totinmp: 1,
        totmp: 326533070,
        totwi: 113051.603570032,
        trp: 0.005439162336
    }];
    // selectedInventory.push(top100['top100']['features'][0]['properties']);
    component.calculateMetrics(selectedInventory);
    expect(component.calculateMetrics).toHaveBeenCalled();

  });

  it(`should render the Summary(getAndAssignSummary)`, () => {
    fixture.detectChanges();
    const addInventory = fixture.nativeElement.querySelector('.test-add-inventory-btn') as HTMLButtonElement;
    expect(component.addInventoryToogle).toBeFalsy();
    addInventory.click();
    fixture.detectChanges();
    expect(component.addInventoryToogle).toBeTruthy();
    expect(component.summary).toEqual({});

    // checking the getAndAssignSummary function
    spyOn(component, 'getAndAssignSummary').and.callThrough();
    component.getAndAssignSummary(false);
    fixture.detectChanges();
    expect(component.getAndAssignSummary).toHaveBeenCalled();
    const summary_test = {
      inventory_count: 1776,
      total_impressions: 89307991,
      target_impressions: 74929618,
      target_inMarket_impressions: 74929618,
      target_population: 241019694,
      total_population: 326533070,
      trp: 31.08858745691104,
      comp_index: 113.66790108738371,
      reach: 3.3702795152050435,
      freq: 9.224335048963928,
      assignSummary: false
    };

    expect(component.summary).toEqual(summary_test);

    // checking the getReachFrequence function
    spyOn(component, 'getReachFrequence').and.callThrough();
    component.getReachFrequence();
    fixture.detectChanges();
    expect(component.getReachFrequence).toHaveBeenCalled();
    expect(component.calculateReachFrqsummary).toEqual(summary_test);

  });

 it(` should open Customize Columns`, () => {
    fixture.detectChanges();
    const addInventory = fixture.nativeElement.querySelector('.test-add-inventory-btn') as HTMLButtonElement;
    expect(component.addInventoryToogle).toBeFalsy();
    addInventory.click();
    fixture.detectChanges();
    expect(component.addInventoryToogle).toBeTruthy();
    expect(component.summary).toEqual({});
    const testCustomize = fixture.nativeElement.querySelector('.test-customize') as HTMLButtonElement;
    (<jasmine.Spy>workspaceDataService.setCustomizedColumnEmitter).and.returnValue(of('open'));
    spyOn(component, 'customizeColumn').and.callThrough();
    testCustomize.click();
    expect(component.customizeColumn).toHaveBeenCalled();
  });

  it(`should Save Inventory`, async() => {
    fixture.detectChanges();
    const addInventory = fixture.nativeElement.querySelector('.test-add-inventory-btn') as HTMLButtonElement;
    expect(component.addInventoryToogle).toBeFalsy();
    addInventory.click();
    fixture.detectChanges();
    expect(component.addInventoryToogle).toBeTruthy();
    expect(component.summary).toEqual({});
    component.getInventoryItems(true, true);
    component.features = [1];
    fixture.detectChanges();

    const testSaveInventory = fixture.nativeElement.querySelector('.test-save-inventory') as HTMLButtonElement;
    expect(testSaveInventory.innerHTML).toBeTruthy();
    testSaveInventory.click();
    fixture.detectChanges();

    const menuListbutton = fixture.nativeElement.parentNode.querySelector('.mat-menu-panel .mat-menu-content button:first-child') as HTMLButtonElement;
    fixture.detectChanges();
    menuListbutton.click();
    fixture.detectChanges();
    expect(dialogSpy).toHaveBeenCalled();
    expect(dialogRefSpyObj.afterClosed).toHaveBeenCalled();

  }); */

});
