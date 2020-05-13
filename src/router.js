import Layout from "@/views/layout.vue";
// 分小模块单独写路由
const initRouter = [
	{
		// 跳转到默认页面
		path: "/",
		name: "index",
		redirect: "/login"
	},
	{
		path: "/login",
		name: "login",
		meta: {
			title: "登录"
		},
		component: () => import("@/views/login.vue")
	},
	{
		path: "/",
		name: "core",
		redirect: "/home",
		component: Layout,
		children: [
			{
				path: "home",
				meta: {
					title: "管理主页"
				},
				name: "home",
				component: () => import("@/views/home/home.vue")
			}
		]
	}
];
export const errorRouter = [
	{
		path: "/jwt",
		name: "errjwt",
		meta: {
			title: "jwt-重新登录"
		},
		component: () => import("@/views/errors/jwt.vue")
	},
	{
		path: "/401",
		name: "err401",
		meta: {
			title: "401-没有权限"
		},
		component: () => import("@/views/errors/401.vue")
	},
	{
		path: "/50x",
		name: "err50x",
		meta: {
			title: "50x-服务异常"
		},
		component: () => import("@/views/errors/50x.vue")
	},
	{
		path: "/*",
		name: "err404",
		meta: {
			title: "404-没发现"
		},
		component: () => import("@/views/errors/404.vue")
	}
];

// 作为Main组件的子页面展示并且在左侧菜单显示的路由写在appRouter里
const appRouter = [
	{
		path: "/post",
		name: "post",
		meta: {
			title: "文章管理"
		},
		component: Layout,
		children: [
			{
				path: "list",
				name: "post-list",
				meta: {
					title: "文章列表"
				},
				component: () => import("@/views/post/list.vue")
			},
			{
				path: "add",
				name: "post-add",
				meta: {
					title: "添加文章"
				},
				component: () => import("@/views/article/article.vue"),
				props: { isAdd: true, isPost: true }
			},
			{
				path: "edit/:id(\\d+)",
				name: "post-edit",
				meta: {
					title: "编辑文章"
				},
				props: { isEdit: true, isPost: true },
				component: () => import("@/views/article/article.vue")
			}
		]
	},
	{
		path: "/page",
		name: "page",
		meta: {
			title: "页面管理"
		},
		component: Layout,
		children: [
			{
				path: "list",
				meta: {
					title: "页面列表"
				},
				name: "page-list",
				props: { isPost: false, isPage: true },
				component: () => import("@/views/post/list.vue")
			},
			{
				path: "add",
				meta: {
					title: "添加页面"
				},
				name: "page-add",
				component: () => import("@/views/article/article.vue")
			},
			{
				path: "edit/:id(\\d+)",
				name: "page-edit",
				meta: {
					title: "编辑页面"
				},
				component: () => import("@/views/article/article.vue")
			}
		]
	},
	// tag
	{
		path: "/tag",
		name: "tag",
		meta: {
			title: "标签管理"
		},
		component: Layout,
		children: [
			{
				path: "list",
				meta: {
					title: "标签列表"
				},
				name: "tag-list",
				component: () => import("@/views/tag/list.vue")
			},
			{
				path: "add",
				meta: {
					title: "添加标签"
				},
				name: "tag-add",
				component: () => import("@/views/tag/add.vue")
			}
		]
	},
	{
		path: "/setting",
		name: "setting",
		meta: {
			title: "系统设置",
			icon: "ios-cog-outline"
		},
		component: Layout,
		children: [
			{
				path: "base",
				meta: {
					title: "基本设置"
				},
				name: "setting-base",
				component: () => import("@/views/setting/base.vue")
			}
		]
	},
	{
		path: "",
		icon: "ios-contact-outline",
		meta: {
			title: "个人中心"
		},
		component: Layout,
		children: [
			{
				path: "self",
				meta: {
					title: "个人中心",
					icon: "ios-contact-outline"
				},
				name: "self",
				component: () => import("@/views/user/self.vue")
			}
		]
	}
];
// 所有定义的路由都要写在下面的routers里
const routes = [...initRouter, ...appRouter, ...errorRouter];
export default routes;
