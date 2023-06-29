
const low = require('lowdb')
var CryptoJS = require("crypto-js");
const express = require("express");
const app = express();
const handlebars = require("express-handlebars");
const bodyParser = require("body-parser")
const rg = require('rangen');
var toobusy = require("toobusy-js");
const FileSync = require("lowdb/adapters/FileSync");
const { use } = require('express/lib/application');
const adapter = new FileSync("database/server.json");
const db = low(adapter);
const rateLimit = require('express-rate-limit')
const MongoStore = require('rate-limit-mongo');

const limiter = rateLimit({
  store: new MongoStore({ 
    uri: 'mongodb+srv://admin:bRYCE2007.@cluster.f6riahn.mongodb.net/?retryWrites=true&w=majority',
    CollectionName:  'ratelimit'
  }),
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 10, // limit each IP to 10 requests per windowMs
  message: "my initial message",
      handler: function(req, res /*, next*/) {
    res.render('./rate')
      },
});

 

app.use(limiter)
var handle = handlebars.create({
    defaultLayout: 'main'
});
require("http").globalAgent.maxSockets = Infinity;
app.use(express.static('public'));
app.use('/', express.static('images'));
app.engine('handlebars', handle.engine);



app.use(express.json());

app.set('view engine', 'handlebars');

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())


app.use('/uploads', express.static(__dirname + '/public'));


app.get('/', function (req, res) {
    res.render('./create')

})
app.get('/alert', function (req, res) {
    res.render('./alert')
})
app.get('/', function (req, res) {
    res.render('./alert', {message: "You need to enter a post ID in URL"})
})

process.on("uncaughtException", function (err) {
	console.log(err);
});

process.on("SIGINT", function() {
  server.close();
  toobusy.shutdown();
  process.exit();
});

      
app.get('/:value', function (req, res) {
    if (db.get('posts')
    .some(post => post.id === req.params.value)
    .value() === true) {
        let post = db
        .get("posts")
        .find({ id: req.params.value })
        .value()
      if(post.crypted === true){
       res.render("./verification",{camin:post.id})
       app.post(`/${req.params.value}`, function (req, res){
        var base_paste = CryptoJS.AES.decrypt(post.pass, req.body.password)
        base_paste.toString(CryptoJS.enc.Utf8)
        if(base_paste.toString(CryptoJS.enc.Utf8) === ""){
            res.render('./alert', {message: "Decryption failed, check the entered password",image:"logo.png"})
        }else{

     
        res.render('./view', {paste: base_paste.toString(CryptoJS.enc.Utf8),title:post.title})
    }
       })
      }else{
        var base_paste = CryptoJS.AES.decrypt(post.pass, "12345678910")
         base_paste.toString(CryptoJS.enc.Utf8)
          res.render('./view', {paste: base_paste.toString(CryptoJS.enc.Utf8),title:post.title})
      }
    }

})
app.post('/view', function (req, res) {

})
app.post('/save', function (req, res) {
    let get = req.body
    const post_id = rg.id({length: 5, charSet: 'alphanum'});

if(get.check === "false"){
    if(get.paste.includes("")){
        res.render('./alert', {message: "You cannot host javascript codes",image:"logo.png"})
    }else{
let iscrypted = true
db.get("posts")
.push({
    id: post_id,
    crypted: iscrypted,
    pass: CryptoJS.AES.encrypt(get.paste, get.cryptpass).toString()

}).write();
res.send(`<script>window.location.replace("./${post_id}");</script>`)
    }
}else{
    if(get.paste.includes("<script>")){
        res.render('./alert', {message: "You cannot host javascript codes",image:"logo.png"})
    }else{
    let iscrypted = false
db.get("posts")
.push({
    id: post_id,
    crypted: iscrypted,
    pass: CryptoJS.AES.encrypt(get.paste, "12345678910").toString()
}).write();
res.send(`<script>window.location.replace("./${post_id}");</script>`)
}
}

})


app.listen(3000)
