const express = require("express");
const { body, validationResult } = require("express-validator");
const nodemailer = require("nodemailer");

const User = require("../models/User");
const bcrypt = require("bcryptjs");
const gravatar = require("gravatar");
const jwt = require("jsonwebtoken");
const authenticate = require("../middleware/authenticate");
const router = express.Router();

/*

 @usage:Register a user
 @url:/api/users/register
 @fields:name,email,password
 @method:POST
 @access:Public*/
var transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "ssk66221@gmail.com",
    pass: "Shyam123@",
  },
  tls: {
    rejectUnauthorized: false,
  },
});
router.post(
  "/register",
  [
    body("name").notEmpty().withMessage("Name is required"),
    body("email").notEmpty().withMessage("Email is required"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  async (request, response) => {
    let errors = validationResult(request);
    if (!errors.isEmpty()) {
      return response.status(401).json({ errors: errors.array() });
    }
    try {
      let { name, email, password } = request.body;

      //check if the user is exists

      let user = await User.findOne({ email: email });
      if (user) {
        return response
          .status(401)
          .json({ errors: [{ msg: "User is Already Exists" }] });
      }

      //encode the password

      const salt = await bcrypt.genSalt(10);
      password = await bcrypt.hash(password, salt);

      //gravatar image

      let avatar = gravatar.url(email, {
        s: "300",
        r: "pg",
        d: "mm",
      });

      //address
      let address = {
        flat: " ",
        landmark: " ",
        street: " ",
        city: " ",
        state: " ",
        country: " ",
        passcode: " ",
        mobile: " ",
      };

      //save user to db

      user = new User({
        name,
        email,
        password,
        avatar,
       
        address,
      });
      user = await user.save();


      response.status(200).json({ msg: "Registration is Success" });
    } catch (error) {
      console.error(error);
      response.status(500).json({ errors: [{ msg: error.message }] });
    }
  }
);

/**
 * @usage:Login user
 * @URL:'/api/users/login
 * @fields:emai,password
 * @method:post
 * @access:public
 *
 */

router.post(
  "/login",
  [
    body("email").notEmpty().withMessage("Email is required"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  async (request, response) => {
    let errors = validationResult(request);
    if (!errors.isEmpty()) {
      return response.status(401).json({ errors: errors.array() });
    }

    try {
      let { email, password } = request.body;

      let user = await User.findOne({ email: email });
      if (!user) {
        return response
          .status(401)
          .json({ errors: [{ msg: "Invalid Credentials" }] });
      }

      //check password

      let isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return response
          .status(401)
          .json({ errors: [{ msg: "Invalid Credentials" }] });
      }

      //create a token

      let payload = {
        user: {
          id: user.id,
          name: user.name,
        },
      };

      jwt.sign(
        payload,
        process.env.JWT_SECRET_KEY,
        { expiresIn: 36000000 },
        (err, token) => {
          if (err) throw err;
          response.status(200).json({ msg: "Login is Success", token: token });
        }
      );
    } catch (error) {
      console.error(error);
      response.status(500).json({ errors: [{ msg: error.message }] });
    }
  }
);

/**
 * @usage:Get User Info
 * @URL:/api/users/
 * @fields:no-fields
 * @method:get
 * @access:private
 */

router.get("/", authenticate, async (request, response) => {
  try {
    let user = await User.findById(request.user.id).select("-password");
    response.status(200).json({ user: user });
  } catch (error) {
    console.error(error);
    response.status(401).json({ errors: [{ msg: error.message }] });
  }
});

/**
 * @usage:Update Address of a user
 * @URL:'/api/users/address
 * @fields:flat,street,landmark,city,state,country,passcode,mobile
 * @method:post
 * @access:PRIVATE
 *
 */

router.post(
  "/address",
  authenticate,
  [
    body("flat").notEmpty().withMessage("Flat is required"),
    body("street").notEmpty().withMessage("Street is required"),
    body("landmark").notEmpty().withMessage("Landmark is required"),
    body("city").notEmpty().withMessage("City is required"),
    body("state").notEmpty().withMessage("State is required"),
    body("country").notEmpty().withMessage("Country is required"),
    body("passcode").notEmpty().withMessage("Passcode is required"),
    body("mobile").notEmpty().withMessage("Mobile is required"),
  ],
  async (request, response) => {
    let errors = validationResult(request);
    if (!errors.isEmpty()) {
      return response.status(401).json({ errors: errors.array() });
    }
    try {
      let address = {
        flat: request.body.flat,
        street: request.body.street,
        landmark: request.body.landmark,
        city: request.body.city,
        state: request.body.state,
        country: request.body.country,
        passcode: request.body.passcode,
        mobile: request.body.mobile,
      };

      let user = await User.findById(request.user.id);
      user.address = address; //my above declaration address is compare to user.address
      user = await user.save();

      response.status(200).json({
        msg: "Address is uploaded",
        user: user,
      });
    } catch (error) {
      console.error(error);
      response.status(401).json({ errors: [{ msg: error.message }] });
    }
  }
);

module.exports = router;
