const form = document.querySelector("form");
const overlay = document.getElementById("overlay");
const loader = document.getElementById("loader");

form.addEventListener("submit", (e) => {
    overlay.style.display = "block";
    loader.style.display = "block";

    e.preventDefault();
    const fd = new FormData(form);
    const obj = Object.fromEntries(fd);

    const fileInput = document.getElementById("imageSelector");
    const fileUploaded = document.getElementById("selectedImage");
    if (
        (fileInput && fileInput.files && fileInput.files.length > 0) ||
        fileUploaded && fileUploaded.src &&
        fileUploaded.src.startsWith("data:image/")
    ) {
        // Assuming you have an <img> element to display the selected image
        const imgElement = document.getElementById("selectedImage");
        const imageData = imgElement.src; // Get the image source URL
        obj.picture = imageData; // Add to obj
    } else {
        alert("Please choose an image to upload.");
        overlay.style.display = "none";
        loader.style.display = "none";
        return;
    }

    const path = window.location.pathname;
    const match = path.match(/^\/(\d+)/);
    let id;

    // Check if a match is found
    if (match !== null) {
        id = match[1];
        console.log("Trailing number:", id);

        // Make the fetch request inside the scope where id is defined
        fetch(
                "https://prod-212.westeurope.logic.azure.com:443/workflows/ea4efcba6beb4656b4618b2333f3365f/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=ZM2Kn7Vzg0NeNTPr2M-RFWUUtcMi7YSY-KUbpKz-CJQ", {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        "Secret": "57964aa2-6c3e-4710-8881-e1da54eb3938",
                    },
                    body: JSON.stringify({ id: id, data: obj }),
                },
            )
            .then((res) => {
                if (!res.ok) {
                    throw new Error(`HTTP error! Status: ${res.status}`);
                }
            })
            .then(() => {
                // Use SweetAlert for success message
                if (typeof Swal === "function") {
                    overlay.style.display = "none";
                    loader.style.display = "none";
                    Swal.fire({
                        icon: "success",
                        title: "Submission Successful!",
                        text: "Your data has been saved.",
                    });
                } else {
                    overlay.style.display = "none";
                    loader.style.display = "none";
                    // Fallback to a regular alert
                    alert("Submission Successful!\nYour data has been saved.");
                }

                // // Scroll back to the top
                // window.scrollTo({ top: 0, behavior: "smooth" });
            })
            .catch((error) => console.error(error));
    } else {
        console.log("Trailing number not found in the URL path");
    }
});