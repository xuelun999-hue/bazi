document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('baziForm');
    const loadingDiv = document.getElementById('loading');
    const resultDiv = document.getElementById('result');
    const baziResultP = document.getElementById('baziResult');
    const paymentFormDiv = document.getElementById('payment-form');
    const cancelPaymentBtn = document.getElementById('cancel-payment');
    const loadingText = document.getElementById('loading-text');

    // 初始化 Stripe
    const stripe = Stripe('pk_test_51SDPrI1sY6VTIJ46ATiACJu0gAAHj6UT1YEUyV4Lm1lI4mLqnUoJJJfhaNAeTljuy4vZwmLVFqQ95BE8hzLZ1B0p00fBGa7iSC');
    let elements, paymentElement;
    let currentFormData = null;

    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = new FormData(form);
        const name = formData.get('name');
        const birthDate = formData.get('birthDate');
        const birthTime = formData.get('birthTime');
        
        if (!name || !birthDate || !birthTime) {
            alert('請填寫所有必填項目');
            return;
        }

        // 保存表單數據
        currentFormData = { name, birthDate, birthTime };

        // 顯示付款表單
        await showPaymentForm();
    });

    // 取消付款
    cancelPaymentBtn.addEventListener('click', function() {
        hidePaymentForm();
        currentFormData = null;
    });

    // 顯示付款表單
    async function showPaymentForm() {
        try {
            showLoading('正在準備付款...');

            // 創建 Payment Intent
            const response = await fetch('/api/create-payment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ amount: 1000 }) // $10 USD
            });

            const { clientSecret } = await response.json();

            // 創建 Stripe Elements
            elements = stripe.elements({
                clientSecret: clientSecret
            });

            paymentElement = elements.create('payment');
            paymentElement.mount('#payment-element');

            // 隱藏加載，顯示付款表單
            hideLoading();
            form.classList.add('hidden');
            paymentFormDiv.classList.remove('hidden');

            // 設置付款按鈕事件
            setupPaymentButton(clientSecret);

        } catch (error) {
            console.error('付款準備失敗:', error);
            alert('付款準備失敗，請重試');
            hideLoading();
        }
    }

    // 設置付款按鈕
    function setupPaymentButton(clientSecret) {
        const submitButton = document.getElementById('submit-payment');
        const buttonText = document.getElementById('button-text');
        const spinner = document.getElementById('spinner');

        submitButton.addEventListener('click', async (e) => {
            e.preventDefault();
            
            setPaymentLoading(true);

            const { error } = await stripe.confirmPayment({
                elements,
                confirmParams: {
                    return_url: window.location.href,
                },
                redirect: 'if_required'
            });

            if (error) {
                console.error('付款失敗:', error);
                document.getElementById('payment-errors').textContent = error.message;
                setPaymentLoading(false);
            } else {
                // 付款成功，調用 Dify API
                hidePaymentForm();
                showLoading('付款成功！正在計算您的八字...');
                
                try {
                    const result = await callDifyAPI(
                        currentFormData.name, 
                        currentFormData.birthDate, 
                        currentFormData.birthTime
                    );
                    showResult(result);
                } catch (apiError) {
                    console.error('API調用失敗:', apiError);
                    alert('付款已成功但計算失敗，請聯繫客服');
                    hideLoading();
                }
            }
        });
    }

    // 設置付款按鈕加載狀態
    function setPaymentLoading(isLoading) {
        const submitButton = document.getElementById('submit-payment');
        const buttonText = document.getElementById('button-text');
        const spinner = document.getElementById('spinner');

        if (isLoading) {
            submitButton.disabled = true;
            buttonText.classList.add('hidden');
            spinner.classList.remove('hidden');
        } else {
            submitButton.disabled = false;
            buttonText.classList.remove('hidden');
            spinner.classList.add('hidden');
        }
    }

    // 隱藏付款表單
    function hidePaymentForm() {
        paymentFormDiv.classList.add('hidden');
        form.classList.remove('hidden');
        
        // 清除錯誤消息
        document.getElementById('payment-errors').textContent = '';
    }

    async function callDifyAPI(name, birthDate, birthTime) {
        const response = await fetch('/api/dify', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: name,
                birthDate: birthDate,
                birthTime: birthTime
            })
        });

        if (!response.ok) {
            throw new Error(`API請求失敗: ${response.status}`);
        }

        const data = await response.json();
        
        // 調試：顯示完整響應
        console.log('API 響應:', data);
        
        // 如果有 raw_response，也顯示出來
        if (data.raw_response) {
            console.log('原始 Dify 響應:', data.raw_response);
        }
        
        return data.result;
    }

    function showLoading(message = '請稍候...') {
        if (loadingText) {
            loadingText.textContent = message;
        }
        loadingDiv.classList.remove('hidden');
        resultDiv.classList.add('hidden');
        paymentFormDiv.classList.add('hidden');
    }

    function hideLoading() {
        loadingDiv.classList.add('hidden');
    }

    function showResult(result) {
        hideLoading();
        
        // 如果結果是字符串，直接顯示
        // 如果結果是對象，嘗試提取八字信息
        let displayResult = '';
        if (typeof result === 'string') {
            displayResult = result;
        } else if (result && result.bazi) {
            displayResult = result.bazi;
        } else {
            displayResult = '無法解析計算結果';
        }
        
        baziResultP.textContent = displayResult;
        resultDiv.classList.remove('hidden');
    }
});