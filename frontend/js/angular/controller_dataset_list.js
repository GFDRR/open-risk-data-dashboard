/**
 * Created by Manuel on 15/01/2018.
 */

RodiApp.controller('RodiCtrlDatasetList', ['$scope', 'RodiSrv', '$location', '$window', '$filter', function ($scope, RodiSrv, $location, $window, $filter) {

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

    $scope.changepage = RodiSrv.changepage;

    $scope.idCountry = $location.search().idcountry;
    $scope.idDatasetCat = $location.search().idcategory || 0;
    $scope.bLoading = true;
    $scope.bNoDataset = false;
    $scope.bPopUpDetails = false;
    $scope.datasetsByCategory = [];
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
        quest1: false,
        quest2: false,
        quest3: false,
        quest4: false,
        quest5: false,
        quest6: false,
        quest7: false,
        quest8: false,
        quest9: false,
        quest10: false
    };

    $scope.questions = RodiSrv.getQuestions();
    $scope.HazardCategory = RodiSrv.getDataCategoryIcon();
    $scope.arrayHazardList=RodiSrv.getHazardList();

    RodiSrv.getCountryList().then(function(response) {
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
        $scope.datasetsByCategory = [];
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

                var datasets = data.scores.slice(1).map(function(dataset){
                  // No dataset submitted
                  if(dataset[4] * 1 < 0) {
                    return {
                        id: dataset[0],
                        name:  dataset[1],
                        category:  dataset[2],
                        description: "",
                        score:  dataset[4] * 1,
                        istance_id: dataset[3],
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
                    };
                  }
                  else {
                    return {
                        id: dataset[0],
                        name:  dataset[1],
                        category:  dataset[2],
                        description: "",
                        score:  dataset[4] * 1,
                        istance_id: dataset[3],
                        title: dataset[15],
                        modify_time: dataset[16],
                        institution: dataset[17],
                        quest1:  dataset[5],
                        quest2:  dataset[6],
                        quest3:  dataset[7],
                        quest4:  dataset[8],
                        quest5:  dataset[9],
                        quest6:  dataset[10],
                        quest7:  dataset[11],
                        quest8:  dataset[12],
                        quest9:  dataset[13],
                        quest10:  dataset[14]
                    };
                  }
                });

                $scope.datasetsByCategory = datasets.reduce(function(categories, dataset, i, allDatasets){
                  var category = categories.find(function(category){
                    return category.id === dataset.id;
                  });

                  // we never processed the category
                  if (!category) {
                    var datasets = allDatasets.filter(function(d){
                      return dataset.id === d.id;
                    });

                    // do not group datasets if there is only one
                    // it makes it easier to style things
                    if (datasets.length === 1) {
                      categories.push(dataset);
                      return categories;
                    }

                    var averageScore = datasets.reduce(function(score, d){ return score + d.score; }, 0) / datasets.length;

                    categories.push({
                      id: dataset.id,
                      name: dataset.name,
                      score: averageScore,
                      datasets: datasets
                    })
                  }

                  return categories;
                }, []);

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

        RodiSrv.getDataRiskCategory(0, function(data) {
            // Success

            $scope.DataCategory = $filter('filter')(data,
                function(e)
                {
                    return e.category.id == $scope.idDatasetCat;
                }
            );

            $scope.aCategory.push($scope.DataCategory[0].category.name);
            $scope.loadDatasetList();


        }, function(data) {
            console.log(data);
        });

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
