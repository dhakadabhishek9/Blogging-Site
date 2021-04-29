const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');

const Profile = require('../../models/profile');
const User = require('../../models/User');
const Post=require('../../models/Post')

const { check,validationResult }=require('express-validator/check');
const profile = require('../../models/profile');

//@route GET api/profile/me
//@desc Get current users profile
//@access Private
router.get('/me', auth ,async (req,res) => {
    try {
        const profile = await Profile.findOne({
            user: req.user.id
          }).populate('user', ['name', 'avatar']);

          if (!profile) {
            return res.status(400).json({ msg: 'There is no profile for this user' });
          }
      
          res.json(profile);
    } catch (err) {
        console.error(err.mesage);
        res.status(500).send('Server Error');
    }
});

//@route POST api/profile
//@desc Create or update user
//@access Private
router.post('/',[
    auth,
    [
        check('status', 'Status is required').notEmpty(),
        check('skills', 'Skills is required').notEmpty()
    ]
],
async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
     {
      return res.status(400).json({ errors: errors.array() });
    }

const {
    company,
    website,
    location,
    bio,
    status,
    githubusername,
    skills,
    youtube,
    twitter,
    instagram,
    linkedin,
    facebook
  } = req.body;

  // build a profile
  const profileFields = {};
  profileFields.user=req.user.id;
  if(website)profileFields.website=website;
  if(company)profileFields.company=company;
  if(location)profileFields.location=location;
  if(bio)profileFields.bio=bio;
  if(status)profileFields.status=status;
  if(githubusername)profileFields.githubusername=githubusername;
  if(skills){
      profileFields.skills=skills.split(',').map(skill => skill.trim());
  }

  //Build social objects
  profileFields.social={};
  if(youtube)profileFields.social.youtube=youtube;
  if(twitter)profileFields.social.twitter=twitter;
  if(facebook)profileFields.social.facebook=facebook;
  if(linkedin)profileFields.social.linkedin=linkedin;
  if(instagram)profileFields.social.instagram=instagram;

  try {
      let profile =await Profile.findOne({user: req.user.id});
      if(profile)
      {
          profile=await Profile.findOneAndUpdate(
              {user: req.user.id},
              { $set: profileFields },
              {new:true}
              );
            return res.json(profile);
      }
      profile =new Profile(profileFields);

      await profile.save();
      res.json(profile);
  } catch (err) {
      console.error(err.mesage);
      res.status(500).send('server error');
  }
});

// @route    GET api/profile
// @desc     Get all profiles
// @access   Public
router.get('/', async (req, res) => {
    try {
      const profiles = await Profile.find().populate('user', ['name', 'avatar']);
      res.json(profiles);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  });

  // @route    GET api/profile/user/:user_id
// @desc     Get profile by user ID
// @access   Public
router.get(
    '/user/:user_id',
    async (req, res) => {
      try {
        const profile = await Profile.findOne({
          user: req.params.user_id
        }).populate('user', ['name', 'avatar']);
  
        if (!profile) return res.status(400).json({ msg: 'Profile not found' });
  
        return res.json(profile);
      } catch (err) {
        console.error(err.message);
        return res.status(500).json({ msg: 'Profile not found' });
      }
    }
  );
  
  // @route    DELETE api/profile
// @desc     Delete profile, user & posts
// @access   Private
router.delete('/', auth, async (req, res) => {
    try { 
      // Remove user posts
      await Post.deleteMany({user:req.user.id});
      // Remove profile
      // Remove user
      await Profile.findOneAndRemove({ user: req.user.id });
       await User.findOneAndRemove({ _id: req.user.id });  
      res.json({ msg: 'User deleted' });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  });

// @route    PUT api/profile/experience
// @desc     Add profile experience
// @access   Private
router.put(
    '/experience',
    auth,
    check('title', 'Title is required').notEmpty(),
    check('company', 'Company is required').notEmpty(),
    check('from', 'From date is required and needs to be from the past')
      .notEmpty(),
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const {
          title,
          company,
          location,
          from,
          to,
          current,
          description
      }=req.body;

      const newExp={
        title,
        company,
        location,
        from,
        to,
        current,
        description
      }
  
      try {
        const profile = await Profile.findOne({ user: req.user.id });
  
        profile.experience.unshift(newExp);
  
        await profile.save();
  
        res.json(profile);
      } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
      }
    }
  );

  // @route    DELETE api/profile/experience/:exp_id
// @desc     Delete experience from profile
// @access   Private

router.delete('/experience/:exp_id', auth, async (req, res) => {
    try {
      const profile = await Profile.findOne({ user: req.user.id });
  
      const removeIndex=profile.experience.map(item => item.id)
      .indexOf(req.params.exp_id);
      profile.experience.splice(removeIndex,1);
  
      await profile.save();
      res.json(profile);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ msg: 'Server error' });
    }
  });

// @route    PUT api/profile/education
// @desc     Add profile education
// @access   Private
router.put(
    '/education',
    auth,
    check('school', 'School is required').notEmpty(),
    check('degree', 'Degree is required').notEmpty(),
    check('fieldofstudy', 'Field of study is required').notEmpty(),
    check('from', 'From date is required and needs to be from the past')
      .notEmpty(),
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const {
        school,
        degree,
        fieldofstudy,
        from,
        to,
        current,
        description
    }=req.body;

    const newEdu={
        school,
        degree,
        fieldofstudy,
      from,
      to,
      current,
      description
    }

      try {
        const profile = await Profile.findOne({ user: req.user.id });
  
        profile.education.unshift(newEdu);
  
        await profile.save();
  
        res.json(profile);
      } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
      }
    }
  );
  
   // @route    DELETE api/profile/education/:edu_id
// @desc     Delete education from profile
// @access   Private

router.delete('/education/:edu_id', auth, async (req, res) => {
    try {
      const profile = await Profile.findOne({ user: req.user.id });
  
      const removeIndex=profile.education.map(item => item.id)
      .indexOf(req.params.edu_id);
      profile.education.splice(removeIndex,1);
  
      await profile.save();
      res.json(profile);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ msg: 'Server error' });
    }
  });

module.exports=router;
