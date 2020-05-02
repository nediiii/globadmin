<template>
	<Card dis-hover>
		<p slot="title"><Icon type="ios-settings-outline" /> 基本设置</p>
		<div style="max-width:600px">
			<Form ref="base" :model="base" label-position="top" :rules="base">
				<FormItem label="站点名称" prop="title">
					<Input v-model="base.title" search enter-button="确    定" @on-search="cmtSave('title')"></Input>
				</FormItem>
				<FormItem label="Logo" prop="logo_url">
					<Input
						v-model="base.logo_url"
						readonly
						search
						enter-button="确    定"
						@on-search="cmtSave('logo_url')"
					/>
					尺寸最好为 140x140px。
				</FormItem>
				<FormItem label="站点描述" prop="description">
					<Input
						v-model="base.description"
						search
						enter-button="确    定"
						@on-search="cmtSave('description')"
					/>
				</FormItem>
				<FormItem label="站点地址" prop="site_url">
					<Input v-model="base.site_url" search enter-button="确    定" @on-search="cmtSave('site_url')" />
				</FormItem>
				<FormItem label="Favicon" prop="favicon_url">
					<Input
						v-model="base.favicon_url"
						search
						enter-button="确    定"
						@on-search="cmtSave('favicon_url')"
					/>
				</FormItem>
				<FormItem label="关键词" prop="keywords">
					<Input v-model="base.keywords" search enter-button="确    定" @on-search="cmtSave('keywords')" />
				</FormItem>
				<FormItem label="每页文章数目" prop="page_size">
					<Slider v-model="page_size" :min="4" :max="12" show-stops @on-change="onChange"></Slider>
					此数目用于指定文章每页显示的文章数目.
				</FormItem>
				<FormItem label="Github" prop="github_url">
					<Input
						v-model="base.github_url"
						search
						enter-button="确    定"
						@on-search="cmtSave('github_url')"
					/>
				</FormItem>
				<FormItem label="Weibo" prop="weibo_url">
					<Input v-model="base.weibo_url" search enter-button="确    定" @on-search="cmtSave('weibo_url')" />
				</FormItem>
				<FormItem label="备案号" prop="miitbeian">
					<Input v-model="base.miitbeian" search enter-button="确    定" @on-search="cmtSave('miitbeian')" />
				</FormItem>
			</Form>
		</div>
		<Drawer title="编辑图片" placement="right" v-model="showLogoEdit">
			<p>Some contents...</p>
			<p>Some contents...</p>
			<p>Some contents...</p>
		</Drawer>
	</Card>
</template>

<script>
import { apiOptsBase, admOptsEdit } from "@/api/opts";
import gql from "graphql-tag";

export default {
	data() {
		return {
			page_size: 2,
			base: {},
			showLogoEdit: false,
			saveLoading: false,
			gqlData: "",
			Role: [],
			Setting: []
		};
	},
	methods: {
		cmtSave(key) {
			this.save_loading = true;
			admOptsEdit({
				key: key,
				value: this.base[key]
			}).then(resp => {
				this.saveLoading = false;
				if (resp.code == 200) {
					this.$Message.success({ content: "更新成功" });
				} else {
					this.$Message.error({
						content: `更新失败`,
						duration: 3,
						onClose() {
							this.init();
						}
					});
				}
			});
		},
		onChange(val) {
			admOptsEdit({
				key: "page_size",
				value: val + ""
			}).then(resp => {
				this.saveLoading = false;
				if (resp.code != 200) {
					this.$Message.error({
						content: `更新失败,请重试`,
						duration: 3,
						onClose() {
							this.init();
						}
					});
				}
			});
		},
		init() {
			apiOptsBase().then(resp => {
				if (resp.code == 200) {
					this.page_size = Number(resp.data["page_size"], 10);
					this.base = resp.data;
				} else {
					this.base = {};
				}
			});
		},
		clkLogo() {
			this.showLogoEdit = true;
		}
	},
	mounted() {
		this.init();
		this.$apollo
			.query({
				query: gql`
					query {
						Role {
							name
						}
					}
				`
			})
			.then(data => {
				console.log("gql", data);
			});
	},
	apollo: {
		Role: gql`
			{
				Role {
					name
				}
			}
		`,
		Setting: gql`
			{
				Setting {
					key
					value
				}
			}
		`
	}
};
</script>
