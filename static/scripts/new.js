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

    fetch(
            "https://prod-86.westeurope.logic.azure.com:443/workflows/f7463abc1b7348a5b8cdbebb781d0d30/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=ZW8C6eahk3YpjaALAbInXJQ8NCrUnGcMTeKr-JDmNb4", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Secret": "57964aa2-6c3e-4710-8881-e1da54eb3938",
                },
                body: JSON.stringify(obj),
            },
        )
        .then((res) => {
            if (!res.ok) {
                throw new Error(`HTTP error! Status: ${res.status}`);
            }
        })
        .then(() => {
            // Call API to send OTP to user's email
            return fetch(
                "https://prod-217.westeurope.logic.azure.com:443/workflows/065ffb0f6bae4fde9dd6ad207c496a96/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=vYZQ6VqVH_RndliBoYu0FOOlW1gMu-1KEkZFmhvsoyQ", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Secret": "57964aa2-6c3e-4710-8881-e1da54eb3938",
                    },
                    body: JSON.stringify({ email: obj.verification }), // assuming email is part of your submitted data
                },
            );
        })
        .then((otpResponse) => {
            if (!otpResponse.ok) {
                throw new Error(`Failed to send OTP! Status: ${otpResponse.status}`);
            }

            // Prompt the user to enter OTP
            const enteredOTP = prompt("Enter the OTP sent to your email:");

            // Verify the entered OTP
            return fetch(
                "https://prod-199.westeurope.logic.azure.com:443/workflows/b2ad69fb6daf4d1ba8029a4a681c6eb7/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=cHKkw5vXWkHfKeIMddzClz5KrFCxTRBdUaGuMms0hBc", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Secret": "57964aa2-6c3e-4710-8881-e1da54eb3938",
                    },
                    body: JSON.stringify({ email: obj.verification, otp: enteredOTP }),
                },
            );
        })
        .then((otpVerificationResponse) => {
            if (!otpVerificationResponse.ok) {
                throw new Error(
                    `OTP verification failed! Status: ${otpVerificationResponse.status}`,
                );
            }

            // OTP verification successful, show success message
            if (typeof Swal === "function") {
                overlay.style.display = "none";
                loader.style.display = "none";
                Swal.fire({
                    icon: "success",
                    title: "Submission Successful!",
                    text: "Your data has been submitted.",
                });
            } else {
                // Fallback to a regular alert
                overlay.style.display = "none";
                loader.style.display = "none";
                alert("Submission Successful!\nYour data has been submitted.");
            }

            form.reset();
            fileUploaded.src = "";
        })
        .catch((error) => {
            console.error(error);
            // Handle errors here
            if (typeof Swal === "function") {
                overlay.style.display = "none";
                loader.style.display = "none";
                Swal.fire({
                    icon: "error",
                    title: "Submission Failed",
                    text: "There was an error submitting your data. Please try again.",
                });
            } else {
                // Fallback to a regular alert
                overlay.style.display = "none";
                loader.style.display = "none";
                alert(
                    "Submission Failed\nThere was an error submitting your data. Please try again.",
                );
            }
        });
});