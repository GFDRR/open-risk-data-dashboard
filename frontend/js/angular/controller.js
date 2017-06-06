/**
 * Created by Manuel on 15/05/2017.
 */

RodiApp.controller('RodiCtrl', ['$scope', 'RodiSrv', '$window', '$filter', function ($scope, RodiSrv, $window, $filter) {

    // ************************************** //
    // *************** INIT ***************** //
    // ************************************** //

    $scope.objRodiVariable =
        {
            "valueData": "",
            "countryID": "",
            "countryDesc": "",
            "bPopupCountry": false,
            "popupClass": "",
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

    $scope.objDataset = RodiSrv.getDatasetEmptyStructure();
    $scope.objDatasetClass = RodiSrv.getDatasetClassification();

    $scope.filterDatasetCategory = function(obj)
    {
        console.log("DS Category");
        console.log(obj);
    }

    $scope.saveDataser = function()
    {

        var bMsh = RodiSrv.saveDataset($scope.objDataset);

        if (bMsh)
        {
        //    Save success message
            vex.dialog.alert('Dataset Inserted correctly');
            $scope.objDataset = RodiSrv.getDatasetEmptyStructure();
        } else
        {
            //    Save error message
            vex.dialog.alert('Error: dataser not insert!');
        }
    }

} ]);
