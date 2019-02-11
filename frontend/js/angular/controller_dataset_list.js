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
    $scope.datasets_open_count = 0;
    $scope.datasets_restricted_count = 0;
    $scope.datasets_closed_count = 0;
    $scope.datasets_unknown_count = 0;

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

        RodiSrv.getCountryScoring($scope.idCountry, $scope.aCategory, $scope.aApplicability)
            .then(function(response) {
                $scope.datasetsByCategory = response.data.datasets.reduce(function(categories, dataset, i, allDatasets){
                  var category = categories.find(function(category){
                    return category.keydataset_id === dataset.keydataset_id;
                  });

                  // we never processed the category
                  if (!category) {
                    var datasets = allDatasets.filter(function(d){
                      return dataset.keydataset_id === d.keydataset_id;
                    });

                    // do not group datasets if there is only one
                    // it makes it easier to style things
                    if (datasets.length === 1) {
                      categories.push(dataset);
                      return categories;
                    }

                    categories.push({
                      keydataset_id: dataset.keydataset_id,
                      name: dataset.name,
                      datasets: datasets
                    })
                  }

                  return categories;
                }, []);

                $scope.bLoading = false;
                return response;
            })
            .then(function(response){
              response.data.datasets.forEach(function(dataset){
                switch (RodiSrv.getDatasetLabel(dataset)) {
                  case 'opendata':    $scope.datasets_open_count++; break;
                  case 'restricted':  $scope.datasets_restricted_count++; break;
                  case 'closed':      $scope.datasets_closed_count++; break;
                  case 'unknown':
                  default:            $scope.datasets_unknown_count++; break;
                }
              })
            });

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

    $scope.setFilterCategoryDatasetList = function ($event, filter) {
        $event.preventDefault();
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

    $scope.checkVisibility = function(item) {
        if($scope.filterMode === 'all'){
            return true;
        }

        if($scope.filterMode === 'submitted'){
            return (item.score * 1) > 0;
        }

        if($scope.filterMode === 'notsubmitted'){
            return (item.score * 1) < 0;
        }

    }

    $scope.setFilterMode = function($event, type) {
        $event.preventDefault();
        $scope.filterMode = type;
    }

} ]);
