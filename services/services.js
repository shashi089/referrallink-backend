const mongodb = require("../shared/mongo");
const { registerSchema, loginSchema } = require("../shared/schema");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const JWT_SECRET = "kdja3713$%^kjhd^&hjj";
// const JWT_SECRET = process.env.JWT_SECRET;
var ObjectId = require("mongodb").ObjectId;
const send_mail = require("./sendMailer");
let referalLink;
let position;
let highest_position;

const services = {
  // REGISTER SERVICE
  async register(req, res) {
    try {
      // JOI VALIDATION
      const { value, error } = await registerSchema.validate(req.body);

      // IF ERROR IN VALIDATION SEND ERROR MESSAGE TO THE FRONT-END AND LOOP GETS TERMINATED
      if (error) return res.status(400).send(error.details[0].message);

      // CHECKING WEATHER USER ALREADY EXISTS
      const data = await mongodb.users.findOne({ email: req.body.email });
      if (data)
        return res.status(400).send("User Already Exists. So Please Login");

      // IF USER DOESN'T EXISTS THEN HASH THE USERS PASSWORD
      req.body.password = await bcrypt.hash(req.body.password, 10);

      // CREATED DATE AND TIME
      const date = new Date().getTime();
      console.log(date);

      // FETCH THE USER ID OF REFERED PERSON
      const refered_id = req.params.id;

      // INSERTING THE USER DETAILS IN DB
      const insertData = await mongodb.users.insertOne({
        ...req.body,
        CreatedDate: date,
        refered_id: refered_id,
      });
      console.log(insertData);
      res.status(201).send("User Successfully Registered");
    } catch (err) {
      console.log(err);
      res.send(err);
    }
  },

  // LOGIN SERVICE
  async login(req, res) {
    try {
      // JOI VALIDATION
      const { value, error } = await loginSchema.validate(req.body);
      if (error) return res.status(400).send(error.details[0].message);

      // CHECKING WEATHER USER EXISTS
      let data = await mongodb.users.findOne({ email: req.body.email });
      if (!data)
        return res.status(400).send("User doesnt exists. Please Register");

      // USER EXISTS. SO CHECK THE PASSWORD
      const isValid = await bcrypt.compare(req.body.password, data.password);
      if (!isValid) return res.status(400).send("Password is Incorrect");

      // SINCE PASSWORD IS CORRECT CREATE A JWT FOR THE USER

      const payload = {
        userId: data._id,
        isAdmin: data.isAdmin,
      };

      // GENERATING JWT
      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "8h" });

      // IF IT`S FIRST TIME LOGIN THEN GENERATING REFERAL LINK AND UPDATING IT IN DB
      if (!data.referalLink && !data.isAdmin) {
        let name = data.name;
        name = name.split(" ").join("");
        console.log(name);
        referalLink = `https://aravind-referal-url.herokuapp.com/users/login/${data.CreatedDate}/${name}/${data._id}`;

        // CHECKING WEATHER THE USER REGISTERED WITH A REFERAL LINK
        if (data.refered_id) {
          const refered_user = await mongodb.users.findOne({
            _id: new ObjectId(data.refered_id),
          });
          let new_position = refered_user.position - 1;
          console.log(new_position);

          // UPDATING THE REFERED USERS POSITION IN DB
          await mongodb.users.findOneAndUpdate(
            { _id: new ObjectId(data.refered_id) },
            { $set: { position: new_position } }
          );

          // IF POSITION IS 1 THEN SENDING COUPEN CODE TO THE USER IN MAIL
          if (new_position === 1) {
            const random = Math.floor(100000 + Math.random() * 900000);
            await send_mail(
              refered_user.email,
              "Here is Your Coupen Code",
              `Your Coupen Code is "${random}". Use this Code in https://www.apple.com/`
            );
          }
        }

        // LOGIC TO GENERATE A POSITION FOR EACH USER
        const users = await mongodb.users.find().toArray();
        console.log(users);
        console.log(users.length);
        if (users.length === 2) {
          position = 99;
        } else {
          highest_position = users[1].position;
          users.map((user) => {
            if (user.position > highest_position) {
              highest_position = user.position;
            }
          });
          position = highest_position + 1;
        }

        // UPDATING THE POSTION AND REFERAL LINK IN DB
        await mongodb.users.findOneAndUpdate(
          { email: req.body.email },
          { $set: { referalLink: referalLink, position: position } }
        );
      }
      res.status(200).send({
        email: data.email,
        token: token,
        ReferalLink: data.referalLink || referalLink,
        position: data.position || position,
        name: data.name,
        id: data._id,
        createdAt: data.CreatedDate,
      });
    } catch (err) {
      console.log(err);
    }
  },

  // REFERAL REGISTER
  async referal_register(req, res, next) {
    try {
      const date = req.params.date;
      const id = req.params.id;
      const name = req.params.name;

      // fetching the data of refered user
      const data = await mongodb.users.findOne({ _id: new ObjectId(id) });

      // IF USER DOESN'T EXIST THEN SENDING ERROR TO USER
      if (!data) return res.status(400).send("Your URL is Broken in ID");

      // CHECKING WEATHER NAME AND CREATED DATE ARE MATCHING
      if (date != data.CreatedDate)
        return res.status(400).send("Your URL is Broken date");
      if (name !== data.name.split(" ").join(""))
        return res.status(400).send("Your URL is Broken name");
      next();
    } catch (err) {
      console.log(err);
    }
  },

  // UPDATE REGISTER
  async update(req, res) {
    try {
      const updatedUser = await mongodb.users.findOneAndUpdate(
        { _id: new ObjectId(req.params.id) },
        { $set: req.body },
        { ReturnDocument: "after" }
      );
      res.status(200).send(updatedUser);
    } catch (err) {
      res.status(500).send(err.message);
    }
  },

  // DELETE REGISTER
  async delete(req, res) {
    try {
      await mongodb.users.deleteOne({ _id: new ObjectId(req.params.id) });
      res.status(200).send("User Deleted");
    } catch (err) {
      res.status(500).send(err.message);
    }
  },

  // GET ALL
  async getAll(req, res) {
    const users = await mongodb.users.find().toArray();
    console.log(users);
    const { password, ...others } = users;
    res.status(200).send({ ...others });
  },

  // GET SINGLE USER DETAILS
  async getSingleUser(req, res) {
    try {
      const user = await mongodb.users.findOne({
        _id: new ObjectId(req.params.id),
      });
      if (!user) return res.status(400).send("user not found");
      const { password, ...others } = user;
      res.status(200).send({ ...others });
    } catch (err) {
      res.status(500).send(err.message);
    }
  },
};

module.exports = services;
