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

describe('isAnimateSupported', function () {
    var dom;

    beforeEach(function() {
        dom = {
            style: {}
        };
        spyOn(document, 'createElement').and.returnValue(dom);
    });

    it('should return animation supported', function () {
        dom.style.animationName = {};

        expect(isAnimateSupported()).toBe(true);
    });

    it('should return animation not supported', function () {

        expect(isAnimateSupported()).toBe(false);
    });
});

describe('getShowClass', function () {
    var dom;

    beforeEach(function() {
        dom = {
            style: {}
        };
        spyOn(document, 'createElement').and.returnValue(dom);
    });

    it('should return animated show class', function () {
        dom.style.animationName = {};

        expect(getShowClass()).toEqual('rolleddown');
    });

    it('should return fallback show class', function () {

        expect(getShowClass()).toEqual('open');
    });
});

describe('getHideClass', function () {
    var dom;

    beforeEach(function() {
        dom = {
            style: {}
        };
        spyOn(document, 'createElement').and.returnValue(dom);
    });

    it('should return animated hide class', function () {
        dom.style.animationName = {};

        expect(getHideClass()).toEqual('rolledup');
    });

    it('should return fallback hide class', function () {

        expect(getHideClass()).toEqual('close');
    });
});

describe('makeMinimiseHandler', function () {
    var streetViewContainers, hideClass;

    beforeEach(function() {
        streetViewContainers = [{
            className: ''
        }];
        hideClass = 'close';
        spyOn(window, 'getHideClass').and.returnValue(hideClass);
        spyOn(window, 'toggleString');
    });

    it('should create a function', function () {
        var result = makeMinimiseHandler(0, streetViewContainers);

        expect(result).toEqual(jasmine.any(Function));
    });

    it('should not hide twice', function () {
        streetViewContainers[0].className = hideClass;
        var result = makeMinimiseHandler(0, streetViewContainers);
        result();

        expect(window.toggleString).not.toHaveBeenCalled();
    });

    it('should hide if not hidden', function() {
        var result = makeMinimiseHandler(0, streetViewContainers);
        result();

        expect(window.toggleString).toHaveBeenCalled();
    });
});

describe('makeMaximiseHandler', function () {
    var streetViewContainers, hideClass;

    beforeEach(function() {
        streetViewContainers = [{
            className: ''
        }];
        hideClass = 'close';
        spyOn(window, 'getHideClass').and.returnValue(hideClass);
        spyOn(window, 'toggleString');
    });

    it('should create a function', function () {
        var result = makeMaximiseHandler(0, streetViewContainers);

        expect(result).toEqual(jasmine.any(Function));
    });

    it('should not show twice', function () {
        var result = makeMaximiseHandler(0, streetViewContainers);
        result();

        expect(window.toggleString).not.toHaveBeenCalled();
    });

    it('should show if hidden', function() {
        streetViewContainers[0].className = hideClass;
        var result = makeMaximiseHandler(0, streetViewContainers);
        result();

        expect(window.toggleString).toHaveBeenCalled();
    });
});

describe('addMinimiseListener', function () {
    var minimisers, addEventListener, minimiseSelector, streetViewContainers;

    beforeEach(function() {
        addEventListener = jasmine.createSpy('addEventListener');
        minimisers = [
            {
                addEventListener: addEventListener
            },
            {
                addEventListener: addEventListener
            }
        ];
        spyOn(document, 'querySelectorAll').and.returnValue(minimisers);
        spyOn(window, 'makeMinimiseHandler');
        minimiseSelector = '.street-views .minimise';
        streetViewContainers = [
            {},
            {}
        ];
    });

    it('should add two event listeners', function () {
        addMinimiseListener(streetViewContainers, minimiseSelector);

        expect(document.querySelectorAll.calls.count()).toBe(1);
        expect(addEventListener.calls.count()).toBe(2);
        expect(window.makeMinimiseHandler.calls.count()).toBe(2);
    });
});

