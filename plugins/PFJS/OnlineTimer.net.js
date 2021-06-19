// 文件名：OnlineTimer.net.js
// 文件功能：Js平台下玩家在线时间统计工具
// 作者：yqs112358
// 首发平台：MineBBS

var _VER = '1.0.2'
var _TIMER_DATA_PATH = '.\\plugins\\OnlineTimer\\data.json'


var _WELCOME_AT_ENTERING = false;
var _WELCOME_WAIT_TIME = 2000;

// -------------------- Vars -------------------- //
var records = [];
var timestamps = new Map();
var toShowWelcome = new Map();

// -------------------- Init -------------------- //
function initLocalConfig() {
    setCommandDescribe('onlinetime', '查看自己的游戏在线时长')
    mkdir('.\\plugins');
    mkdir('.\\plugins\\OnlineTimer');
    let strList = fileReadAllText(_TIMER_DATA_PATH);
    if (strList == null)
        fileWriteAllText(_TIMER_DATA_PATH, '[]');
    else if (strList.length > 0 && strList != '[]')
        records = JSON.parse(strList);
}

// -------------------- Main -------------------- //

function writeRecord() {
    fileWriteAllText(_TIMER_DATA_PATH, JSON.stringify(records));
}

function splitMinute(mins)
{
    let hours = 0;
    let days = 0;
    if (mins >= 60) {
        hours = Math.floor(mins/60);
        mins %= 60;
    }
    if (hours >= 24) {
        days = Math.floor(hours/24);
        hours %= 24;
    }
    return {
        day:days,
        hour:hours,
        min:mins
    }
}

function addNewRecord(playername) {
    timestamps.set(playername,new Date().getTime());
    let newRec = {};
    newRec.name = playername;
    newRec.lastLogin = TimeNow();
    newRec.totalTime = 0;
    records.push(newRec);
}

function newPlayer(playername) {
    let found = false;
    for (let i = 0; i < records.length; i++) {
        if (records[i].name == playername) {
            timestamps.set(playername,new Date().getTime());
            records[i].lastLogin = TimeNow();
            toShowWelcome[playername] = i;
            found = true;
            break;
        }
    }
    if (!found)
    {
        addNewRecord(playername);
        toShowWelcome[playername] = records.length - 1;
    }
    setTimeout(writeRecord, 10);
}

function removePlayer(playername) {
    let enTime = new Date().getTime();
    let stTime = timestamps.get(playername);

    if (stTime != null)
        for (let i = 0; i < records.length; i++) {
            if (records[i].name == playername) {
                records[i].lastLeaveTime = Math.floor(enTime / 60000);
                records[i].totalTime += Math.floor((enTime - stTime) / 60000);
                break;
            }
        }
    writeRecord();
}

function updateData(playername) {
    let enTime = new Date().getTime();
    let stTime = timestamps.get(playername);
    let recordID = 0;

    let found = false;
    if (stTime != null)
        for (let i = 0; i < records.length; i++) {
            if (records[i].name == playername) {
                records[i].totalTime += Math.floor((enTime - stTime) / 60000);
                timestamps.set(playername,enTime);
                recordID = i;
                found = true;
                break;
            }
        }
    if (!found) {
        addNewRecord(playername);
        recordID = records.length - 1;
    }
    setTimeout(writeRecord, 10);
    return recordID;
}

addAfterActListener('onLoadName', function (e) {
    let je = JSON.parse(e);
    newPlayer(je.playername);
});

addAfterActListener('onPlayerLeft', function (e) {
    let je = JSON.parse(e);
    removePlayer(je.playername);
});

addBeforeActListener('onInputCommand', function (e) {
    let je = JSON.parse(e);
    if (je.cmd == "/onlinetime") {
        let recordID = updateData(je.playername);
        let splitTime = splitMinute(records[recordID].totalTime);

        runcmd('titleraw ' + je.playername + ' actionbar {"rawtext":[{"text":"你已在服务器中累计游玩'
            + splitTime.day + '天' + splitTime.hour + '小时' + splitTime.min + '分钟\n最近一次登录时间 '
            + records[recordID].lastLogin + '"}]}');
        return false;
    }
    return true;
});

addBeforeActListener('onRespawn', function (e) {
    let je = JSON.parse(e);

    log(toShowWelcome[je.playername]);
    if(_WELCOME_AT_ENTERING && toShowWelcome[je.playername] != null && toShowWelcome[je.playername] >= 0
            && records[toShowWelcome[je.playername]].lastLeaveTime != null)
    {
        //let splitTotalTime = splitMinute(records[toShowWelcome[je.playername]].totalTime);
        let splitLeaveTime = splitMinute(Math.floor(new Date().getTime() / 60000) - records[toShowWelcome[je.playername]].lastLeaveTime);
        toShowWelcome[je.playername] = -1;
        setTimeout(function(){
            runcmd('titleraw ' + je.playername + ' actionbar {"rawtext":[{"text":"欢迎回来！'
            + (splitLeaveTime.day > 0 ? '' : '\n距离你上次登录已经' + splitLeaveTime.day + '天了') + '"}]}');
        },_WELCOME_WAIT_TIME);
    }
});

addBeforeActListener('onServerCmd', function (e) {
    let je = JSON.parse(e);
    let cmdstrs = je.cmd.trim().split(' ');
    if (cmdstrs.length > 0 && cmdstrs[0] == 'stop') {
        let players = JSON.parse(getOnLinePlayers());
        for (let i = 0; i < players.length; i++)
            removePlayer(players[i].playername);
    }
});

initLocalConfig();

log('[OnlineTimer] OnlineTimer在线时间统计插件-已装载  当前版本：' + _VER);
log('[OnlineTimer] 玩家使用/onlinetime命令可以查看自己的累计在线时长');
log('[OnlineTimer] 所有玩家的统计信息储存于' + _TIMER_DATA_PATH + '文件中');
log('[OnlineTimer] 【注意】停服时请务必使用stop命令，否则统计数据将无法正常写入')
log('[OnlineTimer] 作者：yqs112358   首发平台：MineBBS');
log('[OnlineTimer] 欲联系作者可前往MineBBS论坛');