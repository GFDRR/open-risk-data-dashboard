/**
 * Created by Manuel on 15/05/2017.
 */

RodiApp.service("RodiSrv", ['$http', '$filter', function($http, $filter)
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

    this.getCountryList = function(onSuccess, onError)
    // Return the list of country Available
    {

        // Return country list
        $http({
            method: 'GET',
            url: baseAPIurl + 'country/'
        }).then(function (data) {
            if(onSuccess) onSuccess(data.data)
        },function(data){
            if(onError)onError(data)
        });



        // var objCountry = [{code:"IT", desc:"Italy"}, {code:"AR", desc:"Argentina"}, {code:"AU", desc:"Australia"}];
        // return objCountry;
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
                    q02: ["is_digital_form", 0.6, 0.7, 0.8, 0.9, 1.0],
                    q03: ["q03", 0.1, 0.2, 0.3, 0.4, 0.5],
                    q04: ["q04", 0.6, 0.7, 0.8, 0.9, 1.0],
                    q05: ["is_bulk_avail", 0.1, 0.2, 0.3, 0.4, 0.5],
                    q06: ["is_machine_read", 0.6, 0.7, 0.8, 0.9, 1.0],
                    q07: ["is_pub_available", 0.1, 0.2, 0.3, 0.4, 0.5],
                    q08: ["is_avail_for_free", 0.6, 0.7, 0.8, 0.9, 1.0],
                    q09: ["is_open_licence", 0.1, 0.2, 0.3, 0.4, 0.5],
                    q10: ["is_prov_timely", 0.6, 0.7, 0.8, 0.9, 1.0]
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
                    q02: ["is_digital_form", 0.6, 0.7, 0.8, 0.9, 1.0],
                    q03: ["q03", 0.1, 0.2, 0.3, 0.4, 0.5],
                    q04: ["q04", 0.6, 0.7, 0.8, 0.9, 1.0],
                    q05: ["is_bulk_avail", 0.1, 0.2, 0.3, 0.4, 0.5],
                    q06: ["is_machine_read", 0.6, 0.7, 0.8, 0.9, 1.0],
                    q07: ["is_pub_available", 0.1, 0.2, 0.3, 0.4, 0.5],
                    q08: ["is_avail_for_free", 0.6, 0.7, 0.8, 0.9, 1.0],
                    q09: ["is_open_licence", 0.1, 0.2, 0.3, 0.4, 0.5],
                    q10: ["is_prov_timely", 0.6, 0.7, 0.8, 0.9, 1.0]
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
                    q02: ["is_digital_form", 0.6, 0.7, 0.8, 0.9, 1.0],
                    q03: ["q03", 0.1, 0.2, 0.3, 0.4, 0.5],
                    q04: ["q04", 0.6, 0.7, 0.8, 0.9, 1.0],
                    q05: ["is_bulk_avail", 0.1, 0.2, 0.3, 0.4, 0.5],
                    q06: ["is_machine_read", 0.6, 0.7, 0.8, 0.9, 1.0],
                    q07: ["is_pub_available", 0.1, 0.2, 0.3, 0.4, 0.5],
                    q08: ["is_avail_for_free", 0.6, 0.7, 0.8, 0.9, 1.0],
                    q09: ["is_open_licence", 0.1, 0.2, 0.3, 0.4, 0.5],
                    q10: ["is_prov_timely", 0.6, 0.7, 0.8, 0.9, 1.0]
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

    this.getDatasetClassificationResolution = function(classificationCode)
    {
        // Return the level structure of classificationCode object
        var obj =
            {
                code:"AI",
                level:{
                    // liv1: {desc:"Imagery as base layer", scale:"1-100m", value:"2"},
                    // liv2: {desc:"Imagery as base layer", scale:"0.1-1m", value:"3"}
                }
            }

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

    // ************************************** //
    // ************ KEYDATASET LIST ********* //
    // ************************************** //

    this.getHazardCategory = function(token, onSuccess, onError)
    {
        // Return a list of Hazard Macro Category
        var req = {
            method: 'GET',
            url: baseAPIurl + 'keydataset/',
            headers: {
                // 'Authorization': 'Token ' + token
            },
            data: {}
        }

        $http(req).then(function(data){
            if(onSuccess) onSuccess(data.data);
        }, function(data){
            if(onError)onError(data.data);
        });

        // return objHazardCategoryList = [
        //     {code:"h01", desc:"Base data", icon:"icon-base_data"},
        //     {code:"h02", desc:"Exposure", icon:"icon-exposure"},
        //     {code:"h03", desc:"Hazard info", icon:"icon-hazard_info"},
        //     {code:"h04", desc:"Vulnerability", icon:"icon-vulnerability"},
        //     {code:"h05", desc:"Risk info", icon:"icon-info"}
        // ];
    };

    this.getHCIcon = function(index)
    {
        // Return the icon set for the category
        var obj = ["icon-base_data", "icon-exposure", "icon-hazard_info", "icon-info", "icon-vulnerability"];

        return obj[index];
    }

    this.getDatasetName = function(hcId, onSuccess, onError)
    {
        // Return a list of dataset name

        var req = {
            method: 'GET',
            url: baseAPIurl + 'keydataset/' + hcId + '/',
            headers: {
                // 'Authorization': 'Token ' + token
            },
            data: {}
        }

        $http(req).then(function(data){
            if(onSuccess) onSuccess(data.data);
        }, function(data){
            if(onError)onError(data.data);
        });
    }

    this.getDatasetDescription = function(hcId, dsId, onSuccess, onError)
    {
        var req = {
            method: 'GET',
            url: baseAPIurl + 'keydataset/' + hcId + '/' + dsId + '/',
            headers: {
                // 'Authorization': 'Token ' + token
            },
            data: {}
        }

        $http(req).then(function(data){
            if(onSuccess) onSuccess(data.data);
        }, function(data){
            if(onError)onError(data.data);
        });
    }

    this.getDatasetResolution = function(hcId, dsId, dsDescId, onSuccess, onError)
    {
        var req = {
            method: 'GET',
            url: baseAPIurl + 'keydataset/' + hcId + '/' + dsId + '/' + dsDescId + '/',
            headers: {
                // 'Authorization': 'Token ' + token
            },
            data: {}
        }

        $http(req).then(function(data){
            if(onSuccess) onSuccess(data.data);
        }, function(data){
            if(onError)onError(data.data);
        });
    }

    this.getQuestions = function()
    {
        /*
            Return the list of questions for dataset (Y/N)
         */

        return objQuestions = [
                {code: "q01", desc:"Does the data exist?"},
                {code: "is_digital_form", desc:"Is data in digital form?"},
                {code: "q03", desc:"Is the data available online?"},
                {code: "q04", desc:"Is the metadata available online?"},
                {code: "is_bulk_avail", desc:"Available in bulk?"},
                {code: "is_machine_read", desc:"Is the data machine- readable?"},
                {code: "is_pub_available", desc:"Publicly available?"},
                {code: "is_avail_for_free", desc:"Is the data available for free?"},
                {code: "is_open_licence", desc:"Openly licensed?"},
                {code: "is_prov_timely", desc:"Is the data provided on a timely and up to date basis?"}
        ]
    };

    this.getDatasetEmptyStructure = function()
    {
        /* return a Dataset list structure empty for new dataset contributor. */

        return obj = {
            name:"",
            abstract:"",
            country: "--",
            notes: "",
            is_digital_form: "", //9
            is_pub_available: "--", //14
            is_avail_for_free: "", //15
            is_machine_read: "", //13
            is_bulk_avail:"", //12
            is_open_licence:"", //16
            is_prov_timely:"", //17
            data_url: "",
            metadata_url: "",

            // temp fileds
            hazard:"--",


            owner:"",
            is_reviewed: false,
            review_date: new Date(),
            create_time: new Date(),
            modify_time: new Date(),
            keydataset:{
                id:0,
                category: "--",
                dataset:"--",
                description:"--",
                resolution:"0",
                scale:"0"
            },
            changed_by:""
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
                 name: "",
                 abstract: "",
                 dataset_type: "--",
                 resolution: "--",
                "country": "country code",
                "hazard_category": "hazard category code",
                 hazard: "--",
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

    this.validateDataset = function(obj)
    {
        var aErrors = [];
        var objResolutions = {};

        if(obj.name == ''){aErrors.push('Name')};
        if(obj.abstract == ''){aErrors.push('Abstract')};
        if(obj.country == '--'){aErrors.push('Country')};
        if(obj.keydataset.category == '--'){aErrors.push('Data category')};
        // if(obj.hazard == '--'){aErrors.push('Data category')};
        if(obj.keydataset.dataset == '--'){aErrors.push('Dataset category')};
        // if(obj.datasetdescription == '--'){aErrors.push('Dataset description')};

        // TAGS & Other details: TODO

        if(obj.keydataset.category == '3' && obj.hazard == '--'){aErrors.push('Hazard')};
        if(obj.data_url == ''){aErrors.push('Link dataset empty')};
        if(obj.metadata_url == ''){aErrors.push('Link metadata empty')};

        /* Check the questions */
        var aQuestions = [];
        // if(obj.question01 == ''){aErrors.push('answer')}
        if(obj.is_digital_form == ''){aQuestions.push('answer')}
        // if(obj.question03 == ''){aQuestions.push('answer')}
        // if(obj.question04 == ''){aQuestions.push('answer')}
        if(obj.is_bulk_avail == ''){aQuestions.push('answer')}
        if(obj.is_machine_read == ''){aQuestions.push('answer')}
        if(obj.is_pub_available == ''){aQuestions.push('answer')}
        if(obj.is_avail_for_free == ''){aQuestions.push('answer')}
        if(obj.is_open_licence == ''){aQuestions.push('answer')}
        if(obj.is_prov_timely == ''){aQuestions.push('answer')}

        if (aQuestions.length > 0){
            aErrors.push('Answer all questions (Yes, No)')
        };

        return aErrors;
    }

    this.saveDataset = function(token, obj, onSuccess, onError)
    {
        var req = {
            method: 'POST',
            url: baseAPIurl + 'profile/dataset/',
            headers: {
                'Authorization': 'Token ' + token
            },
            data: obj
        }

        $http(req).then(function(data){
            if(onSuccess) onSuccess(data.data);
        }, function(data){
            if(onError)onError(data.data);
        });
    }

    // ************************************** //
    // **** LOGIN / ADMIN USERS / PROFILE *** //
    // ************************************** //

    this.getUserStructureEmpty = function()
    {
        var obj =
            {
                pk:-999,
                username:"",
                first_name:"",
                last_name:"",
                email:"",
                groups:[],
                title:"",
                institution:"",
                is_staff: false
            };

        return obj;

    }

    this.checkLogin = function(usr, psw, onSuccess, onError)
    {
    /*    Check if login is correct, if so set the local cookies    */

        var req = {
            method: 'POST',
            url: baseAPIurl + 'get-token/',
            headers: {},
            data: { 'username': usr,  'password': psw}
        }

        $http(req).then(function(data){
            if(onSuccess) onSuccess(data);
        }, function(data){
            if(onError)onError(data);
        });

    }

    this.getUserInfo = function(token, onSuccess, onError)
    {
    //    Return user info

        var req = {
            method: 'GET',
            url: baseAPIurl + 'profile',
            headers: {
                'Authorization': 'Token ' + token
            },
            data: { }
        }

        $http(req).then(function(data){
            if(onSuccess) onSuccess(data.data);
        }, function(data){
            if(onError)onError(data.data);
        });
    }

    this.saveProfile = function(token, objUsr, onSuccess, onError)
    {

        var req = {
            method: 'PUT',
            url: baseAPIurl + 'profile',
            headers: {
                'Authorization': 'Token ' + token
            },
            data: objUsr
        }

        $http(req).then(function(data){
            if(onSuccess) onSuccess(data.data);
        }, function(data){
            if(onError)onError(data.data);
        });

    }

    this.getProfileDataset = function(token, objUsr, onSuccess, onError)
    {
        // Return a list of user's datasets

        var req = {
            method: 'GET',
            url: baseAPIurl + 'profile/dataset/',
            headers: {
                'Authorization': 'Token ' + token
            },
            data: {}
        }

        $http(req).then(function(data){
            if(onSuccess) onSuccess(data.data);
        }, function(data){
            if(onError)onError(data.data);
        });

    }

    this.resetProfilePsw = function(token, oldpsw, newpsw, onSuccess, onError)
    {
        var req = {
            method: 'PUT',
            url: baseAPIurl + 'profile/password',
            headers: {
                'Authorization': 'Token ' + token
            },
            data: {
                'old_password': oldpsw,
                'new_password': newpsw
            }
        }

        $http(req).then(function(data){
            if(onSuccess) onSuccess(data.data);
        }, function(data){
            if(onError)onError(data.data);
        });

    }

    this.saveUserInfo = function(token, objUsr, onSuccess, onError)
    {

        var req = {
            method: 'PUT',
            url: baseAPIurl + 'user/' + objUsr.pk,
            headers: {
                'Authorization': 'Token ' + token
            },
            data: objUsr
        }

        $http(req).then(function(data){
            if(onSuccess) onSuccess(data);
        }, function(data){
            if(onError)onError(data);
        });

    }

    this.insertUserInfo = function(token, objUsr, onSuccess, onError)
    {

        var req = {
            method: 'POST',
            url: baseAPIurl + 'user/',
            headers: {
                'Authorization': 'Token ' + token
            },
            data: objUsr
        }

        $http(req).then(function(data){
            if(onSuccess) onSuccess(data);
        }, function(data){
            if(onError)onError(data);
        });

    }

    this.deleteUserInfo = function(token, pk, onSuccess, onError)
    {

        var req = {
            method: 'DELETE',
            url: baseAPIurl + 'user/' + pk,
            headers: {
                'Authorization': 'Token ' + token
            },
            data: {}
        }

        $http(req).then(function(data){
            if(onSuccess) onSuccess(data);
        }, function(data){
            if(onError)onError(data);
        });

    }

    this.getUsersList = function(token, onSuccess, onError)
    {
        var req = {
            method: 'GET',
            url: baseAPIurl + 'user/',
            headers: {
                'Authorization': 'Token ' + token
            },
            data: { }
        }

        $http(req).then(function(data){
            if(onSuccess) onSuccess(data.data);
        }, function(data){
            if(onError)onError(data.data);
        });
    }

    this.sendRegisterRequest = function(objUsr, onSuccess, onError)
    {
        // Send a request for visitor registration

        var req = {
            method: 'POST',
            url: baseAPIurl + 'registration',
            headers: {},
            data: objUsr
        }

        $http(req).then(function(data){
            if(onSuccess) onSuccess(data.data);
        }, function(data){
            if(onError)onError(data.data);
        });

    }

    this.sendConfirmRegistration = function(usr, key, onSuccess, onError)
    {
        // Send the confirm to activate the profile

        var req = {
            method: 'GET',
            url: baseAPIurl + 'registration?username=' + usr + '&key=' + key,
            headers: {},
            data: {}
        }

        $http(req).then(function(data){
            if(onSuccess) onSuccess(data.data);
        }, function(data){
            if(onError)onError(data.data);
        });

    }

    // ************************************** //
    // *************** UTILITY ***************** //
    // ************************************** //

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
        if(strpath.indexOf('confirm_registration.html') != -1){return "8"};

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
