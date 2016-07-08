
The markers that don't display do have a map property set but not an anchor point

repeated triggering of directions_changed causes the markers to have map set to null and disappear
then reappear again.

Moving the map or resizing the window causes the markers to display

myglobal.map.panBy(1,0); Causes the markers to draw

None of the following caused the markers to be correctly drawn

google.maps.event.trigger(myglobal.directionsDisplay,'directions_changed');

var bounds = myglobal.map.getBounds();
myglobal.map.fitBounds(bounds);

google.maps.event.trigger(myglobal.map,'resize');