describe('addMaximiseListener', function () {
    var maximisers, addEventListener, maximiseSelector, streetViewContainers;

    beforeEach(function() {
        addEventListener = jasmine.createSpy('addEventListener');
        maximisers = [
            {
                addEventListener: addEventListener
            },
            {
                addEventListener: addEventListener
            }
        ];
        spyOn(document, 'querySelectorAll').and.returnValue(maximisers);
        spyOn(window, 'makeMaximiseHandler');
        maximiseSelector = '.street-views .maximise';
        streetViewContainers = [
            {},
            {}
        ];
    });

    it('should add two event listeners', function () {
        addMaximiseListener(streetViewContainers, maximiseSelector);

        expect(document.querySelectorAll.calls.count()).toBe(1);
        expect(addEventListener.calls.count()).toBe(2);
        expect(window.makeMaximiseHandler.calls.count()).toBe(2);
    });
});

describe('setMarkerMap', function () {
    var map, markers, setMap;

    beforeEach(function() {
        map = {};
        setMap = jasmine.createSpy('setMap');
        markers = [
            {
                setMap: setMap
            },
            {
                setMap: setMap
            }
        ];
    });

    it('should setMap twice', function () {
        setMarkerMap(map, markers);

        expect(setMap.calls.count()).toBe(2);
        expect(setMap).toHaveBeenCalledWith(map);
    });
});

describe('drawMarkers', function () {
    var streetViewData, markers, markerLabels, map, Marker, panBy;

    beforeEach(function() {
        Marker = jasmine.createSpy('Marker');
        google = {
            maps: {
                Marker: Marker,
                Animation: {
                    DROP: ''
                }
            }
        };
        panBy = jasmine.createSpy('panBy');
        map = {
            panBy: panBy
        };
        markers = [{}, {}, {}];
        streetViewData = [{}, {}];
        markerLabels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ123456789abcdefghijklmnopqrstuvwxyz';
        spyOn(window, 'setMarkerMap');
        spyOn(window, 'charFromStr');

        jasmine.clock().install();
    });

    afterEach(function() {
        delete window.google;
        jasmine.clock().uninstall();
    });

    it('should apply bug fix', function () {
        drawMarkers(streetViewData, markers, markerLabels, map);

        expect(map.panBy).not.toHaveBeenCalled();
        jasmine.clock().tick(501);
        expect(map.panBy.calls.count()).toBe(2);
    });

    it('should populate markers', function() {
        drawMarkers(streetViewData, markers, markerLabels, map);

        expect(window.setMarkerMap.calls.count()).toBe(2);
        expect(Marker.calls.count()).toBe(2);
        expect(window.charFromStr.calls.count()).toBe(2);
        expect(markers.length).toBe(2);
    });
});

describe('expandViewportToFitPlace', function () {
    var map, place;

    beforeEach(function() {
        map = jasmine.createSpyObj('map', ['fitBounds', 'setCenter', 'setZoom']);
        place = {
            geometry: {
                viewport: null,
                location: {}
            }
        }
    });

    it('should use viewport', function () {
        place.geometry.viewport = {};

        expandViewportToFitPlace(map, place);

        expect(map.fitBounds).toHaveBeenCalledWith(place.geometry.viewport);
        expect(map.setCenter).not.toHaveBeenCalled();
        expect(map.setZoom).not.toHaveBeenCalled();
    });

    it('should use location', function () {

        expandViewportToFitPlace(map, place);

        expect(map.fitBounds).not.toHaveBeenCalled();
        expect(map.setCenter).toHaveBeenCalledWith(place.geometry.location);
        expect(map.setZoom).toHaveBeenCalledWith(17);
    });
});

describe('populateRouteInfo', function () {
    var response, summary1, summary2, distance1, distance2, duration1, duration2;

    beforeEach(function() {
        summary1 = 'Footscray Rd/State Route 32';
        summary2 = 'State Route 50';
        distance1 = '5.1 km';
        distance2 = '5.8 km';
        duration1 = '10 mins';
        duration2 = '12 mins';

        response = {
            routes: [
                {
                    summary: summary1,
                    legs: [
                        {
                            distance: {
                                text: distance1
                            },
                            duration: {
                                text: duration1
                            }
                        }
                    ]
                },
                {
                    summary: summary2,
                    legs: [
                        {
                            distance: {
                                text: distance2
                            },
                            duration: {
                                text: duration2
                            }
                        }
                    ]
                }
            ]
        };
    });

    it('should populateRouteInfo for two routes', function () {
        var routeInfo = populateRouteInfo(response);

        expect(routeInfo.length).toBe(2);
        expect(routeInfo[0].summary).toBe(summary1);
        expect(routeInfo[1].summary).toBe(summary2);
        expect(routeInfo[0].distance).toBe(distance1);
        expect(routeInfo[1].distance).toBe(distance2);
        expect(routeInfo[0].duration).toBe(duration1);
        expect(routeInfo[1].duration).toBe(duration2);
    });
});

