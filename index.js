const { writeFile } = require("fs");
const { join } = require("path");
const request = require("request");
const mergeImg = require("merge-img");
const argv = require("minimist")(process.argv.slice(2));

const {
  greeting = "Hello",
  who = "You",
  width = 400,
  height = 500,
  color = "Pink",
  size = 100,
} = argv;

// Construct the request api url
const constructUrl = (text) => {
  const webUrl = "https://cataas.com/cat/says/";
  return {
    url: `${webUrl}${text}?width=${width}&height=${height}&color=${color}&s=${size}`,
    encoding: "binary",
  };
};

// Fetch Cat image from API
const fetchFromApi = (req) => {
  return new Promise((resolve, reject) => {
    request.get(req, (err, res, body) => {
      if (err) {
        console.log(err);
        reject(err);
      } else {
        console.log("Received response with status:" + res.statusCode);
        resolve(body);
      }
    });
  });
};

// Merge received two images function
const mergeImage = async (image1, image2) => {
  try {
    const img = await mergeImg([
      { src: Buffer.from(image1, "binary"), x: 0, y: 0 },
      { src: Buffer.from(image2, "binary"), x: argv.width, y: 0 },
    ]);

    img.getBuffer("image/jpeg", (err, buffer) => {
      if (err) {
        console.log(err);
        return;
      }
      const fileOut = join(process.cwd(), `/cat-card.jpg`);
      writeFile(fileOut, buffer, "binary", (err) => {
        if (err) {
          console.log(err);
          return;
        }
        console.log("The file was saved!");
      });
    });
  } catch (err) {
    console.log(err);
  }
};

// Invoking Main function
(async () => {
  try {
    const [res1, res2] = await Promise.all([
      fetchFromApi(constructUrl(greeting)),
      fetchFromApi(constructUrl(who)),
    ]);
    mergeImage(res1, res2);
  } catch (err) {
    console.log(err);
  }
})();
