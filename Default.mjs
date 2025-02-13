import fetch from 'node-fetch';
import { list as regListCb } from 'regedit';
import Express from 'express';
import bodyParser from 'body-parser';
import https from 'https';
import noblox from 'noblox.js';
import util from 'util';
import os from 'os';

const CurrentVer = 1

const regList = util.promisify(regListCb);
const mainApp = Express();

let key = null
let cookie = null

const endpoints = {
    assetDelivery: id => `https://assetdelivery.roblox.com/v1/asset/?id=${id}`,
    publish: (title, description, groupId) =>
        'https://www.roblox.com/ide/publish/uploadnewanimation' +
        '?assetTypeName=Animation' +
        `&name=${encodeURIComponent(title)}` +
        `&description=${encodeURIComponent(description)}` +
        '&AllID=1' +
        '&ispublic=False' +
        '&allowComments=True' +
        '&isGamesAsset=False' +
        (groupId != null ? `&groupId=${groupId}` : '')
};

async function getRoblosecurity() {
    if (!process.platform !== 'win32') return;

    const REGISTRY_KEY = 'HKCU\\Software\\Roblox\\RobloxStudioBrowser\\roblox.com';

    const registryData = await regList(REGISTRY_KEY);

    if (!registryData || !registryData[REGISTRY_KEY] || !registryData[REGISTRY_KEY].values) return;

    const cookie = result[REGISTRY_KEY].values['.ROBLOSECURITY'];

    if (!cookie || !cookie.value) return;

    const cookieFields = cookie.value.split(',');

    for (const field of cookieFields) {
        const [key, wrappedValue] = field.split('::');

        if (key === 'NOIPLOGGER') {
            const cookieValue = wrappedValue.substring(1, wrappedValue.length - 1);
            return cookieValue;
        }
    }
}

async function publishAnimation(cookie, csrf, title, description, data, groupId) {
    const response = await fetch(endpoints.publish(title, description, groupId), {
        body: data,
        method: 'POST',
        headers: {
            Cookie: `.ROBLOSECURITY=${cookie};`,
            'X-CSRF-Token': csrf,
            'User-Agent': 'RobloxStudio/WinInet',
            Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8'
        }
    });

    if (response.ok) return await response.text();
    else throw `${response.status} - ${await response.text()}`;
}

async function pullAnimation(id) {
    return await fetch(endpoints.assetDelivery(id)).then(res => res.blob());
}

mainApp.use(bodyParser.json());

const remapped = {};
let workingStill = true;

mainApp.get('/', (req, res) => {
    if (workingStill) return res.json(null);
    res.json(remapped);
    process.exit();
});

