// 文件名：BehaviorLog.net.js
// 文件功能：NetJs平台下BehaviorLog行为监控日志
// 作者：yqs112358 (二次开发 参考liuxiaohua的示例Js项目)
// 首发平台：MineBBS

var _VER = '1.3.4';

var _CONFIG_PATH = '.\\plugins\\BehaviorLog\\config.json'
var _CONF_DEFAULT =
{
	LogToConsole: 1,
	LogFileAsCSV: 1,
	NoOutputContent: ["{\"rawtext\":[{"],
	LogAttack: 1,
	LogUseItem: 1,
	LogPlaceBlock: 1,
	LogDestroyBlock: 1,
	LogOpenChest: 1,
	LogOpenBarrel: 1,
	LogSetSlot: 1,
	LogPlayerEnter: 1,
	LogPlayerLeft: 1,
	LogPlayerRespawn: 1,
	LogChangeDimension: 1,
	LogInputCommand: 1,
	LogChat: 1,
	LogMobDie: 1,
	LogExplode: 1
}
var _HAVE_TEXT_LOG = false;
var conf = null;

function ReadConfig(confPath) {
	let confstr = fileReadAllText(confPath);
	if (confstr == null) {
		conf = _CONF_DEFAULT;
		fileWriteAllText(confPath, JSON.stringify(_CONF_DEFAULT, null, 4));
	}
	else if (confstr.length > 0)
		conf = JSON.parse(confstr);
	_HAVE_TEXT_LOG = conf.LogToConsole || !conf.LogFileAsCSV;
}

// =============== 日志模块开始 ===============
let _LOG_FILE_PREFIX = 'BehaviorLog';

mkdir('.\\logs');

function _CLOG(str)
{
	log('[' + _LOG_FILE_PREFIX + '] ' + str);
}
function _SEND_LINE_FILE(str)
{
	for (let i = 0; i < conf.NoOutputContent.length; i++)
		if (str.indexOf(conf.NoOutputContent[i]) != -1)
			return;
	if (conf.LogFileAsCSV) {
		let filePath = './logs/' + _LOG_FILE_PREFIX + '-' + TimeNow().substr(0, 10) + '.csv';
		if (!fileExists(filePath))
			fileWriteLine(filePath, '\ufeff时间,维度,主体,x,y,z,事件,目标,x,y,z,附加信息');
		fileWriteLine(filePath, str);
	}
	else {
		fileWriteLine('./logs/' + _LOG_FILE_PREFIX + '-' + TimeNow().substr(0, 10) + '.log', str);
	}
}
function _SEND_LINE_CONSOLE(str)
{
	for (let i = 0; i < conf.NoOutputContent.length; i++)
		if (str.indexOf(conf.NoOutputContent[i]) != -1)
			return;
	_CLOG(str);
}
function clog(str) {
	setTimeout(function(){_SEND_LINE_CONSOLE(str);}, 50);
}
function filelog(str) {
	setTimeout(function(){_SEND_LINE_FILE(str);}, 150);
}
function exlog(str) {
	if (conf.LogToConsole)
		clog(str);
	if (!conf.LogFileAsCSV)
		filelog(str);
}

function csvlog(event, dim, doer, dx, dy, dz, target, tx, ty, tz, notes) {
	let lineCsv = TimeNow() + ','  + dim + ',' + doer + ',' + dx + ',' + dy + ',' + dz
		+ ',' + event + ',' + target + ',' + tx + ',' + ty + ',' + tz + ',' + notes;
	filelog(lineCsv);
}
// =============== 日志模块结束 ===============

function initLocalConfig() {
	mkdir('.\\plugins');
	mkdir('.\\plugins\\BehaviorLog');
	ReadConfig(_CONFIG_PATH);

	// 日志对外接口
	if (_HAVE_TEXT_LOG)
		setShareData("BL_exlog",exlog);
	if (conf.LogFileAsCSV)
		setShareData("BL_csvlog",csvlog);
}

