const sharp = require("sharp");

const compressImage = async (
  inputPath,
  outputPath,
  width = 800
) => {

  try {

    await sharp(inputPath)

      .resize(width)

      .webp({
        quality: 70,
      })

      .toFile(outputPath);

  } catch (error) {

    // console.log(
    //   "Image Compression Error:",
    //   error
    // );

    throw error;

  }

};

module.exports = compressImage;