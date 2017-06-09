/**
 * Created by Manuel on 15/05/2017.
 */

RodiApp.controller('RodiCtrl', ['$scope', 'RodiSrv', '$window', '$filter', '$cookieStore', function ($scope, RodiSrv, $window, $filter, $cookieStore) {

    // ************************************** //
    // *************** INIT ***************** //
    // ************************************** //

    $scope.bLogin = false;
    $scope.tokenid = $cookieStore.get('rodi_token');

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

} ]);
