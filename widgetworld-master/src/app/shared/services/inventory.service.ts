import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Summary, SummaryRequest, SummaryResponse } from '@interTypes/summary';
import {
  InventroySearch,
  InventroySearchResponse
} from '@interTypes/inventorySearch';
import { Inventory, InventoryDetailsReq } from '@interTypes/inventory';
import { Observable } from 'rxjs';
import { map, filter, tap } from 'rxjs/operators';
import { AppConfig } from '../../app-config.service';
import { MarketType } from '@interTypes/marketType';
import { ElasticIndexName } from '@interTypes/inventoryElasticSearch';
import { ThemeService } from '@shared/services/theme.service';
const IVENTORY_COUNT_LIMIT = 10000;
@Injectable()
export class InventoryService {
  private filtersFromAPI$: Observable<any> = null;
  // TO be used for elastic search calls
  private siteName: string;
  constructor(private http: HttpClient,
    private config: AppConfig,
    private theme: ThemeService
  ) {
    const themeSettings = this.theme.getThemeSettings();
    this.siteName = themeSettings.site;
  }

  getSummary(filters: Partial<SummaryRequest>, noLoader = true): Observable<Partial<Summary>> {
    let reqHeaders;
    if (noLoader) {
      reqHeaders = new HttpHeaders().set('hide-loader', 'hide-loader');
    }
    return this.http
      .post(
        this.config.envSettings['API_ENDPOINT_V2.1'] + 'inventory/summary/search',
        filters,
        { headers: reqHeaders }
      ).pipe(map((response: SummaryResponse) => response.summaries[0]));
  }

  getInventoryIds(filters: Partial<SummaryRequest>, noLoader = true): Observable<any> {
    let reqHeaders;
    if (noLoader) {
      reqHeaders = new HttpHeaders().set('hide-loader', 'hide-loader');
    }
    const filter = JSON.parse(JSON.stringify(filters));
    delete filter['sort'];
    filter['page_size'] = 500001;
    return this.http.post(
      this.config.envSettings['API_ENDPOINT_V2.1'] + 'inventory/frame/id/search',
      filter,
      { headers: reqHeaders }
    );
  }

  getInventorySpotIds(filters: Partial<SummaryRequest>, noLoader = true): Observable<any> {
    let reqHeaders;
    if (noLoader) {
      reqHeaders = new HttpHeaders().set('hide-loader', 'hide-loader');
    }
    const filter = JSON.parse(JSON.stringify(filters));
    delete filter['sort'];
    filter['page_size'] = 500001;
    return this.http.post(
      this.config.envSettings['API_ENDPOINT_V2.1'] + 'inventory/spot/id/search',
      filter,
      { headers: reqHeaders }
    );
  }

  getInventories(
    filters: Partial<SummaryRequest>,
    noLoader = true
  ): Observable<InventroySearch[]> {
    let reqHeaders;
    if (noLoader) {
      reqHeaders = new HttpHeaders().set('hide-loader', 'hide-loader');
    }
    const filter = JSON.parse(JSON.stringify(filters));
    filter['page_size'] = 100;
    return this.http
      .post(this.config.envSettings['API_ENDPOINT_V2.1'] + 'inventory/search', filter, { headers: reqHeaders })
      .pipe(
        map(
          (result: InventroySearchResponse) =>
            result['inventory_summary']['inventory_items']
        )
      );
  }

  /**
 *
 * @param filters  filter spot id data
 * @param noLoader
 * This function is used to calculate the pagination
 */

  getInventoriesPagesCount(
    filters: Partial<SummaryRequest>,
    noLoader = true
  ): Observable<InventroySearch[]> {
    let reqHeaders;
    if (noLoader) {
      reqHeaders = new HttpHeaders().set('hide-loader', 'hide-loader');
    }
    const filter = JSON.parse(JSON.stringify(filters));
    filter['page_size'] = 100;
    return this.http
      .post(this.config.envSettings['API_ENDPOINT_V2.1'] + 'inventory/search', filter, { headers: reqHeaders })
      .pipe(
        map(
          (result: InventroySearchResponse) =>
            result['inventory_summary']['pagination']
        )
      );
  }

