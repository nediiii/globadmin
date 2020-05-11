<template>
	<div>
		<Card dis-hover>
			<Table stripe size="small" :columns="colTag" :data="allTags.tags"></Table>
		</Card>
		<Modal v-model="showEdit" title="修改标签信息">
			<Form ref="editForm" :model="editForm" label-position="top" :rules="editRules">
				<FormItem label="标签名称" prop="name">
					<Input v-model="editForm.name" placeholder="请填写标签名" />
				</FormItem>
				<FormItem label="标签介绍" prop="intro">
					<Input v-model="editForm.description" placeholder="请填写标签介绍" />
				</FormItem>
			</Form>
			<div slot="footer">
				<ButtonGroup>
					<Button type="warning" :loading="editLoading" @click="updateTag">提交保存</Button>
					<Button type="info" style="margin-left: 8px" @click="showEdit = false">取消关闭</Button>
				</ButtonGroup>
			</div>
		</Modal>
	</div>
</template>

<script>
import { apiTagAll, admTagEdit, admTagDrop } from "@/api/tag";
import gql from "graphql-tag";

export default {
	data() {
		return {
			showEdit: false,
			editLoading: false,
			editForm: { id: 0, name: "", description: "" },
			editRules: {
				name: [{ required: true, message: "请填写标签名", trigger: "blur", max: 64 }],
				description: [{ required: true, message: "请填写标签介绍", trigger: "blur", max: 64 }]
			},
			colTag: [
				{ type: "index", minWidth: 60, maxWidth: 100, align: "center" },
				{ title: "标签名", minWidth: 100, maxWidth: 300, key: "name" },
				{ title: "标签介绍", minWidth: 100, maxWidth: 300, key: "description" },
				{
					title: "Action",
					minWidth: 100,
					align: "left",
					render: (h, data) => {
						return h("a", [
							h("Icon", {
								props: { type: "md-create", size: "20", color: "#FFB800" },
								attrs: { title: "修改" },
								style: { marginRight: "15px" },
								on: {
									click: () => {
										this.showEdit = true;
										this.editForm = data.row;
									}
								}
							}),
							h(
								"Poptip",
								{
									props: { confirm: true, title: "确定要删除吗？" },
									on: {
										"on-ok": () => {
											this.deleteTag(data);
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
			allTags: { tags: [] }
		};
	},

	methods: {
		updateTag() {
			this.$refs["editForm"].validate(valid => {
				if (valid) {
					this.editLoading = true;
					this.$apollo
						.mutate({
							mutation: gql`
								mutation($id: ID!, $slug: String!, $name: String!, $description: String!) {
									updateTag(id: $id, slug: $slug, name: $name, description: $description) {
										id
										slug
										name
										description
									}
								}
							`,
							variables: {
								id: this.editForm.id,
								slug: this.editForm.name,
								name: this.editForm.name,
								description: this.editForm.description
							}
						})
						.then(({ data }) => {
							this.editLoading = false;
							this.$Message.success({
								content: "标签信息修改成功",
								onClose: () => {
									this.showEdit = false;
								}
							});
						})
						.catch(error => {
							this.$Message.error({ content: `标签信息修改失败,请重试`, duration: 3 });
						});
				}
			});
		},
		deleteTag(data) {
			this.$apollo
				.mutate({
					mutation: gql`
						mutation($id: ID!) {
							deleteTag(id: $id)
						}
					`,
					variables: {
						id: data.row.id
					}
				})
				.then(result => {
					if (result.data.deleteTag) {
						this.$Message.success({
							content: "删除成功",
							onClose: () => {
								this.$apollo.queries.allTags.refetch();
							}
						});
					} else {
						this.$Message.error({
							content: "删除失败,请重试！",
							onClose: () => {
								this.$apollo.queries.allTags.refetch();
							}
						});
					}
				});
		}
	},

	apollo: {
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
			`,
			error(error) {
				this.$Message.warning("未查询到标签信息,请重试！");
			}
		}
	}
};
</script>
