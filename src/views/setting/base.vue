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
				<FormItem label="s.key">
					<Input
						search
						enter-button="确    定"
						v-model="s.value"
						@on-search="updateSetting(s.id, s.key, s.value)"
					/>
				</FormItem>
				<FormItem label="Logo" prop="logo_url">
					<Input
						v-model="base.logo_url"
						readonly
						search
						enter-button="确    定"
						@on-search="updateSetting(s.id, s.key, s.value)"
					/>
					尺寸最好为 140x140px.
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
import { apiOptsBase, admOptsEdit } from "@/api/opts";
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
			allSettings: { settings: [] }
		};
	},

	methods: {
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
					console.log(data);
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
