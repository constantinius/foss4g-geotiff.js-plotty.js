goog.provide('ol.test.MapBrowserEventHandler');

describe('ol.MapBrowserEventHandler', function() {
  describe('#emulateClick_', function() {
    var clock;
    var handler;
    var clickSpy;
    var singleclickSpy;
    var dblclickSpy;
    var target;

    beforeEach(function() {
      clock = sinon.useFakeTimers();
      target = document.createElement('DIV');
      handler = new ol.MapBrowserEventHandler(new ol.Map({
        target: target
      }));

      clickSpy = sinon.spy();
      ol.events.listen(handler, 'click', clickSpy);

      singleclickSpy = sinon.spy();
      ol.events.listen(handler, 'singleclick', singleclickSpy);

      dblclickSpy = sinon.spy();
      ol.events.listen(handler, 'dblclick', dblclickSpy);

    });

    afterEach(function() {
      clock.restore();
    });

    it('emulates click', function() {
      handler.emulateClick_(new ol.pointer.PointerEvent('pointerdown', {
        type: 'mousedown',
        target: target,
        clientX: 0,
        clientY: 0
      }));
      expect(clickSpy.called).to.be.ok();
    });

    it('emulates singleclick', function() {
      handler.emulateClick_(new ol.pointer.PointerEvent('pointerdown', {
        type: 'mousedown',
        target: target,
        clientX: 0,
        clientY: 0
      }));
      expect(singleclickSpy.called).to.not.be.ok();
      expect(dblclickSpy.called).to.not.be.ok();

      clock.tick(250);
      expect(singleclickSpy.calledOnce).to.be.ok();
      expect(dblclickSpy.called).to.not.be.ok();

      handler.emulateClick_(new ol.pointer.PointerEvent('pointerdown', {
        type: 'mousedown',
        target: target,
        clientX: 0,
        clientY: 0
      }));
      expect(singleclickSpy.calledOnce).to.be.ok();
      expect(dblclickSpy.called).to.not.be.ok();
    });

    it('emulates dblclick', function() {
      handler.emulateClick_(new ol.pointer.PointerEvent('pointerdown', {
        type: 'mousedown',
        target: target,
        clientX: 0,
        clientY: 0
      }));
      expect(singleclickSpy.called).to.not.be.ok();
      expect(dblclickSpy.called).to.not.be.ok();

      handler.emulateClick_(new ol.pointer.PointerEvent('pointerdown', {
        type: 'mousedown',
        target: target,
        clientX: 0,
        clientY: 0
      }));
      expect(singleclickSpy.called).to.not.be.ok();
      expect(dblclickSpy.calledOnce).to.be.ok();

      clock.tick(250);
      expect(singleclickSpy.called).to.not.be.ok();
      expect(dblclickSpy.calledOnce).to.be.ok();
    });

  });

  describe('#down_', function() {

    var handler;
    beforeEach(function() {
      handler = new ol.MapBrowserEventHandler(new ol.Map({}));
    });

    it('is null if no "down" type event has been handled', function() {
      expect(handler.down_).to.be(null);
    });

    it('is an event after handlePointerDown_ has been called', function() {
      var event = new ol.pointer.PointerEvent('pointerdown', {});
      handler.handlePointerDown_(event);
      expect(handler.down_).to.be(event);
    });

  });
});

goog.require('ol.events');
goog.require('ol.Map');
goog.require('ol.MapBrowserEventHandler');
goog.require('ol.pointer.PointerEvent');
