import Vue from "vue";
import App from "./App.vue";
import Utils from "./utils.js";
import Routes from "./router.js";
import ViewUI from "view-design";
import VueRouter from "vue-router";
// import style
import "view-design/dist/styles/iview.css";

Vue.use(ViewUI, { transfer: true });
//设置为 false 以阻止 vue 在启动时生成生产提示
Vue.config.productionTip = false;
// console.log(process.env);

Vue.use(VueRouter);
// 路由配置
const RouterConfig = {
	mode: "hash", //history
	routes: Routes
};

const router = new VueRouter(RouterConfig);

router.beforeEach((to, from, next) => {
	ViewUI.LoadingBar.start();
	Utils.title(to.meta.title);
	// 已经登陆 去登陆地方
	if (Utils.isTokenOK() && to.name == "login") {
		Utils.title("主页");
		next({
			name: "home"
		});
	} else if (!Utils.noAuth(to.name) && !Utils.isTokenOK()) {
		//  不是去不需要权限的地方
		// 没有token 或者 token过期
		Utils.title("登陆");
		next({
			name: "login"
		});
	} else {
		next();
	}
});

router.afterEach(to => {
	ViewUI.LoadingBar.finish();
	window.scrollTo(0, 0);
});

// apollo
import VueApollo from "vue-apollo";
Vue.use(VueApollo);
import { ApolloClient } from "apollo-client";
import { InMemoryCache } from "apollo-cache-inmemory";
import { createUploadLink } from "apollo-upload-client";

// HTTP connection to the API

const httpOptions = {
	uri: process.env.VUE_APP_GRAPHQL_HTTP || "/query",
	headers: {
		Authorization: Utils.getToken()
	}
};

// Cache implementation
const cache = new InMemoryCache();

// Create the apollo client
const apolloClient = new ApolloClient({
	link: createUploadLink(httpOptions),
	cache
});

const apolloProvider = new VueApollo({
	defaultClient: apolloClient
});

new Vue({
	router,
	apolloProvider,
	render: h => h(App)
}).$mount("#app");
