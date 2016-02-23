Router.configure({
  layoutTemplate: 'ApplicationLayout',
  notFoundTemplate: 'not_found'
});

//Router.plugin('dataNotFound', {notFoundTemplate: 'not_found'});

Router.route('/', function () {
  this.render('welcome', {
    to:"main"
  });
});

Router.route('/website/:_id', function () {
  this.render('website_page', {
    to:"main",
    data:function(){
      return Websites.findOne({_id:this.params._id});
    }
  });
});

RegExp.escape = function(s) {
  return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
};



Router.route('/q/:q', function () {
  this.render('website_search', {
    to:"main",
		data: function() {
				var searchString = this.params.q;

				var fields = ['url','title','description'];
				var arrLike = [];
				for(var i = 0;i<fields.length;i++){
					arrLike[i]={ [fields[i]]:{'$regex': new RegExp(searchString, "i") } };
				}
				/*
				var arrLike = [
					{ 'url':{'$regex': new RegExp(searchString, "i") } },
					{ 'title':{'$regex': new RegExp(searchString, "i") } },
					{ 'description':{'$regex': new RegExp(searchString, "i") } }, ];
					*/
				var webs = Websites.find({'$or' : arrLike
				}, {
					limit: 20
				});
				var websites = {'websites':webs};
				console.log(websites);
				return websites;
		}
  });
});





Accounts.ui.config({
  passwordSignupFields: "USERNAME_AND_EMAIL"
});


function uniq(a) {
	return a.sort().filter(function(item, pos, ary) {
			return !pos || item != ary[pos - 1];
	})
};
function splitWords(text){
	text.replace(",","");
	return text.split(' ');
};

function addTags(tags){
	var new_tags = uniq(tags).filter(function(value){ return value.length > 4; });
	var TagsExists = Tags.findOne({user:Meteor.user()._id});
	if(TagsExists){
		new_tags = uniq(new_tags.concat(TagsExists.tags));
			Tags.update({_id:TagsExists._id}, {$set: {tags: new_tags  }});
	}else{
			Tags.insert({user:Meteor.user()._id,tags:new_tags});
	}
}
/////
// template helpers
/////

Template.registerHelper('getParams', function() {
    return Router.current().params;
});
Template.registerHelper('isLogin', function() {
    return Meteor.user();
});

// {{isRoute "q.:q"}}
Template.registerHelper('isRoute', function(route) {
	var rName = Router.current().route.getName();
	console.log("rName"); console.log(rName);
		return rName === route;
});


Template.registerHelper('setRatingBgClass', function(rating) {
    if(rating<1){
			return "bg-warning";
		}
		return "bg-success";
});

Template.registerHelper('getUser', function(user_id) {
	var user = Meteor.users.findOne({_id:user_id});
	if (user){
		return user.username;
	}
	else {
		return "anon";
	}
});
/*
Template.website_page.helpers({
	getUser:function(user_id){
	  var user = Meteor.users.findOne({_id:user_id});
	  if (user){
	    return user.username;
	  }
	  else {
	    return "anon";
	  }
	}
});
*/
Template.navbar.events({
	"submit .js-search-form":function(event){
		var q = event.target.q.value;
		console.log("Search key: " + q);
			Router.go('/q/' + q);
		//Prevent default
		return false;
	},
});




Template.website_page.events({
	"submit .js-save-website-comment-form":function(event){
		// here is an example of how to get the url out of the form:
		var website_id = this._id;
		var text = event.target.text.value;
		console.log("Adding a new comment");
		console.log(website_id);
		if (Meteor.user()){
			var website = Websites.findOne({'_id':website_id});
			if(website){
				new_comment = {
					text:text,
					createdOn:new Date(),
					createdBy:Meteor.user()._id
				};

				console.log(website);
				if(website.comments){
					Websites.update({_id:website_id}, {$push: {comments:new_comment}});
				}else{
					var comments =[new_comment];
					Websites.update({_id:website_id}, {$set: {comments:comments}});
				}
				$("#text").val("");
			}else{
				console.log("Website not exists");
			}
		}else{
			console.log("User must to be logedin");
			FlashMessages.sendWarning("Please login to add comments!");
		}

		//Prevent default
		return false;
	},

});


// helper function that returns all available websites

