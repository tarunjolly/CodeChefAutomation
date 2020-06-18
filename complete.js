let puppeeter = require('puppeteer');
let fs = require('fs');
let credentailfile = process.argv[2];
let songName = process.argv[3];

(async function () {
    let data = await fs.promises.readFile(credentailfile, "utf-8");
    let credentails = JSON.parse(data);
    let login = credentails.login;
    let email = credentails.email;
    let pwd = credentails.pwd;
    let browser = await puppeeter.launch({
        headless: false,
        defaultViewport: null,
        args: ["--start-maximized"],
        slowMo: 50,
    })
    // let numberofPages = await browser.pages();
    // let tab = numberofPages[0];
    let numberofPages = await browser.pages();
    let tab = numberofPages[0];
    await tab.goto("https://www.youtube.com/", { waitUntil: "networkidle2" });
    await tab.waitForSelector("input[id='search']");
    await tab.type("input[id='search']", songName);
    await tab.waitForSelector("button[id='search-icon-legacy']");
    await tab.click("button[id='search-icon-legacy']");
    await tab.waitForSelector("a[id='video-title']");
    let songPlay = await tab.$("a[id='video-title']");
    await songPlay.click("a[id='video-title']");
    await tab.waitFor(3000);
    tab = await browser.newPage();
    await tab.goto(login, { waitUntil: "networkidle2" });
    //login
    await loginfn(tab, email, pwd);
    await tab.waitForSelector("table.dataTable tbody tr td");
    let allques = await tab.$$("table.dataTable tbody tr td");
    console.log(allques.length);
    //let newTab=await browser.newPage();
    //let firstques = [allques[0], allques[1], allques[2], allques[3]];
    let arrhref = await solveall(tab, allques);
    console.log(arrhref);
    for (let i = 0; i < arrhref.length; i++) {
        await solveeachques(tab, arrhref[i]);
    }
})();

async function solveall(tab, allques) {
    let a = [];
    for (let i = 0; i < 12; i += 4) {
        let queshref = await tab.evaluate(function (element) {
            let a = element.querySelector('a');
            return a.getAttribute("href");
        }, allques[i]);
        a.push(queshref);
    }
    return a;
}

async function loginfn(tab, email, pwd) {   //email
    await tab.waitForSelector("input#edit-name");
    await tab.type("input#edit-name", email, { delay: 100 });
    //pwd
    await tab.waitForSelector("input#edit-pass");
    await tab.type("input#edit-pass", pwd, { delay: 100 });
    //login button 
    await tab.waitForSelector("input#edit-submit");
    await tab.click("input#edit-submit");
    console.log("Logged into CodeChef");
    //Naviate to Problems=>Beginner
    await tab.waitForSelector("#menu-302");
    await Promise.all([tab.click("#menu-302"), tab.waitForNavigation({ waitUntil: "networkidle2" })]);
}

async function solveeachques(tab, ques) {
    //console.log(ques);
    //let a=ques[0];
    await tab.goto(`https://www.codechef.com${ques}`, { waitUntil: "networkidle2" });
    console.log("Question is Opened");
    //view all the submission
    await tab.waitForSelector(".button-submissions");
    let viewsubmission = await tab.$(".button-submissions");
    let viewallhref = await tab.evaluate(function (element) {
        let hrefs = element.querySelectorAll('a');
        let gotcha = hrefs[1].getAttribute("href");
        return gotcha;
    }, viewsubmission);
    await tab.goto(`https://www.codechef.com${viewallhref}`, { waitUntil: "networkidle2" });
    await getsolution(tab, ques);
}
async function getsolution(tab, queshref) {
    await tab.waitForSelector("select#language");
    await tab.select("select#language", "10");
    await tab.waitForSelector("select#status");
    await tab.select("select#status", "15");
    await tab.waitForSelector("input[name='Submit']");
    await Promise.all([tab.click("input[name='Submit']"), tab.waitForNavigation({ waitUntil: "networkidle2" })]);
    //await tab.waitForNavigation({waitUntil:"networkidle2"});
    await tab.waitForSelector("table.dataTable tr li a");
    let allhref = await tab.$$("table.dataTable tr li a");
    console.log(allhref.length);
    let getfirst = await tab.evaluate(function (element) {
        return element.getAttribute("href");
    }, allhref[0])
    console.log(getfirst);
    await tab.goto(`https://www.codechef.com/${getfirst}`, { waitUntil: "networkidle2" });
    await tab.waitForSelector("a#copy-button");
    let copied = await tab.$("a#copy-button");
    await copied.click();
    await tab.goto(`https://www.codechef.com${queshref}`, { waitUntil: "networkidle2" });
    await tab.waitForSelector(".button.blue.right");
    await Promise.all([tab.click(".button.blue.right"), tab.waitForNavigation({ waitUntil: "networkidle2" })]);
    //whenever we navigate always wait for navigation
    // await tab.waitForSelector("textarea.textarea");
    // let editor=await tab.$("textarea.textarea");
    //iframe#frame_edit-program
    await tab.waitForSelector("iframe#frame_edit-program");
    let frameHandle = await tab.$("iframe#frame_edit-program");
    let frame = await frameHandle.contentFrame();
    await frame.waitForSelector("textarea#textarea");
    let code1 = await frame.$("textarea#textarea");
    code1.click();
    // await tab.waitForSelector("div#container");
    // let editor=await tab.$("div#container");
    // await editor.click();
    await tab.keyboard.down('Control');
    await tab.keyboard.press('KeyV');
    await tab.keyboard.up('Control');
    await tab.select("select#edit-language");
    await tab.select("select#edit-language", "10");
    await tab.waitForSelector("input#edit-submit-1")
    await tab.click("input#edit-submit-1");
    console.log("done");
}


