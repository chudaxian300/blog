var mysql = require("./database");

exports.HomePage = (start, callback) => {
    var curPage = parseInt(start) || 1;
    var queryStart = (curPage - 1) * 5;
    var queryEnd = curPage * 5;
    var queryArticle = "SELECT * FROM tab_article ORDER BY articleID DESC LIMIT ? , ?";
    var pagesModSqlParams = [queryStart, queryEnd];
    mysql.query(queryArticle, pagesModSqlParams, (err, result, fields) => {
        if (err) {
            console.log(err)
            callback(err)
        }
        var articles = result;
        articles.forEach(e => {
            var year = e.articleTime.getFullYear();
            var month = e.articleTime.getMonth() + 1 > 10 ? e.articleTime.getMonth() : '0' + (e.articleTime.getMonth() + 1);
            var date = e.articleTime.getDate() > 10 ? e.articleTime.getDate() : '0' + e.articleTime.getDate();
            e.articleTime = year + '-' + month + '-' + date;
        });
        callback(null, articles)
    })
}

exports.Paging = (callback) => {
    var queryCount = "SELECT COUNT(*) AS 'articleNum' FROM tab_article";
    mysql.query(queryCount, (err, result) => {
        if (err) {
            console.log(err)
            callback(err)
        }
        var articleNum = result[0].articleNum;
        pageNum = Math.ceil(articleNum / 5);
        callback(null, pageNum)
    })
}

exports.Login = (userInfo, callback) => {
    //接收表单数据
    var userName = userInfo.authorName;
    var password = userInfo.password;
    //搜索数据库
    var query = "SELECT * FROM tab_author WHERE authorName = ? AND authorPassword = ?";
    var modSqlParams = [String(userName), String(password)];
    mysql.query(query, modSqlParams, (err, result) => {
        if (err) {
            console.log(err);
            callback(err, null)
        }
        var user = result[0];
        callback(null, user)
    })
}

exports.Register = (newInfo, callback) => {
    //接收表单数据
    var userName = newInfo.authorName;
    var email = newInfo.email;
    var password = newInfo.password;
    var confir = newInfo.confirmPassword;
    //查询是否重名
    var testQuery = "SELECT COUNT(*) AS 'exist' FROM tab_author WHERE authorName = ?";
    var testModSqlParams = [String(userName)];
    //存入数据库
    var inQuery = "INSERT INTO tab_author (authorName,authorEmail,authorPassword) VALUES (?,?,?)"
    var inModSqlParams = [String(userName), String(email), String(password)];
    //确认两次输入密码是否相同
    if (String(password) != String(confir)) {
        callback(null, true)
        return
    }
    mysql.query(testQuery, testModSqlParams, (err, result) => {
        if (err) {
            console.log(err);
            callback(err)
        }
        var exist = result[0].exist;
        if (exist != 0) {
            callback(null, true)
            return;
        }
        mysql.query(inQuery, inModSqlParams, (err, result) => {
            if (err) {
                console.log(err);
                callback(err)
            }
            callback(null)
        })
    })
}

exports.FindArticle = (id, callback) => {
    var findQuery = "SELECT * FROM tab_article WHERE articleID = ?";
    var findModSqlParams = [id]
    mysql.query(findQuery, findModSqlParams, (err, result) => {
        if (err) {
            console.log(err);
            callback(err)
        }
        var aimArticle = result[0];
        var year = aimArticle.articleTime.getFullYear();
        var month = aimArticle.articleTime.getMonth() + 1 > 10 ? aimArticle.articleTime.getMonth() : '0' + (aimArticle.articleTime.getMonth() + 1);
        var date = aimArticle.articleTime.getDate() > 10 ? aimArticle.articleTime.getDate() : '0' + aimArticle.articleTime.getDate();
        aimArticle.articleTime = year + '-' + month + '-' + date;
        callback(null, aimArticle)
    })
}

exports.Click = (id, callback) => {
    var clickQuery = "UPDATE tab_article SET articleClick = articleClick + 1 WHERE articleID = ?";
    var clickModSqlParams = [id];
    mysql.query(clickQuery, clickModSqlParams, (err, result) => {
        if (err) {
            console.log(err);
            callback(err);
        }
        callback(null);
    })
}

exports.New = (newArticle, callback) => {
    var newQuery = "INSERT INTO tab_article (articleTitle,articleAuthor,articleContent) VALUES (?,?,?)";
    var newModSqlParams = [String(newArticle.title), String(newArticle.articleAuthor), String(newArticle.content)];
    mysql.query(newQuery, newModSqlParams, (err, result) => {
        if (err) {
            console.log(err);
            callback(err);
        }
        callback(null)
    })
}

exports.Edit = (aimArticle, callback) => {
    var editQuery = "UPDATE tab_article SET articleTitle = ? , articleContent = ? WHERE articleID = ?";
    var editModSqlParams = [String(aimArticle.title), String(aimArticle.content), aimArticle.id];
    mysql.query(editQuery, editModSqlParams, (err, result) => {
        if (err) {
            console.log(err);
            callback(err);
        }
        callback(null);
    })
}

exports.Delete = (id, callback) => {
    var deleteQuery = "DELETE FROM tab_article WHERE articleID = ?";
    var deleteModSqlParams = [id];
    mysql.query(deleteQuery, deleteModSqlParams, (err, result) => {
        if (err) {
            console.log(err);
            callback(err);
        }
        callback(null)
    })
}