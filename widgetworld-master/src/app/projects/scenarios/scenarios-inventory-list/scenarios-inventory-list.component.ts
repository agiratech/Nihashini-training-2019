import { Component, OnInit, ViewChild, OnChanges,
  AfterViewInit, SimpleChanges, Input, Output, EventEmitter, OnDestroy} from '@angular/core';
import {CustomizedSpot} from '@interTypes/inventory';
import {
  ExploreDataService,
  FormatService,
  WorkSpaceDataService,
  CommonService
} from '../../../shared/services/index';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import {CustomizeColumnComponent} from '@shared/components/customize-column/customize-column.component';
import { MatDialog} from '@angular/material/dialog';
import {takeWhile} from 'rxjs/operators';

export class InventoryUnits {

  checked: boolean; // checkbox
  fid: any; // frame id
  sid: any; // spot id
  opp: any; // Plant Operator
  mt: any; // mediatype
  pid: any; // Plant Unit ID
  totwi: any; // Total Weekly Impressions
  tgtwi: any; // Target Weekly Impressions
  tgtinmi: any; // Target In Market Impressions
  compi: any; // Target Audience Index
  reach: any; // Reach
  cwi: any;
  tgtinmp: any;
  compinmi: any;
  totinmp: any;
  freq: any;
  trp: any;
  totinmi: any;
  status: any;
  tgtmp: any;
  totmp: any;
  classification_type: any;
  construction_type: any;
  digital: any;
  max_height: any;
  max_width: any;
  primary_artery: any;
  zip_code: any;
  longitude: any;
  latitude: any;
  illumination_type: any;
  orientation: any;
  tgt_aud_impr: any;
  media_name:any;

  constructor(data, checked, status = 'open', formatService) {
    if (
      data &&
      data['spot_references'] &&
      data['spot_references'].length) {
      const measures = data['spot_references'][0]['measures'];
      const index = data['representations'].findIndex(item => item['representation_type']['name'] === 'Own');
      this.opp = '';
      if (index >= 0) {
        // this.opp = data['representations'][index]['division']['plant']['name'];
        this.opp = data['representations'][index]['account']['parent_account_name'];
      }
      this.checked = checked;
      this.fid = data['fid'];
      this.sid = data['spot_id'];
      this.mt = data['media_type']['name'];
      this.pid = data['plant_frame_id'];
      this.totwi = measures['imp'];
      this.tgtwi = measures['imp_target'];
      this.tgtinmi = measures['imp_target_inmkt'];
      this.compi = measures['index_comp_target'];
      this.reach = measures['reach_pct'];
      this.cwi = measures['pct_comp_imp_target'];
      this.tgtinmp = measures['pct_imp_target_inmkt'];
      this.compinmi = measures['pct_comp_imp_target_inmkt'];
      this.totinmp = measures['pct_imp_inmkt'];
      this.freq = measures['freq_avg'];
      this.trp = measures['trp'];
      this.totinmi = measures['imp_inmkt'];
      this.status = status;
      this.tgtmp = measures['pop_target_inmkt'];
      this.totmp = measures['pop_inmkt'];
      this.media_name = data['media_name'];
      this.classification_type = data['classification_type'] &&
      data['classification_type']['name'] && data['classification_type']['name'] || '';
      this.construction_type = data['construction_type'] &&
      data['construction_type']['name'] && data['construction_type']['name'] || '';
      this.digital = data['digital'] && data['digital'] || '';

      this.max_height = data['max_height'] &&  formatService.sanitizeString(formatService.getFeetInches(data['max_height'])) || '';

      this.max_width = data['max_width'] &&  formatService.sanitizeString(formatService.getFeetInches(data['max_width'])) || '';
      const location = data['location'] && data['location'] && data['location'] || [];
      this.primary_artery = location['primary_artery'] && location['primary_artery'] || '';
      this.zip_code = location['zip_code'] && location['zip_code'] || '';
      this.longitude = location['longitude'] && location['longitude'] || '';
      this.latitude = location['latitude'] && location['latitude'] || '';
      this.illumination_type = data['illumination_type'] &&
      data['illumination_type']['name'] && data['illumination_type']['name'] || '';
      this.orientation = location['orientation'] && location['orientation'] || '';
      this.tgt_aud_impr = measures['imp_target'];
    }
  }
}

