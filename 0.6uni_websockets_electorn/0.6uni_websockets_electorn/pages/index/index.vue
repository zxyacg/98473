<template>
	<view>
		<button @click="connectWebSocket">连接 WebSocket</button>
		<view v-if="isConnected">连接状态: 已连接</view>
		<view v-else>连接状态: 未连接</view>
		<view v-if="errorMessage">{{ errorMessage }}</view>
		<button @click="send">click</button>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				isConnected: false,
				errorMessage: '',
				socketTask: null,
				msg: "start"
			}
		},
		onLoad() {
			this.connectWebSocket();
		},
		methods: {
			connectWebSocket() {
				this.socketTask = uni.connectSocket({
					// url: 'ws://8.211.130.177:51111', // 替换为你的服务器地址和端口
					url: 'ws://localhost:51111', // 替换为你的服务器地址和端口
					success: (res) => {
						console.log('WebSocket连接成功', res);
					},
					fail: (err) => {
						console.error('WebSocket连接失败', err);
						this.errorMessage = '连接失败: ' + err.errMsg;
					}
				});
				
				// 监听 WebSocket 打开事件
				this.socketTask.onOpen((res) => {
					console.log('WebSocket已打开', res);
					this.isConnected = true;
					this.errorMessage = '';
				});
				
				// 监听 WebSocket 错误事件
				this.socketTask.onError((err) => {
					console.error('WebSocket发生错误', err);
					this.errorMessage = '发生错误: ' + err.errMsg;
				});
				
				// 监听 WebSocket 消息事件
				this.socketTask.onMessage((res) => {
					console.log('接收到的消息:', res.data);
				});
				
				// 监听 WebSocket 关闭事件
				this.socketTask.onClose((res) => {
					console.log('WebSocket已关闭', res);
					this.isConnected = false;
				});
			},
			send() {
				if (this.socketTask && this.isConnected) {
					const message = {
						type: 'command',
						action: 'start'
					};
					this.socketTask.send({
						data: JSON.stringify(message),
						success: () => {
							console.log('消息发送成功');
						},
						fail: (err) => {
							console.error('消息发送失败', err);
							this.errorMessage = '消息发送失败: ' + err.errMsg;
						}
					});
				} else {
					this.errorMessage = 'WebSocket未连接';
				}
			}
		}
	}
</script>

<style>
	button {
		padding: 10px 20px;
		margin-top: 20px;
	}
	view {
		margin-top: 10px;
	}
</style>