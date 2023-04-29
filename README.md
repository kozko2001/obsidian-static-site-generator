# obsidian-static-site-generator


### Try it out --- Only linux 

1. execute the `./scripts/001-download-obsidian.sh` --- will download obsidian into the /tmp folder and uncompress

2. `npm install` to install playwright that will controll obsidian

3. `node script.js`


### Try it out with Docker

1. build the image `docker build -t obsidian-static-site-generator .`

2. run the image and mount your vault and output folder

```
docker run -v $(pwd)/vault-test:/vault -v $(pwd)/output:/output obsidian-static-site-generator
```

To debug what is happening add a terminal input, wait until ask to connect throug vnc, open the url and press Enter to continue the script

```
docker run -v $(pwd)/vault-test:/vault -v $(pwd)/output:/output -ti  obsidian-static-site-generator
```
