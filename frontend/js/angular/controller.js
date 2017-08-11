/**
 * Created by Manuel on 15/05/2017.
 */

RodiApp.controller('RodiCtrl', ['$scope', 'RodiSrv', '$window', '$filter', '$cookieStore', '$location','NgTableParams','$timeout', function ($scope, RodiSrv, $window, $filter, $cookieStore, $location,NgTableParams,$timeout) {

    // ************************************** //
    // *************** INIT ***************** //
    // ************************************** //

    RodiSrv.checkAPIversion(function(data){}, function(data){});

    $scope.bLogin = false;
    $scope.tokenid = $cookieStore.get('rodi_token');
    $scope.userinfo = $cookieStore.get('rodi_user');

    if(!$scope.userinfo)
    {
        $scope.userinfo = RodiSrv.getUserStructureEmpty();
    }

    if($scope.tokenid) {$scope.bLogin = true; } else {$scope.bLogin = false;}

    // Hazard Filters
    $scope.objHazardFilters =
        {
            "filterRiverFlood": "",
            "filterEarthquake": "",
            "filterVolcano": "",
            "filterCyclone": "",
            "filterCoastalFlood": "",
            "filterWaterScarsity": "",
            "filterLandSlide": "",
            "filterTsunami": ""
        };

    $scope.changepage = function(page)
    {
        $window.location.href = baseUrl + page;
    }

    // ************************************** //
    // ************ HOME PAGE *************** //
    // ************************************** //
    if ($location.path().indexOf('index') !== -1 || $location.path() == baseUrl.replace("http:/", "") || $location.path() == baseUrl.replace("https:/", ""))
    {


        // ************************************** //
        // ************* MATRIX ***************** //
        // ************************************** //

        $scope.filteredApplicability = [];

        $scope.filterApplicabilityClass = function (name) {
            if($scope.filteredApplicability[0] == name){
                return "active";
            }else return "unactive" ;


        }

        RodiSrv.getApplicability(function (data) {

            $scope.applicability= [];

            data.forEach(function(item){
                var obj = {};
                obj.icon = $filter('lowercase')("ico-"+ item.name.replace(/\s+/g, '_'));
                obj.title = item.name;
                $scope.applicability.push(obj);
            })

            // $scope.applicability  = data;
        });

        $scope.setUnSetFilter = function (filter){

            if ($scope.filteredApplicability.indexOf(filter) > -1)
            {
                $scope.filteredApplicability = [];
            } else
            {
                $scope.filteredApplicability = [];
                $scope.filteredApplicability.push(filter);
            }

            $scope.mergeMatrixData();
        }

        RodiSrv.getCountryList(
            function(countryList) {
                // Success
                $scope.aCountryList = {};

                countryList.forEach(function (item) {
                    $scope.aCountryList[item.iso2] = item;
                });

                $scope.mergeMatrixData();

        })


        $scope.mergeMatrixData= function() {
            RodiSrv.getMatrixData($scope.filteredApplicability, function (data) {
                // $scope.matrixData = [];
                $scope.arrayData = [];
                var dataTemp = [];

                //tolgo elemento indici
                var aIndex = data[0];
                data.splice(0, 1);

                // compongo un array chiave valore

                data.forEach(function (currValue, index, array) {
                    var obj = {};
                    var countrycode;
                    var countryscore;

                    for (var i in aIndex) {

                        if (aIndex[i] == "country") {
                            countrycode  = currValue[i];
                        }else{

                            if(aIndex[i] == "score")
                            {
                                countryscore = currValue[i];
                            } else {
                                obj[aIndex[i]] = {
                                    id: i,
                                    value: currValue[i],
                                    score:countryscore
                                }
                            }
                        }

                    }

                    $scope.aCountryList[countrycode].data = obj;
                    dataTemp[countrycode] = {score: countryscore};

                });

                console.log(dataTemp);
                $scope.arrayData = dataTemp;

                //fill country without data
                var obj= {}
                for (var i in aIndex) {
                    if (aIndex[i] != "country") {
                        obj[aIndex[i]] = {
                            id:i,
                            value:"-1.0",
                            score:"0"
                        }
                    }
                }

                for(var country in $scope.aCountryList){

                    if(angular.isUndefined($scope.aCountryList[country].data))
                    {
                        $scope.aCountryList[country].data = obj;
                    }

                    // if (angular.isUndefined($scope.aCountryList[country].data)) $scope.aCountryList[country].data = obj;
                    // $scope.arrayData[country] = {value: 0};
                }
                //end filling


            }, function (data) {
                // Error
                // TODO: set e message error
            });
        }

        // Get the Hazard Category
        $scope.HazardCategory = RodiSrv.getDataCategoryIcon();


        $scope.getHCIcon = function (index) {
            return RodiSrv.getHCIcon(index - 1);
        };

        $scope.colorCell = function (value) {
            return RodiSrv.matrixColorCell(value);
        }


        // ************************************** //
        // ******* STATISTICS & MAP DATA ******** //
        // ************************************** //

        $scope.objRodiVariable =
            {
                "valueData": "",
                "countryID": "",
                "countryDesc": "",
                "bPopupCountry": false,
                "popupClass": "",
                "popupX": "",
                "popupY": "",
                "location": baseUrl
            };

        RodiSrv.getHomeStatistics(function(data)
        {
            //Success API
            console.log(data);

            // Finding country score for MAP
            // var arrayStates = [];
            // var dataTemp = [];

            // angular.forEach(data.scores, function(value, key)
            // {
            //     arrayStates.push(value.country);
            // });

            // angular.forEach(arrayStates, function(value, key)
            // {
            //     var obj = $filter('filter')(data.scores, {country: value});
            //     dataTemp[value] = {score: obj[0].score};
            // });

            // $scope.arrayData = dataTemp;

            // Statistics index

            $scope.getPelirsIcons = function(code)
            {
                return RodiSrv.getHazardIcon(code);
            }

            $scope.dataCategoryIcon = function(code)
            {
                return RodiSrv.getSingleDataCategoryIcon(code);
            }

            $scope.perilCounters = data.perils_counters;
            $scope.categoryCounters = data.categories_counters;
            $scope.countryWithData = data.countries_count;
            $scope.totalDataset = data.datasets_count;

        }, function(data)
        {
            // Error
        })

    }

    // ************************************** //
    // ************* FILTERS **************** //
    // ************************************** //

    // Setto i filtri attivi
    $scope.setFilter = function(elementKey)
    {
        if ($scope.objHazardFilters[elementKey] !== ''){
            $scope.objHazardFilters[elementKey] = "";
        } else {
            $scope.objHazardFilters[elementKey] = "active";
        }

    };


    // ************************************** //
    // ********* CONTRIBUTE PAGE ************ //
    // ************************************** //

    if ($location.path().indexOf('contribute.html') !== -1)
    {

        $scope.tabpar = $location.search().tab;
        $scope.questions = RodiSrv.getQuestions();
        $scope.bDescInfo = false;

        if($scope.tabpar)
        {
            $scope.tab = $scope.tabpar;
        } else {$scope.tab = 0;}

        // Dataset classification set
        $scope.dataCategory = [];
        $scope.dataCategoryId = "0";
        $scope.dataCategoryAll = [];
        $scope.datasetCategory = [];
        $scope.datasetCategoryAll = [];
        $scope.datasetScale = [];
        $scope.datasetScaleId = "0";
        $scope.datasetDescription = [];
        $scope.selectedLink = [];
        $scope.newLink = "";
        $scope.datasetTags = [];
        $scope.selectedTags = [];
        $scope.sTagsMsg = "** Select a dataset description **";
        $scope.sTagsInfo = "";

        $scope.objDataset = RodiSrv.getDatasetEmptyStructure();

        // Load all data risk category
        RodiSrv.getDataRiskCategory(0,
            function(data)
            {
                // console.log(data);
                $scope.dataCategory = data;
                $scope.dataCategoryAll = data;
            },
            function(data)
            {
                $scope.dataCategory = "--";
            }
        )

        // Load all Dataset list
        RodiSrv.getDatasetCategoryList(0,0,
            function(data)
            {
                $scope.datasetCategory = data;
                $scope.datasetCategoryAll = data;
            },
            function(data)
            {
                $scope.datasetCategory = [];
            }
        );

        $scope.changeDataRiskSelection = function(idCategory)
        {
            $scope.lastSelectedCategoty = idCategory;
            // Filter Dataset list
            RodiSrv.getDatasetCategoryList(0,idCategory,
                function(data)
                {
                    // Set Dataset selection
                    $scope.datasetCategory = data;

                    $scope.objDataset.keydataset.dataset = '0';
                    $scope.objDataset.keydataset.level = '0';
                    $scope.datasetScale = [];
                    $scope.objDataset.keydataset.description = '0';
                    $scope.datasetDescription = [];
                    $scope.datasetTags = [];
                    $scope.selectedTags = [];
                    $scope.sTagsMsg = "** Select a dataset description **";

                },
                function(data)
                {
                    // do nothing
                });
        };

        $scope.dataRiskSelectionClass = function (id) {

            return ($scope.lastSelectedCategoty == id)?'btn-warning':'btn-success';
        }

        $scope.changeDatasetSelection = function(idDataset)
        {
            if(idDataset !== '0')
            {

                $scope.bDescInfo = true;
                // Dataset selected
                // get the dataset obj
                var aFiltered = [];

                aFiltered = $filter('filter')($scope.datasetCategoryAll, function(e)
                {
                    return e.dataset.id == idDataset;
                });

                // Get data risk category ID
                var aCategory = $filter('filter')($scope.dataCategoryAll,
                    function(e)
                    {
                        return e.category.name == aFiltered[0].category;
                    }
                );

                $scope.dataCategoryId = aCategory[0].category.id + "";
                $scope.objDataset.keydataset.category = $scope.dataCategoryId;

                // Set dataset description selection
                RodiSrv.getDescription(0, $scope.dataCategoryId, idDataset,
                    function(data)
                    {
                        $scope.datasetDescription = data;

                        $scope.objDataset.keydataset.level = '0';
                        $scope.objDataset.keydataset.description = '0';

                        // Get Dataset scale available
                        RodiSrv.getLevelList(
                            function(data)
                            {
                                $scope.datasetScale = $filter('filter')(data,
                                    function(e)
                                    {
                                        var i = 0;
                                        var aLevel = [];

                                        while (i <=  $scope.datasetDescription.length - 1)
                                        {
                                            // console.log(i + ' e: ' + e.level.name + ' desc: ' + $scope.datasetDescription[i].level);
                                            if(e.level.name ==  $scope.datasetDescription[i].level)
                                            {
                                                aLevel.push(e);
                                            }
                                            i +=1;
                                        }

                                        if (aLevel.length > 0) {return aLevel;}
                                    }
                                );

                            }, function(data) {}
                        );

                    },
                    function(data)
                    {
                        console.log(data);
                    }
                );
            } else
            {
                $scope.bDescInfo = false;
                $scope.objDataset.keydataset.level = '0';
                $scope.datasetScale = [];
                $scope.objDataset.keydataset.description = '0';
                $scope.datasetDescription = [];
                $scope.datasetTags = [];
                $scope.selectedTags = [];
                $scope.sTagsMsg = "** Select a dataset description **";
            }

        }

        $scope.changeLevelSelection = function(idLevel)
        {
            // get the dataset obj
            RodiSrv.getDescription(idLevel, $scope.objDataset.keydataset.category, $scope.objDataset.keydataset.dataset,
                function(data)
                {
                    $scope.datasetDescription = data;

                    $scope.objDataset.keydataset.description = '0';
                },
                function(data)
                {
                    $scope.datasetDescription = [];
                })

                $scope.datasetTags = [];
                $scope.selectedTags = [];
                $scope.sTagsMsg = "** Select a dataset description **";
        }

        $scope.changeDescription = function(idDesc)
        {
            if(idDesc !== '0')
            {

                // Get level of description
                var objDesc = $filter('filter')($scope.datasetDescription,
                    function(e)
                    {
                        return e.description.code == idDesc;
                    }
                );

                var objLevel = $filter('filter')($scope.datasetScale,
                    function(e)
                    {
                        return e.level.name == objDesc[0].level;
                    }
                );

                $scope.objDataset.keydataset.description = idDesc;
                $scope.datasetScaleId = objLevel[0].level.id + "";
                $scope.objDataset.keydataset.level = $scope.datasetScaleId;

                RodiSrv.getKeydatasetId($scope.datasetScaleId, $scope.dataCategoryId,
                    $scope.objDataset.keydataset.dataset, $scope.objDataset.keydataset.description,
                    function(data)
                    {

                        // Success
                        if(data[0].tag_available)
                        {
                            $scope.datasetTags = data[0].tag_available.tags;
                            $scope.selectedTags = data[0].applicability;
                            $scope.sTagsMsg = "";

                            if(data[0].tag_available.group == 'hazard')
                            {
                                $scope.sTagsInfo = "Please select the Hazard for which the dataset is relevant/used. A predefined suggestion is provided.";
;                            }

                            if(data[0].tag_available.group == 'building')
                            {
                                $scope.sTagsInfo = "Please select the Building characteristics that are included in the dataset you are entering";
                            };

                            if(data[0].tag_available.group == 'facilities')
                            {
                                $scope.sTagsInfo = "Please select the what type of critical infrastructures are included in the dataset you are entering";
                            };


                        } else
                        {
                            $scope.datasetTags=[];
                            $scope.selectedTags = [];
                            $scope.sTagsMsg = "** No elemnts available **";
                            $scope.sTagsInfo="";
                        }

                    }, function(data){
                        // Error
                    }
                );

            } else
            {
                $scope.datasetScaleId = "0";
                $scope.objDataset.keydataset.level = "0";
                $scope.datasetTags = [];
                $scope.selectedTags = [];
            }

        }

        $scope.setTags = function(tag)
        {
            var indexElem = $scope.selectedTags.indexOf(tag);

            if(indexElem !== -1)
            {
                $scope.selectedTags.splice(indexElem, 1);
            } else {
                $scope.selectedTags.push(tag);
            }

        }

        $scope.addLink = function(strLink)
        {
            var indexElem = $scope.selectedLink.indexOf(strLink);
            if(indexElem == -1)
            {
                $scope.selectedLink.push(strLink);
                $scope.newLink = "";
            }
        }

        $scope.deleteLink = function(link)
        {
            var indexElem = $scope.selectedLink.indexOf(link);

            $scope.selectedLink.splice(indexElem, 1);

        }

        RodiSrv.getCountryList(
            function(data){
                // Success
                $scope.countryList = data;
            }, function(data){
                // Error
                // TODO: error message
            });

        // $scope.questions = RodiSrv.getQuestions();

        $scope.getQuestionCode = function(questionCode)
        {
            return RodiSrv.getQuestions_code(questionCode);
        }

        $scope.saveSelection = function(qcode, value)
        {
            $scope.objDataset[qcode] = value;
        }

        $scope.saveDataset = function()
        {
            var aErrorsValidation = [];

            // Set tags and links
            $scope.objDataset.tag = $scope.selectedTags;
            $scope.objDataset.url = $scope.selectedLink;

            // Validate Dataset structure
            aErrorsValidation = RodiSrv.validateDataset($scope.objDataset);

            if(aErrorsValidation.length > 0) {
                // Errors
                var strMsg = "Required fields: <ul>";
                for(var i=0; i< aErrorsValidation.length; i++)
                {
                    strMsg += '<li>' + aErrorsValidation[i] + '</li> ';
                }

                strMsg += "</ul>";
                vex.dialog.alert(strMsg);

            } else {
                // Save the dataser

                // Get the pk_id of Keydataset
                RodiSrv.getKeydatasetId($scope.datasetScaleId, $scope.dataCategoryId,
                    $scope.objDataset.keydataset.dataset, $scope.objDataset.keydataset.description,
                    function(data)
                    {
                        // Success
                        $scope.objDataset.keydataset = data[0].code;

                        // Save the dataset structure
                        RodiSrv.saveprofileDataset($scope.tokenid, $scope.objDataset,
                            function(data){
                                // Success
                                vex.dialog.alert('Dataset insert correctly');
                                $scope.objDataset = RodiSrv.getDatasetEmptyStructure();
                                $scope.selectedLink = [];
                                $scope.datasetTags = [];
                                $scope.selectedTags = [];
                                $scope.newLink = "";
                                $scope.sTagsMsg = "** Select a dataset description **";

                            }, function(data){
                            //     Error
                                console.log(data);
                                vex.dialog.alert("Unable to save the dataset data: " + data.data);
                            })

                    }, function(data)
                    {
                        // Error
                        console.log('Error');
                        console.log(data);
                    })
            }

        }

        $scope.questionHelp = function(index)
        {
            vex.dialog.alert(RodiSrv.getQuestionsHelp(index));
        }

        // ************************************** //
        // ****** USER PROFILE & DATA *********** //
        // ************************************** //

        $scope.$watch('bLogin', function() {

            if ($scope.bLogin){
                $scope.tokenid = $cookieStore.get('rodi_token');
                $scope.userinfo = $cookieStore.get('rodi_user');
            }

            // ************************************** //
            // ********** ADMIN FUNCTIONS *********** //
            // ************************************** //

            if ($scope.bLogin && $scope.userinfo.groups[0] == 'admin')
            {

                $scope.usradmininfo = RodiSrv.getUserStructureEmpty();
                $scope.usrRegList = [];
                $scope.stypeModal = "";
                $scope.groupSelect = null;

                RodiSrv.getUsersList($scope.tokenid,
                    function(data){
                        //Success
                        $scope.usrRegList = data;

                        $scope.openPopup = function (pk)
                        {

                            if(pk == -999)
                            {
                                // New user
                                $scope.stypeModal = "insert new profile";
                                $scope.usradmininfo = RodiSrv.getUserStructureEmpty();

                            } else {
                                // Edit user profile
                                var aUserProfile = $filter('filter')($scope.usrRegList, {pk: pk});
                                $scope.usradmininfo = aUserProfile[0];

                                if($scope.usradmininfo.groups.length == 0){
                                    $scope.groupSelect = 'normal';
                                } else {
                                    $scope.groupSelect = $scope.usradmininfo.groups[0];
                                }

                                $scope.stypeModal = "edit";
                            }


                            $('#editUser').modal('show');
                        }

                        $scope.saveUsrInfoAdmin = function()
                        {

                            if($scope.groupSelect == 'admin')
                            {
                                $scope.usradmininfo.is_staff = true;
                            }
                            else {
                                $scope.usradmininfo.is_staff = false;
                            }

                            if($scope.groupSelect == 'normal'){
                                $scope.usradmininfo.groups = [];
                            } else {
                                $scope.usradmininfo.groups[0] = $scope.groupSelect;
                            }

                            if($scope.usradmininfo.pk == -999)
                            {
                                // New user

                                RodiSrv.insertUserInfo($scope.tokenid, $scope.usradmininfo,
                                    function(data){
                                        // Success
                                        vex.dialog.alert('User info saved successfully');

                                        $scope.usrRegList.push($scope.usradmininfo);

                                        RodiSrv.getUsersList($scope.tokenid,
                                            function(data){
                                                // Success
                                                $scope.usrRegList = data;
                                            }, function(data){
                                                // Error
                                            })

                                    }, function(data){
                                        // Error
                                        vex.dialog.alert('Error: unable to save data');
                                    })

                            } else {
                                // Edit User profile

                                RodiSrv.saveUserInfo($scope.tokenid, $scope.usradmininfo,
                                    function(data){
                                        // Success
                                        vex.dialog.alert('User info saved successfully');
                                    }, function(data){
                                        // Error
                                        vex.dialog.alert('Error: unable to save data');
                                    }
                                )
                            }
                        }

                        $scope.deleteUsrInfoAdmin = function(pk)
                        {
                            vex.dialog.confirm({
                                message: 'Are you absolutely sure you want to delete this user profile?',
                                callback: function (value) {
                                    if(value)
                                    {
                                        // Delete profile
                                        RodiSrv.deleteUserInfo($scope.tokenid, pk,
                                            function(data){
                                                // Success

                                                // Reload data from server
                                                RodiSrv.getUsersList($scope.tokenid,
                                                    function(data){
                                                        // Success
                                                        $scope.usrRegList = data;
                                                    }, function(data){
                                                        // Error
                                                    })

                                            }, function(data){
                                                // Error
                                                vex.dialog.alert('Error: unable to delete data');
                                            })
                                    }
                                }
                            })
                        }

                    }, function(data){
                        // Error
                        // Fai nulla
                    }
                );
            }


            // ************************************** //
            // ****** ADMIN/REVIEWER FUNCTIONS ****** //
            // ************************************** //

            if ($scope.bLogin && $scope.userinfo.groups[0] == 'reviewer' || $scope.userinfo.groups[0] == 'admin'){

                // ************************************** //
                // ******* DATASET NOT REVIWERED ****** //
                // ************************************** //

                $scope.bDatasetReview = false;
                $scope.datasetReviewList = [];
                $scope.iNrDatasetToReview = 0;

                RodiSrv.getAllDatasetList(
                    function(data)
                    {
                        // Success

                        $scope.datasetReviewList = $filter('filter')(data, {'is_reviewed': false});

                        if ($scope.datasetReviewList.length > 0)
                        {
                            $scope.iNrDatasetToReview = $scope.datasetReviewList.length;
                            $scope.bDatasetReview = true;

                        } else {$scope.bDatasetReview = false;}

                    }, function(data)
                    {
                        // Error
                        console.log(data);
                    })


            }

            // ************************************** //
            // ********* ALL USER FUNCTIONS ********* //
            // ************************************** //

            $scope.myDatasetList = [];
            $scope.iNrMyDataset = 0;

            if ($scope.bLogin)
            {
                // Profile dataset list
                $scope.bDatasetProfile = false;
                RodiSrv.getProfileDataset($scope.tokenid,
                    function(data){
                        // Success
                        if (data.length > 0)
                        {
                            $scope.iNrMyDataset = data.length;
                            $scope.myDatasetList = data;
                            $scope.bDatasetProfile = true;

                        } else {$scope.bDatasetProfile = false;}
                    }, function(data){
                        // Error
                        $scope.bDatasetProfile = false;
                    })
            }

        });

        $scope.putProfile = function()
        {
            // Save new profile data

            RodiSrv.saveProfile($scope.tokenid, $scope.userinfo,
                function(data){
                    //Success
                    vex.dialog.alert('Profile saved successfully');
                }, function(data){
                    // Error
                    vex.dialog.alert('Error: unable to save data');
                }
            );
        }

        $scope.resetProfilePsw = function(old_psw, new_psw, confirm_psw)
        {
            // Resetto la password per il profilo

            if(old_psw != '' && new_psw != ''){
                // All fileds are compiled
                if(confirm_psw == new_psw)
                {
                    // New password e confirm password corrisponded
                    RodiSrv.resetProfilePsw($scope.tokenid, old_psw, new_psw,
                        function(data){
                            // Success
                            vex.dialog.alert('Password update!');
                        }, function(data){
                            // Error
                            var sMsg = "";
                            angular.forEach(data, function(value, key) {
                                sMsg = key.replace("_"," ") + ': ' + value
                            });

                            vex.dialog.alert(sMsg);

                        })

                } else {
                    vex.dialog.alert('Error: New password and password confirmation are not the same');
                }
            } else {
                vex.dialog.alert('Error: You must insert old password, new password and confirm the new password');
            }
        }

    }

    // ************************************** //
    // ********** DATASET LIST ************** //
    // ************************************** //

    if ($location.path().indexOf('dataset_list.html') !== -1)
    {

        $scope.idCountry = $location.search().idcountry;
        $scope.idDatasetCat = $location.search().idcategory;
        $scope.bLoading = true;
        $scope.bNoDataset = false;
        $scope.datasetList = [];
        $scope.aCategory = [];
        $scope.aApplicability = [];

        $scope.questions = RodiSrv.getQuestions();
        $scope.HazardCategory = RodiSrv.getDataCategoryIcon();
        $scope.arrayHazardList=RodiSrv.getHazardList();

        RodiSrv.getCountryList(function(data)
        {
            // Success

            $scope.countryList = data;
            $scope.objCountry = $filter('filter')($scope.countryList, {iso2: $scope.idCountry});

        }, function(data)
        {
            // Error API
            console.log(data);
        });

        $scope.getHCIcon = function(index)
        {
            return RodiSrv.getHCIcon(index - 1);
        };

        // Load Dataset list with filter
        $scope.loadDatasetList = function()
        {
            $scope.datasetList = [];
            $scope.bLoading = true;

            RodiSrv.getDatasetlistFiltered($scope.idCountry, $scope.aCategory, $scope.aApplicability,
                function(data)
                {
                    // Success
                    $scope.datasetList = data;

                    $scope.tableParams = new NgTableParams({}, { dataset: $scope.datasetList});

                }, function(data)
                {
                    // Error API
                    console.log(data);
                })

            $scope.bLoading = false;
        }

        if($scope.idDatasetCat !== '0')
        {
            // Category filter initialize
            $scope.aCategory = [];

            RodiSrv.getDataRiskCategory(0,
                function(data)
                {
                    // Success

                    $scope.DataCategory = $filter('filter')(data,
                        function(e)
                        {
                            return e.category.id == $scope.idDatasetCat;
                        }
                    );

                    $scope.aCategory.push($scope.DataCategory[0].category.name);
                    $scope.loadDatasetList();


                }, function(data)
                {
                    console.log(data);
                }
            );


        } else
            {
                $scope.loadDatasetList();
            }

        $scope.setFilterApplicabilityDatasetList = function (filter) {

            var index = $scope.aApplicability.indexOf(filter);

            if (index >-1){
                $scope.aApplicability.splice(index,1);
                $scope.loadDatasetList();
            }else {
                $scope.aApplicability.push(filter);
                $scope.loadDatasetList();
            }

        };

        $scope.filterApplicabilityCssClass = function (filter) {
            var index =$scope.aApplicability.indexOf(filter);
            if (index >-1){
                return "active";
            }else return "unactive";
        };

        $scope.filterApplicabilityCssStyle = function (filter) {
            var index =$scope.aApplicability.indexOf(filter);
            if (index >-1){
                // return {"background-color" : '#2EA620' } ;
                return {"background-color" : 'white' } ;
            }else return "";
        };

        $scope.setFilterCategoryDatasetList = function (filter) {

            var index = $scope.aCategory.indexOf(filter);

            if (index >-1){
                $scope.aCategory.splice(index,1);
                $scope.loadDatasetList();
            }else {
                $scope.aCategory.push(filter);
                $scope.loadDatasetList();
            }
        };

        $scope.filterCategoryCssClass = function (filter) {
            var index =$scope.aCategory.indexOf(filter);
            if (index >-1){
                return "active";
            }else return "unactive";
        };

        $scope.filterCategoryCssStyle = function (filter) {
            var index =$scope.aCategory.indexOf(filter);
            if (index >-1){
                // return {"background-color" : '#2EA620' } ;
                return {"background-color" : 'white' } ;
            }else return "";
        };



        // Dataset page -- OLD VERSION

        // $scope.DataCategory = [];
        // $scope.DatasetList_Country_DataCat = [];



        // RodiSrv.getDatasetlist(function (data) {
        //     $scope.datasetList = data;
        // });

        // $scope.arrayHazardList=RodiSrv.getHazardList();


        // $scope.filterArray = [];


        // http://localhost:63342/RODIGitHub/frontend/%7B%7B$LocationProvider.$get%7D%7D





        // $scope.buildFilterdObject = function () {
        //
        //     $scope.newSetOfData = [];
        //     console.log($scope.filterArray);
        //
        //     $scope.DatasetList.forEach(function (item) {
        //         applicability check
                //
                // var bApplicability =  false;
                //
                // if(item.keydataset.applicability && item.keydataset.applicability.length == 0){
                //     bApplicability = true;
                //
                // } else{
                //     for(var filter in $scope.filterArray){
                //         if ( item.tag.indexOf($scope.filterArray[filter])>-1){
                //             bApplicability = true;
                //         }
                //     }
                // }
                //
                // var hasCategory =($scope.filterArray.indexOf(item.keydataset.category)>-1);
                //
                // se non ci sono selezionate categorie le prendo tutte
                // if ($scope.filterArray.length == 0) hasCategory = true;

                //selectdCountry
                // var isCountrySelected = item.country==$scope.idCountry

                // (item.keydataset.applicability.indexOf())

                // if((hasCategory || bApplicability) && isCountrySelected){
                //     $scope.newSetOfData.push(item);
                // }
            // });
            // $scope.tableParams = new NgTableParams({}, { dataset: $scope.newSetOfData});
            //console.log($scope.DatasetList_Country_DataCat);

        // }


        // RodiSrv.getCountryList(
        //     function(data){
                // Success
                // $scope.countryList = data;
                // $scope.objCountry = $filter('filter')($scope.countryList, {iso2: $scope.idCountry});

                // Get Data risk category
                // RodiSrv.getDataRiskCategory(0,
                //     function(data)
                //     {
                        // Success

                        // $scope.DataCategory = $filter('filter')(data,
                        //     function(e)
                        //     {
                        //         return e.category.id == $scope.idDatasetCat;
                        //     }
                        // );


                        // Get & filter dataset list
                        // RodiSrv.getDatasetlist(
                        //     function(data)
                        //     {
                        //         // Success
                        //         //console.log(data);
                        //
                        //         $scope.DatasetList = data;
                        //
                        //
                        //         $scope.DatasetList_Country_DataCat = $filter('filter')(data,
                        //             function(e)
                        //             {
                        //                 return e.country == $scope.idCountry && e.keydataset.category == $scope.DataCategory[0].category.name;
                        //             }
                        //         );
                        //
                        //
                        //         $scope.tableParams = new NgTableParams({}, { dataset: $scope.DatasetList_Country_DataCat});
                        //
                        //         //preset Filter
                        //         if($scope.filterArray.indexOf($scope.DataCategory[0].category.name)==-1) $scope.filterArray.push($scope.DataCategory[0].category.name)
                        //
                        //         //load all applicability
                        //         // $scope.arraypippo=[]
                        //         // $scope.DatasetList.forEach(function (item) {
                        //         //     if (item.keydataset.applicability){
                        //         //         item.keydataset.applicability.forEach(function (item2) {
                        //         //           if ($scope.arraypippo.indexOf(item2)== -1)$scope.arraypippo.push(item2);
                        //         //         })
                        //         //     }
                        //         // });
                        //         // console.log($scope.arraypippo);
                        //
                        //
                        //         if ($scope.DatasetList_Country_DataCat.length > 0)
                        //         {
                        //             $scope.bNoDataset = false;
                        //         } else
                        //             {
                        //                 $scope.bNoDataset = true;
                        //             }
                        //
                        //         $scope.bLoading = false;
                        //
                        //     }, function(data)
                        //     {
                                //Error
                                // console.log(data);
                                // $scope.bLoading = false;
                                // $scope.bNoDataset = true;
                            // }
                        // );

                    // }, function(data)
                    // {
                    //     console.log(data);
                    // }
                // );


            // }, function(data){
            //     Error
            //     TODO: error message
        // });

    }

} ]);

