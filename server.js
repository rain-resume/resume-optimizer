const express = require('express');
const path = require('path');

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

// 简历优化API
app.post('/api/optimize', (req, res) => {
  const { text } = req.body;
  
  if (!text || text.trim().length < 50) {
    return res.json({
      success: false,
      message: '简历内容太短，请粘贴完整的简历信息（至少50字）'
    });
  }

  // 模拟AI分析结果
  const wordCount = text.trim().length;
  
  // 根据简历长度动态调整评分，让结果更真实
  const baseScore = Math.min(95, 45 + Math.floor(wordCount / 30) + Math.floor(Math.random() * 10));
  
  const result = {
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
        text: '建议在每段工作经历中增加"量化成果"，例如"提升转化率30%"比"负责优化转化率"更有说服力。用数字说话能让HR快速抓住亮点。'
      },
      {
        category: '结构优化',
        level: '建议',
        text: '工作经历建议采用STAR法则描述：情境(Situation)→任务(Task)→行动(Action)→结果(Result)，让每段经历更有逻辑性和可读性。'
      },
      {
        category: '关键词优化',
        level: '重要',
        text: '建议根据目标岗位的JD（职位描述），提取核心关键词并自然融入简历。ATS系统会优先匹配包含关键岗位词汇的简历。'
      },
      {
        category: '格式优化',
        level: '建议',
        text: '简历建议控制在1-2页A4纸，重要信息放前半部分。避免使用花哨的模板，简洁专业的排版更容易获得面试机会。'
      },
      {
        category: '技能展示',
        level: '建议',
        text: '技能描述建议分类展示（专业技能/工具技能/软技能），并标注熟练程度。避免堆砌与目标岗位无关的技能。'
      }
    ],
    optimizedText: generateOptimizedText(text),
    tips: '简历优化建议仅供参考，请结合自身实际情况进行调整。建议投递前让朋友或前辈帮忙审阅。'
  };

  res.json(result);
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

app.listen(PORT, () => {
  console.log(`✅ AI简历优化大师 已启动`);
  console.log(`📍 访问地址: http://localhost:${PORT}`);
  console.log(`⏰ 启动时间: ${new Date().toLocaleString('zh-CN')}`);
});
