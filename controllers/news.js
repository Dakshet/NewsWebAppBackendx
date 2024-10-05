const { validationResult } = require("express-validator");
const News = require("../models/news");
const cloudinary = require("../middlewares/cloudinary")
const fs = require('fs');

let success = false;

async function fetchAllNewsForHomePage(req, res) {
    try {
        const newsNews = await News.find({ tag: "NEWS" }).sort({ createdAt: -1 }).limit(3);
        const newsArticle = await News.find({ tag: "ARTICLE" }).sort({ createdAt: -1 }).limit(4);
        const newsInterview = await News.find({ tag: "INTERVIEW" }).sort({ createdAt: -1 }).limit(4);
        const newsEvent = await News.find({ tag: "EVENT" }).sort({ createdAt: -1 }).limit(4);
        const newsMagazine = await News.find({ tag: "MAGAZINE" }).sort({ createdAt: -1 }).limit(4);

        const news = [...newsNews, ...newsArticle, ...newsInterview, ...newsEvent, ...newsMagazine]

        success = true;
        return res.status(200).json({ success, news })

    } catch (error) {
        console.log(error.message);
        success = false;
        return res.status(500).json({ success, Error: "Internal Server Error Occured!" })
    }
}


async function fetchAllNewsForSpecificRoute(req, res) {
    try {
        const allNews = await News.find({ tag: req.query.tag }).sort({ createdAt: -1 });

        success = true;
        return res.status(200).json({ success, allNews })

    } catch (error) {
        console.log(error.message);
        success = false;
        return res.status(500).json({ success, Error: "Internal Server Error Occured!" })
    }
}


async function fetchSpecificNews(req, res) {
    try {
        const news = await News.findById(req.params.newsId)

        success = true;
        return res.status(200).json({ success, news })

    } catch (error) {
        console.log(error.message);
        success = false;
        return res.status(500).json({ success, Error: "Internal Server Error Occured!" })
    }
}


async function fetchSearchNews(req, res) {
    try {

        const keyword = req.query.search ? {
            title: { $regex: req.query.search, $options: "i" }
        } : {};

        const news = await News.find({ ...keyword })

        success = true;
        return res.status(200).json({ success, news })

    } catch (error) {
        console.log(error.message);
        success = false;
        return res.status(500).json({ success, Error: "Internal Server Error Occured!" })
    }
}


async function addNews(req, res) {
    try {
        //Destructure the request
        const { title, body, tag, coverImageURL } = req.body;

        //Validate the fields
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            success = false;
            return res.status(400).json({ success, Error: errors.array()[0].msg })
        }

        //Add data in DB
        let news = await News.create({
            title,
            body,
            tag,
            createdUser: req.user.id,
            coverImageURL,
        })

        news = await news.save();

        //Final
        success = true;
        return res.status(201).json({ success, news })

    } catch (error) {
        console.log(error.message);
        success = false;
        return res.status(500).json({ success, Error: "Internal Server Error Occured!" })
    }
}


async function addMagazine(req, res) {
    try {
        // //Destructure the request
        const { title, body, coverImageURL } = req.body;

        //Add data in DB
        let news = await News.create({
            title,
            body,
            tag: "MAGAZINE",
            createdUser: req.user.id,
            coverImageURL,
        })

        news = await news.save();
        // console.log(news);

        // //Final
        success = true;
        return res.status(201).json({ success, news })

        // console.log(req.file);
        // Give the data type also so accroding to that they fetch it.

    } catch (error) {
        console.log(error.message);
        success = false;
        return res.status(500).json({ success, Error: "Internal Server Error Occured!" })
    }
}


async function updateNews(req, res) {
    try {
        //Destructrue the request
        const { title, desc, tag, prevDescription } = req.body;
        // console.log("ccc", prevDescription);


        //Logic to Find out src link from the description, but this logic for only one src are present in the description that time they work.

        function findImgSrc(htmlString) {
            const regex = /<img[^>]+src="([^"]+)"/g; // Regular expression to match img tag with src attribute
            const matches = htmlString.matchAll(regex); // Find all matches

            const imgSrcList = [];
            for (const match of matches) {
                imgSrcList.push(match[1]); // Extract and store the captured src attribute
            }

            return imgSrcList;
        }

        const imgSrcList = findImgSrc(desc);
        const imgSrcList1 = findImgSrc(prevDescription);

        if (imgSrcList.length !== 0 && imgSrcList1.length !== 0) {

            async function compareArrays(arr1, arr2) {
                const matches = arr1.filter(element => arr2.includes(element));
                const unmatches = arr2.filter(element => !arr1.includes(element));

                if (unmatches.length !== 0) {
                    //Delete news from cloudinary
                    for (let imgLink of unmatches) {
                        try {
                            //Separate the cloudinary image id
                            const urlArray = imgLink.split("/");
                            const image = urlArray[urlArray.length - 1];
                            const imageName = image.split(".")[0];

                            //Delete from cloudinary
                            const result = await cloudinary.uploader.destroy(imageName);
                            // console.log(result);
                        } catch (error) {
                            success = false;
                            return res.status(400).json({ success, Error: error });
                        }
                    }
                }
                else {
                    console.log(matches);
                }
            }

            compareArrays(imgSrcList, imgSrcList1);
        }

        //Create the new object
        const newNews = {};

        if (title) {
            newNews.title = title;
        }

        if (desc) {
            newNews.body = desc;
        }

        if (tag) {
            newNews.tag = tag;
        }


        //Verified the news id first
        let news = await News.findById(req.params.newsId)

        if (!news) {
            success = false;
            return res.status(404).json({ success, Error: "News is not found!" })
        }

        //Verified the news user and login user
        if (news.createdUser.toString() !== req.user.id) {
            success = false;
            return res.status(404).json({ success, Error: "You can't edit news!" })
        }

        //Update news
        news = await News.findByIdAndUpdate(req.params.newsId, { $set: newNews }, { new: true })

        //Final
        success = true;
        return res.status(200).json({ success, news })

    } catch (error) {
        console.log(error.message);
        success = false;
        return res.status(500).json({ success, Error: "Internal Server Error Occured!" })
    }
}


