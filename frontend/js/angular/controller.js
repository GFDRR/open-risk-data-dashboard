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

    if ($location.path().indexOf('index') !== -1)
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

    if ($location.path().indexOf('contribute.html') !== -1){

        $scope.tabpar = $location.search().tab;

        if($scope.tabpar)
        {
            $scope.tab = $scope.tabpar;
        } else {$scope.tab = 0;}

        // Dataset classification set
        $scope.datasetScale = [];
        $scope.dataCategory = [];
        $scope.datasetCategory = [];
        $scope.datasetDescription = [];
        $scope.datasetTags = [];
        $scope.selectedTags = [];
        $scope.newTag = "";
        $scope.selectedLink = [];
        $scope.newLink = "";

        $scope.objDataset = RodiSrv.getDatasetEmptyStructure();

        // Get Dataset scale
        RodiSrv.getDatasetScale(
            function(data){
                // Success
                $scope.datasetScale = data;

                // Sets the category list by filtering for National value
                RodiSrv.getDataCategory(2,
                    function(data){
                        // Success
                        $scope.dataCategory = data;
                    }, function(data){
                        // Error
                        $scope.dataCategory = [{id:-999, name:'Error loading category'}];
                    })

            }, function(data){
                // Error
                $scope.datasetScale = [];
            })

        // Sets Dataset Category for start
        RodiSrv.getDatasetCategory(2, 0,
            function(data){
                // Success
                $scope.datasetCategory = data;
            }, function(data)
            {
                //Error
                $scope.datasetCategory = [];
            })

        // Set Data category
        $scope.setDataCategory = function(id_scale)
        {
            RodiSrv.getDataCategory(id_scale,
                function(data){
                    // Success
                    $scope.dataCategory = data;
                }, function(data){
                    // Error
                    $scope.dataCategory = [{id:-999, name:'Error loading category'}];
            })
        }

        $scope.setDatasetCategory = function(id_scale, id_datacat)
        {
            RodiSrv.getDatasetCategory(id_scale, id_datacat,
                function(data){
                    // Success
                    $scope.datasetCategory = data;
                }, function(data)
                {
                    //Error
                    $scope.datasetCategory = [];
                })
        }

        $scope.setDatasetDesc  =function(id_scale, id_datacat, id_datasetcat)
        {
            RodiSrv.getDatasetDescription(id_scale, id_datacat, id_datasetcat,
                function(data)
                {
                    //Success
                    $scope.datasetDescription = data;
                }, function(data)
                {
                    //error
                    $scope.datasetDescription = [];
                })
        }

        // Set suggested tags
        RodiSrv.getDatasetTags(function(data){
            // Success
            $scope.datasetTags = data.tags
        }, function(data){
            // Error
        });

        $scope.setTags = function(indexTags)
        {
            //

            var indexElem = $scope.selectedTags.indexOf($scope.datasetTags[indexTags]);

            if(indexElem !== -1)
            {
                $scope.selectedTags.splice(indexElem, 1);
            } else {
                $scope.selectedTags.push($scope.datasetTags[indexTags]);
            }

        }

        $scope.addTag = function(strTag)
        {
            var indexElem = $scope.datasetTags.indexOf(strTag);
            if(indexElem == -1)
            {
                $scope.datasetTags.push(strTag);
                $scope.newTag = "";
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
            var objQuestLost = [];
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
                RodiSrv.getKeydatasetId($scope.objDataset.keydataset.scale, $scope.objDataset.keydataset.category,
                    $scope.objDataset.keydataset.dataset, $scope.objDataset.keydataset.description,
                    function(data)
                    {
                        // Success
                        $scope.objDataset.keydataset = data[0].id;

                        // Save the dataset structure
                        RodiSrv.saveDataset($scope.tokenid, $scope.objDataset,
                            function(data){
                                //Success
                                vex.dialog.alert('Dataset insert correctly');
                                $scope.objDataset = RodiSrv.getDatasetEmptyStructure();
                            }, function(data){
                                //Error
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


            // ************************************** //
            // ********* ALL USER FUNCTIONS ********* //
            // ************************************** //

            $scope.myDatasetList = [];

            if ($scope.bLogin)
            {
                // Profile dataset list
                $scope.bDatasetProfile = false;
                RodiSrv.getProfileDataset($scope.tokenid,
                    function(data){
                        // Success
                        if (data.length > 0)
                        {
                            console.log('Succee');
                            console.log(data);
                            $scope.myDatasetList = data;
                            $scope.bDatasetProfile = true;

                        } else {$scope.bDatasetProfile = false;}
                    }, function(data){
                        // Error
                        console.log('Error');
                        console.log(data);
                        $scope.bDatasetProfile = false;
                    })
            }

            // ************************************** //
            // ******* REVIEWER USER FUNCTIONS ****** //
            // ************************************** //
            if ($scope.bLogin && $scope.userinfo.groups[0] == 'reviewer'){

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
                            console.log(data);
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
        $scope.idHazCat = $location.search().idcategory;

        RodiSrv.getCountryList(
            function(data){
                // Success
                $scope.countryList = data;

                $scope.HazardCategory = [];
                RodiSrv.getDataCategory('1',
                    function(data){
                        // Success
                        $scope.HazardCategory = data;

                        $scope.HazardCategory = $filter('filter')($scope.HazardCategory, function(e){
                            return e.category.id == $scope.idHazCat;
                        });

                    }, function(data){
                        //Error
                    });

                $scope.objCountry = $filter('filter')($scope.countryList, {iso2: $scope.idCountry});


            }, function(data){
                // Error
                // TODO: error message
        });

        RodiSrv.getDatasetList_bycountry($scope.idCountry,
            function(data){
                // Success
                console.log(data);
            }, function(data){
                // Error
                console.log(data);
            })

    }

    if ($location.path().indexOf('dataset_details.html') !== -1)
    {
        // Dataset details page
        $scope.idDataset = $location.search().keyds;
        $scope.bMylist = $location.search().ml;
        $scope.bReviewer = false;
        $scope.biddataset = false;
        $scope.bEdit = false;

        // Check the dataset pk
        if ($scope.idDataset != null)
        {
            // pk OK
            $scope.biddataset = true;

            $scope.$watch('bLogin', function()
            {
                if($scope.bLogin)
                {
                    $scope.tokenid = $cookieStore.get('rodi_token');
                    $scope.userinfo = $cookieStore.get('rodi_user');

                    // Get dataset info
                    RodiSrv.getDatasetInfo($scope.tokenid, $scope.idDataset,
                        function(data)
                        {
                            // Success

                            // Check if user logged in can edit dataset
                            if($scope.userinfo.groups[0] == 'reviewer' || $scope.userinfo.groups[0] == 'admin' || data.owner == $scope.userinfo.username)
                            {
                                // Reviewer user
                                $scope.bReviewer = true;

                                $scope.objDataset = data;

                                // Dataset classification set for edit
                                $scope.datasetScale = [];
                                $scope.dataCategory = [];
                                $scope.datasetCategory = [];
                                $scope.datasetDescription = [];
                                $scope.datasetTags = [];
                                $scope.selectedTags = $scope.objDataset.tag;
                                $scope.newTag = "";
                                $scope.selectedLink = $scope.objDataset.url;
                                $scope.newLink = "";

                                // Get Dataset scale
                                RodiSrv.getDatasetScale(
                                    function(data){
                                        // Success
                                        $scope.datasetScale = data;

                                        // Sets the category list by filtering for National value
                                        RodiSrv.getDataCategory(2,
                                            function(data){
                                                // Success
                                                $scope.dataCategory = data;
                                            }, function(data){
                                                // Error
                                                $scope.dataCategory = [{id:-999, name:'Error loading category'}];
                                            })

                                    }, function(data){
                                        // Error
                                        $scope.datasetScale = [];
                                    })

                                // Set Data category
                                $scope.setDataCategory = function(id_scale)
                                {
                                    RodiSrv.getDataCategory(id_scale,
                                        function(data){
                                            // Success
                                            $scope.dataCategory = data;
                                        }, function(data){
                                            // Error
                                            $scope.dataCategory = [{id:-999, name:'Error loading category'}];
                                        })
                                }

                                $scope.setDatasetCategory = function(id_scale, id_datacat)
                                {
                                    RodiSrv.getDatasetCategory(id_scale, id_datacat,
                                        function(data){
                                            // Success
                                            $scope.datasetCategory = data;
                                        }, function(data)
                                        {
                                            //Error
                                            $scope.datasetCategory = [];
                                        })
                                }

                                $scope.setDatasetDesc  =function(id_scale, id_datacat, id_datasetcat)
                                {
                                    RodiSrv.getDatasetDescription(id_scale, id_datacat, id_datasetcat,
                                        function(data)
                                        {
                                            //Success
                                            $scope.datasetDescription = data;
                                        }, function(data)
                                        {
                                            //error
                                            $scope.datasetDescription = [];
                                        })
                                }

                                // Set suggested tags
                                RodiSrv.getDatasetTags(function(data){
                                    // Success
                                    $scope.datasetTags = data.tags

                                }, function(data){
                                    // Error
                                });

                                // for tags
                                $scope.checkSelected = function(tag)
                                {
                                    var indexElem = $scope.selectedTags.indexOf(tag);

                                    if(indexElem > -1)
                                    {
                                        return true;
                                    }
                                }

                                $scope.setTags = function(indexTags)
                                {
                                    //

                                    console.log('Set Check');

                                    var indexElem = $scope.selectedTags.indexOf($scope.datasetTags[indexTags]);

                                    if(indexElem !== -1)
                                    {
                                        $scope.selectedTags.splice(indexElem, 1);
                                    } else {
                                        $scope.selectedTags.push($scope.datasetTags[indexTags]);
                                    }

                                    console.log($scope.selectedTags);

                                }

                                $scope.addTag = function(strTag)
                                {
                                    var indexElem = $scope.datasetTags.indexOf(strTag);
                                    if(indexElem == -1)
                                    {
                                        $scope.datasetTags.push(strTag);
                                        $scope.newTag = "";
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

                                RodiSrv.getCountryList(
                                    function(data){
                                        // Success
                                        $scope.countryList = data;
                                    }, function(data){
                                        // Error
                                        // TODO: error message
                                    });

                                $scope.questions = RodiSrv.getQuestions();

                                $scope.saveSelection = function(qcode, value)
                                {
                                    $scope.objDataset[qcode] = value;
                                    console.log($scope.objDataset);

                                }

                            } else
                            {
                                // Standard user
                                $scope.bReviewer = false;
                            }

                        }, function(data)
                        {
                            // Error
                            console.log(data);
                        })
                } else
                    {
                        $scope.bReviewer = false;
                        $scope.bEdit = false;
                    }
            });

        } else
            {
                // pk Error
                $scope.biddataset = false;
                $scope.bReviewer = false;
                $scope.bEdit = false;
            }

        $scope.setEditForm = function()
        {
            $scope.bEdit = true;
        }

        $scope.closeRevision = function()
        {
            $scope.bEdit = false;
        }

    }

} ]);
