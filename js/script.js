function loadData() {
    
    var $body = $('body');
    var $wikiElem = $('#wikipedia-links');
    var $nytHeaderElem = $('#nytimes-header');
    var $nytElem = $('#nytimes-articles');
    var $greeting = $('#greeting');

    // clear out old data before new request
    $wikiElem.text("");
    $nytElem.text("");

    var street = $('#street').val();
    var city = $('#city').val();
    var address = street + ', ' + city;

    $greeting.text('So, you want to live at ' + address + '?');

    /* 
    -------------------------------------
    Google Maps AJAX request and append:
    -------------------------------------
    */
    
    // template for appending to page
    var imageHTML = "<img class='bgimg' src='https://maps.googleapis.com/maps/api/streetview?size=600x400&location=%data%'>";
    
    // fill in the template with requested image
    var formattedImage = imageHTML.replace('%data%', address);
   
    $body.append(formattedImage);

    /* 
    ----------------------------------
    NYTimes AJAX request and append:
    ----------------------------------
    */

    var apiKey = 'a6d5a5ed8655ecf18f6a753c1bdd1de5:18:71015080'

    // API endpoint:
    var requestURL = 'https://api.nytimes.com/svc/search/v2/articlesearch.json?q=%data%&api-key=%key%';
    var formattedRequest = requestURL.replace('%data%', city).replace('%key%', apiKey);

    // template for appending to page
    var articleHTML = '<li class="article"> <a href="%link%">%title%</a><p>%contents%</p></li>';

    // asychronous JSON request: response is passed to the anonymous function
    $.getJSON(formattedRequest, function (data) {
        
        $nytHeaderElem.text('New York Times Articles About ' + city);

        // iterate through the json response
        for (article in data.response.docs) {
            var formattedArticle = articleHTML.replace('%link%', data.response.docs[article].web_url)
            .replace('%title%', data.response.docs[article].headline.main)
            .replace('%contents%', data.response.docs[article].snippet);
            $('.article-list').append(formattedArticle);
        }
    }).error(function(e) { 
        $nytHeaderElem.text('New York Times Articles Could Not Be Loaded'); // error handler
    });

    
    /* 
    -----------------------------------
    Wikipedia AJAX request and append:
    -----------------------------------
    */

    // template for appending to page
    var wikiHTML = "<li><a href='%wikilink%'>%wikititle%</a></li>";
    
    var successFunction = function(data) {
        var numLinks = data[1].length;
        // iterate through the jsonp response
        for (var i = 0; i < numLinks; i++) {
            $wikiElem.append((wikiHTML).replace('%wikilink%', data[3][i]).replace('%wikititle%', data[1][i]));
        };
        // error handler
        clearTimeout(wikiRequestTimeout);
    }

    // API endpoint:
    var queryURL = "https://en.wikipedia.org/w/api.php?format=json&action=opensearch&callback=wikiCallBack&search=%city%".replace('%city%', city);
    var settings = {
        url: queryURL,
        dataType:'jsonp',
        success: successFunction
    };
    
    // error handler:
    var wikiRequestTimeout = setTimeout(function() {
        $wikiElem.text("failed to get wikipedia resources");
    }, 8000);

    // runs our asychronous jsonp request
    $.ajax(settings);
    
    return false;
    
};

/*
When the user submits the form, the above function is 
automatically invoked, using the submitted data:
*/
$('#form-container').submit(loadData);