describe('populateStepDescriptionInfo', function () {
    var response, instructions1, instructions2, distance1, distance2, duration1, duration2, markerLabels;

    beforeEach(function() {
        instructions1 = 'Turn left';
        instructions2 = 'Turn right';
        distance1 = '5.1 km';
        distance2 = '5.8 km';
        duration1 = '10 mins';
        duration2 = '12 mins';

        response = {
            routes: [
                {
                    legs: [
                        {
                            steps: [
                                {
                                    instructions: instructions1,
                                    distance: {
                                        text: distance1
                                    },
                                    duration: {
                                        text: duration1
                                    }
                                },
                                {
                                    instructions: instructions2,
                                    distance: {
                                        text: distance2
                                    },
                                    duration: {
                                        text: duration2
                                    }
                                }
                            ]
                        }
                    ]
                }
            ]
        };
      markerLabels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ123456789abcdefghijklmnopqrstuvwxyz'
    });

    it('should populateStepDescriptionInfo for two steps', function () {
        var durationDistance = populateStepDescriptionInfo(response, 0, markerLabels);

        expect(durationDistance[0].instructions).toEqual('<b>A.</b> ' + instructions1);
        expect(durationDistance[1].instructions).toEqual('<b>B.</b> ' + instructions2);
        expect(durationDistance[0].duration).toBe(duration1);
        expect(durationDistance[1].duration).toBe(duration2);
        expect(durationDistance[0].distance).toBe(distance1);
        expect(durationDistance[1].distance).toBe(distance2);
        expect(durationDistance[0].durationDistance).toEqual('Travel ' + duration1 + ' (' + distance1 + ')');
        expect(durationDistance[1].durationDistance).toEqual('Travel ' + duration2 + ' (' + distance2 + ')');
    });
});

describe('checkFirstRoute', function () {
    var routeRadio, setAttribute;

    beforeEach(function() {
        setAttribute = jasmine.createSpy('setAttribute');
        routeRadio = [
            {
                setAttribute: setAttribute
            },
            {
                setAttribute: setAttribute
            }
        ];
    });

    it('should call checkFirstRoute and setAttribute', function () {
        checkFirstRoute(routeRadio);

        expect(setAttribute.calls.count()).toBe(1);
    });
});

describe('dispatchCustomEvent', function () {
    var initCustomEvent, event;

    beforeEach(function() {
        initCustomEvent = jasmine.createSpy('initCustomEvent');
        event = {
            initCustomEvent: initCustomEvent
        };
        spyOn(document, 'createEvent').and.returnValue(event);
        spyOn(document, 'dispatchEvent');
    });

    it('should dispatchCustomEvent', function () {
        dispatchCustomEvent('information_message', {
            message: 'Select your origin and destination then display turn-by-turn streetview directions.'
        });

        expect(document.createEvent.calls.count()).toBe(1);
        expect(event.initCustomEvent.calls.count()).toBe(1);
        expect(document.dispatchEvent.calls.count()).toBe(1);
    });
});

describe('makeRouteChangeHandler', function () {

    beforeEach(function() {
        spyOn(window, 'dispatchCustomEvent');
    });

    it('should create a function', function () {
        var result = makeRouteChangeHandler(0);

        expect(result).toEqual(jasmine.any(Function));
    });

    it('should create handler that dispatches event', function () {
        var result = makeRouteChangeHandler(0);
        result();
        expect(window.dispatchCustomEvent.calls.count()).toBe(1);
    });
});

