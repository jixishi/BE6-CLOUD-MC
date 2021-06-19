var cps = {};
var tmp = {};
var PATH = '.\\plugins\\cps';
var CONFIGURE = 'plugins\\cps\\configure.json';
var DISPLAY = 'plugins\\cps\\display.json';
var tmpdisplay;
var AntiCpsCheat;
var number
var Timer
load();
//监听器
function cmd(e) {
    let je = JSON.parse(e);
    if (je.cmd == 'cpsreload') {
        READ('Console');
        return false;
    }
};
function command(e) {
    let je = JSON.parse(e);
    if (je.cmd == '/cpsreload') {
        if (OP(getXuid(je.playername)) == true) {
            READ('op');
            return false;
        }
    } else if (je.cmd == '/cps') {
        if (tmpdisplay[je.playername] == true) {
            tmpdisplay[je.playername] = false;
            save();
            runcmd('tellraw "' + je.playername + '" {"rawtext":[{"text":"§d已关闭CPS显示"}]}');
            return false;
        } else if (tmpdisplay[je.playername] == false) {
            tmpdisplay[je.playername] = true;
            save();
            runcmd('tellraw "' + je.playername + '" {"rawtext":[{"text":"§d已开启CPS显示"}]}');
            return false;
        }
    }
}
function Attack(e) {
    let je = JSON.parse(e);
    if (cps[je.playername] == null) {
        cps[je.playername] = 1;
        return true;
    } else {
        cps[je.playername] += 1;
        return true;
    }
};
function destroy(e) {
    let je = JSON.parse(e);
    if (cps[je.playername] == null) {
        cps[je.playername] = 1;
        return true;
    } else {
        cps[je.playername] += 1;
        return true;
    }
};
function ues(e) {
    let je = JSON.parse(e);
    if (cps[je.playername] == null) {
        cps[je.playername] = 1;
        return true;
    } else {
        cps[je.playername] += 1;
        return true;
    }
};
function output(e) {
    let je = JSON.parse(e);
    var str = je.output
    var str1 = str.search("Title");
    if (str1 == -1) {
        return true
    } else {
        return false
    }
}

//主体
function cpss() {
    try {
        var geton = getOnLinePlayers();
        if (geton != null) {
            var je = JSON.parse(geton);
            if (je != null && je != "") {
                for (var i = 0; i < je.length; i++) {
                    var aaa = tmpdisplay[je[i].playername];
                    if (aaa == null) {
                        tmpdisplay[je[i].playername] = true;
                        save();
                        aaa = true;
                    }
                    if (aaa == true && cps[je[i].playername] != null) {
                        if (AntiCpsCheat == true) {
                            CPSPAN(je[i].playername, cps[je[i].playername]);
                        }
                        runcmd('title "' + je[i].playername + '" actionbar ' + cps[je[i].playername] + ' CPS');
                        delete cps[je[i].playername];
                    } else if (cps[je[i].playername] != null) {
                        if (AntiCpsCheat == true) {
                            CPSPAN(je[i].playername, cps[je[i].playername]);
                        }
                        delete cps[je[i].playername];
                    }
                }
            }
        }
    } catch (error) { }
}

function CPSPAN(player, cps) {
    try {
        if (player != null && cps != null) {
            if (cps > number - 1) {
                runcmd('tellraw "' + player + '" {"rawtext":[{"text":"§c请注意！你的CPS过高！如果不降低的话，将会将你踢出！"}]}');
                if (tmp[player] == null) {
                    tmp[player] = 1;
                } else {
                    tmp[player] += 1;
                }
            } else if (cps < number - 1) {
                tmp[player] = 0;
            }
            if (tmp[player] == Timer) {
                disconnectClient(getUuid(player), 'CPS过高！');
                tmp[player] = 0;
            }
        }
    } catch (error) { }
};

//读取配置
function READ(type) {
    var ha = fileReadAllText(DISPLAY);
    if (ha == null) {
        mkdir(PATH);
        fileWriteAllText(DISPLAY, '{}');
        ha = fileReadAllText(DISPLAY);
    };
    tmpdisplay = JSON.parse(ha);
    var havez = fileReadAllText(CONFIGURE);
    if (havez == null) {
        mkdir(PATH);
        let xie = { "防止使用连点器": true, "多少cps踢出玩家": "40", "超出多少秒之后踢出": "4" };
        let Json = JSON.stringify(xie, null, "\t");
        fileWriteAllText(CONFIGURE, Json);
        log('无法读取配置!自动将配置文件生成置' + PATH);
        havez = fileReadAllText(CONFIGURE);
    };
    let jr = JSON.parse(havez);
    if (jr["防止使用连点器"] == true) {
        if (type == 'Console') {
            logout('[INFO][CPS]防止使用连点器已开启!CPS超过 ' + jr["多少cps踢出玩家"] + ' 之后 ' + jr["超出多少秒之后踢出"] + ' 秒将会踢出该玩家');
        } else if (type == 'op') {
            runcmd('tellraw @a {"rawtext":[{"text":"§a[INFO][CPS]防止使用连点器已开启!CPS超过 ' + jr["多少cps踢出玩家"] + ' 之后 ' + jr["超出多少秒之后踢出"] + ' 秒将会踢出该玩家"}]}');
        }
        AntiCpsCheat = true;
        number = jr["多少cps踢出玩家"];
        Timer = jr["超出多少秒之后踢出"];
    } else {
        if (type == 'Console') {
            logout('[INFO][CPS]防止使用连点器已关闭');
        } else if (type == 'op') {
            runcmd('tellraw @a {"rawtext":[{"text":"§a[INFO][CPS]防止使用连点器已关闭"}]}');
        }
        AntiCpsCheat = false;
    }
};
//写出玩家DISPLAY配置文件
function save() {
    let Json = JSON.stringify(tmpdisplay, null, "\t");
    fileWriteAllText(DISPLAY, Json);
    log('[CPS]已保存玩家设置');
};

//判定op
function OP(xuid) {
    var players = JSON.parse(fileReadAllText('permissions.json'));
    var Len = players.length; 
    for (var i = 0; i < Len; i++) {
        if (players[i].xuid == xuid && players[i].permission == 'operator') {
            return true;
        }
    }
    return false;
}

function getXuid(name) {
    var players = JSON.parse(getOnLinePlayers());
    var len = players.length;
    for (var i = 0; i < len; i++) {
        if (players[i]['playername'] == name) {
            return players[i].xuid;
        }
    }
    return null;
}

function getUuid(player) {
    let on = getOnLinePlayers();
    if (on != null && on != "") {
        let jon = JSON.parse(on);
        if (jon != null) {
            for (var shu = 0; shu < jon.length; shu++) {
                let online = jon[shu];
                if (online.playername == player) {
                    return online.uuid;
                }
            }
        }
    }
};

//load开始
function load() {
    addBeforeActListener('onAttack', Attack);
    addBeforeActListener('onDestroyBlock', destroy);
    addBeforeActListener('onUseItem', ues);
    addBeforeActListener('onServerCmdOutput', output);
    addBeforeActListener('onServerCmd', cmd);
    addBeforeActListener('onInputCommand', command);
    setCommandDescribe('cps', '开启或者关闭CPS显示');
    setCommandDescribe('cpsreload', '重新读取CPS配置');
    READ('Console');
    setInterval("cpss()", 1000);
    log('[INFO][CPS]成功加载！版本：0.9')
};