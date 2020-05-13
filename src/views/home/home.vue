<template>
	<div class="home">
		<Row>
			<i-col :md="{ span: 24 }">
				<Card dis-hover style="height: 158px">
					<p slot="title">
						系统信息
					</p>
					<ApolloQuery
						:query="require('@/graphql/SysStatus.gql')"
						v-slot="{ result: { loading, error, data } }"
					>
						<Steps status="finish" v-if="data" :current="4">
							<Step icon="ios-flash" title="系统架构" :content="data.systemStatus.Arch"></Step>
							<Step icon="logo-snapchat" title="操作系统" :content="data.systemStatus.Os"></Step>
							<Step icon="ios-thunderstorm" title="运行环境" :content="data.systemStatus.Version"></Step>
							<Step icon="ios-flower" title="逻辑处理器" :content="data.systemStatus.NumCPU + ''"></Step>
						</Steps>
						<div v-if="error">{{ error }}</div>
					</ApolloQuery>
				</Card>
			</i-col>
		</Row>
		<Row>
			<i-col span="6" class="collect">
				<Card dis-hover>
					<Row>
						<i-col span="10">
							<Icon type="ios-megaphone" />
						</i-col>
						<i-col span="14">
							<p class="title">文章</p>
							<ApolloQuery
								:query="
									gql => gql`
										query {
											allPosts {
												pageInfo {
													total
												}
											}
										}
									`
								"
								v-slot="{ result: { loading, error, data } }"
							>
								<h3 v-if="data">{{ data.allPosts.pageInfo.total }}</h3>
							</ApolloQuery>
						</i-col>
					</Row>
				</Card>
			</i-col>
			<i-col span="6" class="collect">
				<Card dis-hover>
					<Row>
						<i-col span="10">
							<Icon type="ios-map" />
						</i-col>
						<i-col span="14">
							<p class="title">页面</p>
							<ApolloQuery
								:query="
									gql => gql`
										query {
											allPosts(paged: true) {
												pageInfo {
													total
												}
											}
										}
									`
								"
								v-slot="{ result: { loading, error, data } }"
							>
								<h3 v-if="data">{{ data.allPosts.pageInfo.total }}</h3>
							</ApolloQuery>
						</i-col>
					</Row>
				</Card>
			</i-col>
			<i-col span="6" class="collect">
				<Card dis-hover>
					<Row>
						<i-col span="10">
							<Icon type="ios-person" />
						</i-col>
						<i-col span="14">
							<p class="title">用户</p>
							<ApolloQuery
								:query="
									gql => gql`
										query {
											allUsers {
												pageInfo {
													total
												}
											}
										}
									`
								"
								v-slot="{ result: { loading, error, data } }"
							>
								<h3 v-if="data">{{ data.allUsers.pageInfo.total }}</h3>
							</ApolloQuery>
						</i-col>
					</Row>
				</Card>
			</i-col>
			<i-col span="6" class="collect">
				<Card dis-hover>
					<Row>
						<i-col span="10">
							<Icon type="ios-pricetags" />
						</i-col>
						<i-col span="14">
							<p class="title">标签</p>
							<ApolloQuery
								:query="
									gql => gql`
										query {
											allTags {
												pageInfo {
													total
												}
											}
										}
									`
								"
								v-slot="{ result: { loading, error, data } }"
							>
								<h3 v-if="data">{{ data.allTags.pageInfo.total }}</h3>
							</ApolloQuery>
						</i-col>
					</Row>
				</Card>
			</i-col>
		</Row>
		<Row v-if="false">
			<i-col :md="{ span: 8 }">
				<Card dis-hover style="height: 320px">
					<p slot="title">
						暂时未统计，正在进行
					</p>
					<a href="#" slot="extra" @click.prevent="refresh">
						<Icon type="ios-loop-strong" />
					</a>
					<Steps :current="2" direction="vertical" size="small">
						<Step title="已完成" content="这里是该步骤的描述信息"></Step>
						<Step title="已完成" content="这里是该步骤的描述信息"></Step>
						<Step title="进行中" content="这里是该步骤的描述信息"></Step>
						<Step title="待进行" content="这里是该步骤的描述信息"></Step>
					</Steps>
				</Card>
			</i-col>
		</Row>
	</div>
</template>

<script>
export default {
	name: "index"
};
</script>

<style lang="less" scoped>
@import "./home.less";
</style>
