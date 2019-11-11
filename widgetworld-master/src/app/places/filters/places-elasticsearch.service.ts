import { Injectable } from '@angular/core';
import { AppConfig } from '../../app-config.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ElasticSearchType } from '@interTypes/Place-audit-types';
const IVENTORY_COUNT_LIMIT = 10000;
@Injectable({
  providedIn: 'root'
})
export class PlacesElasticsearchService {
  constructor(
    private http: HttpClient,
    private config: AppConfig
  ) { }

  private sortMapping = {
    'place_name' : 'place_name.keyword',
    'place_type' : 'properties.top_category.keyword',
    'industry' : 'properties.naics_code.keyword',
    'count' : 'count',
    'location_name' : 'place_name.keyword',
    'street_address' : 'properties.address.street_address.keyword',
    'city' : 'properties.address.city.keyword',
    'state' : 'properties.address.state.keyword',
    'zip_code' : 'properties.address.zip_code.keyword'
  };

  /**
   * This function will connect the ElasticSearch and return the matches
   * @param query it should be vaild ElasticSearch query.
   * @param noLoader it should be true/false to control loader.
   * @returns it will return direct elastic search result.
   */

  getDataFromElasticSearch(query = {}, noLoader = false) {
    let reqHeaders = null;
    const url = this.config.envSettings['API_ENDPOINT'] + 'locations/places/search';
    if (noLoader) {
      reqHeaders = new HttpHeaders().set('hide-loader', 'hide-loader');
    }
    return this.http.post(url, query, {headers: reqHeaders});
  }
  getSinglePoi(placeId, noLoader = false) {
    const query = {
      'size': 1,
      'query': {
        'term': {
          'properties.ids.safegraph_place_id': placeId
        }
      }
    };
    let reqHeaders;
    const url = this.config.envSettings['API_ENDPOINT'] + 'locations/places/search';
    if (noLoader) {
      reqHeaders = new HttpHeaders().set('hide-loader', 'hide-loader');
    }
    return this.http.post(url, query, {headers: reqHeaders});
  }
  prepareElasticQuery(filters) {
    const query = {};
    let from = 0;
    const size = 100;
    if (filters['page']) {
      from = filters['page'] * size;
    }
    query['from'] = from;
    query['size'] = size;
    query['track_total_hits'] = true;
    if (filters['sort_by']) {
      const sort = {};
      sort[this.sortMapping[filters['sort_by']]] = filters['order_by'] === -1 ? 'desc' : 'asc';
      query['sort'] = [];
      query['sort'].push(sort);
    }
    if ([
      'place',
      'placeTypeList',
      'industriesList',
      'brandList',
      'address',
      'poiIds',
      'marketFilter'
    ].some(key => filters[key])) {
      const must = [];
      Object.keys(filters).map(key => {
        switch (key) {
          case 'place':
            const placeFilter = {
              'multi_match': {
                'query': filters['place'],
                'fields': [
                  'place_name',
                  'properties.top_category',
                  'properties.brands'
                ]
              }
            };
            must.push(placeFilter);
            break;
          case 'placeTypeList':
            must.push({
              terms: {
                'properties.sub_category.keyword': this.formatArrayFilters(filters['placeTypeList'])
              }
            });
            break;
          case 'industriesList':
            must.push({
              terms: {
                'properties.naics_code.keyword': this.formatArrayFilters(filters['industriesList'])
              }
            });
            break;
          case 'brandList':
            must.push({
              terms: {
                'properties.brands.keyword': this.formatArrayFilters(filters['brandList'])
              }
            });
            break;
          case 'placeNameList':
            must.push({
              terms: {
                'place_name.keyword': filters['placeNameList']
              }
            });
            break;
          case 'address':
            if (filters['address']) {
              if (filters['address']['distance']) {
                must.push({
                  geo_distance: {
                    distance : filters['address']['distance'] + 'mi',
                    'location.geo_point' : filters['address']['coordinates']
                  }
                });
              } else {
                must.push({
                  geo_shape: {
                    'location.polygon': {
                      shape: {
                        type: 'multipolygon',
                        coordinates: filters['address']['coordinates']
                      }
                    }
                  }
                });
              }
            }
            break;
          case 'marketFilter':
            if (filters['marketFilter']) {
              /**
               * For City, County, DMA the name contains states code at the end.So we are splitting and making
               * it as a seperate query to fetch accurate results
               */
              const values = filters['marketFilter']['name'].split(',');
              if (values[1]) {
                must.push({
                  match : {
                    'properties.address.state' : {
                      query : values[1].trim(),
                      operator : 'and'
                    }
                  }
                });
              }
              switch (filters['marketFilter']['type']) {
                case 'cbsa':
                  // TODO: We need to implement once we got index key name
                  break;
                case 'city':
                  must.push({
                    match : {
                      'properties.address.city' : {
                        query : values[0].trim(),
                        operator : 'and'
                      }
                    }
                  });
                  break;
                case 'county':
                  must.push({
                    match : {
                      'location.county_name' : {
                        query : values[0].trim(),
                        operator : 'and'
                      }
                    }
                  });
                  break;
                case 'dma':
                  must.push({
                    match : {
                      'location.DMA_name' : {
                        query : values[0].trim(),
                        operator : 'and'
                      }
                    }
                  });
                  break;
                case 'neighborhood':
                  // TODO: We need to implement once we got index key name
                  break;
                case 'state':
                  must.push({
                    match : {
                      'location.state_name' : {
                        query : filters['marketFilter']['name'],
                        operator : 'and'
                      }
                    }
                  });
                  break;
                case 'zipcode':
                  must.push({
                    term: {
                      'properties.address.zip_code.keyword': {
                        value: filters['marketFilter']['name']
                      }
                    }
                  });
                  break;
              }
            }
            break;
          case 'poiIds':
            must.push({
              terms: {
                'properties.ids.safegraph_place_id.keyword': filters['poiIds']
              }
            });
            break;
          default:
            break;
        }

        if (must.length > 0) {
          query['query'] = {'bool' : {'must': must}};
        }
      });
    }
    return query;
  }
  prepareElasticForAutocompleteQuery(text) {
    const query = {};
    const from = 0;
    const size = 15;
    query['from'] = from;
    query['size'] = size;
    query['track_total_hits'] = true;
    const must = [];
    const placeFilter = {
      'query_string': {
        'query': `*${text}*`,
        'fields': [
          'place_name^3',
          'properties.address.street_address',
          'properties.address.city',
          'properties.address.state',
          'properties.address.zip_code'
        ],
      }
    };
    must.push(placeFilter);
    if (must.length > 0) {
      query['query'] = {'bool' : {'must': must}};
    }
    query['_source'] = [
      'place_name',
      'properties.address.street_address',
      'properties.address.city',
      'properties.address.state',
      'properties.address.zip_code',
      'location.point'
    ];
    return query;
  }
  addGroupedPlacesQueries(query = {}) {
    query['_source'] = ['place_name', 'properties.top_category' , 'properties.sub_category', 'properties.naics_code'];
    query['collapse'] = {
      'field' : 'place_name.keyword',
      'inner_hits': {
        'name': 'subPlaces',
        'size': 0
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
        'field': 'place_name.keyword'
      }
    };
    query['aggs']['total'] = distinctAggs;
    return query;
  }
  addSGIDsAgg(query = {}) {
    if (!query['aggs']) {
      query['aggs'] = {};
    }
    query['aggs']['safegraphIds'] = {
      terms: {
        field: 'properties.ids.safegraph_place_id.keyword',
        size: IVENTORY_COUNT_LIMIT
      }
    };
    return query;
  }
  public getFilterOptions(query = {}) {
    query['aggs'] = {};
    query['aggs'] =  {
      topCategories: {
        terms: {
          field: 'properties.top_category.keyword',
          size: IVENTORY_COUNT_LIMIT
        },
        aggs: {
          subCategories: {
            terms: {
              field: 'properties.sub_category.keyword',
              size: IVENTORY_COUNT_LIMIT
            }
          }
        }
      },
      brands: {
        terms: {
          field: 'properties.brands.keyword',
          size: IVENTORY_COUNT_LIMIT
        }
      },
      industries: {
        terms: {
          field: 'properties.sub_category.keyword',
          size: IVENTORY_COUNT_LIMIT
        },
        aggs: {
          ids: {
            terms: {
              field: 'properties.naics_code.keyword',
              size: IVENTORY_COUNT_LIMIT
            }
          }
        }
      }
    };
    return query;
  }

