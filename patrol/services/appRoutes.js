var multipart = require('connect-multiparty');
var moptions = {
	uploadDir : process.cwd()+'/fileUploads'
}
var multipartMiddleware = multipart(moptions);
var fs = require('fs');
var csv = require('csv-parser');

module.exports = function(app,db){

	app.get('/dummy', function (req, res) {
		db.find('dummy',{},function(err,result){
			if(err) throw err;
			res.send(result);
		});	
	});

	app.post('/uploadRecords', multipartMiddleware, function (req, res) {
		if(req.files.records){
			console.log(req.files.records)
			var arr = []
			fs.createReadStream(req.files.records.path)
			.pipe(csv())
			.on('data', function (data) {
				arr.push(data)
			})
			.on('finish', function (data){
				var recordsArr = []
				arr.forEach(function(record){
					var temp = {
						name: record['ACCUSED_NAME'],
						gender: record['GENDER'],
						firNo: record['FIR_NO'],
						mobile: record['MOBILE_1'],
						act: record['ACT_SEC'],
						policeStation: record['PS'],
						majorHead: record['MAJOR_HEAD'],
					    fatherName : record['FATHER_NAME']
					}
					recordsArr.push(temp)
				})
				db.insertMany("records", recordsArr, function(err, resp){
					if(err){
						res.status(400).send({error: "something went wrong while inserting records"})
					}else{
						deleteFiles(req.files.records.path, function(){})
						res.send(resp)
					}
				})
			})
		}else{
			res.status(400).send({error: "something went wrong, file is missing"})
		}
	});

	function deleteFiles(filePath, callback){
		fs.unlink(filePath, function(err) {
			if(err) {
				console.log("unlink err: ", err)
				callback(err);
			}else{
				console.log("done...!")
				callback(null);
			}
		});
	}

	app.post('/getRecords', function (req, res) {
		if(req.body.conditions){
			var conditionsArr = req.body.conditions
			// {post_text:{$regex:"tutorialspoint",$options:"$i"}
			var query = {"$and": []}
			conditionsArr.forEach(function(condition){
				var temp = {}
				temp[condition.fieldName] = {"$regex":condition.fieldValue,$options:"$i"}
				console.log(temp)
				query.$and.push(temp)
			})
			db.find('records',query,function(err,result){
				if(err){
					res.status(400).send({error: "something went wrong while getting records"})
				}else{
					res.send(result)
				}
			});
		}else{
			res.status(400).send({error: "something went wrong, conditions are missing"})
		}
	});

	app.delete('/deleteRecords', function (req, res) {
		db.deleteMany('records',{},function(err,delResp){
			if(err){
				res.status(400).send({error: "something went wrong while getting records"})
			}else{
				res.send(delResp)
			}
		});
	});

	app.get('/getRecords', function (req, res) {
		db.find('records',{},function(err,data){
			if(err){
				res.status(400).send({error: "something went wrong while getting records"})
			}else{
				res.send({
					"totalRecords": data.length,
					"recordsDate": data
				})
			}
		});
	});

}