var cheerio =  Meteor.npmRequire('cheerio');

Meteor.methods({

  getUrlInfo:function(url){
    //var result = HTTP.call("GET", url);

    var result = false;
    console.log("Try to GET url info from: " + url);
    try{
      result = Meteor.http.get(url).content;
      console.log("Result from " + url + " is ready");
      var $ = cheerio.load(result);
      var title = $("title").text();
      console.log("title " + title + " is ready");

      var description = $('meta[name=description]').attr("content");
      // If <meta> tag description is not found take the text in the first <p> tag
      if(!description){
        description = $('p').text();
        if(!description){
          // If <p> tag is not found take the text in the <body>
          description = $('body').text();
          // else no text found
          if(!description){
            description = "No text found on this web page.";
          }
        }
      }
      console.log("description " + description + " is ready");

      var siteInfo={'url':url,'title':title,'description':description};
      console.log("sending  siteInfo: ");
      console.log(siteInfo);
      console.log(" - - - ");
      return siteInfo;
    }catch(e){
      return {'error':'url is not correct','url':url};
    }
  },
});

// start up function that creates entries in the Websites databases.
Meteor.startup(function () {





  // code to run on server at startup
  if ( Meteor.users.find().count() === 0 ) {
    Accounts.createUser({
        _id:1,
        username: 'admin',
        email: 'email@admin.io',
        password: 'asdfasdf'
    });
  }

  if (!Websites.findOne()){



  	console.log("No websites yet. Creating starter data.");
  	  Websites.insert({
  		title:"Goldsmiths Computing Department",
  		url:"http://www.gold.ac.uk/computing/",
  		description:"This is where this course was developed.",
      rating:5,
      up:5,
      down:0,
      createdBy:1,
  		createdOn:new Date()
  	});
  	 Websites.insert({
  		title:"University of London",
  		url:"http://www.londoninternational.ac.uk/courses/undergraduate/goldsmiths/bsc-creative-computing-bsc-diploma-work-entry-route",
  		description:"University of London International Programme.",
      rating:4,
      up:4,
      down:0,
      createdBy:1,
  		createdOn:new Date()
  	});
  	 Websites.insert({
  		title:"Coursera",
  		url:"http://www.coursera.org",
  		description:"Universal access to the world’s best education.",
      rating:3,
      up:3,
      down:0,
      createdBy:1,
  		createdOn:new Date()
  	});
  	Websites.insert({
  		title:"Google",
  		url:"http://www.google.com",
  		description:"Popular search engine.",
      rating:2,
      up:2,
      down:0,
      createdBy:1,
  		createdOn:new Date()
  	});
  }
});
