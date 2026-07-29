alert("chat.js loaded");

const button = document.getElementById("sendBtn");

alert(button ? "تم العثور على الزر" : "الزر غير موجود");

button.addEventListener("click", () => {
    alert("زر الإرسال يعمل");
});
