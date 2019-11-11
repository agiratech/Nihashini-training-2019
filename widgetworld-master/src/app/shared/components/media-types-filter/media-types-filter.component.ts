import { Component, OnInit, ChangeDetectionStrategy,
  ChangeDetectorRef, AfterViewChecked, Input, Output, EventEmitter } from '@angular/core';
import { InventoryService } from '@shared/services/inventory.service';
import {debounceTime, distinctUntilChanged, takeWhile, map, catchError} from 'rxjs/operators';
import { NestedTreeControl} from '@angular/cdk/tree';
import { MatTreeNestedDataSource} from '@angular/material/tree';
import { MediaTypeNode } from '@interTypes/mediaTypeList';
import { FiltersService } from 'app/explore/filters/filters.service';
import {AuthenticationService, CommonService} from '@shared/services';
import {forkJoin, Observable, of} from 'rxjs';

@Component({
  selector: 'app-media-types-filter',
  templateUrl: './media-types-filter.component.html',
  styleUrls: ['./media-types-filter.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MediaTypesFilterComponent implements OnInit, AfterViewChecked {
  private unsubscribe = true;
  treeControl: NestedTreeControl<MediaTypeNode>;
  dataSource: MatTreeNestedDataSource<MediaTypeNode>;
  selectedPlaces = [];
  @Input() moduleName: String;
  @Output() dialogPopupState: any = new EventEmitter();
  @Input() mediaTypesDataForEdit: any;

  public digitalCount = 0;
  public nonDigitalCount = 0;
  public isDigitalFilter = false;
  public isNonDigitalFilter = false;

  public classificationTypes = [];
  public classTotalCount = 0;
  public isEnvironmentFilter = false;
  public isEnvironmentIndeter = false;
  public environmentOptions = false;
  public loadedMediaTypes = false;
  public editMediaTypes = false;
  public customInventoryAllowed: boolean;
  constructor(
    private inventoryService: InventoryService,
    private filterService: FiltersService,
    private cdRef: ChangeDetectorRef,
    private commonService: CommonService,
    private authService: AuthenticationService
  ) {
    this.treeControl = new NestedTreeControl<MediaTypeNode>(this.getChildren);
    this.dataSource = new MatTreeNestedDataSource();
  }
  getChildren = (node: MediaTypeNode): MediaTypeNode[] => node.children;

  hasChild = (_: number, node: MediaTypeNode) => !!node && !!node.children && node.children.length > 0;

  hasNoContent = (_: number, _nodeData: MediaTypeNode) => _nodeData.name === '';

  ngOnInit() {
    const access = this.authService.getModuleAccess('explore');
    this.customInventoryAllowed = access['features']['customInventories']['status'] === 'active';
    // this.loadMediaTypes();
    // this.loadClassificationTypes();
    if (this.moduleName === 'project') {
      this.callingMediaTypeDataForScenarioMarketPlan();
      this.editMediaTypes = false;
      if (this.mediaTypesDataForEdit.editData) {
        this.editMediaTypes = true;
      }
    } else {
      this.filterService.getFilters()
      .pipe(
        debounceTime(200),
        distinctUntilChanged(),
        takeWhile(() => this.unsubscribe))
      .subscribe(response => {
        let selected = [];
        let selectedParent = [];
        let selectedEnvironments = [];
        let mediaFilter = {};
        let classFilter = {};
        if (response && response['data'] ) {
          if (response['data']['mediaTypeList']) {
            selected = response['data']['mediaTypeList']['ids']['medias'];
            if (response['data']['mediaTypeList']['mediaParent']) {
              selectedParent = response['data']['mediaTypeList']['mediaParent'];
            }
            selectedEnvironments = response['data']['mediaTypeList']['ids']['environments'];
            this.isDigitalFilter = response['data']['mediaTypeList']['isDigital'];
            this.isNonDigitalFilter = response['data']['mediaTypeList']['isNonDigital'];
          }
        }
        mediaFilter = classFilter = this.filterService.normalizeFilterDataNew(response);
        mediaFilter['summary_level_list'] = [
          'Construction Type',
          'Media Type',
          'Digital',
          'Frame Media'
        ];
        if (mediaFilter['frame_media_name_list']) {
          delete mediaFilter['frame_media_name_list'];
        }
        if (mediaFilter['construction_type_list']) {
          delete mediaFilter['construction_type_list'];
        }
        this.loadMediaTypes(mediaFilter, selected, selectedParent);
        classFilter['summary_level_list'] = [
          'Classification Type'
        ];
        this.loadClassificationTypes(classFilter, selectedEnvironments);
      });
    }
    this.filterService.onReset()
    .subscribe(type => {
      this.clearSelection();
    });

  }

  callingMediaTypeDataForScenarioMarketPlan() {
    const response = {};
    let classFilter = {};
    let selected = [];
    let selectedParent = [];
    let selectedEnvironments = [];
    let isMediaParent = false;
    this.isDigitalFilter = false;
    this.isNonDigitalFilter = false;
    const mediaTypes = this.commonService.getMediaTypes();
    const classificationTypes = this.commonService.getClassificationTypes();
    if (this.mediaTypesDataForEdit.editData) {
      selected = this.mediaTypesDataForEdit['editData']['ids']['medias'];
      selectedEnvironments = this.mediaTypesDataForEdit['editData']['ids']['environments'];
      this.isDigitalFilter = this.mediaTypesDataForEdit['editData']['isDigital'];
      this.isNonDigitalFilter = this.mediaTypesDataForEdit['editData']['isNonDigital'];
      if (this.mediaTypesDataForEdit.editData.mediaParent && this.mediaTypesDataForEdit.editData.mediaParent.length >0) {
        selectedParent = this.mediaTypesDataForEdit.editData.mediaParent;
        isMediaParent = true;
      } else {
        isMediaParent = false;
      }
    }
    if (!mediaTypes) {
      const mediaFilter = classFilter = this.filterService.normalizeFilterDataNew(response);
      // Add measures_rang_list as default condition to get Place Based.
      mediaFilter['measures_range_list'] = [
        {'type' : 'imp' , 'min' : 0}
      ];
      mediaFilter['summary_level_list'] = [
        'Construction Type',
        'Media Type',
        'Digital',
        'Frame Media'
      ];
      if (mediaFilter['frame_media_name_list']) {
        delete mediaFilter['frame_media_name_list'];
      }
      if (mediaFilter['construction_type_list']) {
        delete mediaFilter['construction_type_list'];
      }
      this.loadMediaTypes(mediaFilter, selected, selectedParent, isMediaParent);
    } else {
      // This block will load the media types from service varible.
      const mediaTypeData = mediaTypes['mediaTypes'];
      mediaTypeData.map(parent => {
        parent.selected = false;
        parent.children.map(levelOne => {
          levelOne.selected = false;
          levelOne.children.map(levelTwo => {
            if (selectedParent.includes(parent['name']) && isMediaParent) {
            levelTwo.selected = (selected.indexOf(levelTwo['id']) !== -1 ? true : false);
            } else {
              if (isMediaParent) {
                levelTwo.selected = false;
              } else {
                levelTwo.selected = (selected.indexOf(levelTwo['id']) !== -1 ? true : false);
              }
            }
          });
        });
      });
      this.dataSource.data = mediaTypeData;
      this.digitalCount = mediaTypes['digitalCount'];
      this.nonDigitalCount = mediaTypes['nonDigitalCount'];
      this.loadedMediaTypes = true;
    }
    if (classificationTypes.length > 0) {
      classificationTypes.map(classification => {
        return classification.selected = (selectedEnvironments.indexOf(classification.name) !== -1 ? true : false);
      });
      this.classificationTypes = classificationTypes;
      this.checkEnvironmentAllCheckbox();
    } else {
      // Add measures_rang_list as default condition to get Place Based.
      classFilter['measures_range_list'] = [
        {'type' : 'imp' , 'min' : 0}
      ];
      classFilter['summary_level_list'] = [
        'Classification Type'
      ];
      this.loadClassificationTypes(classFilter, selectedEnvironments);
    }
  }
  loadMediaTypes(filters = {}, selected = [], selectedParent = [], isMediaParent = false) {
    let query = this.inventoryService.prepareInventoryQuery(filters);
    query = this.inventoryService.addMediaQuery(query);
    this.loadedMediaTypes = false;
    let customInventoy: Observable<any> = of([]);
    let zeroMeasure = true;
    if ((filters['measures_range_list']
    && filters['measures_range_list'].length > 1)) {
      filters['measures_range_list'].forEach((val) => {
        if (val['min'] > 0) {
          zeroMeasure = false;
          return false;
        }
      });
    }
    if (this.customInventoryAllowed && zeroMeasure) {
      query['size'] = 0;
      customInventoy = this.inventoryService
        .getFilterDataElastic( false, query)
        .pipe(
          map(res => {
            const data = {};
            data['digital'] = this.formatElasticResults(res);
            data['medias'] = this.formatMediaTypeResults(res);
            return data;
          }),
          debounceTime(200),
          distinctUntilChanged(),
          catchError(err => of([])),
          takeWhile(() => this.unsubscribe));
    }
    forkJoin([
      this.inventoryService.getFilterData(filters)
        .pipe(
          debounceTime(200),
          distinctUntilChanged(),
          map((data) => data.summaries),
          takeWhile(() => this.unsubscribe)
        ),
      customInventoy
    ]).subscribe(([summaries, elastic]) => {
      const mediaTypes = this.bulidMediaTree(summaries, selected, selectedParent, isMediaParent, elastic);
      if (this.moduleName === 'project') {
        const medias = {};
        medias['mediaTypes'] = JSON.parse(JSON.stringify(mediaTypes));
        medias['digitalCount'] = this.digitalCount;
        medias['nonDigitalCount'] = this.nonDigitalCount;
        this.commonService.setMediaTypes(JSON.parse(JSON.stringify(medias)));
      }
      this.dataSource.data = mediaTypes;
      this.loadedMediaTypes = true;
    });
  }
  bulidMediaTree(summaries, selected = [], selectedParent = [], isMediaParent= false, elastic = []): MediaTypeNode[] {
    let mediaTypes = [];
    summaries = summaries.sort(function(a, b) {
      return b.spots - a.spots;
    });
    let digitalCount = 0;
    let nonDigitalCount = 0;
    summaries.map(summary => {
      if (summary['summarizes'] && summary['summarizes']['summarizes_id_list'] && summary['summarizes']['summarizes_id_list'][3]) {
        const list = summary['summarizes']['summarizes_id_list'];
        const spotCount = summary['spots'];
        const parentObj = new MediaTypeNode();
        if (list[2]['name'] === 'true') {
          digitalCount += spotCount;
        } else {
          nonDigitalCount += spotCount;
        }
        const parent = list[0];
        let parentIndex = mediaTypes.findIndex(val => {
          if (val.id === parent.id) {
            return true;
          }
        });
        if (parentIndex < 0) {
          parentObj['id'] = parent['id'];
          parentObj['name'] = parent['name'];
          parentObj['children'] = [];
          parentObj['selected'] = false;
          parentObj['digital'] = '';
          parentObj['count'] = spotCount;
          mediaTypes.push(parentObj);
          parentIndex = (mediaTypes.length - 1);
        } else {
          mediaTypes[parentIndex]['count'] += spotCount;
        }
        const levelOneObj = new MediaTypeNode();
        const levelOne = list[1];

        let levelOneIndex = mediaTypes[parentIndex]['children'].findIndex(val => {
          if (val.id === levelOne.id && val.digital === list[2]['name']) {
            return true;
          }
        });
        if (levelOneIndex < 0) {
          levelOneObj['id'] = levelOne['id'];
          levelOneObj['name'] = (list[2]['name'] === 'false' ? 'Non Digital ' : 'Digital ') + levelOne['name'];
          levelOneObj['children'] = [];
          levelOneObj['count'] = spotCount;
          levelOneObj['selected'] = false;
          levelOneObj['digital'] = list[2]['name'];
          mediaTypes[parentIndex]['children'].push(levelOneObj);
          levelOneIndex = (mediaTypes[parentIndex]['children'].length - 1);
        } else {
          mediaTypes[parentIndex]['children'][levelOneIndex]['count'] += spotCount;
        }
        const levelTwoObj = new MediaTypeNode();
        const levelTwo = list[3];
        levelTwoObj['id'] = levelTwo['id'];
        levelTwoObj['name'] = levelTwo['name'];
        levelTwoObj['count'] = spotCount;
        if (selectedParent.includes(mediaTypes[parentIndex]['name'])) {
          levelTwoObj['selected'] = (selected.indexOf(levelTwo['id']) !== -1 ? true : false);
        } else {
          if (this.moduleName === 'project' && !isMediaParent) {
            levelTwoObj['selected'] = (selected.indexOf(levelTwo['id']) !== -1 ? true : false);
          } else {
            levelTwoObj['selected'] = false;
          }
        }
        levelTwoObj['digital'] = list[2]['name'];
        let levelTwoIndex = mediaTypes[parentIndex]['children'][levelOneIndex]['children'].findIndex(val => {
          if (val.id === levelTwo.id) {
            return true;
          }
        });
        if (levelTwoIndex < 0) {
          mediaTypes[parentIndex]['children'][levelOneIndex]['children'].push(levelTwoObj);
          levelTwoIndex = 0;
        }
      }
      mediaTypes = this.sortMediaTypes(mediaTypes);
    });
    if (elastic['medias']) {
      elastic['medias'].map(construction => {
        const parentObj = new MediaTypeNode();
        const parent = construction;
        let parentIndex = mediaTypes.findIndex(val => {
          if (val.name === parent['key']) {
            return true;
          }
        });
        if (parentIndex < 0) {
          parentObj['id'] = '';
          parentObj['name'] = parent['key'];
          parentObj['children'] = [];
          parentObj['selected'] = false;
          parentObj['digital'] = '';
          parentObj['count'] = parent['spot_count']['value'];
          mediaTypes.push(parentObj);
          parentIndex = (mediaTypes.length - 1);
        } else {
          mediaTypes[parentIndex]['count'] += parent['spot_count']['value'];
        }
        const levelOneData = construction['mediaTypes'] && construction['mediaTypes']['buckets'];
        if (levelOneData.length > 0) {
          levelOneData.map(levelOne => {
            const digital = levelOne['isDigital'] && levelOne['isDigital']['buckets'];
            if (digital.length > 0) {
              digital.map(d => {
                const levelOneName = (d['key_as_string'] === 'false' ? 'Non Digital ' : 'Digital ') + levelOne['key'];
                const levelOneObj = new MediaTypeNode();

                let levelOneIndex = mediaTypes[parentIndex]['children'].findIndex(val => {
                  if (val.name === levelOneName) {
                    return true;
                  }
                });
                if (levelOneIndex < 0) {
                  levelOneObj['id'] = levelOne['id'];
                  levelOneObj['name'] = levelOneName;
                  levelOneObj['children'] = [];
                  levelOneObj['count'] = d['spot_count']['value'];
                  levelOneObj['selected'] = false;
                  levelOneObj['digital'] = d['key_as_string'];
                  mediaTypes[parentIndex]['children'].push(levelOneObj);
                  levelOneIndex = (mediaTypes[parentIndex]['children'].length - 1);
                } else {
                  mediaTypes[parentIndex]['children'][levelOneIndex]['count'] += d['spot_count']['value'];
                }
                const frames = d['frames'] && d['frames']['buckets'];
                if (frames.length > 0) {
                  frames.map(frame => {
                    const levelTwoObj = new MediaTypeNode();
                    const levelTwoIndex = mediaTypes[parentIndex]['children'][levelOneIndex]['children'].findIndex(val => {
                      if (val.name === frame.key) {
                        return true;
                      }
                    });
                    if (levelTwoIndex < 0) {
                      levelTwoObj['id'] = '';
                      levelTwoObj['name'] = frame['key'];
                      levelTwoObj['count'] = frame['spot_count']['value'];
                      if (selectedParent.includes(mediaTypes[parentIndex]['name'])) {
                        levelTwoObj['selected'] = (selected.indexOf(frame['key']) !== -1 ? true : false);
                      } else {
                        if (this.moduleName === 'project' && !isMediaParent) {
                          levelTwoObj['selected'] = (selected.indexOf(frame['key']) !== -1 ? true : false);
                        } else {
                          levelTwoObj['selected'] = false;
                        }
                      }
                      levelTwoObj['digital'] = d['key_as_string'];
                      mediaTypes[parentIndex]['children'][levelOneIndex]['children'].push(levelTwoObj);
                    } else {
                      mediaTypes[parentIndex]['children'][levelOneIndex]['children'][levelTwoIndex]['count'] += frame['spot_count']['value'];
                    }
                  });
                }
              });
            }
          });
        }
      });
    }
    if (elastic['digital'] && elastic['digital']['digital']) {
      digitalCount += elastic['digital'];
    }
    if (elastic['digital'] && elastic['digital']['non-digital']) {
      nonDigitalCount += elastic['digital']['non-digital'];
    }
    this.digitalCount = digitalCount;
    this.nonDigitalCount = nonDigitalCount;
    return mediaTypes;
  }
  sortMediaTypes(mediaTypes) {
    mediaTypes.map(parent => {
      parent.children = parent.children.sort(function(a, b) {
        return b.count - a.count;
      });
    });
    mediaTypes.sort(function(a, b) {
      return b.count - a.count;
    });
    return mediaTypes;
  }
  loadClassificationTypes(filters = {}, selected = []) {
    let customInventoy: Observable<any> = of([]);
    let query = this.inventoryService.prepareInventoryQuery(filters);
    query = this.inventoryService.addClassificationQuery(query);
    query['size'] = 0;
    let zeroMeasure = true;
    if ((filters['measures_range_list']
    && filters['measures_range_list'].length > 1)) {
      filters['measures_range_list'].forEach((val) => {
        if (val['min'] > 0) {
          zeroMeasure = false;
          return false;
        }
      });
    }
    if (this.customInventoryAllowed && zeroMeasure) {
      customInventoy = this.inventoryService
        .getFilterDataElastic( false, query)
        .pipe(
          map(res => {
            const classification = [];
            res['classification']['buckets'].forEach(item => {
              const classified = {
                'key': item['key'],
                'count': item['doc_count']
              };
              classification.push(classified);
            });
            return classification;
          }),
          debounceTime(200),
          distinctUntilChanged(),
          catchError(err => of([])),
          takeWhile(() => this.unsubscribe));
    }
    forkJoin([
      this.inventoryService.getFilterData(filters).pipe(
        takeWhile(() => this.unsubscribe),
        map((data) => data.summaries )
      ),
      customInventoy])
    .subscribe(([summaries, elastic]) => {
      const classificationTypes = [];
      this.classTotalCount = 0;
      summaries.map(d => {
        let codeCount = 0;
        const custom = elastic.find(item => item.key === d.summarizes.name);
        if (custom) {
          codeCount = custom['count'];
        }
        this.classTotalCount += d.spots;
        classificationTypes.push({
          id: d.summarizes.id,
          name: d.summarizes.name,
          count: d.spots + codeCount,
          disabled: false,
          selected: (selected.indexOf(d.summarizes.name) !== -1 ? true : false)
        });
      });
      const keys = classificationTypes.map(c => c.id);
      if (keys.indexOf('1') === -1) {
        classificationTypes.push({
          name: 'Roadside',
          count: 0,
          disabled: false,
          selected: false
        });
      }
      if (keys.indexOf('4') === -1) {
        classificationTypes.push({
          name: 'Place Based',
          count: 0,
          disabled: false,
          selected: false
        });
      }
      if (this.moduleName === 'project') {
        this.commonService.setClassificationTypes(JSON.parse(JSON.stringify(classificationTypes)));
      }
      this.classificationTypes = classificationTypes;
      this.checkEnvironmentAllCheckbox();
    });
  }
  descendantsDigitalNonDigital() {
    let digitalNotSelected = 0;
    let notDigitalNotSelected = 0;
    this.dataSource.data.map(parent => {
      const subOptions = parent.children.map(levelOne => {
        if (levelOne.digital === 'true') {
          if (!levelOne.selected) {
            digitalNotSelected ++;
          }
          const descendants = this.treeControl.getDescendants(levelOne);
          const notSelected = descendants.filter(n => !n.selected);
          digitalNotSelected += notSelected.length;
        } else {
          if (!levelOne.selected) {
            notDigitalNotSelected ++;
          }
          const descendants = this.treeControl.getDescendants(levelOne);
          const notSelected = descendants.filter(n => !n.selected);
          notDigitalNotSelected += notSelected.length;
        }
      });
    });
    if (digitalNotSelected > 0) {
      this.isDigitalFilter = false;
    } else {
      this.isDigitalFilter = true;
    }
    if (notDigitalNotSelected > 0) {
      this.isNonDigitalFilter = false;
    } else {
      this.isNonDigitalFilter = true;
    }
  }
  /** Whether all the descendants of the node are selected */
  descendantsAllSelected(node: MediaTypeNode): boolean {
    try {
      const descendants = this.treeControl.getDescendants(node);
      const flag = descendants.every(child => child.selected);
      node.selected = flag;
      return flag;
    } catch (error) {
      return false;
    }
  }

  /** Whether part of the descendants are selected */
  descendantsPartiallySelected(node: MediaTypeNode): boolean {
    try {
      const descendants = this.treeControl.getDescendants(node);
      const result = descendants.some(child => child.selected);
      return result && !this.descendantsAllSelected(node);
    } catch (error) {
      return false;
    }
  }

  /** Toggle the media item selection. Select/deselect all the descendants node */
  toggleParentMedia(node: MediaTypeNode): void {
    node.selected = !node.selected;
    const descendants = this.treeControl.getDescendants(node);
    descendants.map(n => n.selected = node.selected);
    this.descendantsDigitalNonDigital();
  }
  toggleChildMedia(node: MediaTypeNode): void {
    node.selected = !node.selected;
    this.descendantsDigitalNonDigital();
  }
  convertBetweenDigitalNonDigital(type) {
    switch (type) {
      case 'digital': {
        this.isDigitalFilter = !this.isDigitalFilter;
        break;
      }
      case 'nondigital': {
        this.isNonDigitalFilter = !this.isNonDigitalFilter;
        break;
      }
      default:
        break;
    }
    this.dataSource.data.map(parent => {
      parent.selected = false;
      const subOptions = parent.children.map(levelOne => {
        if (levelOne.digital === 'true') {
          levelOne.selected = this.isDigitalFilter;
          const descendants = this.treeControl.getDescendants(levelOne);
          descendants.map(n => n.selected = this.isDigitalFilter);
        } else {
          levelOne.selected = this.isNonDigitalFilter;
          const descendants = this.treeControl.getDescendants(levelOne);
          descendants.map(n => n.selected = this.isNonDigitalFilter);
        }
      });
    });
  }

  applySelection(type = 'apply') {
    const selected = [];
    const selectedClassifications = [];
    const selectedPills = [];
    this.dataSource.data.map(filterGroup => {
      filterGroup.children.map(subFilters => {
        subFilters.children.map(levelThree => {
          if (levelThree.selected) {
            selected.push(levelThree.id);
          }
        });
      });
    });
    this.classificationTypes.map(c => {
      if (c.selected) {
        selectedClassifications.push(c.name);
        selectedPills.push(c.name);
      }
    });
    // selectedPills = selectedClassifications;
    if (!this.isDigitalFilter &&  !this.isNonDigitalFilter) {
      this.dataSource.data.map(parent => {
        if (parent.selected) {
          selectedPills.push(parent.name);
        } else {
          parent.children.map(levelOne => {
            if (levelOne.selected) {
              selectedPills.push(levelOne.name);
            } else {
              levelOne.children.map(levelTwo => {
                if (levelTwo.selected) {
                  selectedPills.push(levelTwo.id);
                }
              });
            }
          });
        }
      });
    } else {
      if (this.isDigitalFilter) {
        selectedPills.push('Digital Only');
      }
      if (this.isNonDigitalFilter) {
        selectedPills.push('Non-Digital Only');
      }
      /* if (!this.isDigitalFilter || !this.isNonDigitalFilter) {
        this.dataSource.data.filter((data) => {
          if (data.selected) {
            selectedPills.push(data.name);
          }
        });
      } */
    }
    const ids = {medias: selected, environments: selectedClassifications};
    const joinPills = selectedPills.join(', ');
    // we have use mediaParant to avoid the duplicate select from medai filters
    const mediaParent = [];
    this.dataSource.data.forEach(mediaType => {
      if (mediaType.selected) {
        mediaParent.push(mediaType.name);
      } else {
        if (mediaType.children) {
          mediaType.children.map(firstChild => {
            if (firstChild.selected) {
              mediaParent.push(mediaType.name);
            } else {
              firstChild.children.map(secondChild => {
                if (secondChild.selected) {
                  mediaParent.push(mediaType.name);
                }
              });
            }
          });
        }
      }
    });
      // removing duplicate;
    mediaParent.filter((ptype, index) => mediaParent.indexOf(ptype) === index);

    if (this.moduleName === 'project') {
      this.dialogPopupState.emit({
        state: type,
        data: joinPills,
        ids: ids,
        // dataSource: JSON.parse(JSON.stringify(this.dataSource.data)),
        isDigital: this.isDigitalFilter,
        isNonDigital: this.isNonDigitalFilter,
        edit: (this.mediaTypesDataForEdit.editData) ? true : false,
        index: this.mediaTypesDataForEdit.index,
        mediaParent: mediaParent
      });
    } else {
      if (selected.length || selectedPills.length) {
        this.filterService.setFilter('mediaTypeList', {ids: ids, pills: joinPills, dataSource: this.dataSource.data,
          isDigital: this.isDigitalFilter, isNonDigital: this.isNonDigitalFilter, mediaParent: mediaParent});
      }
    }

  }
  clearSelection() {
    this.dataSource.data.map(parent => {
      parent.selected = false;
      parent.children.map(levelOne => {
        levelOne.selected = false;
        levelOne.children.map(levelTwo => {
          levelTwo.selected = false;
        });
      });
    });
    this.isDigitalFilter = false;
    this.isNonDigitalFilter = false;

    /** Clearing environment filter */

    this.classificationTypes.map(c => c.selected = false);
    this.isEnvironmentFilter = false;
    this.isEnvironmentIndeter = false;
    this.filterService.clearFilter('mediaTypeList', true);
    if (this.moduleName === 'project') {
      this.dialogPopupState.emit({
        state: 'clear'
      });
    }
  }
  onSelectClassification(option) {
    option.selected = !option.selected;
    this.checkEnvironmentAllCheckbox();
  }
  toggleAllEnvironmentTypes () {
    this.isEnvironmentFilter = !this.isEnvironmentFilter;
    this.isEnvironmentIndeter = false;
    this.classificationTypes.map(c => c.selected = this.isEnvironmentFilter);
  }
  checkEnvironmentAllCheckbox() {
    const notSelected = this.classificationTypes.filter(c => !c.selected);
    if (notSelected.length === 0) {
      this.isEnvironmentFilter = true;
      this.isEnvironmentIndeter = false;
    } else if (notSelected.length > 0 && this.classificationTypes.length !== notSelected.length ) {
      this.isEnvironmentIndeter = true;
      this.isEnvironmentFilter = false;
    } else {
      this.isEnvironmentIndeter = false;
      this.isEnvironmentFilter = false;
    }
  }
  toggleEnvironmentOptions() {
    this.environmentOptions = !this.environmentOptions;
  }
  private formatElasticResults(aggregated) {
    const result = [];
    if (aggregated['isDigital'] && aggregated['isDigital']['buckets']) {
      const temp = aggregated['isDigital']['buckets'];
      const digital = temp.find(item => item['key_as_string'] === 'true');
      const nonDigital = temp.find(item => item['key_as_string'] === 'false');
      result['digital'] = digital && digital['spot_count']['value'] || 0;
      result['non-digital'] = nonDigital && nonDigital['spot_count']['value'] || 0;
    }
    return result;
  }
  private formatMediaTypeResults(aggregated) {
    const result = [];
    if (aggregated['constructions'] && aggregated['constructions']['buckets']) {
      return aggregated['constructions']['buckets'];
    }
    return result;
  }
  ngAfterViewChecked() {
    this.cdRef.detectChanges();
  }
}
