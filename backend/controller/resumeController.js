import Resume from '../models/resumeModel.js';
import fs from 'fs';
import path from 'path';

export const createResume = async (req, res) => {
    try{
        const { title } = req.body;

        const defaultResumeData = {
            profileInfo: {
                fullName: '',
                designation: '',
                summary: '',
            },
            contactInfo: {
                email: '',
                phone: '',
                location: '',
                linkedin: '',
                github: '',
                website: '',
            },
            workExperience: [
                {
                    company: '',
                    role: '',
                    startDate: '',
                    endDate: '',
                    description: '',
                },
            ],
            education: [
                {
                    degree: '',
                    institution: '',
                    startDate: '',
                    endDate: '',
                },
            ],
            skills: [
                {
                    name: '',
                    progress: 0,
                },
            ],
            projects: [
                {
                    title: '',
                    description: '',
                    github: '',
                    liveDemo: '',
                },
            ],
            certifications: [
                {
                    title: '',
                    issuer: '',
                    year: '',
                },
            ],
            languages: [
                {
                    name: '',
                    progress: '',
                },
            ],
            interests: [''],
        };

        const newResume = await Resume.create({
            userId: req.user._id,
            title,
            ...defaultResumeData,
            ...req.body,
        })
        res.status(201).json(newResume);
    }
    catch(error){
        return res.status(500).json({message: "Server Error"});
    }
}


export const getUserResumes = async (req, res)=>{
    try{
        const resume = await Resume.find({userId: req.user._id}).sort({
            updatedAt : -1
        });
        res.status(200).json(resume);
    }
    catch(error){
        return res.status(500).json({message: "Server Error"});
    }
}


export const getResumeById = async (req, res) =>{
    try{
        const resume = await Resume.findOne({_id: req.params.id, userId: req.user._id})

        if(!resume){
            return res.status(404).json({message: "Resume Not Found"});
        }
        res.status(200).json(resume);
    }
    catch(error){
        return res.status(500).json({message: "Server Error"});
    }
}


export const updateResume = async (req,res)=>{
    try{
        const resume = await Resume.findOne({
            _id: req.params.id,
            userId: req.user._id
        })
        if(!resume){
            return res.status(404).json({message: "Resume Not Found"});
        }

        Object.assign(resume, req.body);
        const savedResume = await resume.save();
        res.status(200).json(savedResume);
    }
    catch(error){
        return res.status(500).json({message: "Failed to Update Resume"});
    }
}


export const uploadResumeImages = async (req, res) => {
    try{
        const resume = await Resume.findOne({
            _id: req.params.id,
            userId: req.user._id
        });
        
        if(!resume){
            return res.status(404).json({message: "Resume Not Found"});
        }

        // Handle image upload logic here
        // This would integrate with multer or your image upload service
        
        res.status(200).json({
            message: "Images uploaded successfully",
            resume
        });
    }
    catch(error){
        return res.status(500).json({message: "Failed to upload images"});
    }
}



export const deleteResume = async (req, res)=>{
    try{
        const resume = await Resume.findOne({
            _id: req.params.id,
            userId: req.user._id
        })
        if(!resume){
            return res.status(404).json({message: "Resume Not Found"});
        }

        const uploadFolder = path.join(process.cwd(), 'uploads')

        if(resume.thumbnailLink){
            const oldThumbnail = path.join(uploadFolder, path.basename(resume.thumbnailLink))
            if(fs.existsSync(oldThumbnail)){
                fs.unlinkSync(oldThumbnail);
            }
        }

        if(resume.profileInfo ?.profilepreviewURL){
            const oldProfile = path.join(uploadFolder, path.basename(resume.profileInfo.profilepreviewURL))
            if(fs.existsSync(oldProfile)){
                fs.unlinkSync(oldProfile);
            }
        }

        const deleted = await Resume.findByIdAndDelete({
            _id: req.params.id,
            userId: req.user._id
        })
        if(!deleted){
            return res.status(404).json({message: "Resume Not Found"});
        }
        res.status(200).json({message: "Resume Deleted Successfully"});
    }
    catch(error){
        return res.status(500).json({message: "Failed to Delete Resume"});
    }
}