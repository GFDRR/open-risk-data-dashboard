/**
 * Created by Manuel on 22/05/2017.
 */

RodiApp.controller('RodiCtrlCountry', function ($scope, RodiSrv, $location, $filter, $window) {
    // Data details controller
    $scope.idCountry = $location.search().idcountry;

    $scope.changepage = function(page)
    {
        $window.location.href = baseUrl + page;
    }

    $scope.countriesData = RodiSrv.getCountryDetails();
    $scope.countryData = $filter('filter')($scope.countriesData, {code: $scope.idCountry}, true);

    $scope.countryMatrix = $scope.countryData[0].matrixData;

    $scope.hazardIndex = $scope.countryData[0].haz_index;


    // Get the Hazard Category
    $scope.HazardCategory = RodiSrv.getDataCategoryIcon();

    $scope.getHCIcon = function(index)
    {
        return RodiSrv.getHCIcon(index - 1);
    };
    // $scope.matrixDataTypeList = RodiSrv.getHazardCategory();

    $scope.questions = RodiSrv.getQuestions();

    $scope.colorCell = function(value){
        //Check the value

        // if (value == 'yes')
        // {
        //     return "background-color:green";
        // } else if(value == 'no')
        //     {
        //         return "background-color:red";
        //     } else
        //         {
        //             return "background-color:yellow";
        //         }

        return RodiSrv.matrixColorCell(value);
    }

    $scope.questionDesc = function(value)
    {
        var aQuest = $filter('filter')($scope.questions,  {code: value});
        return aQuest[0].desc;
    }

});