  getSingleInventory(params: InventoryDetailsReq, noLoader = true): Observable<any> {
    let reqHeaders;
    if (noLoader) {
      reqHeaders = new HttpHeaders().set('hide-loader', 'hide-loader');
    }
    let url = this.config.envSettings['API_ENDPOINT_V2.1'] +
      'inventory/' + params.frameId + '?';
    if (params.base_segment) {
      url = url + 'base_segment=' + params.base_segment + '&';
    }
    if (params.target_segment) {
      url = url + 'target_segment=' + params.target_segment + '&';
    }
    if (params.target_geography) {
      url = url + 'target_geography=' + params.target_geography;
    }
    url = url.replace(/\?$/, '');
    url = url.replace(/&$/, '');
    return this.http
      .get(url, { headers: reqHeaders })
      .pipe(map((response: Inventory) => response));
  }

  /**
   * This method is to get the filters data
   * @param filters
   */
  public getFilterData(filters: Partial<SummaryRequest>): Observable<any> {
    const reqHeaders = new HttpHeaders().set('hide-loader', 'hide-loader');
    return this.http.post(
      this.config.envSettings['API_ENDPOINT_V2.1'] + 'inventory/summary/search',
      filters, { headers: reqHeaders }
    );
  }

  /**
   * This is new method to get the operators
   * @param filters
   */
  public getOperators(filters: Partial<SummaryRequest>, noLoader = true): Observable<any> {
    let reqHeaders;
    if (noLoader) {
      reqHeaders = new HttpHeaders().set('hide-loader', 'hide-loader');
    }
    return this.http.post(
      this.config.envSettings['API_ENDPOINT_V2.1'] + 'inventory/summary/search',
      filters, { headers: reqHeaders }
    ).pipe(filter((results: any) => {
      return results.summaries.sort((operator1, operator2) => operator2.spots - operator1.spots);
    }),
      map((data: any) => {
        return data.summaries.map((operator, index) => {
          return { id: operator.summarizes.id, name: operator.summarizes.name, count: operator.spots, slno: index + 2 };
        }).filter((operator) => operator.id);
      }));
  }
  /**
   * This method is to get the marketTotals
   * @param filters
   */
  public getMarketTotals(filters: Partial<SummaryRequest>, noLoader = true): Observable<any> {
    const filterData = JSON.parse(JSON.stringify(filters));
    // TODO: We have to remove below code when we convert everything to spot id
    if (filterData['id_type']) {
      filterData['id_type'] = 'spot_id';
    }
    filterData['summary_level_list'] = ['DMA'];
    let reqHeaders;
    if (noLoader) {
      reqHeaders = new HttpHeaders().set('hide-loader', 'hide-loader');
    }
    return this.http.post(
      this.config.envSettings['API_ENDPOINT_V2.1'] + 'inventory/summary/search',
      filterData, { headers: reqHeaders }
    ).pipe(map(response => this.formatMarketBubble(response['summaries'])));
  }
  public formatMarketBubble(summaries) {
    const frames = [];
    if (summaries && summaries.length > 0) {
      summaries.map(summary => {
        const temp = {};
        temp['type'] = 'Feature';
        temp['geometry'] = summary['summarizes']['geometry'];

        temp['properties'] = {};
        temp['properties']['id'] = summary['summarizes']['id'];
        temp['properties']['name'] = summary['summarizes']['name'];
        temp['properties']['panelCount'] = summary['spots'];
        // checking whether frames are available or not minimum required is 1
        if (summary['frames'] > 0) {
          frames.push(temp);
        }
      });
    }
    return { 'type': 'FeatureCollection', 'features': frames };
  }


  getMarkets() {
    const data = { 'summary_level_list': ['DMA'] };
    const reqHeaders = new HttpHeaders().set('hide-loader', 'hide-loader');
    return this.http
      .post(this.config.envSettings['API_ENDPOINT_V2.1'] + 'inventory/summary/search', data, { headers: reqHeaders })
      .pipe(map(response => {
        const markets = [];
        response['summaries']
          .map(summary => {
            if (summary['summarizes'] && summary['summarizes']['type'] === 'DMA') {

              markets.push({
                name: summary['summarizes']['name'],
                id: summary['summarizes']['id'],
                count: summary['frames'],
              });
            }
          });
        return markets.sort((a, b) => {
          const nameA = a.name.toUpperCase(); // ignore upper and lowercase
          const nameB = b.name.toUpperCase(); // ignore upper and lowercase
          if (nameA < nameB) {
            return -1;
          }
          if (nameA > nameB) {
            return 1;
          }
          return 0;
        });
      }));
  }
  getMarketsFromFile() {
    return this.http.get('../../../assets/DMAs.json');
  }

