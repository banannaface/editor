const express = require('express');
const path = require('path');
const crypto = require('crypto');
const mongoose = require('mongoose');
const multer = require('multer');
const GridFsStorage = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const app = express();

var http = require('http');
var fs = require('fs');
//var data = fs.readFileSync('defcir.json');
//var datamismo = JSON.parse(data);


 

//app.use(morgan('dev'));
app.use(express.static(__dirname + '/bootstrapv4'));
app.use(express.static(__dirname + '/images'));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(methodOverride('_method'));
//app.use(cors());
 
const mongoURI = 'mongodb://anna:wannabearockstar@ds012678.mlab.com:12678/agtutsdtbs';

const conn = mongoose.createConnection(mongoURI);

mongoose.connect(mongoURI);
var Schema = mongoose.Schema;

var tuts = new Schema({
    type: {type: String, required: true},//para/title
    topic: {type: String, required: true}, //cir/par/ell/hyp
    lesson: {type: String, required: true},//def/sol
    content: {type: String, required: true},//content
    num: Number//pangilan
}, {collection: 'tutorial'});

var quiz = new Schema({
    topic: {type: String, required: true}, //cir/par/ell/hyp
    question: {type: String, required: true},
    choice1: {type: String, required: true},
    choice2: {type: String, required: true},
    choice3: String,
    choice4: String,
    num: Number//pangilan
}, {collection: 'quiz'});

var tutmod = mongoose.model('tutorial', tuts);
var quizmod = mongoose.model('quiz', quiz);

let gfs;


conn.once('open', () => {

    gfs = Grid(conn.db, mongoose.mongo);
    gfs.collection('uploads');
 
})

const storage = new GridFsStorage({
    url: mongoURI,
    file: (req, file) => {
        return new Promise((resolve, reject) => {
            crypto.randomBytes(16, (err,buf) => {
                if (err) {
                    return reject(err);
                }
                const filename = buf.toString('hex') + path.extname(file.originalname);
                const fileInfo = {
                    filename: filename,
                    bucketName: 'uploads'
                };
                resolve(fileInfo);
            });
        });
    }
})
const upload = multer({ storage });

app.set('view engine', 'ejs');

app.get('/', (req, res) => {
 
    gfs.files.find().toArray((err, files) => {
        //check if there are files
        if (!files || files.length === 0) {
            res.render('index', {files: false});
        }else{
            files.map(file => {
                if (file.contentType === 'image/jpeg' || file.contentType === 'image/png' || file.contentType === 'image/jpg' || file.contentType === 'image/gif'){
                    file.isImage = true;
                }else{
                    file.isImage = false;
                }
            });
            res.render('index', {files: files});
        }

        
    });
 
});

// about page 
app.get('/api/tutorials', function(req, res) {

    console.log("fetching tutorials");

    // use mongoose to get all reviews in the database
    tutmod.find(function(err, tutorials) {

        // if there is an error retrieving, send the error. nothing after res.send(err) will execute
        if (err)
            res.send(err)

        res.json(tutorials); // return all reviews in JSON format
    });
});


app.get('/about', function(req, res) {
    res.render('pages/about');
});

app.get('/inpututs', function(req, res) {
    res.render('pages/inpututs');
});
app.get('/inputquiz', function(req, res) {
    res.render('pages/inputquiz');
});

//@route POST /upload 

app.get('/intuts', function(req, res, next) {
    tutmod.find({ $and: [ { topic: "cir" }, { lesson: "int" } ] })
      .then(function(doc) {
         
            res.render('pages/intuts', {items: doc});
            
            var bytedata = JSON.stringify(doc, null, 2);
            fs.writeFile('intuts.json', bytedata, finished);

            function finished(err){
                console.log('all set');
            }
      });
  
  });

app.get('/edituts', function(req, res, next) {
    tutmod.find({ $and: [ { topic: "cir" }, { lesson: "def" } ] })
      .then(function(doc) {
         
            res.render('pages/edituts', {items: doc});
            
            var bytedata = JSON.stringify(doc, null, 2);
            fs.writeFile('defcir.json', bytedata, finished);

            function finished(err){
                console.log('all set');
            }
      });
  
  });


app.get('/solcir', function(req, res, next) {
  tutmod.find({ $and: [ { topic: "cir" }, { lesson: "sol" } ] })
    .then(function(doc) {
    res.render('pages/solcir', {items: doc});

        var bytedata = JSON.stringify(doc, null, 2);
        fs.writeFile('solcir.json', bytedata, finished);

        function finished(err){
            console.log('all set');
        }
    });
});
app.get('/defpar', function(req, res, next) {
  tutmod.find({ $and: [ { topic: "par" }, { lesson: "def" } ] })
    .then(function(doc) {
        //console.log(doc);
    res.render('pages/defpar', {items: doc});
        var bytedata = JSON.stringify(doc, null, 2);
        fs.writeFile('defpar.json', bytedata, finished);

        function finished(err){
            console.log('all set');
        }

    });
});

