/**
 * Created with IntelliJ IDEA.
 * User: paulomcnally
 * Date: 11/19/13
 * Time: 9:41 PM
 * To change this template use File | Settings | File Templates.
 */

var crypto          =   require('crypto');
var jt              =   require('jt400');
var Memcached       =   require('memcached');
var memcached       =   null;
var memcachedServer =   null;
var debug           =   false;

/**
 * @param string value
 * @description Create a md5 string based on param value
 */
function getHash( value ){
    return crypto.createHash('md5').update(value + 'jt400').digest("hex");
}

/**
 * @param string tag
 * @param string msg
 * @description Call console.log reformated to show debug messages
 */
function debugMsg(tag, msg) {
    if(debug) {
        console.log(tag + ': ' + msg + '\n');
    }
}

/**
 * @param boolean boolean
 * @description Set a debug var true or false
 */
exports.debug = function( boolean ){
    debug = boolean;
}


/**
 * @param value
 * @description Set server or servers memcached and set a memcached variable to new Memcached class
 */
exports.setMemcachedServers = function( value ){
    memcachedServer = value;
    var options = {
        retries: 1,
        poolSize: 100

    };
    memcached = new Memcached( value, options );

}


/**
 * @param object settings
 * settings.cache boolean
 * settings.type string sp or query
 * settings.lifetime int
 * settings.inputs array objects
 * @description Simple query to Microsoft SQL Server with or without memcached
 */


exports.prepare = function(settings){
    var _this = this;

    /**
     * Initialize cache
     * boolean
     */
    if(typeof settings.cache === 'undefined'){
        settings.cache = false;
    }

    /**
     * Initialize lifetime
     */
    if(typeof settings.lifetime !== 'number'){
        settings.lifetime = 86400; //one day
    }

    /**
     * Create a success function
     */
    _this.success = function(cb) {
        if (typeof cb === 'function') {
            cb.call(this.data);
        } else {
            this.data = cb;
        }
    }

    /**
     * Create a error function
     */
    _this.error = function(cb) {
        if (typeof cb === 'function') {
            cb.call(this.errorMsg);
        } else {
            this.errorMsg = cb;
        }
    }

    /**
     * Create a request
     */
    _this.SQLRequest = function(cache) {


        var stringToHash = settings.query;
        // create a hash and set value on key var
        var key = getHash( stringToHash );

        debugMsg('Memcached Key', key );

        if(cache) {

            memcached.connect( memcachedServer, function( memcachedConnectError, connectionMemcached ){
                if( memcachedConnectError ){

                    debugMsg( 'Memcached Connect Error', memcachedConnectError );

                    _this.errorMsg = memcachedConnectError;

                    _this.error(_this.errorMsg);

                }
                else{
                    debugMsg( 'Memcached Server: ', connectionMemcached.serverAddress );

                    memcached.get(key, function(memcachedGetError, memcachedData) {
                        if(memcachedGetError){

                            debugMsg( 'Memcached Get Error: ', memcachedGetError );

                            _this.errorMsg = memcachedGetError;

                            _this.error(_this.errorMsg);

                        } else {

                            if (memcachedData) {

                                debugMsg( 'Result from', 'Memcached' );

                                _this.data = memcachedData;

                                _this.success(_this.data);

                            } else {

                                debugMsg( 'Result from', 'SQL Server');

                                _this.SQLRequest(false);

                            }
                        }
                    });

                }
            });


        } else {

            jt.initialize( settings.connection );

            jt.execute( settings.query );

            jt.on('execute', function(error, results){
                if( error ){
                    _this.errorMsg = error;
                    _this.error(_this.errorMsg);
                    debugMsg( 'Execute Error', error );
                }
                else{
                    _this.data = results;
                    _this.success(_this.data);


                    if (settings.cache) {
                        memcached.set(key, results, settings.lifetime, function ( memcachedSetError ) {
                            if( memcachedSetError ){

                                _this.errorMsge = memcachedSetError;
                                _this.error(_this.errorMsg);
                                debugMsg( 'Memcached Set Error', memcachedSetError );

                            } else{
                                debugMsg( 'Memcached Set Key', key );
                            }
                        });
                    }


                }
            });

        }
    }

    /**
     * Call the request
     */
    _this.execute = function(){

        debugMsg( 'Execute', 'Called' );

        _this.SQLRequest(settings.cache);

    }

};

/**
 * Memcached delete key
 */
exports.removeKey = function( value ){
    memcached.del( value, function( removeError ){
        if( removeError ){
            debugMsg( 'Sql connectionSqlError: ' + connectionSqlError );
        }

    });
}