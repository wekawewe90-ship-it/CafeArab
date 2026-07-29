// ===========================
// Cafe Arab
// app.js
// ===========================

document.addEventListener("DOMContentLoaded", () => {

    console.log("Cafe Arab Started");

    // تأثير عند الضغط على الأزرار
    const buttons = document.querySelectorAll(".btn");

    buttons.forEach(button => {

        button.addEventListener("click", function(e) {

            e.preventDefault();

            this.style.transform = "scale(0.97)";

            setTimeout(() => {

                this.style.transform = "scale(1)";

            },150);

            const text = this.innerText;

            if(text.includes("ضيف")){
                alert("🚀 قريبًا سيتم دخول الضيف.");
            }

            else if(text.includes("إنشاء")){
                alert("📝 صفحة إنشاء الحساب قريبًا.");
            }

            else if(text.includes("تسجيل")){
                alert("🔑 صفحة تسجيل الدخول قريبًا.");
            }

        });

    });

});
