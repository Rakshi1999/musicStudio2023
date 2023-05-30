const mongoose = require("mongoose");

// console.log(process.env.MONGO_PASSWORD)

// mongoose
//   .connect(
//     `mongodb+srv://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@musicstudio.4zidg1v.mongodb.net/`,
//     { dbName: "NS" }
//   )
//   // mongodb+srv://subbannakbskp0:<password>@musicstudio.4zidg1v.mongodb.net/
//   .then(() => {
//     console.log("connection successfull!!");
//   })
//   .catch((e) => {
//     console.log(e.message);
//   });

mongoose
  .connect("mongodb://localhost:27017/", { dbName: "NS" })
  .then(() => {
    console.log("connection successfull!!");
  })
  .catch((e) => {
    console.log(e.message);
  });
  