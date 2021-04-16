const router = require('express').Router();
const cloudinary = require('cloudinary');
const auth = require('../middleware/auth');
const authAdmin = require('../middleware/authAdmin');
const fs = require('fs');

// We will upload image on clouadinary
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET
});
// Upload image only admin can use
router.post('/upload', auth, authAdmin, (req, res) => {
    try {
        if(!req.files || Object.keys(req.files).length === 0) {
            removeTmp(file.tempFilePath)
            return res.status(400).json({msg: 'Nenhuma arquivo fez upload'});
        }

        const file = req.files.file;
        // if file size > 1mb
        if(file.size > 1024*1024) {
            removeTmp(file.tempFilePath);
            return res.status(400).json({msg: "O arquivo deve ser menor que 1mb"});
        }

        if(file.mimetype !== 'image/jpeg' && file.mimetype !== 'image/png') {
            removeTmp(file.tempFilePath)
            return res.status(400).json({msg: "O formato do arquivo deve ser .jpeg ou .png"});
        }

        cloudinary.v2.uploader.upload(
            file.tempFilePath,
            {folder: "Dani_Shop"}, 
            function(err, result) {
                if(err) {
                    console.log(err);
                }

                removeTmp(file.tempFilePath);

                res.json({public_id: result.public_id, url: result.secure_url});
            });
    } catch (err) {
        return res.status(500).json({msg: err.message});
    }
})

// Delete image only admin can use
router.post('/destroy', auth, authAdmin, (req, res) => {
    try {
        const {public_id} = req.body;
        if(!public_id) {
            return res.status(400).json({msg: "Nenhuma imagem foi selecionada"});
        }

        cloudinary.v2.uploader.destroy(public_id, async(err, result) => {
            if(err) throw err;

            res.json({msg: "A imagem foi deletada"});
        })
    } catch (err) {
        return res.status(500).json({msg: err.message});
    }
})

const removeTmp = (path) => {
    fs.unlink(path, err => {
        if(err) throw err;
    })
}
module.exports = router