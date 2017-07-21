/**
 * Created by Manuel on 15/05/2017.
 */

RodiApp.controller('RodiCtrl', ['$scope', 'RodiSrv', '$window', '$filter', '$cookieStore', '$location', function ($scope, RodiSrv, $window, $filter, $cookieStore, $location) {

    // ************************************** //
    // *************** INIT ***************** //
    // ************************************** //

    $scope.bLogin = false;
    $scope.tokenid = $cookieStore.get('rodi_token');
    $scope.userinfo = $cookieStore.get('rodi_user');

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

        // Chiamo il service per compilare l'arrayData
        $scope.arrayData = RodiSrv.getMapScores($scope.objHazardFilters);

        // Chiamo il servizio per le news
        $scope.news = RodiSrv.getNewsList(4);

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
    // ************* MATRIX ***************** //
    // ************************************** //

    if ($location.path().indexOf('browse-data.html') !== -1)
    {
        // Get the Hazard Category
        $scope.HazardCategory = RodiSrv.getDataCategoryIcon();

        $scope.matrixData = RodiSrv.getMatrixData($scope.objHazardFilters);

        $scope.getHCIcon = function(index)
        {
            return RodiSrv.getHCIcon(index - 1);
        };

        $scope.colorCell = function(value){
            return RodiSrv.matrixColorCell(value);
        }
    }

    // ************************************** //
    // ********* CONTRIBUTE PAGE ************ //
    // ************************************** //

    if ($location.path().indexOf('contribute.html') !== -1)
    {

        $scope.tabpar = $location.search().tab;

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

        $scope.changeDatasetSelection = function(idDataset)
        {
            if(idDataset !== '0')
            {
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
                        } else
                        {
                            $scope.datasetTags=[];
                            $scope.sTagsMsg = "** No elemnts available **";
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
                                vex.dialog.alert("Unable to save the dataset data");
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
    // ****** DATASET LIST & DETAILS ******** //
    // ************************************** //

    if ($location.path().indexOf('dataset_list.html') !== -1)
    {
        // Dataset page
        $scope.idCountry = $location.search().idcountry;
        $scope.idDatasetCat = $location.search().idcategory;
        $scope.DataCategory = [];
        $scope.DatasetList_Country_DataCat = [];
        $scope.bLoading = true;
        $scope.bNoDataset = false;

        RodiSrv.getCountryList(
            function(data){
                // Success
                $scope.countryList = data;
                $scope.objCountry = $filter('filter')($scope.countryList, {iso2: $scope.idCountry});

                // Get Data risk category
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

                        // Get & filter dataset list
                        RodiSrv.getDatasetlist(
                            function(data)
                            {
                                // Success

                                $scope.DatasetList_Country_DataCat = $filter('filter')(data,
                                    function(e)
                                    {
                                        return e.country == $scope.idCountry && e.keydataset.category == $scope.DataCategory[0].category.name;
                                    }
                                );

                                if ($scope.DatasetList_Country_DataCat.length > 0)
                                {
                                    $scope.bNoDataset = false;
                                } else
                                    {
                                        $scope.bNoDataset = true;
                                    }

                                $scope.bLoading = false;

                            }, function(data)
                            {
                                //Error
                                console.log(data);
                                $scope.bLoading = false;
                                $scope.bNoDataset = true;
                            }
                        );

                    }, function(data)
                    {
                        console.log(data);
                    }
                );


            }, function(data){
                // Error
                // TODO: error message
        });

    }

} ]);
