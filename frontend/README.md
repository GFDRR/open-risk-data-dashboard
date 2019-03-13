# Open Data for Resilience Index • Front-end [![Build Status](https://travis-ci.com/GFDRR/open-risk-data-dashboard.svg?branch=master)](https://travis-ci.com/GFDRR/open-risk-data-dashboard)


# Install the project

In WebStorm, open the `Console` menu, or open a command line shell.

```bash
$ git clone git@github.com:GFDRR/open-risk-data-dashboard.git
$ cd frontend
$ npm install
```

## Configure to work locally

## Start working

```bash
$ npm start
```

Web server will be available at http://localhost:4000/ and changes will be taken into account immediatly.

# Third-party dependencies

## Bower Components

In WebStorm, open the `Bower Components` menu, or open a command line shell.

```bash
# To install a single component at a specific version
$ bower install angular@1.6 --save

# To update a compontent to a latest version (according to bower.json)
$ bower update angular

# To update all the components to their latest version (according to bower.json)
$ bower update
```

# Deployment

| Environment       | Branch    | URL
| ---               | ---       | ---
| production        | `master`  | `https://index.opendri.org`
| development       | `master`  | `https://dev.riskopendata.org`

## Automatic deployment

Any release tagged with the following format `fe_YYYYMMDD` will automatically deploy on production.

To create a release on github https://github.com/GFDRR/open-risk-data-dashboard/releases

