var httpServer;
var PORT = 9999;
var subData = '';
var http = require('http');
//var iconv = require('iconv-lite');

var server = http.createServer(function(req, res) {
    if (req.headers.origin) {
        res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
    }
    res.writeHead(200, {'Content-Type': 'text/vtt'});
    res.end(subData);
});

function startListening(cb) {
    httpServer = server.listen(PORT);
}

function stopServer(cb) {
    httpServer.close(function() {
        if (cb) {
            cb();
        }
    });
}

var SubtitlesServer = {
    start: function (data, cb) {
        //iconv.extendNodeEncodings();
        var vtt = data.vtt;
        try {
            fs.readFile(vtt, {}, function (err, data) {
                subData = data;
                if (httpServer) {
                    stopServer(startListening(cb));
                } else {
                    startListening(cb);
                }
            });
        } catch (e) {
            console.log('Error Reading vtt');
        }
    },

    stop: function() {
        stopServer();
    }
};

module.exports = SubtitlesServer;
