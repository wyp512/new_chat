document.addEventListener('DOMContentLoaded', function() {
    const chatMessages = document.getElementById('chat-messages');
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-button');
    const generateButton = document.getElementById('generate-button');
    const generatedContent = document.getElementById('generated-content');
    const stopButton = document.getElementById('stop-button'); // 添加终止按钮

    let abortController; // 用于终止生成内容的控制器

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
        if (message === '') {
            alert('请输入内容后再生成结果！'); // 添加提示
            return;
        }

        abortController = new AbortController(); // 创建新的控制器

        try {
            // 调用后端API生成内容
            const response = await fetch('/api/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message }),
                signal: abortController.signal // 绑定控制器信号
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || '生成内容请求失败');
            }

            const data = await response.json();

            // 显示生成的内容
            generatedContent.style.display = 'block';
            generatedContent.innerHTML = `
                <h3>这是基于你的提问 "${message}" 生成的内容示例</h3>
                <div class="preview-tab">
                    ${marked.parse(data.content || '这是基于你的提问生成的示例内容。')} <!-- 修复调用方式 -->
                </div>
                <div class="code-tab">
                    <pre>${data.code || 'console.log("这是基于你的提问生成的代码示例");'}</pre>
                </div>
            `;
        } catch (error) {
            if (error.name === 'AbortError') {
                console.log('生成内容请求已被终止');
                generatedContent.style.display = 'block';
                generatedContent.innerHTML = `<p>生成内容已被终止。</p>`;
            } else {
                console.error('Error:', error);
                generatedContent.style.display = 'block';
                generatedContent.innerHTML = `<p>生成内容时出错：${error.message}</p>`; // 显示详细错误信息
            }
        }
    }

    // 终止生成内容函数
    function stopGeneration() {
        if (abortController) {
            abortController.abort(); // 终止请求
            abortController = null; // 重置控制器
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
    generateButton.addEventListener('click', generateContent); // 确保绑定事件
    stopButton.addEventListener('click', stopGeneration); // 绑定终止按钮事件
    
    userInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    // 添加生成内容的初始HTML结构
    const generatedContentContainer = document.createElement('div');
    generatedContentContainer.id = 'generated-content';
    generatedContentContainer.style.display = 'none';
    generatedContentContainer.innerHTML = '<p>生成的内容将在这里显示。</p>';
    document.body.appendChild(generatedContentContainer);
});