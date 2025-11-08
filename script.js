document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('baziForm');
    const loadingDiv = document.getElementById('loading');
    const resultDiv = document.getElementById('result');
    const baziResultP = document.getElementById('baziResult');

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

        // 直接顯示加載狀態
        showLoading();
        
        try {
            const result = await callDifyAPI(name, birthDate, birthTime);
            showResult(result);
        } catch (error) {
            console.error('API調用失敗:', error);
            alert('計算失敗，請重試');
            hideLoading();
        }
    });


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
        return data.result;
    }

    function showLoading() {
        loadingDiv.classList.remove('hidden');
        resultDiv.classList.add('hidden');
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