
function charFromStr(index, str) {
    return str.charAt( (index % str.length) )
}

function convertTo360Heading(heading) {
    if(heading < 0) {
        return Math.round(360 + heading);
    }else{
        return Math.round(heading);
    }
}

function toggleString(toBRemoved, toBAdded, str) {
    return str.replace(toBRemoved, "").trim() + " " + toBAdded;
}


/**
 * Google maps API specific functions
 * */


function callLatLngGetFunctions(propertyName, object) {

    return {
        lat: object[propertyName].lat(),
        lng: object[propertyName].lng()
    }
}

function populateLatLng(response, routeIndex) {
    var steps = response.routes[routeIndex].legs[0].steps;
    var i, latLngArray = new Array(steps.length + 1);

    latLngArray[0] = callLatLngGetFunctions('start_location', steps[0]);

    for ( i = 0 ; i < steps.length ; i++) {
        latLngArray[i + 1] = callLatLngGetFunctions('end_location', steps[i])
    }

    return latLngArray;
}

function populateInstructions(response, streetViewData, routeIndex) {
    var steps = response.routes[routeIndex].legs[0].steps;
    var i;

    for(i = 0 ; i < steps.length ; i++){
        streetViewData[i].instructions = steps[i].instructions;
    }
    streetViewData[i].instructions = "You have reached your destination";
}

function latLngLiteralToHeading(latLngLiteral1, latLngLiteral2) {
    latLng1 = new google.maps.LatLng(latLngLiteral1.lat, latLngLiteral1.lng);
    latLng2 = new google.maps.LatLng(latLngLiteral2.lat, latLngLiteral2.lng);

    return google.maps.geometry.spherical.computeHeading(latLng1 ,latLng2);
}

function calculateHeading(latLngArray) {
    var i;

    latLngArray[0].heading = convertTo360Heading(latLngLiteralToHeading(latLngArray[0], latLngArray[1]));

    for ( i = 1; i < latLngArray.length ; i++) {
        latLngArray[i].heading = convertTo360Heading(latLngLiteralToHeading(latLngArray[i - 1],latLngArray[i]));
    }
}



/**
 *  DOM specific
 * */



function informationMessage(message){
    var container = document.querySelector(".route-summary"),
        info = document.querySelector(".information-message"),
        clone = info.cloneNode(true);

    container.appendChild(clone);
    clone.innerHTML = message;
}

function addDescriptions(descriptionsSelector, markerLabels, data) {
    var i, descriptions = document.querySelectorAll(descriptionsSelector);

    for (i = 0; i < data.length ; i++) {
        descriptions[i].innerHTML = "<b>" + charFromStr(i, markerLabels) + ".</b> " + data[i].instructions;
    }
}

function appendTemplateCopies(domContainer, domTemplate, copyCount) {
    var i;

    for (i = 0; i < copyCount; i++) {

        domContainer.appendChild( domTemplate.cloneNode(true) );
    }
}

function clearContainer(containerSelector) {
    document.querySelector(containerSelector).innerHTML = "";
}

function createRouteInfoDOM(containerSelector, templateSelector, childContainerSelector, childTemplateSelector,
                            routeInfo) {
    var container = document.querySelector(containerSelector),
        template = document.querySelector(templateSelector),
        childContainer,
        childTemplate = document.querySelector(childTemplateSelector);

    try  {
        clearContainer(containerSelector);
        container.appendChild( template.cloneNode(true) );

        childContainer = document.querySelector(childContainerSelector);

        appendTemplateCopies(childContainer, childTemplate, routeInfo.length);
    } catch (e)  {
        console.error(e.stack);
        console.error("Require template [" + templateSelector + "] target container [" + containerSelector + "]")
    }
}

function createStreetViewDOM(containerSelector, templateSelector, copyCount) {
    var container = document.querySelector(containerSelector),
        templateElementArray = document.querySelectorAll(templateSelector);

    try  {
        clearContainer(containerSelector);
        appendTemplateCopies(container, templateElementArray[0], copyCount);
    } catch (e)  {
        console.error(e.stack);
        console.error("Require template [" + templateSelector + "] target container [" + containerSelector + "]")
    }
}

function isAnimateSupported(){
    var elm = document.createElement('div');
    return elm.style.animationName !== undefined;
}

function getShowClass() {
    return isAnimateSupported() ? "rolleddown" : "open";
}

function getHideClass() {
    return isAnimateSupported() ? "rolledup" : "close";
}

/** Required to capture the correct value of i. Don't create functions in loops
 * */
function makeMinimiseHandler(i, streetViewContainers) {
    return function() {
        var currentClass = streetViewContainers[i].className,
            hideClass = getHideClass(), showClass = getShowClass();

        if(currentClass.indexOf(hideClass) < 0) {
            streetViewContainers[i].className = toggleString(showClass, hideClass, currentClass);
        }
    };
}

