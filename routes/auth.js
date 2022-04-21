const express = require("express");
const mysql = require("mysql");
//const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const nodemailer = require("nodemailer");
const dbDebugger = require('debug')('app:db');
const router = express.Router();

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'housings'
  });
  
  db.connect((error) => {
    if (error) {
         console.log(error)
     } else {
        dbDebugger("MYSQL connected ...")
    }
   });

router.post('/signin' , async (req,res)=>{
    console.log(req.body);
    const { email , password} = req.body;
    db.query('SELECT * FROM user WHERE email  = ?',[email] , (error , results) =>{
          if(error){
             console.log(error);
        }
         if(results.length > 0){
           let type = results.type;
            bcrypt.compare(password, results[0].password,(err,response)=>{
                if(response){
                    req.session.userID = req.body;
                    if(email === 'admin@gmail.com'){
                      return  res.redirect('/admin');
                    }
                    else{
                      console.log('h')
                      return  res.redirect('/user'); 
                    }
                }
                else{
                    return res.render('signin' , {
                        message: 'wrong password.'
                      })
                }
            })   
          
                   
        }
        else {
            return res.render('signin' , {
                message: 'email does not exists.'
              })
        }
    })
})

router.post('/signup' , async (req,res)=> {
    
        const email = req.body.email;
        const username = req.body.username;
        const password = req.body.password;
        const passwordConfirm = req.body.passwordConfirm;
        const gender = req.body.gender;
        const phonenumber = req.body.phonenumber;
       const university = req.body.university;

       
       let hashedPassword = await bcrypt.hash(password , 8);
       
        db.query('SELECT email FROM user WHERE email = ? ', [email] , (error , results) =>{ 
            if(error){
                console.log(error);
            }
            if(results.length > 0){
                return res.render('signin' , {
                    message: 'This email already exists '
                })
            } else if(password !== passwordConfirm){
                return res.render('signup' , {
                message: 'Password does not match '
                });
            }    
           
            db.query('INSERT INTO user SET ?' , {email:email , username :username , password:hashedPassword , gender :gender , phonenumber :phonenumber , university:university } , (error,results)=>{
                if(error){
                    console.log(error)
                } else {
                  if(email === 'admin@gmail.com'){
                    return  res.redirect('/admin');
                  }
                  else{

                  
                     const transporter = nodemailer.createTransport({
                        service: 'gmail',
                        auth: {
                          user: 'webbreakers2@gmail.com',
                          pass: 'web2backend'
                        },
                        tls : { rejectUnauthorized: false }
                      });
                      
                      const mailOptions = {
                        from: 'webbreakers2@gmail.com',
                        to: req.body.email,
                        subject: 'Email verfication',
                        text: 'Hello! \n To start exploring our website please click on this link http://localhost:5002/user\n from webbreakers team'
                        
                      };
                     
        
                    transporter.sendMail(mailOptions, function(error, info){
                        if (error) {
                          console.log(error);
                        } else {
                          console.log('Email sent: ' + info.response);
                          res.render('emailVerfication');
                        }
                      });
                     }
                }
            
            })
        }) 
      
})
router.post('/forgotPass', (req,res)=>{
    const email = req.body.email;
    db.query('SELECT * FROM user WHERE email = ? ', [email] , (error , results) =>{
        if(error){
            console.log(error);
        }
        if(results.length > 0){
            
           const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                  user: 'webbreakers2@gmail.com',
                  pass: 'web2backend'
                },
                tls : { rejectUnauthorized: false }
              });
              
              const mailOptions = {
                from: 'webbreakers2@gmail.com',
                to: req.body.email,
                subject: 'Reset your password',
                text: 'Hello \n please reset your password using this link http://localhost:5002/resetPass\n from webbreakers team'
                
              };
             
  
            transporter.sendMail(mailOptions, function(error, info){
                if (error) {
                  console.log(error);
                } else {
                  console.log('Email sent: ' + info.response);
                  return res.render('forgotPass' , {
                  message: 'check your email to reset your password.'
                })
                }
              });
  
        }
        else{
            return res.render('forgotPass' , {
                message: 'email does not exists.'
              })
    }
    })
})
  
router.post('/resetPass',(req,res)=>{
    const email = req.body.email;
    const password = req.body.password;
    const passwordConfirm = req.body.passwordConfirm;
  
    if(password !== passwordConfirm){
        return res.render('resetPass' , {
            massage : 'password does not match.'
        });
    }
    db.query('SELECT email FROM user WHERE email = ? ', [email] , (error , results) =>{ 
        if(error){
            console.log(error);
        }
        else if(results.length > 0){
            db.query('UPDATE user SET password = ? WHERE email = ?', [password, email], function (err, result) {
                if (err) throw err;
                console.log(result);
                res.render('signin');
              });
  
        }
        else{
            return res.render('resetPass' , {
                message: 'email does not exists.'
              })
        } 
  
    })
})

module.exports = router;

