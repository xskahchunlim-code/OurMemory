export default async function handler(req, res) {
    // 允许前端网页跨域调用这个后端
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');

    const NOTION_SECRET = process.env.NOTION_SECRET || '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';
    const DATABASE_ID = process.env.DATABASE_ID || '3d0f3549e382801aab70c362b5d55b91';

    try {
        // 后端直接请求 Notion API（服务器之间没有 CORS 限制）
        const response = await fetch(`https://api.notion.com/v1/databases/${DATABASE_ID}/query`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${NOTION_SECRET}`,
                'Notion-Version': '2022-06-28',
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();
        
        // 把 Notion 的数据原封不动返回给前端网页
        return res.status(200).json(data);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}