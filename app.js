'use strict'
const vocation_sorcerer = [1, 5, 9];
const vocation_druid = [2, 6, 10];
const vocation_pally = [3, 7, 11];
const vocation_knight = [4, 8, 12];

const prem_item = {
  housenka: {
    id: 5,
    price: 15,
    storageValue: 10007,
    vocation: vocation_sorcerer
  },
  fire_doublet: {
    id: 6,
    price: 15,
    storageValue: 10007,
    vocation: vocation_sorcerer
  },
  aura_wand: {
    id: 7,
    price: 15,
    storageValue: 10007,
    vocation: vocation_sorcerer
  },
  aura_pox: {
    id: 8,
    price: 15,
    storageValue: 10007,
    vocation: vocation_druid
  },
  hyakka: {
    id: 9,
    price: 15,
    storageValue: 10007,
    vocation: vocation_druid
  },
  grav_mas: {
    id: 10,
    price: 15,
    storageValue: 100070,
    vocation: vocation_druid
  },
  aura_rod: {
    id: 11,
    price: 15,
    storageValue: 100071,
    vocation: vocation_druid
  },
  uber_exori: {
    id: 12,
    price: 15,
    storageValue: 100072,
    vocation: vocation_knight
  },
  ezzori: {
    id: 13,
    price: 15,
    storageValue: 100073,
    vocation: vocation_knight
  },
  aura_sword: {
    id: 14,
    price: 15,
    storageValue: 100074,
    vocation: vocation_knight
  },
  exori_song: {
    id: 17,
    price: 15,
    storageValue: 100077,
    vocation: vocation_pally
  },
  rasenshuriken: {
    id: 18,
    price: 15,
    storageValue: 100078,
    vocation: vocation_pally
  },
  karamatsu: {
    id: 19,
    price: 15,
    storageValue: 100079,
    vocation: vocation_pally
  },
  aura_bow: {
    id: 20,
    price: 15,
    storageValue: 100070,
    vocation: vocation_pally
  },
  slicing_wind: {
    id: 21,
    price: 15,
    storageValue: 100071
  },
  change_corpse: {
    id: 22,
    price: 15,
    storageValue: 100072
  },
  anti_exiva: {
    id: 23,
    price: 15,
    storageValue: 100073
  },
  full_aura: {
    id: 26,
    price: 15,
    storageValue: 100076
  }
};

var conf = require('./configure.js');

const cors = require('cors')
const express = require('express')
const bodyParser = require('body-parser')
const crypto = require('crypto')
const session = require('express-session')
const path = require('path');
var jsonParser = bodyParser.json();

// Create a new instance of express
const app = express()

// Tell express to use the body-parser middleware and to not parse extended bodies
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(__dirname + '/frontend'));
app.use(cors());

app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    maxAge: 600000
  }
}))

function sha1(data) {
  return crypto.createHash("sha1").update(data, "binary").digest("hex");
}

// Tell our app to listen on port 3000
app.listen(3000, function (err) {
  if (err) {
    throw err
  }

  console.log('Server started on port 3000')
})

//Requests
app.get('/home', (req, res) => {
  if(!req.session.email || !req.session.password){
    res.sendFile(path.join(__dirname + '/frontend/shop.html'));
  } else {
    res.render(path.join(__dirname + '/frontend/shop_loged.ejs'), {message: req.session.credits});
  }
})

app.post('/select_player', (req, res) => {
  if(!req.session.email || !req.session.password){
    res.sendFile(path.join(__dirname + '/frontend/shop.html'));
  } else {
    req.session.iditem = req.body.buy_id;

    res.sendFile(path.join(__dirname + '/frontend/select_player.html'));
  }
})

app.post('/buyitem', function (req, res) {
  if(!req.session.email || !req.session.password || !req.session.iditem) {
    res.redirect('/home');
    return;
  }
  
  res.set('Content-Type', 'text/plain')

  conf.con.query("SELECT id FROM ACCOUNTS WHERE name = '" + req.session.email + "' and password = '" + req.session.password + "'", function( err, result, fields){
      if(err) throw err;

      if(result.length){
        conf.con.query('SELECT id, name FROM PLAYERS WHERE account_id = ' + result[0].id, function(err, pResult){
          res.send(pResult);
        });
      }
  });
})

app.get('/login', (req, res) => {
  res.render(path.join(__dirname + '/frontend/login.ejs'), { message: null });
})

