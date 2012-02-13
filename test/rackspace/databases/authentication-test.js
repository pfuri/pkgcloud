
/*
 * authentication-test.js: Tests for pkgcloud Rackspace compute authentication
 *
 * (C) 2010 Nodejitsu Inc.
 *
 */

var vows = require('vows'),
    assert = require('../../helpers/assert'),
    macros = require('../macros'),
    helpers = require('../../helpers');

var testData = {},
    client = helpers.createClient('rackspace', 'database');

function shouldAuthNew (client) {
  return {
    topic: function () {
      client.auth(this.callback);
    },
    "should respond with 200 and appropriate info": function (err, res) {
      assert.equal(res.statusCode, 200);
      assert.isObject(res.headers);
      assert.isObject(res.body);
    },
    "should respond with a token": function (err, res) {
      assert.isObject(res.body.auth);
      assert.isObject(res.body.auth.token);
      assert.isString(res.body.auth.token.id);
    },
    "should update the config with appropriate urls": function (err, res) {
      var config = client.config;
      assert.equal(res.headers['x-server-management-url'], config.serverUrl);
      assert.equal(res.headers['x-storage-url'], config.storageUrl);
      assert.equal(res.headers['x-cdn-management-url'], config.cdnUrl);
      assert.equal(res.headers['x-auth-token'], config.authToken);
      assert.isString(config.accountNumber);
    }
  };
}

function shouldNotAuthNew (service) {
  return {
    topic: function () {
      var badClient = helpers.createClient('rackspace', service, {
        "auth": {
          "username": "fake",
          "apiKey": "data"
        }
      });

      badClient.auth(this.callback);
    },
    "should respond with Error code 401": function (err, res) {
      assert.isObject(err);
      assert.isObject(err.unauthorized);
      assert.equal(err.unauthorized.code, 401);
    }
  }
};


vows.describe('pkgcloud/rackspace/database/authentication').addBatch({
  "The pkgcloud Rackspace database client": {
    "should have core methods defined": macros.shouldHaveCreds(client),
    "the getVersion() method": {
      topic: function () {
        client.getVersion(this.callback);
      },
      "should return the proper version": function (versions) {
        assert.isArray(versions);
        assert.isFalse(versions.length == 0);
      }
    },
    "the auth() method": {
      "with a valid username and api key": shouldAuthNew(client),
      "with an invalid username and api key": shouldNotAuthNew('database')
    }
  }
}).export(module);
