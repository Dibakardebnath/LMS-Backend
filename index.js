const express=require('express');
const { connection } = require('./config/db');
const { SignUpModel } = require('./Models/SignupModel');
var jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { Auth } = require('./Authentication/Auth');
const { AdminModel, } = require('./Models/AdminModel');

var cors=require('cors');
require('dotenv').config()

const app= express()

app.use(cors({
    origin : "*"
  }))
  
 app.use(express.json());


//   SignUp Method

app.post("/signup",async(req, res) => {
   const {email,name,password} = req.body
   const hash = bcrypt.hashSync(password, 5);
   try {
     const signUser=new SignUpModel({
        name: name,
        email: email,
        password:hash
     })

     await signUser.save()
     res.status(200).json({msg:"Successfully signed up"})
   } catch (error) {
    console.log(error)
    res.status(500).json({msg:"Error signing"})
   }
})


// Login Method

app.post("/login", async (req, res) => {
    const { email, password } = req.body

    const user = await SignUpModel.findOne({ email })
    if (user) {
        const hashPassword = user.password
        bcrypt.compare(password, hashPassword, function (err, result) {
            if (result) {
                let token;
                if (email === 'admin@gmail.com') {
                    token = jwt.sign({ user_id: user._id }, 'AdminSecretKey');
                }
                res.json({ token: token });
                console.log(token)
            } else {
                res.status(200).json({ msg: "Invalid email or password" });
            }
        });
    } else {
        res.status(200).json({ msg: "User not found" });
    }
})


// .................................................................................

app.get("/",async(req, res)=>{
  const{course,sortby,page,limit,order}=req.query
console.log(course)
  let pageno=page
  let limitperpage=limit
  let skip=(pageno-1)*limitperpage

  try {
   let user;
   let query={}


   
   if(course){
       const regexp=new RegExp(course,"i")
       query.course=regexp
   }

   let sortquery={}

   if(sortby){
       sortquery[sortby]=order==="asc"? 1 : -1
   }

   if(pageno &&  limitperpage){
       user=await AdminModel.find(query).sort(sortquery).skip(skip).limit(limitperpage)
       console.log(user)
   }else if(pageno){
       user=await AdminModel.find(query).sort(sortquery).skip(skip).limit(limitperpage)
   }else{
       user=await AdminModel.find(query)
       var total=await AdminModel.count(query)
   }

   res.json({
       total,
       page,
       pageno,
       limitperpage,
       user
   })

  } catch (error) {
   res.json({ error: error})
  }
})

app.post("/course/create",Auth, async (req, res) => {
 const { course,level,duration,price,instructor,rating}=req.body;
 const author_id=req.user_id
 const user=await SignUpModel.findOne({_id: author_id})
  
       const admin_course=new AdminModel({
        course,
        price,
        level,
        duration,
        instructor,
        rating,
     email: user.email
       })
       await admin_course.save()
       res.status(200).json({msg:"Successfully created"})
       
})

app.put("/course/edit/:id",Auth,async(req, res) => {
   try {
       const edit_id=req.params.id
       const payload=req.body

       await AdminModel.findByIdAndUpdate(edit_id,payload)
       res.status(200).json({msg:"updated successfully"})
   
   } catch (error) {
       console.log(error)
   }
  
})


app.delete("/course/delete/:id",Auth,async(req,res) => {
   try {
       
      const delete_id = req.params.id
      
       const user_id=req.user_id
    
         await AdminModel.findByIdAndDelete({_id:delete_id});
         res.send("deleted successfully");

   } catch (error) {
       console.log(error);
       
   }
})





 app.listen(8000,async()=>{
    await connection
    try {
        console.log("Connected successfully")
    } catch (error) {
        console.log(error)
    }
 })