describe('addRouteChangeListeners', function () {
    var routeRadio, addEventListener;

    beforeEach(function() {
        addEventListener = jasmine.createSpy('addEventListener');
        routeRadio = [
            {
                addEventListener: addEventListener
            },
            {
                addEventListener: addEventListener
            }
        ];
        spyOn(window, 'makeRouteChangeHandler');
    });

    it('should add one click listener', function () {
        addRouteChangeListeners(routeRadio);

        expect(addEventListener.calls.count()).toBe(2);
    });
});

describe('populateAndRenderRouteInfo', function () {
    var response, routeInfo, routeRadio;

    beforeEach(function() {
        response = {};
        routeInfo = [{}];
        routeRadio = [{}];
        spyOn(window, 'populateRouteInfo').and.returnValue(routeInfo);
        spyOn(document, 'querySelectorAll').and.returnValue(routeRadio);
        spyOn(document, 'querySelector').and.callFake(function(selector) {
          if('.hidden .route-info-mustache' === selector) {
            return {
              outerHTML: ''
            };
          } else {
            return {};
          }
        });
        spyOn(window, 'checkFirstRoute');
        spyOn(window, 'addRouteChangeListeners');
        Mustache = {
          render: function() {}
        };
    });

    afterEach(function() {
        delete window.Mustache;
    });

    it('should populateAndRenderRouteInfo', function () {
        populateAndRenderRouteInfo(response);

        expect(window.populateRouteInfo).toHaveBeenCalled();
        expect(document.querySelector.calls.count()).toBe(2);
        expect(document.querySelectorAll).toHaveBeenCalled();
        expect(window.checkFirstRoute).toHaveBeenCalled();
        expect(window.addRouteChangeListeners).toHaveBeenCalled();
    });
});

describe('addStreetViews', function () {
    var StreetViewPanorama, data, streetViewElementArray;

    beforeEach(function() {
        data = [{heading: 90}];
        streetViewElementArray = [{}];
        spyOn(document, 'querySelectorAll').and.returnValue(streetViewElementArray);
        StreetViewPanorama = jasmine.createSpy('StreetViewPanorama');
        google = {
            maps: {
                StreetViewPanorama: StreetViewPanorama
            }
        }
    });

    afterEach(function() {
        delete window.google;
    });

    it('should call addStreetViews successfully', function () {
        addStreetViews('.street-views .street-view', data);

        expect(document.querySelectorAll.calls.count()).toBe(1);
        expect(StreetViewPanorama.calls.count()).toBe(1);
    });
});

describe('populateAndRenderPoints', function () {
    var pointData;

    beforeEach(function() {
        pointData = [{}];
        spyOn(window, 'populateLatLng').and.returnValue(pointData);
        spyOn(window, 'calculateHeading');
        spyOn(window, 'drawMarkers');
        spyOn(window, 'addStreetViews');
    });

    it('should ', function () {
        populateAndRenderPoints({}, [], {}, 0);

        expect(window.populateLatLng.calls.count()).toBe(1);
        expect(window.calculateHeading.calls.count()).toBe(1);
        expect(window.drawMarkers.calls.count()).toBe(1);
        expect(window.addStreetViews.calls.count()).toBe(1);
    });
});

describe('addMinMaxListeners', function () {
    var streetViewContainers;

    beforeEach(function() {
        streetViewContainers = [{}, {}];
        spyOn(document, 'querySelectorAll').and.returnValue(streetViewContainers);
        spyOn(window, 'addMinimiseListener');
        spyOn(window, 'addMaximiseListener');
    });

    it('should call addMinMaxListeners successfully', function () {
        addMinMaxListeners();

        expect(document.querySelectorAll.calls.count()).toBe(1);
        expect(window.addMinimiseListener.calls.count()).toBe(1);
        expect(window.addMaximiseListener.calls.count()).toBe(1);
    });
});

