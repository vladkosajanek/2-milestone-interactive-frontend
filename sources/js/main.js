    var map, places, infoWindow;
    var markers = [];
    var autocomplete;
    var countryRestrict = { 'country': [] };
    var MARKER_PATH = 'https://developers.google.com/maps/documentation/javascript/images/marker_green';
    var hostnameRegexp = new RegExp('^https?://.+?/');

    //List of countries: zoom level and their coordinates
    var countries = {
        'au': {
            center: { lat: -25.3, lng: 133.8 },
            zoom: 4
        },
        'br': {
            center: { lat: -14.2, lng: -51.9 },
            zoom: 3
        },
        'ca': {
            center: { lat: 62, lng: -110.0 },
            zoom: 3
        },
        'fr': {
            center: { lat: 46.2, lng: 2.2 },
            zoom: 5
        },
        'de': {
            center: { lat: 51.2, lng: 10.4 },
            zoom: 5
        },
        'mx': {
            center: { lat: 23.6, lng: -102.5 },
            zoom: 4
        },
        'nz': {
            center: { lat: -40.9, lng: 174.9 },
            zoom: 5
        },
        'it': {
            center: { lat: 41.9, lng: 12.6 },
            zoom: 5
        },
        'za': {
            center: { lat: -30.6, lng: 22.9 },
            zoom: 5
        },
        'es': {
            center: { lat: 40.5, lng: -3.7 },
            zoom: 5
        },
        'pt': {
            center: { lat: 39.4, lng: -8.2 },
            zoom: 6
        },

        'sk': {
            center: { lat: 48.7, lng: 19.7 },
            zoom: 7
        },
        'us': {
            center: { lat: 37.1, lng: -95.7 },
            zoom: 3
        },
        'uk': {
            center: { lat: 54.8, lng: -4.6 },
            zoom: 5
        }
    };

    function initMap() {
        $('#all-radio').prop("checked", true);
        map = new google.maps.Map(document.getElementById('map'), {
            zoom: 3,
            center: countries['sk'].center,
            mapTypeControl: false,
            panControl: false,
            zoomControl: false,
            streetViewControl: false,

        });

        infoWindow = new google.maps.InfoWindow({
            content: document.getElementById('info-content')
        });

        // Create the autocomplete object and associate it with the UI input control.
        // Restrict the search to the default country, and to place type "cities".
        autocomplete = new google.maps.places.Autocomplete(
            /** @type {!HTMLInputElement} */
            (
                document.getElementById('autocomplete')), {
                types: ['(cities)'],
                componentRestrictions: countryRestrict
            });
        places = new google.maps.places.PlacesService(map);



        // DOM event listeners to react when the user selects a radio button.
        autocomplete.addListener('place_changed', onPlaceChanged);
        document.getElementById('all-radio').addEventListener('change', onPlaceChanged);
        document.getElementById('accommodation-radio').addEventListener('change', onPlaceChanged);
        document.getElementById('restaurant-radio').addEventListener('change', onPlaceChanged);
        document.getElementById('museum-radio').addEventListener('change', onPlaceChanged);
        document.getElementById('attraction-radio').addEventListener('change', onPlaceChanged);


        // Add a DOM event listener to react when the user selects a country.
        document.getElementById('country').addEventListener('change', setAutocompleteCountry);
        document.getElementById('reset').addEventListener("click", setAutocompleteCountry);
    }

    // When the user selects a city, get the place details for the city and
    // zoom the map in on the city.
    function onPlaceChanged() {
        if ($('#all-radio').is(':checked')) {
            var place = autocomplete.getPlace();
            if (place.geometry) {
                map.panTo(place.geometry.location);
                map.setZoom(15);
                searchAll();
            }
            else {
                $('#autocomplete').attr("placeholder", "Enter a city");
            }
        }
        else if ($('#accommodation-radio').is(':checked')) {
            var place = autocomplete.getPlace();
            if (place.geometry) {
                map.panTo(place.geometry.location);
                map.setZoom(15);
                searchAccommodation();
            }
            else {
                $('#autocomplete').attr("placeholder", "Enter a city");
            }
        }
        else if ($('#restaurant-radio').is(':checked')) {
            var place = autocomplete.getPlace();
            if (place.geometry) {
                map.panTo(place.geometry.location);
                map.setZoom(15);
                searchRestaurant();
            }
            else {
                $('#autocomplete').attr("placeholder", "Enter a city");
            }
        }
        else if ($('#museum-radio').is(':checked')) {
            var place = autocomplete.getPlace();
            if (place.geometry) {
                map.panTo(place.geometry.location);
                map.setZoom(15);
                searchMuseum();
            }
            else {
                $('#autocomplete').attr("placeholder", "Enter a city");
            }
        }
        else if ($('#attraction-radio').is(':checked')) {
            var place = autocomplete.getPlace();
            if (place.geometry) {
                map.panTo(place.geometry.location);
                map.setZoom(15);
                searchAttraction();
            }
            else {
                $('#autocomplete').attr("placeholder", "Enter a city");
            }
        }
    }

    // Search for all attractions, hotels, museums, restaurants.... in the selected city, within the viewport of the map.
    function searchAll() {
        var search = {
            bounds: map.getBounds(),
            types: ['restaurant', 'lodging', 'bar', 'cafe', 'night_club', 'museum', 'art_gallery', 'church', 'zoo', 'park', 'mosque', 'hindu_temple']
        };

        places.nearbySearch(search, function(results, status) {
            if (status === google.maps.places.PlacesServiceStatus.OK) {
                clearResults();
                clearMarkers();
                // Create a marker for each hotel found, and
                // assign a letter of the alphabetic to each marker icon.
                for (var i = 0; i < results.length; i++) {
                    var markerLetter = String.fromCharCode('A'.charCodeAt(0) + (i % 26));
                    var markerIcon = MARKER_PATH + markerLetter + '.png';
                    // Use marker animation to drop the icons incrementally on the map.
                    markers[i] = new google.maps.Marker({
                        position: results[i].geometry.location,
                        animation: google.maps.Animation.DROP,
                        icon: markerIcon
                    });
                    // If the user clicks a hotel marker, show the details of that hotel
                    // in an info window.
                    markers[i].placeResult = results[i];
                    google.maps.event.addListener(markers[i], 'click', showInfoWindow);
                    setTimeout(dropMarker(i), i * 100);
                    addResult(results[i], i);
                }
            }
        });
    }

    // Search for all accomodation in the selected city, within the viewport of the map.
    function searchAccommodation() {
        var search = {
            bounds: map.getBounds(),
            types: ['lodging']
        };

        places.nearbySearch(search, function(results, status) {
            if (status === google.maps.places.PlacesServiceStatus.OK) {
                clearResults();
                clearMarkers();
                // Create a marker for each hotel found, and
                // assign a letter of the alphabetic to each marker icon.
                for (var i = 0; i < results.length; i++) {
                    var markerLetter = String.fromCharCode('A'.charCodeAt(0) + (i % 26));
                    var markerIcon = MARKER_PATH + markerLetter + '.png';
                    // Use marker animation to drop the icons incrementally on the map.
                    markers[i] = new google.maps.Marker({
                        position: results[i].geometry.location,
                        animation: google.maps.Animation.DROP,
                        icon: markerIcon
                    });
                    // If the user clicks a hotel marker, show the details of that hotel
                    // in an info window.
                    markers[i].placeResult = results[i];
                    google.maps.event.addListener(markers[i], 'click', showInfoWindow);
                    setTimeout(dropMarker(i), i * 100);
                    addResult(results[i], i);
                }
            }
        });
    }

    // Search for all restaurants, bars, pubs, cafes and clubs in the selected city, within the viewport of the map.
    function searchRestaurant() {
        var search = {
            bounds: map.getBounds(),
            types: ['restaurant', 'bar', 'cafe', 'night_club']
        };

        places.nearbySearch(search, function(results, status) {
            if (status === google.maps.places.PlacesServiceStatus.OK) {
                clearResults();
                clearMarkers();
                // Create a marker for each hotel found, and
                // assign a letter of the alphabetic to each marker icon.
                for (var i = 0; i < results.length; i++) {
                    var markerLetter = String.fromCharCode('A'.charCodeAt(0) + (i % 26));
                    var markerIcon = MARKER_PATH + markerLetter + '.png';
                    // Use marker animation to drop the icons incrementally on the map.
                    markers[i] = new google.maps.Marker({
                        position: results[i].geometry.location,
                        animation: google.maps.Animation.DROP,
                        icon: markerIcon
                    });
                    // If the user clicks a hotel marker, show the details of that hotel
                    // in an info window.
                    markers[i].placeResult = results[i];
                    google.maps.event.addListener(markers[i], 'click', showInfoWindow);
                    setTimeout(dropMarker(i), i * 100);
                    addResult(results[i], i);
                }
            }
        });
    }

    // Search for all museums and art galleries in the selected city, within the viewport of the map.
    function searchMuseum() {
        var search = {
            bounds: map.getBounds(),
            types: ['museum', 'art_gallery']
        };

        places.nearbySearch(search, function(results, status) {
            if (status === google.maps.places.PlacesServiceStatus.OK) {
                clearResults();
                clearMarkers();
                // Create a marker for each hotel found, and
                // assign a letter of the alphabetic to each marker icon.
                for (var i = 0; i < results.length; i++) {
                    var markerLetter = String.fromCharCode('A'.charCodeAt(0) + (i % 26));
                    var markerIcon = MARKER_PATH + markerLetter + '.png';
                    // Use marker animation to drop the icons incrementally on the map.
                    markers[i] = new google.maps.Marker({
                        position: results[i].geometry.location,
                        animation: google.maps.Animation.DROP,
                        icon: markerIcon
                    });
                    // If the user clicks a hotel marker, show the details of that hotel
                    // in an info window.
                    markers[i].placeResult = results[i];
                    google.maps.event.addListener(markers[i], 'click', showInfoWindow);
                    setTimeout(dropMarker(i), i * 100);
                    addResult(results[i], i);
                }
            }
        });
    }

    // Search for other attractions in the selected city, within the viewport of the map.
    function searchAttraction() {
        var search = {
            bounds: map.getBounds(),
            types: ['church', 'zoo', 'park', 'mosque', 'hindu_temple']
        };

        places.nearbySearch(search, function(results, status) {
            if (status === google.maps.places.PlacesServiceStatus.OK) {
                clearResults();
                clearMarkers();
                // Create a marker for each hotel found, and
                // assign a letter of the alphabetic to each marker icon.
                for (var i = 0; i < results.length; i++) {
                    var markerLetter = String.fromCharCode('A'.charCodeAt(0) + (i % 26));
                    var markerIcon = MARKER_PATH + markerLetter + '.png';
                    // Use marker animation to drop the icons incrementally on the map.
                    markers[i] = new google.maps.Marker({
                        position: results[i].geometry.location,
                        animation: google.maps.Animation.DROP,
                        icon: markerIcon
                    });
                    // If the user clicks a hotel marker, show the details of that hotel
                    // in an info window.
                    markers[i].placeResult = results[i];
                    google.maps.event.addListener(markers[i], 'click', showInfoWindow);
                    setTimeout(dropMarker(i), i * 100);
                    addResult(results[i], i);
                }
            }
        });
    }

    function clearMarkers() {
        for (var i = 0; i < markers.length; i++) {
            if (markers[i]) {
                markers[i].setMap(null);
            }
        }
        markers = [];
    }

    // Set the country restriction based on user input.
    // Also center and zoom the map on the given country.
    function setAutocompleteCountry() {
        var country = $('#country').val();
        if (country == 'all') {
            autocomplete.setComponentRestrictions({ 'country': [] });
            map.setCenter({ lat: 48.7, lng: 19.7 });
            map.setZoom(3);
        }
        else {
            autocomplete.setComponentRestrictions({ 'country': country });
            map.setCenter(countries[country].center);
            map.setZoom(countries[country].zoom);
        }
        clearResults();
        clearMarkers();
    }

    function dropMarker(i) {
        return function() {
            markers[i].setMap(map);
        };
    }

    //Results below map and search form.

    function addResult(result, i) {
        var results = document.getElementById('results');
        var markerLetter = String.fromCharCode('A'.charCodeAt(0) + (i % 26));
        var markerIcon = MARKER_PATH + markerLetter + '.png';

        var tr = document.createElement('tr');
        tr.style.backgroundColor = (i % 2 === 0 ? '#2e0e54' : '#55238e');
        tr.onclick = function() {
            google.maps.event.trigger(markers[i], 'click');
        };

        var iconTd = document.createElement('td');
        var nameTd = document.createElement('td');
        var icon = document.createElement('img');
        icon.src = markerIcon;
        icon.setAttribute('class', 'placeIcon');
        icon.setAttribute('className', 'placeIcon');
        var name = document.createTextNode(result.name);
        iconTd.appendChild(icon);
        nameTd.appendChild(name);
        tr.appendChild(iconTd);
        tr.appendChild(nameTd);
        results.appendChild(tr);
    }

    function clearResults() {
        var results = document.getElementById('results');
        while (results.childNodes[0]) {
            results.removeChild(results.childNodes[0]);
        }
    }

    // Get the place details for a hotel. Show the information in an info window,
    // anchored on the marker for the hotel that the user selected.

    function showInfoWindow() {
        var marker = this;
        places.getDetails({ placeId: marker.placeResult.place_id },
            function(place, status) {
                if (status !== google.maps.places.PlacesServiceStatus.OK) {
                    return;
                }
                infoWindow.open(map, marker);
                buildIWContent(place);
            });
    }

    // Load the place information into the HTML elements used by the info window.

    function buildIWContent(place) {
        document.getElementById('iw-icon').innerHTML = '<img class="hotelIcon" ' +
            'src="' + place.icon + '"/>';
        document.getElementById('iw-url').innerHTML = '<b><a href="' + place.url +
            '">' + place.name + '</a></b>';
        document.getElementById('iw-address').textContent = place.vicinity;

        if (place.formatted_phone_number) {
            document.getElementById('iw-phone-row').style.display = '';
            document.getElementById('iw-phone').textContent =
                place.formatted_phone_number;
        }
        else {
            document.getElementById('iw-phone-row').style.display = 'none';
        }

        // Assign a five-star rating to the hotel, using a black star ('&#10029;')
        // to indicate the rating the hotel has earned, and a white star ('&#10025;')
        // for the rating points not achieved.
        if (place.rating) {
            var ratingHtml = '';
            for (var i = 0; i < 5; i++) {
                if (place.rating < (i + 0.5)) {
                    ratingHtml += '&#10025;';
                }
                else {
                    ratingHtml += '&#10029;';
                }
                document.getElementById('iw-rating-row').style.display = '';
                document.getElementById('iw-rating').innerHTML = ratingHtml;
            }
        }
        else {
            document.getElementById('iw-rating-row').style.display = 'none';
        }

        // The regexp isolates the first part of the URL (domain plus subdomain)
        // to give a short URL for displaying in the info window.
        if (place.website) {
            var fullUrl = place.website;
            var website = hostnameRegexp.exec(place.website);
            if (website === null) {
                website = 'http://' + place.website + '/';
                fullUrl = website;
            }
            document.getElementById('iw-website-row').style.display = '';
            document.getElementById('iw-website').textContent = website;
        }
        else {
            document.getElementById('iw-website-row').style.display = 'none';
        }
    }

    //Reset function - Resets all previous searching
    function reset() {
        clearResults();
        clearMarkers();
        $('#country')[0].selectedIndex = 0;
        $("#autocomplete").val("");
        map.setCenter(countries["us"].center);
        map.componentRestrictions = { 'country': [] };
        place = "";
    }
    