// 攻击
addAfterActListener('onAttack', function (e) {
	if (!conf.LogAttack)
		return;
	let je = JSON.parse(e);
	if (_HAVE_TEXT_LOG)
		exlog('[' + TimeNow() + ' Attack] ' + '玩家 ' + je.playername + ' 在 ' + je.dimension +
			' (' + je.XYZ.x.toFixed(0) + ',' + je.XYZ.y.toFixed(0) + ',' + je.XYZ.z.toFixed(0) +
			') 处攻击了 ' + je.actortype + '。');
	if (conf.LogFileAsCSV)
		csvlog('攻击', je.dimension, je.playername, je.XYZ.x.toFixed(0), je.XYZ.y.toFixed(0), je.XYZ.z.toFixed(0),
			je.actortype, '', '', '', '');
});

// 使用物品
addAfterActListener('onUseItem', function (e) {
	if (!conf.LogUseItem)
		return;
	let je = JSON.parse(e);
	if (je.RESULT) {
		if (_HAVE_TEXT_LOG)
			exlog('[' + TimeNow() + ' UseItem] ' + '玩家 ' + je.playername +
				' 于(' + je.XYZ.x.toFixed(0) + ',' + je.XYZ.y.toFixed(0) + ',' + je.XYZ.z.toFixed(0) + ')位置' +
				(!je.isstand ? ' 悬空地' : '') + ' 在 ' + je.dimension +
				' (' + je.position.x.toFixed(0) + ',' + je.position.y.toFixed(0) + ',' +
				je.position.z.toFixed(0) + ') 处使用了 ' + je.itemname + ' 物品。');
		if (conf.LogFileAsCSV)
			csvlog('使用物品', je.dimension, je.playername, je.XYZ.x.toFixed(0), je.XYZ.y.toFixed(0), je.XYZ.z.toFixed(0),
				je.itemname, je.position.x.toFixed(0), je.position.y.toFixed(0), je.position.z.toFixed(0),
				!je.isstand ? ' 悬空地' : '');
	}
});

// 放置方块
addAfterActListener('onPlacedBlock', function (e) {
	if (!conf.LogPlaceBlock)
		return;
	let je = JSON.parse(e);
	if (je.RESULT) {
		if (_HAVE_TEXT_LOG)
			exlog('[' + TimeNow() + ' PlaceBlock] ' + '玩家 ' + je.playername +
				' 于(' + je.XYZ.x.toFixed(0) + ',' + je.XYZ.y.toFixed(0) + ',' + je.XYZ.z.toFixed(0) + ')位置' +
				(!je.isstand ? ' 悬空地' : '') + ' 在 ' + je.dimension +
				' (' + je.position.x.toFixed(0) + ',' + je.position.y.toFixed(0) + ',' +
				je.position.z.toFixed(0) + ') 处放置了 ' + je.blockname + ' 方块。');
		if (conf.LogFileAsCSV)
			csvlog('放置方块', je.dimension, je.playername, je.XYZ.x.toFixed(0), je.XYZ.y.toFixed(0), je.XYZ.z.toFixed(0),
				je.blockname, je.position.x.toFixed(0), je.position.y.toFixed(0), je.position.z.toFixed(0),
				!je.isstand ? ' 悬空地' : '');
	}
});

// 破坏方块
addAfterActListener('onDestroyBlock', function (e) {
	if (!conf.LogDestroyBlock)
		return;
	let je = JSON.parse(e);
	if (je.RESULT) {
		if (_HAVE_TEXT_LOG)
			exlog('[' + TimeNow() + ' DestroyBlock] ' + '玩家 ' + je.playername +
				' 于(' + je.XYZ.x.toFixed(0) + ',' + je.XYZ.y.toFixed(0) + ',' + je.XYZ.z.toFixed(0) + ')位置' +
				(!je.isstand ? ' 悬空地' : '') + ' 在 ' + je.dimension +
				' (' + je.position.x.toFixed(0) + ',' + je.position.y.toFixed(0) + ',' +
				je.position.z.toFixed(0) + ') 处破坏了 ' + je.blockname + ' 方块。');
		if (conf.LogFileAsCSV)
			csvlog('破坏方块', je.dimension, je.playername, je.XYZ.x.toFixed(0), je.XYZ.y.toFixed(0), je.XYZ.z.toFixed(0),
				je.blockname, je.position.x.toFixed(0), je.position.y.toFixed(0), je.position.z.toFixed(0),
				!je.isstand ? ' 悬空地' : '');
	}
});

