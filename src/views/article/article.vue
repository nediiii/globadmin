<template>
	<div>
		<Card dis-hover>
			<Row :gutter="2">
				<i-col span="20">
					<Form ref="dataForm" :rules="dataFormRules" :model="post">
						<FormItem style="margin-bottom:15px" prop="title">
							<Input v-model="post.title" placeholder="请输入标题" />
						</FormItem>
						<FormItem style="margin-bottom:15px" prop="slug">
							<Row>
								<i-col span="8">
									<Input
										type="text"
										:disabled="false"
										v-model="post.slug"
										placeholder="请输入访问路径"
									/>
								</i-col>
								<i-col span="10" style="min-width:250px">
									<Button type="success" @click="cmtDraft" :loading="draftLoading">
										<Icon type="ios-eye" size="22" />预览
									</Button>
									<Button type="info" @click="cmtDraftNew" :loading="draftLoading">
										<Icon type="ios-trash" size="20" />存草稿
									</Button>
									&nbsp;
									<Button type="warning" @click="cmtPublish" :loading="publishLoading">
										<Icon type="ios-send" size="20" />发 布
									</Button>
								</i-col>
							</Row>
						</FormItem>
					</Form>

					<!-- Editor -->
					<div style="min-height: 600px;height: calc(100vh - 145px);">
						<button
							ref="diy"
							type="button"
							@click="diyMore"
							class="op-icon ivu-icon ivu-icon-md-code"
							aria-hidden="true"
							title="更多"
						></button>
						<mavon-editor
							ref="md"
							:boxShadow="false"
							:toolbars="toolbars"
							@imgAdd="imgAddNew"
							@change="change"
							v-model="post.markdown"
							style="height:100%"
						>
						</mavon-editor>
					</div>
				</i-col>
				<i-col span="4">
					<Card dis-hover :bordered="false">
						<p slot="title">
							<Icon type="ios-settings-outline" />
							设置
						</p>
						<Form ref="optsForm" label-position="top">
							<FormItem label="权限" prop="is_public">
								<i-switch v-model="dataForm.is_public">
									<span slot="open">公开</span> <span slot="close">私密</span>
								</i-switch>
							</FormItem>
							<FormItem label="评论" prop="allow_comment">
								<Checkbox v-model="dataForm.allow_comment">允许评论</Checkbox>
							</FormItem>
							<FormItem label="发布日期">
								<DatePicker
									v-model="dataForm.create_time"
									type="datetime"
									placeholder="选择发布日期和时间"
									:clearable="false"
									:editable="false"
								></DatePicker>
							</FormItem>
							<FormItem v-if="isPost" label="标签">
								<Select v-model="tags" multiple placeholder="请选择文章标签">
									<Option v-for="tag in allTags.tags" :value="tag.id" :key="tag.id">{{
										tag.name
									}}</Option>
								</Select>
							</FormItem>
						</Form>
					</Card>
				</i-col>
			</Row>
		</Card>
	</div>
</template>

<script>
import { mavonEditor } from "mavon-editor";
import "mavon-editor/dist/css/index.css";
import toolbars from "./toolbars";
import { apiCateAll } from "@/api/cate";
import { apiTagAll } from "@/api/tag";
import util from "@/utils.js";
import { apiPostGet, admPostOpts, apiPostTagGet } from "@/api/post";
import gql from "graphql-tag";

