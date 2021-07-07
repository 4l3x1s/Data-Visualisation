function Gallery() {

  //public properties
  this.selectedVisual = null;

  //private properties
  var self = this;
  var visuals = [];


  //public functions    

  // Add a new visualisation to the navigation bar.
  this.addVisual = function (vis) {

    // Check that the vis object has an id and name.
    if (!vis.hasOwnProperty('id') &&
      !vis.hasOwnProperty('name')) {
      alert('Make sure your visualisation has an id and name!');
    }

    // Check that the vis object has a unique id.
    if (findVisIndex(vis.id) != null) {
      alert(`Vis '${vis.name}' has a duplicate id: '${vis.id}'`);
    }

    visuals.push(vis);

    // Create menu item.
    var menuItem = createElement('li', vis.name);
    menuItem.addClass('menu-item');
    menuItem.id(vis.id);

    //add the event handlers
    menuItem.mouseOver(menuItemOver);
    menuItem.mouseOut(menuItemOut);
    menuItem.mouseClicked(menuItemSelected);

    var visMenu = select('#visuals-menu');
    visMenu.child(menuItem);

    // Preload data if necessary.
    if (vis.hasOwnProperty('preload')) {
      vis.preload();
    }
  };

  //private functions
  var selectVisual = function (visId) {
    var visIndex = findVisIndex(visId);

    if (visIndex != null) {
      // If the current visualisation has a deselect method run it.
      if (self.selectedVisual != null &&
        self.selectedVisual.hasOwnProperty('destroy')) {
        self.selectedVisual.destroy();
      }
      // Select the visualisation in the gallery.
      self.selectedVisual = visuals[visIndex];

      // Initialise visualisation if necessary.
      if (self.selectedVisual.hasOwnProperty('setup')) {
        self.selectedVisual.setup();
      }

      // Enable animation in case it has been paused by the current
      // visualisation.
      loop();
    }
  };

  var findVisIndex = function (visId) {
    // Search through the visualisations looking for one with the id
    // matching visId.
    for (var i = 0; i < visuals.length; i++) {
      if (visuals[i].id == visId) {
        return i;
      }
    }

    // Visualisation not found.
    return null;
  };

  //event handlers
  var menuItemSelected = function (e) {

    //remove selected class from any other menu-items

    var menuItems = selectAll('.menu-item');

    for (var i = 0; i < menuItems.length; i++) {
      menuItems[i].removeClass('selected');
    }

    var el = select('#' + e.srcElement.id);
    el.addClass('selected');

    selectVisual(e.srcElement.id);

  };

  var menuItemOver = function (e) {
    var el = select('#' + e.srcElement.id);
    el.addClass('hover');
  };

  var menuItemOut = function (e) {
    var el = select('#' + e.srcElement.id);
    el.removeClass('hover');
  };


}