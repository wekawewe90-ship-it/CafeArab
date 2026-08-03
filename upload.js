const chooseBtn = document.getElementById("chooseBtn");
const uploadBtn = document.getElementById("uploadBtn");
const fileInput = document.getElementById("fileInput");
const preview = document.getElementById("preview");
const progress = document.getElementById("progress");

let selectedFile = null;

chooseBtn.addEventListener("click", () => {

    fileInput.click();

});

fileInput.addEventListener("change", () => {

    if (!fileInput.files.length) return;

    selectedFile = fileInput.files[0];

    const reader = new FileReader();

    reader.onload = (e) => {

        preview.innerHTML = `
            <img src="${e.target.result}">
        `;

    };

    reader.readAsDataURL(selectedFile);

});
