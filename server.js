const express = require('express');
const path = require('path');
const crypto = require('crypto');
const mongoose = require('mongoose');
const multer = require('multer');
const GridFsStorage = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
//const cors = require('cors');
//const morgan = require('morgan');  
const app = express();

var http = require('http');
var fs = require('fs');
//var data = fs.readFileSync('defcir.json');
//var datamismo = JSON.parse(data);

const mongoURI = 'mongodb://anna:wannabearockstar@ds012678.mlab.com:12678/agtutsdtbs';

const conn = mongoose.createConnection(mongoURI);
mongoose.connect(mongoURI);

 


app.use(express.static(__dirname + '/bootstrapv4'));
app.use(express.static(__dirname + '/images'));
//app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
//app.use(bodyParser.json({ type: 'application/vnd.api+json' }));
app.use(methodOverride('_method'));
//app.use(cors());


//add headers
app.use(function (req, res, next) {
    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');
    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);
    // Pass to next layer of middleware
    next();
});


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
           return res.render('index', {files: false});
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

// tutorials for app to get
app.get('/api/intall', function(req, res) {
    console.log("fetching intro tutorial");
    // use mongoose to get all reviews in the database
    tutmod.find({ $and: [ { topic: "cir" }, { lesson: "int" } ] }).sort( { num: 1 } )
        .then(function(err, introtuts) {
        // if there is an error retrieving, send the error. nothing after res.send(err) will execute
        if (err)
        return res.send(err)
        res.json(introtuts); // return all reviews in JSON format
    });
});

app.get('/api/defcir', function(req, res) {
    console.log("fetching defcir");
    tutmod.find({ $and: [ { topic: "cir" }, { lesson: "def" } ] }).sort( { num: 1 } )
        .then(function(err, defcir) {
        if (err)
        return res.send(err)
        res.json(defcir);
    });
});
app.get('/api/solcir', function(req, res) {
    console.log("fetching solcir");
    tutmod.find({ $and: [ { topic: "cir" }, { lesson: "sol" } ] }).sort( { num: 1 } )
        .then(function(err, solcir) {
        if (err)
        return res.send(err)
        res.json(solcir);
    });
});
app.get('/api/defpar', function(req, res) {
    console.log("fetching defpar");
    tutmod.find({ $and: [ { topic: "par" }, { lesson: "def" } ] }).sort( { num: 1 } )
        .then(function(err, defpar) {
        if (err)
        return res.send(err)
        res.json(defpar);
    });
});
app.get('/api/solpar', function(req, res) {
    console.log("fetching solpar");
    tutmod.find({ $and: [ { topic: "par" }, { lesson: "sol" } ] }).sort( { num: 1 } )
        .then(function(err, solpar) {
        if (err)
        return res.send(err)
        res.json(solpar);
    });
});
app.get('/api/defell', function(req, res) {
    console.log("fetching defell");
    tutmod.find({ $and: [ { topic: "ell" }, { lesson: "def" } ] }).sort( { num: 1 } )
        .then(function(err, defell) {
        if (err)
        return res.send(err)
        res.json(defell);
    });
});
app.get('/api/solell', function(req, res) {
    console.log("fetching solell");
    tutmod.find({ $and: [ { topic: "ell" }, { lesson: "sol" } ] }).sort( { num: 1 } )
        .then(function(err, solell) {
        if (err)
        return res.send(err)
        res.json(solell);
    });
});
app.get('/api/defhyp', function(req, res) {
    console.log("fetching defhyp");
    tutmod.find({ $and: [ { topic: "hyp" }, { lesson: "def" } ] }).sort( { num: 1 } )
        .then(function(err, defhyp) {
        if (err)
        return res.send(err)
        res.json(defhyp);
    });
});
app.get('/api/solhyp', function(req, res) {
    console.log("fetching solhyp");
    tutmod.find({ $and: [ { topic: "hyp" }, { lesson: "sol" } ] }).sort( { num: 1 } )
        .then(function(err, solhyp) {
        if (err)
        return res.send(err)
        res.json(solhyp);
    });
});
// quizzes for app to get
app.get('/api/cirquiz', function(req, res) {
    console.log("fetching cirquiz");
    quizmod.find({ topic: "cir" }).sort( { num: 1 } )
        .then(function(err, cirquizzes) {
        if (err)
        return res.send(err)
        res.json(cirquizzes); 
    });
});
app.get('/api/parquiz', function(req, res) {
    console.log("fetching parquiz");
    quizmod.find({ topic: "par" }).sort( { num: 1 } )
        .then(function(err, parquizzes) {
        if (err)
        return res.send(err)
        res.json(parquizzes); 
    });
});
app.get('/api/ellquiz', function(req, res) {
    console.log("fetching ellquiz");
    quizmod.find({ topic: "ell" }).sort( { num: 1 } )
        .then(function(err, ellquizzes) {
        if (err)
        return res.send(err)
        res.json(ellquizzes); 
    });
});
app.get('/api/hypquiz', function(req, res) {
    console.log("fetching hypquiz");
    quizmod.find({ topic: "hyp" }).sort( { num: 1 } )
        .then(function(err, hypquizzes) {
        if (err)
        return res.send(err)
        res.json(quizzes); 
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
           
      });
  
  });

