var express = require("express");
var router = express.Router();
var fs = require("fs");
var template = require("../lib/template.js");
var path = require("path");
var sanitizeHtml = require("sanitize-html");

router.get("/create", function (request, response) {
  var title = "WEB - create";
  var list = template.list(request.list);
  var html = template.HTML(
    title,
    list,
    `
          <form action="/topic/create_process" method="post">
            <p><input type="text" name="title" placeholder="title"></p>
            <p>
              <textarea name="description" placeholder="description"></textarea>
            </p>
            <p>
              <input type="submit">
            </p>
          </form>
        `,
    ""
  );
  response.send(html);
}); //이게 topic/:pageId 보다 아래 있으면 작동이 안된다.

router.post("/create_process", function (request, response) {
  var post = request.body;
  var title = post.title;
  var description = post.description;
  fs.writeFile(`data/${title}`, description, "utf8", function (err) {
    response.redirect(`/topic/${title}`);
  });
}); //이게 topic/:pageId 보다 아래 있으면 작동이 안된다.

router.get("/update/:pageId", function (request, response) {
  var filteredId = path.parse(request.params.pageId).base;
  fs.readFile(`data/${filteredId}`, "utf8", function (err, description) {
    var title = request.params.pageId;
    var list = template.list(request.list);
    var html = template.HTML(
      title,
      list,
      `
                  <form action="/topic/update_process" method="post">
                    <input type="hidden" name="id" value="${title}">
                    <p><input type="text" name="title" placeholder="title" value="${title}"></p>
                    <p>
                      <textarea name="description" placeholder="description">${description}</textarea>
                    </p>
                    <p>
                      <input type="submit">
                    </p>
                  </form>
                  `,
      `<a href="/topic/create">create</a> <a href="/topic/update/${title}">update</a>`
    );
    response.writeHead(200);
    response.end(html);
  });
});

router.post("/update_process", function (request, response) {
  var post = request.body;
  var id = post.id;
  var title = post.title;
  var description = post.description;
  fs.rename(`data/${id}`, `data/${title}`, function (error) {
    fs.writeFile(`data/${title}`, description, "utf8", function (err) {
      response.redirect(`/topic/${title}`);
    });
  });
});

router.post("/delete_process", function (request, response) {
  var post = request.body;
  var id = post.id;
  var filteredId = path.parse(id).base;
  fs.unlink(`data/${filteredId}`, function (error) {
    response.redirect("/");
  });
});

router.get("/:pageId", function (request, response, next) {
  var filteredId = path.parse(request.params.pageId).base;
  fs.readFile(`data/${filteredId}`, "utf8", function (err, description) {
    if (err) {
      next(err); // () 도 ('route') 도 아니고 그 외에 데이터가 들어오면 err을 던져주는 것. 이렇게 하면 어떤 미들웨어가 등록되었는지와는 상관없이 맨 아래의 인자가 4개인 에러 미들웨어가 호출된다.
    } else {
      var title = request.params.pageId;
      var sanitizedTitle = sanitizeHtml(title);
      var sanitizedDescription = sanitizeHtml(description, {
        allowedTags: ["h1"],
      });
      var list = template.list(request.list);
      var html = template.HTML(
        sanitizedTitle,
        list,
        `<h2>${sanitizedTitle}</h2>${sanitizedDescription}`,
        ` <a href="/topic/create">create</a>
            <a href="/topic/update/${sanitizedTitle}">update</a>
            <form action="/topic/delete_process" method="post"> 
              <input type="hidden" name="id" value="${sanitizedTitle}">
              <input type="submit" value="delete">
            </form>`
      ); // /를 붙여야지만 최상위 디렉토리 밑에 있는 delete_process로 가게 되는 것이다.
      response.send(html);
    }
  });
});

module.exports = router;
