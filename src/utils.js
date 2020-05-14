import { Base64 } from "js-base64";

const storage = process.env.NODE_ENV === "development" ? localStorage : sessionStorage;

let utils = {};

/**
 *
 * seconds to milliseconds
 * @param {String} second
 * @returns {Number} milliseconds
 */
function s2ms(second) {
	return second * 1000;
}

utils.title = function(title) {
	title = title || "Admin";
	window.document.title = title;
};

//保存数据
utils.setItem = (k, v) => {
	storage.setItem(k, v);
};
utils.getItem = k => {
	return storage.getItem(k);
};
utils.clearItem = k => {
	storage.removeItem(k);
};
utils.clearData = () => {
	storage.clear();
};
utils.setToken = token => {
	utils.setItem("bearer", token);
};

utils.setExpireAt = expireAt => {
	utils.setItem("expireAt", expireAt);
};

/**
 * token是否已过期
 */
utils.isExpired = () => {
	let now = new Date();
	// console.log(now);
	let expireTime = new Date(s2ms(utils.getItem("expireAt")));
	// console.log(expireTime);
	if (now > expireTime) {
		// console.log("已过期");
		return true;
	}
	return false;
};

/**
 * token是否正常(存在,且未过期)
 */
utils.isTokenOK = () => {
	// return true; 取消注释则前端不检查token是否合法
	if (utils.getToken() && utils.getToken().length > 0 && !utils.isExpired()) {
		return true;
	}
	return false;
};

utils.getToken = () => {
	return utils.getItem("bearer");
};

utils.getClaims = () => {
	let claims = Base64.decode(utils.getItem("bearer").split(".")[1]);
	return JSON.parse(claims);
};

// // 获取保存的用户信息
// utils.getAuth = () => {
// 	try {
// 		let token = Base64.decode(utils.getItem("bearer").split(".")[1]);
// 		let auth = JSON.parse(token); // auth对应jwt的claims
// 		console.dir(auth);
// 		if (!auth.hasOwnProperty("jti")) {
// 			utils.clearItem("bearer");
// 			location.href = "/login";
// 		}
// 		return auth;
// 	} catch (e) {
// 		utils.clearItem("bearer");
// 		location.href = "/login";
// 	}
// };

/**
 * 将graphql返回的Date类型(时间戳字符串,单位是秒)转换成日期时间字符串
 * @param {string} time
 */
utils.timeFormat = time => {
	return new Date(s2ms(time)).toLocaleString().substr(0, 19);
};
// 不需要也可登录页面集合
utils.noAuth = r => {
	return ["login", "errjwt", "err401", "err50x", "err404"].indexOf(r) > -1;
};
// utils.Role = {
// 	RSup: 30, //超级管理员
// 	RAtv: 20, //启用/禁用
// 	RBas: 10, //基本权限
// 	//判断指定位置权限
// 	getRole: (rl, r) => {
// 		if ((rl & (1 << r)) >> r == 1) {
// 			return true;
// 		}
// 		return false;
// 	}
// };
// utils.Role.isSup = rl => {
// 	return utils.Role.getRole(rl, utils.Role.RSup);
// };
// utils.Role.isAtv = rl => {
// 	return utils.Role.getRole(rl, utils.Role.RAtv);
// };
// // 权限路由相关
// utils.Role.allow = (role, arr) => {
// 	for (let i = 0; i < arr.length; i++) {
// 		if (utils.Role.getRole(role, arr[i])) {
// 			return true;
// 		}
// 	}
// 	return false;
// };
export default utils;
