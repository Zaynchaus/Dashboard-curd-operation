const mongoose= require('mongoose')

const Adminschema= new mongoose.Schema({
    
    email:String,
    password:String
})

module.exports= mongoose.model("admin", Adminschema)