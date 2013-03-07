PushUpdater-node
================

A node/socket.io-based component to add real-time updating of data from multiple sources to Web-based clients

This JavaScript-based server can connect multiple client apps, on multiple pages/physical clients, to any of various data sources provided on the server.  It relies on the Socket.io library's ability to use bidirectional WebSockets when the browser supports it, and to fall back to other realtime or near-realtime update mechanisms when WebSockets are not available.

This is currently in pre-alpha state.  It is under active development, using TDD with the Mocha TDD framework.

Check it Out!
==
This should work on most Unix/Linux systems, provided node.js and 'make' are installed.

1. Clone this repository
2. Install the Node modules

    npm install

3. Start the app
4. Open the main page
5. You may also be interested in the Mocha-based client-side test kit:

Data Sources
============

_Under Construction_

Client Subscription
===================

A 'client' must be an object wich provides a method called 'update'.  The signature looks like

    myClient.update(data)
    
where `data` is the data received from the server and routed to that client.

A request for a subscription is made by calling the updater method:

    updater(destination, callback, requestMsg)

`destination` is a string identifying a data source that the server is serving up.  For example, if an instance of PushUpdater is serving up a stock ticker under the name "stocks", and tweets under the name "tweets", a client could pass "stocks" to indicate the source the request is intended for.

`callback` is a client object as described above.
 
`requestMsg` is a message which should be understood by the data source indicated in the `destination`.  It will be a hash which should be convertible to JSON via JSON.stringify (thus, no functions, Dates, "class" instances, etc.)

