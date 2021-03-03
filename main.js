var express = require("express");
var app = express();
var fs = require("fs");
var bodyParser = require("body-parser");
var compression = require("compression");
var indexRouter = require("./routes/index");
var topicRouter = require("./routes/topic");
var helmet = require("helmet");

app.use(helmet());
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(compression()); //컴프레션이 미들웨어를 리턴하고 있고 그것이 app.use에 장착되는 것이다. 그러면 우리 웹 애플리케이션은 실행될때마다 바디파서와 컴프레션의 미들웨어가 실행되도록 약속되어 있다.
app.get("*", function (request, response, next) {
  //get 방식으로 들어오는 요청에 대해서만 파일 목록을 가져오는 코드이다.
  fs.readdir("./data", function (error, filelist) {
    request.list = filelist;
    next(); //next라는 변수에는 그 다음으로 호출되어야 할 미들웨어가 담겨있다. 그럼 그 미들웨어를 ()해주면 실행된다.
  });
});

// app.use("/:unknown", function (request, response, next) {
//   pathArray = [
//     "page",
//     "create",
//     "update",
//     "create_process",
//     "update_process",
//     "delete_process",
//   ];
//   if (pathArray.indexOf(request.params.unknown) < 0) {
//     response.send("Not found");
//   }
//   next();
// });

// app.use("/page/:un", function (request, response, next) {
//   fs.readdir("./data", function (error, filelist) {
//     request.check = filelist;
//     if (request.check.indexOf(request.params.un) < 0) {
//       response.send("Not found");
//     }
//     next();
//   });
// });

app.use("/", indexRouter);
app.use("/topic", topicRouter);

app.use(function (req, res, next) {
  res.status(404).send("Sorry cant find that!");
});

app.use(function (err, req, res, next) {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

app.listen(3000, function () {
  console.log(`Example app listening at http://localhost:3000`);
});