function makeMaximiseHandler(i, streetViewContainers) {
    return function() {
        var currentClass = streetViewContainers[i].className,
            hideClass = getHideClass(), showClass = getShowClass();

        if(currentClass.indexOf(hideClass) > -1) {
            streetViewContainers[i].className = toggleString(hideClass, showClass, currentClass);
        }
    };
}

function addMinimiseListener(streetViewContainers, minimiseSelector) {
    var minimisers = document.querySelectorAll(minimiseSelector), i;

    for (i = 0; i < minimisers.length ; i++) {
        minimisers[i].addEventListener('click', makeMinimiseHandler(i, streetViewContainers));
    }
}

function addMaximiseListener(streetViewContainers, maximiseSelector) {
    var maximisers = document.querySelectorAll(maximiseSelector), i;

    for (i = 0; i < maximisers.length ; i++) {
        maximisers[i].addEventListener('click', makeMaximiseHandler(i, streetViewContainers));
    }
}

function setMarkerMap(map, markers) {
    var i;

    for(i = 0; i < markers.length ; i++) {
        markers[i].setMap(map);
    }
}

function drawMarkers(streetViewData, markers, markerLabels, map) {
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
    if (place.geometry.viewport) {
        map.fitBounds(place.geometry.viewport);
    } else {
        map.setCenter(place.geometry.location);
        map.setZoom(17);
    }
}

function populateRouteInfo(response){
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

function populateDurationDistance(response, routeIndex) {
    var i, steps = response.routes[routeIndex].legs[0].steps,
        durationDistanceData = new Array(steps.length);

    for(i = 0 ; i < steps.length ; i++){
        durationDistanceData[i] = {};
        durationDistanceData[i].duration = steps[i].duration.text;
        durationDistanceData[i].distance = steps[i].distance.text;
    }
    return durationDistanceData;
}

function addRouteInfo(descriptionSelector, distanceSelector, durationSelector, routeInfo) {
    var i, descriptions = document.querySelectorAll(descriptionSelector),
        distances = document.querySelectorAll(distanceSelector),
        durations = document.querySelectorAll(durationSelector);

    for(i = 0 ; i < routeInfo.length ; i++) {
        descriptions[i].innerHTML = routeInfo[i].summary;
        distances[i].innerHTML = routeInfo[i].distance;
        durations[i].innerHTML = routeInfo[i].duration;
    }
}

function createDurationDistanceDOM(targetSelector, templateSelector) {
    var i, targets = document.querySelectorAll(targetSelector),
        templateElement = document.querySelector(templateSelector);

    for( i = 0 ; i < (targets.length - 1) ; i++) {
        targets[i].appendChild(templateElement.cloneNode(true));
    }

}

function addDurationDistance(distanceSelector, durationSelector, durationDistanceData){
    var i, distances = document.querySelectorAll(distanceSelector),
        durations = document.querySelectorAll(durationSelector);

    for( i = 0; i < durations.length ; i++) {
        durations[i].innerHTML = durationDistanceData[i].duration;
        distances[i].innerHTML = durationDistanceData[i].distance;
    }
}

function checkFirstRoute(routeRadio) {
    routeRadio[0].setAttribute("checked", "checked");
}

function dispatchCustomEvent(eventName, data) {
    var event = document.createEvent('CustomEvent');
    event.initCustomEvent(eventName, true, true, data);
    document.dispatchEvent(event);
}

function makeRouteChangeHandler(i){
    return function() {
        dispatchCustomEvent('route_selected', {index: i});
    }
}

function addRouteChangeListeners(routeRadio) {
    var i;

    for (i = 0; i < routeRadio.length ; i++) {
        routeRadio[i].addEventListener('click', makeRouteChangeHandler(i));
    }
}

function populateAndRenderRouteInfo(response){
    var routeRadio, routeInfo = populateRouteInfo(response);

    createRouteInfoDOM(".route-summary", ".hidden .directions-information", ".route-summary .route-info",
        ".hidden .route-info-template", routeInfo);
    addRouteInfo(".route-summary .route-description", ".route-summary .distance-data",
        ".route-summary .duration-data", routeInfo);

    routeRadio = document.querySelectorAll(".route-summary .route-radio-input");
    checkFirstRoute(routeRadio);
    addRouteChangeListeners(routeRadio);
}

function populateAndRenderPoints(response, markers, map, routeIndex){
    var markerLabels = "ABCDEFGHIJKLMNOPQRSTUVWXYZ123456789abcdefghijklmnopqrstuvwxyz",
        pointData = populateLatLng(response, routeIndex);

    populateInstructions(response, pointData, routeIndex);
    calculateHeading(pointData);

    drawMarkers(pointData, markers, markerLabels, map);

    createStreetViewDOM(".street-views", ".hidden .panorama-template", pointData.length);
    addStreetViews(".street-views .street-view", pointData);
    addDescriptions(".street-views .description-content", markerLabels, pointData);
}

function addMinMaxListeners(){
    var streetViewContainers = document.querySelectorAll(".street-views .street-view-container");

    addMinimiseListener(streetViewContainers, ".street-views .minimise");
    addMaximiseListener(streetViewContainers, ".street-views .maximise");
}

function populateAndRenderDurationDistance(response, routeIndex) {
    var durationDistanceData = populateDurationDistance(response, routeIndex);

    addDurationDistance(".street-views .duration-distance-template .distance-data",
        ".street-views .duration-distance-template .duration-data", durationDistanceData);
}

function populateAndRenderStreetViews(response, markers, map, routeIndex) {
    populateAndRenderPoints(response, markers, map, routeIndex);
    addMinMaxListeners();
    createDurationDistanceDOM(".street-views .duration-distance-placeholder",".hidden .duration-distance-template");
    populateAndRenderDurationDistance(response, routeIndex);
}

function route(origin_place, destination_place, travel_mode, directionsService, directionsDisplay) {
    if (!origin_place.id || !destination_place.id) {
        return;
    }
    directionsService.route({
        origin: {'placeId': origin_place.id},
        destination: {'placeId': destination_place.id},
        travelMode: travel_mode,
        provideRouteAlternatives: true
    }, function(response, status) {
        if (status === google.maps.DirectionsStatus.OK) {

            directionsDisplay.setDirections(response);
        } else if (status === google.maps.DirectionsStatus.ZERO_RESULTS) {
            dispatchCustomEvent('information_message', {
                message: "No directions for your origin and destination could be found"
            });
        } else {
            dispatchCustomEvent('information_message', {
                message: "No directions could be found due to an error"
            });
        }
    });
}


/**
 *  Multiple API dependencies
 * */


function addStreetViews(streetViewSelector, data) {
    var streetViewElementArray = document.querySelectorAll(streetViewSelector),
        i, panorama;

    try {
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
    } catch (e) {
        console.error(e.stack);
        console.error("Error initializing street views");
    }
}

function buildAutoComplete(inputId, map){
    var autocomplete, input = document.getElementById(inputId);

    //Firefox 47.0.1 on OSX doesn't clear previous search on page loading
    input.value = null;

    map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);
    autocomplete = new google.maps.places.Autocomplete(input);
    autocomplete.bindTo('bounds', map);

    return autocomplete;
}

