/**
 * Created by Manuel on 15/01/2018.
 */

RodiApp.controller('RodiCtrlDatasetList', ['$scope', 'RodiSrv', '$location', '$window', '$filter', 'NgTableParams', function ($scope, RodiSrv, $location, $window, $filter, NgTableParams) {

    // ************************************** //
    // ********** INIT CONFIRM ************** //
    // ************************************** //

    $scope.bLogin = false;
    $scope.tokenid = localStorage.getItem('rodi_token');
    $scope.userinfo = JSON.parse(localStorage.getItem('rodi_user'));
    $scope.baseURL = baseAPIurl;

    if(!$scope.userinfo)
    {
        $scope.userinfo = RodiSrv.getUserStructureEmpty();
    }

    if($scope.tokenid) {$scope.bLogin = true; } else {$scope.bLogin = false;}

    $scope.changepage = function(page)
    {
        $window.location.href = baseUrl + page;
    }

    $scope.idCountry = $location.search().idcountry;
    $scope.idDatasetCat = $location.search().idcategory || 0;
    $scope.bLoading = true;
    $scope.bNoDataset = false;
    $scope.bPopUpDetails = false;
    $scope.datasetList = [];
    $scope.aCategory = [];
    $scope.aApplicability = [];
    $scope.istanceList = [];
    $scope.filterMode = "all";
    // $scope.missingDatasets = [];
    // $scope.bViewIstances = false;
    // $scope.bViewMissing = false;
    $scope.countryRank = 0;
    $scope.countryDatasets = 0;
    $scope.countryOpenDatasets = 0;
    var objItem = {
        name: "",
        category: "",
        description: "",
        score: "",
        quet1: false,
        quet2: false,
        quet3: false,
        quet4: false,
        quet5: false,
        quet6: false,
        quet7: false,
        quet8: false,
        quet9: false,
        quet10: false
    };

    $scope.questions = RodiSrv.getQuestions();
    $scope.HazardCategory = RodiSrv.getDataCategoryIcon();
    $scope.arrayHazardList=RodiSrv.getHazardList();

    RodiSrv.getCountryList().then(function(response)
    {
        // Success
        $scope.countryList = response.data;
        $scope.objCountry = $filter('filter')($scope.countryList, {wb_id: $scope.idCountry});

    });

    $scope.getHCIcon = function(index)
    {
        return RodiSrv.getHCIcon(index - 1);
    };

    // Get dataset info
    $scope.getQuestionCode = function(questionCode, objDataset)
    {
        return RodiSrv.getQuestions_code(questionCode, objDataset);
    }

    // Load Dataset list with filter
    $scope.loadDatasetList = function()
    {
        $scope.datasetList = [];
        $scope.bLoading = true;

        RodiSrv.getCountryScoring($scope.idCountry, $scope.aCategory, $scope.aApplicability,
            function(data)
            {
                // Success

                // Set peril available
                $scope.perils_counters = angular.copy(data.perils_counters);

                $scope.getApplicabilityNumber = function(applicability){

                    var itemFound = [];

                    itemFound = $filter('filter')($scope.perils_counters, function(item)
                    {
                        return item.name == applicability;
                    });

                    if (itemFound.length > 0)
                    {
                    // Item found
                        if(itemFound[0].notable)
                        {
                            return itemFound[0].count;
                        } else {
                            return "n.a.";
                        }
                    }
                };

                $scope.countryRank = data.rank;
                $scope.score = data.score;
                $scope.countryDatasets = data.datasets_count;
                $scope.countryOpenDatasets = data.fullscores_count;

                // Delete first element (name of columns)
                data.scores.splice(0,1);

                for (var i = 0; i < data.scores.length; i++)
                {

                    if(data.scores[i][4] * 1 < 0)
                    {
                        // No dataset submitted
                        objItem = {
                            id: data.scores[i][0],
                            name:  data.scores[i][1],
                            category:  data.scores[i][2],
                            description: "",
                            score:  data.scores[i][4] * 1,
                            istance_id: data.scores[i][3],
                            title: "",
                            modify_time: "",
                            institution: "",
                            quest1:  "na",
                            quest2:  "na",
                            quest3:  "na",
                            quest4:  "na",
                            quest5:  "na",
                            quest6:  "na",
                            quest7:  "na",
                            quest8:  "na",
                            quest9:  "na",
                            quest10:  "na"
                        }
                    } else {
                        objItem = {
                            id: data.scores[i][0],
                            name:  data.scores[i][1],
                            category:  data.scores[i][2],
                            description: "",
                            score:  data.scores[i][4] * 1,
                            istance_id: data.scores[i][3],
                            title: data.scores[i][15],
                            modify_time: data.scores[i][16],
                            institution: data.scores[i][17],
                            quest1:  data.scores[i][5],
                            quest2:  data.scores[i][6],
                            quest3:  data.scores[i][7],
                            quest4:  data.scores[i][8],
                            quest5:  data.scores[i][9],
                            quest6:  data.scores[i][10],
                            quest7:  data.scores[i][11],
                            quest8:  data.scores[i][12],
                            quest9:  data.scores[i][13],
                            quest10:  data.scores[i][14]
                        }
                    }

                    $scope.datasetList.push(objItem);

                }

                $scope.bLoading = false;

            }, function(data)
            {
            // Error API
            console.log(data);
            }
        );

    }

    if($scope.idDatasetCat)
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
        if ($scope.getApplicabilityNumber(filter) === 'n.a.') {
          return;
        }

        var index = $scope.aApplicability.indexOf(filter);

        if (index >-1){
            $scope.aApplicability.splice(index,1);
            $scope.loadDatasetList();

        }else {
            $scope.aCategory = [];
            $scope.aApplicability = [];
            $scope.aApplicability.push(filter);
            $scope.loadDatasetList();
        }

    };

    $scope.setFilterCategoryDatasetList = function (filter) {

        var index = $scope.aCategory.indexOf(filter);

        if (index >-1){
            $scope.aCategory.splice(index,1);
            $scope.loadDatasetList();
        }else {
            $scope.aCategory = [];
            $scope.aApplicability = [];
            $scope.aCategory.push(filter);
            $scope.loadDatasetList();
        }
    };

    $scope.setPopupDetails = function(dataset){

        $scope.bPopUpDetails = !$scope.bPopUpDetails;

        // Load dataset list
        RodiSrv.getDatasetlistFiltered($scope.idCountry, $scope.aCategory, $scope.aApplicability).then(function(data){
            var data = response.data;
            $scope.istanceList = data;

            $scope.istanceList = $filter('filter')($scope.istanceList, function(item){
                return item.keydataset.dataset.id == dataset.id;
            });
        });

    }

    $scope.checkVisibility = function(item)
    {
        if($scope.filterMode == 'all'){
            return true;
        }

        if($scope.filterMode == 'submitted'){
            if((item.score * 1) > 0)
            {
                return true;
            } else {
                    return false;
                }
        }

        if($scope.filterMode == 'notsubmitted'){
            if((item.score * 1) < 0)
            {
                return true;
            } else {
                return false;
            }
        }

    }

    $scope.setFilterMode = function(type)
    {
        $scope.filterMode = type;
    }

    // $scope.setView = function(type)
    // {
    //     if(type == 'i')
    //     {
    //         $scope.bViewIstances = true;
    //         $scope.bViewMissing = false;
    //     }
    //     if(type == 'm')
    //     {
    //         $scope.bViewIstances = false;
    //         $scope.bViewMissing = true;
    //     }
    // }



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
