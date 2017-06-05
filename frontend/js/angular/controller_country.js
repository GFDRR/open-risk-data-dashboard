/**
 * Created by Manuel on 22/05/2017.
 */

RodiApp.controller('RodiCtrlCountry', function ($scope, RodiSrv, $location, $filter) {
    // Data details controller
    $scope.idCountry = $location.search().idcountry;

    $scope.countriesData = RodiSrv.getCountryDetails();
    $scope.countryData = $filter('filter')($scope.countriesData, {code: $scope.idCountry}, true);

    $scope.countryMatrix = $scope.countryData[0].matrixData;

    $scope.hazardIndex = $scope.countryData[0].haz_index;

    $scope.matrixDataTypeList = RodiSrv.getHazardCategory();

    $scope.colorCell = function(value){
        //Check if the value is Yes, No or na
        //Yes -> green | No -> Red | na -> yellow

        // return RodiSrv.matrixColorCell(value);
    }

});