// 开箱
addBeforeActListener('onStartOpenChest', function (e) {
	if (!conf.LogOpenChest)
		return;
	let je = JSON.parse(e);
	if (_HAVE_TEXT_LOG)
		exlog('[' + TimeNow() + ' OpenChest] ' + '玩家 ' + je.playername +
			' 于(' + je.XYZ.x.toFixed(0) + ',' + je.XYZ.y.toFixed(0) + ',' + je.XYZ.z.toFixed(0) + ')位置' +
			(!je.isstand ? ' 悬空地' : '') + ' 在 ' + je.dimension +
			' (' + je.position.x.toFixed(0) + ',' + je.position.y.toFixed(0) + ',' +
			je.position.z.toFixed(0) + ') 处打开箱子。');
	if (conf.LogFileAsCSV)
		csvlog('打开箱子', je.dimension, je.playername, je.XYZ.x.toFixed(0), je.XYZ.y.toFixed(0), je.XYZ.z.toFixed(0),
			'箱子', je.position.x.toFixed(0), je.position.y.toFixed(0), je.position.z.toFixed(0),
			!je.isstand ? ' 悬空地' : '');
	return true;
});

// 开桶
addBeforeActListener('onStartOpenBarrel', function (e) {
	if (!conf.LogOpenBarrel)
		return;
	let je = JSON.parse(e);
	if (_HAVE_TEXT_LOG)
		exlog('[' + TimeNow() + ' OpenBarrel] ' + '玩家 ' + je.playername +
			' 于(' + je.XYZ.x.toFixed(0) + ',' + je.XYZ.y.toFixed(0) + ',' + je.XYZ.z.toFixed(0) + ')位置' +
			(!je.isstand ? ' 悬空地' : '') + ' 在 ' + je.dimension +
			' (' + je.position.x.toFixed(0) + ',' + je.position.y.toFixed(0) + ',' +
			je.position.z.toFixed(0) + ') 处打开木桶。');
	if (conf.LogFileAsCSV)
		csvlog('打开木桶', je.dimension, je.playername, je.XYZ.x.toFixed(0), je.XYZ.y.toFixed(0), je.XYZ.z.toFixed(0),
			'木桶', je.position.x.toFixed(0), je.position.y.toFixed(0), je.position.z.toFixed(0),
			!je.isstand ? ' 悬空地' : '');
	return true;
});

// 放入/取出物品
addAfterActListener('onSetSlot', function (e) {
	if (!conf.LogSetSlot)
		return;
	let je = JSON.parse(e);
	if (_HAVE_TEXT_LOG)
		exlog('[' + TimeNow() + ' SetSlot] ' + '玩家 ' + je.playername +
			' 于(' + je.XYZ.x.toFixed(0) + ',' + je.XYZ.y.toFixed(0) + ',' + je.XYZ.z.toFixed(0) + ')位置' +
			(!je.isstand ? ' 悬空地' : '') + ' 在 ' + je.dimension +
			' (' + je.position.x.toFixed(0) + ',' + je.position.y.toFixed(0) + ',' +
			je.position.z.toFixed(0) + ') 处的 ' + je.blockname + ' 内的第 ' + je.slot + ' 槽内 ' +
			(je.itemcount > 0 ? '放入了 ' + je.itemcount + ' 个 ' + je.itemname + ' 物品。' :
				'取出了物品。'));
	if (conf.LogFileAsCSV) {
		if (je.itemcount > 0)
			csvlog('放入物品', je.dimension, je.playername, je.XYZ.x.toFixed(0), je.XYZ.y.toFixed(0), je.XYZ.z.toFixed(0),
				je.itemcount + ' 个 ' + je.itemname, je.position.x.toFixed(0), je.position.y.toFixed(0), je.position.z.toFixed(0),
				'从 ' + je.blockname + ' 的第 ' + je.slot + ' 槽内' + (!je.isstand ? ' | 悬空地' : ''));
		else
			csvlog('取出物品', je.dimension, je.playername, je.XYZ.x.toFixed(0), je.XYZ.y.toFixed(0), je.XYZ.z.toFixed(0),
				'物品', je.position.x.toFixed(0), je.position.y.toFixed(0), je.position.z.toFixed(0),
				'从 ' + je.blockname + ' 的第 ' + je.slot + ' 槽内' + (!je.isstand ? ' | 悬空地' : ''));
	}
});

