
(function (angular) 
{

	var tmdbKey = '2fcc2bbc8f7e805847e8708191dd6685';
	var tmdbBaseUrl = 'http://api.themoviedb.org/3/movie/';

	var app = angular.module("movies", ['infinite-scroll', 'ngSanitize', 'ui.bootstrap']);

	app.directive ('moviePanels', function() {
		return {
			restrict: 'E',
			templateUrl: 'partials/movie-panels.html',
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

	app.directive ('tvPanels', function() {
		return {
			restrict: 'E',
			templateUrl: 'partials/tvshow-panels.html',
			controller: function() {
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


	app.controller("MovieDetailsCtrl", ['$http', '$scope', '$sce', function($http, $scope, $sce) {
		$scope.details = {};

		$scope.init = function() {};
		
		$scope.$on("updateDetails", function (event, data) {
			$scope.$parent.showDetails = true;

			var formParams = ( { api_key: tmdbKey });
			var movie = this;
			var url = tmdbBaseUrl + '/movie/' + data 
			url = url + "?api_key=" + tmdbKey + "&append_to_response=casts,cast,trailers,images,similar_movies";;
			var base_img_url = $scope.configuration.images.base_url 
			+ $scope.configuration.images.backdrop_sizes[0];

			$http.get( url, formParams)
			.success(function(results, status, headers, config) {
				var trailers = results.trailers.youtube;
				var trailer_url;
				if ( trailers.length ) {
					trailer_url = 'http://www.youtube.com/embed/' + trailers[0].source + '?html5=1';
				}
				else {
					console.log("No Trailers for: " + results.title);
				}
				$scope.details = $.extend( results, {
					title: results.title,
					synopsis: results.overview,
					base_backdrop_img_url: base_img_url,
					details_img_url: base_img_url + results.backdrop_path,
					trailer_url: trailer_url
				});
				$scope.$parent.movies = $scope.$parent.movies.slice(0,20);
			})
			.error ( function(results, status, headers, config) {
				$scope.$parent.movies =  $scope.$parent.movies.slice(0,20);
				console.error("Error occurred while making request: " + status + "\n" + results);
			});
		});

$scope.$on("updateTvShowDetails", function (event, data) {
	$scope.$parent.showDetails = true;

	var formParams = ( { api_key: tmdbKey });
	var movie = this;
	var url = tmdbBaseUrl + '/tv/' + data 
	url = url + "?api_key=" + tmdbKey + "&append_to_response=casts,credits,videos,images,similar_movies";;
	var base_img_url = $scope.configuration.images.base_url 
	+ $scope.configuration.images.backdrop_sizes[0];

	$http.get( url, formParams)
	.success(function(results, status, headers, config) {
		var trailers = results.videos.results;
		var trailer_url;
		if ( trailers.length ) {
			trailer_url = 'http://www.youtube.com/embed/' + trailers[0].key + '?html5=1';
			console.log("Trailer found at " + trailer_url)
		}
		else {
			console.log("No Trailers for: " + results.name);
		}

		$scope.details = $.extend( results, {
			title: results.name,
			synopsis: results.overview,
			base_backdrop_img_url: base_img_url,
			details_img_url: base_img_url + results.backdrop_path,
			trailer: trailer_url,
			release_date: results.first_air_date,
			casts: results.credits
		});
		$scope.$parent.shows = $scope.$parent.shows.slice(0,20);
	})
	.error ( function(results, status, headers, config) {
		console.log("Error occurred: "  + status);
		$scope.$parent.shows =  $scope.$parent.shows.slice(0,20);
	});
});


$scope.trustSrc = function(src) {
	return $sce.trustAsResourceUrl(src);
};		

$scope.getImage = function (movie) {
	if (movie.backdrop_path) {
		var base_img_url = $scope.$parent.configuration.images.base_url 
		+ $scope.configuration.images.backdrop_sizes[0];

		return base_img_url + movie.backdrop_path;
	}
	else {
		var base_img_url = $scope.$parent.configuration.images.base_url 
		+ $scope.configuration.images.poster_sizes[1];
		return base_img_url + movie.poster_path;
	}
}
}]);

app.controller("VideoPlayerCtrl", ['$scope', '$modal', '$log', function( $scope, $modal, $log) {
	$scope.selectedIndex = 0;

	$scope.playVideo = function(video_url, video_urls) {

		var modalInstance = $modal.open( {
			templateUrl: 'partials/modal-videoplayer.html',
			controller: 'ModalInstanceCtrl',
			size: 'lg',
			resolve:  {
				movie_title: function() {
					return $scope.details.title;
				},
				video_urls: function() {
					return video_urls;
				},
				video_url: function() {
					if (video_urls.youtube.length > 0) {
						return 'http://www.youtube.com/embed/' + video_urls.youtube[0].source + '?html5=1';
					}
				},
				trailer_title: function() {
					console.log(video_urls.quicktime.length);
					if (video_urls.youtube.length > 0) {
						return video_urls.youtube[0].name + '(' + video_urls.youtube[0].size + ')';
					}
				},

			}
		});


		modalInstance.result.then(function (selectedItem) {
			$scope.selected = selectedItem;
		}, function () {
			$log.info('Modal dismissed at: ' + new Date());
		}
		);
	}		
}]);  


app.controller('ModalInstanceCtrl', function ($sce, $scope, $modalInstance, movie_title, video_url, trailer_title) {

	$scope.video_url = $sce.trustAsResourceUrl(video_url);
	$scope.video_title = movie_title;
	$scope.video_href= video_url;
	$scope.trailer_title = trailer_title;

	$scope.ok = function () {
		$modalInstance.close(video_url);
	};

	$scope.cancel = function () {
		$modalInstance.dismiss('cancel');
	};
});


app.controller("MovieListCtrl", [ '$http', '$scope', function($http, $scope) {
	$scope.panel = 0;
	$scope.movies = [];
	$scope.shows = [];
	$scope.busy = false;
	$scope.showDetails = false;
	$scope.movie_id;

	$scope.init = function() {
		$scope.showPanel(0)
	};

	// configuration data
	$scope.configuration;
	$scope.details = [];

	$http.get(tmdbBaseUrl + "/configuration" + "?api_key=" + tmdbKey, [])
	.success(function(data, status, headers, config) {
		$scope.configuration = data;

		$scope.getLatestMovies(1, true);
	})
	.error(function(data, status, headers, config) {
		console.log("Failed to get configuration! Error status: " + status);
	});

	

	$scope.showPanel = function( panelId ) {
		$scope.showDetails = false;
		$scope.panel = panelId;

		if (!$scope.busy) {
			if ( panelId == 0 ) {
				$scope.getLatestMovies( 1, true );
			}
			else if (panelId == 1) {
				$scope.getLatestTvShows(1, true);
			}
		}			
	};


	$scope.displayShowDetails = function( movieId ) {
		$scope.showDetails = true;
		$scope.movie_id = movieId;
		$scope.$broadcast('updateTvShowDetails', movieId);
		console.log("Showing details for video " + movieId);
	};

	$scope.displayDetails = function( movieId ) {
		$scope.showDetails = true;
		$scope.movie_id = movieId;
		$scope.$broadcast('updateDetails', movieId);
		console.log("Showing details for movie " + movieId);
	};

	$scope.pauseScroll = function () {
		var pauseScrolling = $scope.busy || $scope.showDetails;

		return pauseScrolling;
	}

	$scope.getLatestMovies = function( pageNum, showAdult ) {
		if (!$scope.configuration || $scope.busy) return;

		console.log("Getting Page # " + pageNum + " of Movie Results");

		var page = !pageNum ? 1 : pageNum;
		var formParams = ( { api_key: tmdbKey });
		var movieList = this;
		var url = tmdbBaseUrl + '/discover/movie' + '?page=' + page + "&include_adult=" + (showAdult ? 'true' : 'false');
		url = url + "&api_key=" + tmdbKey;

		$http.get( url, formParams)
		.success(function(data, status, headers, config) {
			var results = data.results;
			var returnedPage = data.page;
			var base_img_url = $scope.configuration.images.base_url 
			+ $scope.configuration.images.poster_sizes[2] + "/";

			for (var idx = 0; idx < results.length; idx++ ) {
				var result = results[idx];

				var movieData = {
					image: base_img_url  + result.poster_path,
					backdrop: base_img_url + result.backdrop_path,
					title: result.title,
					original_title: result.original_title,
					id: result.id,
					description: result.description,
					listOrder: Object.keys(movieList.movies).length
				};

				if (!movieList.movies[result.original_title]) {
					movieList.movies.push( movieData );
				}
			}
			$scope.busy = false;

		})
		.error(function(errorResp) {
			$scope.busy = false;

		});

		$scope.busy = true;

	};

	$scope.getLatestTvShows = function( pageNum, showAdult ) {
			// make call out to movieDb to get latest movies.  return numMovies results
			if (!$scope.configuration || $scope.busy) return;

			var videoList = this;

			var page = !pageNum ? 1 : pageNum;
			var formParams = ( { api_key: tmdbKey });
			var url = tmdbBaseUrl + '/discover/tv' + '?page=' + page + "&include_adult=" + (showAdult ? 'true' : 'false');
			url = url + "&api_key=" + tmdbKey;

			$http.get( url, formParams)
			.success(function(data, status, headers, config) {
				var results = data.results;
				var returnedPage = data.page;
				var base_img_url = $scope.configuration.images.base_url 
				+ $scope.configuration.images.poster_sizes[2];

				for ( show of results) {
					var showData = {
						image: base_img_url  + show.poster_path,
						backdrop: base_img_url + show.backdrop_path,
						title: show.title || show.name,
						original_title: show.original_title,
						id: show.id,
						air_date: show.first_air_date,
						description: show.description,
						listOrder: Object.keys(videoList.shows).length
					};

					videoList.shows.push( showData );
				}

			})
			.error(function(errorResp) {

			});
		};	




		$scope.nextPage = function() {
			if (this.busy) return;
			
			if ($scope.panel == 0) {
				var nextPageNum = this.movies ? Math.floor(this.movies.length / 20) + 1 : 1;
				console.log("Getting next page of Movie Results: " + this.movies.length + " -> " + nextPageNum);

				$scope.getLatestMovies(nextPageNum, true);
			}
			else {
				var nextPageNum = this.shows ? Math.floor(this.shows.length / 20) + 1 : 1;
				$scope.getLatestTvShows(nextPageNum, true);
			}
		};

	}]);

}	)(angular,angular.module('movies', ['infinite-scroll', 'ngSanitize', 'ui.bootstrap']));
