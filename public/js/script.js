document.addEventListener('DOMContentLoaded', function() {
    const chatMessages = document.getElementById('chat-messages');
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-button');
    const generateButton = document.getElementById('generate-button');
    const generatedContent = document.getElementById('generated-content');

    // 发送消息函数
    async function sendMessage() {
        const message = userInput.value.trim();
        if (message === '') return;
        
        console.log('发送消息:', message);
        console.log('收到消息:', message);
        
        // 添加用户消息到聊天界面
        addMessage(message, 'user');
        userInput.value = '';
        
        try {
            // 调用后端API获取AI回复
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message })
            });
            
            const data = await response.json();
            
            // 添加AI回复到聊天界面
            addMessage(data.reply, 'bot');
        } catch (error) {
            console.error('Error:', error);
            addMessage('抱歉，发生了错误，请稍后再试。', 'bot');
        }
    }

    // 生成内容函数
    async function generateContent() {
        const message = userInput.value.trim();
        if (message === '') return;
        
        try {
            // 调用后端API生成内容
            const response = await fetch('/api/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message })
            });
            
            const data = await response.json();
            
            // 显示生成的内容
            generatedContent.style.display = 'block';
            generatedContent.innerHTML = `
                <h3>这是基于你的提问"${message}"生成的内容示例</h3>
                <div class="preview-tab">
                    <p>${data.content}</p>
                </div>
                <div class="code-tab">
                    <pre>${data.code || '// 生成的代码将显示在这里'}</pre>
                </div>
                <p>在实际应用中，这里可以展示AI工具生成的代码、图片、文档或其他内容。</p>
            `;
        } catch (error) {
            console.error('Error:', error);
            generatedContent.innerHTML = '<p>生成内容时出错，请稍后再试。</p>';
        }
    }

    // 添加消息到聊天界面
    function addMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', `${sender}-message`);
        messageDiv.innerHTML = `<p>${text}</p>`;
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // 事件监听
    sendButton.addEventListener('click', sendMessage);
    generateButton.addEventListener('click', generateContent);
    
    userInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
});