// 玩家进入游戏(仅输出至日志文件)
addAfterActListener('onLoadName', function (e) {
	if (!conf.LogPlayerEnter)
		return;
	let je = JSON.parse(e);
	if (!conf.LogFileAsCSV)
		filelog('[' + TimeNow() + ' PlayerEnter] 玩家 ' + je.playername + ' 已加入游戏，xuid= ' + je.xuid);
	else
		csvlog('玩家进服', '', je.playername, '', '', '', '', '', '', '', 'xuid = ' + je.xuid);
});

// 玩家离开游戏(仅输出至日志文件)
addAfterActListener('onPlayerLeft', function (e) {
	if (!conf.LogPlayerLeft)
		return;
	let je = JSON.parse(e);
	if (!conf.LogFileAsCSV)
		filelog('[' + TimeNow() + ' PlayerLeft] 玩家 ' + je.playername + ' 已离开游戏，xuid= ' + je.xuid);
	else
		csvlog('玩家离开', '', je.playername, '', '', '', '', '', '', '', 'xuid = ' + je.xuid);
});

// 玩家重生
addAfterActListener('onRespawn', function (e) {
	if (!conf.LogPlayerRespawn)
		return;
	let je = JSON.parse(e);
	if (_HAVE_TEXT_LOG)
		exlog('[' + TimeNow() + ' PlayerRespawn] 玩家 ' + je.playername + ' 已于 ' + je.dimension +
			' (' + je.XYZ.x.toFixed(0) + ',' + je.XYZ.y.toFixed(0) + ',' + je.XYZ.z.toFixed(0) + ') 处重生。');
	if (conf.LogFileAsCSV)
		csvlog('玩家重生', je.dimension, je.playername, je.XYZ.x.toFixed(0), je.XYZ.y.toFixed(0), je.XYZ.z.toFixed(0),
			'', '', '', '', '');
});

// 玩家切换维度
addAfterActListener('onChangeDimension', function (e) {
	if (!conf.LogChangeDimension)
		return;
	let je = JSON.parse(e);
	if (je.RESULT) {
		if (_HAVE_TEXT_LOG)
			exlog('[' + TimeNow() + ' ChangeDimension] ' + '玩家 ' + je.playername +
				(!je.isstand ? ' 悬空地' : '') + ' 切换维度至 ' + je.dimension +
				' (' + je.XYZ.x.toFixed(0) + ',' + je.XYZ.y.toFixed(0) + ',' + je.XYZ.z.toFixed(0) + ') 处。');
		if (conf.LogFileAsCSV)
			csvlog('切换维度', je.dimension, je.playername, je.XYZ.x.toFixed(0), je.XYZ.y.toFixed(0), je.XYZ.z.toFixed(0),
				'', '', '', '', !je.isstand ? ' 悬空地' : '');
	}
});

