
 1. Add 'pretend' as a module dependency to the Angular module you want to test
 2. use the global 'pretend' object to mock services etc. Like:

    var myService = pretend('myService');

    myService.returns('someValue').for.method('myFunction');
    myService.returns('someValue').for.property('myFunction');
    myService.returns('someValue').for.promise('myFunction');
    myService.returns(function(){
    return 'someValue';
    }).for.method('myFunction');

    // Inject the mock as follows
    $provide.value('myService', myService.instance);

