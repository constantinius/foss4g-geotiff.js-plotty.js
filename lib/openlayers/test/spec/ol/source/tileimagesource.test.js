goog.provide('ol.test.source.TileImageSource');

describe('ol.source.TileImage', function() {
  function createSource(opt_proj, opt_tileGrid) {
    var proj = opt_proj || 'EPSG:3857';
    return new ol.source.TileImage({
      projection: proj,
      tileGrid: opt_tileGrid ||
          ol.tilegrid.createForProjection(proj, undefined, [2, 2]),
      tileUrlFunction: ol.TileUrlFunction.createFromTemplate(
          'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACwAAAAAAQABAAACAkQBADs=')
    });
  }

  describe('#setTileGridForProjection', function() {
    it('uses the tilegrid for given projection', function() {
      var source = createSource();
      var tileGrid = ol.tilegrid.createForProjection('EPSG:4326', 3, [10, 20]);
      source.setTileGridForProjection('EPSG:4326', tileGrid);
      var retrieved = source.getTileGridForProjection(ol.proj.get('EPSG:4326'));
      expect(retrieved).to.be(tileGrid);
    });
  });

  describe('#getTileInternal', function() {
    var source, tile;

    beforeEach(function() {
      source = createSource();
      expect(source.getKey()).to.be('');
      source.getTileInternal(0, 0, -1, 1, ol.proj.get('EPSG:3857'));
      expect(source.tileCache.getCount()).to.be(1);
      tile = source.tileCache.get(source.getKeyZXY(0, 0, -1));
    });

    it('gets the tile from the cache', function() {
      var returnedTile = source.getTileInternal(
          0, 0, -1, 1, ol.proj.get('EPSG:3857'));
      expect(returnedTile).to.be(tile);
    });

    describe('change a dynamic param', function() {

      describe('tile is not loaded', function() {
        it('returns a tile with no interim tile', function() {
          source.getKey = function() {
            return 'key0';
          };
          var returnedTile = source.getTileInternal(
              0, 0, -1, 1, ol.proj.get('EPSG:3857'));
          expect(returnedTile).not.to.be(tile);
          expect(returnedTile.key).to.be('key0');
          expect(returnedTile.interimTile).to.be(null);
        });
      });

      describe('tile is loaded', function() {
        it('returns a tile with interim tile', function() {
          source.getKey = function() {
            return 'key0';
          };
          tile.state = ol.TileState.LOADED;
          var returnedTile = source.getTileInternal(
              0, 0, -1, 1, ol.proj.get('EPSG:3857'));
          expect(returnedTile).not.to.be(tile);
          expect(returnedTile.key).to.be('key0');
          expect(returnedTile.interimTile).to.be(tile);
        });
      });

      describe('tile is not loaded but interim tile is', function() {
        it('returns a tile with interim tile', function() {
          var dynamicParamsKey, returnedTile;
          source.getKey = function() {
            return dynamicParamsKey;
          };
          dynamicParamsKey = 'key0';
          tile.state = ol.TileState.LOADED;
          returnedTile = source.getTileInternal(
              0, 0, -1, 1, ol.proj.get('EPSG:3857'));
          dynamicParamsKey = 'key1';
          returnedTile = source.getTileInternal(
              0, 0, -1, 1, ol.proj.get('EPSG:3857'));
          expect(returnedTile).not.to.be(tile);
          expect(returnedTile.key).to.be('key1');
          expect(returnedTile.interimTile).to.be(tile);
        });
      });

    });

  });

  describe('#getTile', function() {
    it('does not do reprojection for identity', function() {
      var source3857 = createSource('EPSG:3857');
      var tile3857 = source3857.getTile(0, 0, -1, 1, ol.proj.get('EPSG:3857'));
      expect(tile3857).to.be.a(ol.ImageTile);
      expect(tile3857).not.to.be.a(ol.reproj.Tile);

      var projXXX = new ol.proj.Projection({
        code: 'XXX',
        units: 'degrees'
      });
      var sourceXXX = createSource(projXXX);
      var tileXXX = sourceXXX.getTile(0, 0, -1, 1, projXXX);
      expect(tileXXX).to.be.a(ol.ImageTile);
      expect(tileXXX).not.to.be.a(ol.reproj.Tile);
    });

    beforeEach(function() {
      proj4.defs('4326_noextentnounits', '+proj=longlat +datum=WGS84 +no_defs');
    });

    afterEach(function() {
      delete proj4.defs['4326_noextentnounits'];
    });

    it('can handle source projection without extent and units', function(done) {
      var source = createSource('4326_noextentnounits', ol.tilegrid.createXYZ({
        extent: [-180, -90, 180, 90],
        tileSize: [2, 2]
      }));
      var tile = source.getTile(0, 0, -1, 1, ol.proj.get('EPSG:3857'));
      expect(tile).to.be.a(ol.reproj.Tile);

      ol.events.listen(tile, 'change', function() {
        if (tile.getState() == ol.TileState.LOADED) {
          done();
        }
      });
      tile.load();
    });

    it('can handle target projection without extent and units', function(done) {
      var proj = ol.proj.get('4326_noextentnounits');
      var source = createSource();
      source.setTileGridForProjection(proj,
          ol.tilegrid.createXYZ({
            extent: [-180, -90, 180, 90],
            tileSize: [2, 2]
          }));
      var tile = source.getTile(0, 0, -1, 1, proj);
      expect(tile).to.be.a(ol.reproj.Tile);

      ol.events.listen(tile, 'change', function() {
        if (tile.getState() == ol.TileState.LOADED) {
          done();
        }
      });
      tile.load();
    });
  });
});

goog.require('ol.ImageTile');
goog.require('ol.Tile');
goog.require('ol.TileState');
goog.require('ol.TileUrlFunction');
goog.require('ol.events');
goog.require('ol.proj');
goog.require('ol.proj.Projection');
goog.require('ol.reproj.Tile');
goog.require('ol.source.TileImage');
