goog.provide('ol.test.Geolocation');

describe('ol.Geolocation', function() {

  describe('constructor', function() {

    it('can be constructed without arguments', function() {
      var instance = new ol.Geolocation();
      expect(instance).to.be.an(ol.Geolocation);
    });

  });

});

goog.require('ol.Geolocation');
