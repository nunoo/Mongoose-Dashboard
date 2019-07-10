const express = require('express');
const app = express();
const server = app.listen(9000);
const io = require('socket.io')(server);
var path = require("path");
var bodyParser = require('body-parser');
var session = require('express-session');
const flash = require('express-flash')
var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/dashboard', {
    useNewUrlParser: true
});
mongoose.Promise = global.Promise;

app.use(express.static(__dirname + "/static"));
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(flash());

app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(session({
    secret: "Over 9000!",
    saveUninitialized: true,
    resave: true,
    cookie: {
        maxAge: 60000
    }
}))

var AnimalSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: 2
    },
    food: {
        type: String,
        required: true,
        minlength: 2
    },
    species: {
        type: String,
        required: true,
        minlength: 2
    }
}, {
    timestamps: true
})
mongoose.model('Animal', AnimalSchema);
var Animal = mongoose.model('Animal');


app.get('/', (req, res) => {
    Animal.find({}, (err, animals) => {
        if (err) {
            console.log('error!!!!', err)
        } else {
            console.log(animals)
            res.render('index', {
                animals: animals
            })
        }
    })
})

app.get('/show/:id', (req, res) => {
    Animal.findById(req.params.id, (err, animals) => {
        if (err) {
            console.log('error!!!!', err)
        } else {
            console.log(animals)
            res.render('show', {
                animals: animals
            })
        }
    })
})

app.get('/new', (req, res) => {
    res.render('add')
})

app.post('/new', (req, res) => {
    console.log('POST DATA', req.body);
    var animals = new Animal({
        name: req.body.name,
        food: req.body.food,
        species: req.body.species,
    }, {
        timestamps: req.body.createdAt
    });
    animals.save((err) => {
        if (err) {
            console.log('something went wrong', err)
            for (var key in err.errors) {
                req.flash('reg', err.errors[key].message)
            }
            res.redirect('/new')
        } else {
            console.log('successfully added a quote')
            res.redirect('/')
        }
    })
})

app.get('/edit/:id', (req, res) => {
    Animal.findById(req.params.id, (err, animals) => {
        if (err) {
            console.log('error!!!!', err)
        } else {
            console.log(animals)
            res.render('edit', {
                animals: animals
            })
        }
    })
})

app.post('/edit/:id', (req, res) => {
    var update = {
        name: req.body.name,
        species: req.body.species,
        food: req.body.food,
        updatedAt: Date.now()
    }
    Animal.findByIdAndUpdate(req.params.id, update, (err, animals) => {
        if (err) {
            console.log('something went wrong', err)
            for (var key in err.errors) {
                req.flash('reg', err.errors[key].message)
            }
            res.redirect('/new')
        } else {
            console.log('successfully added a animal')
            res.redirect('/')
        }
    })
})

app.get('/delete/:id', (req, res) => {
    Animal.findByIdAndRemove(req.params.id, (err) => {
        if (err) {
            console.log('error!!!!', err)
            res.redirect('/')
        } else {
            res.redirect('/')
        }
    })
})