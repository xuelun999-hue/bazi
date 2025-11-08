export default async function handler(req, res) {
    // 添加 CORS 支持
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const { amount = 1000 } = req.body; // 默認 10 元 (1000分)
        
        const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
        
        if (!stripeSecretKey) {
            console.error('Stripe secret key 未配置');
            return res.status(500).json({ message: 'Stripe secret key not configured' });
        }

        // 使用動態 import 導入 stripe
        const { default: Stripe } = await import('stripe');
        const stripe = new Stripe(stripeSecretKey);

        // 創建 Payment Intent
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount,
            currency: 'usd',
            payment_method_options: {
                card: {
                    request_three_d_secure: 'automatic'
                }
            },
            metadata: {
                service: '八字算命'
            }
        });

        console.log('Payment Intent 已創建:', paymentIntent.id);

        res.status(200).json({
            clientSecret: paymentIntent.client_secret
        });

    } catch (error) {
        console.error('Stripe 錯誤:', error);
        res.status(500).json({ message: '付款處理錯誤', error: error.message });
    }
}