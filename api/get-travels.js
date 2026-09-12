export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');

    const NOTION_SECRET = process.env.NOTION_SECRET || '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';
    const DATABASE_ID = process.env.DATABASE_ID || '3d0f3549e38280259f19c1886e86d22a';

    try {
        // 1. 查询数据库里的所有地点列表
        const response = await fetch(`https://api.notion.com/v1/databases/${DATABASE_ID}/query`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${NOTION_SECRET}`,
                'Notion-Version': '2022-06-28',
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        // 2. 核心魔法：并发深入每一个地点的内部页面，把里面用户上传的照片和文字抓出来！
        const enrichedResults = await Promise.all(data.results.map(async (page) => {
            const pageId = page.id;
            try {
                const blockResponse = await fetch(`https://api.notion.com/v1/blocks/${pageId}/children?page_size=100`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${NOTION_SECRET}`,
                        'Notion-Version': '2022-06-28'
                    }
                });
                const blockData = await blockResponse.json();
                // 把页面内部的所有 block（图片、段落、视频）挂载到页面对象上
                page.contentBlocks = blockData.results || [];
            } catch (e) {
                page.contentBlocks = [];
            }
            return page;
        }));

        data.results = enrichedResults;
        return res.status(200).json(data);

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}