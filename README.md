# AI Chatbot with DeepSeek API

这是一个使用DeepSeek API的AI聊天机器人项目。

## 功能

- 与AI助手进行实时对话
- 生成代码、文本等内容
- 简洁美观的用户界面

## 安装与运行

1. 克隆仓库
2. 安装依赖: `npm install`
3. 创建`.env`文件并添加您的DeepSeek API密钥
4. 运行项目: `npm start` 或 `npm run dev` (开发模式)

## 配置

在 `.env` 文件中设置以下变量:
- `DEEPSEEK_API_KEY`: 您的 DeepSeek API 密钥（确保正确无误）
- `PORT`: 服务器端口（默认 3000）

### 注意事项

1. 确保 `DEEPSEEK_API_URL` 是正确的 API 端点，例如 `https://api.deepseek.com/v1/chat`。
2. 如果遇到 `Not Found` 错误，请检查 API 密钥和 URL 是否正确。