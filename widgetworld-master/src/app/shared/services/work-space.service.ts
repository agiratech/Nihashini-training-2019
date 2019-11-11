
import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {ProjectDataStoreService} from '../../dataStore/project-data-store.service';
import {CommonService} from './common.service';
import {AppConfig} from '../../app-config.service';
import {Observable} from 'rxjs';
import {FormGroup} from '@angular/forms';

@Injectable()
export class WorkSpaceService {

  constructor (
    private cService: CommonService,
    private httpClient: HttpClient,
    private config: AppConfig,
    private projectStore: ProjectDataStoreService
  ) { }
  getExplorePackages(noLoader = false) {
    let reqHeaders;
    if (noLoader) {
      reqHeaders = new HttpHeaders().set('hide-loader', 'hide-loader');
    }
    return this.httpClient
               .get(this.config.envSettings['API_ENDPOINT'] + 'inventory/collections', {headers: reqHeaders});
  }
  saveExplorePackage(inputs, data): Observable<any> {
    const pack = {name: inputs.name, description: inputs.description};
    if (pack['description'] === '') {
      pack['description'] = null;
    }
    pack['inventory'] = data;
    const body = {package: pack};
    if (inputs.name_key !== '' && inputs.name_key != null) {
      return this.httpClient
               .patch(this.config.envSettings['API_ENDPOINT'] + 'inventory/collections/' + inputs.id,
                     body);
    } else {
      return this.httpClient
               .post(this.config.envSettings['API_ENDPOINT'] + 'inventory/collections',
                     body);
    }
  }
  deletePackage(id) {
    return this.httpClient
               .delete(this.config.envSettings['API_ENDPOINT'] + 'inventory/collections/' + id);
  }


  /** Project Related APIs **/
  getProject(pid) {
    return this.httpClient.get(this.config.envSettings['API_ENDPOINT'] + 'workflows/projects/' + pid);
  }
  getProjects(noLoader = false) {
    let reqHeaders;
    if (noLoader) {
      reqHeaders = new HttpHeaders().set('hide-loader', 'hide-loader');
    }
    return this.httpClient.get(this.config.envSettings['API_ENDPOINT'] + 'workflows/projects', {headers: reqHeaders});
  }


  /** Scenarios Related APIs **/
  formattingScenarios(data, packages, audiences = [], markets = [], places = [], cbsaMarkets = []) {
    const formattedData = [];
    if (data.length > 0) {
      for (let i = 0; i < data.length; i++) {
        const fData = {
          '_id': '',
          'name': '',
          'labels': '',
          'description': '',
          'units': 0,
          'audience': '',
          'audienceKey': '',
          'market': '',
          'start': '',
          'end': '',
          'impressions': '',
          'trp': '',
          'reach': '',
          'frequency': ''
        };

        fData['_id'] = data[i]['_id'];
        fData['name'] = data[i]['name'];
        fData['labels'] = data[i]['labels'];
        fData['description'] = data[i]['description'];
        const inventorySets = packages.filter(set => data[i]['package'].indexOf(set._id) !== -1);
        fData['units'] = 0;
        fData['unitIds'] = [];
        if (inventorySets.length > 0) {
          let unitIds = [];
          inventorySets.forEach(inventorySet => {
            const ids = inventorySet.inventory.map(panel => panel.id);
            unitIds = unitIds.concat(ids);
          });
          fData['unitIds'] = unitIds;
        }
        if (typeof data[i]['audience'] !== 'undefined' && audiences.length > 0) {
          if (typeof data[i]['audience']['audience_id']  !== 'undefined' && data[i]['audience']['audience_id'] !== '') {
            const foundAudience = audiences.find(option => option._id === data[i]['audience']['audience_id']);
            if (foundAudience !== undefined) {
              fData['audience'] = foundAudience['title'];
              fData['audienceKey'] = foundAudience['audiences'][0]['key'];
            }

          }
          fData['market'] = '';
          if (data[i]['audience']['market_id']) {
            if (data[i]['audience']['market_type'] && data[i]['audience']['market_type'] === 'CBSA') {
              cbsaMarkets.filter( market => {
                if (market.id === data[i]['audience']['market_id']) {
                  fData['market'] = market.name;
                }
              });
            } else {
              markets.filter( market => {
                if (market.id === data[i]['audience']['market_id']) {
                  fData['market'] = market.name;
                }
              });
            }
          }
          fData['marketId'] = data[i]['audience']['market_id'];
        }
        if (typeof data[i]['when'] !== 'undefined') {
          fData['start'] = data[i]['when']['start'];
          fData['end'] = data[i]['when']['end'];
        }

        if (typeof data[i]['goals'] !== 'undefined') {
          fData['impressions'] = data[i]['goals']['impressions'];
          fData['trp'] = data[i]['goals']['trp'];
          fData['reach'] = data[i]['goals']['reach'];
          fData['frequency'] = data[i]['goals']['frequency'];
        }
        /** Places count update */
        fData['places'] = '';
        if (data[i]['places']) {
          const PlasesSet = places.filter(place => data[i]['places'].indexOf(place._id) !== -1);
          if (PlasesSet.length > 0) {
            let placesIds = [];
            PlasesSet.forEach(place => {
              placesIds = placesIds.concat(place.pois);
            });
            fData['places'] = placesIds.length;
          }
        }
        formattedData.push(fData);
      }
      return formattedData;
    }
  }

