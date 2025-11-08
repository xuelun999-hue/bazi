export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const { name, birthDate, birthTime } = req.body;
        
        const apiUrl = process.env.DIFY_API_URL || 'https://pro.aifunbox.com/v1/workflows/run';
        const apiKey = process.env.DIFY_API_KEY;
        
        if (!apiKey) {
            return res.status(500).json({ message: 'API key not configured' });
        }

        const requestBody = {
            inputs: {
                name: name,
                birthDate: birthDate,
                birthTime: birthTime
            },
            response_mode: "blocking",
            user: "user-" + Date.now()
        };

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            throw new Error(`API請求失敗: ${response.status}`);
        }

        const data = await response.json();
        
        const result = data.data?.outputs?.result || data.answer || '計算結果獲取失敗';
        
        res.status(200).json({ result });
        
    } catch (error) {
        console.error('API調用錯誤:', error);
        res.status(500).json({ message: '服務器錯誤', error: error.message });
    }
}