app.get('/solpar', function(req, res, next) {
  tutmod.find({ $and: [ { topic: "par" }, { lesson: "sol" } ] })
    .then(function(doc) {
    res.render('pages/solpar', {items: doc});
        var bytedata = JSON.stringify(doc, null, 2);
        fs.writeFile('solpar.json', bytedata, finished);

        function finished(err){
            console.log('all set');
        }   
    });
});
app.get('/defell', function(req, res, next) {
  tutmod.find({ $and: [ { topic: "ell" }, { lesson: "def" } ] })
    .then(function(doc) {
    res.render('pages/defell', {items: doc});

        var bytedata = JSON.stringify(doc, null, 2);
        fs.writeFile('defell.json', bytedata, finished);

        function finished(err){
            console.log('all set');
        }   
    });
});
app.get('/solell', function(req, res, next) {
  tutmod.find({ $and: [ { topic: "ell" }, { lesson: "sol" } ] })
    .then(function(doc) {
    res.render('pages/solell', {items: doc});
        var bytedata = JSON.stringify(doc, null, 2);
        fs.writeFile('solell.json', bytedata, finished);

        function finished(err){
            console.log('all set');
        }   
    });
});
app.get('/defhyp', function(req, res, next) {
  tutmod.find({ $and: [ { topic: "hyp" }, { lesson: "def" } ] })
    .then(function(doc) {
    res.render('pages/defhyp', {items: doc});

        var bytedata = JSON.stringify(doc, null, 2);
        fs.writeFile('defhyp.json', bytedata, finished);

        function finished(err){
            console.log('all set');
        }   
    });
});
app.get('/solhyp', function(req, res, next) {
  tutmod.find({ $and: [ { topic: "hyp" }, { lesson: "sol" } ] })
    .then(function(doc) {
    res.render('pages/solhyp', {items: doc});

        var bytedata = JSON.stringify(doc, null, 2);
        fs.writeFile('solhyp.json', bytedata, finished);

        function finished(err){
            console.log('all set');
        }   
    });
});

//quiz
app.get('/editquiz', function(req, res, next) {
  tutmod.find({ topic: "cir" })
    .then(function(doc) {
    res.render('pages/editquiz', {items: doc});

        var bytedata = JSON.stringify(doc, null, 2);
        fs.writeFile('quizcir.json', bytedata, finished);

        function finished(err){
            console.log('all set');
        }   
    });
});
app.get('/quizpar', function(req, res, next) {
  tutmod.find({ topic: "par" })
    .then(function(doc) {
    res.render('pages/quizpar', {items: doc});

        var bytedata = JSON.stringify(doc, null, 2);
        fs.writeFile('quizpar.json', bytedata, finished);

        function finished(err){
            console.log('all set');
        }   
    });
});
app.get('/quizell', function(req, res, next) {
  tutmod.find({ topic: "ell" })
    .then(function(doc) {
    res.render('pages/quizell', {items: doc});

        var bytedata = JSON.stringify(doc, null, 2);
        fs.writeFile('quizell.json', bytedata, finished);

        function finished(err){
            console.log('all set');
        }   
    });
});
app.get('/quizhyp', function(req, res, next) {
  tutmod.find({ topic: "hyp" })
    .then(function(doc) {
    res.render('pages/quizhyp', {items: doc});

        var bytedata = JSON.stringify(doc, null, 2);
        fs.writeFile('quizhyp.json', bytedata, finished);

        function finished(err){
            console.log('all set');
        }   
    });
});
//insert
app.post('/insert', function(req, res, next) {
  var item = {
    type: req.body.type,
    topic: req.body.topic,
    lesson: req.body.lesson,
    content: req.body.content,
    num: req.body.num
  };

  var data = new tutmod(item);
  data.save();
    
  res.redirect('/edituts');
});
//@route POST /upload 
app.post('/upload', upload.single('file'), (req, res) =>{
    //res.json({ file: req.file });
    res.redirect('/pages');
});

//@route GET /files
// display all files in json
app.get('/files', (req, res) => {
    gfs.files.find().toArray((err, files) => {
        //check if there are files
        if (!files || files.length === 0) {
            return res.status(404).json({
                err: 'No files exist'
            });
        }

        //file exist
        return res.json(files);
    });
});

//@route GET /files/:filename
// display single file
app.get('/files/:filename', (req, res) => {
    gfs.files.findOne({filename: req.params.filename}, (err, file) => {
        //check if there are files
        if (!file || file.length === 0) {
            return res.status(404).json({
                err: 'No file exists'
            });
        }

        //file exist
        return res.json(file);
    });
});

//@route GET /image/:filename
// display image
app.get('/image/:filename', (req, res) => {
    gfs.files.findOne({filename: req.params.filename}, (err, file) => {
        //check if there are files
        if (!file || file.length === 0) {
            return res.status(404).json({
                err: 'No file exists'
            });
        }

        //check if image
        if (file.contentType === 'image/jpeg' || file.contentType === 'image/png' || file.contentType === 'image/jpg' || file.contentType === 'image/gif'){
            //read output to browser
            const readstream = gfs.createReadStream(file.filename);
            readstream.pipe(res);
        }else{
            res.status(404).json({
                err: 'Not an image'
            });
        }
    });
});

//@route delete /files/:id
//desc delete file
app.delete('/files/:id', (req, res) => {
    gfs.remove({ _id: req.params.id, root: 'uploads' }, (err, GridStore) => {
        if (err) {
            return res.status(404).json({ err: err });
        }

        res.redirect('/');
    });
});

var port = process.env.PORT || 5000;

app.listen(port, function() {
  console.log('Listening on ' + port);
});
/*app.set('port', process.env.PORT || 22);const port = 5000;
app.set('host', process.env.HOST || '13.92.60.20');

http.createServer(app).listen(app.get('port'), app.get('host'), function(){
    console.log("Express server listening on port " + app.get('port'));
});
app.listen(process.env.PORT || 5000);
app.listen(port, () => 
    console.log(`Server started on port ${port}`)
);*/
