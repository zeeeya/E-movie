(function (angular) 
{
	var app = angular.module("movieList", []);

	app.directive ('personPanels', function() {
		return {
			restrict: 'E',
			templateUrl: 'partials/person-panels.html',
			controller: function($scope) {
				this.panel = 0;

				this.isSelected = function(checkPanel) {
					return this.panel === checkPanel;
				};

				this.setPanel = function(selectedPanel) {
					this.panel = selectedPanel || 0;
				};

			},
			controllerAs: 'panels',
		};
	});

	app.controller("PersonDetailsCtrl", ['$http', '$scope', '$sce', function($http, $scope, $sce) {
		$scope.person_id;
		$scope.personDetails = {};

		$scope.init(person_id) {
			$scope.person_id = person_id;
			$scope.getPersonDetails( person_id );
		};

		$scope.getPersonDetails = function( person_id ) {
			var url = tmdbBaseUrl + '/person/' + person_id + '?page=' + page + "&include_adult=" + (showAdult ? 'true' : 'false');
			url = url + "&api_key=" + tmdbKey;


			$http.get( url, formParams )
			.success(function(data, status, headers, config) {

				$.extend($scope.personDetails, data);

			})
			.error(function(data, status, headers, config) {
				console.log("Error whiel trying to contact the API server");
			});

		}
	}]);

})(angular)
