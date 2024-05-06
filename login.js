// 在您的 JavaScript 文件中
document.getElementById('google-login-btn').addEventListener('click', function() {
    // 使用 Google 登入 API 的內建函數執行登入流程
    var googleAuth = gapi.auth2.getAuthInstance();
    googleAuth.signIn().then(function(googleUser) {
        // 登入成功
        var profile = googleUser.getBasicProfile();
        console.log('登入成功：' + profile.getName());
        // 在這裡執行其他登入成功後的操作，例如導向到特定頁面
    }, function(error) {
        // 登入失敗
        console.log('登入失敗：' + error);
        // 在這裡執行其他登入失敗後的操作，例如顯示錯誤訊息
    });
});

function initGoogleAuth() {
    gapi.load('auth2', function() {
        gapi.auth2.init({
            client_id: '您的 Google 項目的客戶端 ID'
        });
    });
}

// 在文檔加載時初始化 Google 登入 API
document.addEventListener('DOMContentLoaded', initGoogleAuth);