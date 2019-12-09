// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
  production: false,
  api_url: 'http://anet-api-timesheet.agiratech.com/',
  Quarters: [
    {
      'key' : 'Quarter1',
      'value' :  'Quarter1 (April - June)'
    },
    {
      'key': 'Quarter2',
      'value': 'Quarter2 (July - September)'
    },
    {
      'key': 'Quarter3',
      'value': 'Quarter3 (October - December)'
    },
    {
      'key': 'Quarter4',
      'value': 'Quarter4 (January - March)'
    }
  ],
  Half_yearly: [
    {
      'key': 'First Half',
      'value': 'First Half (April - September)'
    },
    {
      'key': 'Second Half',
      'value': 'Second Half (October - March)'
    }
  ],
  Yearly: [
    {
      'key': 'Full Year',
      'value': 'Full Year (April - March)'
    }
  ],
  Month: [
    {
      'key' : 'April',
      'value' : 'April'
    }, {
      'key' : 'May',
      'value' : 'May'
    }, {
      'key' : 'June',
      'value' : 'June'
    }, {
      'key' : 'July',
      'value' : 'July'
    }, {
      'key' : 'August',
      'value' : 'August'
    }, {
      'key' : 'September',
      'value' : 'September'
    }, {
      'key' : 'October',
      'value' : 'October'
    }, {
      'key' : 'November',
      'value' : 'November'
    }, {
      'key' : 'December',
      'value' : 'December'
    }, {
      'key' : 'January',
      'value' : 'January'
    },
    {
      'key' : 'Feburary',
      'value' : 'Feburary'
    }, {
      'key' : 'March',
      'value' : 'March'
    }
  ]
};
