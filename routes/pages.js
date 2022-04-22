const express = require("express");
const sql = require("mysql");
const router = express.Router();

const redirectLogin = (req,res,next) =>{
    if (!req.session.userID){
      res.redirect('/signin')
    }else{
        next()
    }
  }

  const db = sql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'housings'
  });
  
  db.connect((error) => {
    if (error) {
         console.log(error)
     } else {
      console.log("MYSQL connected ...")
    }
   });

router.get('/', (req, res) => {
    res.render('home');
});


router.get('/signup', (req, res) => {
    res.render('signup');
});

router.get('/signin', (req, res) => {
    const{userID} = req.session;
    res.render('signin');
});

router.get('/forgotPass', (req, res) => {
    res.render('forgotPass');
});

router.get('/resetPass', (req, res) => {
    res.render('resetPass');
});

router.get('/book',redirectLogin, (req, res) => {
    res.render('book');
});

router.get('/admin',redirectLogin, (req, res) => {
    res.render('admin');
});

router.get('/user',redirectLogin, (req, res) => {
    res.render('user');
});

router.get('/resendEmail', (req, res) => {
    res.render('emailVerfication');
}); 

router.get('/addApartment', (req, res) => {
    res.render('addApartment');
}); 

router.get('/editDetails', (req, res) => {
    res.render('edit');
}); 

router.get('/profile', (req, res) => {
    db.query('SELECT * FROM user WHERE id = ? ' ,[req.params.id], (error , rows ) =>{
        res.render('profile',{rows});
    })
    
});

router.get('/userapartment', (req, res) => {
    db.query('SELECT * FROM apartment WHERE NOT remainingRoommates = 0' , (error , rows ) =>{
        
        if(error)console.log(error)
        else{
            res.render('userApartment',{rows});
        }
    })
});

router.get('/adminapartment', (req, res) => {
    db.query('SELECT * FROM apartment WHERE NOT remainingRoommates = 0 ' , (error , rows ) =>{
        
        if(error)console.log(error)
        else{
            res.render('adminApartment',{rows});
        }
    })
  
});

router.get('/apartments', (req, res) => {
   
    db.query('SELECT * FROM apartment WHERE NOT remainingRoommates = 0 ' , (error , rows ) =>{
        
        if(error)console.log(error)
        else{
            res.render('apartments',{rows});
        }
    })
    
}); 



module.exports = router;