import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import {FormBuilder, FormControl, FormGroup} from '@angular/forms';
import { ExploreDataService } from '@shared/services/explore-data.service';
import { takeWhile } from 'rxjs/operators';
import {Orientation} from '../../../classes/orientation';
import { FiltersService } from '../filters.service';
import { CustomValidators } from 'app/validators/custom-validators.validator';

@Component({
  selector: 'app-media-attributes',
  templateUrl: './media-attributes.component.html',
  styleUrls: ['./media-attributes.component.less']
})
export class MediaAttributesComponent implements OnInit, OnDestroy {
  public unSubscribe = true;
  public mediaAttributes: any = [
    {
      label: 'Orientation',
      key: 'orientationList',
      options: [
        'N',
        'E',
        'S',
        'W',
        'NE',
        'SE',
        'SW',
        'NW'
      ]
    },
    {
      label: 'Spot Size',
      key: 'panelSizeRange',
      options: [
        {
          title: 'Height in Feet',
          key: 'panelSizeHeightRange',
          range: [
            'min',
            'max'
          ]
        },
        {
          title: 'Width in Feet',
          key: 'panelSizeWidthRange',
          range: [
            'min',
            'max'
          ]
        }
      ]
    }
  ];
  public mediaAttributesFilter: any = [];
  public mediaAttributeForm: FormGroup;
  public OrientationList: any = [];
  public readList: any = [];
  public isPanelSizeRange: any;
  public isilluminationHrsRange: any;
  public selectedOrientation = '';

  public illuminationHrsRange: any = [];
  public panelSizeWidthRange: any = [];
  public panelSizeHeightRange: any = [];
  private generageMediaAttributeForm = false;
  @ViewChild('refOrientation', { static: false}) refOrientation;
  constructor(private exploreDataService: ExploreDataService, private fb: FormBuilder, private filterService: FiltersService) {
  }

  ngOnInit() {
    this.generateForm();
    this.loadFilterFromSession();
    this.filterService.onReset()
    .subscribe(type => {
      if (type !== 'All') {
        this.mediaAttributes = [];
      }
      this.clearMediaFilter();
    });
    this.filterService.checkSessionDataPushed()
      .pipe(takeWhile(() => this.unSubscribe))
      .subscribe(val => {
        if (val) {
          this.loadFilterFromSession();
        }
      });
  }
  loadFilterFromSession() {
    const filters = this.filterService.getExploreSession();
    if (filters) {
      if (
          typeof filters['data'] !== 'undefined' &&
          typeof filters['data']['mediaAttributes'] !== 'undefined'
        ) {
          this.mediaAttributesFilter = filters['data']['mediaAttributes'];
          if (this.mediaAttributesFilter['orientationList']) {
            const orientation = new Orientation();
            this.selectedOrientation = orientation.degreeToDirection(this.mediaAttributesFilter['orientationList']);
            if (this.generageMediaAttributeForm) {
             this.mediaAttributeForm.controls['orientationList'].patchValue(this.selectedOrientation);
            }
          } else {
            this.selectedOrientation = '';
          }
          this.generateForm();
      }
    }
  }
  generateForm() {
    /*if (this.illuminationHrsRange.length === 0) {
      this.illuminationHrsRange[0] = this.mediaAttributesFilter['illuminationHrsRange']
                                     && this.mediaAttributesFilter['illuminationHrsRange'][0] || null;
      this.illuminationHrsRange[1] = this.mediaAttributesFilter['illuminationHrsRange'] && this.mediaAttributesFilter['illuminationHrsRange'][1] || null;
    }

    if (this.illuminationHrsRange[0] === null && this.illuminationHrsRange[1] === null) {
      this.illuminationHrsRange = [];
    } */

    if (this.panelSizeWidthRange.length === 0 && this.mediaAttributesFilter['panelSizeWidthRange']) {
      this.panelSizeWidthRange = [
        this.mediaAttributesFilter['panelSizeWidthRange'][0],
        this.mediaAttributesFilter['panelSizeWidthRange'][1]
      ];
    }

    if (this.panelSizeHeightRange.length === 0 && this.mediaAttributesFilter['panelSizeHeightRange']) {
      this.panelSizeHeightRange = [
        this.mediaAttributesFilter['panelSizeHeightRange'][0],
        this.mediaAttributesFilter['panelSizeHeightRange'][1]
      ];
    }
    if (this.panelSizeWidthRange.length !== 0 && this.panelSizeHeightRange.length) {
      this.isPanelSizeRange = 2;
    } else if (this.panelSizeWidthRange.length !== 0 || this.panelSizeHeightRange.length !== 0) {
      this.isPanelSizeRange = 1;
    }
    /*let countIllumination = 0;
    if (this.illuminationHrsRange[0] && this.illuminationHrsRange[0] != null) {
      countIllumination += 1;
    }
    if (this.illuminationHrsRange[1] && this.illuminationHrsRange[1] != null) {
      countIllumination += 1;
    }
    this.isilluminationHrsRange = countIllumination;*/
    this.mediaAttributeForm = this.fb.group({
      'orientationList': new FormControl(this.selectedOrientation),
      /*'illuminationHrsRange' : this.fb.group({
        min : this.illuminationHrsRange[0],
        max : this.illuminationHrsRange[1]
      }, {validator: [CustomValidators.validRange('min', 'max'), CustomValidators.minmax('min', 'max') ] }),*/
      'panelSizeWidthRange': this.fb.group({
        min: this.panelSizeWidthRange[0],
        max: this.panelSizeWidthRange[1]
      }, {validator: CustomValidators.validRange('min', 'max')}),
      'panelSizeHeightRange': this.fb.group({
        min: this.panelSizeHeightRange[0],
        max: this.panelSizeHeightRange[1]
      }, {validator: CustomValidators.validRange('min', 'max')})
    });
    this.mediaAttributesFilter = [];
    this.generageMediaAttributeForm = true;
  }
  ngOnDestroy() {
    this.unSubscribe = false;
  }
  onSubmit(formData) {
    if (!formData.invalid) {
      const data = this.formatGPFilter(formData.value);
      if (Object.keys(data).length !== 0) {
        this.filterService.setFilter('mediaAttributes', data);
      } else {
       this.clearMediaFilter();
      }
    }
  }
  formatGPFilter(data) {
    const formatData = Object.assign({}, data);
    if (data.orientationList) {
      formatData['orientationList'] = {};
      const orientation = new Orientation();
      formatData['orientationList'] = orientation.directionToDegree(data['orientationList']);
    }
    /*const illuminationMin = formatData['illuminationHrsRange']['min'];
    const illuminationMax = formatData['illuminationHrsRange']['max'];*/

    const panelSizeWidthRangeMin = formatData['panelSizeWidthRange']['min'];
    const panelSizeWidthRangeMax = formatData['panelSizeWidthRange']['max'];

    const panelSizeHeightRangeMin = formatData['panelSizeHeightRange']['min'];
    const panelSizeHeightRangeMax = formatData['panelSizeHeightRange']['max'];
    let pannelCount = 0;
    /** To format panelSizeWidthRange */
    if ((!Number(panelSizeWidthRangeMin) && panelSizeWidthRangeMin !== '0') && !Number(panelSizeWidthRangeMax)) {
      delete formatData['panelSizeWidthRange'];
      this.panelSizeWidthRange = [];
    } else {
      const panelSizeWidthRange =  this.formatMinMax(panelSizeWidthRangeMin, panelSizeWidthRangeMax);
      if (panelSizeWidthRange[0] === '0') {
      this.mediaAttributeForm['controls'].panelSizeWidthRange['controls']['min'].patchValue(0);
      }
      formatData['panelSizeWidthRange'] = panelSizeWidthRange;
      pannelCount += 1;
    }

    /** To format panelSizeHeightRange */
    if ((!Number(panelSizeHeightRangeMin) && panelSizeHeightRangeMin !== '0') && !Number(panelSizeHeightRangeMax)) {
      delete formatData['panelSizeHeightRange'];
      this.panelSizeHeightRange = [];
    } else {
      const panelSizeHeightRange =  this.formatMinMax(panelSizeHeightRangeMin, panelSizeHeightRangeMax);
      if (panelSizeHeightRange[0] === '0') {
      this.mediaAttributeForm['controls'].panelSizeHeightRange['controls']['min'].patchValue(0);
      }
      formatData['panelSizeHeightRange'] = panelSizeHeightRange;
      pannelCount += 1;
    }

    this.isPanelSizeRange = pannelCount;

    /** To format illuminationHrsRange */
    /*if ((!Number(illuminationMin) && illuminationMin !== '0') && !Number(illuminationMax)) {
      delete formatData['illuminationHrsRange'];
      this.illuminationHrsRange = [];
    } else {
      const illuminationHrsRange =  this.formatMinMax(illuminationMin, illuminationMax);
      if (illuminationHrsRange[0] === '0') {
      this.mediaAttributeForm['controls'].illuminationHrsRange['controls']['min'].patchValue(0);
      }
      formatData['illuminationHrsRange'] = illuminationHrsRange;
      this.isilluminationHrsRange = 2;
    }*/
    return formatData;
  }