  /**
   *This funtion call the local file from assets
   *
   * @returns CBSA List Market
   * @memberof InventoryService
   */
  getMarketsCBSAFromFile() {
    return this.http.get('../../../assets/CBSAs.json');
  }

  tempCreateFile() {
    /*this.http.get(this.config.envSettings['API_ENDPOINT_V2.1'] + 'markets/search?type=CBSA&page=' + page)
      .pipe(
        tap(res => {
          console.log(JSON.stringify(res['markets']));
        }),
        filter(res => res['pagination']['page'] <= 10)
      ).subscribe(res => {
        this.tempCreateFile(res['pagination']['page'] + 1);
    });*/
    // this.http.get('../../../assets/sorted.json')
    //   .subscribe(res => {
    //     this.http.get('../../../assets/CBSAs.json')
    //       .subscribe(res1 => {
    //         res1.forEach(cbsa => {
    //           cbsa['population'] = 0;
    //           const match = res.find(sorted => sorted.GP_MARKET_ID === cbsa.id);
    //           if (match) {
    //             cbsa['population'] = match['DEMOGRAPHIC_POPULATION'];
    //           }
    //         });
    //         res1.sort((a, b) => (a.population > b.population) ? -1 : ((b.population > a.population) ? 1 : 0));
    //         console.log(JSON.stringify(res1));
    //       });
    //   });
  }
  /**
   * This method is to filter the inventories in scenarios module
   * @param filters
   */
  public normalizeFilterDataNew(filters: Object): Partial<SummaryRequest> {
    /* We are using  defaultAudience by default all API call so taken directly from localstorage*/
    const defaultAudience = JSON.parse(localStorage.getItem('defaultAudience'));
    const data: Partial<SummaryRequest> = {};
    // If no data, just return an empty array
    if (!filters) {
      return {};
    }
    // If plant unit ID is there rest of the IDs and scenarios will be ignored
    if (filters['operatorPanelIdList']) {
      data.id_type = 'plant_frame_id';
      data.id_list = filters['operatorPanelIdList'];
    } else if (filters['geopathPanelIdList']) {
      data.id_type = 'spot_id';
      data.id_list = filters['geopathPanelIdList'];
    }

    if (filters['audienceMarket']) {
      data['target_geography'] = filters['audienceMarket'];
    }

    const sort = { 'measure': 'pct_comp_imp_target', 'type': 'asc' };
    if (filters['sort']) {
      sort['measure'] = filters['sort'];
      sort['type'] = filters['sort_type'];
    }
    data['sort'] = sort;
    if (filters['audience']) {
      data['target_segment'] = filters['audience'];
    }
    if (defaultAudience && defaultAudience['audienceKey']) {
      data['base_segment'] = defaultAudience['audienceKey'];
    }
    if (filters['location'] && filters['location']['type']) {
      data['inventory_market_list'] = [filters['location']['selectedGeoLocation']['id']];
    }
    return data;
  }


  getInventoriesWithAllData(
    filters: Partial<SummaryRequest>,
    noLoader = true
  ): Observable<any> {
    let reqHeaders;
    if (noLoader) {
      reqHeaders = new HttpHeaders().set('hide-loader', 'hide-loader');
    }
    const filter = JSON.parse(JSON.stringify(filters));
    return this.http
      .post(this.config.envSettings['API_ENDPOINT_V2.1'] + 'inventory/search', filter, { headers: reqHeaders });
  }

  /**
   * This method is to get list of markets for geography filter
   * @param searchText
   * @param noLoader
   */
  public getGeographies(searchText, noLoader = true) {
    let reqHeaders;
    if (noLoader) {
      reqHeaders = new HttpHeaders().set('hide-loader', 'hide-loader');
    }
    return this.http
      .get(this.config.envSettings['API_ENDPOINT_V2.1'] + 'markets/search?q=' + searchText, { headers: reqHeaders }).pipe(
        map(response => {
          if (!response['markets']) {
            return {};
          }
          const geographyData = response['markets'].reduce(
            (geographies, geography) =>
              Object.assign(geographies, {
                [geography.type]: (geographies[geography.type] || []).concat(geography)
              }),
            {}
          );
          const keys = ['DMA', 'CBSA', 'County', 'Zip Codes'];
          const responseData = {};
          responseData['States'] = [];
          keys.forEach(key => {
            if (geographyData[key]) {
              responseData[key] = geographyData[key];
            }
          });
          return responseData;
        })
      );
  }