  public getNationalLevelData(query = {}, type = 'state') {
    query['aggs'] = {};
    if (type === 'state') {
      query['aggs']['states'] = {
        terms: {
          field: 'location.state_name.keyword',
          size: IVENTORY_COUNT_LIMIT
        },
        aggs: {
          center_lat: {
            avg: {
              script: {
                lang: 'painless',
                source: 'params._source["location"].point.coordinates[1]'
              }
            }
          },
          center_lon: {
            avg: {
              script: {
                lang: 'painless',
                source: 'params._source["location"].point.coordinates[0]'
              }
            }
          }
        }
      };
    }
    if (type === 'geohash5') {
      query['aggs']['geohash5'] = {
        geohash_grid: {
          field: 'location.geo_point',
          precision: 5
        }
      };
    }
    if (type === 'geohash6') {
      query['aggs']['geohash6'] = {
        geohash_grid: {
          field: 'location.geo_point',
          precision: 6
        }
      };
    }
    if (type === 'safegraphIds') {
      query['aggs']['safegraphIds'] = {
        terms: {
          field: 'properties.ids.safegraph_place_id.keyword',
          size: IVENTORY_COUNT_LIMIT
        }
      };
    }
    /* query['aggs'] =  {
      states: {
          terms: {
            field: 'location.state_name.keyword',
            size: IVENTORY_COUNT_LIMIT
          },
          aggs: {
            center_lat: {
              avg: {
                script: {
                  lang: 'painless',
                  source: 'params._source["location"].point.coordinates[1]'
                }
              }
            },
            center_lon: {
              avg: {
                script: {
                  lang: 'painless',
                  source: 'params._source["location"].point.coordinates[0]'
                }
              }
            }
          }
      },
      safegraphIds: {
        terms: {
          field: 'properties.ids.safegraph_place_id.keyword',
          size: IVENTORY_COUNT_LIMIT
        }
      },
      geohash5: {
        geohash_grid: {
          field: 'location.geo_point',
          precision: 5
        }
      },
      geohash6: {
        geohash_grid: {
          field: 'location.geo_point',
          precision: 6
        }
      }
    }; */
    return query;
  }

