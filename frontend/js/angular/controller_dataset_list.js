/**
 * Created by Manuel on 15/01/2018.
 */

RodiApp.controller('RodiCtrlDatasetList', ['$scope', 'RodiSrv', '$location', '$window', '$filter', 'NgTableParams', function ($scope, RodiSrv, $location, $window, $filter, NgTableParams) {

    // ************************************** //
    // ********** INIT CONFIRM ************** //
    // ************************************** //

    RodiSrv.checkAPIversion(function(data){}, function(data){});

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
    $scope.idDatasetCat = $location.search().idcategory;
    $scope.bLoading = true;
    $scope.bNoDataset = false;
    $scope.datasetList = [];
    $scope.aCategory = [];
    $scope.aApplicability = [];
    $scope.missingDatasets = [];
    $scope.bViewIstances = false;
    $scope.bViewMissing = false;

    $scope.questions = RodiSrv.getQuestions();
    $scope.HazardCategory = RodiSrv.getDataCategoryIcon();
    $scope.arrayHazardList=RodiSrv.getHazardList();

    console.log($scope.idCountry);

    RodiSrv.getCountryList(function(data)
    {
        // Success
        $scope.countryList = data;
        $scope.objCountry = $filter('filter')($scope.countryList, {iso2: $scope.idCountry});

    }, function(data)
    {
        // Error API
        console.log(data);
    });

    $scope.getHCIcon = function(index)
    {
        return RodiSrv.getHCIcon(index - 1);
    };

    // Load Dataset list with filter
    $scope.loadDatasetList = function()
    {
        $scope.datasetList = [];
        $scope.bLoading = true;

        RodiSrv.getDatasetlistFiltered($scope.idCountry, $scope.aCategory, $scope.aApplicability,
            function(data)
            {
                // Success
                $scope.datasetList = data;

                $scope.tableParams = new NgTableParams({}, { dataset: $scope.datasetList});

            }, function(data)
            {
                // Error API
                console.log(data);
            });

        // Load the country statistics
        RodiSrv.getCountryStatistics($scope.idCountry, $scope.aCategory, $scope.aApplicability,
            function(data){

                $scope.score = data.score;
                $scope.perils_counters = angular.copy(data.perils_counters);
                $scope.categories_counters = angular.copy(data.categories_counters);
                $scope.missingDatasets = data.missing_datasets;

                $scope.tableParamsMissing = new NgTableParams({}, { dataset: $scope.missingDatasets});

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

                $scope.getCategoryNumber = function(category){

                    var itemFound = [];

                    itemFound = $filter('filter')($scope.categories_counters, function(item)
                    {
                        return item.category == category;
                    });

                    if (itemFound.length > 0)
                    {
                        // Item found
                        return itemFound[0].count;
                    } else {return 0}
                };

            }, function(data){
                // Error API
                console.log(data);
            })

        $scope.bLoading = false;
    }

    if($scope.idDatasetCat !== '0')
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

    $scope.filterApplicabilityCssClass = function (filter) {
        var index =$scope.aApplicability.indexOf(filter);
        if (index >-1){
            return "active";
        }else return "unactive";
    };

    $scope.filterApplicabilityCssStyle = function (filter) {
        var index =$scope.aApplicability.indexOf(filter);
        if (index >-1){
            // return {"background-color" : '#2EA620' } ;
            return {"background-color" : 'white' } ;
        }else return "";
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

    $scope.filterCategoryCssClass = function (filter) {
        var index =$scope.aCategory.indexOf(filter);
        if (index >-1){
            return "active";
        }else return "unactive";
    };

    $scope.filterCategoryCssStyle = function (filter) {
        var index =$scope.aCategory.indexOf(filter);
        if (index >-1){
            // return {"background-color" : '#2EA620' } ;
            return {"background-color" : 'white' } ;
        }else return "";
    };

    $scope.setView = function(type)
    {
        if(type == 'i')
        {
            $scope.bViewIstances = true;
            $scope.bViewMissing = false;
        }
        if(type == 'm')
        {
            $scope.bViewIstances = false;
            $scope.bViewMissing = true;
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

    $scope.formatLink = function(link){
        var shortLink = "";
        console.log(link);

        if (link.length > 70)
        {
            shortLink = link.substr(0, 70);
            shortLink = shortLink + ' [...]';
        } else {
            shortLink = link;
        }

        return shortLink;

    }

} ]);
