/** Built on 2014-05-22T17:20:50 **/
!function(){"use strict";angular.module("pretend",[]),angular.module("pretend").factory("Pretend",["$rootScope","$q",function($rootScope,$q){return{get:function(){return function(){function setProperty(property,value,options){"property"===options.type?instance[property]=value:(instance[property]=null,spyOn(instance,property).and.callFake(function(){var args=arguments;if("promise"===options.type){var deferred=$q.defer();return deferredFunctions[property]=function(reject){deferred[reject?"reject":"resolve"]("function"==typeof value?value.apply(value,args):value),$rootScope.$digest()},deferred.promise}return"function"==typeof value?value.apply(value,args):value}))}var instance={},deferredFunctions={};return{returns:function(value){return{"for":{property:function(name){setProperty(name,value,{type:"property"})},method:function(name){setProperty(name,value,{type:"method"})},promise:function(name){return setProperty(name,value,{type:"promise"}),{resolve:function(){deferredFunctions[name]()},reject:function(){deferredFunctions[name](!0)}}}}}},instance:instance}}}}}]),angular.module("pretend").run(function(Pretend){window.pretend=Pretend.get()}),angular.bootstrap(document.createElement("div"),["pretend"])}();