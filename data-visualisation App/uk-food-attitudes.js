function UKFoodAttitudes() {

  // Name for the visualisation to appear in the menu bar.
  this.name = 'UK Food Attitudes 2018';

  // Each visualisation must have a unique ID with no special
  // characters.
  this.id = 'uk-food-attitudes';

  // Property to represent whether data has been loaded.
  this.loaded = false;

  // Preload the data. This function is called automatically by the
  // gallery when a visualisation is added.
  this.preload = function() {
    var self = this;
    this.data = loadTable(
      './data/food/attitudestoukfood-2018.csv', 'csv', 'header',
      // Callback function to set the value
      // this.loaded to true.
      function(table) {
        self.loaded = true;
      });
  };

  this.setup = function() {
    if (!this.loaded) {
      console.log('Data not yet loaded');
      return;
	
    }

    // Create a select DOM element.
    this.select = createSelect();
    this.select.position(350, 525);

    // Fill the options with all company names.
    var questions = this.data.columns;
    // First entry is empty.
    for (let i = 1; i < questions.length; i++) {
      this.select.option(questions[i]);
    }
  };

  this.destroy = function() {
    this.select.remove();
  };

  // Create a new pie chart object.
  this.pie = new PieChart(width / 2, height / 2, width * 0.4);

  this.draw = function() {
    if (!this.loaded) {
      console.log('Data not yet loaded');
      return;
    }

    // Get the value of the company we're interested in from the
    // select item.
    var questionType = this.select.value();

    // Get the column of raw data for questionType.
    var col = this.data.getColumn(questionType);

    // Convert all data strings to numbers.
    col = stringsToNumbers(col);

    // Copy the row labels from the table (the first item of each row).
    var labels = this.data.getColumn(0);

    // Colour to use for each category.
    var colours = ['lime', 'green','yellow', 'orange', 'red'];

    // Make a title.
    var title = 'Question: ' + questionType;

    // Draw the pie chart!
    this.pie.draw(col, labels, colours, title);
	  
	  
	// Enable to hover with mouseX,mouseY over different section of the pie chart
    if(mouseX >= width / 2 - width * 0.2 
       &&
       mouseY >= height / 2 - width * 0.2 
       &&
       mouseX <= width / 2 + width * 0.2
       &&
       mouseY <= height / 2 + width * 0.2)
    {
       //creates strings that match the colours array
       var colourStrings = ['[0,255,0,255]',
							'[0,128,0,255]',
							'[255,255,0,255]',
							'[255,165,0,255]',
							'[255,0,0,255]'];
		
        //loop through the colourStrings array. If the colour matches the colour value the % appears in the centre of the pie chart in a light grey rectangle
      
        for(var i = 0; i < colourStrings.length; i++)
        {
            if(("["+get(mouseX, mouseY)+"]") == colourStrings[i])
            {
				rectMode(CENTER);
				if(colours[i] != 'green' && colours[i] != 'red')
				{
					fill(100);
				}
				else
				{
					fill(200);
				}
				rect(width/2 - 2, height/2 - 2, 68, 38, 20);
				fill(colours[i]);
				textSize(30);
				text(parseInt(col[i] * 100) + '%', width / 2, height / 2);
			}
        }
	}
  };
}