let express = require("express");
let mongoose = require("mongoose");
let app = express();
app.use(express.json());

mongoose
  .connect("mongodb://127.0.0.1:27017/moontech")
  .then(() => {
    console.log("connected");
  })
  .catch((error) => {
    console.log("error", error);
  });
let csvtojson = require("csvtojson");
let mongodb = require("mongodb");
let multer = require("multer");
let staticFilesUrl = "http://localhost:4040/static/";
let user = require("./model/user");

app.post("/api/v1/uploadCsv", async (req, res) => {
  try {
    let fileName;
    let db = mongoose.connection;
    let upload = await multer({
      storage: multer.diskStorage({
        destination: (req, file, cb) => {
          cb(null, "");
        },
        filename: (req, file, cb) => {
          req.originalName = file.originalname;
          fileName = req.originalName;
          cb(null, req.originalName);
        },
      }),
    }).any();
    await upload(req, res, (err) => {
      var files = [];
      req.files.forEach((ele) => {
        fileName = ele.filename;
        files.push(staticFilesUrl + ele.filename);
      });
    });
    console.log("---------->", upload);
    let arrayToInsert = [];
    csvtojson()
      .fromFile("sample.csv")
      .then((source) => {
        for (var i = 0; i < source.length; i++) {
          var oneRow = {
            id: source[i]["id"],
            name: source[i]["Name"],
            email: source[i]["Email"],
            mobile: source[i]["Mobile"],
            gender: source[i]["Gender"],
            dob: source[i]["DOB"],
            createdAt: source[i]["CreatedAt"],
          };
          arrayToInsert.push(oneRow);
        }
        let collectionName = "users";
        db.collection(collectionName).insertMany(
          arrayToInsert,
          (err, result) => {
            if (err) console.log(err);
            if (result) {
              console.log("import CSV into database");
            }
          }
        );
      });
    res.status(200).json({ status: "SUCCESS", message: "data fetched" });
    console.log("-----------result", result);
  } catch (error) {
    res.status(500).json({ status: "FALIUER", message: "unable to save" });
  }
});
// 
app.post("/saveOrupdate", async (req, res) => {
  try {
    let result = await user.findOne({ email: req.body.email });
    console.log("-----",result)
    if (result) {
      let update = await user.findOneAndUpdate(
        { $set: req.body },
        { new: true }
      );
      console.log(update)
      res.status(500).json({ status: "FALIUER", message: "exit" });
    } else {
      result = await new user(req.body).save();
      res.status(200).json({ status: "SUCCESS", message: "user  created" });
    }
  } catch (error) {
    res.status(500).json({ status: "FALIUER", message: "unable to save" });
  }
});
app.delete("/delete/:id", async (req, res) => {
  try {
    let result = await user.findByIdAndDelete(req.params.id );
    res.status(200).json({ status: "SUCCESS", message: "user  deleted"});
    console.log("----------",result)
  } catch (error) {
    res.status(500).json({ status: "FALIUER", message: "unable to save" });
  }
});

app.listen(4040, () => {
  console.log("server listening");
}); 
