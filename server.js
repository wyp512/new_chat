require('dotenv').config();
const express = require('express');
const OpenAI = require('openai');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// 初始化 DeepSeek 客户端
const openai = new OpenAI({
  baseURL: 'https://api.deepseek.com',
  apiKey: 'sk-99465d31adb34be0b8b6e0b7a14608d5' // 从环境变量获取更安全
});

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'views')));

// 路由
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// 聊天API (使用 OpenAI SDK)
app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;

    // 使用 DeepSeek-R1 模型 (deepseek-reasoner)
    const completion = await openai.chat.completions.create({
      model: "deepseek-reasoner", // DeepSeek 最新推出的推理模型
      messages: [
        {
          role: "user",
          content: message
        }
      ],
      temperature: 0.7,
      stream: true // 启用流式输出以获取思考过程
    });

    let reply = '';
    let thoughts = [];

    for await (const chunk of completion) {
      if (chunk.choices[0]?.delta?.content) {
        const content = chunk.choices[0].delta.content;
        reply += content;
        // 收集思考过程
        if (content.includes('思考:') || content.includes('分析:') || content.includes('推理:')) {
          thoughts.push(content);
        }
      }
    }

    res.json({ reply, thoughts });
  } catch (error) {
    console.error('DeepSeek API Error:', error);
    res.status(500).json({ 
      error: 'Failed to get response from AI',
      details: error.message
    });
  }
});



// 启动服务器
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});