function makePlaceChangeHandler(changedPlace, map, origin_place, destination_place, travel_mode,
                                directionsService, directionsDisplay) {
    return function() {
        var place = this.getPlace();
        if (!place.geometry) {
            dispatchCustomEvent('information_message', {
                message: "Please select a valid origin and destination"
            });
            return;
        }
        expandViewportToFitPlace(map, place);

        changedPlace.id = place.place_id;
        route(origin_place, destination_place, travel_mode,
            directionsService, directionsDisplay);
    }
}

/** Make as much code as possible testable. Even if it's a bit hacky
 * */
function doInit(markers, origin_place, destination_place, travel_mode, map,
                directionsService, directionsDisplay){

    directionsDisplay.setMap(map);

    var origin_autocomplete = buildAutoComplete("origin-input", map);
    var destination_autocomplete = buildAutoComplete("destination-input", map);

    origin_autocomplete.addListener('place_changed', makePlaceChangeHandler(origin_place, map, origin_place,
        destination_place, travel_mode,
        directionsService, directionsDisplay));

    destination_autocomplete.addListener('place_changed',  makePlaceChangeHandler(destination_place, map, origin_place,
        destination_place, travel_mode,
        directionsService, directionsDisplay));

    directionsDisplay.addListener("directions_changed", function() {
        var response = this.getDirections();

        populateAndRenderRouteInfo(response);
        populateAndRenderStreetViews(response, markers, map, 0);
    });

    document.addEventListener('route_selected', function (e) {
        directionsDisplay.setRouteIndex(e.detail.index);
        populateAndRenderStreetViews(directionsDisplay.getDirections(), markers, map, e.detail.index);
    });

    document.addEventListener("information_message", function (e)  {
        clearContainer(".route-summary");
        clearContainer(".street-views");
        informationMessage(e.detail.message);
    });

    dispatchCustomEvent("information_message", {
        message: "Select an origin and destination then display turn-by-turn streetview directions."
    })
}
