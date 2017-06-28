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
        $scope.HazardCategory = [];
        RodiSrv.getHazardCategory($scope.tokenid,
            function(data){
                // Success
                $scope.HazardCategory = data;
            }, function(data){
                //Error
            });

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
                    console.log(data);
                    $scope.datasetDescription = data;
                }, function(data)
                {
                    //error
                    console.log(data);
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

        // Get the Hazard Category
        // $scope.HazardCategory = [];
        // $scope.DatasetName = [];
        //
        // $scope.datasetScale = [];

        // RodiSrv.getHazardCategory($scope.tokenid,
        //     function(data){
        //         // Success
        //         $scope.HazardCategory = data;
        //
        //     }, function(data){
                Error
                // $scope.HazardCategory = ["Error loading Category"];
        // });

        // $scope.hazardList = RodiSrv.getHazardList();


        // $scope.setDatasetName = function(hcId)
        // {
        //     RodiSrv.getDatasetName(hcId,
        //         function(data){
                    // Success
                    // $scope.DatasetName = data;
                //
                // }, function(data){
                    // Error
                    // $scope.DatasetName = ["Error loading Dataset name"];
                // })
        // }

        // $scope.setDatasetDescription = function (hcId, dsId)
        // {
            // Sets dataset description by Dataset category

            // RodiSrv.getDatasetDescription(hcId, dsId,
            //     function(data)
            //     {
            //         // Success
            //         $scope.objDatasetDescription = data;
            //     }, function(data)
            //     {
            //         // Error
            //         $scope.objDatasetDescription = [];
            //     })
        //
        // }

        // $scope.setDatasetScale = function(hcId, dsId, descId)
        // {
        //     // Set the scale of dataset
        //     RodiSrv.getDatasetScale(hcId, dsId, descId,
        //         function(data){
        //             // Success
        //             console.log(data);
        //             $scope.datasetScale = data;
        //         }, function(data){
        //             //Error
        //             console.log(data);
        //         })
        // }

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

        }

        $scope.saveDataset = function()
        {

            console.log($scope.selectedTags);
            var objQuestLost = [];
            var aErrorsValidation = [];

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

                // Convert obj Kedataset in pk element (not string)
                $scope.objDataset.keydataset.id = 0;
                $scope.objDataset.keydataset.category = $scope.objDataset.keydataset.category * 1;
                $scope.objDataset.keydataset.dataset = $scope.objDataset.keydataset.dataset * 1;
                $scope.objDataset.keydataset.description = $scope.objDataset.keydataset.description * 1;
                $scope.objDataset.keydataset.resolution = $scope.objDataset.keydataset.resolution * 1;
                $scope.objDataset.keydataset.scale = $scope.objDataset.keydataset.scale * 1;

                RodiSrv.saveDataset($scope.tokenid, $scope.objDataset,
                    function(data){
                        //Success
                        vex.dialog.alert('Success');
                        $scope.objDataset = RodiSrv.getDatasetEmptyStructure();
                    }, function(data){
                        //Error
                        // var sMsg = "";
                        // angular.forEach(data, function(value, key) {
                        //     sMsg = key.replace("_"," ") + ': ' + value
                        // });

                        // vex.dialog.alert(sMsg);
                        console.log(data);
                        vex.dialog.alert("Unable to save the dataset data");

                    })
                // vex.dialog.alert('Under construction');
            }

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

                // Profile dataset list
                $scope.bDatasetProfile = false;
                RodiSrv.getProfileDataset($scope.tokenid,
                    function(data){
                        // Success
                        if (data.length > 0)
                        {
                            $scope.bDatasetProfile = true;
                        } else {$scope.bDatasetProfile = false;}

                    }, function(data){
                        // Error
                        $scope.bDatasetProfile = false;
                    })
            }

            // ************************************** //
            // ********* ALL USER FUNCTIONS ********* //
            // ************************************** //
            if ($scope.bLogin)
            {
                // Profile dataset list
                $scope.bDatasetProfile = false;
                RodiSrv.getProfileDataset($scope.tokenid,
                    function(data){
                        // Success
                        if (data.length > 0)
                        {
                            $scope.bDatasetProfile = true;

                        } else {$scope.bDatasetProfile = false;}
                    }, function(data){
                        // Error
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
                RodiSrv.getHazardCategory($scope.tokenid,
                    function(data){
                        // Success
                        $scope.HazardCategory = data;
                        console.log($scope.HazardCategory);

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

                    // Check if user logged in
                    if($scope.userinfo.groups[0] == 'reviewer' || $scope.userinfo.groups[0] == 'admin')
                    {
                        // Reviewer user
                        $scope.bReviewer = true;
                    } else
                    {
                        // Standard user
                        $scope.bReviewer = false;
                    }

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
