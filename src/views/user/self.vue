<template>
	<div>
		<Card dis-hover>
			<p slot="title"><Icon type="ios-person-outline" /> 个人信息</p>
			<div style="max-width:520px">
				<Alert closable type="error">部分信息「用户名」修改后刷新后有效</Alert>
				<Form ref="userForm" :model="user" :label-width="100" label-position="right" :rules="userRules">
					<FormItem label="用户账号：" prop="slug">
						<Input readonly disabled v-model="user.slug" />
					</FormItem>
					<FormItem label="用户名称：" prop="name">
						<Input v-model="user.name" />
					</FormItem>
					<FormItem label="邮箱地址：" prop="email">
						<Input v-model="user.email" />
					</FormItem>
					<FormItem label="登录密码：">
						<Button type="text" size="small" @click="showModel">修改密码</Button>
					</FormItem>
					<FormItem label="创建时间：">
						<span>{{ createAt }} </span>
					</FormItem>
					<FormItem label="信息：" prop="bio">
						<span>{{ user.bio }}</span>
					</FormItem>
					<FormItem>
						<Button type="warning" :loading="loadingSaveInfo" @click="saveUser">提交保存</Button>
						<Button type="success" @click="resetEdit()" style="margin-left: 8px">重置填写</Button>
					</FormItem>
				</Form>
			</div>
		</Card>
		<Modal v-model="showPasswordModal" :closable="false" :mask-closable="false" :width="500">
			<h3 slot="header" style="color:#2D8CF0"><Icon type="ios-eye-off-outline" /> 修改密码</h3>
			<Form ref="passForm" :model="passForm" :label-width="100" label-position="right" :rules="passRules">
				<FormItem label="原密码" prop="oldPass" :error="oldPassError">
					<Input v-model="passForm.oldPass" type="password" placeholder="请输入现在使用的密码" />
				</FormItem>
				<FormItem label="新密码" prop="newPass">
					<Input v-model="passForm.newPass" type="password" placeholder="请输入新密码，至少6位字符" />
				</FormItem>
				<FormItem label="确认新密码" prop="rePass">
					<Input v-model="passForm.rePass" type="password" placeholder="请再次输入新密码" />
				</FormItem>
			</Form>
			<div slot="footer">
				<Button type="warning" :loading="loadingSavePass" @click="savePass">提交保存</Button>
				<Button type="success" @click="resetForm('passForm')" style="margin-left: 8px">重置填写</Button>
				<Button type="info" @click="cancelPass()" style="margin-left: 8px">取消关闭</Button>
			</div>
		</Modal>
	</div>
</template>

<script>
import gql from "graphql-tag";
import utils from "@/utils.js";

export default {
	data() {
		const valideRePassword = (rule, value, callback) => {
			if (value !== this.passForm.newPass) {
				callback(new Error("两次输入密码不一致"));
			} else {
				callback();
			}
		};
		return {
			user: {
				id: "",
				name: "",
				slug: "",
				email: "",
				visibility: "",
				bio: "",
				createAt: ""
			},
			loadingSaveInfo: false,
			showPasswordModal: false, // 修改密码模态框显示
			loadingSavePass: false,
			oldPassError: "",
			userRules: {
				name: [
					{ required: true, message: "请输入姓名", trigger: "blur" },
					{ min: 1, message: "请至少输入1个字符", trigger: "blur" },
					{ max: 32, message: "最多输入32个字符", trigger: "blur" }
				]
			},
			passForm: { oldPass: "", newPass: "", rePass: "" },
			passRules: {
				oldPass: [{ required: true, message: "请输入原密码", trigger: "blur" }],
				newPass: [
					{ required: true, message: "请输入新密码", trigger: "blur" },
					{ min: 6, message: "请至少输入8个字符", trigger: "blur" },
					{ max: 64, message: "最多输入64个字符", trigger: "blur" }
				],
				rePass: [
					{ required: true, message: "请再次输入新密码", trigger: "blur" },
					{ validator: valideRePassword, trigger: "blur" }
				]
			}
		};
	},

	methods: {
		showModel() {
			this.showPasswordModal = true;
		},
		resetEdit() {
			this.init();
		},
		resetForm(form) {
			this.$refs[form].resetFields();
		},
		saveUser() {
			this.$refs["userForm"].validate(valid => {
				if (valid) {
					// this.loadingSaveInfo = true;
					// admUserEditSelf(this.userForm).then(res => {
					// 	this.loadingSaveInfo = false;
					// 	if (res.code == 200) {
					// 		this.$Message.success({
					// 			content: "信息修改成功",
					// 			onClose: () => {
					// 				this.loadingSavePass = false;
					// 			}
					// 		});
					// 	} else {
					// 		this.$Message.error({ content: `信息修改失败,请重试`, duration: 3 });
					// 	}
					// });
					this.updateUser();
				}
			});
		},
		cancelPass() {
			this.showPasswordModal = false;
		},
		savePass() {
			this.$refs["passForm"].validate(valid => {
				if (valid) {
					this.updateUserPassword();
				}
			});
		},
		updateUserPassword() {
			this.loadingSavePass = true;
			this.$apollo
				.mutate({
					mutation: gql`
						mutation($id: ID!, $oldPassword: String!, $newPassword: String!) {
							updateUser(id: $id, oldPassword: $oldPassword, newPassword: $newPassword) {
								id
							}
						}
					`,
					variables: {
						id: utils.getClaims()["jti"],
						oldPassword: this.passForm.oldPass,
						newPassword: this.passForm.newPass
					}
				})
				.then(({ data }) => {
					this.$Message.success({
						content: "密码修改成功,请重新登陆",
						onClose: () => {
							this.$router.push({ name: "login" });
						}
					});
					utils.clearItem("bearer");
					this.loadingSavePass = false;
				})
				.catch(error => {
					console.dir(error);
					this.$Message.error({ content: error.message.substring(8), duration: 2 });
					this.loadingSavePass = false;
				});
		},
		updateUser() {
			this.loadingSavePass = true;
			this.$apollo
				.mutate({
					mutation: gql`
						mutation($id: ID!, $name: String!, $email: String!, $bio: String!) {
							updateUser(id: $id, name: $name, email: $email, bio: $bio) {
								id
							}
						}
					`,
					variables: {
						id: utils.getClaims()["jti"],
						name: this.user.name,
						email: this.user.email,
						bio: this.user.bio
					}
				})
				.then(({ data }) => {
					this.$Message.success({
						content: "信息修改成功",
						onClose: () => {
							this.loadingSavePass = false;
						}
					});
				})
				.catch(error => {
					this.$Message.error({ content: error.message.substring(8), duration: 2 });
				});
			this.loadingSavePass = false;
		}
	},
	computed: {
		createAt() {
			return utils.timeFormat(this.user.createAt);
		}
	},
	apollo: {
		user: {
			query: gql`
				query($id: ID!, $name: String) {
					user(id: $id, name: $name) {
						id
						name
						slug
						email
						visibility
						bio
						createAt
					}
				}
			`,
			variables() {
				return {
					id: utils.getClaims()["jti"]
					// id: 4
				};
			},
			result({ data, loading, networkStatus }) {},
			error(error) {
				this.$Message.error({ content: `未查询到数据，请重试`, duration: 3 });
			}
		}
	}
};
</script>
