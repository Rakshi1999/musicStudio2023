const express = require("express");
const dotenv = require("dotenv");
dotenv.config();
require("./connectToDb");
const User = require("./models/userModel");
// const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const path = require("path");
const sendMail = require("./sendMail");
const app = express();

// app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "build")));

function generateOTP() {
  var digits = "0123456789";
  let OTP = "";
  for (let i = 0; i < 6; i++) {
    OTP += digits[Math.floor(Math.random() * 10)];
  }
  return Number(OTP);
}

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

app.get("/signup", (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});
app.get("/mymusic", (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

app.get("/verify", async (req, res) => {
  const token = req.headers;
  jwt.verify(token.authorization, process.env.JWT_SECRET, async (err, user) => {
    if (err) {
      res.status(401).json({ message: "token not valid, kindly login again" });
    }
    let userDetails = await User.findOne({ email: user.email });
    // console.log(userDetails);
    if (!userDetails.token.includes(token.authorization)) {
      return res.status(400).json({ message: "Kindly login again" });
    }
    return res
      .status(200)
      .json({ message: "success", username: userDetails.username });
  });
});

app.post("/emailverify", async (req, res) => {
  let user = await User.findOne({ email: req.body.email });
  if (user.otp == req.body.otp) {
    jwt.sign(
      { email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
      async (err, newToken) => {
        if (err) {
          res
            .status(500)
            .json({ message: "Something went worong, please try again later" });
        }
        await User.findOneAndUpdate(
          { email: req.body.email },
          { $set: { token: [...user.token, newToken] } }
        );
        res.status(200).json({
          message: "Success",
          username: user.username,
          token: newToken,
        });
      }
    );
  } else {
    res.status(400).json({ message: "OTP match failed" });
  }
});

app.post("/signup", async (req, res) => {
  // console.log(req.body);
  let user = await User.findOne({ email: req.body.email });
  // console.log(user);
  if (user) {
    return res.status(409).json({ message: "Email already exists" });
  } else {
    let hashedPassword = await bcrypt.hash(req.body.password, 10);
    const newUser = new User({ ...req.body, password: hashedPassword });
    newUser
      .save()
      .then(async (user) => {
        let sendOtp = generateOTP();
        await User.findOneAndUpdate(
          { email: req.body.email },
          { $set: { otp: sendOtp } }
        );
        const options = {
          to: req.body.email,
          from: process.env.SENGRID_FROM_EMAIL,
          subject: "OTP for the verification of Music Studio Account",
          text: `Kindly Enter the OTP given ---> ${sendOtp}`,
        };
        sendMail(options);
        res.status(200).json({ message: "success" });
      })
      .catch((e) => {
        // console.log(e.message);
        res.status(404).send("Something went wrong!!!");
      });
  }
});

app.post("/login", async (req, res) => {
  let user = await User.findOne({ email: req.body.email });
  // console.log(user);
  if (user) {
    let check = await bcrypt.compare(req.body.password, user.password);
    // console.log(check);
    if (check) {
      jwt.sign(
        { email: user.email, id: user._id },
        process.env.JWT_SECRET,
        { expiresIn: "1d" },
        async (err, newToken) => {
          if (err) {
            return res
              .status(500)
              .json({ message: "Please retry after sometime" });
          }
          await User.findOneAndUpdate(
            { email: req.body.email },
            { $set: { token: [...user.token, newToken] } }
          );
          return res.status(200).json({
            message: "success",
            id: user._id,
            username: user.username,
            jwt: newToken,
          });
        }
      );
    } else {
      return res.status(400).json({ message: "Password incorrect!!!" });
    }
  } else {
    return res
      .status(404)
      .json({ message: "User does not exists, please signup" });
  }
});

app.get("/logout", (req, res) => {
  const token = req.headers.authorization;
  jwt.verify(token, process.env.JWT_SECRET, async (err, details) => {
    if (err) {
      res
        .status(400)
        .json({ message: "Something went wrong please try again" });
    }
    const user = await User.findOne({ email: details.email });
    let arr = user.token.filter((tok) => tok !== token);
    await User.findOneAndUpdate(
      { email: details.email },
      { $set: { token: [...arr] } }
    );
    res.status(200).json({ message: "Logged Out Successfully" });
  });
});

app.listen(process.env.PORT, () => {
  console.log("listening in port 4000");
});
