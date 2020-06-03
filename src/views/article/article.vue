<template>
	<div>
		<Card dis-hover>
			<Row :gutter="2">
				<i-col span="20">
					<!-- Editor -->
					<div style="min-height: 600px;height: calc(100vh - 60px);">
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
							@imgAdd="onImgAddEditor"
							@change="onChangeEditor"
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
							<span> 设置</span>
						</p>
						<Form ref="dataForm" :rules="dataFormRules" :model="post">
							顶栏图片 :
							<FormItem style="margin:0px">
								<Upload multiple type="drag" :before-upload="handleUpload" action="">
									<div v-if="post.image.length == 0" style="padding: 20px 0">
										<Icon type="ios-cloud-upload" size="52" style="color: #3399ff"></Icon>
										<p>Click or drag files here to upload</p>
									</div>
									<img v-else style="width:100%;height:100%;" :src="post.image" alt="" />
								</Upload>
							</FormItem>

							<FormItem label="标题" style="margin:0px" prop="title">
								<Input v-model="post.title" placeholder="请输入标题" />
							</FormItem>
							<FormItem label="URL路径" style="margin:0px" prop="slug">
								<Input type="text" v-model="post.slug" placeholder="请输入访问路径" />
							</FormItem>
							<FormItem v-if="!isPage" style="margin:0px" label="标签">
								<Select v-model="tags" multiple placeholder="请选择文章标签">
									<Option v-for="tag in allTags.tags" :value="tag.id" :key="tag.id">
										{{ tag.name }}
									</Option>
								</Select>
							</FormItem>
							<FormItem style="margin:0px" label="摘要" prop="excerpt">
								<Input type="textarea" v-model="post.excerpt" placeholder="请输入文章摘要/关键词" />
							</FormItem>
							<FormItem prop="commentable">
								<Checkbox v-model="post.commentable">开启评论</Checkbox>
							</FormItem>

							<FormItem>
								<Button type="info" icon="ios-paper" @click="onClickDraft" :loading="draftLoading">
									保 存
								</Button>
								&nbsp;
								<Button
									type="success"
									icon="ios-send"
									@click="onClickPublish"
									:loading="publishLoading"
								>
									发 布
								</Button>
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
import util from "@/utils.js";
import gql from "graphql-tag";

const postGql = require("@/graphql/post.gql");
const updatePostGql = require("@/graphql/updatePost.gql");
const createPostGql = require("@/graphql/createPost.gql");

export default {
	props: {
		isAdd: {
			type: Boolean,
			default: false
		},
		isPage: {
			type: Boolean,
			default: false
		}
	},

	data() {
		return {
			selectImg: false,
			loadingStatus: false,
			draftLoading: false,
			publishLoading: false,
			toolbars: toolbars,
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
			dataFormRules: {
				title: [{ required: true, message: " ", trigger: "blur" }],
				slug: [{ required: true, message: " ", trigger: "blur" }]
			},
			post: {
				id: "",
				slug: "",
				title: "",
				markdown: "",
				html: "",
				image: "",
				excerpt: "",
				status: "",
				publishAt: "",
				publishBy: "",
				featured: false,
				paged: false,
				commentable: false
			},
			allTags: {}
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
		handleUpload(file) {
			this.$apollo
				.mutate({
					mutation: gql`
						mutation($file: Upload!) {
							singleUpload(file: $file) {
								hash
								url
								id
								name
							}
						}
					`,
					variables: {
						file: file
					}
				})
				.then(({ data }) => {
					// this.$refs.md.$img2Url(pos, data.singleUpload.url);
					this.post.image = data.singleUpload.url;
					// this.selectImg = true;
				})
				.catch(error => {
					this.$Message.warning({ content: "图片上传失败,请重试" });
				});
			return false;
		},
		onChangeEditor(value, html) {
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
		onImgAddEditor(pos, $file) {
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

		// 保存
		onClickDraft() {
			this.$refs.dataForm.validate(valid => {
				if (valid) {
					if (this.post.markdown == "") {
						this.$Message.warning("请填写内容");
						return;
					}
					this.draftLoading = true;
					this.updatePost(false);
					this.draftLoading = false;
				}
			});
		},
		// 发布
		onClickPublish() {
			this.$refs.dataForm.validate(valid => {
				if (valid) {
					this.publishLoading = true;
					this.updatePost(true);
					this.publishLoading = false;
				}
			});
		},
		updatePost(isPublished) {
			this.$apollo
				.mutate({
					mutation: this.isAdd ? createPostGql : updatePostGql,
					variables: {
						id: this.post.id,
						slug: this.post.slug,
						title: this.post.title,
						html: this.post.html,
						markdown: this.post.markdown,
						excerpt: this.post.excerpt,
						image: this.post.image,
						primaryAuthorId: util.getClaims()["jti"],
						tags: this.tags,
						commentable: this.post.commentable,
						paged: this.isPage,
						status: isPublished ? "published": ""
					}
				})
				.then(result => {
					this.$Message.success({
						content: "更新成功"
					});

					if (this.isAdd) {
						this.$router.push({
							name: this.isPage ? "page-edit" : "post-edit",
							params: { id: result.data.createPost.id }
						});
					}
				})
				.catch(error => {
					this.$Message.error({
						content: "更新失败"
					});
				});
		}
	},

	apollo: {
		post: {
			query: postGql,
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
			},
			skip() {
				return this.isAdd; // 当添加页面时跳过获取post
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
