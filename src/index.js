var $ = require('jquery');

var serviceUrl = "http://wwwdev.ebi.ac.uk/uniprot/services/disease/";

var loadData = function(identifier, target) {
    $.when($.ajax({
        url: serviceUrl + identifier + '.json',
        dataType: 'jsonp'
    })).done(function(resp) {
        draw(resp, target);
    });
}

var draw = function(data, target) {
    target.className = "report-section";
    $(data.diseases).each(function(index, item) {
        var div = "<div class=\"disease-container\"><h2>" + item.shortDescription + "</h2><p>" + item.description + "</p>" + "<a href=\"http://omim.org/entry/" + item.crossRef + "\">" + item.source + ":" + item.crossRef + "</a>" + "</div>";
        $(target).append(div);
    });
}

module.exports = loadData;