  /**
   * This method is to get list of markets based on type and search value
   * @param searchText search value
   * @param marketType Any one of CBSA, DMA, Zip Codes & County
   * @param noLoader
   */
  public getMarketsData(marketType: MarketType, searchText: string = '', page = 0, noLoader = true) {
    let reqHeaders;
    if (noLoader) {
      reqHeaders = new HttpHeaders().set('hide-loader', 'hide-loader');
    }
    let url = `${this.config.envSettings['API_ENDPOINT_V2.1']}markets/search`;
    if (searchText) {
      url = `${url}?q=${searchText}&type=${marketType}&page=${page}`;
    } else {
      url = `${url}?type=${marketType}&page=${page}`;
    }
    return this.http.get(url, { headers: reqHeaders });
  }

  /**
   * This method is to get list of markets based on type and search value
   * @param marketId Market ID
   * @param noLoader
   */
  public getMarketByID(marketId, noLoader = true) {
    let reqHeaders;
    if (noLoader) {
      reqHeaders = new HttpHeaders().set('hide-loader', 'hide-loader');
    }
    const url = `${this.config.envSettings['API_ENDPOINT_V2.1']}markets/${marketId}`;
    return this.http.get(url, { headers: reqHeaders });
  }

  // TODO: Need to implement original filter data
  getSpotIds(filters: Partial<SummaryRequest>, noLoader = false): Observable<any> {
    let reqHeaders;
    if (noLoader) {
      reqHeaders = new HttpHeaders().set('hide-loader', 'hide-loader');
    }
    const filter = JSON.parse(JSON.stringify(filters));
    delete filter['sort'];
    filter['page_size'] = 500001;
    return this.http.post(
      this.config.envSettings['API_ENDPOINT_V2.1'] + 'inventory/spot/id/search',
      filter,
      { headers: reqHeaders }
    );
  }

  /**
   *
   * @param frameId inventory search by frame id
   * @param noLoader Common loader no need by default
   */
  searchInventoryById(frameId, noLoader = true): Observable<any> {
    let reqHeaders;
    if (noLoader) {
      reqHeaders = new HttpHeaders().set('hide-loader', 'hide-loader');
    }
    const url = this.config.envSettings['API_ENDPOINT_V2.1'] +
      'inventory/' + frameId;
    return this.http
      .get(url, { headers: reqHeaders })
      .pipe(map((response: Inventory) => response));
  }
  getDataFromFile(filename = '') {
    return this.http.get('../../../assets/data/' + filename + '.json');
  }

  public prepareInventoryQuery(filters) {
    const query = {};
    let from = 0;
    const size = 100;
    if (filters['page']) {
      from = filters['page'] * size;
    }
    query['from'] = from;
    query['size'] = size;
    query['track_total_hits'] = true;
    if ([
      'region',
      'threshold',
      'target_geography',
      'operator_name_list',
      'media_type_list',
      'id_type',
      'id_list',
      'inventory_market_list',
      'construction_type_list',
      'orientation',
      'frame_width',
      'frame_height',
      'frame_media_name_list',
      'classification_type_list'].some(key => filters[key])) {
      const must = [];
      Object.keys(filters).map(key => {
        switch (key) {
          case 'operator_name_list':
            must.push({
              terms: {
                'representations.account.parent_account_name.keyword': filters['operator_name_list']
              }
            });
            break;
          case 'target_geography':
            let data = filters['target_geography'].split('DMA');
            if (data.length > 1) {
              data = data[1];
            } else {
              data = filters['target_geography'].split('CBSA')[1];
            }
            must.push({
              term: {
                'location.dma_id': {
                  value: data
                }
              }
            });
            break;
          case 'id_type':
            if (filters['id_type'] === 'spot_id') {
              must.push({
                terms: {
                  'layouts.faces.spots.id': filters['id_list']
                }
              });
            } else {
              must.push({
                terms: {
                  'layouts.faces.spots.plant_spot_id.keyword': filters['id_list']
                }
              });
            }
            break;
          case 'orientation':
            must.push({
              range: {
                'location.orientation': {
                  gte: filters['orientation']['min'],
                  lte: filters['orientation']['max']
                }
              }
            });
            break;
          case 'frame_width':
            must.push({
              range: {
                max_width: {
                  gte: filters['frame_width']['min'],
                  lte: filters['frame_width']['max']
                }
              }
            });
            break;
          case 'frame_height':
            must.push({
              range: {
                max_height: {
                  gte: filters['frame_height']['min'],
                  lte: filters['frame_height']['max']
                }
              }
            });
            break;
          case 'classification_type_list':
            if (filters['classification_type_list'].length > 0) {
              must.push({
                terms: {
                  'classification_type.name.keyword': filters['classification_type_list']
                }
              });
            }
            break;
          case 'frame_media_name_list':
            if (filters['frame_media_name_list'].length > 0) {
              must.push({
                terms: {
                  'media_name': filters['frame_media_name_list']
                }
              });
            }
            break;
          case 'construction_type_list':
            if (filters['construction_type_list'].length > 0) {
              must.push({
                terms: {
                  'construction.construction_type.name.keyword': filters['construction_type_list']
                }
              });
            }
            break;
          case 'inventory_market_list':
            const inventoryMarketQuery = this.formatInventoryMarketList(filters['inventory_market_list']);
            if (inventoryMarketQuery) {
              must.push(inventoryMarketQuery);
            }
            break;
        }
        if (must.length > 0) {
          query['query'] = { 'bool': { 'must': must } };
        }
      });
    }
    return query;
  }