app.post('/login', (req, res) => {
  conf.con.query("SELECT id, credits FROM ACCOUNTS WHERE name = '" + req.body.email + "' and password = '" + sha1(req.body.password) + "'", function( err, result, fields){
    if(result.length){
      req.session.email = req.body.email;
      req.session.password = sha1(req.body.password);
      req.session.credits = result[0].credits;

      res.redirect('/home');
    } else {
      req.session.email = null;
      req.session.password = null;

      res.render(path.join(__dirname + '/frontend/login.ejs'), { message: "Usuário e/ou senha incorretos!" });
    }
  });
})

app.get('/', (req, res) => {
  console.log(req.session.email);

  res.redirect('/home');
})

app.get('/logout', (req, res) => {
  req.session.email = null;
  req.session.password = null;
    
  res.redirect('/home');
})

app.post('/makepurch', jsonParser, (req, res) => {
  try {
    if(!req.session.email || !req.session.password || !req.session.iditem) {
      res.redirect('/home');
      return;
    }
  
    var idplayer = req.body.idplayer;
  
    if(!idplayer) return;
  
    WithdrawBasedOnItem(idplayer, req);
  } catch(e){
    throw exception(e);
  }
})

function WithdrawBasedOnItem(idplayer, req){
  switch(Number(req.session.iditem)){
    case prem_item.housenka.id:
      buyItem(Number(idplayer), prem_item.housenka, req);
    break;
    case prem_item.fire_doublet.id:
      buyItem(Number(idplayer), prem_item.fire_doublet, req);
    break;
    case prem_item.aura_wand.id:
      buyItem(Number(idplayer), prem_item.aura_wand, req);
    break;
    case prem_item.aura_pox.id:
      buyItem(Number(idplayer), prem_item.aura_pox, req);
    break;
    case prem_item.hyakka.id:
      buyItem(Number(idplayer), prem_item.hyakka, req);
    break;
    case prem_item.grav_mas.id:
      buyItem(Number(idplayer), prem_item.grav_mas, req);
    break;
    case prem_item.aura_rod.id:
      buyItem(Number(idplayer), prem_item.aura_rod, req);
    break;
    case prem_item.uber_exori.id:
      buyItem(Number(idplayer), prem_item.uber_exori, req);
    break;
    case prem_item.ezzori.id:
      buyItem(Number(idplayer), prem_item.ezzori, req);
    break;
    case prem_item.aura_sword.id:
      buyItem(Number(idplayer), prem_item.aura_sword, req);
    break;
    case prem_item.exori_song.id:
      buyItem(Number(idplayer), prem_item.exori_song, req);
    break;
    case prem_item.rasenshuriken.id:
      buyItem(Number(idplayer), prem_item.rasenshuriken, req);
    break;
    case prem_item.karamatsu.id:
      buyItem(Number(idplayer), prem_item.karamatsu, req);
    break;
    case prem_item.aura_bow.id:
      buyItem(Number(idplayer), prem_item.aura_bow, req);
    break;
    case prem_item.slicing_wind.id:
      buyItem(Number(idplayer), prem_item.slicing_wind, req);
    break;
    case prem_item.change_corpse.id:
      buyItem(Number(idplayer), prem_item.change_corpse, req);
    break;
    case prem_item.anti_exiva.id:
      buyItem(Number(idplayer), prem_item.anti_exiva, req);
    break;
    case prem_item.full_aura.id:
      buyItem(Number(idplayer), prem_item.full_aura, req);
    break;
    default: 
    throw exception('Item não encontrado.');
  }
}

function buyItem(player_id, itemObj, req){
  conf.con.query("SELECT credits FROM ACCOUNTS WHERE name = '" + req.session.email + "' and password = '" + req.session.password + "'", function( err, result, fields){
    if(err) throw err;

    if(!result.length || result[0].credits < itemObj.price){
      throw exception('Você não possui crédito suficiente.');
    }

    conf.con.query("SELECT vocation FROM players WHERE id = " + player_id, function( err, result, fields){
      if(err) throw err;

      if(!result.length || !result[0].vocation) {
        throw exception('A vocação do player selecionado não foi encontrada.');
      };

      if(itemObj.vocation && !itemObj.vocation.includes(result[0].vocation)){
        throw exception('Sua vocação não pode ter essa habilidade.');
      }

      conf.con.query('SELECT * FROM player_storage WHERE player_id = ' + player_id + ' AND `key` = ' + itemObj.storageValue + '', function( err, result){
        if(err) throw err;
    
        if(result.length){
          throw exception('Você já possui este item.');
        }
    
        conf.con.query('INSERT INTO player_storage VALUES (' + player_id + ', ' + itemObj.storageValue + ', 1)', function(err, result){
          if(err) throw err;
    
          conf.con.query('UPDATE accounts SET credits = credits - ' + itemObj.price);
        });
      });
    });
  });
}