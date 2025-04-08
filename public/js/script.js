document.addEventListener('DOMContentLoaded', function() {
    const chatMessages = document.getElementById('chat-messages');
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-button');
    const generatedContent = document.getElementById('generated-content');
    const generatedCode = document.getElementById('generated-code');
    const stopButton = document.getElementById('stop-button');
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabPanes = document.querySelectorAll('.tab-pane');

    let abortController;

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
            addMessage(data.reply, 'bot', data.thoughts);

            // 清空右侧展示区
            generatedContent.style.display = 'none';
            generatedContent.innerHTML = '';

        } catch (error) {
            console.error('Error:', error);
            addMessage('抱歉，发生了错误，请稍后再试。', 'bot');
        }
    }

    // 终止生成内容函数
    function stopGeneration() {
        if (abortController) {
            abortController.abort(); // 终止请求
            abortController = null; // 重置控制器
        }
    }

    // 获取格式化的时间
    function getFormattedTime() {
        const now = new Date();
        return now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
    }

    // 存储每条消息的思考过程
    const messageThoughts = new Map();

    // 添加消息到聊天界面
    function addMessage(text, sender, thoughts = null) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', `${sender}-message`);
        
        const messageContent = document.createElement('div');
        messageContent.classList.add('message-content');
        messageContent.innerHTML = `<p>${text}</p>`;
        
        const timeSpan = document.createElement('span');
        timeSpan.classList.add('message-time');
        timeSpan.textContent = getFormattedTime();
        
        messageContent.appendChild(timeSpan);
        messageDiv.appendChild(messageContent);

        // 为AI回复添加查看思考过程的按钮
        if (sender === 'bot' && thoughts) {
            const viewThoughtsButton = document.createElement('button');
            viewThoughtsButton.classList.add('view-thoughts-button');
            viewThoughtsButton.textContent = '查看思考过程';
            viewThoughtsButton.onclick = () => showThoughts(thoughts);
            messageDiv.appendChild(viewThoughtsButton);

            // 存储这条消息的思考过程
            messageThoughts.set(messageDiv, thoughts);
        }

        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // 标签页切换功能
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabId = button.getAttribute('data-tab');
            
            // 更新按钮状态
            tabButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // 更新内容显示
            tabPanes.forEach(pane => {
                if (pane.id === `${tabId}-tab`) {
                    pane.classList.add('active');
                } else {
                    pane.classList.remove('active');
                }
            });
        });
    });

    // 显示思考过程函数
    function showThoughts(thoughts) {
        if (thoughts && thoughts.length > 0) {
            // 预览标签显示思考过程
            const formattedThoughts = thoughts.map(thought => {
                const safeThought = thought.replace(/</g, '&lt;').replace(/>/g, '&gt;');
                return `<div class="thought-item">${safeThought}</div>`;
            }).join('');
            
            generatedContent.innerHTML = formattedThoughts;
            
            // 代码标签显示原始内容
            generatedCode.textContent = thoughts.join('\n');
            
            // 激活预览标签
            tabButtons[0].click();
        }
    }

    // 事件监听
    sendButton.addEventListener('click', sendMessage);
    stopButton.addEventListener('click', stopGeneration);
    
    userInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
});