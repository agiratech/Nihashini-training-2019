import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject, Observable } from 'rxjs';
import { ConvertPipe } from '@shared/pipes/convert.pipe';
import { FormatService } from './format.service';

@Injectable()
export class WorkSpaceDataService {
  constructor(
    private convert: ConvertPipe,
    private formatService: FormatService
  ) {}
  public scenarioName = '';
  public scenarioDescription = '';
  public scenarioTags: any;
  private showListValues = [
    { name: 'All', value: 'all' },
    { name: 'Active Now', value: 'active' },
    { name: 'Future', value: 'future' },
    { name: 'Past', value: 'past' }
  ];
  private dayparts = [
    { name: 'Weekly Average', value: 'Weekly Average' }
    // {name: 'Monthly Average', value: 'Monthly Average'}
  ];
  public projectTitle = '';
  public projectDescription = '';
  public projectTags: any;
  private packages = new Subject();
  private scenarios = new Subject();
  private selectedPackage = new Subject();
  private customizedColumnEmitter = new BehaviorSubject('notOpen');

  public getCustomizedColumnEmitter(): Observable<any> {
    return this.customizedColumnEmitter.asObservable();
  }
  public setCustomizedColumnEmitter(emitterAction) {
    this.customizedColumnEmitter.next(emitterAction);
  }
  public getPackages(): Observable<any> {
    return this.packages.asObservable();
  }
  public setPackages(packages) {
    this.packages.next(packages);
  }
  public getSelectedPackage(): Observable<any> {
    return this.selectedPackage.asObservable();
  }
  public setSelectedPackage(selectedPackage) {
    this.selectedPackage.next(selectedPackage);
  }
  public getScenarios(): Observable<any> {
    return this.scenarios.asObservable();
  }
  public setScenarios(scenarios) {
    this.scenarios.next(scenarios);
  }
  public getDayparts() {
    return this.dayparts;
  }
  public formatCSVDoc(data) {
    let csvData = [
      {
        title: 'Scenario Name',
        name: data['name']
      },
      {
        title: 'Description',
        name: (data['descriptioin'] && data['descriptioin']) || ''
      },
      {
        title: 'Audience',
        name: data['audience']
      },
      {
        title: 'Market',
        name: data['market']
      },
      {
        title: ''
      },
      {
        title: 'Delivery Goals'
      },
      {
        planned_title: '',
        planned_impressions: 'Impressions',
        planned_trp: 'TRP',
        planned_reach: 'Reach',
        planned_frequency: 'Frequency'
      },
      {
        planned_title: 'Planned',
        planned_impressions:
          (data['summary']['imp_target'] &&
            this.convert.transform(
              data['summary']['imp_target'],
              'THOUSAND'
            )) ||
          '-',
        planned_trp:
          (data['summary']['trp'] &&
            this.convert.transform(data['summary']['trp'], 'DECIMAL', 3)) ||
          '-',
        planned_reach:
          (data['summary']['reach_pct'] &&
            this.convert.transform(data['summary']['reach_pct'], 'DECIMAL')) ||
          '-',
        planned_frequency:
          (data['summary']['freq_avg'] &&
            this.convert.transform(
              data['summary']['freq_avg'],
              'DECIMAL',
              3
            )) ||
          '-'
      },
      {
        actual_title: 'Actual',
        actual_impressions: 'Not Yet Available',
        actual_trp: 'Not Yet Available',
        actual_reach: 'Not Yet Available',
        actual_frequency: 'Not Yet Available'
      },
      {
        my_goals_title: 'My Goals',
        my_goals_impressions:
          (data['scenario']['goals']['impressions'] &&
            data['scenario']['goals']['impressions']) ||
          '',
        my_goals_trp:
          (data['scenario']['goals']['trp'] &&
            data['scenario']['goals']['trp']) ||
          '',
        my_goals_reach:
          (data['scenario']['goals']['reach'] &&
            data['scenario']['goals']['reach']) ||
          '',
        my_goals_frequency:
          (data['scenario']['goals']['frequency'] &&
            data['scenario']['goals']['frequency']) ||
          ''
      },
      {
        title: ''
      },
      {
        title: 'Inventory in This Scenario'
      }
    ];
    const inventoryHeader: any = [
      {
        total_Units: 'Total Number of Units',
        target_imp: 'Target Impressions',
        persons_imp: 'Persons 0+ Impressions',
        target_com: 'Target Composition'
      },
      {
        total_Units:
          (data['summary']['inventory_count'] &&
            this.convert.transform(data['summary']['spots'], 'THOUSAND')) ||
          '',
        target_imp:
          (data['summary']['imp_target'] &&
            this.convert.transform(
              data['summary']['imp_target'],
              'ABBREVIATE',
              0
            )) ||
          '',
        persons_imp:
          (data['summary']['imp'] &&
            this.convert.transform(data['summary']['imp'], 'ABBREVIATE', 0)) ||
          '',
        target_com:
          (data['summary']['imp_target'] &&
            data['summary']['imp'] &&
            this.formatService.convertToPercentageFormat(
              data['summary']['imp_target'] / data['summary']['imp'],
              0
            ) + '%') ||
          ''
      },
      {
        title:
          (data['inventoryDetails']['selectedOption'] &&
            data['inventoryDetails']['selectedOption']['title'] &&
            data['inventoryDetails']['selectedOption']['title']) ||
          '',
        data:
          (data['inventoryDetails']['selectedOption'] &&
            data['inventoryDetails']['selectedOption']['data'] &&
            data['inventoryDetails']['selectedOption']['data']) ||
          ''
      }
    ];
    const headingColumn = [{
      opp: 'Plant Operator',
      fid: 'Geopath Frame ID',
      sid: 'Geopath Spot ID',
      classification_type: 'Classification',
      construction_type: 'Construction',
      digital: 'Digital',
      pid: 'Operator Spot ID',
      mt: 'Media Type',
      max_height: 'Height (ft & in)',
      max_width: 'Width (ft & in)',
      primary_artery: 'Primary Artery',
      zip_code: 'ZIP Code',
      longitude: 'Longitude',
      latitude: 'Latitude',
      orientation: 'Orientation',
      illumination_type: 'Illumination Type',
      totwi: 'Total Impressions',
      tgtwi: 'Target Weekly Impressions',
      compi: 'Target Audience Index',
      reach: 'Reach',
      freq: 'Target In-Market Frequency',
      totinmi: 'Total In-Market Impressions',
      tgt_aud_impr: 'Target Audience Impressions',
      cwi: 'Target % Impression Comp',
      tgtinmp: 'Target % In-Market Imp',
      compinmi: 'Target % In-Market Impr. Comp.',
      totinmp: 'Total % In-Mkt Impr.',
      trp: 'Target In-Market Rating Points',
      tgtinmi: 'Target In-Market Impressions',
      media_name: 'Media Name'
    }];

    const customizedColumn = JSON.parse(localStorage.getItem('scenarioExportColumn'));

    if (customizedColumn && customizedColumn.length > 0) {
      const dynamicColumns = {};
      customizedColumn
        .filter(column => headingColumn[0][column])
        .forEach(column => {
          dynamicColumns[column] =  headingColumn[0][column];
      });
      inventoryHeader.push(dynamicColumns);
   } else {
      inventoryHeader.push(headingColumn[0]);
    }

    const inventoryData = [];
    if (data['inventoryDetails']['selectedInventory'] &&
      data['inventoryDetails']['selectedInventory'].length > 0) {
      data['inventoryDetails']['selectedInventory'].forEach(element => {
        const inventory = {
          opp: element['opp'],
          fid: element['fid'],
          sid: element['sid'],
          classification_type: element['classification_type'],
          construction_type: element['construction_type'],
          digital: element['digital'],
          pid: element['pid'],
          mt: element['mt'],
          media_name: element['media_name'],
          max_height: element['max_height'],
          max_width: element['max_width'],
          primary_artery: element['primary_artery'],
          zip_code: element['zip_code'],
          longitude: element['longitude'],
          latitude: element['latitude'],
          orientation: element['orientation'],
          illumination_type: element['illumination_type'],
          tgtinmi: element['tgtinmi'] && element['tgtinmi'] || 'N/A',
          totwi: element['totwi'] && element['totwi'] || 'N/A',
          tgtwi: element['tgtwi'] && element['tgtwi'] || 'N/A',
          compi:
            (element['compi'] &&
              this.convert.transform(element['compi'], 'THOUSAND')) ||
            'N/A',
          reach:
            (element['reach'] &&
              this.formatService.convertToDecimalFormat(element['reach'], 2) +
                '%') ||
            'N/A',
          freq: element['freq'],
          totinmi: element['totinmi'] && element['totinmi'] || '',
          tgt_aud_impr: element['tgt_aud_impr'] && element['tgt_aud_impr'] || '',
          cwi:
            (element['cwi'] &&
              this.convert.transform(element['cwi'], 'PERCENT') + '%') ||
            'N/A',
          tgtinmp:
            (element['tgtinmp'] &&
              this.convert.transform(element['tgtinmp'], 'PERCENT') + '%') ||
            'N/A',
          compinmi: (element['compinmi'] &&
          this.convert.transform(element['compinmi'], 'PERCENT') + '%') ||
        'N/A',
          totinmp: (element['totinmp'] &&
          this.convert.transform(element['totinmp'], 'DECIMAL', 2) ) ||
        'N/A',
          trp: (element['trp'] &&
          element['trp'].toFixed(3) ) || ''
        };

        let valueColumns = {};
        customizedColumn.map(column => {
          if (column !== 'checked') {
            valueColumns = {...valueColumns, ...{[column]: inventory[column]}};
          }
        });

        inventoryData.push(valueColumns);
      });
      csvData = [...csvData, ...inventoryHeader, ...inventoryData];
    } else {
      inventoryHeader.splice(1, 1);
      inventoryHeader.splice(1, 0, {
        total_Units: '',
        target_imp: '',
        persons_imp: '',
        target_com: ''
      });
      csvData = [...csvData, ...inventoryHeader, ...inventoryData];
    }

    const placeLength = Object.keys(data['placesDetails']).length;
    const placeHeader = [
      {
        title: ''
      },
      {
        title: 'Places in This Scenario'
      },
      {
        title: 'Places',
        details:
          (placeLength > 0 && data['placesDetails']['placeSets'].join(', ')) ||
          ''
      },
      {
        name: 'Name',
        details: 'Details'
      }
    ];

    const placesData = [];

    if (placeLength > 0 && data['placesDetails']['places'].length > 0) {
      data['placesDetails']['places'].forEach(element => {
        if (element['selected']) {
          const place = {
            name: (element['name'] && element['name']) || '',
            details: (element['details'] && element['details']) || ''
          };
          placesData.push(place);
        }
      });
      csvData = [...csvData, ...placeHeader, ...placesData];
    } else {
      csvData = [...csvData, ...placeHeader, ...placesData];
    }

    return csvData;
  }
}
