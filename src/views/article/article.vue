<template>
	<div>
		<Card dis-hover>
			<Row :gutter="2">
				<i-col span="20">
					<Form ref="dataForm" :rules="PostRules" :model="Post">
						<FormItem style="margin-bottom:15px" prop="title">
							<Input v-model="Post.title" placeholder="请输入标题" />
						</FormItem>
						<FormItem style="margin-bottom:15px" prop="path">
							<Row>
								<i-col span="8">
									<Input
										type="text"
										:disabled="isEdit"
										v-model="Post.slug"
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
							@imgAdd="imgAddNew"
							:boxShadow="false"
							@change="change"
							:toolbars="toolbars"
							v-model="Post.markdown"
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
									<Option v-for="tag in TagList.tags" :value="tag.id" :key="tag.id">{{
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
// 通用 文章/页面 + 添加/修改
// 减少js体积
export default {
	components: {
		mavonEditor
	},
	data() {
		return {
			TagList: {},
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
			PostRules: {
				title: [{ required: true, message: " ", trigger: "blur" }],
				slug: [{ required: true, message: " ", trigger: "blur" }]
			},
			Post: {}
		};
	},

	apollo: {
		Post: {
			query: gql`
				query($id: ID) {
					Post(id: $id) {
						id
						status
						tags {
							id
							name
						}
						title
						slug
						html
						markdown
						update_at
					}
				}
			`,
			variables() {
				return {
					id: this.$route.params.id
				};
			},
			result({ data, loading, networkStatus }) {
				this.tags = data.Post.tags.map(tag => tag.id);
			},
			error(error) {
				this.$Message.warning({ content: "获取Post失败" });
			}
		},
		TagList: {
			query: gql`
				query {
					TagList {
						tags {
							id
							name
							description
						}
						page_info {
							has_previous_page
							has_next_page
							total
							last_page
							current_page
							per_page
						}
					}
				}
			`
		}
	},

	methods: {
		init() {
			if (this.isPost) {
				this.getCate();
				this.getTag();
			}
			if (this.isEdit) {
				this.getOne();
			}
			if (this.isPost && this.isEdit) {
				apiPostTagGet(this.dataId).then(resp => {
					if (resp.code == 200) {
						this.tags = resp.data;
					}
				});
			}
		},
		getCate() {
			apiCateAll().then(resp => {
				if (resp.code == 200) {
					this.cateAll = resp.data;
					if (this.isAdd) {
						this.dataForm.cate_id = resp.data[0].id;
					}
				} else {
					this.cateAll = [];
					this.$Message.warning("未查询到分类信息,请重试！");
				}
			});
		},
		getTag() {
			apiTagAll().then(resp => {
				if (resp.code == 200) {
					this.tagAll = resp.data;
				} else {
					this.tagAll = [];
					this.$Message.warning("未查询到标签信息,请重试！");
				}
			});
		},
		getOne() {
			apiPostGet(this.dataId).then(resp => {
				if (resp.code == 200) {
					this.dataForm = resp.data;
				} else {
					this.dataForm = {
						title: "",
						path: "",
						summary: "",
						cate_id: 0,
						status: 0,
						is_public: true,
						allow_comment: false,
						create_time: "",
						content: "",
						markdown_content: ""
					};
					this.$Message.warning("未查询到信息，请重试！");
				}
			});
		},
		change(value, html) {
			// 保存 html
			this.Post.html = html;
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
			this.$refs.md.$img2Url(
				pos,
				"https://user-images.githubusercontent.com/378023/80668639-595e9e00-8add-11ea-8673-4a481cc7e2dd.png"
			);
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
					if (this.Post.markdown == "") {
						this.$Message.warning("请填写内容");
						return;
					}
					console.log(this.dataForm);
					this.draftLoading = true;
					this.$apollo
						.mutate({
							mutation: gql`
								mutation($id: ID!, $html: String, $md: String) {
									UpdatePost(id: $id, html: $html, markdown: $md) {
										id
										status
										tags {
											id
											name
										}
										title
										slug
										html
										markdown
										update_at
									}
								}
							`,
							variables: {
								id: this.Post.id,
								html: this.Post.html,
								md: this.Post.markdown
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
	mounted() {
		var md = this.$refs.md;
		var toolbar_left = md.$refs.toolbar_left;
		var diy = this.$refs.diy;
		toolbar_left.$el.append(diy);
	}
};
</script>

<style lang="less">
@import "./article.less";
</style>
