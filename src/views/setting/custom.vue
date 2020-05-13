<template>
	<Card dis-hover>
		<!-- <p slot="title"><Icon type="ios-code-working" />自定义设置</p>
		<p><button @click="upload">测试</button></p>
		<div>
			<Form label-position="top">
				<FormItem label="自定义代码">
					<Input
						v-model="model.value"
						style="width:600px"
						type="textarea"
						:autosize="{ minRows: 15, maxRows: 20 }"
						placeholder="Enter code "
					/>
				</FormItem>
				<div>
					<Button type="warning" :loading="saveLoading" @click="cmtSave">
						保&nbsp;&nbsp;&nbsp;&nbsp;存
					</Button>
				</div>
			</Form>
		</div> -->
		<div v-html="post.html"></div>
	</Card>
</template>

<script>
import gql from "graphql-tag";

export default {
	data() {
		return {
			model: { key: "custom_js", value: "" },
			saveLoading: false,
			allRoles: {},
			post: {}
		};
	},
	methods: {
		cmtSave() {
			this.saveLoading = true;
			admOptsEdit(this.model).then(resp => {
				this.saveLoading = false;
				if (resp.code == 200) {
					this.$Message.success({ content: "自定义js,更新成功" });
				} else {
					this.$Message.error({
						content: `自定义js,更新失败,请重试`,
						duration: 3,
						onClose() {
							this.init();
						}
					});
				}
			});
		},
		init() {
			apiOptsGet(this.model.key).then(resp => {
				if (resp.code == 200) {
					this.model.value = resp.data;
				} else {
					this.model.value = "";
				}
			});
		},
		upload() {
			this.$apollo.mutate({
				mutation: gql`
					mutation($file: Upload!) {
						singleUpload(file: $file) {
							hash
							url
							id
							name
							content
						}
					}
				`,
				// ...
				context: {
					hasUpload: true // Important!
				},
				variables: {
					file: new File(["123"], "testfile.txt", { type: "text/plain" })
				}
			});
		},
		uploadWithPayload() {
			this.$apollo.mutate({
				mutation: gql`
					mutation($req: UploadFile!) {
						singleUploadWithPayload(req: $req) {
							id
							name
							content
						}
					}
				`,
				variables: {
					req: {
						id: 22,
						file: new File(["123"], "testfile.txt", { type: "text/plain" })
					}
				}
			});
		},
		uploadMultiple() {
			this.$apollo.mutate({
				mutation: gql`
					mutation($files: [Upload!]!) {
						multipleUpload(files: $files) {
							id
							name
							content
						}
					}
				`,
				variables: {
					files: [
						new File(["123"], "testfile.txt", { type: "text/plain" }),
						new File(["456"], "testfile.txt", { type: "text/plain" }),
						new File(["789"], "testfile.txt", { type: "text/plain" })
					]
				}
			});
		},
		uploadMultipleWithPayload() {
			this.$apollo.mutate({
				mutation: gql`
					mutation($req: [UploadFile!]!) {
						multipleUploadWithPayload(req: $req) {
							id
							name
							content
						}
					}
				`,
				variables: {
					req: [
						{ id: 1, file: new File(["a"], "testfileg.txt", { type: "text/plain" }) },
						{ id: 2, file: new File(["b"], "testfileh.txt", { type: "text/plain" }) },
						{ id: 3, file: new File(["c"], "testfilej.txt", { type: "text/plain" }) },
						{ id: 4, file: new File(["d"], "testfilek.txt", { type: "text/plain" }) }
					]
				}
			});
		}
	},
	mounted() {
		this.init();
	},
	apollo: {
		allRoles: {
			query: gql`
				query {
					allRoles {
						roles {
							id
						}
					}
				}
			`
		},
		post: {
			query: gql`
				query($id: ID) {
					post(id: $id) {
						id
						slug
						status
						title
						html
						markdown
						updateAt
						tagConnection {
							tags {
								id
								name
								description
							}
						}
					}
				}
			`,
			variables() {
				return {
					id: 3
				};
			}
		}
	}
};
</script>
