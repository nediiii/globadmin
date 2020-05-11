<template>
	<Card dis-hover>
		<Form inline>
			<FormItem>
				<Select v-model="selectTag" placeholder="请选择文章类别" style="width:200px">
					<Option v-for="tag in allTags.tags" :value="tag.id" :key="tag.id">
						{{ tag.name }} [{{ tag.description }}]
					</Option>
				</Select>
			</FormItem>
			<FormItem>
				<Button type="primary" @click="tagFilter">查&nbsp;询</Button>
			</FormItem>
		</Form>
		<Table size="small" stripe :columns="cols" :data="posts" />
		<br />
		<Page
			:total="total"
			:current="currentPage"
			:page-size="perPage"
			:page-size-opts="[10, 12, 15, 20, 30]"
			@on-change="onChange"
			@on-page-size-change="onPageSizeChange"
			show-sizer
			show-elevator
		/>
	</Card>
</template>
<script>
import gql from "graphql-tag";

export default {
	data() {
		return {
			currentPage: 1,
			perPage: 6,
			total: 0,
			posts: [],
			selectTag: 0,
			cateAll: [],
			cols: [
				{ type: "index", width: 60, align: "center" },
				{
					title: "标题",
					ellipsis: true,
					tooltip: true,
					render: (h, data) => {
						return h("div", data.row.title);
					}
				},
				{
					title: "状态",
					width: 80,
					render: (h, data) => {
						if (data.row.status == "published") {
							return h("div", "已发布");
						} else {
							return h("div", "草稿");
						}
					}
				},
				{
					title: "权限",
					width: 80,
					render: (h, data) => {
						if (data.row.is_public) {
							return h("div", "公开");
						} else {
							return h("div", "私有");
						}
					}
				},
				{ title: "点击量", width: 80, key: "hits" },
				{
					title: "上次修改日期",
					width: 150,
					render: (h, data) => {
						return h("div", new Date(data.row.updateAt * 1000).toLocaleString().substr(0, 18));
					}
				},
				{
					title: "操作",
					key: "action",
					width: 150,
					align: "center",
					render: (h, data) => {
						return h("a", [
							h("Icon", {
								props: { type: "md-eye", size: "20", color: "#5FB878" },
								attrs: { title: "预览" },
								style: { marginRight: "15px" },
								on: {
									click: () => {
										console.log(data.row.slug);
										window.open(process.env.VUE_APP_SRV_NEW + "/post/" + data.row.slug);
									}
								}
							}),
							h("Icon", {
								props: { type: "md-create", size: "20", color: "#FFB800" },
								attrs: { title: "修改" },
								style: { marginRight: "15px" },
								on: {
									click: () => {
										this.$router.push({
											name: "post-edit",
											params: { id: data.row.id }
										});
									}
								}
							}),
							h(
								"Poptip",
								{
									props: { confirm: true, title: "确定要删除吗？" },
									on: {
										"on-ok": () => {
											this.deletePost(data);
										}
									}
								},
								[
									h("Icon", {
										props: { type: "ios-trash", size: "20", color: "#FF5722" },
										attrs: { title: "删除" }
									})
								]
							)
						]);
					}
				}
			],
			allPosts: {
				// posts: [],
				// pageInfo: {
				// 	has_previous_page: false,
				// 	has_next_page: true,
				// 	total: 10,
				// 	last_page: 1,
				// 	current_page: 1,
				// 	perPage: 5
				// }
			},
			allTags: {
				tags: [],
				page_info: {}
			}
		};
	},
	methods: {
		onChange(currentPage) {
			this.currentPage = currentPage;
		},
		onPageSizeChange(perPage) {
			this.perPage = perPage;
		},
		tagFilter() {
			console.log(this.selectTag);
		},
		deletePost(data) {
			console.log(data);
			this.$apollo
				.mutate({
					mutation: gql`
						mutation($id: ID!) {
							deletePost(id: $id)
						}
					`,
					variables: {
						id: data.row.id
					}
				})
				.then(result => {
					if (result.data.deletePost) {
						this.$Message.success({
							content: "删除成功",
							onClose: () => {
								this.$apollo.queries.allPosts.refetch();
							}
						});
					} else {
						this.$Message.error({
							content: "删除异常",
							onClose: () => {
								this.$apollo.queries.allPosts.refetch();
							}
						});
					}
				});
		}
	},
	apollo: {
		allPosts: {
			query: gql`
				query($page: Int, $perPage: Int) {
					allPosts(page: $page, perPage: $perPage) {
						pageInfo {
							currentPage
							perPage
							hasNextPage
							hasPreviousPage
							total
						}
						posts {
							id
							slug
							status
							title
							html
							markdown
							updateAt
						}
					}
				}
			`,
			variables() {
				return {
					page: this.currentPage,
					perPage: this.perPage
				};
			},
			result({ data, loading, networkStatus }) {
				this.total = data.allPosts.pageInfo.total;
				this.perPage = data.allPosts.pageInfo.perPage;
				this.currentPage = data.allPosts.pageInfo.currentPage;
				this.posts = data.allPosts.posts;
			}
		},
		allTags: {
			query: gql`
				query($perPage: Int) {
					allTags(perPage: $perPage) {
						tags {
							id
							name
							description
						}
					}
				}
			`,
			variables() {
				return {
					perPage: 10
				};
			}
		}
	}
};
</script>
