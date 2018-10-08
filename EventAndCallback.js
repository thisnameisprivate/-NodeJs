// NODE Create WebServer, addEventListner.
var http = require('http');
var querystring = require('quirestring');
// 侦听服务器的request事件
http.createServer(function (req, res) {
    var postData = '';
    req.setEncoding('utf8');
    // 侦听请求的data事件
    req.on('data', function (chunk) {
        postData += chunk;
    });
    // 侦听请求的end事件
    req.on('end', function () {
        res.end(psotData);
    })
}).listen(8080); // 监听8080端口号
// client ajax request
$.ajax({
    'url': '/url',
    'method': 'post',
    'data': {},
    'success': function (data) {
        // success someSevent.
    }
})