describe('populateAndRenderStreetViews', function () {
    var template, target;

    beforeEach(function() {
        template = {
          outerHTML: ''
        };
        target = {
          innerHTML: ''
        };
        spyOn(window, 'populateAndRenderPoints');
        spyOn(window, 'addMinMaxListeners');
        spyOn(window, 'populateStepDescriptionInfo');
        spyOn(document, 'querySelector').and.callFake(function (selector) {
            if('.hidden .panorama-mustache' === selector) {
              return template;
            } else {
              return target;
            }
        });
        Mustache = {
          render: function() {}
        };
    });

    afterEach(function() {
      delete window.Mustache;
    });

    it('should call populateAndRenderStreetViews successfully', function () {
        populateAndRenderStreetViews({}, [{}], {}, 0);

        expect(window.populateAndRenderPoints.calls.count()).toBe(1);
        expect(window.addMinMaxListeners.calls.count()).toBe(1);
    });
});

describe('route', function () {
    var originPlace, destinationPlace, travelMode, directionsService,directionsDisplay, routeVar,
        setDirections, returnStatus;

    beforeEach(function() {

        google = {
            maps: {
                DirectionsStatus: {
                    OK: 'OK',
                    ZERO_RESULTS: 'ZERO_RESULTS',
                    UNKNOWN_ERROR: 'UNKNOWN_ERROR'
                },
                TravelMode: {
                    DRIVING: 'DRIVING'
                }
            }
        };
        originPlace = {
            id: 'id1'
        };
        destinationPlace = {
            id: 'id2'
        };
        travelMode = google.maps.TravelMode.DRIVING;
        routeVar = jasmine.createSpy('route').and.callFake(function(config, callback) {
            callback({}, returnStatus);
        });
        directionsService = {
            route: routeVar
        };
        setDirections = jasmine.createSpy('setDirections');
        directionsDisplay = {
            setDirections: setDirections
        };
        spyOn(window, 'dispatchCustomEvent');
    });

    afterEach(function() {
        delete window.google;
    });

    it('should return for empty origin', function() {
        originPlace.id = null;
        route(originPlace, destinationPlace, travelMode, directionsService, directionsDisplay);

        expect(directionsService.route).not.toHaveBeenCalled();
    });

    it('should return for empty destination', function() {
        destinationPlace.id = null;
        route(originPlace, destinationPlace, travelMode, directionsService, directionsDisplay);

        expect(directionsService.route).not.toHaveBeenCalled();
    });

    it('should return for empty destination and origin', function() {
        originPlace.id = null;
        destinationPlace.id = null;
        route(originPlace, destinationPlace, travelMode, directionsService, directionsDisplay);

        expect(directionsService.route).not.toHaveBeenCalled();
    });

    it('should display directions for OK status', function () {
        returnStatus = google.maps.DirectionsStatus.OK;
        route(originPlace, destinationPlace, travelMode, directionsService, directionsDisplay);

        expect(directionsService.route).toHaveBeenCalled();
        expect(directionsDisplay.setDirections).toHaveBeenCalled();
    });

    it('should display message for ZERO_RESULTS status', function () {
        returnStatus = google.maps.DirectionsStatus.ZERO_RESULTS;
        route(originPlace, destinationPlace, travelMode, directionsService, directionsDisplay);

        expect(directionsService.route).toHaveBeenCalled();
        expect(directionsDisplay.setDirections).not.toHaveBeenCalled();
        expect(window.dispatchCustomEvent).toHaveBeenCalled();
    });

    it('should display message for other status', function () {
        returnStatus = google.maps.DirectionsStatus.UNKNOWN_ERROR;
        route(originPlace, destinationPlace, travelMode, directionsService, directionsDisplay);

        expect(directionsService.route).toHaveBeenCalled();
        expect(directionsDisplay.setDirections).not.toHaveBeenCalled();
        expect(window.dispatchCustomEvent).toHaveBeenCalled();
    });
});

describe('buildAutoComplete', function () {
    var input, map, bindTo, autoReturn, Autocomplete;

    beforeEach(function() {
        input = {
            value: 'a value'
        };
        spyOn(document, 'getElementById').and.returnValue(input);
        bindTo = jasmine.createSpy('bindTo');
        autoReturn = {
            bindTo: bindTo
        };
        Autocomplete = jasmine.createSpy('Autocomplete').and.returnValue(autoReturn);
        google = {
            maps: {
                ControlPosition: {
                    TOP_LEFT: 'TOP_LEFT'
                },
                places: {
                    Autocomplete: Autocomplete
                }
            }
        };
        map = {
            controls: {
                TOP_LEFT: []
            }
        };
    });

    afterEach(function() {
        delete window.google;
    });

    it('should call buildAutoComplete successfully', function () {
        var autoReturn = buildAutoComplete('123', map);

        expect(document.getElementById).toHaveBeenCalled();
        expect(map.controls[google.maps.ControlPosition.TOP_LEFT].length).toBe(1);
        expect(autoReturn.bindTo).toHaveBeenCalled();
    });
});