app.get('/edituts', function(req, res, next) {
    tutmod.find({ $and: [ { topic: "cir" }, { lesson: "def" } ] })
      .then(function(doc) {
         
        res.render('pages/edituts', {items: doc});
            
      });
  
  });


app.get('/solcir', function(req, res, next) {
  tutmod.find({ $and: [ { topic: "cir" }, { lesson: "sol" } ] })
    .then(function(doc) {
    res.render('pages/solcir', {items: doc});

    });
});
app.get('/defpar', function(req, res, next) {
  tutmod.find({ $and: [ { topic: "par" }, { lesson: "def" } ] })
    .then(function(doc) {
        //console.log(doc);
    res.render('pages/defpar', {items: doc});
      
    });
});

app.get('/solpar', function(req, res, next) {
  tutmod.find({ $and: [ { topic: "par" }, { lesson: "sol" } ] })
    .then(function(doc) {
    res.render('pages/solpar', {items: doc});
      
    });
});
app.get('/defell', function(req, res, next) {
  tutmod.find({ $and: [ { topic: "ell" }, { lesson: "def" } ] })
    .then(function(doc) {
    res.render('pages/defell', {items: doc});

    });
});
app.get('/solell', function(req, res, next) {
  tutmod.find({ $and: [ { topic: "ell" }, { lesson: "sol" } ] })
    .then(function(doc) {
    res.render('pages/solell', {items: doc});
    
    });
});
app.get('/defhyp', function(req, res, next) {
  tutmod.find({ $and: [ { topic: "hyp" }, { lesson: "def" } ] })
    .then(function(doc) {
    res.render('pages/defhyp', {items: doc});

    });
});
app.get('/solhyp', function(req, res, next) {
  tutmod.find({ $and: [ { topic: "hyp" }, { lesson: "sol" } ] })
    .then(function(doc) {
    res.render('pages/solhyp', {items: doc});

    });
});

