// Protractor configuration file, see link for more information
// https://github.com/angular/protractor/blob/master/lib/config.ts

const { SpecReporter } = require('jasmine-spec-reporter');
// var browserstack = require('browserstack-local');

exports.config = {
  allScriptsTimeout: 2000000,
  seleniumAddress: 'http://hub-cloud.browserstack.com/wd/hub',
  suites: {
    login: './e2e/login/*.e2e-spec.ts',
    userAgreement: './e2e/user-agreement/*.e2e-spec.ts',
    explore: './e2e/explore/define-filters/*.e2e-spec.ts',
    placeLayersFilter: './e2e/places/layers-display-option.e2e-spec.ts',
    baileyPlacesFlow: './e2e/user-flows/places-flow.e2e-spec.ts',
    myPlace: './e2e/places/my-place-tab.e2e-spec.ts',
    placesCsvUpload: './e2e/places/places-upload-csv.e2e-spec.ts',
    // explore: './e2e/explore/explore-layers/*.e2e-spec.ts',
    // exploreAction: './e2e/explore/explore-actions/*.e2e-spec.ts',
    // explore: './e2e/explore/*.e2e-spec.ts',
    // exploreFilter: './e2e/explore/explore-filters/*.e2e-spec.ts',
    // exploreMetrics: './e2e/explore/explore-metrics/*.e2e-spec.ts',
    // exploreTabular: './e2e/explore/explore-tabular-panels/*.e2e-spec.ts',
    // map: './e2e/explore/map/*.e2e-spec.ts',
    // projectsHome: './e2e/workspace/projects/project-start.e2e-spec.ts',
    // projectCreate: './e2e/workspace/projects/create-project.e2e-spec.ts',
    // projectsList: './e2e/workspace/projects/projects-list.e2e-spec.ts',
    // scenarioCreate: './e2e/workspace/scenarios/create-scenario.e2e-spec.ts',
    // scenarioView: './e2e/workspace/scenarios/scenario-view.e2e-spec.ts', 
    // projectView: './e2e/workspace/projects/project-view.e2e-spec.ts', 
    // workSpace: './e2e/workspace/projects/*.e2e-spec.ts',
    // logout: './e2e/logout/*.e2e-spec.ts'
    // places: './e2e/places/*.e2e-spec.ts'
    logout: './e2e/logout/*.e2e-spec.ts',
    // placesSearch: './e2e/places-search/places-search.e2e-spec.ts'
  },
  //specs: [
    //'./e2e/**/*.e2e-spec.ts'
  //],
  capabilities: {
    'chromeOptions': {
      'args': ['--ignore-gpu-blacklist']
    },
    'browserName': 'chrome',
    'version': 68,
    'os': 'windows',
    'os_version': '8.1',
    'browserstack.debug': 'true',
    'browserstack.networkLogs': 'true',
    'browserstack.local' : 'true',
    'browserstack.user' : 'jagadeeshrampati2',
    'browserstack.key' : 'umh86payoMbgkDy8gXWC',
   
  },
  directConnect: false,
  // baseUrl: 'https://gp.intermx.io',
  restartBrowserBetweenTests: false,
  baseUrl: 'http://localhost:4200',
  framework: 'jasmine',
  jasmineNodeOpts: {
    showColors: true,
    defaultTimeoutInterval: 1000000,
    browserNoActivityTimeout: 300000,               
    print: function() {}
  },
  /* beforeLaunch: function(){
    return new Promise(function(resolve, reject){
        exports.bs_local = new browserstack.Local();
        exports.bs_local.start({'key': exports.config.capabilities['browserstack.key'] }, function(error) {
            if (error) return reject(error);
            resolve();
        });
    });
  },
  // Code to stop browserstack local after end of test
  afterLaunch: function(){
    return new Promise(function(resolve, reject){
        exports.bs_local.stop(resolve);
    });
  }, */
  onPrepare() {
    require('ts-node').register({
      project: 'e2e/tsconfig.e2e.json'
    });
    browser.driver.manage().window().maximize();
    jasmine.getEnv().addReporter(new SpecReporter({ spec: { displayStacktrace: true } }));
    browser.driver.manage().timeouts().setScriptTimeout(1000000);
  }
};