  deleteScenarios(sid) {
    return this.httpClient.delete(this.config.envSettings['API_ENDPOINT'] + 'workflows/scenarios/' + sid);
  }
  createScenario(projectId, scenario): Observable<any> {
    return this.httpClient.post(this.config.envSettings['API_ENDPOINT'] + 'workflows/projects/' + projectId + '/scenarios', scenario);
  }

  getScenariobyId(scenarioId) {
    return this.httpClient.get(this.config.envSettings['API_ENDPOINT'] + 'workflows/scenarios/' + scenarioId);
  }

  formatScenarioData(formGroup: FormGroup) {
    // Raw value function is used to get value from the disabled field as well

    const data = formGroup.getRawValue();
    const formatted = {
      'name': data.name,
      'audience': {
        'audience_id': this.returnNullIfEmpty(data.default_audience),
        'market_id': this.returnNullIfEmpty(data.default_market),
        'market_type': this.returnNullIfEmpty(data.default_market_type),
        // 'when': this.returnNullIfEmpty(data.daypart)
      },
      'when': {
        'start': this.returnNullIfEmpty(data.when.start),
        'end': data.when.end && this.addEndHours(data.when.end) || null,
      },
     /* 'goals': [{
        'impressions': 0,
        'trp': 0,
        'reach': 0,
        'frequency': 0
      }],*/
      'goals': [{
        'impressions': data.goals.impressions ? Number(data.goals.impressions) : null,
        'trp': data.goals.trp ? Number(data.goals.trp) : null,
        'reach': data.goals.reach ? Number(data.goals.reach) : null,
        'frequency': data.goals.frequency ? Number(data.goals.frequency) : null,
      }],
      'package': this.returnNullIfEmptyArr(data.inventory_set),
      'places': this.returnNullIfEmptyArr(data.places),
      'description': this.returnNullIfEmpty(data.description),
      'notes': this.returnNullIfEmpty(data.notes),
      'labels': this.returnNullIfEmptyArr(data.scenario_tags),
    };
    /*if (data.scenario_tags && data.scenario_tags.length > 0) {
      formatted.labels = data.scenario_tags.map(item => item.value);
    }*/
    return formatted;
  }

  newFormatScenarioData(formGroup: FormGroup) {
    // Raw value function is used to get value from the disabled field as well

    const data = formGroup.getRawValue();
    const formatted = {
      'name': data.name,
      'package': this.returnNullIfEmptyArr(data.inventory_set),
      'places': this.returnNullIfEmptyArr(data.places),
      'description': this.returnNullIfEmpty(data.description),
      'notes': this.returnNullIfEmpty(data.notes),
      'labels': this.returnNullIfEmptyArr(data.scenario_tags),
    };
    return formatted;
  }
  private returnNullIfEmpty(str) {
    const strVariable = this.formatCommandline(str);
    if (strVariable === '' || strVariable === 'us') {
      return null;
    }
    return str;
  }
  private returnNullIfEmptyArr(arr) {
    const arrVariable = arr;
    if (typeof arrVariable !== 'undefined' && arrVariable  != null && arrVariable.length > 0) {
      return arr;
    }
    return null;
  }
  formatCommandline(c: string|string[]) {
    if (typeof c === 'string') {
        return c.trim();
    }
  }
  addEndHours(date: Date): Date {
    if (date) {
      date.setHours(23);
      date.setMinutes(59);
      date.setSeconds(59);
      return date;
    }
  }
}