@Component({
  selector: 'app-scenarios-inventory-list',
  templateUrl: './scenarios-inventory-list.component.html',
  styleUrls: ['./scenarios-inventory-list.component.less']
})
export class ScenariosInventoryListComponent  implements OnInit, AfterViewInit, OnChanges, OnDestroy {
  dataSource = new MatTableDataSource([]);
  selectAllCheckbox = true;
  private subScribe = true;
  @ViewChild(MatSort, {static: false}) sort: MatSort;
  @Input() features: any;
  @Input() scenarioId: any;
  public units: CustomizedSpot[];
  @Input() nextFeatures: any;
  @Input() summary: any;
  @Input() inventoryTotalSummary: any;
  @Input() selectedFids: any;
  @Input() loadingInventories: any;
  @Output() loadMorePanels: EventEmitter<any> = new EventEmitter();
  @Output() panelSelectionChange: EventEmitter<any> = new EventEmitter();
  @Output() sortInventory: EventEmitter<any> = new EventEmitter();
  @Output() calculateMetrics: EventEmitter<any> = new EventEmitter();
  clearFlagtimeout = null;
  selectedCount = 0;
  defaultColumns = [
    {'name': 'CHECKBOX', 'displayname': '', 'value': 'checked'},
    {'name': 'PLANT OPERATOR', 'displayname': 'Plant Operator', 'value': 'opp' },
    {'name': 'SPOT ID', 'displayname': 'Geopath Spot ID', 'value': 'sid'},
    {'name': 'FRAME ID', 'displayname': 'Geopath Frame ID', 'value': 'fid'},
    {'name': 'PLANT UNIT ID', 'displayname': 'Operator Spot ID',   'value': 'pid'},
    {'name': 'MEDIA TYPE', 'displayname': 'Media Type', 'value': 'mt'},
    {'name': 'Total Imp', 'displayname': 'Total Impressions', 'value': 'totwi'},
    {'name': 'Target Imp', 'displayname': 'Target Impressions', 'value': 'tgtwi'},
    {'name': 'In-Mkt Target Comp Index', 'displayname': 'Target Audience Index', 'value': 'compi'},
     {'name': 'In-Mkt Target Imp', 'displayname': 'Target In-Market Impressions', 'value': 'tgtinmi'},
    {'name': 'Reach', 'displayname': 'Target In-Market Reach', 'value': 'reach'}
  ];
  sortKeys = {
    fid: 'frame_id',
    sid: 'spot_id',
    pid: 'plant_frame_id',
    totwi: 'imp',
    tgtwi: 'imp_target',
    tgtinmi: 'imp_target_inmkt',
    compi: 'index_comp_target',
    reach: 'reach_pct',
    cwi: 'pct_comp_imp_target',
    tgtinmp: 'pct_imp_target_inmkt',
    compinmi: 'pct_comp_imp_target_inmkt',
    totinmp: 'pct_imp_inmkt',
    freq: 'freq_avg',
    trp: 'trp',
    totinmi: 'imp_inmkt',
    tgtmp: 'pop_target_inmkt',
    totmp: 'pop_inmkt',
    classification_type : 'classification_type',
    construction_type: 'construction_type',
    digital: 'digital',
    max_height : 'max_height',
    max_width : 'max_width',
    primary_artery: 'primary_artery',
    zip_code: 'zip_code',
    longitude: 'longitude',
    latitude: 'latitude',
    illumination_type: 'illumination_type',
    orientation: 'Orientation',
    tgt_aud_impr: 'tgt_aud_impr',
    media_name: 'media_name'
  };
  columns = [];
  displayedColumns = [];
  tempInventoryItems = [];
  isOpendialog = true;
  currentSortables: any;
  sortables  = this.defaultColumns.map(x => Object.assign({}, x));
  public isCalculating = false;
  public isInventoryChangeState = false;
  @Output() calculateReachFrequence: EventEmitter<any> = new EventEmitter();
  @Input() calReachFrq: any;
  constructor(
    private exploreDataService: ExploreDataService,
    private formatService: FormatService,
    private workSpaceDataService: WorkSpaceDataService,
    private common: CommonService,
    public dialog: MatDialog
  ) { }

