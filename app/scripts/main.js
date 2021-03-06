/*globals google, Mustache */

function charFromStr(index, str) {
    'use strict';

    return str.charAt( (index % str.length) );
}

function convertTo360Heading(heading) {
    'use strict';

    if(heading < 0) {
        return Math.round(360 + heading);
    }else{
        return Math.round(heading);
    }
}

function toggleString(toBRemoved, toBAdded, str) {
    'use strict';

    return str.replace(toBRemoved, '').trim() + ' ' + toBAdded;
}

function callLatLngGetFunctions(propertyName, object) {
    'use strict';


    return {
        lat: object[propertyName].lat(),
        lng: object[propertyName].lng()
    };
}

function populateLatLng(response, routeIndex) {
    'use strict';

    var steps = response.routes[routeIndex].legs[0].steps;
    var i, latLngArray = new Array(steps.length + 1);

    latLngArray[0] = callLatLngGetFunctions('start_location', steps[0]);

    for ( i = 0 ; i < steps.length ; i++) {
        latLngArray[i + 1] = callLatLngGetFunctions('end_location', steps[i]);
    }

    return latLngArray;
}

function latLngLiteralToHeading(latLngLiteral1, latLngLiteral2) {
    'use strict';

    var latLng1 = new google.maps.LatLng(latLngLiteral1.lat, latLngLiteral1.lng);
    var latLng2 = new google.maps.LatLng(latLngLiteral2.lat, latLngLiteral2.lng);

    return google.maps.geometry.spherical.computeHeading(latLng1 ,latLng2);
}

function calculateHeading(latLngArray) {
    'use strict';

    var i;

    latLngArray[0].heading = convertTo360Heading(latLngLiteralToHeading(latLngArray[0], latLngArray[1]));

    for ( i = 1; i < latLngArray.length ; i++) {
        latLngArray[i].heading = convertTo360Heading(latLngLiteralToHeading(latLngArray[i - 1],latLngArray[i]));
    }
}

function informationMessage(message){
    'use strict';

    var container = document.querySelector('.route-summary'),
        info = document.querySelector('.information-message'),
        clone = info.cloneNode(true);

    container.appendChild(clone);
    clone.innerHTML = message;
}

function clearContainer(containerSelector) {
    'use strict';

    document.querySelector(containerSelector).innerHTML = '';
}

function isAnimateSupported(){
    'use strict';

    var elm = document.createElement('div');
    return elm.style.animationName !== undefined;
}

function getShowClass() {
    'use strict';

    return isAnimateSupported() ? 'rolleddown' : 'open';
}

function getHideClass() {
    'use strict';

    return isAnimateSupported() ? 'rolledup' : 'close';
}

/** Required to capture the correct value of i. Don't create functions in loops
 * */
function makeMinimiseHandler(i, streetViewContainers) {
    'use strict';

    return function() {
        var currentClass = streetViewContainers[i].className,
            hideClass = getHideClass(), showClass = getShowClass();

        if(currentClass.indexOf(hideClass) < 0) {
            streetViewContainers[i].className = toggleString(showClass, hideClass, currentClass);
        }
    };
}

function makeMaximiseHandler(i, streetViewContainers) {
    'use strict';

    return function() {
        var currentClass = streetViewContainers[i].className,
            hideClass = getHideClass(), showClass = getShowClass();

        if(currentClass.indexOf(hideClass) > -1) {
            streetViewContainers[i].className = toggleString(hideClass, showClass, currentClass);
        }
    };
}

function addMinimiseListener(streetViewContainers, minimiseSelector) {
    'use strict';

    var minimisers = document.querySelectorAll(minimiseSelector), i;

    for (i = 0; i < minimisers.length ; i++) {
        minimisers[i].addEventListener('click', makeMinimiseHandler(i, streetViewContainers));
    }
}

function addMaximiseListener(streetViewContainers, maximiseSelector) {
    'use strict';

    var maximisers = document.querySelectorAll(maximiseSelector), i;

    for (i = 0; i < maximisers.length ; i++) {
        maximisers[i].addEventListener('click', makeMaximiseHandler(i, streetViewContainers));
    }
}

function setMarkerMap(map, markers) {
    'use strict';

    var i;

    for(i = 0; i < markers.length ; i++) {
        markers[i].setMap(map);
    }
}

