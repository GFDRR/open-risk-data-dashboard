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

    // Chiamo il service per compilare l'arrayData
    $scope.arrayData = RodiSrv.getMapScores($scope.objHazardFilters);

    // Chiamo il servizio per le news
    $scope.news = RodiSrv.getNewsList(4);

    $scope.changepage = function(page)
    {
        $window.location.href = baseUrl + page;
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

    $scope.matrixData = RodiSrv.getMatrixData($scope.objHazardFilters);
    $scope.matrixDataTypeList = RodiSrv.getHazardCategory();

    $scope.colorCell = function(value){
        return RodiSrv.matrixColorCell(value);
    }


    // ************************************** //
    // ********* CONTRIBUTE PAGE ************ //
    // ************************************** //

    if ($location.path().indexOf('contribute.html') !== -1){

        $scope.objDataset = RodiSrv.getDatasetEmptyStructure();
        $scope.objDatasetClass = RodiSrv.getDatasetClassification();

        RodiSrv.getCountryList(
            function(data){
                // Success
                $scope.countryList = data;
            }, function(data){
                // Error
                //TODO: error message
            });


        $scope.hazardList = RodiSrv.getHazardList();
        $scope.questions = RodiSrv.getQuestions();
        $scope.objResolutionList = [];
        $scope.bResolutionDisable = true;

        $scope.filterDatasetResolution = function()
        {
            var aFilter = [];
            if($scope.objDataset.dataset_type != '--')
            {
                // hazard category selected
                aFilter = $filter('filter')($scope.objDatasetClass, {code: $scope.objDataset.dataset_type});

                if (!angular.equals({}, aFilter[0].level))
                {
                    // Resolution found
                    $scope.objResolutionList = aFilter[0].level;
                    $scope.bResolutionDisable = false;
                } else {
                    $scope.bResolutionDisable = true;
                }
            }
        }

        $scope.saveSelection = function(qcode, value)
        {
            var iIndex = 0;
            var foundItem = $filter('filter')($scope.objDataset.questions, {code: qcode});

            iIndex = $scope.objDataset.questions.indexOf(foundItem[0]);
            $scope.objDataset.questions[iIndex].value = value;

        }

        $scope.saveDataser = function()
        {

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
                vex.dialog.alert('Under construction');
            }


            /*
             Save ***TODO***
             usr_ins
             data_ins
             */

            // var bMsh = RodiSrv.saveDataset($scope.objDataset);
            //
            // if (bMsh)
            // {
            //    Save success message
            //     vex.dialog.alert('Dataset Inserted correctly');
            //     $scope.objDataset = RodiSrv.getDatasetEmptyStructure();
            // } else
            // {
            //    Save error message
            // vex.dialog.alert('Error: dataser not insert!');
            // }
        }

        // ************************************** //
        // ****** USER PROFILE & DATA *********** //
        // ************************************** //

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
                            console.log(data);
                            vex.dialog.alert('Error: ');
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

} ]);
