const express = require('express');
const bodyParser = require('body-parser');
const app = express();

var async = require("async");
var request = require('request');
var cheerio = require('cheerio');
var fs = require('fs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + '/public'));

app.listen(3000,function(){
  console.log('listening on 3000')
})

app.get('/',function(req,res){
  res.sendFile(__dirname + '/index.html');
});

app.post('/download', (req, res) => {
  console.log(req.body);
  if(req.body.site == 'britannica'){
    var linksNumber = req.body.articlesNumber;
    var pages = [];
    var page =1;
    while(linksNumber>0){
      linksNumber=linksNumber-10;
      pages.push(page);
      console.log(page);
      page++;
    }
    var links= [];
    async.forEachOf(pages,function(singlePage,key,callback){
      var url = 'https://www.britannica.com/search?query=' + req.body.type + '&page=' + singlePage;
      var i = 1;
      request(url,function(err,response,body){
        if(!err && response.statusCode == 200){

          var $ = cheerio.load(body);
          var onCurrentSite = $('div#sr-content a').length;
          var div;
          while(i<=10 && i <= req.body.articlesNumber){
              console.log("*************************************************");
              url = 'https://www.britannica.com' + $("ul li.sr-result:nth-child("+ i +")").children().children().attr('href');
              console.log(url);
              links.push(url);
              i++;
          }
          var k=0;
          async.forEachOf(links,function(link,key,callback){
            request(link,function(subErr,subResponse,bodySubResponse){
              if(!subErr && subResponse.statusCode == 200){
                var $$ = cheerio.load(bodySubResponse);
                var content=" ";
                $$('p','div.md-center-channel').each(function(){
                  content += $(this).text();
                });
                content = content.substr(0,req.body.maxLength);
                var file = __dirname + '/britannica/'+ req.body.type +'/' + key +'.txt';
                console.log('saved');
                fs.writeFileSync(file,content);
                k++;
                callback();
              }
            });
          }, function (err) {
                if (err) console.error(err.message);
              });
        }else{
          console.log(err);
          console.log(response.statusCode);
        }
      });
    }, function (err) {
          if (err) console.error(err.message);
      });
  }else if(req.body.site == 'scholarpedia'){
    var linksNumber = req.body.articlesNumber;
    var pages = [];
    var page =1;
    while(linksNumber>0){
      linksNumber=linksNumber-20;
      pages.push(page);
      console.log(page);
      page++;
    }
    var links= [];
    var offset = 0;
    async.forEachOf(pages,function(singlePage,key,callback){
      url = 'http://www.scholarpedia.org/w/index.php?title=Special:Search&limit=20&offset='+offset+'&redirs=0&profile=default&search=' + req.body.type;
      console.log(url);
      offset = offset + 20;
      var i = 1;
      request(url,function(err,response,body){
        if(!err && response.statusCode == 200){

          var $ = cheerio.load(body);
          while(i<=20 && i <= req.body.articlesNumber){
            console.log("*************************************************");
            url = 'http://www.scholarpedia.org' + $("ul.mw-search-results li:nth-of-type("+ i +")").children().children().attr('href');
            console.log(url);
            links.push(url);
            i++;
          }
          var k=0;
          async.forEachOf(links,function(link,key,callback){
            request(link,function(subErr,subResponse,bodySubResponse){
              if(!subErr && subResponse.statusCode == 200){
                var $$ = cheerio.load(bodySubResponse);
                var content=" ";
                $$('p','div#mw-content-text').each(function(){
                  content += $(this).text();
                });
                content = content.substr(0,req.body.maxLength)
                var file = __dirname + '/scholarpedia/'+ req.body.type +'/' + key +'.txt';
                console.log('saved');
                fs.writeFileSync(file,content);
                k++;
                callback();
              }
            });
          }, function (err) {
                if (err) console.error(err.message);
              });
        }else{
          console.log(err);
          console.log(response.statusCode);
        }
      });
    }, function (err) {
          if (err) console.error(err.message);
      });





    /*request(url,function(err,response,body){
      if(!err && response.statusCode == 200){

        var $ = cheerio.load(body);
        var i = 1;
        var div;
        while(i<=req.body.articlesNumber){
            console.log("*************************************************");
            url = 'http://www.scholarpedia.org' + $("ul.mw-search-results li:nth-of-type("+ i +")").children().children().attr('href');
            console.log(url);
            links.push(url);
            i++;
        }
        var k=0;

        async.forEachOf(links,function(link,key,callback){
          request(link,function(subErr,subResponse,bodySubResponse){
            if(!subErr && subResponse.statusCode == 200){
              var $$ = cheerio.load(bodySubResponse);
              var content=" ";
              $$('p','div#mw-content-text').each(function(){
                content += $(this).text();
              });
              var file = __dirname + '/scholarpedia/'+ req.body.type +'/' + key +'.txt';
              fs.writeFileSync(file,content);
              k++;
              callback();
            }
          });
        }, function (err) {
              if (err) console.error(err.message);
            });
      }else{
        console.log(err);
        console.log(response.statusCode);
      }
    });*/
  }else if(req.body.site == "sciencedaily"){
    var url = 'https://www.sciencedaily.com/search/?keyword=' + req.body.type;
    var links= [];
    request(url,function(err,response,body){
      if(!err && response.statusCode == 200){

        var $ = cheerio.load(body);
        var i = 1;
        var div;
        while(i<=req.body.articlesNumber){
            console.log("*************************************************");
            url = $("div.expansionArea a:nth-of-type("+ i +")").attr('href');
            console.log(url);
            links.push(url);
            i++;
        }
        var k=0;

        async.forEachOf(links,function(link,key,callback){
          request(link,function(subErr,subResponse,bodySubResponse){
            if(!subErr && subResponse.statusCode == 200){
              var $$ = cheerio.load(bodySubResponse);
              var content=" ";
              $$('p','div#mw-content-text').each(function(){
                content += $(this).text();
              });
              var file = __dirname + '/sciencedaily/'+ req.body.type +'/' + key +'.txt';
              fs.writeFileSync(file,content);
              k++;
              callback();
            }
          });
        }, function (err) {
              if (err) console.error(err.message);
            });
      }else{
        console.log(err);
        console.log(response.statusCode);
      }
    });
  };
  res.redirect("/");
})
