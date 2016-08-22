goog.provide('ol.test.style.Icon');
goog.provide('ol.test.style.IconImageCache');

goog.require('ol.style.Icon');
goog.require('ol.style.IconAnchorUnits');
goog.require('ol.style.IconOrigin');


describe('ol.style.Icon', function() {
  var size = [36, 48];
  var src = 'data:image/gif;base64,' +
      'R0lGODlhAQABAIAAAP///wAAACwAAAAAAQABAAACAkQBADs=';

  describe('constructor', function() {

    it('caches canvas images with a uid as src', function() {
      var canvas = document.createElement('canvas');
      new ol.style.Icon({
        img: canvas,
        imgSize: size
      });
      expect(ol.style.IconImage_.get(
          canvas, goog.getUid(canvas), size, '').getImage()).to.eql(canvas);
    });

    it('imgSize overrides img.width and img.height', function(done) {
      var style = new ol.style.Icon({
        src: src,
        imgSize: size
      });
      var iconImage = style.iconImage_;
      iconImage.addEventListener('change', function() {
        expect([iconImage.image_.width, iconImage.image_.height]).to.eql(size);
        done();
      });
      style.load();
    });

  });

  describe('#getAnchor', function() {
    var fractionAnchor = [0.25, 0.25];

    it('uses fractional units by default', function() {
      var iconStyle = new ol.style.Icon({
        src: 'test.png',
        size: size,
        anchor: fractionAnchor
      });
      expect(iconStyle.getAnchor()).to.eql([9, 12]);
    });

    it('uses pixels units', function() {
      var iconStyle = new ol.style.Icon({
        src: 'test.png',
        size: size,
        anchor: [2, 18],
        anchorXUnits: ol.style.IconAnchorUnits.PIXELS,
        anchorYUnits: ol.style.IconAnchorUnits.PIXELS
      });
      expect(iconStyle.getAnchor()).to.eql([2, 18]);
    });

    it('uses a bottom left anchor origin', function() {
      var iconStyle = new ol.style.Icon({
        src: 'test.png',
        size: size,
        anchor: fractionAnchor,
        anchorOrigin: ol.style.IconOrigin.BOTTOM_LEFT
      });
      expect(iconStyle.getAnchor()).to.eql([9, 36]);
    });

    it('uses a bottom right anchor origin', function() {
      var iconStyle = new ol.style.Icon({
        src: 'test.png',
        size: size,
        anchor: fractionAnchor,
        anchorOrigin: ol.style.IconOrigin.BOTTOM_RIGHT
      });
      expect(iconStyle.getAnchor()).to.eql([27, 36]);
    });

    it('uses a top right anchor origin', function() {
      var iconStyle = new ol.style.Icon({
        src: 'test.png',
        size: size,
        anchor: fractionAnchor,
        anchorOrigin: ol.style.IconOrigin.TOP_RIGHT
      });
      expect(iconStyle.getAnchor()).to.eql([27, 12]);
    });
  });

  describe('#getOrigin', function() {
    var offset = [16, 20];
    var imageSize = [144, 192];

    it('uses a top left offset origin (default)', function() {
      var iconStyle = new ol.style.Icon({
        src: 'test.png',
        size: size,
        offset: offset
      });
      expect(iconStyle.getOrigin()).to.eql([16, 20]);
    });

    it('uses a bottom left offset origin', function() {
      var iconStyle = new ol.style.Icon({
        src: 'test.png',
        size: size,
        offset: offset,
        offsetOrigin: ol.style.IconOrigin.BOTTOM_LEFT
      });
      iconStyle.iconImage_.size_ = imageSize;
      expect(iconStyle.getOrigin()).to.eql([16, 124]);
    });

    it('uses a bottom right offset origin', function() {
      var iconStyle = new ol.style.Icon({
        src: 'test.png',
        size: size,
        offset: offset,
        offsetOrigin: ol.style.IconOrigin.BOTTOM_RIGHT
      });
      iconStyle.iconImage_.size_ = imageSize;
      expect(iconStyle.getOrigin()).to.eql([92, 124]);
    });

    it('uses a top right offset origin', function() {
      var iconStyle = new ol.style.Icon({
        src: 'test.png',
        size: size,
        offset: offset,
        offsetOrigin: ol.style.IconOrigin.TOP_RIGHT
      });
      iconStyle.iconImage_.size_ = imageSize;
      expect(iconStyle.getOrigin()).to.eql([92, 20]);
    });
  });

  describe('#getImageSize', function() {
    var imgSize = [144, 192];

    it('takes the real image size', function() {
      // pretend that the image is already in the cache,
      // this image will be used for the icon.
      var cache = ol.style.IconImageCache.getInstance();
      var src = 'test.png';
      var iconImage = new ol.style.IconImage_(null, 'test.png', imgSize);
      cache.set(src, null, null, iconImage);

      var iconStyle = new ol.style.Icon({
        src: 'test.png'
      });
      expect(iconStyle.getImageSize()).to.eql(imgSize);
    });

    it('uses the given image size', function() {
      var iconStyle = new ol.style.Icon({
        img: {src: 'test.png'},
        imgSize: imgSize
      });
      expect(iconStyle.getImageSize()).to.eql(imgSize);
    });
  });
});

describe('ol.style.IconImageCache', function() {
  var originalMaxCacheSize;

  beforeEach(function() {
    var cache = ol.style.IconImageCache.getInstance();
    cache.clear();
    originalMaxCacheSize = cache.maxCacheSize;
    cache.maxCacheSize_ = 4;
  });

  afterEach(function() {
    var cache = ol.style.IconImageCache.getInstance();
    cache.maxCacheSize_ = originalMaxCacheSize;
    cache.clear();
  });

  describe('#expire', function() {
    it('expires images when expected', function() {
      var cache = ol.style.IconImageCache.getInstance();

      var i, src, iconImage, key;

      for (i = 0; i < 4; ++i) {
        src = i + '';
        iconImage = new ol.style.IconImage_(src, null);
        cache.set(src, null, null, iconImage);
      }

      expect(cache.cacheSize_).to.eql(4);

      cache.expire();
      expect(cache.cacheSize_).to.eql(4);

      src = '4';
      iconImage = new ol.style.IconImage_(src, null);
      cache.set(src, null, null, iconImage);
      expect(cache.cacheSize_).to.eql(5);

      cache.expire(); // remove '0' and '4'
      expect(cache.cacheSize_).to.eql(3);

      src = '0';
      iconImage = new ol.style.IconImage_(src, null);
      ol.events.listen(iconImage, ol.events.EventType.CHANGE,
          ol.nullFunction, false);
      cache.set(src, null, null, iconImage);
      expect(cache.cacheSize_).to.eql(4);

      src = '4';
      iconImage = new ol.style.IconImage_(src, null);
      ol.events.listen(iconImage, ol.events.EventType.CHANGE,
          ol.nullFunction, false);
      cache.set(src, null, null, iconImage);
      expect(cache.cacheSize_).to.eql(5);

      // check that '0' and '4' are not removed from the cache
      cache.expire();
      key = ol.style.IconImageCache.getKey('0', null, null);
      expect(key in cache.cache_).to.be.ok();
      key = ol.style.IconImageCache.getKey('4', null, null);
      expect(key in cache.cache_).to.be.ok();

    });
  });
});

goog.require('ol.events');
goog.require('ol.events.EventType');
goog.require('ol.style.IconImageCache');
