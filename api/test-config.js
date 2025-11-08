export default async function handler(req, res) {
    // 添加 CORS 支持
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const config = {
            difyApiUrl: process.env.DIFY_API_URL || '未設定',
            hasDifyApiKey: !!process.env.DIFY_API_KEY,
            hasStripeSecretKey: !!process.env.STRIPE_SECRET_KEY,
            nodeVersion: process.version,
            timestamp: new Date().toISOString()
        };

        console.log('配置檢查:', config);

        res.status(200).json({
            message: '配置檢查成功',
            config: config
        });

    } catch (error) {
        console.error('配置檢查錯誤:', error);
        res.status(500).json({ 
            message: '配置檢查失敗', 
            error: error.message 
        });
    }
}