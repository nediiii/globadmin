<template>
	<Card dis-hover>
		<Form inline>
			<FormItem>
				<Select v-model="selectTag" placeholder="请选择文章类别" style="width:200px">
					<Option v-for="tag in TagList.tags" :value="tag.id" :key="tag.id">
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
			:current="current_page"
			:page-size="per_page"
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
			current_page: 1,
			per_page: 6,
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
						return h("div", data.row.update_at.replace(/T|\+08:00/g, " ").substr(0, 16));
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
			PostList: {
				posts: [],
				page_info: {
					has_previous_page: false,
					has_next_page: true,
					total: 10,
					last_page: 1,
					current_page: 1,
					per_page: 5
				}
			},
			TagList: {
				tags: [],
				page_info: {}
			}
		};
	},
	methods: {
		onChange(current_page) {
			// console.log("page change");
			this.current_page = current_page;
		},
		onPageSizeChange(per_page) {
			this.per_page = per_page;
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
							DeletePost(id: $id)
						}
					`,
					variables: {
						id: data.row.id
					}
				})
				.then(result => {
					if (result.data.DeletePost) {
						console.log("删除成功");
						this.$Message.success({
							content: "删除成功",
							onClose: () => {
								// this.PostList.posts.splice(data.index, 1);
								this.$apollo.queries.PostList.refetch();
							}
						});
					}
				});
		}
	},
	apollo: {
		PostList: {
			query: gql`
				query($page: Int, $per_page: Int) {
					PostList(PageInfo: { page: $page, per_page: $per_page }) {
						posts {
							id
							status
							title
							slug
							html
							markdown
							update_at
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
			`,
			variables() {
				return {
					page: this.current_page,
					per_page: this.PostList.page_info.per_page
				};
			},
			result({ data, loading, networkStatus }) {
				this.total = data.PostList.page_info.total;
				this.per_page = data.PostList.page_info.per_page;
				this.current_page = data.PostList.page_info.current_page;
				this.posts = data.PostList.posts;
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
	}
};
</script>