  /**
   * This method will prepare the query for national wide data
   * @param query
   */
  public nationalLevelElasticQuery(query) {
    query['aggs'] = {};
    query['aggs']['states'] = {
      terms: {
        field: 'location.dma_id.keyword',
        size: IVENTORY_COUNT_LIMIT
      },
      aggs: {
        spot_count: {
          value_count: {
            field: 'layouts.faces.spots.id'
          }
        },
        center_lat: {
          avg: {
            script: {
              lang: 'painless',
              source: 'params._source["location"].geometry.coordinates[1]'
            }
          }
        },
        center_lon: {
          avg: {
            script: {
              lang: 'painless',
              source: 'params._source["location"].geometry.coordinates[0]'
            }
          }
        }
      }
    };
    return query;
  }

  addTotalQuery(query = {}) {
    if (!query['aggs']) {
      query['aggs'] = {};
    }
    const distinctAggs = {
      'cardinality': {
        'field': 'plant_frame_id'
      }
    };
    query['aggs']['total'] = distinctAggs;
    return query;
  }
  public addInventoryIdsQuery(query) {
    query['size'] = 0;
    if (!query['aggs']) {
      query['aggs'] = {};
    }
    query['aggs']['ids'] = {
      terms: {
        field: 'layouts.faces.spots.id',
        size: 10000
      }
    };
    return query;
  }

