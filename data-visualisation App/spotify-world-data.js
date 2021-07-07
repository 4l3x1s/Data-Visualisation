/* eslint-disable no-console */
function SpotifyWorldData2019() {

  // Name for the visualisation to appear in the menu bar.
  this.name = 'Spotify World Data 2019';

  // Each visualisation must have a unique ID with no special
  // characters.
  this.id = 'spotify-world-data';

  // Names for each axis.

  this.xAxisLabel = 'year';
  this.yAxisLabel;
  var marginSize = 35;

  // Layout object to store all common plot layout parameters and
  // methods.
  this.layout = {
    marginSize: marginSize,

    // Margin positions around the plot. Left and bottom have double
    // margin size to make space for axis and tick labels on the canvas.
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
    grid: false,

    // Number of axis tick labels to draw so that they are not drawn on
    // top of one another.
    numXTickLabels: 8,
    numYTickLabels: 8,
  };

  // Property to represent whether data has been loaded.
  this.loaded = false;

  // Preload the data. This function is called automatically by the
  // gallery when a visualisation is added.
  this.preload = function () {
    var self = this;
    this.data = loadTable(
      './data/spotify/spotify-world-data-2019.csv', 'csv', 'header',
      // Callback function to set the value
      // this.loaded to true.
      function (table) {
        self.loaded = true;
      });
  };

  var songObj = {};
  var BPMObj = {};
  var songKeys;
  var BPMKeys;

  const particles = [];

  //this happens once at the beggining
  this.setup = function () {

    // Set min and max years: assumes data is sorted by year.
    let allData = this.data.rows;

    this.minYear = min(allData.map((row) => row.arr[3]));
    this.maxYear = max(allData.map((row) => row.arr[3]));

    allData.forEach((row) => {
      if (!songObj[row.arr[3]]) {
        songObj[row.arr[3]] = 0;
      }
      songObj[row.arr[3]]++;

      if (!BPMObj[row.arr[3]]) {
        BPMObj[row.arr[3]] = {
          total: 0,
          songs: 0
        };
      }
      BPMObj[row.arr[3]].songs++;
      BPMObj[row.arr[3]].total += (1 * row.arr[4]);
    });

    songKeys = Object.keys(songObj);
    // Find min and max songs for mapping to canvas height.
    this.minSongs = min(songKeys.map((key) => songObj[key]));
    this.maxSongs = max(songKeys.map((key) => songObj[key]));
    this.maxSongs = 15;

    BPMKeys = Object.keys(BPMObj);
    // Find min and max BPM for mapping to canvas height.
    this.minBPM = min(BPMKeys.map((key) => BPMObj[key].total / BPMObj[key].songs));
    this.maxBPM = max(BPMKeys.map((key) => BPMObj[key].total / BPMObj[key].songs));


    // Find mean volume to plot average marker.
    this.meanSongs = mean(songKeys.map((key) => songObj[key]));
    this.meanBPM = mean(BPMKeys.map((key) => BPMObj[key].total / BPMObj[key].songs));

    // Count the number of frames drawn since the visualisation
    // started so that we can animate the plot.
    this.frameCount = 0;

    // Create sliders to control start and end years. Default to
    // visualise full range.

    this.startSlider = createSlider(this.minYear,
      this.maxYear - 1,
      this.minYear,
      1);
    this.startSlider.position(1350, 440);

    this.endSlider = createSlider(this.minYear + 1, this.maxYear, this.maxYear, 1);
    this.endSlider.position(1350, 475);

    /*Particles*/

    //controls number of particles
    const particleLength = Math.floor(window.innerWidth / 9);

    console.log(particleLength);

    for (let i = 0; i < particleLength; i++) {
      particles.push(new Particle);
    }

  };

  this.destroy = function () {
    this.startSlider.remove();
    this.endSlider.remove();
  };

  //this happens multiple times to update the screen
  this.draw = function () {

    fill(0);
    rect(73, 0, width - 100, height - 65);

    if (!this.loaded) {
      console.log('Data not yet loaded');
      return;
    }

    //draw particles
    particles.forEach((p, i) => {
      p.update();
      p.draw();
      p.checkParticles(particles.slice(i));
    });

    // Prevent slider ranges overlapping.
    this.startYear = this.startSlider.value();
    this.endYear = this.endSlider.value();

    // Draw all y-axis tick labels.

    if (mouseIsPressed && mouseX >= 70 && mouseX <= width - 25 && mouseY <= height - 70) {
      drawYAxisTickLabels(this.minBPM,
        this.maxBPM,
        this.layout,
        this.mapbpmavgToHeight.bind(this),
        1);
      this.yAxisLabel = 'BPM Average';
    } else {
      drawYAxisTickLabels(this.minSongs,
        this.maxSongs,
        this.layout,
        this.mapvolumeToHeight.bind(this),
        1);
      this.yAxisLabel = '# Songs';
    }

    // Draw x and y axis.
    drawAxis(this.layout);

    // Draw x and y axis labels.
    drawAxisLabels(this.xAxisLabel,
      this.yAxisLabel,
      this.layout);

    // Plot average line.
    if (mouseIsPressed && mouseX >= 70 && mouseX <= width - 25 && mouseY <= height - 70) {
      stroke(245, 66, 66, 125);
      strokeWeight(1);
      line(this.layout.leftMargin,
        this.mapbpmavgToHeight(this.meanBPM),
        this.layout.rightMargin,
        this.mapbpmavgToHeight(this.meanBPM));
    } else {
      stroke(245, 66, 93, 125);
      strokeWeight(1);
      line(this.layout.leftMargin,
        this.mapvolumeToHeight(this.meanSongs),
        this.layout.rightMargin,
        this.mapvolumeToHeight(this.meanSongs));
    }

    // Plot all volumes between startYear and endYear using the
    // width of the canvas minus margins.
    var previous;
    var numYears = this.endYear - this.startYear;
    var segmentWidth = this.layout.plotWidth() / numYears;

    // Count the number of years plotted each frame to create
    // animation effect.
    var yearCount = 0;

    // Loop over all rows but only plot those in range.
    for (var i = 0; i < 41; i++) {
      var current;
      if (mouseIsPressed && mouseX >= 70 && mouseX <= width - 25 && mouseY <= height - 70) {
        current = {
          // Convert strings to numbers.
          'year': BPMKeys[i],
          'volume': BPMObj[BPMKeys[i]].total / BPMObj[BPMKeys[i]].songs
        };
      } else {
        current = {
          // Convert strings to numbers. 
          'year': songKeys[i],
          'volume': songObj[songKeys[i]]
        };
      }

      // Create an object to store data for the current year.

      if (previous != null && current.year > this.startYear && current.year <= this.endYear) {
        noStroke();

        stroke(0);

        if (mouseIsPressed && mouseX >= 70 && mouseX <= width - 25 && mouseY <= height - 70) {
          stroke(200);
          strokeWeight(2);
          line(this.mapYearToWidth(previous.year),
            this.mapbpmavgToHeight(previous.volume),
            this.mapYearToWidth(current.year),
            this.mapbpmavgToHeight(current.volume));
        } else {
          stroke(200);
          strokeWeight(2);
          line(this.mapYearToWidth(previous.year),
            this.mapvolumeToHeight(previous.volume),
            this.mapYearToWidth(current.year),
            this.mapvolumeToHeight(current.volume));
        }


        // The number of x-axis labels to skip so that only
        // numXTickLabels are drawn.
        var xLabelSkip = ceil(numYears / this.layout.numXTickLabels);

        // Draw the tick label marking the start of the previous year.
        if (yearCount % xLabelSkip == 0) {
          drawXAxisTickLabel(previous.year, this.layout,
            this.mapYearToWidth.bind(this));
        }

        yearCount++;
      }

      if (yearCount >= this.frameCount) {
        break;
      }
      previous = current;
    }

    this.frameCount++;

    //Create cursor:
    if (mouseIsPressed && mouseX >= 70 && mouseX <= width - 25 && mouseY <= height - 70) {
      fill(0, 200, 150, 100);
      circle(mouseX, mouseY, 20);
    }
  };

  this.mapYearToWidth = function (value) {
    return map(value,
      this.startYear,
      this.endYear,
      this.layout.leftMargin, // Draw left-to-right from margin.
      this.layout.rightMargin);
  };

  this.mapvolumeToHeight = function (value) {
    return map(value,
      this.minSongs,
      this.maxSongs,
      this.layout.bottomMargin, // Lower volume at bottom.
      this.layout.topMargin); // Higher volume at top.
  };

  this.mapbpmavgToHeight = function (value) {
    return map(value,
      this.minBPM,
      this.maxBPM,
      this.layout.bottomMargin, // Lower volume at bottom.
      this.layout.topMargin); // Higher volume at top.
  };

}

