

exports.currentUrl = function(req) {

    return req.protocol + '://' + req.get('host') + req.originalUrl;
};