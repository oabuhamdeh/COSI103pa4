/*
  todo.js -- Router for the ToDoList
*/
const express = require('express');
const router = express.Router();
const TransItem = require('../models/TransItem')


/*
this is a very simple server which maintains a key/value
store using an object where the keys and values are lists of strings

*/

isLoggedIn = (req,res,next) => {
  if (res.locals.loggedIn) {
    next()
  } else {
    res.redirect('/login')
  }
}

// get the value associated to the key
router.get('/transaction/',
  isLoggedIn,
  async (req, res, next) => {
      res.locals.items = await TransItem.find({userId:req.user._id}) //mongodb orm
      res.render('TransList');
});


/* add the value in the body to the list associated to the key */
router.post('/transaction',
  isLoggedIn,
  async (req, res, next) => {
      const transaction = new TransItem(
        {item:req.body.item,
         date: new Date(),
         complete: false,
         userId: req.user._id
        })
      await transaction.save();
      res.redirect('/transaction')
});

router.get('/transaction/remove/:itemId',
  isLoggedIn,
  async (req, res, next) => {
      console.log("inside /transaction/remove/:itemId")
      await TransItem.deleteOne({_id:req.params.itemId});
      res.redirect('/transaction')
});



module.exports = router;
