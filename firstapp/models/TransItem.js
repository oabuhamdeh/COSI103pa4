
'use strict';
const mongoose = require( 'mongoose' );
const Schema = mongoose.Schema;
const ObjectId = mongoose.Schema.Types.ObjectId;

var transSchema = Schema( {
  description: String,
  category: String,
  amount: Number,
  date: Date,
  userId: ObjectId
} );

module.exports = mongoose.model( 'TransItem', transSchema );
