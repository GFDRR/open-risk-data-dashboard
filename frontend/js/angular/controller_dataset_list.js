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

    RodiSrv.getCountryList().then(function(response) {
        // Success
        $scope.countryList = response.data;
        $scope.objCountry = $filter('filter')($scope.countryList, {wb_id: $scope.idCountry});

    });

    // Get dataset info
    $scope.getQuestionCode = function(questionCode, objDataset)
    {
        return RodiSrv.getQuestions_code(questionCode, objDataset);
    }

    // Load Dataset list with filter
    $scope.loadDatasetList = function() {
        $scope.datasetsByCategory = [];
        $scope.bLoading = true;

        RodiSrv.getCountryScoring($scope.idCountry, $scope.aCategory, $scope.aApplicability)
            .then(function(response) {
                $scope.datasetsByCategory = response.data.scores
                  .map(function(dataset) {
                    dataset.openness = RodiSrv.getDatasetOpennessWeight(dataset.category);
                    return dataset;
                  })
                  .reduce(function(categories, dataset, i, allDatasets){
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

                      var averageOpenness = datasets.reduce(function(sum, d){ return sum + d.openness; }, 0) / datasets.length;

                      categories.push({
                        keydataset_id: dataset.keydataset_id,
                        name: dataset.name,
                        datasets: datasets,
                        openness: averageOpenness
                      });
                    }

                    return categories;
                  }, []);

                $scope.bLoading = false;
                return response;
            })
            .then(function(response){
              $scope.datasets_open_count = response.data.datasets_open_count;
              $scope.datasets_restricted_count = response.data.datasets_restricted_count;
              $scope.datasets_closed_count = response.data.datasets_closed_count;
              $scope.datasets_unknown_count = response.data.datasets_unknown_count;
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

    $scope.setPopupDetails = function(dataset){

        $scope.bPopUpDetails = !$scope.bPopUpDetails;

        // Load dataset list
        RodiSrv.getDatasetlistFiltered($scope.idCountry, $scope.aCategory, $scope.aApplicability).then(function(data){
            $scope.istanceList = $filter('filter')(data, function(item){
                return item.keydataset.dataset.id == dataset.id;
            });
        });

    }

    $scope.checkVisibility = function(item) {
        if($scope.filterMode === 'all'){
            return true;
        }

        if($scope.filterMode === 'submitted'){
            return item.dataset_id || item.datasets;
        }

        if($scope.filterMode === 'notsubmitted'){
            return !item.dataset_id && !item.datasets;
        }

    }

    $scope.setFilterMode = function($event, type) {
        $event.preventDefault();
        $scope.filterMode = type;
    }

} ]);
