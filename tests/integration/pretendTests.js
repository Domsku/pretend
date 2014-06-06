// Create test app.
var myApp = angular.module('myApp', ['ngMock']);
myApp.factory('myService', function(myOtherService, $q){
   return {
       test: function(){
           return myOtherService.foo();
       },
       test2: function(){
           var deferred = $q.defer();

           myOtherService.fooPromise().then(deferred.resolve);

           return deferred.promise;
       },
       test3: function(){
           return myOtherService.hiddenPromise();
       }
   }
});
myApp.factory('myOtherService', function($q){
    return {
        foo: function(){
            return 'bar';
        },
        fooPromise: function(){
            var deferred = $q.defer();
            deferred.resolve('bar');
            return deferred.promise;
        },
        hiddenPromise: function(){
            return this.fooPromise();
        }
    }
});

// Init pretend.
pretend.init('myApp');

(function () {
    'use strict';

    describe('pretend', function () {
        var $rootScope, myService, myOtherServiceMock;

        beforeEach(function () {
            module('myApp');

            myOtherServiceMock = pretend.mock('myOtherService', { promise: ['hiddenPromise'] });

            module(function ($provide) {
                $provide.value('myOtherService', myOtherServiceMock.mock);
            });

            inject(function(_myService_, _$rootScope_){
                myService = _myService_;
                $rootScope = _$rootScope_;
            })
        });

        it('should return the new value when calling a normal function.', function () {
            myOtherServiceMock.returns(function(){
                return 'test';
            }).for('foo');

            var result = myService.test();

            expect(result).toBe('test');
        });

        it('should return the new value when calling a promise function.', function () {
            var handler = jasmine.createSpy('success');
            var promise = myOtherServiceMock.returns(function(){
                return 'promiseTest';
            }).for('fooPromise');

            myService.test2().then(handler);
            promise.resolve($rootScope);

            expect(handler).toHaveBeenCalledWith('promiseTest');
        });

        it('should return the new value when calling a more obscure promise function.', function () {
            var handler = jasmine.createSpy('success');
            var promise = myOtherServiceMock.returns(function(){
                return 'promiseTest';
            }).for('hiddenPromise');

            myService.test3().then(handler);
            promise.resolve($rootScope);

            expect(handler).toHaveBeenCalledWith('promiseTest');
        });

    });
}());