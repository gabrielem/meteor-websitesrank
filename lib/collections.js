Websites = new Mongo.Collection("websites");
Tags = new Mongo.Collection("tags");
Tags.allow({
	// we need to be able to update images for ratings.
  update:function(userId, doc){
	   return true;
	},
  insert:function(userId, doc){
	   return true;
	},
	remove:function(userId, doc){
		return true;
	}
});
