require("dotenv").config()
const jwt=require("jsonwebtoken")

// console.log("jwtsecret:",process.env.JWT_SECRET)
const genrateToken = async (userId)=>{
    return jwt.sign({ id:userId }, process.env.JWT_SECRET, { expiresIn: "7d" })
}

module.exports=genrateToken;