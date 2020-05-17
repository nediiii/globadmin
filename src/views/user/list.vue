<template>
	<Card dis-hover>
		<h1>用户列表</h1>
		<br />
		<Table border stripe :columns="columns" :data="allUsers.users"></Table>
		<Drawer title="Create" v-model="drawerTrigger" width="720" :mask-closable="false" :styles="styles">
			<Form ref="formData" :model="formData" :rules="formDataRules">
				<Row :gutter="32">
					<i-col span="12">
						<FormItem label="Slug" label-position="top" prop="slug">
							<Input v-model="formData.slug" placeholder="please enter user slug(user identifier)" />
						</FormItem>
					</i-col>
					<i-col span="12">
						<FormItem label="Password" label-position="top" prop="password">
							<Input
								type="password"
								v-model="formData.password"
								placeholder="please enter user password"
							/>
						</FormItem>
					</i-col>
					<i-col span="12">
						<FormItem label="Name" label-position="top" prop="name">
							<Input v-model="formData.name" placeholder="please enter user name" />
						</FormItem>
					</i-col>
					<i-col span="12">
						<FormItem label="Email" label-position="top" prop="email">
							<Input type="email" v-model="formData.email" placeholder="please enter user email" />
						</FormItem>
					</i-col>
				</Row>
				<Row :gutter="32">
					<i-col span="12">
						<FormItem label="Role" label-position="top" prop="role">
							<Select v-model="formData.role" placeholder="please select an owner">
								<Option value="1">Owner</Option>
								<Option value="2">Admin</Option>
								<Option value="3">Editor</Option>
								<Option value="4">Author</Option>
								<Option value="5">Contributer</Option>
							</Select>
						</FormItem>
					</i-col>
				</Row>
				<FormItem label="Description" label-position="top" prop="bio">
					<Input type="textarea" v-model="formData.bio" :rows="4" placeholder="please enter the user bio" />
				</FormItem>
			</Form>
			<div class="demo-drawer-footer">
				<Button style="margin-right: 8px" @click="drawerTrigger = false">Cancel</Button>
				<Button type="primary" @click="createUser">Submit</Button>
			</div>
		</Drawer>
		<Divider />
		<Button @click="create">创建用户</Button>
	</Card>
</template>

<script>
import gql from "graphql-tag";

const createUserGql = require("@/graphql/createUser.gql");

export default {
	data() {
		return {
			allUsers: {},
			columns: [
				{
					title: "Name",
					key: "name",
					render: (h, params) => {
						return h("div", [
							h("Icon", {
								props: {
									type: "person"
								}
							}),
							h("strong", params.row.name)
						]);
					}
				},
				{ title: "slug", key: "slug" },
				{
					title: "role",
					key: "role",
					render: (h, params) => {
						return h("div", params.row.role.name);
					}
				},
				{ title: "email", key: "email" },
				{ title: "bio", key: "bio" },
				{
					title: "Action",
					key: "action",
					width: 250,
					align: "center",
					render: (h, params) => {
						return h("div", [
							h(
								"Button",
								{
									props: { type: "primary", size: "small" },
									style: { marginRight: "5px" },
									on: {
										click: () => {
											this.show(params.index);
										}
									}
								},
								"View"
							),
							h(
								"Button",
								{
									props: { type: "success", size: "small" },
									style: { marginRight: "5px" },
									on: {
										click: () => {
											this.show(params.index);
										}
									}
								},
								"Update"
							),
							h(
								"Button",
								{
									props: { type: "error", size: "small" },
									on: {
										click: () => {
											this.deleteUser(params.row.id);
										}
									}
								},
								"Delete"
							)
						]);
					}
				}
			],
			drawerTrigger: false,
			styles: {
				height: "calc(100% - 55px)",
				overflow: "auto",
				paddingBottom: "53px",
				position: "static"
			},
			formData: {
				slug: "",
				password: "",
				name: "",
				email: "",
				bio: "",
				role: ""
			},
			formDataRules: {
				slug: [{ required: true, message: " ", trigger: "blur" }],
				password: [{ required: true, message: " ", trigger: "blur" }],
				name: [{ required: true, message: " ", trigger: "blur" }],
				role: [{ required: true, message: " ", trigger: "blur" }]
			}
		};
	},
	methods: {
		show(index) {
			this.$Modal.info({
				title: "User Info",
				content: `ID: ${this.allUsers.users[index].id}<br />Name：${this.allUsers.users[index].name}<br />`
			});
		},
		remove(index) {
			this.data.splice(index, 1);
		},
		create() {
			this.drawerTrigger = true;
		},
		createUser() {
			this.$refs.formData.validate(valid => {
				if (valid) {
					console.log("valid");
					this.$apollo
						.mutate({
							mutation: createUserGql,
							variables: {
								...this.formData
							}
						})
						.then(data => {
							this.$Message.success({
								content: "创建用户成功"
							});
							this.$apollo.queries.allUsers.refetch();
							this.drawerTrigger = false;
						})
						.catch(error => {
							this.$Message.error({
								content: "创建用户失败"
							});
						});
				}
			});
		},
		deleteUser(id) {
			this.$apollo
				.mutate({
					mutation: gql`
						mutation($id: ID!) {
							deleteUser(id: $id)
						}
					`,
					variables: {
						id: id
					}
				})
				.then(data => {
					this.$Message.success({
						content: "删除用户成功"
					});
					this.$apollo.queries.allUsers.refetch();
				})
				.catch(error => {
					this.$Message.error({
						content: "删除用户失败"
					});
				});
		}
	},

	apollo: {
		allUsers: {
			query: gql`
				query {
					allUsers {
						users {
							id
							name
							email
							createAt
							updateAt
							slug
							visibility
							bio
							role {
								id
								name
							}
						}
					}
				}
			`,
			variables() {
				return {};
			}
		}
	}
};
</script>