function drawMarkers(streetViewData, markers, markerLabels, map) {
    'use strict';

    var i;

    setMarkerMap(null, markers);

    //Clear all data first
    markers.length = 0;
    markers.length = streetViewData.length;

    for ( i = 0; i < streetViewData.length ; i++) {

        markers[i] = new google.maps.Marker({
            position: streetViewData[i],
            label: charFromStr(i, markerLabels),
            animation: google.maps.Animation.DROP
        });
    }
    setMarkerMap(map, markers);

    //Workaround for markers not being rendered occasionally. This always fixes it.
    setTimeout(function() {
        map.panBy(1,0);
        map.panBy(-1,0);
    }, 500);
}

function expandViewportToFitPlace(map, place) {
    'use strict';

    if (place.geometry.viewport) {
        map.fitBounds(place.geometry.viewport);
    } else {
        map.setCenter(place.geometry.location);
        map.setZoom(17);
    }
}

function populateRouteInfo(response){
    'use strict';

    var i, routeInfo, routes = [];

    for(i = 0 ; i < response.routes.length ; i++) {
        routeInfo = {};
        routeInfo.summary = response.routes[i].summary;
        routeInfo.distance = response.routes[i].legs[0].distance.text;
        routeInfo.duration = response.routes[i].legs[0].duration.text;
        routes.push(routeInfo);
    }
    return routes;
}

function populateStepDescriptionInfo(response, routeIndex, markerLabels) {
    'use strict';

    var i, steps = response.routes[routeIndex].legs[0].steps,
        durationDistanceData = new Array(steps.length);

    for(i = 0 ; i < steps.length ; i++){
        durationDistanceData[i] = {};
        durationDistanceData[i].instructions = '<b>' + charFromStr(i, markerLabels) + '.</b> ' + steps[i].instructions;
        durationDistanceData[i].duration = steps[i].duration.text;
        durationDistanceData[i].distance = steps[i].distance.text;
        durationDistanceData[i].durationDistance = 'Travel ' + durationDistanceData[i].duration +
                                                    ' (' + durationDistanceData[i].distance + ')';
    }
    durationDistanceData[i] = {};
    durationDistanceData[i].instructions = '<b>' + charFromStr(i, markerLabels) + '.</b> ' +
                                                                                    'You have reached your destination';
    return durationDistanceData;
}

function checkFirstRoute(routeRadio) {
    'use strict';

    routeRadio[0].setAttribute('checked', 'checked');
}

function dispatchCustomEvent(eventName, data) {
    'use strict';

    var event = document.createEvent('CustomEvent');
    event.initCustomEvent(eventName, true, true, data);
    document.dispatchEvent(event);
}

function makeRouteChangeHandler(i){
    'use strict';

    return function() {
        dispatchCustomEvent('route_selected', {index: i});
    };
}

function addRouteChangeListeners(routeRadio) {
    'use strict';

    var i;

    for (i = 0; i < routeRadio.length ; i++) {
        routeRadio[i].addEventListener('click', makeRouteChangeHandler(i));
    }
}

function populateAndRenderRouteInfo(response){
    'use strict';

    var routeRadio,
        routeInfo = {
                routeInfo: populateRouteInfo(response)
        },
        mustacheRoute = document.querySelector('.hidden .route-info-mustache').outerHTML;

    document.querySelector('.route-summary').innerHTML = Mustache.render(mustacheRoute, routeInfo);

    routeRadio = document.querySelectorAll('.route-summary .route-radio-input');
    checkFirstRoute(routeRadio);
    addRouteChangeListeners(routeRadio);
}

function addStreetViews(streetViewSelector, data) {
    'use strict';

    var streetViewElementArray = document.querySelectorAll(streetViewSelector),
        i, panorama;

    for (i = 0; i < data.length ; i++) {
        panorama = new google.maps.StreetViewPanorama(
            streetViewElementArray[i],{
                scrollwheel: false,
                pov: {
                    heading:data[i].heading,
                    pitch: 0
                },
                position: data[i]
            });
    }
}

function populateAndRenderPoints(response, markers, map, routeIndex, markerLabels){
    'use strict';

    var pointData = populateLatLng(response, routeIndex);
    calculateHeading(pointData);

    drawMarkers(pointData, markers, markerLabels, map);

    addStreetViews('.street-views .street-view', pointData);
}

function addMinMaxListeners(){
    'use strict';

    var streetViewContainers = document.querySelectorAll('.street-views .street-view-container');

    addMinimiseListener(streetViewContainers, '.street-views .minimise');
    addMaximiseListener(streetViewContainers, '.street-views .maximise');
}

