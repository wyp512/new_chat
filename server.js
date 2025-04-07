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
      temperature: 0.7
    });

    const reply = completion.choices[0].message.content;
    res.json({ reply });
  } catch (error) {
    console.error('DeepSeek API Error:', error);
    res.status(500).json({ 
      error: 'Failed to get response from AI',
      details: error.message
    });
  }
});

// 生成内容API
app.post('/api/generate', async (req, res) => {
    try {
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        // 模拟生成内容逻辑
        const generatedContent = {
            content: `这是基于你的提问 "${message}" 生成的示例内容。`,
            code: `console.log("这是基于你的提问生成的代码示例");`
        };

        res.json(generatedContent);
    } catch (error) {
        console.error('Error generating content:', error); // 更详细的日志
        res.status(500).json({ 
            error: 'Failed to generate content',
            details: error.message // 返回错误详情
        });
    }
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});