export default {
	props: {
		isAdd: {
			type: Boolean,
			default: false
		},
		isPost: {
			type: Boolean,
			default: true
		},
		isPage: {
			type: Boolean,
			default: false
		}
	},

	data() {
		return {
			allTags: {},
			cateAll: [],
			tagAll: [],
			draftLoading: false,
			publishLoading: false,
			dataForm: {
				title: "",
				path: "",
				status: 0,
				summary: "",
				cate_id: 0,
				is_public: true,
				allow_comment: false,
				create_time: "",
				content: "",
				markdown_content: ""
			},
			tags: [],
			toolbars: toolbars,
			dataFormRules: {
				title: [{ required: true, message: " ", trigger: "blur" }],
				slug: [{ required: true, message: " ", trigger: "blur" }]
			},
			post: {
				id: "",
				slug: "",
				title: ""
			}
		};
	},

	mounted() {
		var md = this.$refs.md;
		var toolbar_left = md.$refs.toolbar_left;
		var diy = this.$refs.diy;
		toolbar_left.$el.append(diy);
	},

	components: {
		mavonEditor
	},

	methods: {
		change(value, html) {
			this.post.html = html;
		},
		clkPreview() {
			if (!this.dataForm.id) {
				this.$Message.warning("添加状态无法预览");
				return;
			}
			let ext = "";
			if (this.isPost) {
				ext = ".html";
			}
			window.open(this.prefix + this.dataForm.path + ext);
		},
		diyMore(val) {
			this.$refs.md.insertText(this.$refs.md.getTextareaDom(), {
				prefix: "",
				subfix: "",
				str: "<!--more-->"
			});
		},
		imgAdd(pos, $file) {
			let formData = new FormData();
			let xhr = new XMLHttpRequest();
			xhr.withCredentials = false;
			xhr.open("POST", process.env.VUE_APP_SRV + "/adm/upload");
			xhr.onload = () => {
				var json;
				if (xhr.status < 200 || xhr.status >= 300) {
					this.$Message.warning("图片上传失败,HTTP Error: " + xhr.status);
					return;
				}
				json = JSON.parse(xhr.responseText);
				if (!json || json.code != 200) {
					this.$Message.warning("图片上传失败");
					return;
				}
				this.$refs.md.$img2Url(pos, process.env.VUE_APP_SRV + json.data);
			};

			formData.append("token", util.getToken());
			formData.append("file", $file);
			xhr.send(formData);
		},
		imgAddNew(pos, $file) {
			this.getFileHash($file).then(
				// success
				hash => {
					console.log("test for here start");
					this.$apollo
						.mutate({
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
							variables: {
								file: $file
							}
						})
						.then(({ data }) => {
							this.$refs.md.$img2Url(pos, data.singleUpload.url);
						})
						.catch(error => {
							this.$Message.warning({ content: "文件上传失败" });
						});
				},
				// error
				() => {
					this.$Message.warning("文件Hash异常");
				}
			);
		},

		getFileHash(file) {
			return new Promise((resolve, reject) => {
				const reader = new FileReader();
				reader.readAsArrayBuffer(file);
				reader.onload = function() {
					crypto.subtle.digest("SHA-256", this.result).then(arrayBuffer => {
						let hashArray = Array.from(new Uint8Array(arrayBuffer));
						let hashStr = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
						// console.log("getFileHash.sha256:", hashStr);
						resolve(hashStr);
					});
				};
				reader.onerror = error => reject(error);
			});
		},

		// 存草稿
		cmtDraft() {
			this.$refs.dataForm.validate(valid => {
				if (valid) {
					if (this.dataForm.content == "") {
						this.$Message.warning("请填写内容");
						return;
					}
					console.log(this.dataForm);
					this.dataForm.status = 0; //草稿
					this.draftLoading = true;
					admPostOpts({
						post: this.dataForm,
						edit: this.isEdit,
						type: this.isPost ? 0 : 1,
						tags: this.tags
					}).then(resp => {
						this.draftLoading = false;
						if (resp.code == 200) {
							this.$Message.success({
								content: resp.msg
							});
						} else if (resp.code == 300) {
							this.$Message.warning({
								content: resp.msg
							});
						} else {
							this.$Message.error({
								content: resp.msg
							});
						}
					});
				}
			});
		},
		// 存草稿
		cmtDraftNew() {
			this.$refs.dataForm.validate(valid => {
				if (valid) {
					if (this.post.markdown == "") {
						this.$Message.warning("请填写内容");
						return;
					}
					console.log(this.dataForm);
					this.draftLoading = true;
					this.$apollo
						.mutate({
							mutation: gql`
								mutation($id: ID!, $html: String, $md: String) {
									updatePost(id: $id, html: $html, markdown: $md) {
										id
										status
										title
										slug
										html
										markdown
										updateAt
									}
								}
							`,
							variables: {
								id: this.post.id,
								html: this.post.html,
								md: this.post.markdown
							}
						})
						.then(data => {
							this.draftLoading = false;
							this.$Message.success({
								content: "更新成功"
							});
							console.log(data);
						})
						.catch(error => {
							// Error
							console.error(error);
							// We restore the initial user input
						});
				}
			});
		},
		// 发布
		cmtPublish() {
			this.$refs.dataForm.validate(valid => {
				if (valid) {
					if (this.dataForm.content == "") {
						this.$Message.warning("请填写内容");
						return;
					}
					this.dataForm.status = 3; //发布
					this.publishLoading = true;
					admPostOpts({
						post: this.dataForm,
						edit: this.isEdit,
						type: this.isPost ? 0 : 1,
						tags: this.tags
					}).then(resp => {
						this.publishLoading = false;
						if (resp.code == 200) {
							this.$Message.success({
								content: resp.msg,
								onClose: () => {
									if (!this.isEdit) {
										if (this.isPost) {
											this.$router.push({
												name: "post-list"
											});
										} else {
											this.$router.push({
												name: "page-list"
											});
										}
									}
								}
							});
						} else if (resp.code == 300) {
							this.$Message.warning({
								content: resp.msg
							});
						} else {
							this.$Message.error({
								content: resp.msg
							});
						}
					});
				}
			});
		}
	},

	computed: {
		// 是否 post
		isPost() {
			return this.$route.name.indexOf("post") > -1;
		},
		// 是否编辑
		isEdit() {
			return this.$route.name.indexOf("edit") > -1;
		},
		// 是否添加
		isAdd() {
			return this.$route.name.indexOf("add") > -1;
		},
		// 数据id
		dataId() {
			if (this.isEdit) {
				return parseInt(this.$route.params.id, 10);
			}
			return 0;
		},
		// 访问前缀
		prefix() {
			if (this.isPost) {
				return process.env.VUE_APP_SRV + "/post/";
			}
			return process.env.VUE_APP_SRV + "/page/";
		}
	},

	apollo: {
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
					id: this.$route.params.id
				};
			},
			result({ data, loading, networkStatus }) {
				this.tags = data.post.tagConnection.tags.map(tag => tag.id);
			},
			error(error) {
				this.$Message.warning({ content: "获取Post失败" });
			}
		},
		allTags: {
			query: gql`
				query {
					allTags {
						tags {
							id
							name
							description
						}
					}
				}
			`
		}
	}
};
</script>

<style lang="less">
@import "./article.less";
</style>
