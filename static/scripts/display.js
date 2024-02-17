function displaySelectedImage() { ///ավելացնել, որ մենակ նկար տեսակի ֆայլեր թողի upload լինել
    const fileInput = document.getElementById("imageSelector");
    const selectedImage = document.getElementById("selectedImage");

    if (fileInput.files.length > 0) {
        const reader = new FileReader();

        reader.onload = function(e) {
            selectedImage.src = e.target.result;
            selectedImage.style.display = "block";
        };

        reader.readAsDataURL(fileInput.files[0]);
    } else {
        selectedImage.style.display = "none";
    }
}