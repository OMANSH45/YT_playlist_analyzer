// a. Name of Playlist,view
// b. Total No of videos : 792
// c. actual No of videos :783
// d. Total length of playlist : 12 hours, 9 minutes, 12 seconds
// At 1.25x : 9 hours, 43 minutes, 21 seconds

// At 1.50x : 8 hours, 6 minutes, 8 seconds
// At 1.75x : 6 hours, 56 minutes, 41 seconds
// At 2.00x : 6 hours, 4 minutes, 36 seconds
// Average length of video : 29 minutes, 10 seconds

// e. console.table of video number,name,time



// Current Task : name of playlist ,views,total videos, 

const puppeteer = require("puppeteer");
let page;
let timeInMin=0;
let timeInSec=0;
(async function fn() {
    let browser = await puppeteer.launch({
        headless: false, defaultViewport: null,
        args: ["--start-maximized"],
    })
    page = await browser.newPage();
    await page.goto("https://www.youtube.com/playlist?list=PLzkuLC6Yvumv_Rd5apfPRWEcjf9b1JRnq");

    //name of playlist
    await page.waitForSelector("#title .yt-simple-endpoint.style-scope.yt-formatted-string");
    let element=await page.$("#title .yt-simple-endpoint.style-scope.yt-formatted-string");
    let nameOfPlaylist=await page.evaluate(function(element){
        return element.textContent;
    },element);
    console.log("nameOfPlaylist: "+nameOfPlaylist);

    //total no, of videos
    let elementForvideos=await page.$$(".style-scope.ytd-playlist-sidebar-primary-info-renderer");
    let noOfVideos=await page.evaluate(function(element){
        return element.textContent;
    },elementForvideos[5]);
    console.log("noOfVideos: "+noOfVideos);
    let videos=noOfVideos.split(" ")[0].trim();

    //no. of views
    let noOfViews=await page.evaluate(function(element){
        return element.textContent;
    },elementForvideos[6]);
    console.log("noOfViews: "+noOfViews);

    console.log("**************");

    //list first 100 videos
    let loopcount=Math.floor(videos/100);
    for(let i=0;i<loopcount;i++){
        await page.click(".circle.style-scope.tp-yt-paper-spinner");

        await waitTillHTMLRendered(page);
        console.log("loaded the new videos");


    }
    

    //to find videos
    let videoNameElementList= await page.$$("a[id='video-title']");
    console.log(videoNameElementList.length);
    let lastVideo = videoNameElementList[videoNameElementList.length - 1];
    // last video -> view
    await page.evaluate(function (elem) {
        elem.scrollIntoView();
    }, lastVideo);

    // time 
    let timeList = await page.$$("span[id='text']");
    // console.log(timeList.length);

    let videosArr = [];
    
    for (let i = 0; i <timeList.length; i++) {
        let timeNTitleObj = await page.evaluate(getTimeAndTitle, timeList[i], videoNameElementList[i]);
        timeAddition(timeNTitleObj.time);
        videosArr.push(timeNTitleObj);
    }
    console.table(videosArr);
    timeInSec+=(timeInMin*60);
    console.log("Total length of playlist: "+convertHMS(timeInSec));
    let time125=Math.round(timeInSec/1.25);
    console.log("Total length of playlist At 1.25x: "+convertHMS(time125));
    let time15=Math.round(timeInSec/1.5);
    console.log("Total length of playlist At 1.5x: "+convertHMS(time15));
    let time175=Math.round(timeInSec/1.75);
    console.log("Total length of playlist At 1.75x: "+convertHMS(time175));
    let time2=Math.round(timeInSec/2);
    console.log("Total length of playlist At 2.00x: "+convertHMS(time2));


})();
function getTimeAndTitle(element1, element2) {
    return {
        time: element1.textContent.trim(),
        title: element2.textContent.trim()
    }
}

const waitTillHTMLRendered = async (page, timeout = 10000) => {
    const checkDurationMsecs = 1000;
    const maxChecks = timeout / checkDurationMsecs;
    let lastHTMLSize = 0;
    let checkCounts = 1;
    let countStableSizeIterations = 0;
    const minStableSizeIterations = 3;

    while (checkCounts++ <= maxChecks) {
        let html = await page.content();
        let currentHTMLSize = html.length;

        let bodyHTMLSize = await page.evaluate(() => document.body.innerHTML.length);

        console.log('last: ', lastHTMLSize, ' <> curr: ', currentHTMLSize, " body html size: ", bodyHTMLSize);

        if (lastHTMLSize != 0 && currentHTMLSize == lastHTMLSize)
            countStableSizeIterations++;
        else
            countStableSizeIterations = 0; //reset the counter

        if (countStableSizeIterations >= minStableSizeIterations) {
            console.log("Page rendered fully..");
            break;
        }

        lastHTMLSize = currentHTMLSize;
        await page.waitFor(checkDurationMsecs);
    }
};

function timeAddition(time){
    time=time.split(":");
    let min=Number(time[0]);
    let sec=Number(time[1]);

    timeInMin+=min;
    timeInSec+=sec;

}

function convertHMS(value) {
        const sec = parseInt(value, 10); // convert value to number if it's string
        let hours   = Math.floor(sec / 3600); // get hours
        let minutes = Math.floor((sec - (hours * 3600)) / 60); // get minutes
        let seconds = sec - (hours * 3600) - (minutes * 60); //  get seconds
        // add 0 if value < 10; Example: 2 => 02
        if (hours   < 10) {hours   = "0"+hours;}
        if (minutes < 10) {minutes = "0"+minutes;}
        if (seconds < 10) {seconds = "0"+seconds;}
        return hours+' hour(s) '+minutes+' minute(s) '+seconds+' second(s)'; // Return is HH : MM : SS
    }
