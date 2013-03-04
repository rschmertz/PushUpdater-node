/********************************************************************

  Copyright 2013 by Robert Schmertz <rschmertz at yahoo dot com>

  This file is part of PushUpdater-node.

  PushUpdater-node is free software: you can redistribute it and/or
  modify it under the terms of the GNU General Public License
  as published by the Free Software Foundation, either version 3 of
  the License, or (at your option) any later version.

  This program is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  GNU General Public License for more details.

  You should have received a copy of the GNU General Public License
  along with this program.  If not, see <http://www.gnu.org/licenses/>.

*********************************************************************/

var io = require('socket.io-client');
var mocha = require('mocha');
var chai = require('chai');


var should = chai.should();

describe('DataProvider test', function () {
    var pointsSocket = null;
    var eventsSocket = null;
    describe('Connection test', function () {
        it('should accept an initial connection', function () {
            pointsSocket = io.connect('http://localhost:6668');
            pointsSocket.emit('data-provider', 'points');
        });
        it('should accept an second connection with a different provider', function () {
            eventsSocket = io.connect('http://localhost:6668');
            eventsSocket.emit('data-provider', 'events');
        });
        it("shouldn't accept a connection with an existing provider name", function (done) {
            var pointsSocket2 = null;
            var emitResponse = null;
            pointsSocket2 = io.connect('http://localhost:6668');
            pointsSocket2.emit('data-provider', 'points', function (data) {
                emitResponse = data;
            });
            setTimeout(function () {
                should.exist(emitResponse);
                emitResponse.should.have.property('error');
                done();
            }, 500);                
        });
    });
});
