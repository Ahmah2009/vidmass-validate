// server.js

// BASE SETUP
// =============================================================================

// call the packages we need
var express    = require('express');        // call express
var app        = express();                 // define our app using express
var bodyParser = require('body-parser');

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 8080;        // set our port
var DropBoxpath='/box/Dropbox/';
var baseUrl='45.76.135.163';
var assetsUrl= baseUrl+DropBoxpath;

// ROUTES FOR OUR API
// =============================================================================
var router = express.Router();              // get an instance of the express Router

// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.get('/:templateName', function(req, res) {
  if (req.params.templateName){
    try {
      var templateName= req.params.templateName;
      var helper= validate(templateName);
      writeHelprtFile(helper,templateName)
      var data={
        TemplateName:templateName+".aepx",
        TemplateUrl:assetsUrl+templateName+"/"+templateName+".aepx",
        Json_url:assetsUrl+templateName+"/helper.json",
      }
       res.json(data);

    } catch (e) {
      res.json({error:e});
    }
  }
});

// more routes for our API will happen here

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api', router);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);

const fs = require('fs');
var _eval = require('eval')


// find project file with name of (projectnanme.aepx)
function validate(projectName) {
    var files = [];
    try {
        files = fs.readdirSync('./assets/' + projectName);
        if (files.indexOf(projectName + '.aepx') == -1) {
            throw "project file aepx not found!";
        }

        if (files.indexOf(projectName + '.aepx') == -1) {
            throw "project file aepx not found!";
        }
        if (files.indexOf("report1.js") == -1) {
            throw "report1.js file not found!, cannout generate helper.js file without report1.js file";
        }


        var vv = fs.readFileSync('./assets/' + projectName + '/report1.js');
        vv = (vv + '').replace('\\', '/')
        var res = _eval(vv + 'exports.data=jsonData');
        var li = [];
        var time = 0;
        var i;
        var obj;
        for ( i = 0; i < res.data.file.length; i++) {
            obj = {};

            var ppath = res.data.file[i].path;

            var reGlop = /.mp3|.mp4|.png/ //image, sound, video

            if (reGlop.test(ppath)) {

                if (/.mp3/.test(ppath)) {
                    obj.type = 'sound';
                    obj.name = ppath;
                } else if (/.mp4/.test(ppath)) {
                    obj.type = 'movie';
                    obj.name = ppath;
                } else if (/.png/.test(ppath)) {
                    obj.type = 'image';
                    obj.name = ppath;
                    if (res.data.file[i].width && res.data.file[i].height) {
                        obj.filters = [{
                            name: 'resize',
                            params: [1080, 1400]
                        }];
                    }
                }
            } else {
                throw "not supported file type";
            }
            obj.time = time++;
            li.push(obj);
        }
        var keys = Object.keys(res.data.text);
        for (i = 0; i < keys.length; i++) {
            obj = {};
            obj.type = 'text';
            obj.name = keys[i];
            obj.src = res.data.text[keys[i]];
            obj.time = time++;
            li.push(obj);
        }
        var colors= res.data.colors;
        var colorTypes=['main_color','secondary_color_1','secondary_color_2','extra_color_1','extra_color_2'];
        var colorDesc=['Main Color','Secondary Color','Secondary Color','Extra Color','Extra Color'];
        if(colors && Array.isArray(colors)){
          for (i = 0; i < colors.length; i++) {
            obj={}
            obj.name=colorTypes[i];
            obj.src=colors[i];
            obj.dsc=colorDesc[i];
            obj.time = time++;
            li.push(obj);
          }
        }

        return li;
    } catch (e) {
        console.log(e);
        throw "project not found 404";

    } finally {
        console.log("done");
    }

}


function writeHelprtFile(obj,projectName){
  var fileName= './assets/' + projectName+'/helper.json';

  fs.writeFile(fileName, JSON.stringify(obj), function(err) {
    if(err) {
        throw "faild to craete helper file";
    }
});
}
