# jt400 [![Dependency Status](https://david-dm.org/patriksimek/jt400-memcached.png)](https://david-dm.org/patriksimek/jt400-memcached) [![NPM version](https://badge.fury.io/js/jt400-memcached.png)](http://badge.fury.io/js/jt400-memcached)

[![NPM](https://nodei.co/npm/jt400-memcached.png)](https://nodei.co/npm/jt400/)

Connect with [jt400](https://npmjs.org/package/jt400) and implement [memcached](https://npmjs.org/package/memcached) in your projects.

Download [jt400.jar](http://sourceforge.net/projects/jt400-memcached/) and copy in your path.

More info: [http://jt400.sourceforge.net/](http://jt400.sourceforge.net/)


# Install
    npm install jt400-memcached

# app.js
    var sql = require('jt400-memcached');
    
    var connection = {
        libpath: __dirname + '/jt400.jar',
        drivername: 'com.ibm.as400.access.AS400JDBCDriver',
        url: 'jdbc:as400://127.0.0.1/myDatabase;user=myUser;password=myPassword'
    };
    
    sql.setMemcachedServers( '127.0.0.1:11211' );
    sql.debug( true );
    
    
    
    var test = new sql.prepare({
        query: 'SELECT foo FROM bar',
        connection: connection,
        cache: true,
        lifetime: 100
    });
    
    
    test.execute();
    
    test.success = function(data){
        console.log(data);
    };
    
    test.error = function(error){
        console.log(error);
    };

# Run
    node app.js