// 玩家执行指令
addBeforeActListener('onInputCommand', function (e) {
	if (!conf.LogInputCommand)
		return;
	let je = JSON.parse(e);
	if (_HAVE_TEXT_LOG)
		exlog('[' + TimeNow() + ' InputCommand] 玩家 ' + je.playername +
			(!je.isstand ? ' 悬空地' : '') + ' 在 ' + je.dimension +
			' (' + je.XYZ.x.toFixed(0) + ',' + je.XYZ.y.toFixed(0) + ',' + je.XYZ.z.toFixed(0) + ') 处执行指令 ' + je.cmd);
	if (conf.LogFileAsCSV)
		csvlog('执行指令', je.dimension, je.playername, je.XYZ.x.toFixed(0), je.XYZ.y.toFixed(0), je.XYZ.z.toFixed(0),
			je.cmd, '', '', '', !je.isstand ? ' 悬空地' : '');
	return true;
});

// 聊天
addAfterActListener('onChat', function (e) {
	if (!conf.LogChat)
		return;
	let je = JSON.parse(e);
	if (je.chatstyle != "title") {
		if (_HAVE_TEXT_LOG)
			exlog('[' + TimeNow() + ' Chat] ' + je.playername +
				(je.target != '' ? ' 对 ' + je.target : '') + ' 说: ' + je.msg);
		if (conf.LogFileAsCSV)
			csvlog('聊天', '', je.playername, '', '', '',
				je.msg, '', '', '', je.target != '' ? '对 ' + je.target + ' 说' : '');
	}
});

// 生物死亡
addAfterActListener('onMobDie', function (e) {
	if (!conf.LogMobDie)
		return;
	let je = JSON.parse(e);
	if (je.mobname != "") {
		if(je.playername)
		{	
			// 玩家
			if (_HAVE_TEXT_LOG)
				exlog('[' + TimeNow() + ' DeathInfo] 玩家' + je.playername + ' 在 ' + je.dimension +
				' (' + je.XYZ.x.toFixed(0) + ',' + je.XYZ.y.toFixed(0) + ',' + je.XYZ.z.toFixed(0) + 
				') 被 ' + je.srcname + ' 杀死了');
			if (conf.LogFileAsCSV)
				csvlog('玩家死亡', je.dimension, je.playername, je.XYZ.x.toFixed(0), je.XYZ.y.toFixed(0),
					je.XYZ.z.toFixed(0), '', '', '', '', '被 ' + je.srcname + ' 杀死');
		}
		else
		{	
			// 其他生物
			if (_HAVE_TEXT_LOG)
				exlog('[' + TimeNow() + ' DeathInfo] ' + je.mobname + ' 在 ' + je.dimensionid +
				' (' + je.XYZ.x.toFixed(0) + ',' + je.XYZ.y.toFixed(0) + ',' + je.XYZ.z.toFixed(0) + 
				') 被 ' + je.srcname + ' 杀死了');
			if (conf.LogFileAsCSV)
				csvlog('生物死亡', je.dimensionid, je.mobname, je.XYZ.x.toFixed(0), je.XYZ.y.toFixed(0),
					je.XYZ.z.toFixed(0), '', '', '', '', '被 ' + je.srcname + ' 杀死');
		}
	}
});

/*CSR商业版可用
// 生物受伤
addAfterActListener('onMobHurt', function (e) {
	let je = JSON.parse(e);
	if (je.mobname != "" && je.RESULT) {
		if (_HAVE_TEXT_LOG)
			exlog('[' + TimeNow() + ' HurtInfo] ' + je.mobname + ' 受到来自 ' + je.srcname +
				' 的 ' + je.dmcount + ' 点伤害，类型' + je.dmtype);
		if(conf.LogFileAsCSV)
			csvlog('生物受伤','',je.mobname,'','','',
				'来自 '+ je.srcname ,'','','', je.dmcount + ' 点伤害，类型' + je.dmtype);
	}
});
*/

