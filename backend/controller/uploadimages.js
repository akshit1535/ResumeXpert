import fs from 'fs';
import path from 'path';
import { upload } from '../utils/multerConfig.js';

import Resume from '../models/resumeModel.js';

export const uploadImage = async (req, res) => {
    try{
        upload.fields([{name: "thumbnail"}, {name: "profileImage"}])
        (req, res, async (err) => {
            if(err){
                return res.status(400).json({message: "File upload failed", error: err.message})
            }

            const resumeId = req.params.id;
            const resume = await Resume.findOne({_id: resumeId, userId: req.user._id});
            if(!resume){
                return res.status(404).json({message: "Resume Not Found"});
            }

            const uploadsFolder = path.join(process.cwd(), "uploads");
            const baseUrl = `${req.protocol}://${req.get("host")}`;

            const newThumbnail = req.files.thumbnail?.[0];
            const newProfileImage = req.files.profileImage?.[0];

            if(newThumbnail){
                if(resume.thumbnailLink){
                    const oldThumbnail = path.join(uploadsFolder, path.basename(resume.thumbnailLink));

                    if(fs.existsSync(oldThumbnail)){
                        fs.unlinkSync(oldThumbnail);
                    }
                }
                resume.thumbnailLink = `${baseUrl}/uploads/${newThumbnail.filename}`
            }

            if(newProfileImage){
                if(resume.profileInfo?.profilepreviewURL){
                    const oldProfile = path.join(uploadsFolder, path.basename(resume.profileInfo.profilepreviewURL));

                    if(fs.existsSync(oldProfile)){
                        fs.unlinkSync(oldProfile);
                    }
                }
                resume.profileInfo.profilepreviewURL = `${baseUrl}/uploads/${newProfileImage.filename}`
            }

            await resume.save();
            res.status(200).json({message: "Images uploaded successfully", 
            thumbnailLink: resume.thumbnailLink,
            profilepreviewURL: resume.profileInfo.profilepreviewURL
            });
        });
    }
    catch(err){
        console.error("Upload error:", err); 
        res.status(500).json({message: "Failed to upload image"});
    }
}