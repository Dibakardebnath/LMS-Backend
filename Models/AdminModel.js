
const mongoose= require('mongoose')

const AdminSchema=new mongoose.Schema({

    
      course:String,
      price: Number,
      level: String,
      duration: String,
      instructor: String,
      rating: Number,

},
{
    timestamps: true

})

const AdminModel=mongoose.model('course',AdminSchema)

module.exports = {AdminModel}