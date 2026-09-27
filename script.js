const menuButton = document.getElementById("menuButton");
const navLinks = document.getElementById("navLinks");
const navbar = document.getElementById("navbar");


// MOBILE MENU

menuButton.addEventListener("click", () => {
    navLinks.classList.toggle("active");
});


// CLOSE MOBILE MENU

document.querySelectorAll(".nav-links a").forEach(link => {
    link.addEventListener("click", () => {
        navLinks.classList.remove("active");
    });
});


// SCROLL REVEAL

const revealElements = document.querySelectorAll(".reveal");

const revealObserver = new IntersectionObserver(
    entries => {
        entries.forEach(entry => {

            if (entry.isIntersecting) {
                entry.target.classList.add("visible");
                revealObserver.unobserve(entry.target);
            }

        });
    },
    {
        threshold: 0.12
    }
);

revealElements.forEach(element => {
    revealObserver.observe(element);
});


// NAVBAR SCROLL EFFECT

window.addEventListener("scroll", () => {

    if (window.scrollY > 30) {
        navbar.style.background = "rgba(5, 7, 12, 0.92)";
    } else {
        navbar.style.background = "rgba(5, 7, 12, 0.72)";
    }

});


// CONTACT FORM

const contactForm = document.getElementById("contactForm");
const formStatus = document.getElementById("formStatus");
const submitButton = document.getElementById("submitButton");

contactForm.addEventListener("submit", async event => {

    event.preventDefault();

    const formData = new FormData(contactForm);

    const data = {
        firstName: formData.get("firstName"),
        lastName: formData.get("lastName"),
        email: formData.get("email"),
        subject: formData.get("subject"),
        message: formData.get("message")
    };

    formStatus.textContent = "Sending...";
    formStatus.className = "form-status";

    submitButton.disabled = true;
    submitButton.style.opacity = "0.6";

    try {

        const response = await fetch("/api/contact", {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
            throw new Error(
                result.message || "Something went wrong."
            );
        }

        formStatus.textContent =
            "Your message has been sent successfully!";

        formStatus.className =
            "form-status success";

        contactForm.reset();

    } catch (error) {

        console.error(error);

        formStatus.textContent =
            error.message ||
            "Unable to send your message.";

        formStatus.className =
            "form-status error";

    } finally {

        submitButton.disabled = false;
        submitButton.style.opacity = "1";

    }

});


// SMOOTH ANCHOR LINKS

document.querySelectorAll('a[href^="#"]').forEach(anchor => {

    anchor.addEventListener("click", event => {

        const target = document.querySelector(
            anchor.getAttribute("href")
        );

        if (!target) return;

        event.preventDefault();

        target.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    });

});


// GAME CARD TILT

document.querySelectorAll(".game-card").forEach(card => {

    card.addEventListener("mousemove", event => {

        const rect = card.getBoundingClientRect();

        const x =
            event.clientX - rect.left;

        const y =
            event.clientY - rect.top;

        const rotateX =
            ((y / rect.height) - 0.5) * -4;

        const rotateY =
            ((x / rect.width) - 0.5) * 4;

        card.style.transform =
            `perspective(900px)
             rotateX(${rotateX}deg)
             rotateY(${rotateY}deg)
             translateY(-7px)`;

    });

    card.addEventListener("mouseleave", () => {

        card.style.transform = "";

    });

});