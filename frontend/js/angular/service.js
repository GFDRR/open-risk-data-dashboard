/**
 * Created by Manuel on 15/05/2017.
 */

RodiApp.service("RodiSrv", ['$http', function($http, $rootScope, $scope)
{

    this.getMapScores = function(filters)
    {

        /*
            Return
            Object key, value -> ]
            Key -> country code
            Value: {value: 0.5}
            ex: {IT: object, AR: object}

            Params "filters": filters list
             {
                 "filterRiverFlood": "",
                 "filterEarthquake": "active",
                 "filterVolcano": "",
                 "filterCyclone": "",
                 "filterCoastalFlood": "",
                 "filterWaterScarsity": "active",
                 "filterLandSlide": "",
                 "filterTsunami": ""
             }
         */

        var states = ["IT", "AR", "AU"];

        var dataTemp = {};

        angular.forEach(states, function (state, key) {
            dataTemp[state] = {value: Math.random()}
        });

        dataTemp['filters'] = {value: filters};

        return dataTemp;

    };

    this.getNewsList = function(number)
    {
      var objNews = [
          {
              "id": "n001",
              "title":"TITOLO DELLA NEWS",
              "dataIns": "01/01/2017",
              "img": "img/template/test_news_image.jpg",
              "desc": "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
          },
          {
              "id": "n002",
              "title":"TITOLO DELLA NEWS",
              "dataIns": "01/01/2017",
              "img": "img/template/test_news_image.jpg",
              "desc": "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
          },
          {
              "id": "n003",
              "title":"TITOLO DELLA NEWS",
              "dataIns": "01/01/2017",
              "img": "img/template/test_news_image.jpg",
              "desc": "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
          },
          {
              "id": "n004",
              "title":"TITOLO DELLA NEWS",
              "dataIns": "01/01/2017",
              "img": "img/template/test_news_image.jpg",
              "desc": "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
          },
      ];

      return objNews;

    };

    this.getNewsDetails = function(idnews)
    {

        // In realtà possiamo utilizzare la getNewsList con $filter

        var objNews =
            {
                "id": "n002",
                "title": "Title of news number two",
                "InsDate": "25/05/2017",
                "text": "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
                "img": "img/template/test_news_image.jpg"
            };

        return objNews;
    };

    this.getCountryList = function()
    // Return the list of country Available
    {

        // Return country list

        var objCountry = [{code:"IT", desc:"Italy"}, {code:"AR", desc:"Argentina"}, {code:"AU", desc:"Australia"}];
        return objCountry;
    };

    this.getMatrixData = function(filters)
    {

        /*
            Return Matrix Strucutre (page countries)
            Array of Object

            h0X -> Category of Dataset (Hazard Info, Exposure, etc..)

        */
        var dataTemp = [];

        dataTemp = [
            {
                "code":"IT",
                "name": "Italy",

                "dataValue":
                    {
                        "h01": 0.1,
                        "h02": 0.2,
                        "h03": 0.3,
                        "h04": 0.4,
                        "h05": 0.5
                    }
            },
            {
                "code":"AR",
                "name": "Argentina",
                "dataValue":
                    {
                        "h01": 0.1,
                        "h02": 0.2,
                        "h03": 0.3,
                        "h04": 0.4,
                        "h05": 0.5
                    }
            },
            {
                "code":"AU",
                "name": "Australia",
                "dataValue":
                    {
                        "h01": 0.1,
                        "h02": 0.2,
                        "h03": 0.3,
                        "h04": 0.4,
                        "h05": 0.5
                    }
            }
        ];

        return dataTemp;
    }

    this.getCountryDetails = function(idcountry)
    {
        var countryData = [
            {
                "code": "IT",
                "desc": "Italy",
                "text": "IT Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
                "img": "img/template/test_news_image.jpg",
                "haz_index": {
                    "h01":["description hazard 01", "95"],
                    "h02":["description hazard 02", "75"],
                    "h03":["description hazard 03", "80"],
                    "h04":["description hazard 04", "65"],
                    "h05":["description hazard 05", "10"]
                },
                "matrixData": {
                    // questionKey: ["questionkey", "description", valueH01, valueH02, valueH03, valueH04, valueH05, valueH06, valueH07, valueH08]
                    q01: ["q01", 0.1, 0.2, 0.3, 0.4, 0.5],
                    q02: ["q02", 0.6, 0.7, 0.8, 0.9, 1.0],
                    q03: ["q03", 0.1, 0.2, 0.3, 0.4, 0.5],
                    q04: ["q04", 0.6, 0.7, 0.8, 0.9, 1.0],
                    q05: ["q05", 0.1, 0.2, 0.3, 0.4, 0.5],
                    q06: ["q06", 0.6, 0.7, 0.8, 0.9, 1.0],
                    q07: ["q07", 0.1, 0.2, 0.3, 0.4, 0.5],
                    q08: ["q08", 0.6, 0.7, 0.8, 0.9, 1.0],
                    q09: ["q09", 0.1, 0.2, 0.3, 0.4, 0.5],
                    q10: ["q10", 0.6, 0.7, 0.8, 0.9, 1.0]
                }
            },
            {
                "code": "AU",
                "desc": "Australian",
                "text": "AU Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
                "img": "img/template/test_news_image.jpg",
                "haz_index": {
                    "h01":["description hazard 01", "95"],
                    "h02":["description hazard 02", "75"],
                    "h03":["description hazard 03", "80"],
                    "h04":["description hazard 04", "65"],
                    "h05":["description hazard 05", "10"]
                },
                "matrixData": {
                    // "questionKey": ["description", valueH01, valueH02, valueH03, valueH04, valueH05, valueH06, valueH07, valueH08]
                    q01: ["q01", 0.1, 0.2, 0.3, 0.4, 0.5],
                    q02: ["q02", 0.6, 0.7, 0.8, 0.9, 1.0],
                    q03: ["q03", 0.1, 0.2, 0.3, 0.4, 0.5],
                    q04: ["q04", 0.6, 0.7, 0.8, 0.9, 1.0],
                    q05: ["q05", 0.1, 0.2, 0.3, 0.4, 0.5],
                    q06: ["q06", 0.6, 0.7, 0.8, 0.9, 1.0],
                    q07: ["q07", 0.1, 0.2, 0.3, 0.4, 0.5],
                    q08: ["q08", 0.6, 0.7, 0.8, 0.9, 1.0],
                    q09: ["q09", 0.1, 0.2, 0.3, 0.4, 0.5],
                    q10: ["q10", 0.6, 0.7, 0.8, 0.9, 1.0]
                }
            },
            {
                "code": "AR",
                "desc": "Argentina",
                "text": "AR Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
                "img": "img/template/test_news_image.jpg",
                "haz_index": {
                    "h01":["description hazard 01", "95"],
                    "h02":["description hazard 02", "75"],
                    "h03":["description hazard 03", "80"],
                    "h04":["description hazard 04", "65"],
                    "h05":["description hazard 05", "10"]
                },
                "matrixData": {
                    // "questionKey": ["description", valueH01, valueH02, valueH03, valueH04, valueH05, valueH06, valueH07, valueH08]
                    q01: ["q01", 0.1, 0.2, 0.3, 0.4, 0.5],
                    q02: ["q02", 0.6, 0.7, 0.8, 0.9, 1.0],
                    q03: ["q03", 0.1, 0.2, 0.3, 0.4, 0.5],
                    q04: ["q04", 0.6, 0.7, 0.8, 0.9, 1.0],
                    q05: ["q05", 0.1, 0.2, 0.3, 0.4, 0.5],
                    q06: ["q06", 0.6, 0.7, 0.8, 0.9, 1.0],
                    q07: ["q07", 0.1, 0.2, 0.3, 0.4, 0.5],
                    q08: ["q08", 0.6, 0.7, 0.8, 0.9, 1.0],
                    q09: ["q09", 0.1, 0.2, 0.3, 0.4, 0.5],
                    q10: ["q10", 0.6, 0.7, 0.8, 0.9, 1.0]
                }
            }
        ];

        return countryData;

    };

    this.getDatasetClassification = function()
    {
        /*
         Return the list of Dataset classification

         */
        var obj =
            [
                {
                    code:"DEM",
                    desc: "Digital Elevation Model",
                    hazard_category: "h01",
                    level:{
                        liv1: {desc:"SRTM Digital Elevation Model (DEM)", scale:"90m", value:"1"},
                        liv2: {desc:"LiDAR Digital Elevation Model (DEM)", scale:"1-10m", value:"2"},
                        liv3: {desc:"LiDAR Digital Elevation Model (DEM)", scale:"0.1-1m", value:"3"},
                    }
                },
                {
                    code:"AI",
                    desc: "Aerial Imagery",
                    hazard_category: "h01",
                    level:{
                        liv1: {desc:"Imagery as base layer", scale:"1-100m", value:"2"},
                        liv2: {desc:"Imagery as base layer", scale:"0.1-1m", value:"3"}
                    }
                },
                {
                    code:"TT",
                    desc: "Test category no scale definition",
                    hazard_category: "h01",
                    level: {}
                },
                {
                    code:"FLO",
                    desc: "Flooding",
                    hazard_category: "h03",
                    level:{
                        liv1: {desc:"water depth for return periods 2, 5, 10, 20, 50, 100, 200, 500, 1000 yrs", scale:"1Km", value:"1"},
                        liv2: {desc:"water depth, duration for return periods 2, 5, 10, 20, 50, 100, 200, 500, 1000 yrs", scale:"100m", value:"2"},
                        liv3: {desc:"water depth, duration and flow velocity for return periods 2, 5, 10, 20, 50, 100, 200, 500, 1000 yrs", scale:"10m", value:"3"},
                    }
                },
            ];

        return obj;
    }

    this.matrixColorCell = function(value){

        var numberFloat = parseFloat(value);
        return "background-color: rgb(255," + parseInt((1 - numberFloat) * 255) + "," + parseInt((1 - numberFloat) * 255) + ");"
    };

    this.getHazardList = function()
        // Return the list of country Available
    {

        // Return country list

        var objHazard = [
            {code:"RF", desc:"River Flood"},
            {code:"EQ", desc:"Earthquake"},
            {code:"VO", desc:"Volcano"},
            {code:"CY", desc:"Cyclone"},
            {code:"CF", desc:"Coastal Flood"},
            {code:"WS", desc:"Water Scarsity"},
            {code:"LS", desc:"Landslide"},
            {code:"TS", desc:"Tsunami"}
            ];
        return objHazard;
    };

    this.getHazardCategory = function()
    {
        return objDataTimeElement = {
            "dataType_index": {
                dt01:["h01", "Base data", "icon-base_data"],
                dt02:["h02", "Exposure", "icon-exposure"],
                dt03:["h03", "Hazard info", "icon-hazard_info"],
                dt04:["h04", "Vulnerability", "icon-vulnerability"],
                dt05:["h05", "Risk info", "icon-info"]
            },
        }
    };

    this.getQuestions = function()
    {
        /*
            Return the list of questions for dataset (Y/N)
         */

        return objQuestions = [
                {code: "q01", desc:"Does the data exist?", type: "yn"},
                {code: "q02", desc:"Is data in digital form?", type: "yn"},
                {code: "q03", desc:"Is the data available online?", type: "yn"},
                {code: "q04", desc:"Is the metadata available online?", type: "yn"},
                {code: "q05", desc:"Available in bulk?", type: "yn"},
                {code: "q06", desc:"Is the data machine- readable?", type: "yn"},
                {code: "q07", desc:"Publicly available?", type: "yn"},
                {code: "q08", desc:"Is the data available for free?", type: "yn"},
                {code: "q09", desc:"Openly licensed?", type: "yn"},
                {code: "q10", desc:"Is the data provided on a timely and up to date basis?", type: "yn"},
                {code: "q11", desc:"Resolution/scale of methodology", type: "ddl_filter"},
                {code: "q12", desc:"URL Metadata", type: "link"},
                {code: "q13", desc:"URL Data set", type: "link"}
        ]
    };

    this.getDatasetEmptyStructure = function()
    {
        /*
         return a Dataset list structure empty for new dataset contributor.

         obj =
         {
         "code": "",
         "name": "",
         "abstract": "",
         "dataset_type": "",
         "resolution": "",
         "country": "--",
         "hazard_category": "--",
         hazard: "",
         "usr_ins": "",
         "data_ins": "",
         "status": "0",
         "data_validate": "",
         "questions":
         {
         "questioncode": "",
         "questioncode": "",
         "questioncode": "",
         ...
         },
         "link_dataset": "",
         "link_metadata": ""
         }
         */

        return obj = {
            code: "",
            name: "",
            abstract: "",
            dataset_type: "--",
            resolution: "--",
            country: "--",
            hazard_category: "--",
            hazard: "--",
            usr_ins: "",
            data_ins: "",
            status: "0",
            data_validate: "",
            questions:
            {
                "code01": "",
                "code02": "",
                "code03": "",
                "code04": ""
            },
            link_dataset: "",
            link_metadata: ""
            }

    }

    this.getDatasetList = function(countryCode)
    {
        /*
            return a Dataset list for country.
            param.: country code (ex: IT)

            obj = [
            {
                "code": "datasetcode",
                "country": "country code",
                "hazard_category": "hazard category code",
                "usr_ins": "user name insert",
                "data_ins": "datatime insert",
                "status": "0 or 1", -> 0: not validate | 1: validate
                "data_validate": "datatime validation",
                "questions":
                {
                    "questioncode": "value", -> value = Yes, No or not available
                    "questioncode": "value",
                    "questioncode": "value",
                    ...
                },
                "link_dataset": "link text",
                "link_metadata": "link text"
            },
             {
                 "code": "datasetcode",
                 "country": "country code",
                 "hazard_category": "hazard category code",
                 "usr_ins": "user name insert",
                 "data_ins": "datatime insert",
                 "status": "0 or 1", -> 0: not validate | 1: validate
                 "data_validate": "datatime validation",
                 "questions":
                 {
                 "questioncode": "value", -> value = Yes, No or not available
                 "questioncode": "value",
                 "questioncode": "value",
                 ...
                 },
                 "link_dataset": "link text",
                 "link_metadata": "link text"
             },
             ...
            ]

        */

    }

    this.saveDataset = function(obj)
    {
        return true;
    }

    /* LOGIN services */

    this.checkLogin = function(usr, psw)
    {
    /*    Check if login is correct, if so set the local cookies
        Return KO if login is incorrect or User Datails
        Object
         {
            status: "OK",
            usr_name: "user name - login"
            name: "name",
            surname: "surname",
            email: "mail@domain.dom",
            level: "0" -> 0: admin | 1: Reviewer | 2: Registered user | 3: guest user (not registered)
         }
    */

    if(usr == 'cima')
    {
        return {status: "OK", usr_name:"cima", name: "NameTest", surname: "surnameTest", email:"manuel.cavallaro@cimafoundation.org", level: 0}

    }
    else
        {
            return {status: "KO", usr_name:"", name: "", surname: "", email:"", level: 3}
        }

    }

    this.setPageIndex = function(strpath)
    {
        if(strpath.indexOf('index.html') != -1){return "0"};
        if(strpath.indexOf('contribute.html') != -1){return "1"};
        if(strpath.indexOf('methodology.html') != -1){return "2"};
        if(strpath.indexOf('browse-data.html') != -1){return "3"};
        if(strpath.indexOf('register.html') != -1){return "4"};
        if(strpath.indexOf('country-details.html') != -1){return "5"};
        if(strpath.indexOf('dataset_details.html') != -1){return "6"};
        if(strpath.indexOf('news-details.html') != -1){return "7"};

        return "0";


    }

    this.sendFeedback = function(obj)
    {
        /*
        send user feedback (only registred user)
        obj =
        {
            userid: "user name",
            page: "ex: index.html",
            text: "message of feedback",
            data: "01/06/2017"
        }
         */
        console.log(obj);
        return true;
    }

}]);
