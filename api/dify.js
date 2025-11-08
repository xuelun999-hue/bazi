export default async function handler(req, res) {
    // 添加 CORS 支持
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const { name, birthDate, birthTime } = req.body;
        
        console.log('收到請求:', { name, birthDate, birthTime });
        
        const apiUrl = process.env.DIFY_API_URL || 'https://pro.aifunbox.com/v1/workflows/run';
        const apiKey = process.env.DIFY_API_KEY;
        
        console.log('API配置:', { apiUrl, hasApiKey: !!apiKey });
        
        if (!apiKey) {
            console.error('API key 未配置');
            return res.status(500).json({ message: 'API key not configured' });
        }

        // 從出生日期中提取年月日
        const birthDateObj = new Date(birthDate);
        const birth_year = birthDateObj.getFullYear();
        const birth_month = birthDateObj.getMonth() + 1; // getMonth() 返回 0-11
        const birth_day = birthDateObj.getDate();

        // 將時辰轉換為小時數
        const timeMap = {
            "子時": 0,
            "丑時": 2, 
            "寅時": 4,
            "卯時": 6,
            "辰時": 8,
            "巳時": 10,
            "午時": 12,
            "未時": 14,
            "申時": 16,
            "酉時": 18,
            "戌時": 20,
            "亥時": 22
        };
        const birth_hour = timeMap[birthTime] || 12;

        const requestBody = {
            inputs: {
                name: name,
                birth_year: birth_year,
                birth_month: birth_month,
                birth_day: birth_day,
                birth_hour: birth_hour
            },
            response_mode: "blocking",
            user: "user-" + Date.now()
        };

        console.log('發送到 Dify:', requestBody);

        // Node.js 18+ 內建 fetch
        
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('API錯誤響應:', errorText);
            throw new Error(`API請求失敗: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        
        console.log('Dify 響應:', data);
        
        const result = data.data?.outputs?.result || data.answer || '計算結果獲取失敗';
        
        console.log('提取結果:', result);
        
        res.status(200).json({ result });
        
    } catch (error) {
        console.error('API調用錯誤:', error);
        res.status(500).json({ message: '服務器錯誤', error: error.message });
    }
}