	var movies = angular.module("movies", ['infinite-scroll', 'ngSanitize', 'ui.bootstrap']);

	movies.factory('MoviesPager', function($http) {

		var MoviesPager = function() {
			this.movieList = [];
			this.busy = false;
			this.nextPage = 1;
		};

		MoviesPager.prototype.nextPage = function() {
			if (this.busy) return;
			this.busy = true;

			var url = $scope.tmdbBaseUrl + '/discover/movie' + '?page=' + page + "&include_adult=true";
			url = url + "&api_key=" + tmdbKey;

			$http.jsonp(url).success(function(data, status, headers, config) {
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
						listOrder: Object.keys(this.movieList.movies).length
					};

					if (!this.movieList.movies[result.original_title]) {
						this.movieList.movies.push( movieData );
					}
				};

				this.busy = false;
				this.nextPage+=1;
			}.bind(this));			
		};

		return MoviesPager;
	});
	



