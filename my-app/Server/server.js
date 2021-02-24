const express = require('express');
const bodyParser = require('body-parser');
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Methods", "POST, GET, PUT, DELETE, OPTIONS")
  res.header('Access-Control-Allow-Credentials', true);
  //res.header("Content-Type", "application/json;");
  next();
});

let focused_persons = []

app.post('/getRecordsByUser', (req, res) => {

  const MongoClient = require('mongodb').MongoClient;//创建服务器实例
  const uri = "mongodb+srv://lanmiemie:zly3885251@mobiledata.ez0ez.mongodb.net/MobileData?retryWrites=true&w=majority";
  
  let data = Object.keys(req.body)[0];

  let persons = JSON.parse(data)['persons']//和userembvis中的selected_persons_dict是一样的

  MongoClient.connect(uri, { useNewUrlParser: true }).then((conn) => {    //与网上的mongdb服务器连接

      let fake_persons = {"13035631411": 1}

      const db = conn.db("cotton");//创建数据库的实例
      // 增加
      db.collection("heihei").find({}, {fields: persons}).toArray().then((arr) => {

          ret_data = arr[0]
          //console.log("ret_data",ret_data)
          focused_persons = ret_data

          res.status(200).send(JSON.stringify(focused_persons))

      }).catch((err) => {
        console.log(err);
      });

  }).catch((err) => {
      console.log(err);
    });

});

const server = app.listen(4001, function () {

  const host = 'server.address().address'
  const port = server.address().port

  console.log("Example app listening at http://%s:%s", host, port)

})