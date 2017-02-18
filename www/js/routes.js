angular.module('app.routes', [])

.config(function($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider
    
  

      .state('tabsController.movieRating', {
    url: '/page2',
    views: {
      'tab1': {
        templateUrl: 'templates/movieRating.html',
        controller: 'movieRatingCtrl'
      }
    }
  })

  .state('tabsController.movieList', {
    url: '/page3',
    views: {
      'tab2': {
        templateUrl: 'templates/movieList.html',
        controller: 'movieListCtrl'
      }
    }
  })

  .state('tabsController', {
    url: '/main',
    templateUrl: 'templates/tabsController.html',
    abstract:true
  })

  .state('main', {
    url: '/main',
    templateUrl: 'templates/main.html',
    controller: 'mainCtrl'
  })

  .state('home', {
    url: '/page6',
    templateUrl: 'templates/home.html',
    controller: 'homeCtrl'
  })

  .state('page', {
    url: '/page7',
    templateUrl: 'templates/page.html',
    controller: 'pageCtrl'
  })

$urlRouterProvider.otherwise('/page6')

  

});