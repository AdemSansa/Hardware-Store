const userSchema = require("./user.schema.js");




const create= async (req, res) =>{
    const { name, email, password } = req.body;
    const user = await userSchema.create({ name, email, password });
    res.status(201).json(user);
};

const getAll= async (req, res) =>{
    const users = await userSchema.find();
    res.status(200).json(users);
};

const getOne= async (req, res) =>{
    const { id } = req.params;
    const user = await userSchema.findById(id);
    res.status(200).json(user);
};
const update= async (req, res) =>{
    const { id } = req.params;
    const { name, email, password } = req.body;
    const user = await userSchema.findByIdAndUpdate(id, { name, email, password }, { new: true });
    res.status(200).json(user);
};
const remove = async (req, res) =>{
    const { id } = req.params;
    await userSchema.findByIdAndDelete(id);
    res.status(200).json({ message: "User deleted successfully" });
};

module.exports = { create, getAll, getOne, update, remove };