  public formSelectedPlacesQuery(query, filterData) {
    if (filterData['placeNames']) {
      const placeNames = filterData['placeNames'];
      let filterOp = 'must_not';
      let filterKey = 'place_name.keyword';
      if (filterData['selectedStage'] && filterData['selectedStage'] === 'selected') {
        filterOp = 'must';
      }
      if (filterData['resultType'] && filterData['resultType'] === 'single') {
        filterKey = 'properties.ids.safegraph_place_id.keyword';
      }
      query['query']['bool'][filterOp] = {terms: {}};
      query['query']['bool'][filterOp]['terms'][filterKey] = placeNames;
    }
    if (filterData['noOfPlaces']) {
      query['size'] = filterData['noOfPlaces'];
    }
    return query;
  }
  formatLocationData(hits) {
    const places = [];
    hits.map(hit => {
      const temp = {};
      if (hit['_source']) {
        temp['place_name'] = hit['_source']['place_name'];
        temp['place_type'] = hit['_source']['properties']['top_category'];
        temp['industry'] = hit['_source']['properties']['naics_code'];
      }
      if (hit['inner_hits']
          && hit['inner_hits']['subPlaces']
          && hit['inner_hits']['subPlaces']['hits']
          && hit['inner_hits']['subPlaces']['hits']['total']) {
        temp['count'] = hit['inner_hits']['subPlaces']['hits']['total']['value'];
      }
      places.push(temp);
    });
    return places;
  }
  formatPlaceDetails(responseData) {
    const res = {};
    if (responseData['hits'] && responseData['hits']['total']) {
      res['summary'] = {
        'number_of_places': responseData['hits']['total']['value'],
        'avg_weekly_traffic': 0,
        'avg_weekly_unique_visits': 0
      };
    }
    if (responseData['hits'] && responseData['hits']['hits']) {
      res['places'] = this.formatPlacesData(responseData['hits']['hits']);
    }
    res['sortKey'] = [
      {
        'field_name': 'Place Name',
        'key': 'location_name'
      },
      {
        'field_name': 'Address',
        'key': 'street_address'
      },
      {
        'field_name': 'City',
        'key': 'city'
      },
      {
        'field_name': 'State',
        'key': 'state'
      },
      {
        'field_name': 'Zip',
        'key': 'zip_code'
      }
    ];
    return res;
  }
  formatPlacesData(hits) {
    const places = [];
    hits.map(hit => {
      let temp = {};
      if (hit['_source']) {
        temp = hit['_source']['properties'];
        temp['location'] = hit['_source']['location'];
        temp['location_name'] = hit['_source']['place_name'];
      }
      places.push(temp);
    });
    return places;
  }
  formatArrayFilters(filters = []) {
    const filtersData = filters.map(p => {
      if (p === 'Others') {
        return '';
      }
      return p;
    });
    return filtersData;
  }
  public getAllSGids(query = {}) {
    query['_source'] = ['properties.ids.safegraph_place_id'];
    return query;
  }
  /**
   *
   * @param type  safegraphId | hereID | placeName
   * @param searchValue
   * @param noLoader if true not showing common loader
   */
  public filterPlaces(type: ElasticSearchType, searchValue, noLoader = false) {
    const query = {
      'size': 100,
      'query': {}
    };
    switch (type) {
      case 'safegraphId':
        query['query'] = {
          'wildcard': {
            'properties.ids.safegraph_place_id': {
              'value': `*${searchValue}*`
            }
          }
        };
      break;
      case 'hereID':
        query['query'] = {
          'wildcard': {
            'properties.ids.here_place_id': {
              'value': `*${searchValue}*`
            }
          }
        };
      break;
      case 'placeName':
        query['query'] = {
          'query_string': {
            'query': `*${searchValue}*`,
            'fields': ['place_name']
          }
        };
      break;
    }
    let reqHeaders;
    const url = this.config.envSettings['API_ENDPOINT'] + 'locations/places/search';
    if (noLoader) {
      reqHeaders = new HttpHeaders().set('hide-loader', 'hide-loader');
    }
    return this.http.post(url, query, {headers: reqHeaders});
  }
}
