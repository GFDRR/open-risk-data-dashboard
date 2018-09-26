# Open Data for Resilience Index • Front-end


# Install the project

In WebStorm, open the `Console` menu, or open a command line shell.

```bash
$ git clone git@github.com:GFDRR/open-risk-data-dashboard.git
$ cd frontend
$ npm install --global bower
$ npm install
```

## Configure to work locally

## Start working

```bash
$ npm start
```

Web server will be available at http://localhost:4000/ and changes will be taken in account immediatly.

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
