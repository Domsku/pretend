
 1. Add 'pretend' as a module dependency to the Angular module you want to test
 2. use the global 'pretend' object to mock services etc. Like:

    var myService = pretend('myService');

    myService.returns('someValue').for.method('myMethod');
    myService.returns('someValue').for.property('myProperty');
    myService.returns('someValue').for.promise('myPromise');
    myService.returns(function(){
        return 'someValue';
    }).for.method('myOtherMethod');

    // Inject the mock as follows
    $provide.value('myService', myService.instance);

