var express = require("express");
var router = express.Router();
var template = require("../lib/template");

router.get("/", function (request, response) {
  //뒤에 콜백함수또한 미들웨어 였다...
  var title = "Welcome";
  var description = "Hello, Node.js";
  var list = template.list(request.list);
  var html = template.HTML(
    title,
    list,
    `<h2>${title}</h2>${description}
      <img src="/images/hello.jpg" style="width: 300px; display: block; margin-top: 10px;">`,
    `<a href="/topic/create">create</a>`
  );
  response.send(html);
});
//이것이 위에 것의 최신코드이다.
// app.get("/", (request, response) => {
//   response.send("Hello World!");
// });

module.exports = router;
