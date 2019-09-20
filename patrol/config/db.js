var MongoClient = require('mongodb').MongoClient
var config = require('../config/config') 
var fs = require('fs')

// var url = 'mongodb://'+config.mongodbUser+':'+config.mongodbPwd+'@'+config.mongoDbHost+':'+config.mongoDbPort+'/'+config.mongoDbName+'';
var url = 'mongodb://'+config.mongoDbHost+':'+config.mongoDbPort
// var url = 'mongodb://localhost:27017'
var dbConnection;

var options = { 
  useNewUrlParser: true,
  useUnifiedTopology: true
};
console.log("url: ",url)

function mongoDB(){
    MongoClient.connect(url,options, function(err, client) {
       if (err) {
          console.log('Unable to connect to the mongoDB server. Error:', err);
        } else {
          console.log('Connection established to', url);
          dbConnection = client.db(config.mongoDbName);
        }
    });
}

mongoDB.prototype.find = function(collectionName,query,callback){
  var collection = dbConnection.collection(collectionName);

	collection.find(query).toArray(function(err,result){
		if(err){
			callback(err,null);
		}else{
			callback(null,result);
		}
	});
}

mongoDB.prototype.insert = function(collection,query,callback){
    var collection = dbConnection.collection(collection);
    query.timestamp = new Date();
    collection.insertOne(query,function(err,result){
        if(err){
            callback(err,null);
        }else{
            callback(null,result);
        }
    })
}

mongoDB.prototype.insertMany = function(collection,query,callback){
  var collection = dbConnection.collection(collection);
  query.forEach(function(data){
    data.timestamp = new Date();
  })
  collection.insertMany(query,function(err,result){
    if(err){
      callback(err,null);
    }else{
      callback(null,result);
    }
  })
}

mongoDB.prototype.createIndex = function(collection,query,callback){
  var collection = dbConnection.collection(collection);
  collection.createIndex(query,function(err,result){
    if(err){
      callback(err,null);
    }else{
      callback(null,result);
    }
  })
}

mongoDB.prototype.deleteMany = function(collection,query,callback){
    var collection = dbConnection.collection(collection);
    collection.deleteMany(query, {multi:true}, function(err,result){
        if(err){
            callback(err,null);
        }else{
            callback(null,result);
        }
    });
}


module.exports = mongoDB;