function populateAndRenderStreetViews(response, markers, map, routeIndex) {
    'use strict';

    var markerLabels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ123456789abcdefghijklmnopqrstuvwxyz',
        stepInfo = {
          stepInfo: populateStepDescriptionInfo(response, routeIndex, markerLabels)
        };

    var mustacheStreetview = document.querySelector('.hidden .panorama-mustache').outerHTML;
    document.querySelector('.street-views').innerHTML = Mustache.render(mustacheStreetview, stepInfo);

    populateAndRenderPoints(response, markers, map, routeIndex, markerLabels);
    addMinMaxListeners();
}

function route(originPlace, destinationPlace, travelMode, directionsService, directionsDisplay) {
    'use strict';

    if (!originPlace.id || !destinationPlace.id) {
        return;
    }
    directionsService.route({
        origin: {'placeId': originPlace.id},
        destination: {'placeId': destinationPlace.id},
        travelMode: travelMode,
        provideRouteAlternatives: true
    }, function(response, status) {
        if (status === google.maps.DirectionsStatus.OK) {

            directionsDisplay.setDirections(response);
        } else if (status === google.maps.DirectionsStatus.ZERO_RESULTS) {
            dispatchCustomEvent('information_message', {
                message: 'No directions for your start and end locations could be found'
            });
        } else {
            dispatchCustomEvent('information_message', {
                message: 'No directions could be found due to an error'
            });
        }
    });
}

function buildAutoComplete(inputId, map){
    'use strict';

    var autocomplete, input = document.getElementById(inputId);

    //Firefox 47.0.1 on OSX doesn't clear previous search on page loading
    input.value = null;

    map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);
    autocomplete = new google.maps.places.Autocomplete(input);
    autocomplete.bindTo('bounds', map);

    return autocomplete;
}

function makePlaceChangeHandler(changedPlace, map, originPlace, destinationPlace, travelMode,
                                directionsService, directionsDisplay, message) {
    'use strict';

    return function() {
        var place = this.getPlace();
        if (!place.geometry) {
            dispatchCustomEvent('information_message', {
                message: message
            });
            return;
        }
        expandViewportToFitPlace(map, place);

        /*jshint camelcase: false */
        changedPlace.id = place.place_id;
        route(originPlace, destinationPlace, travelMode,
            directionsService, directionsDisplay);
    };
}

function displayLandingPage() {
    'use strict';

    var container, template;

    clearContainer('.route-summary');
    clearContainer('.street-views');
    container = document.querySelector('.street-views');
    template = document.querySelector('.hidden .landing-page-template');

    container.appendChild(template.cloneNode(true));
}

/** Make as much code as possible testable. Even if it's a bit hacky
 * */
function doInit(markers, originPlace, destinationPlace, travelMode, map,
                directionsService, directionsDisplay){
    'use strict';

    directionsDisplay.setMap(map);

    var originAutocomplete = buildAutoComplete('origin-input', map);
    var destinationAutocomplete = buildAutoComplete('destination-input', map);

    originAutocomplete.addListener('place_changed', makePlaceChangeHandler(originPlace, map, originPlace,
        destinationPlace, travelMode,
        directionsService, directionsDisplay, 'Please select a valid start location'));

    destinationAutocomplete.addListener('place_changed',  makePlaceChangeHandler(destinationPlace, map, originPlace,
        destinationPlace, travelMode,
        directionsService, directionsDisplay, 'Please select a valid end location'));

    directionsDisplay.addListener('directions_changed', function() {
        var response = this.getDirections();

        populateAndRenderRouteInfo(response);
        populateAndRenderStreetViews(response, markers, map, 0);
    });

    document.addEventListener('route_selected', function (e) {
        directionsDisplay.setRouteIndex(e.detail.index);
        populateAndRenderStreetViews(directionsDisplay.getDirections(), markers, map, e.detail.index);
    });

    document.addEventListener('information_message', function (e)  {
        clearContainer('.route-summary');
        clearContainer('.street-views');
        informationMessage(e.detail.message);
    });
    displayLandingPage();
}

/* exported initMap */
function initMap() {
    'use strict';

    var markers = [];
    var originPlace = { id:  null};
    var destinationPlace = { id: null};
    var travelMode = google.maps.TravelMode.DRIVING;
    var map = new google.maps.Map(document.getElementById('map'), {
        mapTypeControl: false,
        center: {lat: -37.8162789, lng: 144.96424590000004},
        zoom: 13,
        scrollwheel: false
    });
    var directionsService = new google.maps.DirectionsService();
    var directionsDisplay = new google.maps.DirectionsRenderer({
        suppressMarkers: true,
        draggable: true
    });
    doInit(markers, originPlace, destinationPlace, travelMode, map, directionsService, directionsDisplay);
}

