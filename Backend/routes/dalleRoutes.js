const express = require("express")
require('dotenv').config();
const Credit = require("../mongodb/models/credit")
const {OpenAI}  = require("openai");

const router = express.Router();


const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY // This is also the default, can be omitted
});

router.route("/").get((req, res) => {
    res.send("hello from dalle");
  });

  router.route("/credit-left").get(async (req, res) => {
    try {
      const creditLeftArray = await Credit.find();
      const creditLeft = creditLeftArray[0].creditLeft;
      res.status(200).json({ creditLeft });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  router.route('/').post(async (req, res) => {
    try {
      const { prompt } = req.body;
  
      const aiResponse = await openai.images.generate({
        prompt,
        n: 1,
        size: '1024x1024',
      });

      const creditLeftArray = await Credit.find();
      const creditLeft = creditLeftArray[0].creditLeft;
  
      if (creditLeft > 0) {
        await Credit.findByIdAndUpdate(creditLeftArray[0]._id, { $inc: { creditLeft: -1 } });
        const image = aiResponse.data.data[0].url;
        res.status(200).json({ photo: image,creditLeft });
      } else {
        res.status(500).json({ message:"Credit limt has been reached for this month" });
      }
  

    } catch (error) {
      console.error(error);
      res.status(500).send(error?.response.data.error.message || 'Something went wrong');
    }
  });
  
  
module.exports = router;
