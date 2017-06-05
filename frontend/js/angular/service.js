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

        var objCountry = [{"code":"IT", "desc":"Italy"}, {"code":"AR", "desc":"Argentina"}, {"code":"AU", "desc":"Australia"}];
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
                    // "questionKey": ["description", valueH01, valueH02, valueH03, valueH04, valueH05, valueH06, valueH07, valueH08]
                    "quest1": ["description question 1", "yes", "no", "yes", "na", "yes"],
                    "quest2": ["description question 2", "yes", "no", "yes", "na", "yes"],
                    "quest3": ["description question 3", "yes", "no", "yes", "na", "yes"],
                    "quest4": ["description question 4", "yes", "no", "yes", "na", "yes"],
                    "quest5": ["description question 5", "yes", "no", "yes", "na", "yes"],
                    "quest6": ["description question 6", "yes", "no", "yes", "na", "yes"],
                    "quest7": ["description question 7", "yes", "no", "yes", "na", "yes"],
                    "quest8": ["description question 8", "yes", "no", "yes", "na", "yes"],
                    "quest9": ["description question 9", "yes", "no", "yes", "na", "yes"],
                    "quest10": ["description question 10", "yes", "no", "yes", "na", "yes"]
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
                    "quest1": ["description question 1", "yes", "no", "yes", "na", "yes"],
                    "quest2": ["description question 2", "yes", "no", "yes", "na", "yes"],
                    "quest3": ["description question 3", "yes", "no", "yes", "na", "yes"],
                    "quest4": ["description question 4", "yes", "no", "yes", "na", "yes"],
                    "quest5": ["description question 5", "yes", "no", "yes", "na", "yes"],
                    "quest6": ["description question 6", "yes", "no", "yes", "na", "yes"],
                    "quest7": ["description question 7", "yes", "no", "yes", "na", "yes"],
                    "quest8": ["description question 8", "yes", "no", "yes", "na", "yes"],
                    "quest9": ["description question 9", "yes", "no", "yes", "na", "yes"],
                    "quest10": ["description question 10", "yes", "no", "yes", "na", "yes"]
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
                    "quest1": ["description question 1", "yes", "no", "yes", "na", "yes"],
                    "quest2": ["description question 2", "yes", "no", "yes", "na", "yes"],
                    "quest3": ["description question 3", "yes", "no", "yes", "na", "yes"],
                    "quest4": ["description question 4", "yes", "no", "yes", "na", "yes"],
                    "quest5": ["description question 5", "yes", "no", "yes", "na", "yes"],
                    "quest6": ["description question 6", "yes", "no", "yes", "na", "yes"],
                    "quest7": ["description question 7", "yes", "no", "yes", "na", "yes"],
                    "quest8": ["description question 8", "yes", "no", "yes", "na", "yes"],
                    "quest9": ["description question 9", "yes", "no", "yes", "na", "yes"],
                    "quest10": ["description question 10", "yes", "no", "yes", "na", "yes"]
                }
            }
        ];

        return countryData;

    };

    this.matrixColorCell = function(value){

        var numberFloat = parseFloat(value);
        return "background-color: rgb(255," + parseInt((1 - numberFloat) * 255) + "," + parseInt((1 - numberFloat) * 255) + ");"
    };

    this.getHazardCategory = function()
    {
        return objDataTimeElement = {
            "dataType_index": {
                "dt01":["Hazard info", "icon-hazard_info"],
                "dt02":["Exposure", "icon-exposure"],
                "dt03":["Hazard Vulnerability", "icon-vulnerability"],
                "dt04":["Base data", "icon-base_data"],
                "dt05":["Risk info", "icon-info"]
            },
        }
    };

    this.getQuestions = function()
    {
        /*
        Return the list of question for dataset
         */
        return objQuestions = {
            "questions_index": {
                "code01": {desc:"Does the data exist?", type:"???"}, // Type: type of the question: Yes or Not, text, etc.. da definire
                "code02":{desc:"Is data in digital form?", type:"???"},
                "code03":{desc:"Publicly available?", type:"???"},
                "code04":{desc:"Is the data available for free?", type:"???"},
                "code05":{desc:"Is the data available online?", type:"???"}
            },
        }
    };

    this.getDatasetEmptyStructure = function()
    {
        /*
         return a Dataset list structure empty for new dataset contributor.

         obj =
         {
         "code": "",
         "country": "--",
         "hazard_category": "--",
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
            "code": "",
            "country": "--",
            "hazard_category": "--",
            "usr_ins": "",
            "data_ins": "",
            "status": "0",
            "data_validate": "",
            "questions":
            {
                "code01": "",
                "code02": "",
                "code03": "",
                "code04": ""
            },
            "link_dataset": "",
            "link_metadata": ""
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

}]);
