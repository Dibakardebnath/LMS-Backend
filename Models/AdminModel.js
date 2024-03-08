
const mongoose= require('mongoose')

const AdminSchema=new mongoose.Schema({

    title:String,
    category:String,
    description:String,
    price:Number,

},
{
    timestamps: true

})

const AdminModel=mongoose.model('course',AdminSchema)

module.exports = {AdminModel}