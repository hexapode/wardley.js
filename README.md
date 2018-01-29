# wardley.js

  A javascript library to handle wardley maps

  Support editing and display of map in https://github.com/cioportfolio/swardley-script format.
  
 # usage
 
      var dataInWardleyScriptFormat = {
	      title: "Example Map",
	      elements: [{
          id: "1",
          name: "Customer",
          visibility: 1.0,
          maturity: 0.4
        },
        {
          id: "2",
          name: "Online image maniputation",
          visibility: 0.95,
          maturity: 0.3
      }]};
      
      var map = new WardleyMap({
        target : '#targetElementSelector',
        data : dataInWardleyScriptFormat
       });
