
var sitings = [];

var icon_highlights;

var default_icon;
var mark_on = [];
var mapsss;
var Z_hubs = {
    lat: 28.7041,
    lng:  77.1025
};



function newInfoW(marker, infoWindow)
{
   if(infoWindow.marker!=marker)
      {
        marker.setAnimation(google.maps.Animation.BOUNCE);
        setTimeout((function(){
          marker.setAnimation(null);
          }).bind(this),1400);

        infoWindow.marker = marker;
        var image = '';
        image += ('<h4  id="heading-marker" >'  +  marker.name + '</h4>');
        image += ('<img id="im-marker" src="'+marker.thumb+'" alt="Image Not Found">');
        image += ('<div>' + marker.locality +', '+ marker.city + '</div>');
        infoWindow.setContent(image);
       
        if (infoWindow)
        {
            infoWindow.close();
        }

        infoWindow.open(mapsss, marker);
    }


            infoWindow.addListener('closeclick', function()
        {
            infoWindow.marker = null;
            marker.setAnimation(null);
        });
}



function google_Maps_Error()
{
    view.googleMapCheck(true);
    //console.log("Error");
    view.googleApiError("Error in loading Google map");
}

function points()
{
    
    var url_z;
    url_z = 'https://developers.zomato.com/api/v2.1/search?lat='+Z_hubs.lat+'&lon='+Z_hubs.lng+'&radius=10000&sort=real_distance';
    highlights_icon = create_Marker_I('DC3545');
    default_icon = create_Marker_I('28A475');

    $.ajax({
        url: url_z,
        headers:{
            'user-key':'b1880287ffc862af5528330f5e749171'},
             dataType: 'json',
        async: true,
    }).done(function(response)
    {
        zomatoRestros = response.restaurants;
        var i=0;
    /*    console.log(zomatoRestros[0].restaurant.location.longitude);
        console.log(zomatoRestros[0].restaurant.location.latitude);
      */
        while(i<zomatoRestros.length)
        {
            var map_long = parseFloat(zomatoRestros[i].restaurant.location.longitude);
            var map_lat = parseFloat(zomatoRestros[i].restaurant.location.latitude);

            var marks = new google.maps.Marker({
                
                name: zomatoRestros[i].restaurant.name,
                city: zomatoRestros[i].restaurant.location.city,
                locality: zomatoRestros[i].restaurant.location.locality,
                thumb: zomatoRestros[i].restaurant.thumb,
                                icon: default_icon,
                animation: google.maps.Animation.DROP,
                mapsss: mapsss,
                position: {
                    lat: map_lat,
                    lng: map_long
                },
                id: i
            });
            mark_on.push(marks);
            sitings.push(
            {
                
                cord: {
                    lng: zomatoRestros[i].restaurant.location.longitude,
                    lat: zomatoRestros[i].restaurant.location.latitude
                },
                marker_id : marks,
                title: marks.name
            });

            marks.addListener('click', openInfo);
            marks.addListener('mouseout', Out_m);
            marks.addListener('mouseover', Over_m);

            i++;
        }
        view.makeList();
        showPlaces();

    }).fail(function(response, status, error)
    {
        view.resErrorCheck(true);
        view.restaurantErrorLabel("Restros not Found");
    });
}



function initMap()
{
    // It creates map with the given attributes
    mapsss = new google.maps.Map(document.getElementById('mapping'),
    {
        center: Z_hubs,
        zoom: 11,
        mapTypeControl: false
    });

    //This initialises the information window
    infoWindow = new google.maps.InfoWindow();

    //It uses the location array to create an markers array on initializion.
    points();
}



function Over_m()
{
    this.setIcon(icon_highlights);
}
//deleted out_m

function Out_m()
{
    this.setIcon(default_icon);
}



function clickWindow(marker)
{
    var i = 0;
    while( mark_on.length>i)
    {
        //console.log(mark_on[i].name);
        if (mark_on[i].name == marker.title) {
            newInfoW(mark_on[i], infoWindow);
          //  mark_on[i].setAnimation(google.maps.Animation.DROP);
            break;
        }
        i++;
    }
}

function openInfo()
{
    newInfoW(this,infoWindow);
}


function showPlaces()
{
    var bound= new google.maps.LatLngBounds();
    var i=0;
    while(i<mark_on.length)
    {
        mark_on[i].setAnimation(google.maps.Animation.DROP);
        mark_on[i].setMap(mapsss);
        bound.extend(mark_on[i].position);
        i++;
    }
    mapsss.fitBounds(bound);
}




function hidePlaces()
{
    var i = 0;
    while(i<mark_on.length)
    {
        mark_on[i].setMap(null);
        i++;
    }
}
/* This function takes accepts a colour, and then creates a marker icon of that color. The icon will
be 20 px width by 34 height, have an origin of 0, 0 and be anchored at 10, 35).*/
function create_Marker_I(marker_Color)
{
    var img_marker = new google.maps.MarkerImage(
        'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|' + marker_Color +
        '|40|_|%E2%80%A2',
        new google.maps.Size(21, 34),
        new google.maps.Point(0, 0),
        new google.maps.Point(10, 34),
        new google.maps.Size(21, 34) );
    return img_marker;

}

//   View Model
var view = {
    newlist: ko.observableArray([]),
    search_item: ko.observable(''),
    originalListCheck: ko.observable(true),
    searchListCheck: ko.observable(false),
    resErrorCheck : ko.observable(false),
    list: ko.observableArray([]),
    googleMapCheck: ko.observable(false),
    googleApiError: ko.observable(''),
    restaurantErrorLabel : ko.observable(''),
    // live search is inspired by https://opensoul.org/2011/06/23/live-search-with-knockoutjs/
    

    resetRestaurantList: function()
    {
        showPlaces();
        view.list.removeAll();
        view.makeList();
    },
        makeList: function()
    {
        sitings.forEach(function(found)
        {
            view.list.push(found);
        });
    },
    search: function(value)
    {
        view.searchListCheck(true);
        view.originalListCheck(false);
        view.newlist.removeAll();
        if (value === '')
        {
            view.originalListCheck(true);
            view.searchListCheck(false);
            sitings.forEach(function(location)
            {
                location.marker_id.setVisible(true);
            });
            return;
        }
        var found;
        for (found in sitings)
        {
            if (sitings[found].title.toLowerCase().indexOf(value.toLowerCase())>=0)
            {
                view.newlist.push(sitings[found]);
                sitings[found].marker_id.setVisible(true);
            }
            else
            {
                sitings[found].marker_id.setVisible(false);
            }
        }
    }
};

view.search_item.subscribe(view.search);
ko.applyBindings(view);
