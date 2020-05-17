<template>
	<Card dis-hover>
		<p slot="title"><Icon type="ios-settings-outline" /> 基本设置</p>
		<div style="max-width:600px">
			<Form label-position="top">
				<FormItem label="站点名称">
					<Input
						search
						enter-button="确    定"
						v-model="s.value"
						@on-search="updateSetting(s.id, s.key, s.value)"
					/>
				</FormItem>
				<FormItem label="站点描述">
					<Input
						search
						enter-button="确    定"
						v-model="s.value"
						@on-search="updateSetting(s.id, s.key, s.value)"
					/>
				</FormItem>
				<FormItem label="网站logo" style="margin:0px">
					<Upload multiple type="drag" :before-upload="handleUpload" action="">
						<div v-if="true" style="padding: 20px 0">
							<Icon type="ios-cloud-upload" size="52" style="color: #3399ff"></Icon>
							<p>Click or drag files here to upload</p>
						</div>
						<img v-else style="width:100%;height:100%;" :src="post.image" alt="" />
					</Upload>
				</FormItem>
				<FormItem label="每页文章数目">
					<Slider
						:min="5"
						:max="20"
						show-stops
						v-model="pageSize"
						@on-change="updateSetting(s.id, s.key, s.value)"
					></Slider>
					此数目用于指定文章每页显示的文章数目.
				</FormItem>
			</Form>
		</div>
	</Card>
</template>

<script>
import gql from "graphql-tag";

export default {
	data() {
		return {
			pageSize: 10,
			base: {},
			showLogoEdit: false,
			saveLoading: false,
			Role: [],
			s: { id: 0, key: "", value: "" },
			// gql
			allSettings: { settings: [{ id: 0, key: "", value: "" }] }
		};
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
		updateSetting(id, key, value) {
			this.$apollo
				.mutate({
					mutation: gql`
						mutation($id: ID!, $key: String, $value: String) {
							updateSetting(id: $id, key: $key, value: $value) {
								id
								key
								value
							}
						}
					`,
					variables: {
						id: id,
						key: key,
						value: value
					}
				})
				.then(({ data }) => {
					this.$Message.success({ content: "设置保存成功" });
					// console.log(data);
				})
				.catch(error => {
					this.$Message.warning({ content: "设置保存失败" });
				});
		}
	},

	apollo: {
		allSettings: {
			query: gql`
				query {
					allSettings {
						settings {
							id
							key
							value
						}
					}
				}
			`,
			result({ data, loading, networkStatus }) {
				this.s = data.allSettings.settings[0];
			}
		}
	}
};
</script>
