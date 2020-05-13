<template>
	<Card :bordered="false" dis-hover>
		<p slot="title"><Icon type="ios-add-circle-outline" /> 添加标签</p>
		<div style="max-width:520px">
			<Form ref="dataForm" :model="dataForm" :rules="dataRules" label-position="top">
				<FormItem label="标签名称" prop="name">
					<Input v-model="dataForm.name" placeholder="请填写标签名" />
				</FormItem>
				<FormItem label="标签介绍" prop="intro">
					<Input v-model="dataForm.intro" placeholder="请填写标签介绍" />
				</FormItem>
				<div>
					<Button type="warning" :loading="saveLoading" @click="createTag">
						保&nbsp;&nbsp;&nbsp;&nbsp;存
					</Button>
				</div>
			</Form>
		</div>
	</Card>
</template>

<script>
import gql from "graphql-tag";

export default {
	data() {
		return {
			dataForm: { name: "", intro: "" },
			dataRules: {
				name: [{ required: true, message: "请填写标签名", trigger: "blur", max: 64 }],
				intro: [{ required: true, message: "请填写标签介绍", trigger: "blur", max: 64 }]
			},
			saveLoading: false
		};
	},
	methods: {
		createTag() {
			this.$refs["dataForm"].validate(valid => {
				if (valid) {
					this.saveLoading = true;
					this.$apollo
						.mutate({
							mutation: gql`
								mutation($slug: String!, $name: String!, $description: String!) {
									createTag(slug: $slug, name: $name, description: $description) {
										id
										slug
										name
										description
									}
								}
							`,
							variables: {
								slug: this.dataForm.name,
								name: this.dataForm.name,
								description: this.dataForm.intro
							}
						})
						.then(({ data }) => {
							this.saveLoading = false;
							this.$Message.success({
								content: "标签信息添加成功",
								onClose: () => {
									this.$router.push({
										name: "tag-list"
									});
								}
							});
						})
						.catch(error => {
							this.$Message.error({ content: `标签信息添加失败,请重试`, duration: 3 });
						});
				}
			});
		}
	}
};
</script>
