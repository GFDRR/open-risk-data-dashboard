/**
 * Created by Manuel on 15/05/2017.
 */

RodiApp.controller('RodiCtrl', ['$scope', 'RodiSrv', '$window', '$filter', '$location','NgTableParams','$timeout', '$q', function ($scope, RodiSrv, $window, $filter, $location,NgTableParams,$timeout,$q) {


    // ************************************** //
    // *************** INIT ***************** //
    // ************************************** //

    // Check server CALL

    $scope.isIE11 = !!window.MSInputMethodContext && !!document.documentMode;

    $scope.bLogin = false;
    $scope.tokenid = localStorage.getItem('rodi_token');
    $scope.userinfo = JSON.parse(localStorage.getItem('rodi_user'));
    $scope.baseURL = baseAPIurl;

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

    $scope.changepage = RodiSrv.changepage;

    // ************************************** //
    // ************ HOME PAGE *************** //
    // ************************************** //
    if ($location.path().indexOf('index') !== -1 || $location.path() === '/')
    {
        $scope.bLoading = true;
        $scope.datasets_count = 0;
        $scope.fully_covered_countries_count = 0;
        $scope.datasets_open_count = 0;
        $scope.datasets_restricted_count = 0;
        $scope.datasets_closed_count = 0;
        $scope.datasets_unknown_count = 0;
        $scope.global_datasets_count = 0;

        function isNotWorld (country) {
          return country.country !== "AA";
        }

        function isWorld (country) {
          return country.country === "AA";
        }

        RodiSrv.getCountriesScoring().then(function(data) {
            // total datasets
            $scope.datasets_count = data.datasets_count;

            // global datasets total
            data.countries.filter(isWorld).forEach(function(country){
              $scope.global_datasets_count += country.datasets_count;
            });

            // open/restricted/closed/unknown totals
            // and fully covered countries
            data.countries.filter(isNotWorld).forEach(function(country){
              if (country.datasets_unknown_count === 0) {
                $scope.fully_covered_countries_count++;
              }

              $scope.datasets_open_count += country.datasets_open_count;
              $scope.datasets_restricted_count += country.datasets_restricted_count;
              $scope.datasets_closed_count += country.datasets_closed_count;
              $scope.datasets_unknown_count += country.datasets_unknown_count;
            });

            $scope.bLoading = false;
        });


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
    // ********** COUNTRIES PAGE ************ //
    // ************************************** //

    if ($location.path().indexOf('countries.html') !== -1)
    {

        $scope.filterType = "";
        $scope.filterValue = '';
        $scope.countriesFiltered = [];
        $scope.countriesListWithScore = [];
        $scope.countryGroups = [];
        $scope.sortField = "-score";
        $scope.sortPredicate = ["-datasets_open_count", "-datasets_restricted_count", "-datasets_closed_count", "name"];
        $scope.allCountries = [];
        // it holds the number of (as of Nov. 2018, the value is 36)
        $scope.keydatasetsCount = 0;
        $scope.bLoadingTabel = true;

        $scope.setFilter = function (type, value){
          if (!value) {
            $scope.filterType = '';
            $scope.filterValue = '';
            $scope.countriesFiltered = [];
          }
          else {
            $scope.filterType = type;
            $scope.filterValue = value;
            $scope.bLoadingTabel = true;

            RodiSrv.getRealCountryList([type, value]).then(function(response){
              $scope.bLoadingTabel = false;

              $scope.countriesFiltered = response.data.map(function(country){
                return country.wb_id;
              });
            });
          }
        };

        $scope.filterBy = function(country) {
          if (!$scope.filterType && !$scope.filterValue) {
            return true;
          }
          else {
            return $scope.countriesFiltered.indexOf(country.wb_id) !== -1;
          }
        };

        $scope.sortBy = function(property, alias) {
            $scope.sortField = alias || property;
            $scope.sortPredicate = property;
        }

        $scope.mergeMatrixData= function() {
          $scope.allCountries = $scope.allCountries.map(function(country){
            var countryScore = $scope.countriesListWithScore.find(function(item){
              return item.country == country.wb_id;
            });

            return Object.assign({}, country, countryScore || {country: country.wb_id, rank: 0, score: 0, fullscores_count: 0, datasets_count: 0});
          });
        };

        function initPage()
        {
            var p1 = RodiSrv.getRealCountryList().then(function (response) {
                $scope.allCountries = response.data.map(function(country){
                  // TODO: remove this map function
                  // when country list returns wb_id instead of iso2 codes
                  // cf. https://github.com/GFDRR/open-risk-data-dashboard/issues/244
                  country.wb_id = country.wb_id || country.iso2;
                  return country;
                });

                $scope.bLoadingTabel = false;
            });

            RodiSrv.getCountryGroups().then(function(response){
              $scope.countryGroups = response.data;
            });

            var p2 = RodiSrv.getCountriesScoring([$scope.filterType, $scope.filterValue]).then(function (data) {
                $scope.keydatasetsCount = data.keydatasets_count;
                $scope.countriesListWithScore = data.countries.map(function(country){
                  country.score = Number(country.score);
                  return country;
                });
            });

            $q.all([p1, p2]).then(function(results){
              $scope.mergeMatrixData();
            });
        }

        initPage();

        $scope.colorCell = function (value) {
            return RodiSrv.matrixColorCell(value);
        }
    }

    // ************************************** //
    // ********* SUBMIT PAGE ************ //
    // ************************************** //

    if ($location.path().indexOf('contribute.html') !== -1)
    {

        $scope.tabpar = $location.search().tab;
        $scope.country_id = $location.search().country_id;
        $scope.datasetpar = $location.search().ds;
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
        $scope.newLink = {meta:'', link:''};
        $scope.bLoadingUpdateScoring = false;
        $scope.bLoadingTabelReview = true;

        $scope.objDataset = RodiSrv.getDatasetEmptyStructure();

        // Load all data risk category
        RodiSrv.getDataRiskCategory(0,
            function(data)
            {
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

                // $scope.datasetCategory = data; -> Original without filter on National Level
                // $scope.datasetCategoryAll = angular.copy(data); -> Original without filter on National Level

                /*****************************************/
                /******** FILTER ONLY NATIONAL ***********/
                /*****************************************/

                $scope.datasetCategory = $filter('filter')(data, function(item){
                    return item.level == 'National';
                });

                $scope.datasetCategoryAll = angular.copy(data);

                /*****************************************/
                /******** FILTER ONLY NATIONAL ***********/
                /*****************************************/


                // Check dataset parameter
                if($scope.datasetpar)
                {
                    var aItem = [];
                    aItem = $filter('filter')($scope.datasetCategory, function(item)
                    {
                        return item.dataset.name == $scope.datasetpar;
                    });

                    $scope.objDataset.keydataset.dataset = aItem[0].dataset.id + '';

                    setDatasetDescription($scope.objDataset.keydataset.dataset)
                }

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
                    //$scope.datasetCategory = data; -> Original without NATIONAL Filter

                    /*****************************************/
                    /******** FILTER ONLY NATIONAL ***********/
                    /*****************************************/

                    $scope.datasetCategory = $filter('filter')(data, function(item){
                        return item.level == 'National';
                    });

                    /*****************************************/
                    /******** FILTER ONLY NATIONAL ***********/
                    /*****************************************/

                    $scope.objDataset.keydataset.dataset = '0';
                    $scope.objDataset.keydataset.level = '0';
                    $scope.datasetScale = [];
                    $scope.objDataset.keydataset.description = '0';
                    $scope.datasetDescription = [];

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

            setDatasetDescription(idDataset)
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

            } else
            {
                $scope.datasetScaleId = "0";
                $scope.objDataset.keydataset.level = "0";
            }
        }

        $scope.addLink = function(strLink)
        {

            //Check protocol
            var indexProtocolCheck = strLink.indexOf('http');

            if(indexProtocolCheck == -1)
            {
                //Add protocol to link
                strLink = "http://" + strLink;
            }

            var indexElem = $scope.selectedLink.indexOf(strLink);
            if(indexElem == -1)
            {
                $scope.selectedLink.push(strLink);
            }

            $scope.newLink = {meta:'', link:''};

        }

        $scope.deleteLink = function(link)
        {
            var indexElem = $scope.selectedLink.indexOf(link);

            $scope.selectedLink.splice(indexElem, 1);

        }

        RodiSrv.getCountryList().then(function(response){
                // Success
                $scope.countryList = response.data;

                // Check country parameters
                if($scope.country_id) {
                    $scope.objDataset.country = $scope.country_id;
                };

                $scope.getCountryNameReview = function(country)
                {
                    var aCountry = $filter('filter')($scope.countryList, function(item){
                        return item.wb_id == country;
                    })

                    if (aCountry.length > 0)
                    {
                        return aCountry[0].name;
                    }
                }

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

                                vex.dialog.alert("Thanks! Dataset was successfully submitted and will be reviewed.");
                                $scope.objDataset = RodiSrv.getDatasetEmptyStructure();
                                $scope.selectedLink = [];
                                $scope.newLink = "";
                                $scope.newLink = {meta:'', link:''};

                                $window.scrollTo(0,0);

                            }, function(error){
                            //     Error
                                console.error(error);
                                vex.dialog.alert("Unable to save the dataset data: " + error.data);
                            })

                    }, function(error)
                    {
                        // Error
                        console.error('Error');
                        console.error(error);
                    })
            }

        }

        $scope.questionHelp = function(index)
        {
            vex.dialog.alert(RodiSrv.getQuestionsHelp(index));
        }

        function setDatasetDescription(idDataset)
        {

            $scope.datasetDescription = [];

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

                        // $scope.datasetDescription = data; -> Original without National Filter

                        /*****************************************/
                        /******** FILTER ONLY NATIONAL ***********/
                        /*****************************************/

                        $scope.datasetDescription = $filter('filter')(data, function(item){
                            return item.level == "National";
                        });

                        /*****************************************/
                        /******** FILTER ONLY NATIONAL ***********/
                        /*****************************************/

                        //Set National description like default selection
                        var nationalDesc = $filter('filter')($scope.datasetDescription, function(item){
                            return item.level == "National";
                        });

                        if (nationalDesc.length > 0){
                            // Find National description
                            $scope.objDataset.keydataset.description = nationalDesc[0].description.code;
                        } else {
                            $scope.objDataset.keydataset.description = '0';
                        }

                        $scope.objDataset.keydataset.level = '0';

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
                    function(error)
                    {
                        console.error(error);
                    }
                );
            } else
            {
                $scope.bDescInfo = false;
                $scope.objDataset.keydataset.level = '0';
                $scope.datasetScale = [];
                $scope.objDataset.keydataset.description = '0';
                $scope.datasetDescription = [];
            }
        }

        $scope.updateScoringMan = function()
        {
            // Update scoring manually

            $scope.bLoadingUpdateScoring = true;

            RodiSrv.updateScoring($scope.tokenid,
                function(data)
                {
                    // Success

                    $scope.bLoadingUpdateScoring = false;
                    vex.dialog.alert("Scoring updated correctly");

                }, function(error)
                {
                    // Error
                    console.error(error);
                    vex.dialog.alert("Error: " + error.data);
                })

        }

        // ************************************** //
        // ****** USER PROFILE & DATA *********** //
        // ************************************** //

        $scope.$watch('bLogin', function() {

            if ($scope.bLogin){
                $scope.tokenid = localStorage.getItem('rodi_token');
                $scope.userinfo = JSON.parse(localStorage.getItem('rodi_user'));
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
                                // Check empty values and  password/confirm password
                                if($scope.usradmininfo.username !== '' && $scope.usradmininfo.password !=='' && $scope.usradmininfo.email !==''){

                                    //Check password equal confirm_password
                                    if ($scope.usradmininfo.password == $scope.usradmininfo.confirm_password){

                                        //Save data
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
                                                var sMsg = "";
                                                angular.forEach(data, function(value, key) {
                                                    sMsg += key.replace("_"," ") + ': ' + value + '<br /> ';

                                                });
                                                vex.dialog.alert(sMsg);
                                            })
                                    } else {
                                        // Password e confirm password not match
                                        vex.dialog.alert('Password and confirm password must be the same!');
                                    }

                                } else {
                                    // There are some fields empty
                                    vex.dialog.alert('All fields are required!');
                                }



                            } else {
                                // Edit User profile

                                if($scope.usradmininfo.email !=='')
                                {
                                    RodiSrv.saveUserInfo($scope.tokenid, $scope.usradmininfo,
                                        function(data){
                                            // Success
                                            vex.dialog.alert('User info saved successfully');
                                        }, function(data){
                                            // Error
                                            vex.dialog.alert('Error: unable to save data');
                                        }
                                    )
                                } else {
                                    vex.dialog.alert('All fileds are required!');
                                }


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

                $scope.bDatasetReview = true;
                $scope.datasetReviewList = [];
                $scope.iNrDatasetToReview = 0;
                $scope.reviewCountryFilter = "";

                RodiSrv.getAllDatasetList(
                    function(data)
                    {
                        // Success

                        $scope.datasetReviewList = $filter('filter')(data, {'is_reviewed': false});

                        $scope.tableParamsReview = new NgTableParams({count: $scope.datasetReviewList.length}, { dataset: $scope.datasetReviewList});

                        if ($scope.datasetReviewList.length > 0)
                        {
                            $scope.iNrDatasetToReview = $scope.datasetReviewList.length;
                            $scope.bDatasetReview = true;

                        } else {$scope.bDatasetReview = false;}

                        $scope.bLoadingTabelReview = false;

                    }, function(error)
                    {
                        // Error
                        console.error(error);
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

                            $scope.tableParams = new NgTableParams({}, { dataset: $scope.myDatasetList});

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

            if(!$scope.userinfo.email == '')
            {
                RodiSrv.saveProfile($scope.tokenid, $scope.userinfo,
                    function(data){
                        //Success

                        //Update cookies info with DB data
                        RodiSrv.getUserInfo($scope.tokenid,
                            function(data){
                                //Success

                                localStorage.removeItem('rodi_user');
                                $scope.userinfo = {pk:data.pk, username:data.username, first_name:data.first_name, last_name:data.last_name, email:data.email, groups:data.groups, title:data.title, institution:data.institution};
                                localStorage.setItem('rodi_user', JSON.stringify($scope.userinfo));
                                vex.dialog.alert('Profile saved successfully');

                            }, function(data){
                                // Error
                                localStorage.removeItem('rodi_token');


                                vex.dialog.alert('Login error: unable to retrieve your information');
                                $scope.userinfo = RodiSrv.getUserStructureEmpty();

                                $scope.bLogin = false;
                            }
                        );



                    }, function(data){
                        // Error
                        vex.dialog.alert('Error: unable to save data');
                    }
                );
            } else {
                vex.dialog.alert('E-mail field is required!');
            }

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
    // ******** COMMON FUNCTIONS ************ //
    // ************************************** //

    $scope.formatStringLenght = function(desc){
        var shortLink = "";

        if (desc.length > 70)
        {
            shortLink = desc.substr(0, 70);
            shortLink = shortLink + ' ...';
        } else {
            shortLink = desc;
        }

        return shortLink;

    }

} ]);
