/**
 * App ErrorHandler module
 */
App.ErrorHandler = (function() {

    // Private
    var errors = {
        // Client - 4xx:
        // This class of HTTP status message indicates there is a problem or error at the client or user agent end.
        // @url http://webdesign.about.com/cs/http/p/http4xx.htm
        400 : {
            code : 400,
            status : 'Bad Request',
            message : 'The request could not be understood by the server due to malformed syntax.'
        },

        401 : {
            code : 401,
            status : 'Unauthorized:',
            message : 'The request requires user authorization (such as through htaccess) but the authorization codes sent were invalid or the user was not recognized in the system. This error is sent when the username sent is not recognized and when the username and password combination are incorrect.'
        },

        402 : {
            code : 402,
            status : 'Payment Required',
            message : 'This HTTP status code is not used, but is reserved for future use.'
        },

        403 : {
            code : 403,
            status : 'Forbidden',
            message : 'The server understood the request, but refuses to fulfill it. Authorization, in this case, doesn\'t matter.'
        },

        404 : {
            code : 404,
            status : 'Not Found',
            message : 'This is the most easily recognized error message. It states that the URI requested does not exist on the server.'
        },

        405 : {
            code : 405,
            status : 'Method Not Allowed',
            message : 'The method specified is not allowed for the resource requested.'
        },

        406 : {
            code : 406,
            status : 'Not Acceptable',
            message : 'The resource identified by the request is only capable of generating response entities which have content characteristics not acceptable according to the accept headers sent in the request.'
        },

        407 : {
            code : 407,
            status : 'Proxy Authentication Required',
            message : 'This is similar to 401, but the client must first authenticate with a proxy.'
        },

        408 : {
            code : 408,
            status : 'Request Timeout',
            message : 'he client did not produce a request within the time that the server was prepared to wait.'
        },

        409 : {
            code : 409,
            status : 'Conflict',
            message : 'The request could not be completed due to a conflict with the current state of the resource.'
        },

        410 : {
            code : 410,
            status : 'Gone',
            message : 'The resource requested was once on this server but is no longer here and there is no redirect in place for it.'
        },

        411 : {
            code : 411,
            status : 'Length Required',
            message : 'The server requires a content-length sent with the request.'
        },

        412 : {
            code : 412,
            status : 'Precondition Failed',
            message : 'The server evaluated a pre-condition in the header fields as false.'
        },

        413 : {
            code : 413,
            status : 'Request Entity Too Large',
            message : 'The server has a limit as to the size of a request.'
        },

        414 : {
            code : 414,
            status : 'Request-URI Too Long',
            message : 'The server has a limit as to the size of a URI.'
        },

        415 : {
            code : 415,
            status : 'Unsupported Media Type',
            message : 'The entity of the request is a format not supported by the requested resource.'
        },

        416 : {
            code : 416,
            status : 'Requested Range Not Satisfiable',
            message : 'A server should return a response with this status code if a request included a Range request-header field, and none of the range-specifier values in this field overlap the current extent of the selected resource, and the request did not include an If-Range request-header field.'
        },

        // Server - 5xx:
        // These error messages are sent when the server is aware that it has had a problem or error.
        // @url http://webdesign.about.com/cs/http/p/http5xx.htm
        500 : {
            code : 500,
            status : 'Internal Server Error',
            message : 'The server encountered something unexpected that didn\'t allow it to complete the request. This is often seen with CGI scripts that have problems.'
        },
        501 : {
            code : 501,
            status : 'Not Implemented',
            message : 'The server doesn\'t support the functions required for fullfilling that request. This might occur if a server side include were called on a server that doesn\'t support that function.'
        },
        502 : {
            code : 502,
            status : 'Bad Gateway',
            message : 'The server, while acting as a gateway or proxy, received a bad request from an upstream server.'
        },
        503 : {
            code : 503,
            status : 'Service Unavailable',
            message : 'The server is unable to handle the request due to maintenance or a temporary overload of the server.'
        },
        504 : {
            code : 504,
            status : 'Gateway Timeout',
            message : 'The server, while acting as a gateway or proxy, did not receive a timely response from an upstream server.'
        },
        505 : {
            code : 505,
            status : 'HTTP Version Not Supported',
            message : 'The server does not support the HTTP version that was used to make the request.'
        }
    };

    function ErrorHandler() {
    }

    // ErrorHandler prototype object
    var object = {
        handle : function(error) {
            if(is_int(error)) {
                error = {
                    code : error
                };
            }
            return errors[error.code];
        }
    };

    // Create new ErrorHandler
    return new Construct(ErrorHandler, object);

})();
