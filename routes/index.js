var express = require('express');
var mysql = require("./../database");
var OrgAPI = require("../orgAPI");
const { render } = require('../app');
const { use } = require('./users');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
  OrgAPI.HomePage(req.query.page || 1, (err, data) => {
    if (err) {
      return res.status(500)
    }
    OrgAPI.Paging((err, pageNum) => {
      if (err) {
        return res.status(500)
      }
      var username = req.session.user == undefined ? req.session.user : req.session.user.authorName;
      var admin = req.session.user == undefined ? 0 : req.session.user.admin;
      var authorName = req.session.user == undefined ? 'visitor' : req.session.user.authorName;
      console.log(req.session.user)
      console.log(admin)
      res.render('index', {
        articles: data,
        user: req.session.user,
        admin: admin,
        authorName: authorName,
        username: username,
        pageNum: pageNum,
        page: req.query.id || 1
      })
    })
  })
})

router.get("/login", (req, res, next) => {
  res.render("login", {
    message: '',
    regmessage: ''
  });
})

router.post("/login", (req, res, next) => {
  OrgAPI.Login(req.body, (err, data) => {
    if (err) {
      return res.status(500);
    } else if (data === undefined) {
      res.render('login', {
        message: '用户名或密码错误',
        regmessage: ''
      })
      return;
    }
    req.session.user = data;
    res.redirect('/')
  })
})

router.post("/register", (req, res, next) => {
  OrgAPI.Register(req.body, (err, exist) => {
    if (err || exist) {
      res.render('login', {
        regmessage: '注册失败:用户名已存在或两次密码输入不一致',
        message: ''
      })
      return
    }
    req.session.user = req.body;
    res.redirect("/")
  })
})

router.get("/articles/show", (req, res, next) => {
  OrgAPI.FindArticle(req.query.id, (err, data) => {
    if (err) {
      return res.status(500);
    }
    OrgAPI.Click(data.articleID, (err) => {
      if (err) {
        return res.status(500);
      }
    })
    var username = req.session.user == undefined ? req.session.user : req.session.user.authorName;
    console.log(req.session.user)
    res.render('article', {
      article: data,
      user: req.session.user,
      username: username
    })
  })
})

router.get("/article/new", (req, res, next) => {
  var user = req.session.user;
  if (!user) {
    res.redirect('/login')
    return;
  }
  res.render('new', {
    user: req.session.user,
    username: req.session.user.authorName
  });
})

router.post("/article/new", (req, res, next) => {
  req.body.articleAuthor = req.session.user.authorName;
  OrgAPI.New(req.body, (err) => {
    if (err) {
      return res.status(500);
    }
    res.redirect('/');
  })
})

router.get('/friends', (req, res, next) => {
  res.render("friends", {
    user: req.session.user,
    username: req.session.user.authorName
  });
})

router.get('/about', (req, res, next) => {
  res.render("about", {
    user: req.session.user,
    username: req.session.user.authorName
  });
})

router.get('/logout', (req, res, next) => {
  req.session.user = null;
  res.redirect('/');
})

router.get('/article/edit', (req, res, next) => {
  var user = req.session.user;
  if (!user) {
    res.redirect("/login");
    return;
  }
  OrgAPI.FindArticle(req.query.id, (err, data) => {
    if (err) {
      return res.status(500);
    }
    res.render('edit', {
      user: user,
      title: data.articleTitle,
      content: data.articleContent,
      id: req.query.id,
      username: req.session.user.authorName
    })
  })
})

router.post('/article/edit', (req, res, next) => {
  OrgAPI.Edit(req.body, (err) => {
    if (err) {
      return res.status(500);
    }
    res.redirect('/')
  })
})

router.get('/article/delete', (req, res, next) => {
  var user = req.session.user;
  if (!user) {
    res.redirect("/login");
    return;
  }
  OrgAPI.Delete(req.query.id, (err) => {
    if (err) {
      return res.status(500);
    }
    res.redirect('/');
  })
})

module.exports = router;