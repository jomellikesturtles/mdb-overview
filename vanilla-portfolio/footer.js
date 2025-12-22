// Dynamic Year update
window.addEventListener("load", () => {
    const footerText = document.querySelector("#app-footer p");
    if (footerText) {
        const currentYear = new Date().getFullYear();
        // Ensure the year is current
        if (!footerText.textContent.includes(currentYear.toString())) {
             footerText.textContent = `© ${currentYear} Jommel Saligumba. All rights reserved.`;
        }
    }
    
    console.log("Portfolio loaded successfully.");
});
