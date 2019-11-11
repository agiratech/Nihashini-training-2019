import { saveAs } from 'file-saver';
import { Component, OnInit, Inject, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { FormatService, ExploreService } from '@shared/services';
import { Orientation } from '../../../classes/orientation';

import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import swal from 'sweetalert2';
import { HttpResponse } from '@angular/common/http';

@Component({
  selector: 'app-inventory-detail-view-layout',
  templateUrl: './inventory-detail-view-layout.component.html',
  styleUrls: ['./inventory-detail-view-layout.component.less']
})
export class InventoryDetailViewLayoutComponent implements OnInit, OnDestroy {
  // public inventoryDetails: any;
  public feature: any;
  public summary: any = {};
  // public properties: any;
  public response: any;
  public orientation = '';
  public orientationValue = '';
  public isPortrait = true;
  public propertieDetail: any = {
    trp: '-',
    reach: '-',
    frq: '-',
    comp: '-',
    total_market_population: '',
    total_market_impressions: '',
    total_market_percentage: '',
    total_in_market_impressions: '',
    target_market_population: '',
    target_market_impressions: '',
    target_market_percentage: '',
    target_in_market_impressions: '',
    composition_market_population: '',
    composition_market_impressions: '',
    composition_market_percentage: '',
    composition_in_market_impressions: ''
  };
  public viewDetails = {
    staticMapURL: '',
    staticImage: '',
    topZipDetails: [],
    topMarketDetails: [],
    match: '',
    miniLogo: '',
    height: '',
    width: ''
  };
  public contentHeight: number;
  public selectedMarket: any;
  public defaultAudience: any;
  public notes = '';
  public notesAccess: string;
  public isVisibleInfo = false;
  public noteText = '';
  public isNoteEdit = false;
  public dummyNotes = '';
  private unSubscribe: Subject<void> = new Subject<void>();
  public isSavingNote = false;
  public isDownloadingPDF = false;
  @ViewChild('refNode', {static: false}) focusNode: ElementRef;

  constructor(
    private format: FormatService,
    private exploreService: ExploreService,
    public dialogRef: MatDialogRef<InventoryDetailViewLayoutComponent>,
    @Inject(MAT_DIALOG_DATA) public inventoryDetails
  ) { }

  ngOnInit() {
    this.contentHeight = window.innerHeight - 320;
    this.feature = this.inventoryDetails.feature;
    this.response = this.inventoryDetails.inventoryDetail;
    this.isPortrait = this.inventoryDetails.portraitView;
    this.isPortrait = false;
    this.notesAccess = this.inventoryDetails.addNotesAccess;
    if (Object.keys(this.inventoryDetails.selectedMarket).length > 0) {
      this.selectedMarket = this.inventoryDetails.selectedMarket;
    }
    this.defaultAudience = this.inventoryDetails.defaultAudience;
    let startTime = new Date(`2019/01/01 00:00:00`).getHours();
    let endTime = new Date(`2019/01/01 00:00:00`).getHours();

    if (this.feature['illumination_start_time']) {
      startTime = new Date(`2019/01/01 ${this.feature['illumination_start_time']}`).getHours();
    }
    if (this.feature['illumination_end_time']) {
      endTime = new Date(`2019/01/01 ${this.feature['illumination_end_time']}`).getHours();
    }

    const duration = endTime - startTime;

    this.feature['illumination_duration'] = duration + ' hrs';
    if (duration === 1) {
      this.feature['illumination_duration'] = 1 + ' hr';
    }

    const orientation = new Orientation();
    this.orientation = orientation.getOrientation(this.feature.location.orientation);
    this.formatOrientation(this.orientation);

    this.viewDetails.staticImage = this.getImage(this.feature.id);
    this.viewDetails.staticMapURL = this.inventoryDetails.staticMapURL;

    this.viewDetails.topZipDetails =
      (this.response['zipcodes'] &&
        this.response['zipcodes']['topFour']) ||
      [];
    this.viewDetails.topMarketDetails =
      (this.response['dmaresults'] &&
        this.response['dmaresults']['topFour']) ||
      [];

    this.viewDetails.miniLogo = this.inventoryDetails.miniLogo;
    //this.properties = this.response.unitDetails.properties;
    // this.viewDetails.match = JSON.parse(this.response.match);
    /*if (
      this.feature['layouts'] &&
      this.feature['layouts'][0]['faces'] &&
      this.feature['layouts'][0]['faces'][0]['spots'] &&
      this.feature['layouts'][0]['faces'][0]['spots'][0]['measures']) {
      this.summary = this.feature['layouts'][0]['faces'][0]['spots'][0]['measures'];
    }*/

    if (this.feature['spot_references'] && this.feature['spot_references'][0]['measures']) {
      this.summary = this.feature['spot_references'][0]['measures'];
    }

    if (this.summary['trp']) {
      this.propertieDetail.trp = this.summary.trp.toFixed(3);
    }

    if (this.summary['reach_pct'] !== 'undefined') {
      this.propertieDetail.reach =
        this.summary.reach_pct > 0
          ? this.format.convertToDecimalFormat(this.summary.reach_pct, 2) + '%'
          : 'n/a';
    }

    if (this.summary['freq_avg']) {
      this.propertieDetail.frq =
        this.summary['freq_avg'] > 0
          ? this.format.convertToDecimalFormat(this.summary['freq_avg'], 1) 
          : 'n/a';
    }

    if (this.summary['index_comp_target']) {
      this.propertieDetail.comp = this.format.checkAndPopulate(
        this.summary['index_comp_target']
      );
    }

    // total
    this.propertieDetail.total_market_population = this.format.checkAndPopulate(
      this.summary['pop_inmkt']
    );
    this.propertieDetail.total_market_impressions = this.format.checkAndPopulate(
      this.summary['imp']
    );
    this.propertieDetail.total_market_percentage = this.format.checkAndPopulate(
      this.summary['pct_imp_inmkt'],
      true
    );
    this.propertieDetail.total_in_market_impressions = this.format.checkAndPopulate(
      this.summary['imp_inmkt']
    );

    // Target
    this.propertieDetail.target_market_population = this.format.checkAndPopulate(
      this.summary['pop_target_inmkt']
    );
    this.propertieDetail.target_market_impressions = this.format.checkAndPopulate(
      this.summary['imp_target']
    );
    this.propertieDetail.target_market_percentage = this.format.checkAndPopulate(
      this.summary['pct_imp_target_inmkt'],
      true
    );
    this.propertieDetail.target_in_market_impressions = this.format.checkAndPopulate(
      this.summary['imp_target_inmkt']
    );

    // composition
    this.propertieDetail.composition_market_population = this.format.checkAndPopulate(
      this.summary['pct_comp_pop_target_inmkt'], true
    );
    this.propertieDetail.composition_market_impressions = this.format.checkAndPopulate(
      this.summary['pct_comp_imp_target'], true
    );
    this.propertieDetail.composition_market_percentage = this.format.checkAndPopulate(
      this.summary['pct_comp_imp_target_inmkt'],
      true,
      false,
      ''
    );
    this.propertieDetail.composition_in_market_impressions = this.format.checkAndPopulate(
      this.summary['pct_comp_imp_target_inmkt'],
      true
    );
    // feet engine height and width
    this.viewDetails.height = this.format.getFeetInches(this.feature.max_height);
    this.viewDetails.width = this.format.getFeetInches(this.feature.max_width);

    setTimeout(() => {
      if (this.inventoryDetails.mapStyle !== 'light') {
        $('.mapboxgl-popup-content').addClass('hide-shadow');
      }
    }, 2000);


    if (this.notesAccess && this.notesAccess.toLowerCase() === 'active') {
      this.exploreService.getAllNotesOfInventory(this.feature.id, true).subscribe(response => {
        if (response && response.length > 0) {
          this.noteText = response[response.length - 1].notes || '';
          this.dummyNotes = response[response.length - 1].notes || '';
        }
      });
    }

  }
  ngOnDestroy() {
    this.unSubscribe.next();
    this.unSubscribe.complete();
  }
  getImage(id): string {
    return this.exploreService.getBigImageURL(id);
  }
  onResize() {
    this.contentHeight = window.innerHeight - 320;
  }
  formatOrientation(value) {
    switch (value) {
      case 'E':
        this.orientationValue = 'East';
        break;
      case 'N':
        this.orientationValue = 'North';
        break;
      case 'W':
        this.orientationValue = 'West';
        break;
      case 'S':
        this.orientationValue = 'South';
        break;
      case 'NE':
        this.orientationValue = 'North East';
        break;
      case 'SE':
        this.orientationValue = 'South East';
        break;
      case 'SW':
        this.orientationValue = 'South West';
        break;
      case 'NW':
        this.orientationValue = 'North West';
        break;
      default:
        this.orientationValue = '';
        break;
    }
  }

  public openInventoryPopup() {
    if (!this.isVisibleInfo) {
      this.dialogRef.close('openInventory');
    } else {
      this.isVisibleInfo = false;
    }
  }
  public showInfoPage() {
    this.isVisibleInfo = true;
  }
  public downloadPDF() {
    this.isDownloadingPDF = true;
    const pdfReqHeaders = {};
    const tragetAudience = this.inventoryDetails.targetAudience;
    const selectedMarket = this.inventoryDetails.selectedMarket;
    pdfReqHeaders['panel_id'] = [this.feature.id];
    pdfReqHeaders['type'] = 'inventory_details';
    pdfReqHeaders['aud'] = tragetAudience.id;
    pdfReqHeaders['aud_name'] = tragetAudience.name;
    pdfReqHeaders['orientation'] = 'landscape';
    pdfReqHeaders['report_format'] = 'pdf';
    if (Object.keys(selectedMarket).length > 0) {
      pdfReqHeaders['target_geography'] = selectedMarket['id'];
      pdfReqHeaders['market_type'] = selectedMarket['type'];
      pdfReqHeaders['market_name'] = selectedMarket['name'];
    }
    pdfReqHeaders['target_segment'] = tragetAudience.id;
    this.exploreService.downloadPdf(pdfReqHeaders, true).subscribe((res: HttpResponse<any>) => {
      this.isDownloadingPDF = false;
      const contentDispose = res.headers.get('content-disposition');
      const matches = contentDispose.split(';')[1].trim().split('=')[1];
      const filename = matches && matches.length > 1 ? matches : this.feature.id + '.pdf';
      saveAs(res.body, filename);
    });
  }
  public onSaveNote() {
    this.addNotesToInventory(this.feature.id, this.noteText);
    this.isSavingNote = true;
  }
  public nodeCancel() {
    this.isNoteEdit = false;
    this.noteText = this.dummyNotes;
  }
  private addNotesToInventory(featureId: number, note: string) {
    const userData = JSON.parse(localStorage.getItem('user_data'));
    this.exploreService.getAllNotesOfUser(userData['id'], true).pipe(takeUntil(this.unSubscribe)).subscribe(response => {
      if (!response[0]) {
        if (note && note.trim() !== '') {
          this.addNewNotesToInventory(featureId, note);
        }
      } else {
        const noteData = response.filter(noteObj => noteObj['inventoryId'] === featureId.toString() && noteObj['active'] === true)[0];
        if (noteData && noteData['_id']) {
          this.updateNotes(noteData['_id'], note);
        } else {
          if (note && note.trim() !== '') {
            this.addNewNotesToInventory(featureId, note);
          }
        }
      }
    }, error => {
      if (error['error']) {
        swal('Error', `${error['error']['message']}`, 'error');
      } else {
        swal('Error', 'An error has occurred. Please try again later.', 'error');
      }
    });
  }

  // This function is to add new notes to the Inventory
  private addNewNotesToInventory(featureId: number, note: string) {
    this.exploreService.addNotesToInventory(featureId, note, true).pipe(takeUntil(this.unSubscribe)).subscribe(response => {
      this.isNoteEdit = false;
      this.isSavingNote = false;
      this.dummyNotes = note;
      // swal('Success', `${response['message']}`, 'success');
      swal('Success', 'The Notes/Recommendations updated successfully', 'success');
    }, error => {
      this.isSavingNote = false;
      if (error['error']  && error['error']['message']) {
        swal('Error', `${error['error']['message']}`, 'error');
      } else {
        swal('Error', 'An error has occurred. Please try again later.', 'error');
      }
    });
  }

  // This function is to update the existing notes of an inventory
  private updateNotes(noteId: number, note: string) {
    this.exploreService.updateInventoryNote(noteId, note, true).pipe(takeUntil(this.unSubscribe)).subscribe(response => {
      this.isNoteEdit = false;
      this.dummyNotes = note;
      this.isSavingNote = false;
      // swal('Success', `${response['message']}`, 'success');
      swal('Success', 'The Notes/Recommendations updated successfully', 'success');
    }, error => {
      this.isSavingNote = false;
      if (error['error'] && error['error']['message']) {
        swal('Error', `${error['error']['message']}`, 'error');
      } else {
        swal('Error', 'An error has occurred. Please try again later.', 'error');
      }
    });
  }
  public closeDetailPopup() {
    this.dialogRef.close();
  }
  public editNote() {
    this.isNoteEdit = true;
    setTimeout(() => {
      this.focusNode.nativeElement.focus();
    }, 50);
  }
}