//quiz
app.get('/editquiz', function(req, res, next) {
  quizmod.find({ topic: "cir" })
    .then(function(doc) {
    res.render('pages/editquiz', {items: doc});

    });
});
app.get('/quizpar', function(req, res, next) {
    quizmod.find({ topic: "par" })
    .then(function(doc) {
    res.render('pages/quizpar', {items: doc});

    });
});
app.get('/quizell', function(req, res, next) {
    quizmod.find({ topic: "ell" })
    .then(function(doc) {
    res.render('pages/quizell', {items: doc});

    });
});
app.get('/quizhyp', function(req, res, next) {
    quizmod.find({ topic: "hyp" })
    .then(function(doc) {
    res.render('pages/quizhyp', {items: doc});

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

app.post('/update', function(req, res, next) {
    var id = req.body.id;
    tutmod.findById(id, function(err, data) {
        if (!id || id.length === 0){
            return res.status(404).json({
                err: 'no entry exists'
            });
        }else{
            data.type = req.body.type,
            data.topic = req.body.topic,
            data.lesson = req.body.lesson,
            data.content = req.body.content,
            data.num = req.body.num
            data.save();

            if (req.body.topic == 'cir' && req.body.lesson == 'def'){
                return res.redirect('/edituts');
             }else if (req.body.topic == 'cir' && req.body.lesson == 'sol'){
                return res.redirect('/solcir');
             }else if (req.body.topic == 'par' && req.body.lesson == 'def'){
                return res.redirect('/defpar');
            }else if (req.body.topic == 'par' && req.body.lesson == 'sol'){
                return res.redirect('/solpar');
            }else if (req.body.topic == 'ell' && req.body.lesson == 'def'){
                return res.redirect('/defell');
            }else if (req.body.topic == 'ell' && req.body.lesson == 'sol'){
                return res.redirect('/solell');
            }else if (req.body.topic == 'hyp' && req.body.lesson == 'def'){
                return res.redirect('/defhyp');
            }else if (req.body.topic == 'hyp' && req.body.lesson == 'sol'){
                return res.redirect('/solhyp');
            }else if (req.body.topic == 'cir' && req.body.lesson == 'int'){
                return res.redirect('/intuts');
            }
        }
        
    });

 
});

app.post('/updatequiz', function(req, res, next) {
    var id = req.body.id;
    quizmod.findById(id, function(err, data) {
        if (!id || id.length === 0){
            return res.status(404).json({
                err: 'no entry exists'
            });
        }else{
            
            data.topic = req.body.topic,
            data.question = req.body.question,
            data.choice1 = req.body.choice1,
            data.choice2 = req.body.choice2,
            data.choice3 = req.body.choice3,
            data.choice4 = req.body.choice4,
            data.num = req.body.num,
           
            data.save();

            if (req.body.topic == 'cir'){
                return res.redirect('/editquiz');
            }else if (req.body.topic == 'par'){
                return res.redirect('/quizpar');
            }else if (req.body.topic == 'ell'){
                return res.redirect('/quizell');
            }else if (req.body.topic == 'hyp'){
                return res.redirect('/quizhyp');
            }
        }
        
    });

 
});


app.post('/insertquiz', function(req, res, next) {
        var item = {
        topic: req.body.topic, //cir/par/ell/hyp
        question: req.body.question,
        choice1: req.body.choice1,
        choice2: req.body.choice2,
        choice3: req.body.choice3,
        choice4: req.body.choice4,
        num: req.body.num,
       
    };
  
    var data = new quizmod(item);
    data.save();
      
    res.redirect('/editquiz');
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
app.get('/data/:filename', (req, res) => {
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

app.get('/:_id', (req, res, next) => {
    tutmod.findOne({ _id: req.params._id }, (err, id) => {
        if (!id || id.length === 0){
            return res.status(404).json({
                err: 'no entry exists'
            });
        }else{
            var id2 = id._id;
            var co = id.content;
            var ty = id.type;
            var to = id.topic;
            var le = id.lesson;
            var nu = id.num;
            
            //return res.json(id.type);
           return res.render('pages/inpututs', {idy: id2, content: co, type: ty, top: to, less: le, num: nu});
        
        }
        });
        
});

app.get('quiz/:_id', (req, res, next) => {
    quizmod.findOne({ _id: req.params._id }, (err, id) => {
        if (!id || id.length === 0){
            return res.status(404).json({
                err: 'no entry exists'
            });
        }else{
            var id2 = id._id;
            var to = id.topic;
            var qu = id.question;
            var c1 = id.choice1;
            var c2 = id.choice2;
            var c3 = id.chocie3;
            var c4 = id.choice4;
            var nu = id.num;
            
            //return res.json(id.type);
           return res.render('pages/updatequiz', {idy: id2, topic: to, question: qu, choice1: c1, choice2: c2, choice3: c3, choice4: c4, num: nu});
        
        }
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
