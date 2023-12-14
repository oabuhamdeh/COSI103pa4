/*
  todo.js -- Router for the ToDoList
*/
const express = require('express');
const router = express.Router();
const Transaction = require('../models/TransItem')

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
router.get('/todo2',
  isLoggedIn,
  async (req, res, next) => {
    const show = req.query.show
    let items=await Transaction.find({userId:req.user._id})
    if (req.query.sortBy) {
        items = items.sort((a,b) => {
            if (req.query.sortBy == 'amount') {
                return a.amount - b.amount
            } else if (req.query.sortBy == 'date') {
                return new Date(b.date) - new Date(a.date)
            } else if (req.query.sortBy == 'category') {
                return ('' + a.category).localeCompare(b.category);
            } else if (req.query.sortBy == 'description') {
                return ('' + a.description).localeCompare(b.description);
            }
        })
    }
    res.render('toDoList2',{items,show});
});



/* add the value in the body to the list associated to the key */
router.post('/todo2',
  isLoggedIn,
  async (req, res, next) => {
      const transaction = new Transaction(
        {description:req.body.description,
         amount:parseFloat(req.body.amount),
         category:req.body.category,
         userId: req.user._id,
         date:req.body.date
        })
      await transaction.save();
      res.redirect('/todo2')
});


router.get('/todo2/remove/:itemId',
  isLoggedIn,
  async (req, res, next) => {
      console.log("inside /todo2/remove/:itemId")
      await Transaction.deleteOne({_id:req.params.itemId});
      res.redirect('/todo2')
});

router.get('/todo2/edit/:itemId',
  isLoggedIn,
  async (req, res, next) => {
      console.log("inside /todo2/edit/:itemId")
      const item = 
       await Transaction.findById(req.params.itemId);
      res.locals.item = item
      res.render('editTransaction')
});

router.post('/todo2/updateTransaction/',
  isLoggedIn,
  async (req, res, next) => {
      const {itemId,description,amount,category,date} = req.body;
      console.log("inside /todo2/updateTransaction/:itemId");
      await Transaction.findOneAndUpdate(
        {_id:itemId},
        {$set: {description,amount,category,date}} );
      res.redirect('/todo2')
});

router.get('/todo2/byCategory',
isLoggedIn,
async (req, res, next) => {
    console.log("inside /transaction/byCategory")

    // First get all the transactions for the user
    let first_results = await Transaction.find({userId:req.user._id})

    // Build a new array of objects with just the category and amount
    let results = first_results.map(item => {
        return {category:item.category, amount:item.amount}
    })
    console.log(results)
    let results2 = results.reduce((acc, item) => {
        if (acc[item.category]) {
            acc[item.category] += item.amount
        } else {
            acc[item.category] = item.amount
        }
        return acc
    }, {})
    keys = Object.keys(results2)
    console.log(keys)
    
    // If the $match is commented out, then the $group works but is not filtered by user.
    // If the $match is not commented out, then an error is produced because of incorrect BSON versions.
    // After some googling I found that there was a recent update to the BSON version in Mongoose, and that
    // $match cannot compare old BSON versions to new BSON versions.

    // let results = await Transaction.aggregate([
    //     {$match: {userId:req.user._id}},
    //     {$group: {_id: "$category", total: {$sum: "$amount"}}}
    // ])
    // console.log(results)
    //   res.json(results)
      res.render('summarizeByCategory',{keys,results2})
});



module.exports = router;