describe('makePlaceChangeHandler', function () {
    var changedPlace, place, getPlace, that;

    beforeEach(function() {
        changedPlace = {
            id: null
        };
        place = {
            geometry: {},
            place_id: 'place1'
        };
        getPlace = jasmine.createSpy('getPlace').and.returnValue(place);
        that = {
            getPlace: getPlace
        };
        spyOn(window, 'dispatchCustomEvent');
        spyOn(window, 'expandViewportToFitPlace');
        spyOn(window, 'route');

        google = {
            maps: {
                TravelMode: {
                    DRIVING: 'DRIVING'
                }
            }
        };
    });

    it('should create a function', function () {
        var result = makePlaceChangeHandler(changedPlace, {}, {}, {},
            google.maps.TravelMode.DRIVING, {}, {}, 'message');

        expect(result).toEqual(jasmine.any(Function));
    });

    it('should send message for no geometry', function() {
        place.geometry = null;

        that.result = makePlaceChangeHandler(changedPlace, {}, {}, {},
            google.maps.TravelMode.DRIVING, {}, {}, 'message');
        that.result();

        expect(window.dispatchCustomEvent).toHaveBeenCalled();
        expect(window.expandViewportToFitPlace).not.toHaveBeenCalled();
    });

    it('should route if geometry is present', function() {
        that.result = makePlaceChangeHandler(changedPlace, {}, {}, {},
            google.maps.TravelMode.DRIVING, {}, {}, 'message');
        that.result();

        expect(window.dispatchCustomEvent).not.toHaveBeenCalled();
        expect(window.expandViewportToFitPlace).toHaveBeenCalled();
        expect(window.route).toHaveBeenCalled();
    });
});

describe('displayLandingPage', function() {
    var appendChild, cloneNode;

    beforeEach(function() {
        appendChild = jasmine.createSpy('appendChild');
        cloneNode = jasmine.createSpy('template');
        spyOn(window, 'clearContainer');
        spyOn(document, 'querySelector').and.callFake(function(selector){
            if('.street-views' === selector) {
                return {
                    appendChild: appendChild
                };
            } else {
                return {
                    cloneNode: cloneNode
                };
            }
        });
    });

    it('should call displayLandingPage successfully', function() {
        displayLandingPage();

        expect(window.clearContainer.calls.count()).toBe(2);
        expect(document.querySelector.calls.count()).toBe(2);
        expect(cloneNode).toHaveBeenCalled();
        expect(appendChild).toHaveBeenCalled();
    });
});