  public ngOnInit() {
    this.prepareColumns();
      this.workSpaceDataService.getCustomizedColumnEmitter().pipe(takeWhile(() => this.subScribe)).subscribe(
      customizerEmit => {
        const isOpen = localStorage.getItem('isDialogOpen');
        if (customizerEmit === 'open' && isOpen === 'true') {
          localStorage.setItem('isDialogOpen', 'false');
          this.openCustomizer();
        }
      });
  }
  ngOnDestroy() {
    this.subScribe = false;
  }
  public ngOnChanges(changes: SimpleChanges) {
    if (changes.summary) {
      this.summary = changes.summary.currentValue;
      this.calReachFrq = changes.summary.currentValue;
      if (!this.summary['assignSummary']) {
        this.isInventoryChangeState = true;
      } else {
        this.isInventoryChangeState = false;
      }
    }
    if (changes.scenarioId) {
      this.scenarioId = changes.scenarioId.currentValue;
    }
    if (changes.inventoryTotalSummary) {
      this.inventoryTotalSummary = changes.inventoryTotalSummary.currentValue;
    }
    if (typeof changes.features !== 'undefined') {
      this.features = changes.features.currentValue;
      this.units = this.features;
      /*this.units = this.features.map(f => {
        let unit;
        if (
          f &&
          f['spot_references'] &&
          f['spot_references'].length &&
          this.common.checkValid('pop_inmkt', f['spot_references'][0]['measures']) &&
           this.common.checkValid('reach_pct', f['spot_references'][0]['measures'])) {
          unit = new InventoryUnits(f, true, 'open', this.formatService);
        } else {
          unit = new InventoryUnits(f, false, 'disabled', this.formatService);
        }
        return unit;
      });*/
      this.dataSource.data = this.units;
      this.calculateMetrics.emit({ inventory: this.units.filter(place => place.checked),  customizedColumn: this.displayedColumns});
      this.selectAllCheckbox = true;
    }
    if (typeof changes.nextFeatures !== 'undefined') {
      this.nextFeatures = changes.nextFeatures.currentValue;
      this.nextFeatures.map(f => {
       if (
          f &&
          this.common.checkValid('totmp', f) &&
           this.common.checkValid('reach', f)) {
          f.status = 'open';
        } else {
          f.status = 'disabled';
        }
        
       /* if (
          f &&
          f['spot_references'] &&
          f['spot_references'].length &&
          this.common.checkValid('pop_inmkt', f['spot_references'][0]['measures']) &&
           this.common.checkValid('reach_pct', f['spot_references'][0]['measures'])) {
          unit = new InventoryUnits(f, (this.selectedCount > 0), 'open', this.formatService);
        } else {
          unit = new InventoryUnits(f, false, 'disabled', this.formatService);
        }*/


        // const unit = new InventoryUnits(f.properties, (this.selectedCount > 0));
        this.units.push(f);
      });
      this.dataSource.data = this.units;
      this.calculateMetrics.emit({ inventory: this.units.filter(place => place.checked),  customizedColumn: this.displayedColumns});
    }
    if (typeof changes.selectedFids !== 'undefined') {
      this.selectedFids = changes.selectedFids.currentValue;
      this.selectedCount = this.selectedFids.length;
    }
    if (changes['calReachFrq']) {
      this.calReachFrq = changes.calReachFrq.currentValue;
      this.isInventoryChangeState = false;
      this.isCalculating = false;
    }
  }