  private formatInventoryMarketList(data) {
    const session = JSON.parse(localStorage.getItem('savedExploreSession'));
    if (session['data'] && session['data']['location'] && session['data']['location']['selectedGeoLocation']) {
      switch (session['data']['location']['selectedGeoLocation']['type']) {
        case 'Zip Codes':
          return {
            term: {
              'location.zip_code': {
                value: data[0].split('ZIP')[1]
              }
            }
          };
          break;
        case 'States':
          return {
            match: {
              'location.state': {
                query: session['data']['location']['selectedGeoLocation']['name']
              }
            }
          };
          break;
        // case 'CBSA':
        // return  {
        //   term: {
        //     'location.cbsa':  {
        //       value: data.split('CBSA')[1]
        //     }
        //   }
        // };
        case 'DMA':
          return {
            term: {
              'location.dma_id': {
                value: data[0].split('DMA')[1]
              }
            }
          };
          break;
        case 'County':
          return {
            match: {
              'location.county_name': {
                query: session['data']['location']['selectedGeoLocation']['name'].split(',')[0].trim()
              }
            }
          };
          break;
        default:
          return false;
          break;
      }
    }
  }
  addTotalSpotQuery(query = {}) {
    if (!query['aggs']) {
      query['aggs'] = {};
    }
    const distinctAggs = {
      'spot_count': {
        'value_count': {
          'field': 'layouts.faces.spots.id'
        }
      }
    };
    query['aggs'] = distinctAggs;
    return query;
  }
  addTotalFramesQuery(query = {}) {
    if (!query['aggs']) {
      query['aggs'] = {};
    }
    const distinctAggs = {
      'frames_count': {
        'value_count': {
          'field': 'id'
        }
      }
    };
    query['aggs'] = distinctAggs;
    return query;
  }
  public addClassificationQuery(query = {}) {
    if (!query['aggs']) {
      query['aggs'] = {};
    }
    const aggregation = {
      'size': 0,
      'aggregations': {
        'classification': {
          'terms': {
            'field': 'classification_type.name.keyword',
            'size': 10000,
          },
          'aggregations': {
            'spot_count': {
              'value_count': {
                'field': 'layouts.faces.spots.id'
              }
            }
          }
        }
      }
    };
    query['aggs'] = aggregation.aggregations;
    return query;
  }
  public addMediaQuery(query = {}) {
    if (!query['aggs']) {
      query['aggs'] = {};
    }
    const aggregation = {
      'size': 0,
      'aggregations': {
        'spot_count': {
          'value_count': {
            'field': 'layouts.faces.spots.id'
          }
        },
        'isDigital': {
          'terms': {
            'field': 'digital',
            'size': 10000
          },
          'aggregations': {
            'spot_count': {
              'value_count': {
                'field': 'layouts.faces.spots.id'
              }
            }
          }
        },
        'constructions': {
          'terms': {
            'field': 'construction.construction_type.name.keyword',
            'size': 10000
          },
          'aggregations': {
            'spot_count': {
              'value_count': {
                'field': 'layouts.faces.spots.id'
              }
            },
            'mediaTypes': {
              'terms': {
                'field': 'media_type.name.keyword',
                'size': 10000
              },
              'aggregations': {
                'spot_count': {
                  'value_count': {
                    'field': 'layouts.faces.spots.id'
                  }
                },
                'isDigital': {
                  'terms': {
                    'field': 'digital',
                    'size': 10000
                  },
                  'aggregations': {
                    'spot_count': {
                      'value_count': {
                        'field': 'layouts.faces.spots.id'
                      }
                    },
                    'frames': {
                      'terms': {
                        'field': 'media_name',
                        'size': 10000
                      },
                      'aggregations': {
                        'spot_count': {
                          'value_count': {
                            'field': 'layouts.faces.spots.id'
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    };
    query['aggs'] = aggregation.aggregations;
    return query;
  }
  public addOperatorQuery(query = {}) {
    if (!query['aggs']) {
      query['aggs'] = {};
    }
    const aggregation = {
      'size': 0,
      'aggregations': {
        'operators': {
          'terms': { 'field': 'representations.account.parent_account_id', 'size': 10000 },
          'aggregations': {
            'spot_count': {
              'value_count': {
                'field': 'layouts.faces.spots.id'
              }
            },
            'ids': {
              'terms': { 'field': 'representations.account.parent_account_name.keyword', 'size': 10000 },
              'aggregations': {
                'spot_count': {
                  'value_count': {
                    'field': 'layouts.faces.spots.id'
                  }
                }
              }
            }
          }
        }
      }
    };
    query['aggs'] = aggregation.aggregations;
    return query;
  }

  /**
   * This method is to get inventory from elastic search
   * @param query filter query
   * @param noLoader
   */
  public getInventoryFromElasticSearch(query = {}, noLoader = true) {
    let reqHeaders;
    const url = `${this.config.envSettings['API_ENDPOINT']}inventory/search?site=${this.siteName}`;
    if (noLoader) {
      reqHeaders = new HttpHeaders().set('hide-loader', 'hide-loader');
    }
    return this.http.post(url, query, { headers: reqHeaders });
  }

  public getFilterDataElastic(noLoader = true, query) {
    // When need to reset the filter data, like when new filter is applied, set this.filtersFromAPI$ to null;

    const url = `${this.config.envSettings['API_ENDPOINT']}inventory/search?site=${this.siteName}`;
    let reqHeaders;
    if (noLoader) {
      reqHeaders = new HttpHeaders().set('hide-loader', 'hide-loader');
    }
    this.filtersFromAPI$ = this.http
      .post(url, query, { headers: reqHeaders })
      .pipe(map(res => res['aggregations']));
    return this.filtersFromAPI$;
  }
  
  public formatSpotElasticData(esData) {
    const inventory = [];
    if (esData && esData['hits'] && esData['hits']['hits']) {
      esData['hits']['hits'].map(hit => {
        hit['_source']['media_status'] = hit['_source']['status_type'];
        inventory.push(hit['_source']);
      });
    }
    return inventory;
  }

  getCustomDBSpotsCount(filtersData) {
    let query = this.prepareInventoryQuery(filtersData);
    query = this.addTotalSpotQuery(query);
    query['size'] = 0;
    return this.getInventoryFromElasticSearch(query)
      .pipe(map(res => {
        return res['aggregations']['spot_count']['value'];
      }));
  }
}

