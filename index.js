//FrameWorks
//teste
const low = require('lowdb')
var CryptoJS = require("crypto-js");
const express = require("express");
const app = express();
const handlebars = require("express-handlebars");
const bodyParser = require("body-parser")
const rg = require('rangen');

// Configurações banco de dados
const FileSync = require("lowdb/adapters/FileSync");
const { use } = require('express/lib/application');
const adapter = new FileSync("database/server.json");
const db = low(adapter);

// Configurações de renderização 

var handle = handlebars.create({
    defaultLayout: 'main'
});

app.use(express.static('public'));
app.use('/images', express.static('images'));
app.engine('handlebars', handle.engine);

app.set('view engine', 'handlebars');
// Configurações BodyParser
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

// Rotas
app.use('/uploads', express.static(__dirname + '/public'));

// Pagina Login
app.get('/', function (req, res) {
    res.render('./create')

})
app.get('/alert', function (req, res) {
    res.render('./alert')
})
app.get('/paste', function (req, res) {
    res.render('./alert', {message: "You need to enter a post ID in URL",image:"sorry.png"})
})
app.get('/paste/:value', function (req, res) {
    if (db.get('posts')
    .some(post => post.id === req.params.value)
    .value() === true) {
        let post = db
        .get("posts")
        .find({ id: req.params.value })
        .value()
      if(post.crypted === true){
       res.render("./verification",{title: post.title,camin:post.id})
       app.post(`/paste/${req.params.value}`, function (req, res){
        var base_paste = CryptoJS.AES.decrypt(post.pass, req.body.password)
        base_paste.toString(CryptoJS.enc.Utf8)
        if(base_paste.toString(CryptoJS.enc.Utf8) === ""){
            res.render('./alert', {message: "Decryption failed, check the entered password",image:"wrong_pass.png"})
        }else{

     
        res.render('./view', {paste: base_paste.toString(CryptoJS.enc.Utf8),title:post.title})
    }
       })
      }else{
          console.log(post.id)
        var base_paste = CryptoJS.AES.decrypt(post.pass, "12345678910")
         base_paste.toString(CryptoJS.enc.Utf8)
         console.log(base_paste.toString(CryptoJS.enc.Utf8))
          res.render('./view', {paste: base_paste.toString(CryptoJS.enc.Utf8),title:post.title})
      }
    }
   // res.render('./form_pass')
})
app.post('/view', function (req, res) {

})
app.post('/save', function (req, res) {
    let get = req.body
    const post_id = rg.id({length: 5, charSet: 'alphanum'});

if(get.check === "true"){
    if(get.paste.includes("<script>")){
        res.render('./alert', {message: "You cannot host javascript codes",image:"sorry.png"})
    }else{
console.log("ENCRIPTA")
let iscrypted = true
db.get("posts")
.push({
    id: post_id,
    title: get.author,
    crypted: iscrypted,
    pass: CryptoJS.AES.encrypt(get.paste, get.cryptpass).toString()

}).write();
res.send(`<script>window.location.replace("./paste/${post_id}");</script>`)
    }
}else{
    if(get.paste.includes("<script>")){
        res.render('./alert', {message: "You cannot host javascript codes",image:"sorry.png"})
    }else{
    console.log("Não ENCRIPTA")
    console.log(get.paste)
    let iscrypted = false
db.get("posts")
.push({
    id: post_id,
    title: get.author,
    crypted: iscrypted,
    pass: CryptoJS.AES.encrypt(get.paste, "12345678910").toString()
}).write();
res.send(`<script>window.location.replace("./paste/${post_id}");</script>`)
}
}

})
// Respostas servidor
const port = 3000;
app.listen(process.env.PORT || port, () => console.log(`Running http://localhost:${port}`));
