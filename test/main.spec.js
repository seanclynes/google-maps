describe('charFromStr', function () {

    it('should return first char from a string', function () {
        var str = 'abc';
        expect(charFromStr(0, str)).toEqual('a');
    });

    it('should return first char for index greater then str length', function() {
        var str = 'abc';
        expect(charFromStr(3, str)).toEqual('a');
    });
});

describe('convertTo360Heading', function() {

    it('should convert -90 to 270', function() {
        expect(convertTo360Heading(-90)).toEqual(270);
    });

    it('should return 100 as 100', function() {
        expect(convertTo360Heading(100)).toEqual(100);
    });

    it('should round 45.8 to 46', function() {
        expect(convertTo360Heading(45.8)).toEqual(46);
    });
});

describe('toggleString', function() {

    it('should replace aaa with bbb', function() {
        var str = 'aaa is replaced';

        expect(toggleString('aaa','bbb', str)).toEqual('is replaced bbb');
    });

    it('should replace aaa with bbb with Idempotence', function() {
        var str = 'aaa is replaced', replaced;

        replaced = toggleString('aaa','bbb', str);
        replaced = toggleString('bbb','aaa', replaced);
        expect(replaced.indexOf('aaa')).toBeGreaterThan(-1);
    });
});

describe('callLatLngGetFunctions', function () {
    var propertyName = 'start_location', object, lat, lng;

    beforeEach(function() {
        object = {};
        lat = jasmine.createSpy('lat');
        lng = jasmine.createSpy('lng');
        object[propertyName] = {
            lat: lat,
            lng: lng
        };

        object[propertyName].lat.and.returnValue(33);
        object[propertyName].lng.and.returnValue(11);
    });

    it('should populate lat/lng literal', function () {
        var latLng = callLatLngGetFunctions(propertyName, object);

        expect(lat).toHaveBeenCalled();
        expect(lng).toHaveBeenCalled();
        expect(latLng.lat).toBe(33);
        expect(latLng.lng).toBe(11);
    });
});

describe('populateLatLng', function () {
    var response;

    beforeEach(function() {
        response = {
            routes: [
                {
                    legs: [
                        {
                            steps: [
                                {}
                            ]
                        }
                    ]

                }
            ]
        };
        spyOn(window, 'callLatLngGetFunctions');
    });

    it('should populateLatLng', function () {
        var latLngArray = populateLatLng(response, 0);

        expect(latLngArray.length).toBe(2);
        expect(callLatLngGetFunctions.calls.count()).toBe(2);
    });
});

describe('populateInstructions', function () {
    var response, streetViewData, turnLeft = 'Turn left';

    beforeEach(function() {
        response = {
            routes: [
                {
                    legs: [
                        {
                            steps: [
                                {
                                    instructions: turnLeft
                                }
                            ]
                        }
                    ]

                }
            ]
        };
        streetViewData = [
            {},
            {}
        ];
    });

    it('should populateInstructions', function () {
        populateInstructions(response, streetViewData, 0);

        expect(streetViewData[0].instructions).toEqual(turnLeft);
        expect(streetViewData[1].instructions).toEqual('You have reached your destination');
    });
});

describe('latLngLiteralToHeading', function () {
    var LatLng, computeHeading, latLngLiteral1, latLngLiteral2;

    beforeEach(function(){
        LatLng = jasmine.createSpy('LatLng');
        computeHeading = jasmine.createSpy('computeHeading');
        computeHeading.and.returnValue(55);
        window.google = {
            maps: {
                LatLng: LatLng,
                geometry: {
                    spherical: {
                        computeHeading: computeHeading
                    }
                }
            }
        };
        latLngLiteral1 = {
            lat: 11,
            lng: 22
        };
        latLngLiteral2 = {
            lat: 33,
            lng: 44
        };
    });

    afterEach(function(){
        delete window.google;
    });

    it('should call latLngLiteralToHeading successfully', function () {
        var result = latLngLiteralToHeading(latLngLiteral1, latLngLiteral2);

        expect(LatLng.calls.count()).toBe(2);
        expect(computeHeading.calls.count()).toBe(1);
        expect(result).toBe(55);
    });
});

describe('calculateHeading', function () {
    var latLngArray, convertTo360Heading, latLngLiteralToHeading;

    beforeEach(function(){
        latLngArray = [
            {},
            {}
        ];
        convertTo360Heading = spyOn(window, 'convertTo360Heading').and.returnValue('heading');
        latLngLiteralToHeading = spyOn(window, 'latLngLiteralToHeading');
    });

    it('should populate headings', function () {
        calculateHeading(latLngArray);

        expect(latLngLiteralToHeading.calls.count()).toBe(2);
        expect(convertTo360Heading.calls.count()).toBe(2);
        expect(latLngArray[0].heading).toEqual('heading');
        expect(latLngArray[1].heading).toEqual('heading');
    });
});

describe('informationMessage', function () {
    var cloneNode, appendChild, clone;

    beforeEach(function() {
        clone = {
            innerHTML: null
        };
        cloneNode = jasmine.createSpy('cloneNode').and.returnValue(clone);
        appendChild = jasmine.createSpy('appendChild');
        spyOn(document, 'querySelector').and.returnValue({
            cloneNode: cloneNode,
            appendChild: appendChild
        });
    });

    it('should set message', function () {
        var message = 'A message';

        informationMessage(message);

        expect(document.querySelector.calls.count()).toBe(2);
        expect(cloneNode).toHaveBeenCalledWith(true);
        expect(appendChild).toHaveBeenCalledWith(clone);
        expect(clone.innerHTML).toBe(message);
    });
});

describe('addDescriptions', function () {
    var descriptions, data, descriptionsSelector, markerLabels;

    beforeEach(function() {
        descriptions = [{innerHTML: null}, {innerHTML:null}];
        data = [{instructions: 'Turn left'}, {instructions: 'You have reached your destination'}];
        spyOn(document, 'querySelectorAll').and.returnValue(descriptions);
        descriptionsSelector = '.street-views .description-content';
        markerLabels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ123456789abcdefghijklmnopqrstuvwxyz';
    });

    it('should populate descriptions', function () {
        addDescriptions(descriptionsSelector, markerLabels, data);

        expect(document.querySelectorAll).toHaveBeenCalledWith(descriptionsSelector);
        expect(descriptions[0].innerHTML).toEqual('<b>A.</b> Turn left');
        expect(descriptions[1].innerHTML).toEqual('<b>B.</b> You have reached your destination');
    });
});

describe('appendTemplateCopies', function () {
    var domContainer, domTemplate;

    beforeEach(function() {
        domContainer = {};
        domContainer.appendChild = jasmine.createSpy('appendChild');
        domTemplate = {};
        domTemplate.cloneNode = jasmine.createSpy('cloneNode');
    });

    it('should clone template twice', function () {
        appendTemplateCopies(domContainer, domTemplate, 2);

        expect(domContainer.appendChild.calls.count()).toBe(2);
        expect(domTemplate.cloneNode.calls.count()).toBe(2);
    });
});

describe('clearContainer', function () {
    var dom;

    beforeEach(function() {
        dom = {innerHTML: null};
        spyOn(document, 'querySelector').and.returnValue(dom);
    });

    it('should set content to empty string', function () {
        var selector = '.route-summary';
        clearContainer(selector);

        expect(document.querySelector).toHaveBeenCalledWith(selector);
        expect(dom.innerHTML).toEqual('');
    });
});

xdescribe('', function () {

    it('should ', function () {

    });
});