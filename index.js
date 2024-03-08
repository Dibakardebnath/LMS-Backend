const express=require('express');
const { connection } = require('./config/db');
const { SignUpModel } = require('./Models/SignupModel');
var jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { Auth } = require('./Authentication/Auth');
const { AdminModel, AdminModel } = require('./Models/AdminModel');


const app = express();
 app.use(express.json());

 app.get("/", (req, res) => {
    res.send("Welcome to my mongodb")
 })

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

app.post("/login",async(req, res) => {
    const { email, password} =req.body
    
    const user=await SignUpModel.findOne({email})
    if(user=="admin@gmail.com"){
        // console.log(user._id)
        const hashPassword =user.password
        bcrypt.compare(password, hashPassword, function(err, result) {
          if(result){
            var token = jwt.sign({ user_id:user._id }, 'Dibakar');
            res.json({token:token});
            console.log(token)
          }
          if(err){
            res.status(200).json({msg:"error"})
            // console.log(err)
          }
        });
    }
})

// .................................................................................

app.get("/course",async(req, res)=>{
  const {search,sortby,page,limit,order}=req.query

  let pageno=page
  let limitperpage=limit
  let skip=(pageno-1)*limitperpage

  try {
   let user;
   let query={}
   
   if(search){
       const regexp=new RegExp(search,"i")
       query.title=regexp
   }


   let sortquery={}

   if(sortby){
       sortquery[sortby]=order==="asc"? 1 : -1
   }

   if(pageno &&  limitperpage){
       user=await AdminModel.find(query).sort(sortquery).skip(skip).limit(limitperpage)
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
 const { title,category,description,price}=req.body;
 const author_id=req.user_id
 const user=await SignUpModel.findOne({_id: author_id})
  
       const admin_course=new AdminModel({
           title,
           category,
           description,
           price,
           email: user.email
       })
       await admin_course.save()
       res.status(200).json({msg:"Successfully created"})
       
})

app.put("/course/edit/:id",Auth,async(req, res) => {
   try {
       const edit_id=req.params.id
       const payload=req.body
   
       const user_id=req.user_id
       const sign_user=await SignUpModel.findOne({_id: user_id})
       const sign_email=sign_user.email
       console.log(sign_email)

       const user=await AdminModel.findOne({_id: edit_id})
       const user_email=user.email
       console.log(user_email)

       if(sign_email===user_email) {
           await AdminModel.findByIdAndUpdate(edit_id,payload)
           res.status(200).json({msg:"updated successfully"})
       }else{
           res.send("error updating")
       }
   } catch (error) {
       console.log(error)
   }
  
})


app.delete("/course/delete/:id",Auth,async(req,res) => {
   try {
       
      const delete_id = req.params.id
      
       const user_id=req.user_id
       const sign_user=await SignUpModel.findOne({_id: user_id})
       const sign_email=sign_user.email
     

      const user=await AdminModel.findOne({_id:delete_id});
      const user_mail=user.email
   

      if(user_mail===sign_email) {
         await AdminModel.findByIdAndDelete({_id:delete_id});
         res.send("deleted successfully");
      }else{
       res.send("deleted error");
      }

   } catch (error) {
       console.log(error);
       
   }
})





 app.listen(8080,async()=>{
    await connection
    try {
        console.log("Connected successfully")
    } catch (error) {
        console.log(error)
    }
 })