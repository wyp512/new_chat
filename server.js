require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'views')));

// DeepSeek API配置
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || 'sk-99465d31adb34be0b8b6e0b7a14608d5';
const DEEPSEEK_API_URL = 'https://api.deepseek.com';

// 路由
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// 聊天API
app.post('/api/chat', async (req, res) => {
    try {
        const { message } = req.body;
        
        const response = await axios.post(DEEPSEEK_API_URL, {
            model: "deepseek-chat", // 根据实际情况调整
            messages: [
                {
                    role: "user",
                    content: message
                }
            ],
            temperature: 0.7
        }, {
            headers: {
                'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        const reply = response.data.choices[0].message.content;
        res.json({ reply });
    } catch (error) {
        console.error('DeepSeek API Error:', error.response?.data || error.message);
        res.status(500).json({ error: 'Failed to get response from AI' });
    }
});

// 生成内容API
app.post('/api/generate', async (req, res) => {
    try {
        const { message } = req.body;
        
        // 这里可以调用不同的DeepSeek API端点来生成内容
        const response = await axios.post(DEEPSEEK_API_URL, {
            model: "deepseek-code", // 假设有代码生成模型
            prompt: message,
            max_tokens: 1000
        }, {
            headers: {
                'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        const content = response.data.choices[0].text;
        
        // 简单示例 - 在实际应用中，您可能需要更复杂的解析
        const codeMatch = content.match(/```[\s\S]*?```/g);
        const code = codeMatch ? codeMatch[0] : '';
        
        res.json({ content, code });
    } catch (error) {
        console.error('DeepSeek API Error:', error.response?.data || error.message);
        res.status(500).json({ error: 'Failed to generate content' });
    }
});

// 启动服务器
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});