mainApp.post('/', async (req, res) => {
    const cookie = req.body.cookie ?? (await getRoblosecurity());
    if (!cookie) return console.error("ERROR: Invalid cookie and couldn't find in registry");

    await noblox.setCookie(cookie, false);
    const csrf = await noblox.getGeneralToken();

    res.status(204).send();

    const failedIDs = [];
    const nameTab = ["abvx", "jdfk", "qwes", "rtop", "zcma", "bqwe", "ahjf", "fhgv", "gqwe", "tsvf", "lmpo", "zxvb", "aplo", "qwye", "nbvc", "yash", "klnm", "mnbv", "opqr", "xyzn", "trew", "jkli", "wqer", "qwas", "vcxz", "bhji", "lqwe", "zxmc", "vbnm", "aqwe", "dhfg", "xtyu", "vcxa", "edfg", "jklp", "ydfg", "lkjh", "erty", "cxza", "tyui", "bnmp", "ploi", "jyhn", "yvbn", "nmkl", "khdf", "xpoi", "vfre", "asdc", "qwaszx", "rtyu", "vgtr", "zxcvb", "xswq", "cdew", "ujnm", "fghj", "oiuy", "yuih", "wqerf", "thju", "jklm", "nbvm", "asdqwe", "hjkl", "poiu", "plkj", "vcdx", "mnb", "gfds", "nbvx", "xzvb", "fdsa", "uiop", "xcvb", "vbn", "xasz", "qweqwe", "zxcf", "asdfg", "bnvc", "mjnh", "gfdsaq", "plok", "cxfd", "mnbvc", "qwedsa", "jhgf", "rty", "vgf", "kjhg", "yhtg", "xse", "fghjk", "vcbn", "xswe", "bnm", "yuiop", "hjklp", "qwsa", "sdfg", "qaz", "wqasd", "zxc", "nbv", "bgfd", "cvbnm", "uytr", "mnbvca", "wqse", "lkjhgf", "zxcv", "bnx", "rtui", "awqe", "rtyui", "aqws", "ytgh", "xcv", "ghjk", "oiuyt", "vbnma", "qweas", "asdf", "oiuyh", "mnbva", "xqwe", "hgfdsa", "vbnmi", "qazx", "plokij", "ghjkl", "ytre", "zxcvas", "bvc", "klmn", "nbvcd", "fghjkl", "zxcvbn", "xsw", "lkj", "bnvx", "uytrf", "werty", "ghfd", "qwerty", "hjklpo", "dfgh", "cxz", "nmklj", "qazws", "uyt", "plmn", "qazwsxedc", "vbnc", "xc", "cghj", "bvcx", "aqw", "zvbn", "yuioplk", "qwer", "dfg", "awq", "rtyuio", "hjk", "qw", "yhg", "fgrtgbr", "abxc", "xznm", "trfv", "qwerf", "yui", "nmklp", "zsxc", "qwera", "hgfd", "poiuyt", "oiuhg", "yhb", "plkm", "aqweqw", "kljh", "zxcvm", "gfdsa", "zxcasd", "yxcvb", "mnvb", "gfdsaqw", "jhy", "mklo", "vnm", "dfrg", "zxcd", "jklh", "lkjhgfds", "qsdf", "ghjklo", "vfdx", "zxvn", "zxcdsa", "jhgfdsa", "qazwsxed", "kloi", "polk", "azxs", "yhgtr", "kjhgfd", "vbnmk", "ytrew", "jklmn", "asxdcf", "bvnm", "fdxs", "kjhy", "xswaq", "poiuh", "vfds", "nmbv", "fdcv", "qwerq", "cvbn", "xaszx", "lkjhgfd", "mnbvcx", "wqas", "vcxzbn", "klpoi", "vcxzsd", "ertyu", "vcxzas", "qwesd", "mlkj", "vcxzml", "vcx", "wqaszx", "vcxznb", "vcxzb", "vcxzasd", "vcxzlk", "vcxzq", "vcxzj", "vcxzm", "vcxzgf", "vcxzs", "vcxzv", "vcxzoi", "vcxzr", "vcxzhy", "vcxzt", "vcxzcv", "vcxzuy", "vcxzp", "vcxzdf", "vcxzxc", "vcxzpl", "vcxzui", "vcxzfg", "vcxzh", "vcxzty", "vcxzbnm", "vcxzwe", "vcxzrt", "vcxzgh", "vcxzjk", "vcxzxcv", "vcxzlkj", "vcxzpoi", "vcxznm", "vcxzqw", "vcxzvf", "vcxzasdf", "vcxzmnb", "vcxzxcvb", "vcxzkl", "vcxzds", "vcxztr", "vcxzgb", "vcxzxcz", "vcxzqwerty", "vcxzxc", "vcxzasx", "vcxzvbn", "vcxzlkjh", "vcxzxcvbn", "vcxzpol", "vcxzjh", "vcxzrty", "vcxznbv", "vcxzqwq", "vcxzuyt", "vcxzgfdsa", "vcxzlkjhg", "vcxzdsaqw", "vcxzasdfg", "vcxzrewq", "vcxzpoiuy", "vcxzxcvb", "vcxznmkl", "vcxzwq", "vcxzasqw", "vcxzxcv", "vcxzxczxc", "vcxzmlkj", "vcxzpoiuyt", "vcxzlkjhf", "vcxznbvc", "vcxzmnbv", "vcxzpoiuytr", "vcxzlkjhgf", "vcxzqwertas", "vcxzlkj", "vcxzlkjhgd", "vcxzgfds", "vcxzn", "vcxzxcvbnm"];

    for (const [name, id] of Object.entries(req.body.ids)) {
      let i = 0;

      while (i < 5) {
        i++;
            
        try {
          if (req.body.groupID) {
            remapped[id] = await publishAnimation(cookie, csrf, nameTab[Math.floor(Math.random() * nameTab.length)], nameTab[Math.floor(Math.random() * nameTab.length)], await pullAnimation(id), req.body.groupID);
          } else {
            remapped[id] = await publishAnimation(cookie, csrf, nameTab[Math.floor(Math.random() * nameTab.length)], nameTab[Math.floor(Math.random() * nameTab.length)], await pullAnimation(id));
          }
          

        if (remapped[id]) {
          break;
      }

      } catch (error) {
        console.log(name, id, 'LEMME RETRY JIT');
      }
    }

    if (remapped[id]) {
      console.log(name, id, '-->', remapped[id]);
  } else {
    console.log(name, id, 'FAILED JIT SORRY');
    failedIDs.push(id);
  }

    }
    console.log('FINISHED- Finished reuploading animations');
    console.log(failedIDs);
    console.log(remapped);
    workingStill = false;
});
console.log(`Credits to ShdwC for making this`)
mainApp.listen(6969, () => console.log(`Waiting for Roblox Studio command...`));
