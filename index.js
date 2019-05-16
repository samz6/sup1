const express = require("express");
const app = express();
const port = 4000;
const http = require("https");
const querystring = require("querystring");

//app.get("/", (req, res) => res.send("Hello World!"));

//https://www.cmu.edu/blackboard/files/evaluate/tests-example.xls

function handleFileDownloadRequest(req, res) {
  console.log("1111");
  var postFormData = querystring.stringify(req.body);
  var options = {
    host: "https://www.cmu.edu",
    port: "443",
    path: "/blackboard/files/evaluate/tests-example.xls",
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Content-Length": postFormData.length
    }
  };

  var apiResbody = "";
  var apiReq = http.request(options, function(apiRes) {
    try {
      apiRes.setEncoding("binary");

      apiRes.on("data", function(dataChunk) {
        apiResbody += dataChunk;
      });

      apiRes.on("end", function() {
        try {
          let contentType = apiRes["headers"]["content-type"];
          if (contentType === "application/json") {
            var contentLength = parseInt(apiRes["headers"]["content-length"]);
            if (contentLength <= 0) {
              throw new Error("Content-length is coming <= 0  from api");
              return;
            }
            var filename = apiRes["headers"]["content-disposition"].split(
              "="
            )[1];
            if (filename.length <= 0) {
              throw new Error("Filename not coming from api");
              return;
            }
            var base64EncodedStr = new Buffer(apiResbody, "binary").toString(
              "base64"
            );
            if (base64EncodedStr.length <= 0) {
              throw new Error("Unable to create blob from stream");
              return;
            }

            return res.status(200).json({
              message: "Success!",
              file: {
                name: filename,
                blob: base64EncodedStr,
                "content-type": contentType
              }
            });
          }
        } catch (e) {
          console.error("FILE DOWNLOAD API ERROR 2: ", e.stack);
        }
      });
    } catch (e) {
      console.error("FILE DOWNLOAD API ERROR 3: ", e.stack);
    }
  });

  apiReq.write(postFormData);

  apiReq.end();

  apiReq.on("error", function(e) {
    log.error(req, res, "Error fetching response.");
  });
}

app.post("/my-file-download", handleFileDownloadRequest);

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
