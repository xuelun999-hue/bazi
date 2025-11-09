export default async function handler(req, res) {
    // 添加 CORS 支持
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const apiUrl = process.env.DIFY_API_URL || 'https://pro.aifunbox.com/v1/workflows/run';
        const fullApiUrl = apiUrl.endsWith('/workflows/run') ? apiUrl : `${apiUrl}/workflows/run`;
        const apiKey = process.env.DIFY_API_KEY;

        console.log('測試 API 配置:', {
            hasApiKey: !!apiKey,
            apiKeyLength: apiKey ? apiKey.length : 0,
            apiKeyPrefix: apiKey ? apiKey.substring(0, 12) + '...' : 'undefined',
            fullApiUrl: fullApiUrl
        });

        if (!apiKey) {
            return res.status(400).json({ 
                error: 'API key not configured',
                message: '請確認 DIFY_API_KEY 環境變量已設置'
            });
        }

        // 測試 API 連接（使用簡單的測試數據）
        const testRequestBody = {
            inputs: {
                nickname: "測試",
                birth_year: 1990,
                birth_month: 1,
                birth_day: 1,
                birth_hour: 12
            },
            response_mode: "blocking",
            user: "test-user"
        };

        console.log('發送測試請求到:', fullApiUrl);
        console.log('測試請求數據:', testRequestBody);

        const response = await fetch(fullApiUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(testRequestBody)
        });

        const responseText = await response.text();
        
        console.log('API 響應狀態:', response.status);
        console.log('API 響應內容:', responseText);

        let responseData;
        try {
            responseData = JSON.parse(responseText);
        } catch (e) {
            responseData = responseText;
        }

        res.status(200).json({
            success: response.ok,
            status: response.status,
            statusText: response.statusText,
            headers: Object.fromEntries(response.headers),
            data: responseData,
            apiConfig: {
                url: fullApiUrl,
                hasApiKey: !!apiKey,
                apiKeyPrefix: apiKey ? apiKey.substring(0, 12) + '...' : 'undefined'
            }
        });

    } catch (error) {
        console.error('測試錯誤:', error);
        res.status(500).json({ 
            error: 'Test failed', 
            message: error.message,
            stack: error.stack 
        });
    }
}