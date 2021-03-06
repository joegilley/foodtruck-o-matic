ft.GoogleMapView = Backbone.View.extend({
  el: '.map-canvas',
  initialize: function(options) {
    // Add the 'this' context to our methods
    _.bindAll(this, 'add', 'remove', 'select', '_show_infoWindow');

    this.listenTo(this.collection, 'add', this.add);
    this.listenTo(this.collection, 'remove', this.remove);
    this.listenTo(this.collection, 'change:selection', this.select);
    this.listenTo(this.collection, 'done', this.render);
    this.listenTo(this.collection.coordModel, 'change', this.render);

    // Nothing to do yet, but hold onto a `InfoWindow` for later
    this._infoWindow = new google.maps.InfoWindow({
      content: 'oops',
      maxWidth: 300
    });

    // Initialize the map
    this._map = new google.maps.Map(this.el, {
      zoom: 14,
      center: new google.maps.LatLng(
       this.collection.coordModel.get('latitude'),
       this.collection.coordModel.get('longitude'))
    });

    // A hash for model id to marker for bookkeeping
    this._markers = {};
  },
  add: function(model) {
    // Create a map marker for this model!
    var marker = new google.maps.Marker({
      position: new google.maps.LatLng(
        model.get('latitude'),
        model.get('longitude')),
      map: this._map,
      title: model.get('applicant')
    });

    this._markers[model.id] = marker;

    google.maps.event.addListener(marker, 'click', function() {
      this._show_infoWindow(model)
    }.bind(this));
  },
  remove: function(model) {
    this._markers[model.id].setMap(null);
    this._markers[model.id] = null;
    delete this._markers[model.id];
  },
  select: function(model) {
    this._map.panTo(this._markers[model.id].getPosition());
    this._show_infoWindow(model)
  },
  render: function() {
    var center = new google.maps.LatLng(
      this.collection.coordModel.get('latitude'),
      this.collection.coordModel.get('longitude'));
    var bounds = new google.maps.LatLngBounds();
    // bounds.extend(center);
    for (var i=0; i<this.collection.models.length; i++) {
      model = this.collection.models[i];
      console.log('found');
      var modelLoc = new google.maps.LatLng(
        model.get('latitude'),
        model.get('longitude'));
      bounds.extend(modelLoc);
    }

    this._map.fitBounds(bounds);
  },
  _show_infoWindow: function(model) {
    this._infoWindow.open(this._map, this._markers[model.id]);

    var html = $('#template-foodtruck-blurb').html();
    this._infoWindow.setContent(_.template(html)(model.attributes));
  }
});
