function NutrientsTimeSeries() {

  // Name for the visualisation to appear in the menu bar.
  this.name = 'Nutrients: 1974-2016';

  // Each visualisation have a unique ID with no special
  // characters.
  this.id = 'nutrients-timeseries';

  // Title to display above the plot.
  this.title = 'Nutrients: 1974-2016';

  // Names for each axis.
  this.xAxisLabel = 'year';
  this.yAxisLabel = '%';

  this.colors = [];

  var marginSize = 35;

  // Layout object to store all common plot layout parameters and
  // methods.
  this.layout = {
    marginSize: marginSize,

    // Locations of margin positions. Left and bottom have double margin
    // size due to axis and tick labels.
    leftMargin: marginSize * 2,
    rightMargin: width - marginSize,
    topMargin: marginSize,
    bottomMargin: height - marginSize * 2,
    pad: 5,

    plotWidth: function () {
      return this.rightMargin - this.leftMargin;
    },

    plotHeight: function () {
      return this.bottomMargin - this.topMargin;
    },

    // Boolean to enable/disable background grid.
    grid: true,

    // Number of axis tick labels to draw so that they are not drawn on
    // top of one another.
    numXTickLabels: 20,
    numYTickLabels: 8,
  };


  // Property to represent whether data has been loaded.
  this.loaded = false;

  // Preload the data. This function is called automatically by the
  // gallery when a visualisation is added.
  this.preload = function () {
    var self = this;
    this.data = loadTable(
      './data/food/nutrients74-16.csv', 'csv', 'header',
      // Callback function to set the value
      // this.loaded to true.
      function (table) {
        self.loaded = true;
      });

  };

  this.setup = function () {
    // Font defaults.
    textSize(16);


    // Set min and max years: assumes data is sorted by date.
    this.startYear = Number(this.data.columns[1]);
    this.endYear = Number(this.data.columns[this.data.columns.length - 1]);


    // Count the number of frames drawn since the visualisation
    // started so that we can animate the plot.
    this.frameCount = 0;

    // Create sliders to control start and end years. Default to
    // visualise full range.
    this.startSlider = createSlider(this.startYear,
      this.endYear - 1,
      this.startYear,
      1);
    this.startSlider.position(375, 575);

    this.endSlider = createSlider(this.startYear + 1,
      this.endYear,
      this.endYear,
      1);
    this.endSlider.position(375, 625);



    for (var i = 0; i < this.data.getRowCount(); i++) {
      this.colors.push(color(random(0, 255), random(0, 255), random(0, 255)));
    }

    // Find min and max percentage for mapping to canvas height.
    this.minPercentage = 80; // Pay equality (zero pay gap).
    this.maxPercentage = 400;
  };

  this.destroy = function () {
    this.startSlider.remove();
    this.endSlider.remove();
  };


  this.draw = function () {
    if (!this.loaded) {
      // eslint-disable-next-line no-console
      console.log('Data not yet loaded');
      return;
    }



    // Prevent slider ranges overlapping.
    if (this.startSlider.value() >= this.endSlider.value()) {
      this.startSlider.value(this.endSlider.value() - 1);
    }
    this.startYear = this.startSlider.value();
    this.endYear = this.endSlider.value();

    // Draw all y-axis labels.
    drawYAxisTickLabels(this.minPercentage,
      this.maxPercentage,
      this.layout,
      this.mapPayGapToHeight.bind(this),
      0);

    // Draw x and y axis.
    drawAxis(this.layout);

    // Draw x and y axis labels.
    drawAxisLabels(this.xAxisLabel,
      this.yAxisLabel,
      this.layout);

    // Plot all pay gaps between startYear and endYear using the width
    // of the canvas minus margins.

    var numYears = this.endYear - this.startYear;

    // Loop over all rows and draw a line from the previous value to
    // the current.
    for (var i = 0; i < this.data.getRowCount(); i++) {
      var row = this.data.getRow(i);
      var previous = null;

      var l = row.getString(0);


      for (var j = 1; j < numYears; j++) {

        // Create an object to store data for the current year.
        var current = {
          // Convert strings to numbers.
          'year': this.startYear + j - 1,
          'percentage': row.getNum(j)
        };


        if (previous != null) {

          // console.log(current);

          // Draw line segment connecting previous year to current
          // year pay gap.
          stroke(this.colors[i]);
          line(this.mapYearToWidth(previous.year),
            this.mapPayGapToHeight(previous.percentage),
            this.mapYearToWidth(current.year),
            this.mapPayGapToHeight(current.percentage));

          // The number of x-axis labels to skip so that only
          // numXTickLabels are drawn.
          var xLabelSkip = ceil(numYears / this.layout.numXTickLabels);

          // Draw the tick label marking the start of the previous year.
          if (previous.year % xLabelSkip == 0) {
            drawXAxisTickLabel(previous.year,
              this.layout,
              this.mapYearToWidth.bind(this)
            );
          }
        } else {
          noStroke();
          fill(this.colors[i]);
          text(l, 100, this.mapPayGapToHeight(current.percentage));
        }

        // Assign current year to previous year so that it is available
        // during the next iteration of this loop to give us the start
        // position of the next line segment.
        previous = current;
      }

    }
  };

  this.drawTitle = function () {
    fill(0);
    noStroke();
    textAlign('center', 'center');

    text(this.title,
      (this.layout.plotWidth() / 2) +
      this.layout.leftMargin,
      this.layout.topMargin - (this.layout.marginSize / 2)
    );
  };

  this.mapYearToWidth = function (value) {
    return map(value,
      this.startYear,
      this.endYear,
      this.layout.leftMargin, // Draw left-to-right from margin.
      this.layout.rightMargin);
  };

  this.mapPayGapToHeight = function (value) {
    return map(value,
      this.minPercentage,
      this.maxPercentage,
      this.layout.bottomMargin, // Smaller pay gap at bottom.
      this.layout.topMargin); // Bigger pay gap at top.
  };
}