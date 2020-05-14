<template>
	<div class="login" @keydown.enter="submit">
		<div class="top">
			<div class="header">
				<a>
					<span class="title">欢迎登陆</span>
				</a>
			</div>
		</div>
		<div class="main">
			<Form ref="loginForm" :model="loginForm" :rules="loginFormRules">
				<FormItem prop="username" label="用户名">
					<Input
						size="large"
						prefix="ios-person-outline"
						maxlength="32"
						type="text"
						v-model="loginForm.username"
						placeholder="请输入用户名"
					/>
				</FormItem>
				<FormItem prop="password" label="密 码">
					<Input
						size="large"
						prefix="ios-lock-outline"
						password
						maxlength="64"
						type="password"
						v-model="loginForm.password"
						placeholder="请输入密码"
					/>
				</FormItem>
				<FormItem>
					<Button size="large" @click="submit" type="primary" long>登 录</Button>
				</FormItem>
			</Form>
			<p class="login-tip">
				<a href="/" title="首页">
					<Icon type="ios-send-outline" size="20" />
					首页
				</a>
			</p>
			<div class="other-login" v-if="false">
				<span>其他登录方式</span>&nbsp;
				<a>
					<Icon type="logo-github" />
				</a>
			</div>
		</div>
		<div class="footer">
			<div class="links" v-if="false">
				<a>帮助</a>
				<a>隐私</a>
				<a>条款</a>
			</div>
			<div class="copyright">
				Copyright &copy; {{ new Date().getFullYear() }}&nbsp;
				<a target="_blank" href="https://github.com/nediiii">
					github.com/nediiii
				</a>
			</div>
		</div>
	</div>
</template>

<script>
import gql from "graphql-tag";
import util from "@/utils.js";

export default {
	data() {
		return {
			loginForm: { username: "", password: "" },
			loginFormRules: {
				username: [{ required: true, message: "用户名不能为空", trigger: "blur" }],
				password: [{ required: true, message: "密码不能为空", trigger: "blur" }]
			}
		};
	},
	methods: {
		submit() {
			this.$refs.loginForm.validate(valid => {
				if (valid) {
					this.login();
				}
			});
		},
		login() {
			this.$apollo
				.mutate({
					mutation: gql`
						mutation($username: String!, $password: String!) {
							auth(username: $username, password: $password) {
								expireAt
								token
							}
						}
					`,
					variables: {
						username: this.loginForm.username,
						password: this.loginForm.password
					}
				})
				.then(({ data }) => {
					util.setToken(data.auth.token);
					util.setExpireAt(data.auth.expireAt);
					this.$Message.success({
						content: "登陆成功",
						onClose: () => {
							// this.$router.push({ name: "home" });
							this.$router.go(); // refresh the page to let apollo get the correct token
						}
					});
				})
				.catch(error => {
					this.$Message.error({ content: `登录验证失败,请确认账号密码后重试`, duration: 1 });
				});
		}
	}
};
</script>

<style lang="less" scoped>
@import "./login.less";
</style>
