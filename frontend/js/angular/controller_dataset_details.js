/**
 * Created by Manuel on 13/07/2017.
 */


RodiApp.controller('RodiCtrlDataset', ['$scope', 'RodiSrv', '$window', '$filter', '$cookieStore', '$location', function ($scope, RodiSrv, $window, $filter, $cookieStore, $location) {

    // ************************************** //
    // *************** INIT ***************** //
    // ************************************** //

    RodiSrv.checkAPIversion(function(data){}, function(data){});

    $scope.bLogin = false;
    // $scope.tokenid = $cookieStore.get('rodi_token');
    $scope.tokenid = localStorage.getItem('rodi_token');
    // $scope.userinfo = $cookieStore.get('rodi_user');
    $scope.userinfo = JSON.parse(localStorage.getItem('rodi_user'));

    if($scope.tokenid) {$scope.bLogin = true; } else {$scope.bLogin = false;}

    $scope.changepage = function(page)
    {
        $window.location.href = baseUrl + page;
    }

    // ************************************** //
    // ****** DATASET DETAILS & EDIT ******** //
    // ************************************** //

    // Dataset details page
    $scope.idDataset = $location.search().keyds;
    $scope.bMylist = $location.search().ml;
    $scope.bReviewlist = $location.search().rl;
    $scope.bReviewer = false;
    $scope.biddataset = false;
    $scope.bDelete = false;
    $scope.bEdit = false;
    $scope.objDataset = {};
    $scope.objDatasetView = {};
    $scope.istanceList = [];

    // Check the dataset pk
    if ($scope.idDataset != null)
    {
        // pk OK
        $scope.biddataset = true;

        // Get dataset info
        $scope.getQuestionCode = function(questionCode)
        {
            return RodiSrv.getQuestions_code(questionCode);
        }

        // Get dataset icon
        $scope.getQuestionIcon = function(questionCode)
        {
            return RodiSrv.getQuestions_icon(questionCode);
        }

        initDataset ()

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

            $scope.datasetDescription = [];

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
        }

        $scope.changeDescription = function(idDesc)
        {

            $scope.objDataset.keydataset.description = idDesc;

            if(idDesc !== '0')
            {

                // Get level of description
                var objDesc = $filter('filter')($scope.datasetDescription,
                    function(e)
                    {
                        return e.description.code == $scope.objDataset.keydataset.description;
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
                            $scope.selectedTags = [];
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

        $scope.saveSelection = function(qcode, value)
        {
            $scope.objDataset[qcode] = value;
        }

        $scope.questionHelp = function(index)
        {
            vex.dialog.alert(RodiSrv.getQuestionsHelp(index));
        }

        $scope.updateDataset = function()
        {
            // Update dataset info
            var aErrorsValidation = [];

            clearNoAvailableTagsInSelected();

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

                        if($scope.objDataset.owner == $scope.userinfo.username && $scope.userinfo.groups[0] !== 'reviewer' && $scope.userinfo.groups[0] !== 'admin')
                        {
                            // Dataset owner / API profile/dataset
                            RodiSrv.updateprofileDataset($scope.tokenid, $scope.objDataset,
                                function(data){
                                    // Success
                                    // Init tha new Dataset structure
                                    initDataset ()
                                    vex.dialog.alert('Dataset update correctly');

                                }, function(data){
                                    //     Error
                                    console.log(data);
                                    vex.dialog.alert("Unable to update the dataset");
                                }
                            );
                        } else
                        {
                            // Dataset owner / API profile/dataset
                            RodiSrv.updateAdminDataset($scope.tokenid, $scope.objDataset,
                                function(data){
                                    // Success
                                    vex.dialog.alert('Dataset update correctly');
                                    initDataset ()
                                }, function(data){
                                    //     Error
                                    console.log(data);
                                    vex.dialog.alert("Unable to update the dataset");
                                }
                            );
                        }

                    }, function(data)
                    {
                        // Error
                        console.log('Error');
                        console.log(data);
                    })
            }

        }

        $scope.deleteDataset = function()
        {
            // Delete the dataset structure

            vex.dialog.confirm({
                message: "Do you really want to delete the dataset?",
                callback: function(value){
                    if (value){

                        if($scope.objDataset.owner == $scope.userinfo.username)
                        {
                            RodiSrv.deleteprofileDataset($scope.tokenid, $scope.objDataset,
                                function(data){
                                    // Success
                                    vex.dialog.alert('Dataset delete successfully');

                                    $scope.changepage("contribute.html?tab=1");

                                }, function(data){
                                    //     Error
                                    console.log(data);
                                    vex.dialog.alert("Unable to delete the dataset");
                                }
                            );
                        } else
                        {
                            RodiSrv.deleteAdminDataset($scope.tokenid, $scope.objDataset,
                                function(data){
                                    // Success
                                    vex.dialog.alert('Dataset delete successfully');

                                    $scope.changepage("contribute.html?tab=1");

                                }, function(data){
                                    //     Error
                                    console.log(data);
                                    vex.dialog.alert("Unable to delete the dataset");
                                }
                            );
                        };


                    }
                }
            });


        }

        $scope.$watch('bLogin', function(newVal, oldVal)
        {
            if($scope.bLogin)
            {

                // Check if user logged in can edit dataset, LOAD DATASET PROFILE API
                if($scope.userinfo.groups[0] == 'reviewer' || $scope.userinfo.groups[0] == 'admin' || $scope.objDataset.owner == $scope.userinfo.username)
                {
                    // Reviewer user
                    $scope.bReviewer = true;
                    $scope.bDelete = true;

                } else
                {
                    // Standard user, load dataset from DATASET API
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

    $scope.formatLink = function(link){

        //Check protocol
        var indexProtocolCheck = link.indexOf('http');

        if(indexProtocolCheck == -1)
        {
            //Add protocol to link
            link = "http://" + link;
        }

        var shortLink = "";

        if (link.length > 70)
        {
          shortLink = link.substr(0, 70);
          shortLink = shortLink + ' [...]';
        } else {
                shortLink = link;
        }

        return shortLink;

    }

    $scope.chekprotocol = function(strLink)
    {
        //Check protocol
        var indexProtocolCheck = strLink.indexOf('http');

        if(indexProtocolCheck == -1)
        {
            //Add protocol to link
            strLink = "http://" + strLink;
        }

        return strLink;

    }

    function initDataset ()
    {
        // Get dataset info from profile API
        RodiSrv.getDatasetInfo($scope.idDataset,
            function(dataDS)
            {
                // Load the dataset information
                $scope.objDataset = dataDS;
                $scope.objDatasetView = angular.copy(dataDS);

                // Check if user logged in can edit dataset, LOAD DATASET PROFILE API
                if($scope.objDataset.owner == $scope.userinfo.username || $scope.userinfo.groups[0] == 'reviewer' || $scope.userinfo.groups[0] == 'admin')
                {
                    // Reviewer user
                    $scope.bReviewer = true;
                    $scope.bDelete = true;

                } else
                {
                    // Standard user, load dataset from DATASET API
                    $scope.bReviewer = false;
                }

                // *******************************************
                // *******************************************
                RodiSrv.getDatasetlistFiltered($scope.objDataset.country, [], [], function(data)
                {
                    // Success
                    $scope.istanceList = data;

                    $scope.istanceList = $filter('filter')($scope.istanceList, function(item){
                        // return item.keydataset.dataset.id == $scope.objDataset.keydataset.code && item.id !== $scope.objDataset.id;
                        return item.keydataset.code == $scope.objDataset.keydataset.code && item.id !== $scope.objDataset.id;
                    });

                }, function(data)
                {
                    // Error API
                    console.log(data);
                });

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

                // $scope.formatLink = function(link){
                //     var shortLink = "";
                //
                //     if (link.length > 70)
                //     {
                //         shortLink = link.substr(0, 70);
                //         shortLink = shortLink + ' [...]';
                //     } else {
                //         shortLink = link;
                //     }
                //
                //     return shortLink;
                //
                // }

                // Dataset classification set
                $scope.dataCategory = [];
                $scope.dataCategoryId = "0";
                $scope.dataCategoryAll = [];
                $scope.datasetCategory = [];
                $scope.datasetCategoryAll = [];
                $scope.datasetCategoryId = "0";
                $scope.datasetScale = [];
                $scope.datasetScaleId = "0";
                $scope.datasetDescription = [];
                $scope.datasetDescriptionId = [];
                $scope.selectedLink = [];
                $scope.newLink = "";
                $scope.datasetTags = [];
                $scope.selectedTags = [];
                $scope.sTagsMsg = "";
                $scope.countryDesc = "";

                if($scope.objDataset.keydataset.tag_available) {$scope.datasetTags = $scope.objDataset.keydataset.tag_available.tags;}

                $scope.selectedTags = $scope.objDataset.tag;
                $scope.selectedLink = $scope.objDataset.url;

                // Load country list
                RodiSrv.getCountryList(
                    function(data){
                        // Success
                        $scope.countryList = data;

                        $scope.countryDesc = RodiSrv.getCountryDescription(data, $scope.objDataset.country);

                    }, function(data){
                        // Error
                        // TODO: error message
                    });

                // Load all data risk category
                RodiSrv.getDataRiskCategory(0,
                    function(data) {
                        // console.log(data);
                        $scope.dataCategory = data;
                        $scope.dataCategoryAll = angular.copy(data);

                        // Get data risk category ID
                        var aCategory = $filter('filter')($scope.dataCategoryAll,
                            function(e)
                            {
                                return e.category.name == $scope.objDataset.keydataset.category;
                            }
                        );

                        if(aCategory.length > 0 )
                        {
                            $scope.dataCategoryId = aCategory[0].category.id + "";
                            $scope.objDataset.keydataset.category = $scope.dataCategoryId;
                        }

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

                                // Get dataset category ID
                                var aDataset = $filter('filter')($scope.datasetCategoryAll,
                                    function(e)
                                    {
                                        return e.dataset.name == $scope.objDataset.keydataset.dataset.name;
                                    }
                                );

                                if(aDataset.length > 0 )
                                {
                                    $scope.datasetCategoryId = aDataset[0].dataset.id + "";
                                    $scope.objDataset.keydataset.dataset = $scope.datasetCategoryId;
                                }

                                // Get all description by Dataset Category
                                // Set dataset description selection
                                RodiSrv.getDescription(0, $scope.dataCategoryId, $scope.datasetCategoryId,
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

                                        //Get description ID
                                        var aDesc = $filter('filter')(data,
                                            function(e)
                                            {
                                                return e.description.name == $scope.objDataset.keydataset.description;
                                            }
                                        );

                                        if (aDesc.length > 0)
                                        {
                                            $scope.datasetDescriptionId = aDesc[0].description.code + "";
                                            $scope.objDataset.keydataset.description = aDesc[0].description.code + "";
                                        }

                                        // Get Dataset scale available
                                        RodiSrv.getLevelList(
                                            function(data)
                                            {
                                                $scope.datasetScale = data;

                                                // Set the level in the select control
                                                var aLevelSel = $filter('filter')(data,
                                                    function(e)
                                                    {
                                                        return e.level.name == $scope.objDataset.keydataset.level;
                                                    }
                                                );

                                                if(aLevelSel.length > 0)
                                                {
                                                    $scope.datasetScaleId = aLevelSel[0].level.id + "";
                                                    $scope.objDataset.keydataset.level = $scope.datasetScaleId;
                                                }

                                            }, function(data)
                                            {
                                                //Do nothing
                                            }
                                        );

                                    },
                                    function(data)
                                    {
                                        console.log(data);
                                    }
                                );

                            },
                            function(data)
                            {
                                $scope.datasetCategory = [];
                            }
                        );


                    },
                    function(data)
                    {
                        $scope.dataCategory = "--";
                    }
                );

            }, function(data)
            {
                // Error
                vex.dialog.alert("Error load dataset information");
            }
        );

    }

    function clearNoAvailableTagsInSelected()
    {
        // Delete the tags in selected array if these are not in allowed Tags
        angular.forEach($scope.selectedTags, function(item) {
            console.log(item);
            if($scope.datasetTags.indexOf(item) == -1)
            {
                $scope.selectedTags.splice($scope.selectedTags.indexOf(item), 1);
            };

        });
    }

} ]);
