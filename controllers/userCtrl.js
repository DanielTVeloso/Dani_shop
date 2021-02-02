const Users = require('../models/userModel');
const Payments = require('../models/paymentModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')

const userCtrl = {
    register: async (req, res) => {
        try {
            const {name, email, password} = req.body;

            const user = await Users.findOne({email})
            // User Validation
            if (user) {
                return res.status(400).json({msg: "O email ja existe..."})
            } 

            // Password Validation
            if (password.length < 6) {
                return res.status(400).json({msg: "A senha deve ter no mínimo 6 caracteres"});
            }
            
            //Password Encryption
            const passwordHash = await bcrypt.hash(password, 10)
            const newUser = new Users({
                name, email, password: passwordHash
            })

            // Save mongodb
            await newUser.save();

            // Then create jsonwebtoken to authentication
            const accesstoken = createAccessToken({id: newUser._id})
            const refreshtoken = createRefreshToken({id: newUser._id})
            
            res.cookie('refreshtoken', refreshtoken, {
                httpOnly: true,
                path: '/user/refresh_token',
                maxAge: 7*24*60*60*1000 //7d
            })

            res.json(accesstoken);
        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
        
    },
    login: async (req, res) => {
        try {
            const{email, password} = req.body;

            const user = await Users.findOne({email});
            // Check if user exists
            if(!user) { 
                return res.status(400).json({msg: "O usuário não existe"})
            }
            const isMatch = await bcrypt.compare(password, user.password)
            // Check if password matchs
            if(!isMatch) {
                return res.status(400).json({msg: "A senha está incorreta"})
            }

            // if login success, create access token and refresh token
            const accesstoken = createAccessToken({id: user._id})
            const refreshtoken = createRefreshToken({id: user._id})
            
            res.cookie('refreshtoken', refreshtoken, {
                httpOnly: true,
                path: '/user/refresh_token',
                maxAge: 7*24*60*60*1000 //7d
            })

            res.json(accesstoken);
        } catch (err) {
            return res.status(500).json({msg: err.message});
        }
    },
    logout: async (req, res) => {
        try {
            res.clearCookie('refreshtoken', {path: '/user/refresh_token'});
            return res.json({msg: "Voce deslogou com sucesso!"});
            
        } catch (err) {
            return res.status(500).json({msg: err.message});
        }
    },
    refreshToken: (req, res) => {
        try {
            const rf_token = req.cookies.refreshtoken;
            if(!rf_token) {
                return res.status(400).json({msg: "Por favor faça login ou registre"})
            }

            jwt.verify(rf_token, process.env.REFRESH_TOKEN_SECRET, (err, user) =>{
                if(err) {
                    return res.status(400).json({msg: "Por favor faça login ou registre"})
                } 
                const accesstoken = createAccessToken({id: user.id})
                res.json({accesstoken})
            });
        } catch(err) {
            return res.status(500).json({msg: err.message});
        }
        
    },
    getUser: async(req, res) => {
        try {
            // res.json(req.user) // id of user
            const user = await Users.findById(req.user.id).select('-password');
            if(!user) {
                return res.status(400).json({msg: "O usuário não existe"}); 
            }

            res.json(user);
            
        } catch (error) {
            return res.status(500).json({msg: err.message});
        }
    },
    addCart: async(req, res) => {
        try {
            const user = await Users.findById(req.user.id);
            if(!user) {
                return res.status(400).json({msg: "O usuário não existe"}); 
            }

            await Users.findOneAndUpdate({_id: req.user.id}, {
                cart: req.body.cart
            })

            return res.json({msg: "Adicionado ao carrinho"});
        } catch (err) {
            return res.status(500).json({msg: err.message});
        }
    },
    history: async(req, res) => {
        try {
           const history = await Payments.find({user_id: req.user.id});

           res.json(history);
        } catch (err) {
            return res.status(500).json({msg: err.message});
        }
    }
}

const createAccessToken = (user) => {
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '11m'});
}
const createRefreshToken = (user) => {
    return jwt.sign(user, process.env.REFRESH_TOKEN_SECRET, {expiresIn: '7d'});
}



module.exports = userCtrl;