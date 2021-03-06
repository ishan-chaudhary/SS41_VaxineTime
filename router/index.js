const express = require('express')
const router = express.Router()
require('../db/mongoose')
const User = require('../model/User')
const Done = require('../model/done_vaxine')
const {ensureAuthenticated} = require('../config/auth')
const qr = require('qrcode')
const Hospital = require('../model/hospital')

const ImageMimeType = ['image/jpeg','image/png','image/gif']


router.get('/vaccine', ensureAuthenticated, async (req, res) => {
    try {
       const hospital = await Hospital.find({})
      const user = await User.find({});
      const done = await Done.find({ user: req.user.id });
      console.log(hospital)
  
      res.render("vaccine", {
        user: req.user,
        done,
        hospital
      })
  
    }catch (err) {
      console.log(err)
    }
  })
  
  router.post('/vaccine', ensureAuthenticated, async (req, res) => {
  
    var { vaccineName, date, doctor, hospitalName, PresentPerson, mobileNO } = req.body
  
    
    const done = await Done.find({ user: req.user.id })
    const hospital = await Hospital.find({})
  
  
  
  
    var err = "";
    user = req.user.id;
  
  
    if (!vaccineName || !date ||!doctor || !hospitalName || !PresentPerson || !mobileNO) {
      err = "please fill in all the fields!!"
      res.render("vaccine", {
        err : err,
        user: req.user,
        done,
        hospital
      });
    }else{
      Done.findOne({ vaccineName: vaccineName, user: user })
      .then((vaxine) => {
        if (!vaxine) {
          req.body.user = req.user.id;
          Done.create(req.body)
            .then(() => {
              res.redirect("/vaccine");
            })
            .catch((err) => {
              console.log(err);
            });
        } else {
          err = vaxine.vaccineName + " Vaccine is already applied!!";
          res.render("vaccine", {
            err: err,
            user: req.user,
            done,
            hospital
          });
        }
      })
        .catch((err) => {
          console.log(err)
        });
      } 
      
   
  });
  


router.get('/profile',ensureAuthenticated,async(req,res)=>{
    try{
    const done = await Done.find({ user: req.user.id });

    const src = ({
        ChildId:req.user.childID,
        Name:req.user.cname,
        Parent_Name:req.user.parentName,
        AadharID:req.user.aadharID,
        BaalId:req.user.baalId,
        PhoneNO:req.user.phoneNO,
        Address:req.user.addr,
        Gender:req.user.gender,
        DOB:req.user.dateVac,
        City:req.user.city,
        State:req.user.state
    })
    const url = await qr.toDataURL(JSON.stringify(src))
    res.render('profile',{
        user:req.user,
        done,
        src,
        url
    })
    }catch(err){
        console.log(err)
    }

})

router.post('/profile',ensureAuthenticated,async(req,res)=>{

    var Icover = req.body.cover

    saveCover(req.user,Icover)


    try{
        const user = await req.user.save()
        res.redirect('profile')
    
    }catch(err){
        console.log(err)
    }   



})


router.get('/change',(req,res)=>{
    res.render('change')
})

router.get('/update',ensureAuthenticated,(req,res)=>{
    res.render('update')
})

router.post('/update',ensureAuthenticated,(req,res)=>{
    var { update} = req.body;
    const user = User.findOne({})
    console.log(user.cname)
})


function saveCover(user,coverEncoded){
    if(coverEncoded == null) return
    const cover = JSON.parse(coverEncoded)
    if(cover != null && ImageMimeType.includes(cover.type)){
        user.coverImage = new Buffer.from(cover.data,'base64')
        user.coverImageType = cover.type
    }
}


router.get('/info',(req,res)=>{
    res.render('info')
})

router.get('/test',(req,res)=>{
    res.render('test')
  })
  
  router.post('/test',(req,res)=>{
    const {HospitalId,HospitalName} = req.body;
    const newhospitals = new Hospital({
      HospitalId,
      HospitalName
  
    })
    newhospitals.save().then(()=>{
      console.log(`saved!!!`)
    }).catch((err)=>{
      console.log(err)
    })
  })

  router.get('/data',async(req,res)=>{
    const user = User.find({})
    const done = Done.find({})
    
    const userC = await User.countDocuments();
console.log(userC);
  const doneC = await Done.countDocuments();
console.log(doneC);
 
 res.render('data',{
  userC,
  doneC
 })
})


router.get('/docReg',(req,res)=>{
  res.render('docRegister')
})
var err = [];
router.post('/docReg',(req,res)=>{
  const { admin,admin2 } =req.body
  if(admin === 'admin' && admin2 === 'admin'){
    res.redirect('/data');
  }else{
    err.push({msg:'Invalid credentials'});
    res.render('docRegister',{
        err,
        admin,
        admin2

  })
}
})

router.get('/call',(req,res)=>{
  res.render('call')
})

router.get('*', (req, res) => {
    res.render('404')
  })


module.exports = router