  formatMinMax(minValue, maxValue) {
    let arrayformat = [];
     if ((Number(minValue) || minValue === '0') && !Number(maxValue)) {
      arrayformat = [minValue];
    } else {
      if (!Number(minValue) && Number(maxValue)) {
        arrayformat = ['0', maxValue];
      } else {
        arrayformat = [minValue, maxValue];
      }
    }
    return arrayformat;
  }

  selectionOrientationList(selecetd, all) {
    this.mediaAttributes.map(attribute => {
      if (attribute['key'] === 'orientationList' ) {
        this.OrientationList = attribute['options'];
      }
    });
    if (selecetd === all) {
      this.mediaAttributeForm['controls'].orientationList.patchValue([]);
    } else {
      this.mediaAttributeForm['controls'].orientationList.patchValue(this.OrientationList);
    }
  }

  selectionreadListList(selecetd, all) {
    this.mediaAttributes.map(attribute => {
      if (attribute['key'] === 'readList' ) {
        this.readList = attribute['options'];
      }
    });
    if (selecetd === all) {
      this.mediaAttributeForm['controls'].readList.patchValue([]);
    } else {
      this.mediaAttributeForm['controls'].readList.patchValue(this.readList);
    }
  }

  public clearMediaFilter() {
    if (this.mediaAttributeForm) {
      this.mediaAttributeForm.reset();
    }
    this.mediaAttributesFilter = [];
    this.OrientationList  = [];
    this.selectedOrientation = '';
    this.illuminationHrsRange = [];
    this.panelSizeWidthRange = [];
    this.panelSizeHeightRange = [];
    this.isilluminationHrsRange = 0;
    this.isPanelSizeRange = 0;
    this.filterService.clearFilter('mediaAttributes', true);
  }
  public onSelectionOrientationChange() {
    if (this.mediaAttributeForm.value['orientationList']) {
      this.selectedOrientation = this.mediaAttributeForm.value['orientationList'];
      this.refOrientation.checked = true;
    } else {
      this.selectedOrientation = '';
    }
  }
  onChangeOrientationChecked(event) {
    event.preventDefault();
    if (this.refOrientation.checked) {
      this.selectedOrientation = '';
      this.mediaAttributeForm.controls['orientationList'].patchValue('');
    }
  }
}