  public onTableScroll(e) {
    const tableViewHeight = e.target.offsetHeight; // viewport: ~500px
    const tableScrollHeight = e.target.scrollHeight; // length of all table
    const scrollLocation = e.target.scrollTop; // how far user scrolled
    // If the user has scrolled within 200px of the bottom, add more data
    const buffer = 500;
    const limit = tableScrollHeight - tableViewHeight - buffer;

    if (scrollLocation > limit) {
      setTimeout(() => {
        this.loadMorePanels.emit();
      }, 200);
    }
  }
  public loadMore() {
    setTimeout(() => {
      this.loadMorePanels.emit();
    }, 200);
  }
  private prepareColumns() {
    let customColumns = this.defaultColumns;
    const localCustomColum = JSON.parse(localStorage.getItem('scenarioCustomColumn'));
    if (localCustomColum != null && localCustomColum.length !== 0) {
      customColumns = localCustomColum;
    }
    this.columns = customColumns;

    // this.currentSortables = this.currentSortables.filter(column => column['value'] !== 'position');
    this.displayedColumns = this.columns.map(c => c['value']);
    this.currentSortables = this.columns.map(x => Object.assign({}, x));
    if (this.displayedColumns.indexOf('checked') === -1) {
      this.displayedColumns.splice(0, 0, 'checked');
      const obj = {
        'name': 'CHECKBOX',
        'displayname': '',
        'value': 'checked'
      };
      this.columns.push(obj);
    }

    this.currentSortables = this.currentSortables.filter(column => column['value'] !== 'position');
    this.displayedColumns = this.displayedColumns.filter(item => item !== 'position');
    localStorage.setItem('scenarioExportColumn', JSON.stringify(this.displayedColumns));
  }
  public ngAfterViewInit() {
    // this.dataSource.sort = this.sort;
  }
  public sortColumn(event) {
    this.sortInventory.emit({sortBy: this.sortKeys[event.active], order: event.direction });
    /*const sortBy = this.currentSortables.find(sortOption => sortOption.value === event.active);
    if (sortBy) {
      this.sortInventory.emit({sortBy: sortBy.name, order: event.direction });
    }*/
  }
  public onSelectDeselect(element) {
    if (this.clearFlagtimeout !== null) {
      clearTimeout(this.clearFlagtimeout);
    }
    this.selectedFids.map(place => {
      if (place.sid === element.sid) {
        place.selected = !element.checked;
      }
    });
    let selectedInventory = [];
    const selected = this.selectedFids.filter(item => item.selected );
    const disabled = this.dataSource.data.filter(item => (item.status === 'disabled') );
    if (selected.length === (this.selectedFids.length - disabled.length)) {
      this.selectAllCheckbox = true;
    } else {
      this.selectAllCheckbox = false;
    }
    this.selectedCount = selected.length;
    this.clearFlagtimeout = setTimeout(() => {
      selectedInventory = this.dataSource.data.filter(place => place.checked);
      this.panelSelectionChange.emit(selected);
      this.calculateMetrics.emit({ inventory: selectedInventory,  customizedColumn: this.displayedColumns});
    }, 1000);
  }
  public onSelectDeselectAll() {
    if (!this.selectAllCheckbox) {
      this.selectedFids.map((f) => {
        if (f.status !== 'disabled') {
          f.selected = true;
        }
      });
      this.units.map((f) => {
        if (f.status !== 'disabled') {
          f.checked = true;
        }
      });
    } else {
      this.selectedFids.map((f) => {
        f.selected = false;
      });
      this.units.map((f) => {
        f.checked = false;
      });
    }
    let selectedInventory = [];
    const selected = this.selectedFids.filter(item => item.selected);
    this.selectedCount = selected.length;
    setTimeout(() => {
      selectedInventory = this.dataSource.data.filter(place => place.checked);
      this.panelSelectionChange.emit(selected);
      this.calculateMetrics.emit({ inventory: selectedInventory,  customizedColumn: this.displayedColumns});
    }, 1000);
  }
  private openCustomizer() {
    if (this.currentSortables && this.currentSortables.length > 0 ) {
      this.currentSortables = this.currentSortables.map(x => Object.assign({}, x));
      this.removeDuplicates(this.currentSortables, this.sortables);
    } else {
      this.sortables = [];
      this.currentSortables = this.columns.map(x => Object.assign({}, x));
    }

    const isFrequency = this.isExist('freq', this.currentSortables);
    const isFrequencySortables = this.isExist('freq', this.sortables);
    if (isFrequency === undefined && isFrequencySortables === undefined) {
      const defaultAvailableColumn = {'name': 'Frequency', 'displayname': 'Target In-Market Frequency', 'value': 'freq'};
      this.sortables.push(defaultAvailableColumn);
    }
    const isTotinmi = this.isExist('totinmi', this.currentSortables);
    const isTotinmiSortables = this.isExist('totinmi', this.sortables);
    if (isTotinmi === undefined && isTotinmiSortables === undefined) {
      const defaultAvailableColumn_1 = {'name': 'Tot In-Market Imp', 'displayname': 'Total In-Market Impressions', 'value': 'totinmi'};
      this.sortables.push(defaultAvailableColumn_1);
    }

    const isCwi = this.isExist('cwi', this.currentSortables);
    const isCwiSortables = this.isExist('cwi', this.sortables);
    if (isCwi === undefined && isCwiSortables === undefined) {
      const defaultAvailableColumn_2 = {'name': 'Target Imp Comp Percentage', 'displayname': 'Target % Impression Comp', 'value': 'cwi'};
      this.sortables.push(defaultAvailableColumn_2);
    }

    const isTgtinmp = this.isExist('tgtinmp', this.currentSortables);
    const isTgtinmpSortables = this.isExist('tgtinmp', this.sortables);
    if (isTgtinmp === undefined && isTgtinmpSortables === undefined) {
      const defaultAvailableColumn_3 = {
        'name': 'Target % In-Market Imp', 'displayname': 'Target % In-Market Impressions', 'value': 'tgtinmp'};
      this.sortables.push(defaultAvailableColumn_3);
    }
    const isCompinmi = this.isExist('compinmi', this.currentSortables);
    const isCompinmiSortables = this.isExist('compinmi', this.sortables);
    if (isCompinmi === undefined && isCompinmiSortables === undefined) {
      const defaultAvailableColumn_4 = {
        'name': 'Target % In-Market Impr.. Comp.', 'displayname': 'Target % In-Market Impr. Comp.', 'value': 'compinmi'};
      this.sortables.push(defaultAvailableColumn_4);
    }

    const isTrp = this.isExist('trp', this.currentSortables);
    const isTrpSortables = this.isExist('trp', this.sortables);
    if (isTrp === undefined && isTrpSortables === undefined) {
      const defaultAvailableColumn_5 = {
        'name': 'Target In-Market Rating Points', 'displayname': 'Target In-Market Rating Points', 'value': 'trp'};
      this.sortables.push(defaultAvailableColumn_5);
    }

    const isTotinmp = this.isExist('totinmp', this.currentSortables);
    const isTotinmpSortables = this.isExist('totinmp', this.sortables);
    if (isTotinmp === undefined && isTotinmpSortables === undefined) {
      const defaultAvailableColumn_6 = {'name': 'Total % In-Mkt Impr.', 'displayname': 'Total % In-Mkt Impr.', 'value': 'totinmp'};
      this.sortables.push(defaultAvailableColumn_6);
    }

    const isClassification = this.isExist('classification_type', this.currentSortables);
    const isSortableClassification = this.isExist('classification_type', this.sortables);
    if (isClassification === undefined) {
      const defaultAvailableColumn_7 = {'name': 'classification_type', 'displayname': 'Classification', 'value': 'classification_type'};
      if (isSortableClassification === undefined) {
        this.sortables.push(defaultAvailableColumn_7);
      }
    }

    const isConstruction = this.isExist('construction_type', this.currentSortables);
    const isSortableConstruction = this.isExist('construction_type', this.sortables);
    if (isConstruction === undefined) {
      const defaultAvailableColumn_8 = {'name': 'construction_type', 'displayname': 'Construction', 'value': 'construction_type'};
      if (isSortableConstruction === undefined) {
        this.sortables.push(defaultAvailableColumn_8);
      }
    }

    const isDigital = this.isExist('digital', this.currentSortables);
    const isSortableDigital = this.isExist('digital', this.sortables);
    if (isDigital === undefined) {
      const defaultAvailableColumn_9 = {'name': 'digital', 'displayname': 'Digital', 'value': 'digital'};
      if (isSortableDigital === undefined) {
        this.sortables.push(defaultAvailableColumn_9);
      }
    }

    const isheight = this.isExist('max_height', this.currentSortables);
    const isSortableheight = this.isExist('max_height', this.sortables);
    if (isheight === undefined) {
      const defaultAvailableColumn_10 = {'name': 'height', 'displayname': 'Height (ft & in)', 'value': 'max_height'};
      if (isSortableheight === undefined) {
        this.sortables.push(defaultAvailableColumn_10);
      }
    }

    const isWidth = this.isExist('max_width', this.currentSortables);
    const isSortableWidth = this.isExist('max_width', this.sortables);
    if (isWidth === undefined) {
      const defaultAvailableColumn_11 = {'name': 'width', 'displayname': 'Width (ft & in)', 'value': 'max_width'};
      if (isSortableWidth === undefined) {
        this.sortables.push(defaultAvailableColumn_11);
      }
    }

    const isPrimaryArtery = this.isExist('primary_artery', this.currentSortables);
    const isSortablePrimaryArtery = this.isExist('primary_artery', this.sortables);
    if (isPrimaryArtery === undefined) {
      const defaultAvailableColumn_12 = {'name': 'primary_artery', 'displayname': 'Primary Artery', 'value': 'primary_artery'};
      if (isSortablePrimaryArtery === undefined) {
        this.sortables.push(defaultAvailableColumn_12);
      }
    }

    const isZipCode = this.isExist('zip_code', this.currentSortables);
    const isSortableZipCode = this.isExist('zip_code', this.sortables);
    if (isZipCode === undefined) {
      const defaultAvailableColumn_13 = {'name': 'zip_code', 'displayname': 'ZIP Code', 'value': 'zip_code'};
      if (isSortableZipCode === undefined) {
        this.sortables.push(defaultAvailableColumn_13);
      }
    }

    const isLongitude = this.isExist('longitude', this.currentSortables);
    const isSortableLongitude = this.isExist('longitude', this.sortables);
    if (isLongitude === undefined) {
      const defaultAvailableColumn_14 = {'name': 'longitude', 'displayname': 'Longitude', 'value': 'longitude'};
      if (isSortableLongitude === undefined) {
        this.sortables.push(defaultAvailableColumn_14);
      }
    }

    const isLatitude = this.isExist('latitude', this.currentSortables);
    const isSortableLatitude = this.isExist('latitude', this.sortables);
    if (isLatitude === undefined) {
      const defaultAvailableColumn_15 = {'name': 'latitude', 'displayname': 'Latitude', 'value': 'latitude'};
      if (isSortableLatitude === undefined) {
        this.sortables.push(defaultAvailableColumn_15);
      }
    }

    const isIlluminationType = this.isExist('illumination_type', this.currentSortables);
    const isSortableIlluminationType = this.isExist('illumination_type', this.sortables);
    if (isIlluminationType === undefined) {
      const defaultAvailableColumn_16 = {'name': 'illumination_type', 'displayname': 'Illumination Type', 'value': 'illumination_type'};
      if (isSortableIlluminationType === undefined) {
        this.sortables.push(defaultAvailableColumn_16);
      }
    }

    const isTgtAudImpr = this.isExist('tgt_aud_impr', this.currentSortables);
    const isSortableTgtAudImp = this.isExist('tgt_aud_impr', this.sortables);
    if (isTgtAudImpr === undefined) {
      const defaultAvailableColumn_17 = {'name': 'tgt_aud_impr', 'displayname': 'Target Audience Impressions', 'value': 'tgt_aud_impr'};
      if (isSortableTgtAudImp === undefined) {
        this.sortables.push(defaultAvailableColumn_17);
      }
    }

    const isorientation = this.isExist('orientation', this.currentSortables);
    const isSortableorientation = this.isExist('orientation', this.sortables);
    if (isorientation === undefined) {
      const defaultAvailableColumn_17 = {'name': 'orientation', 'displayname': 'Orientation', 'value': 'orientation'};
      if (isSortableorientation === undefined) {
        this.sortables.push(defaultAvailableColumn_17);
      }
    }

    const isMediaName= this.isExist('media_name', this.currentSortables);
    const isSortableMediaName = this.isExist('media_name', this.sortables);
    if (isMediaName === undefined) {
      const defaultAvailableColumn_18 = {'name': 'media_name', 'displayname': 'Media Name', 'value': 'media_name'};
      if (isSortableMediaName === undefined) {
        this.sortables.push(defaultAvailableColumn_18);
      }
    }
    

    this.sortables = this.sortables.filter(column => column['value'] !== 'checked');
    this.sortables = this.sortables.filter(column => column['value'] !== 'position');
    this.currentSortables = this.currentSortables.filter(column => column['value'] !== 'checked');
    this.currentSortables = this.currentSortables.filter(column => column['value'] !== 'position');

    const ref = this.dialog.open(CustomizeColumnComponent, {
       data: {'sortables': this.sortables, 'currentSortables' : this.currentSortables, 'origin': 'scenario'},
      width: '700px',
      closeOnNavigation: true,
      panelClass: 'audience-browser-container',
    });
    ref.afterClosed().subscribe(res => {
      if (res) {
        this.currentSortables = res.currentSortables;
        localStorage.setItem('scenarioCustomColumn', JSON.stringify(this.currentSortables));
        this.exploreDataService.saveCustomizedColumns(this.currentSortables);
        this.prepareColumns();
      }
    });
  }
  private removeDuplicates(a, b) {
    for (let i = 0, len = a.length; i < len; i++) {
      for (let j = 0, len2 = b.length; j < len2; j++) {
        if (a[i].name === b[j].name) {
            b.splice(j, 1);
            len2 = b.length;
          }
      }
    }
  }
  isExist(nameKey, myArray) {
    for (let i = 0; i < myArray.length; i++) {
      if (myArray[i].value === nameKey) {
        return i;
      }
    }
  }
  onCalculate() {
    this.isCalculating = true;
    this.calculateReachFrequence.emit();
  }
}