describe('doInit', function () {
    var directionsDisplay, setMap, addListener, autocomplete, ddaddListener, ddListener, docListeners;

    beforeEach(function() {
        setMap = jasmine.createSpy('setMap');
        ddaddListener = jasmine.createSpy('addListener').and.callFake(function(type, funk) {
            ddListener = funk;
        });
        directionsDisplay = {
            setMap: setMap,
            addListener: ddaddListener
        };

        spyOn(window, 'makePlaceChangeHandler');
        addListener = jasmine.createSpy('addListener');
        autocomplete = {
            addListener: addListener
        };
        spyOn(window, 'buildAutoComplete').and.returnValue(autocomplete);

        docListeners = {};
        spyOn(document, 'addEventListener').and.callFake(function(type, funk) {
            docListeners[type] = funk;
        });

        spyOn(window, 'dispatchCustomEvent');

        google = {
            maps: {
                TravelMode: {
                    DRIVING: 'DRIVING'
                }
            }
        };
        spyOn(window, 'displayLandingPage');
    });

    afterEach(function() {
        delete window.google;
    });

    it('should call doInit successfully', function () {
        doInit([{}], {}, {}, google.maps.TravelMode.DRIVING, {}, {}, directionsDisplay);

        expect(setMap.calls.count()).toBe(1);
        expect(window.buildAutoComplete.calls.count()).toBe(2);
        expect(window.makePlaceChangeHandler.calls.count()).toBe(2);
        expect(autocomplete.addListener.calls.count()).toBe(2);
        expect(directionsDisplay.addListener.calls.count()).toBe(1);
        expect(document.addEventListener.calls.count()).toBe(2);
        expect(window.displayLandingPage.calls.count()).toBe(1);
    });

    describe('directions_changed handler', function() {
        var getDirections, that, response = {};

        beforeEach(function() {
            getDirections = jasmine.createSpy('getDirections').and.returnValue(response);
            that = {
                getDirections: getDirections
            };
            spyOn(window, 'populateAndRenderRouteInfo');
            spyOn(window, 'populateAndRenderStreetViews');
        });

        it('should execute directions_changed handler', function() {
            doInit([{}], {}, {}, google.maps.TravelMode.DRIVING, {}, {}, directionsDisplay);
            that.callback = ddListener;

            that.callback();

            expect(getDirections).toHaveBeenCalled();
            expect(window.populateAndRenderRouteInfo).toHaveBeenCalledWith(response);
            expect(window.populateAndRenderStreetViews).toHaveBeenCalled();
        });
    });

    describe('route_selected', function() {
        var event, directionsDisplay;

        beforeEach(function() {
            event = {
                detail: {
                    index: 0
                }
            };
            directionsDisplay = jasmine.createSpyObj('directionsDisplay', [
                'setMap', 'addListener', 'setRouteIndex', 'getDirections']);
            spyOn(window, 'populateAndRenderStreetViews');
        });

        it('should call handler successfully', function() {
            doInit([{}], {}, {}, google.maps.TravelMode.DRIVING, {}, {}, directionsDisplay);
            docListeners['route_selected'](event);

            expect(directionsDisplay.setRouteIndex).toHaveBeenCalledWith(0);
            expect(directionsDisplay.getDirections).toHaveBeenCalled();
            expect(window.populateAndRenderStreetViews).toHaveBeenCalled();
        });
    });

    describe('information_message', function() {
        var event, message;

        beforeEach(function() {
            message = 'message';
            event = {
                detail: {
                    message: message
                }
            };
            spyOn(window, 'clearContainer');
            spyOn(window, 'informationMessage');
        });

        it('should call handler successfully', function() {
            doInit([{}], {}, {}, google.maps.TravelMode.DRIVING, {}, {}, directionsDisplay);
            docListeners['information_message'](event);

            expect(window.clearContainer.calls.count()).toBe(2);
            expect(window.informationMessage).toHaveBeenCalledWith(message);
        });
    });
});

describe('initMap', function () {
    var Map, DirectionsService, DirectionsRenderer,mapValue,directionsServiceValue,directionsRendererValue;

    beforeEach(function() {
        mapValue = {};
        Map = jasmine.createSpy('Map').and.returnValue(mapValue);
        directionsServiceValue = {};
        DirectionsService = jasmine.createSpy('DirectionsService').and.returnValue(directionsServiceValue);
        directionsRendererValue = {};
        DirectionsRenderer = jasmine.createSpy('DirectionsRenderer').and.returnValue(directionsRendererValue);
        google = {
            maps: {
                Map: Map,
                DirectionsService: DirectionsService,
                DirectionsRenderer: DirectionsRenderer,
                TravelMode: {
                    DRIVING: 'DRIVING'
                }
            }
        };
        spyOn(document, 'getElementById');
        spyOn(window, 'doInit');
    });

    afterEach(function() {
        delete window.google;
    });

    it('should call initMap successfully', function () {
        initMap();

        expect(document.getElementById).toHaveBeenCalled();
        expect(Map).toHaveBeenCalled();
        expect(DirectionsService).toHaveBeenCalled();
        expect(DirectionsRenderer).toHaveBeenCalled();
        expect(window.doInit).toHaveBeenCalledWith([], { id:  null}, { id: null},
            google.maps.TravelMode.DRIVING, mapValue, directionsServiceValue, directionsRendererValue);
    });
});



