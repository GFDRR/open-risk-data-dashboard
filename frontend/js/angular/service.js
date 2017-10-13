/**
 * Created by Manuel on 15/05/2017.
 */

RodiApp.service("RodiSrv", ['$http', '$filter', function($http, $filter)
{


    this.countryList = null;

    // ************************************** //
    // ********* API VERSIONE CHECK ********* //
    // ************************************** //

    this.checkAPIversion = function(onSuccess, onError)
    {
        // Return True if API version is compatible
        var req = {
            method: 'GET',
            url: baseAPIurl + 'version',
            headers: {
                // 'Authorization': 'Token ' + token
            },
            data: {}
        }

        $http(req).then(function(data){
            if(onSuccess)
            {
                var aVersion = data.data.split('.');
                var appAPIVersion = APIversion.split('.');

                if(aVersion[0] !== appAPIVersion[0])
                {
                    console.log('Warning: API version not compatible!');
                } else if(aVersion[1] * 1 > appAPIVersion[1] * 1)
                    {
                        console.log('Warning: API version not compatible! Version: ' + data.data);
                    } else
                        {
                            console.log('API version ' + data.data);
                        };

            };
        }, function(data){
            if(onError)
            {
                //Error load API
                console.log('Error loading API service');
            };
        });
    }

    // ************************************** //
    // ************ SCORE - API ************* //
    // ************************************** //

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

        // var states = ["IT", "AR", "AU"];

        // var dataTemp = {};

        // angular.forEach(states, function (state, key) {
        //     dataTemp[state] = {value: Math.random()}
        // });

        // dataTemp['filters'] = {value: filters};

        // return dataTemp;

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

    this.getKeyDatasetTag = function (onSuccess, onError)
    {
        $http({
            method: 'GET',
            url: baseAPIurl + 'keydataset/tag/'
        }).then(function (data) {
            if(onSuccess) onSuccess(data.data)
        },function(data){
            if(onError)onError(data)
        });
    }

    this.getCountryList = function(onSuccess, onError)
    // Return the list of country Available
    {
        var _this =this
        if (this.countryList && onSuccess){
            onSuccess(this.countryList);
        } else{
            // Return country list
            $http({
                method: 'GET',
                url: baseAPIurl + 'country/'
            }).then(function (data) {
                _this.countryList =data.data;
                if(onSuccess) onSuccess(data.data);
            },function(data){
                if(onError)onError(data)
            });
        }





        // var objCountry = [{code:"IT", desc:"Italy"}, {code:"AR", desc:"Argentina"}, {code:"AU", desc:"Australia"}];
        // return objCountry;
    };

    this.getCountryDescription = function(objCountryList, idCountry)
        // Return the list of country Available
    {
        var objCountry = $filter('filter')(objCountryList,
            function(e)
            {
                return e.iso2 == idCountry;
            }
            );

        return objCountry[0].name;

    };

    this.getMatrixData = function(filters, onSuccess, onError)
    {

        if(filters.length> 0){
            var string = '?applicability='
            filters.forEach(function (item) {
                string = string+item;
            })
        }else{
            var string = ''
        }

        $http({
            method: 'GET',
            url: baseAPIurl + 'scoring_category/'+string
        }).then(function (data) {

            // var aOfIndex = data.data[0];
            // data.data.splice(0,1);
            // var aObj = [];
            // data.data.forEach(function (item,index, array) {
            //     va
            //     aOfIndex.forEach(function (keyIndex) {
            //         obj.push({
            //             keyIne
            //         });
            //     })
            //
            //     for (var field in aOfIndex)
            // })

            if(onSuccess)onSuccess(data.data);

        },function(data){
            // Error todo
        });

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
                    "1":["description hazard 01", "95"],
                    "2":["description hazard 02", "75"],
                    "3":["description hazard 03", "80"],
                    "4":["description hazard 04", "65"],
                    "5":["description hazard 05", "10"]
                },
                "matrixData": {
                    // questionKey: ["questionkey", "description", valueH01, valueH02, valueH03, valueH04, valueH05, valueH06, valueH07, valueH08]
                    q01: ["is_existing", 0.1, 0.2, 0.3, 0.4, 0.5],
                    q02: ["is_digital_form", 0.6, 0.7, 0.8, 0.9, 1.0],
                    q03: ["is_avail_online", 0.1, 0.2, 0.3, 0.4, 0.5],
                    q04: ["is_avail_online_meta", 0.6, 0.7, 0.8, 0.9, 1.0],
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
                    "1":["description hazard 01", "95"],
                    "2":["description hazard 02", "75"],
                    "3":["description hazard 03", "80"],
                    "4":["description hazard 04", "65"],
                    "5":["description hazard 05", "10"]
                },
                "matrixData": {
                    // "questionKey": ["description", valueH01, valueH02, valueH03, valueH04, valueH05, valueH06, valueH07, valueH08]
                    q01: ["is_existing", 0.1, 0.2, 0.3, 0.4, 0.5],
                    q02: ["is_digital_form", 0.6, 0.7, 0.8, 0.9, 1.0],
                    q03: ["is_avail_online", 0.1, 0.2, 0.3, 0.4, 0.5],
                    q04: ["is_avail_online_meta", 0.6, 0.7, 0.8, 0.9, 1.0],
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
                    "1":["description hazard 01", "95"],
                    "2":["description hazard 02", "75"],
                    "3":["description hazard 03", "80"],
                    "4":["description hazard 04", "65"],
                    "5":["description hazard 05", "10"]
                },
                "matrixData": {
                    // "questionKey": ["description", valueH01, valueH02, valueH03, valueH04, valueH05, valueH06, valueH07, valueH08]
                    q01: ["is_existing", 0.1, 0.2, 0.3, 0.4, 0.5],
                    q02: ["is_digital_form", 0.6, 0.7, 0.8, 0.9, 1.0],
                    q03: ["is_avail_online", 0.1, 0.2, 0.3, 0.4, 0.5],
                    q04: ["is_avail_online_meta", 0.6, 0.7, 0.8, 0.9, 1.0],
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

    this.matrixColorCell = function(value) {

        var numberFloat = parseFloat(value);

        if (numberFloat == -1) {
            return "background-color:rgba(211,211,211,0.4)";
        } else {
            numberFloat = numberFloat / 100;
            return "background-color: rgba(255,128,0, " + numberFloat + ");"
            // return "background-color: rgb(255, " + parseInt((1 - (numberFloat)) * 128)  + "," + parseInt((1-(numberFloat)) * 1) + ");";

        }
    }

    this.getApplicability = function( onSuccess, onError)
    {
        //https://dev.riskopendata.org/api-dev/peril/

        $http({
            method: 'GET',
            url: baseAPIurl + 'peril/'
            // url: baseAPIurl + 'scoring_categories/'
        }).then(function (data) {
            if(onSuccess)onSuccess(data.data)
        },function(data){
            alert('Error');
        });



    }

    this.getHazardList = function()
    {


        var objHazard = [
            {code:"RF", desc:"River flooding",icon:"icon-river_flood"},
            {code:"EQ", desc:"Earthquake",icon:"icon-earthquake"},
            {code:"VO", desc:"Volcano",icon:"icon-volcano"},
            {code:"CY", desc:"Cyclone",icon:"icon-cyclone"},
            {code:"CF", desc:"Coastal flooding",icon:"icon-coastal_flood"},
            {code:"WS", desc:"Water scarcity",icon:"icon-water_scarcity"},
            {code:"LS", desc:"Landslide",icon:"icon-landslide"},
            {code:"TS", desc:"Tsunami",icon:"icon-tsunami"}
            ];
        return objHazard;
    };

    this.getHazardIcon = function(code)
    {

        var objHazard = [
            {code:"RF", desc:"River flooding",icon:"icon-river_flood"},
            {code:"EQ", desc:"Earthquake",icon:"icon-earthquake"},
            {code:"VO", desc:"Volcano",icon:"icon-volcano"},
            {code:"CY", desc:"Cyclone",icon:"icon-cyclone"},
            {code:"CF", desc:"Coastal flooding",icon:"icon-coastal_flood"},
            {code:"WS", desc:"Water scarcity",icon:"icon-water_scarcity"},
            {code:"LS", desc:"Landslide",icon:"icon-landslide"},
            {code:"TS", desc:"Tsunami",icon:"icon-tsunami"}
        ];

        var aObj = $filter('filter')(objHazard, function(item){
            return item.desc == code;
        })

        return aObj[0].icon;
    };

    // ************************************** //
    // ************ KEYDATASET LIST ********* //
    // ************************************** //

    this.getDatasetEmptyStructure = function()
    {
        /* return a Dataset list structure empty for new dataset contributor. */

        return obj =
            {
                applicability:[],
                changed_by:null,
                country: "--",
                create_time:null,
                id:-999,
                is_avail_for_free: "",
                is_avail_online: "",
                is_avail_online_meta: "",
                is_bulk_avail:"",
                is_digital_form: "",
                is_existing:"",
                is_existing_txt:"",
                is_machine_read: "",
                is_machine_read_txt: "",
                is_open_licence:"",
                is_open_licence_txt:"",
                is_prov_timely:"",
                is_prov_timely_last:"",
                is_pub_available: "--",
                is_reviewed: false,
                keydataset:{
                    applicability:[],
                    category: "0",
                    dataset:"0",
                    description:"0",
                    id:-999,
                    level:"0"
                },
                tag_available:[],
                modify_time: new Date(),
                notes: "",
                owner:"",
                review_date:null,
                tag:[],
                url:[]
            }

    }

    this.getLevelList = function(onSuccess, onError)
    {
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
    }

    this.getDatasetCategoryList = function(id_level, id_cat, onSuccess, onError)
    {
        var req = {
            method: 'GET',
            url: baseAPIurl + 'keydataset/'+ id_level +'/' + id_cat + '/',
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

    this.getDatasetlist = function(onSuccess, onError)
    {
        // Return the dataset info by ID

        var req = {
            method: 'GET',
            url: baseAPIurl + 'dataset/',
            headers: {
                // 'Authorization': 'Token ' + token
            },
            data: {}
        }

        $http(req).then(function(data){
            if(onSuccess)onSuccess(data.data);
        }, function(data){
            if(onError)onError(data.data);
        });
    }

    this.getDatasetlistFiltered = function(idCountry, aCategory, aApplicability, onSuccess, onError)
    {
        // Return the dataset info filtered by country, category & applicability
        var sCategoryFilter = "";
        var sApplFilter = "";

        if(aCategory.length > 0)
        {
            aCategory.forEach(function(item) {
                sCategoryFilter = sCategoryFilter + "&category=" + $filter('lowercase')(item);
            });
        };

        if(aApplicability.length > 0)
        {
            aApplicability.forEach(function(item) {
                sApplFilter = sApplFilter + "&applicability=" + $filter('lowercase')(item);
            });
        };

        var req = {
            method: 'GET',
            url: baseAPIurl + 'dataset/?country=' + idCountry + sCategoryFilter + sApplFilter,
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

    this.getDataRiskCategory = function(scale_id, onSuccess, onError) {
        // Return a list of Hazard Macro Category
        var req = {
            method: 'GET',
            url: baseAPIurl + 'keydataset/' + scale_id + '/',
            headers: {
                // 'Authorization': 'Token ' + token
            },
            data: {}
        }

        $http(req).then(function (data) {
            if (onSuccess) onSuccess(data.data);
        }, function (data) {
            if (onError) onError(data.data);
        });
    }

    this.getDescription = function(id_level, id_cat, dataset_id, onSuccess, onError)
    {
        // Return a list of Dataset Descriptions
        var req = {
            method: 'GET',
            url: baseAPIurl + 'keydataset/' + id_level + '/' + id_cat + '/' + dataset_id + '/',
            headers: {
                // 'Authorization': 'Token ' + token
            },
            data: {}
        }

        $http(req).then(function (data) {
            if (onSuccess) onSuccess(data.data);
        }, function (data) {
            if (onError) onError(data.data);
        });
    }

    this.getTagsList = function(onSuccess, onError)
    {
        // Return a list of Tags by Group Name
        var req = {
            method: 'GET',
            url: baseAPIurl + 'keydataset/tag/',
            headers: {
                // 'Authorization': 'Token ' + token
            },
            data: {}
        }

        $http(req).then(function (data) {
            if (onSuccess) onSuccess(data.data);
        }, function (data) {
            if (onError) onError(data.data);
        });
    }

    this.getTags = function(groupName, onSuccess, onError)
    {
        // Return a list of Tags by Group Name
        var req = {
            method: 'GET',
            url: baseAPIurl + 'keydataset/tag/' + groupName,
            headers: {
                // 'Authorization': 'Token ' + token
            },
            data: {}
        }

        $http(req).then(function (data) {
            if (onSuccess) onSuccess(data.data);
        }, function (data) {
            if (onError) onError(data.data);
        });
    }

    this.getDataCategoryIcon = function()
    {
        // return data category icon & description for matrix view
        var obj =
            [
                {
                    "category": {id: 1, name: "Base Data"}
                },
                {
                    "category": {id: 2, name: "Hazard"}
                },
                {
                    "category": {id: 3, name: "Exposure"}
                },
                {
                    "category": {id: 4, name: "Vulnerability"}
                },
                {
                    "category": {id: 5, name: "Risk"}
                }
            ];

        return obj;
    }

    this.getSingleDataCategoryIcon = function(code)
    {
        var obj =
            [
                {
                    name: "Base Data", icon: "icon-base_data"
                },
                {
                    name: "Hazard", icon: "icon-hazard_info"
                },
                {
                    name: "Exposure", icon: "icon-exposure"
                },
                {
                    name: "Vulnerability", icon:"icon-vulnerability"
                },
                {
                    name: "Risk", icon:"icon-info"
                }
            ];

        var aObj = $filter('filter')(obj, function(item){
            return item.name == code;
        })

        return aObj[0].icon;
    }

    this.getHCIcon = function(index)
    {
        // Return the icon set for the category
        var obj = ["icon-base_data", "icon-hazard_info", "icon-exposure", "icon-vulnerability", "icon-info" ];

        return obj[index];
    }

    this.getKeydatasetId = function(scale_id, data_cat, dataset_cat, dataset_desc, onSuccess, onError)
    {
        // Return a list of dataset name

        var req = {
            method: 'GET',
            url: baseAPIurl + 'keydataset/' + scale_id + '/' + data_cat + '/' + dataset_cat + '/' + dataset_desc,
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

    this.getDatasetInfo = function(ds_id, onSuccess, onError)
    {
        // Return the dataset info by ID

        var req = {
            method: 'GET',
            url: baseAPIurl + 'dataset/' + ds_id,
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
                {code: "is_existing", desc:"Does the data exist?", altTXT:"is_existing_txt", altDesc:"existing alternative text"},
                {code: "is_digital_form", desc:"Is data in digital form?", altTXT:"", altDesc:""},
                {code: "is_avail_online", desc:"Is the data available online?", altTXT:"", altDesc:""},
                {code: "is_avail_online_meta", desc:"Is the metadata available online?", altTXT:"", altDesc:""},
                {code: "is_bulk_avail", desc:"Available in bulk?", altTXT:"", altDesc:""},
                {code: "is_machine_read", desc:"Is the data machine- readable?", altTXT:"is_machine_read_txt", altDesc:"machine alternative text"},
                {code: "is_pub_available", desc:"Is the data publicly available?", altTXT:"", altDesc:""},
                {code: "is_avail_for_free", desc:"Is the data available for free?", altTXT:"", altDesc:""},
                {code: "is_open_licence", desc:"Is the data openly licensed?", altTXT:"is_open_licence_txt", altDesc:"license alternative text"},
                {code: "is_prov_timely", desc:"Is the data provided on a timely and up to date basis?", altTXT:"", altDesc:""}
        ]
    };

    this.getQuestions_code = function(questionCode)
    {
        /*
         Return the list of questions for dataset (Y/N)
         */

        var objQuestions = [
            {code: "is_existing", desc:"Does the data exist?", altTXT:"is_existing_txt", altDesc:"existing alternative text"},
            {code: "is_digital_form", desc:"Is data in digital form?", altTXT:"", altDesc:""},
            {code: "is_avail_online", desc:"Is the data available online?", altTXT:"", altDesc:""},
            {code: "is_avail_online_meta", desc:"Is the metadata available online?", altTXT:"", altDesc:""},
            {code: "is_bulk_avail", desc:"Available in bulk?", altTXT:"", altDesc:""},
            {code: "is_machine_read", desc:"Is the data machine- readable?", altTXT:"is_machine_read_txt", altDesc:"machine alternative text"},
            {code: "is_pub_available", desc:"Is the data publicly available?", altTXT:"", altDesc:""},
            {code: "is_avail_for_free", desc:"Is the data available for free?", altTXT:"", altDesc:""},
            {code: "is_open_licence", desc:"Is the data openly licensed?", altTXT:"is_open_licence_txt", altDesc:"license alternative text"},
            {code: "is_prov_timely", desc:"Is the data provided on a timely and up to date basis?", altTXT:"", altDesc:""}
        ];

        var aQuestion = $filter('filter')(objQuestions, {"code": questionCode});

        return aQuestion[0].desc;

    };

    this.getQuestions_icon = function(questionCode)
    {
        /*
         Return question icon
         */

        var objQuestions = [
            {code: "is_existing", icon:"fa fa-check-circle-o"},
            {code: "is_digital_form", icon:"fa fa-desktop"},
            {code: "is_avail_online", icon:"fa fa-cloud"},
            {code: "is_avail_online_meta", icon:"fa fa-tag"},
            {code: "is_bulk_avail", icon:"fa fa-copy"},
            {code: "is_machine_read", icon:"fa fa-keyboard-o"},
            {code: "is_pub_available", icon:"fa fa-eye"},
            {code: "is_avail_for_free", icon:"fa fa-dollar"},
            {code: "is_open_licence", icon:"fa fa-unlock-alt"},
            {code: "is_prov_timely", icon:"fa fa-clock-o"}
        ];

        var aQuestion = $filter('filter')(objQuestions, {"code": questionCode});

        return aQuestion[0].icon;

    };

    this.getQuestionsHelp = function(index)
    {
        var obj = [
            'Does the data exist at all? The data can be in any form (paper or digital, offline or online etc). If it is not, then all the other questions are not',
            'This question addresses whether the data is in digital form (stored on computers or digital storage) or if it only in e.g. paper form.',
            'This question addresses whether the data is available online from an official source. In the cases that this is answered with a "yes", then the link is put in the URL field below.',
            'This question addresses whether the metadata is available online from an official source. In the cases that this is answered with a "yes", then the link is put in the URL field below.',
            'Data is available in bulk if the whole dataset can be downloaded or accessed easily. Conversely it is considered non-bulk if the citizens are limited to just getting parts of the dataset (for example, if restricted to querying a web form and retrieving a few results at a time from a very large database).',
            'Data is machine-readable if it is in a format that can be easily structured by a computer. Data can be digital but not machine-readable. For example, consider a PDF document containing tables of data. These are definitely digital but are not machine-readable because a computer would struggle to access the tabular information (even though they are very human-readable!). The equivalent tables in a format such as a spreadsheet would be machine-readable. Note: The appropriate machine-readable format may vary by type of data – so, for example, machine-readable formats for geographic data may be different than for tabular data. In general, HTML and PDF are not machine-readable.',
            'This question addresses whether the data is "public". This does not require it to be freely available, but does require that someone outside of the government can access it in some form (examples include if the data is available for purchase, if it exists as a PDF on a website that you can access, if you can get it in paper form - then it is public). If a freedom of information request or similar is needed to access the data, it is not considered public.',
            'This question addresses whether the data is available for free or if there is a charge. If there is a charge, then that is stated in the comments section.',
            'This question addresses whether the dataset is open as per http://opendefinition.org. It needs to state the terms of use or license that allow anyone to freely use, reuse or redistribute the data (subject at most to attribution or share alike requirements). It is vital that a licence is available (if there is no licence, the data is not openly licensed). Open licences which meet the requirements of the Open Definition are listed at http://opendefinition.org/licenses/.',
            'This question addresses whether the data is up to date and timely - or long delayed. For example, for election data that it is made available immediately or soon after the election or if it is only available many years later. Any comments around uncertainty are put in the comments field.',
        ];

        return obj[index];
    }

    this.getAllDatasetList = function(onSuccess, onError)
    {
        /*
         return a Dataset list sorted by country.
         */

        var req = {
            method: 'GET',
            url: baseAPIurl + 'dataset/',
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

    this.validateDataset = function(obj)
    {
        var aErrors = [];

        // if(obj.name == ''){aErrors.push('Name')};
        // if(obj.abstract == ''){aErrors.push('Abstract')};
        if(obj.country == '--'){aErrors.push('Country')};
        // if(obj.keydataset.scale == '--'){aErrors.push('Dataset scale')};
        // if(obj.keydataset.category == '--'){aErrors.push('Data category')};
        // if(obj.hazard == '--'){aErrors.push('Data category')};
        if(obj.keydataset.dataset == '0'){aErrors.push('Dataset category')};
        if(obj.keydataset.description == '0'){aErrors.push('Dataset description')};

        // if(obj.keydataset.category == '3' && obj.hazard == '--'){aErrors.push('Hazard')};
        // if(obj.data_url == ''){aErrors.push('Link dataset empty')};
        // if(obj.metadata_url == ''){aErrors.push('Link metadata empty')};

        /* Check the questions */
        var aQuestions = [];
        if(obj.is_avail_for_free + "" == '')
        {
            aQuestions.push('1')
        };
        if(obj.is_avail_online + "" == '')
        {
            aQuestions.push('2')
        };
        if(obj.is_avail_online_meta + "" == '')
        {
            aQuestions.push('3')
        };
        if(obj.is_bulk_avail + "" == '')
        {
            aQuestions.push('4')
        };
        if(obj.is_digital_form + "" == '')
        {
            aQuestions.push('5')
        };
        if(obj.is_existing + "" == '')
        {
            aQuestions.push('6')
        };
        if(obj.is_machine_read + "" == '')
        {
            aQuestions.push('7')
        };
        if(obj.is_open_licence + "" == '')
        {
            aQuestions.push('8')
        };
        if(obj.is_prov_timely + "" == '')
        {
            aQuestions.push('9')
        };
        if(obj.is_pub_available + "" == '')
        {
            aQuestions.push('10')
        };

        if (aQuestions.length > 0){
            aErrors.push('Answer all questions (Yes, No)')
        };

        return aErrors;
    }

    this.saveprofileDataset = function(token, obj, onSuccess, onError)
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
            if(onError)onError(data);
        });
    }

    this.updateprofileDataset = function(token, obj, onSuccess, onError)
    {
        var req = {
            method: 'PUT',
            url: baseAPIurl + 'profile/dataset/' + obj.id,
            headers: {
                'Authorization': 'Token ' + token
            },
            data: obj
        }

        $http(req).then(function(data){
            if(onSuccess) onSuccess(data.data);
        }, function(data){
            if(onError)onError(data);
        });
    }

    this.updateAdminDataset = function(token, obj, onSuccess, onError)
    {
        var req = {
            method: 'PUT',
            url: baseAPIurl + 'dataset/' + obj.id,
            headers: {
                'Authorization': 'Token ' + token
            },
            data: obj
        }

        $http(req).then(function(data){
            if(onSuccess) onSuccess(data.data);
        }, function(data){
            if(onError)onError(data);
        });
    }

    this.deleteprofileDataset = function(token, obj, onSuccess, onError)
    {
        var req = {
            method: 'DELETE',
            url: baseAPIurl + 'profile/dataset/' + obj.id,
            headers: {
                'Authorization': 'Token ' + token
            },
            data: obj
        }

        $http(req).then(function(data){
            if(onSuccess) onSuccess(data.data);
        }, function(data){
            if(onError)onError(data);
        });
    }

    this.deleteAdminDataset = function(token, obj, onSuccess, onError)
    {
        var req = {
            method: 'DELETE',
            url: baseAPIurl + 'dataset/' + obj.id,
            headers: {
                'Authorization': 'Token ' + token
            },
            data: obj
        }

        $http(req).then(function(data){
            if(onSuccess) onSuccess(data.data);
        }, function(data){
            if(onError)onError(data);
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

    this.getProfileDataset = function(token, onSuccess, onError)
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

    this.getProfileDatasetDetails = function(id_dataset, token, onSuccess, onError)
    {
        // Return a list of user's datasets

        var req = {
            method: 'GET',
            url: baseAPIurl + 'profile/dataset/' + id_dataset,
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

    this.resetPassword = function(usr, onSuccess, onError) {
        console.log(usr);
        var req = {
            method: 'POST',
            url: baseAPIurl + 'profile/password/reset',
            headers: {},
            data:
                {
                    'username': usr
                }
        }

        $http(req).then(function (data) {
            if (onSuccess) onSuccess(data.data);
        }, function (data) {
            if (onError) onError(data.data);
        });
    }

    this.setNewPasswordTwice = function(usr, key, npass, npassagain, onSuccess, onError) {
        console.log(usr);
        var req = {
            method: 'PUT',
            url: baseAPIurl + 'profile/password/reset',
            headers: {},
            data:
                {
                    'username': usr,
                    'key': key,
                    'new_password': npass,
                    'new_password_again': npassagain
                }
        }

        $http(req).then(function (data) {
            if (onSuccess) onSuccess(data.data);
        }, function (data) {
            if (onError) onError(data.data);
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
        // if(strpath.indexOf('browse-data.html') != -1){return "3"};
        if(strpath.indexOf('register.html') != -1){return "4"};
        if(strpath.indexOf('countries.html') != -1){return "5"};
        if(strpath.indexOf('dataset_details.html') != -1){return "6"};
        // if(strpath.indexOf('news-details.html') != -1){return "7"};
        if(strpath.indexOf('confirm_registration.html') != -1){return "8"};
        if(strpath.indexOf('about.html') != -1){return "9"};
        if(strpath.indexOf('dataset_list.html') != -1){return "10"};
        if(strpath.indexOf('stats.html') != -1){return "11"};

        return "0";
    }

    this.sendFeedback = function(obj, token, onSuccess, onError)
    {

        // send user feedback (only registred user)
        var req = {
            method: 'POST',
            url: baseAPIurl + '/profile/comment/send',
            headers: {
                'Authorization': 'Token ' + token
            },
            data: {
                "comment": obj.comment,
                "page": obj.page
            }
        }

        $http(req).then(function(data){
            if(onSuccess) onSuccess(data.data);
        }, function(data){
            if(onError)onError(data.data);
        });
    }

    this.getCSVFile = function(token, onSuccess, onError)
    {
        var req = {
            method: 'GET',
            url: baseAPIurl + 'datasets_dump',
            headers: {
                // 'Authorization': 'Token ' + token
            },
            data: { }
        }

        $http(req).then(function(data){
            if(onSuccess) onSuccess(data.data);
        }, function(data){
            if(onError)onError(data.data);
        });
    }

    // ************************************** //
    // ************ STATISTICS ************** //
    // ************************************** //

    this.getHomeStatistics = function(onSuccess, onError)
    {
        // Return statistics for home page

        var req = {
            method: 'GET',
            url: baseAPIurl + 'scoring/',
            // url: 'https://dev.riskopendata.org/api-dev2/scoring/',
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

    this.getCountryStatistics = function(idCountry, aCategory, aApplicability, onSuccess, onError)
    {
        // Return statistics for country page

        var sCategoryFilter = "";
        var sApplFilter = "";

        if(aCategory.length > 0)
        {
            aCategory.forEach(function(item) {
                sCategoryFilter = sCategoryFilter + "&category=" + $filter('lowercase')(item);
            });
        };

        if(aApplicability.length > 0)
        {
            aApplicability.forEach(function(item) {
                sApplFilter = sApplFilter + "&applicability=" + $filter('lowercase')(item);
            });
        };

        var req = {
            method: 'GET',
            url: baseAPIurl + 'scoring/' + idCountry + '?' + sCategoryFilter + sApplFilter,
            // url: 'https://dev.riskopendata.org/api-dev2/scoring/' + idCountry,
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

}]);
