const express = require("express");
const mongoose = require("mongoose");
require('dotenv').config();


const username = process.env.DB_USER;
const password = process.env.DB_PASS;
const cluster = process.env.DB_CLUSTER;
const dbname = process.env.DB_NAME;

mongoose.connect(
  `mongodb://${username}:${password}@${cluster}/${dbname}?authSource=admin`
);

module.exports = {
    mongoose
}