async function deleteNews(req, res) {
    try {
        //Verified the news id first
        let coverImageURL = req.query.coverImage;

        //Separate the cloudinary image id
        const urlArray = coverImageURL.split("/");
        const image = urlArray[urlArray.length - 1];
        const imageName = image.split(".")[0];


        let news = await News.findById(req.query.id);


        if (!news) {
            success = false;
            return res.status(404).json({ success, Error: "News is not found!" })
        }

        //Verified the news user and login user
        if (news.createdUser.toString() !== req.user.id) {
            success = false;
            return res.status(404).json({ success, Error: "You can't delete news!" })
        }

        //Delete news
        news = await News.findByIdAndDelete(req.query.id)

        //Delete image from cloudinary
        await cloudinary.uploader.destroy(imageName, (error, result) => {
            // console.log(error, result);
            try {
                // console.log(result);
            } catch (error) {
                success = false;
                return res.status(400).json({ success, Error: error });
            }
        })

        //Final
        success = true;
        return res.status(200).json({ success, news })

    } catch (error) {
        console.log(error.message);
        success = false;
        return res.status(500).json({ success, Error: "Internal Server Error Occured!" })
    }
}


async function deleteMagazine(req, res) {
    try {
        //Verified the news id first
        let coverImageURL = req.query.coverImage;
        let pdfURL = req.query.pd;


        //Separate the cloudinary image id
        const urlArray = coverImageURL.split("/");
        const image = urlArray[urlArray.length - 1];
        const imageName = image.split(".")[0];

        //Separate the 
        const urlArrayPdf = pdfURL.split("/");
        const pdf = urlArrayPdf[urlArrayPdf.length - 1];
        // const pdfName = pdf.split(".")[0];


        let news = await News.findById(req.query.id);

        if (!news) {
            success = false;
            return res.status(404).json({ success, Error: "News is not found!" })
        }

        //Verified the news user and login user
        if (news.createdUser.toString() !== req.user.id) {
            success = false;
            return res.status(404).json({ success, Error: "You can't delete news!" })
        }

        //Delete news

        //1] Delete from Storage
        // let allPdf = await News.findById(req.query.id);

        // try {
        //     fs.unlinkSync(`../backend/uploads/${allPdf.body}`);

        // } catch (error) {
        //     console.log(error);

        // }


        //2] Delete from backend
        news = await News.findByIdAndDelete(req.query.id)

        // Delete the image from Cloudinary
        const imageDeletionResult = await cloudinary.uploader.destroy(imageName);

        if (imageDeletionResult.result !== 'ok') {
            console.log(`Error deleting image: ${imageDeletionResult}`);
            return res.status(500).json({ success: false, Error: "Failed to delete image from Cloudinary." });
        }


        // // Delete the PDF from Cloudinary (resource_type: "raw" is required for non-image files like PDFs)
        const pdfDeletionResult = await cloudinary.uploader.destroy(pdf, {
            resource_type: "raw"
        });

        if (pdfDeletionResult.result !== 'ok' && pdfDeletionResult.result !== 'not found') {

            console.log(`Error deleting PDF: ${JSON.stringify(pdfDeletionResult)}`);
            return res.status(500).json({ success: false, Error: "Failed to delete PDF from Cloudinary." });

        } else if (pdfDeletionResult.result === 'not found') {
            console.log("PDF not found, skipping deletion.");
        }

        //Final
        success = true;
        return res.status(200).json({ success, news })

    } catch (error) {
        console.log(error.message);
        success = false;
        return res.status(500).json({ success, Error: "Internal Server Error Occured!" })
    }
}

module.exports = {
    fetchAllNewsForHomePage,
    addNews,
    updateNews,
    deleteNews,
    fetchSpecificNews,
    fetchAllNewsForSpecificRoute,
    fetchSearchNews,
    addMagazine,
    deleteMagazine,
}
