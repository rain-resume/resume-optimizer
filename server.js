const express = require('express');
const path = require('path');
const axios = require('axios');

// DeepSeek API 配置（国产AI，速度快）
const DEEPSEEK_API_KEY = 'sk-8194c3c3e37a456abe63de19207bfcf3';
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';

const app = express();
const PORT = 3000;

// 解析JSON请求体
app.use(express.json({ limit: '10mb' }));

// CORS中间件
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

// 静态文件服务
app.use(express.static(path.join(__dirname, 'public')));

// 简历优化API - 调用真实AI
app.post('/api/optimize', async (req, res) => {
  const { text } = req.body;
  
  if (!text || text.trim().length < 50) {
    return res.json({
      success: false,
      message: '简历内容太短，请粘贴完整的简历信息（至少50字）'
    });
  }

  try {
    // 调用 DeepSeek AI API
    const aiResponse = await axios.post(
      DEEPSEEK_API_URL,
      {
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: '你是一位专业的简历优化师。分析用户简历，给出评分、具体优化建议，并生成优化后的简历版本。评分要客观（通常 40-75 分），建议要具体可操作。'
          },
          {
            role: 'user',
            content: `请分析并优化以下简历：\n\n${text}\n\n返回 JSON 格式：{"score": 评分(0-100), "details": {"workExperience": {"score": 分数, "label": "工作经历"}, "education": {"score": 分数, "label": "教育背景"}, "skills": {"score": 分数, "label": "专业技能"}, "format": {"score": 分数, "label": "排版格式"}, "keywords": {"score": 分数, "label": "关键词匹配"}}, "suggestions": [{"category": "分类", "level": "重要/建议", "text": "建议内容"}], "optimizedText": "优化后的完整简历文本"}`
          }
        ],
        temperature: 0.7
      },
      {
        headers: {
          'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    );

    // 解析 AI 返回的结果
    const aiResult = JSON.parse(aiResponse.data.choices[0].message.content);
    
    res.json({
      success: true,
      ...aiResult,
      tips: '简历优化建议仅供参考，请结合自身实际情况进行调整。'
    });
  } catch (error) {
    console.error('AI API 调用失败:', error.message);
    
    // 如果 AI 调用失败，返回模拟结果作为备用
    const wordCount = text.trim().length;
    const baseScore = Math.min(95, 45 + Math.floor(wordCount / 30) + Math.floor(Math.random() * 10));
    
    res.json({
      success: true,
      score: baseScore,
      details: {
        workExperience: { score: Math.min(100, baseScore + Math.floor(Math.random() * 10 - 5)), label: '工作经历' },
        education: { score: Math.min(100, baseScore + Math.floor(Math.random() * 15 - 5)), label: '教育背景' },
        skills: { score: Math.min(100, baseScore + Math.floor(Math.random() * 10 - 8)), label: '专业技能' },
        format: { score: Math.min(100, baseScore + Math.floor(Math.random() * 10 - 3)), label: '排版格式' },
        keywords: { score: Math.min(100, baseScore + Math.floor(Math.random() * 10 - 5)), label: '关键词匹配' }
      },
      suggestions: [
        {
          category: '内容优化',
          level: '重要',
          text: '建议在每段工作经历中增加"量化成果"，例如"提升转化率30%"比"负责优化转化率"更有说服力。'
        },
        {
          category: '结构优化',
          level: '建议',
          text: '工作经历建议采用STAR法则描述：情境→任务→行动→结果，让经历更有逻辑性。'
        }
      ],
      optimizedText: generateOptimizedText(text),
      tips: 'AI API 暂时不可用，当前为模拟结果。请配置 API Key 以启用真实 AI 优化。'
    });
  }
});

// 生成优化后的简历文本
function generateOptimizedText(original) {
  return `[AI优化版简历]

${original}

---
✅ 优化说明：
1. 建议在工作经历中补充量化数据（如"提升效率40%"）
2. 增加与目标岗位匹配的关键词
3. 优化描述用词，使用更多行为动词开头（如"主导""推动""优化"）
4. 精简非核心内容，突出核心竞争力

💡 提示：以上是基于通用标准的优化建议，建议结合具体目标岗位进行针对性调整。
如需深度优化，可升级为高级会员获取一对一AI优化服务。`;
}

// 导出 app 给 Vercel serverless 使用
module.exports = app;

// 本地开发时才启动服务器
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`✅ AI简历优化大师 已启动`);
    console.log(`📍 访问地址: http://localhost:${PORT}`);
    console.log(`⏰ 启动时间: ${new Date().toLocaleString('zh-CN')}`);
  });
}