//Particle class declaration and methods:
class Particle {
  constructor() {
    this.position = createVector(random(70, width - 35), random(35, height - 70));
    this.speed = createVector(random(-1, 1), random(-1, 1));
    this.size = 12;
  }

  update() {
    this.position.add(this.speed);
    this.edges();
  }

  draw() {
    noStroke();
    if (mouseIsPressed && mouseX >= 70 && mouseX <= width - 25 && mouseY <= height - 70) {
      fill('rgba(112, 237, 17, 0.01)');
    } else {
      fill('rgba(0, 200, 255, 0.01)');
    }
    circle(this.position.x, this.position.y, this.size);
  }

  edges() {
    if (this.position.x < 70 || this.position.x > width - 35) {
      this.speed.x *= -1;
    }

    if (this.position.y < 35 || this.position.y > height - 70) {
      this.speed.y *= -1;
    }
  }

  checkParticles(particles) {
    particles.forEach(particle => {
      const d = dist(this.position.x, this.position.y, particle.position.x, particle.position.y);

      if (d < 120) {
        if (mouseIsPressed && mouseX >= 70 && mouseX <= width - 25 && mouseY <= height - 70) {
          stroke('rgba(112, 237, 17, 0.15)');
        } else {
          stroke('rgba(0, 180, 220, .15)');
        }
        line(this.position.x, this.position.y, particle.position.x, particle.position.y);
      }
    });
  }
}