//爆炸
addBeforeActListener('onLevelExplode', function (e) {
	if (!conf.LogExplode)
		return;
	let je = JSON.parse(e);

	let target = je.entity;
	if (target == null) {
		if (je.blockname == "minecraft:respawn_anchor") {
			if (_HAVE_TEXT_LOG)
				exlog('[' + TimeNow() + ' Explode] ' + je.dimension + ' 的(' +
					je.position.x.toFixed(0) + ',' + je.position.y.toFixed(0) + ',' +
					je.position.z.toFixed(0) + ')位置 发生由 重生锚 引发的爆炸。');
			if (conf.LogFileAsCSV)
				csvlog('爆炸', je.dimension, '重生锚', je.position.x.toFixed(0), je.position.y.toFixed(0), je.position.z.toFixed(0),
					'', '', '', '', '');
		}
		else {
			if (_HAVE_TEXT_LOG)
				exlog('[' + TimeNow() + ' Explode] ' + je.dimension + ' 的(' +
					je.position.x.toFixed(0) + ',' + je.position.y.toFixed(0) + ',' +
					je.position.z.toFixed(0) + ')位置 发生由 某样东西 引发的爆炸。');
			if (conf.LogFileAsCSV)
				csvlog('爆炸', je.dimension, '未知', je.position.x.toFixed(0), je.position.y.toFixed(0), je.position.z.toFixed(0),
					'', '', '', '', '');
		}
	}
	else {
		if (_HAVE_TEXT_LOG)
			exlog('[' + TimeNow() + ' Explode] ' + je.dimension + ' 的(' +
				je.position.x.toFixed(0) + ',' + je.position.y.toFixed(0) + ',' +
				je.position.z.toFixed(0) + ')位置 发生由 ' + target + ' 引发的爆炸。');
		if (conf.LogFileAsCSV)
			csvlog('爆炸', je.dimension, target, je.position.x.toFixed(0), je.position.y.toFixed(0), je.position.z.toFixed(0),
				'', '', '', '', '');
	}
	return true;
});

/*CSR商业版可用
// 修改命令方块
addBeforeActListener('onCommandBlockUpdate', function (e) {
	let je = JSON.parse(e);
	if (_HAVE_TEXT_LOG)
		exlog('[' + TimeNow() + ' CommandBlockUpdate] ' + '玩家 ' + je.playername +
			' 于(' + je.XYZ.x.toFixed(0) + ',' + je.XYZ.y.toFixed(0) + ',' + je.XYZ.z.toFixed(0) + ')位置' +
			(!je.isstand ? ' 悬空地' : '') + ' 在 ' + je.dimension +
			' (' + je.position.x.toFixed(0) + ',' + je.position.y.toFixed(0) + ',' +
			je.position.z.toFixed(0) + ') 处修改 ' + (je.isblock ? '命令块' : '命令矿车') + ' 的指令为 ' + je.cmd);
	if(conf.LogFileAsCSV)
		csvlog('修改命令方块',je.dimension,je.playername,je.XYZ.x.toFixed(0),je.XYZ.y.toFixed(0),je.XYZ.z.toFixed(0),
			'修改 ' + (je.isblock ? '命令块' : '命令矿车') + ' 的指令为 ' + je.cmd,
			je.position.x.toFixed(0),je.position.y.toFixed(0),je.position.z.toFixed(0),
			!je.isstand ? ' 悬空地' : '');
	return true;
});

// 命令方块执行指令
addBeforeActListener('onBlockCmd', function (e) {
	let je = JSON.parse(e);
	if (_HAVE_TEXT_LOG)
		exlog('[' + TimeNow() + ' BlockCmd] 命令方块 ' + je.name + '在 (' +
			je.position.x.toFixed(0) + ',' + je.position.y.toFixed(0) + ',' +
			je.position.z.toFixed(0) + ')位置 执行指令 ' + je.cmd);
	if(conf.LogFileAsCSV)
		csvlog('命令方块执行','',je.name,je.position.x.toFixed(0),je.position.y.toFixed(0),je.position.z.toFixed(0),
					je.cmd,'','','','');
	return true;
});*/

initLocalConfig();

_CLOG('BehaviorLog行为监控日志-已装载  当前版本：' + _VER);
_CLOG('【配置文件】位于 ' + _CONFIG_PATH);
_CLOG('作者：yqs112358 (二次开发 感谢liuxiaohua的示例Js项目)   发布平台：MineBBS');
_CLOG('欲联系作者可前往MineBBS论坛');