Template.websiteSuggestions.helpers({
	user:function(){return Meteor.user()._id},
	tags:function(){
		return Tags.findOne({'user':Meteor.user()._id});
	},
	websites:function(){
		var tags = false;
		var tags = Tags.findOne({'user':Meteor.user()._id});
		console.log("tags");
		console.log(tags);
		console.log(" - - - ");

		if(!tags){
			var tagsList=[];
			return false;
		}
		else{
			var tagsList = tags.tags;
		}

		//var searchString = "^(?!" + tagsList.join("|") + ")";
		/*var webs = Websites.find({'$or' : [
			{ 'title':{'$regex': new RegExp(searchString, "i") } }
		]
		}, {
			limit: 20
		});*/

		var arrLike = [];
		for(var i = 0;i<tagsList.length;i++){
			arrLike[i]={ 'title':{'$regex': new RegExp([tagsList[i]], "i") } };
		}
		/*
		var arrLike = [
			{ 'url':{'$regex': new RegExp(searchString, "i") } },
			{ 'title':{'$regex': new RegExp(searchString, "i") } },
			{ 'description':{'$regex': new RegExp(searchString, "i") } }, ];
			*/
		var webs = Websites.find({'$or' : arrLike}, {limit: 20});

		if(Meteor.user()){
			var webs = Websites.find(
				{'$and':[
						{'$or' : arrLike} ,
						{'createdBy': {$ne : Meteor.user()._id} }
				]}, {limit: 20}
			);
		}



		//var websites = {'websites':webs};
		//webs = Websites.find({});
		//webs = {'websites':webs};

		return webs;

	},
});

Template.website_list.helpers({
	websites:function(){
		return Websites.find({}, {sort: {rating: -1}});

	}
});


/////
// template events
/////


Template.up_down_vote.events({
	"click .js-upvote":function(event){
		// example of how you can access the id for the website in the database
		// (this is the data context for the template)
		var website_id = this._id;
		console.log("Up voting website with id "+website_id);
		// put the code in here to add a vote to a website!
		//if (Meteor.user()){}
		var website = Websites.findOne({'_id':website_id});
		if(website){
			var rating = website.rating+1;
			var up = website.up+1;
			Websites.update({_id:website_id}, {$set: {rating:rating,up:up}});
			console.log(splitWords(website.title));

			//Add tags preference
			addTags(splitWords(website.title));

		}else{
			FlashMessages.sendWarning("Website id dosen't exists");
		}

		return false;// prevent the button from reloading the page
	},
	"click .js-downvote":function(event){

		// example of how you can access the id for the website in the database
		// (this is the data context for the template)
		var website_id = this._id;
		console.log("Down voting website with id "+website_id);

		// put the code in here to remove a vote from a website!
		var website = Websites.findOne({'_id':website_id});
		if(website){
			var rating = website.rating-1;
			var down = website.down+1;
			Websites.update({_id:website_id}, {$set: {rating:rating,down:down}});
		}else{
			FlashMessages.sendWarning("Website id dosen't exists");
		}

		return false;// prevent the button from reloading the page
	}
})


Template.add_btn.events({
  "click .js-toggle-website-form":function(event){
		//$("#website_form").toggle('slow');
    $("#website_form_overlay").toggle();
    $("#website_form").toggle();
    console.log("show add");
	}
});

Template.website_form.events({
  "click #website_form_overlay":function(event){
		//$("#website_form").toggle('slow');
    $("#website_form").hide();
    $("#website_form_overlay").fadeOut('slow');
    console.log("hide add");

	},
	/*
		Insert a new website
	*/
	"submit .js-save-website-form":function(event){
		// here is an example of how to get the url out of the form:
		var url = event.target.url.value;
		console.log("The url they entered is: "+url);

		// use the HTTP package to automate information about the url
		var site_info={};
		//getUrlInfo
		Meteor.call('getUrlInfo',url,function(err, response) {
			//Check if response has error
			if(response.error){
				console.log("Error!");
				console.log(response.error);
				FlashMessages.sendWarning("Error: " + response.error);
			}else{

				//Check if site is already present
				var websiteExists = Websites.findOne({'url':response.url});
				if(!websiteExists){
					// If user is logedin insert the website
					if (Meteor.user()){
			      Websites.insert({
			        title:response.title,
			        url:response.url,
							description:response.description,
			        rating:1,
							up:1,
							down:0,
							createdOn:new Date(),
			        createdBy:Meteor.user()._id
			      });
						console.log("Insert the website " + url);

						//Add tags preference
						addTags(splitWords(response.title));

						FlashMessages.sendSuccess("The website " + url + " is saved!");
						$("#website_form").toggle();
					}else{
						console.log("User must to be logedin");
						FlashMessages.sendWarning("Please login to add website!");
					}
				}else{
					// Website exists
					console.log("Website: " + url + " already exists");
					FlashMessages.sendWarning("Website: " + url + " already exists");
				}
			}

		});



		//  put your website saving code in here!

		return false;// stop the form submit from reloading the page


	}
});
