const express = require("express");

const { create, getAll, getOne, update, remove } = require("./user.controller.js");
const userRoutes = express.Router();
userRoutes.post("/",  create);
userRoutes.get("/",  getAll);
userRoutes.get("/:id",  getOne);
userRoutes.put("/:id",  update);
userRoutes.delete("/:id",  remove);


module.exports = userRoutes;