/*
 * script.js - TableGlimpse Website JavaScript
 * COS10005 Web Development - Assignment 2
 * Author: Christabella Vedy
 *
 * This file handles:
 *   1. Navigation - highlight the active page link
 *   2. Restaurants page - filter cards by cuisine and price
 *   3. Recommendation page - rule-based logic to suggest a restaurant
 *   4. Registration form - validation with clear error messages
 *   5. Reservation form - validation, deposit display, conditional fields
 *   6. Bill calculator - dynamic total calculation
 *

/* ==============================================================
   1. NAVIGATION - Highlight Active Page
*/
function highlightActiveNav() {
    // Get the filename from the current URL (e.g. "restaurants.html")
    var currentPage = window.location.pathname.split("/").pop();

    // If the URL has no filename, default to index.html
    if (currentPage === "") {
        currentPage = "index.html";
    }

    // Loop through all nav links and mark the matching one active
    var navLinks = document.querySelectorAll("nav a");
    for (var i = 0; i < navLinks.length; i++) {
        var linkPage = navLinks[i].getAttribute("href").split("/").pop();
        if (linkPage === currentPage) {
            navLinks[i].classList.add("active");
        }
    }
}


/* ==============================================================
   2. RESTAURANTS PAGE - Filter by Cuisine and Price
   Hides cards that don't match selected filters.
   ============================================================== */
function initRestaurantFilters() {
    var cuisineFilter = document.getElementById("cuisineFilter");
    var priceFilter = document.getElementById("priceFilter");
    var resetBtn = document.getElementById("resetFilters");

    // Only run if we are on restaurants.html
    if (!cuisineFilter) return;

    // Apply filters when either dropdown changes
    cuisineFilter.addEventListener("change", applyFilters);
    priceFilter.addEventListener("change", applyFilters);

    // Reset button clears filters and shows all cards
    resetBtn.addEventListener("click", function() {
        cuisineFilter.value = "all";
        priceFilter.value = "all";
        applyFilters();
    });

    function applyFilters() {
        var selectedCuisine = cuisineFilter.value;
        var selectedPrice = priceFilter.value;
        var cards = document.querySelectorAll("#restaurantCards .card");
        var visibleCount = 0;

        for (var i = 0; i < cards.length; i++) {
            var cardCuisine = cards[i].getAttribute("data-cuisine");
            var cardPrice = cards[i].getAttribute("data-price");

            // Check if card matches both filters (or filter is "all")
            var cuisineMatch = (selectedCuisine === "all" || cardCuisine === selectedCuisine);
            var priceMatch = (selectedPrice === "all" || cardPrice === selectedPrice);

            if (cuisineMatch && priceMatch) {
                cards[i].style.display = "";  // show card
                visibleCount++;
            } else {
                cards[i].style.display = "none";  // hide card
            }
        }

        // Show "no results" message if nothing matched
        var noResults = document.getElementById("noResults");
        if (noResults) {
            if (visibleCount === 0) {
                noResults.classList.remove("hidden");
            } else {
                noResults.classList.add("hidden");
            }
        }
    }
}


/* ==============================================================
   3. RECOMMENDATION PAGE - Rule-Based Logic
   Uses dietary preference, budget, and dining purpose to
   suggest the best matching restaurant.
   ============================================================== */
function initRecommendations() {
    var recommendBtn = document.getElementById("recommendBtn");

    // Only run if we are on recommend.html
    if (!recommendBtn) return;

    // Restaurant data used for matching
    var restaurants = [
        {
            name: "La Trattoria",
            cuisine: "Italian",
            budget: "mid",
            purposes: ["date", "family"],
            dietary: ["none", "vegetarian"],
            description: "A cosy Italian restaurant perfect for date nights and family dinners. Great pasta and pizza.",
            deposit: "$20"
        },
        {
            name: "Sakura Lounge",
            cuisine: "Japanese",
            budget: "high",
            purposes: ["business", "date"],
            dietary: ["none", "glutenfree"],
            description: "Upscale Japanese dining ideal for business meals and special celebrations.",
            deposit: "$50"
        },
        {
            name: "Urban Harvest",
            cuisine: "Modern Australian",
            budget: "mid",
            purposes: ["date", "friends", "business"],
            dietary: ["none", "vegetarian", "vegan", "glutenfree"],
            description: "Creative Australian cuisine with excellent vegan options — suits almost any occasion.",
            deposit: "$25"
        },
        {
            name: "Casa Caliente",
            cuisine: "Mexican",
            budget: "low",
            purposes: ["family", "friends"],
            dietary: ["none", "vegetarian"],
            description: "Fun and affordable Mexican street food, great for casual group outings.",
            deposit: "$10"
        },
        {
            name: "Spice Garden",
            cuisine: "Indian",
            budget: "low",
            purposes: ["family", "friends"],
            dietary: ["none", "vegan", "vegetarian", "halal"],
            description: "Authentic Indian flavours with a huge range of vegan and halal options.",
            deposit: "$15"
        },
        {
            name: "Golden Dragon",
            cuisine: "Chinese",
            budget: "low",
            purposes: ["family", "friends"],
            dietary: ["none", "halal"],
            description: "Classic Cantonese cuisine perfect for large family gatherings. Halal-friendly.",
            deposit: "$10"
        }
    ];

    recommendBtn.addEventListener("click", function() {
        var dietary = document.getElementById("dietaryPref").value;
        var budget = document.getElementById("budgetPref").value;
        var purpose = document.getElementById("purposePref").value;
        var output = document.getElementById("recommendationOutput");
        var reserveSection = document.getElementById("reserveFromRecommend");
        var reserveBtn = document.getElementById("reserveRecommendedBtn");

        // Find all restaurants that match the criteria
        var matches = [];
        for (var i = 0; i < restaurants.length; i++) {
            var r = restaurants[i];
            var dietaryMatch = (r.dietary.indexOf(dietary) !== -1);
            var budgetMatch = (r.budget === budget);
            var purposeMatch = (r.purposes.indexOf(purpose) !== -1);

            // Award a score: higher = better match
            var score = 0;
            if (dietaryMatch) score += 3;  // dietary is most important
            if (budgetMatch) score += 2;   // budget is second
            if (purposeMatch) score += 1;  // purpose adds extra weight

            if (score > 0) {
                matches.push({ restaurant: r, score: score });
            }
        }

        // Sort matches by score (highest first)
        matches.sort(function(a, b) {
            return b.score - a.score;
        });

        // Display the best match
        if (matches.length > 0) {
            var best = matches[0].restaurant;
            output.innerHTML =
                "<strong>🍽️ We recommend: " + best.name + "</strong><br>" +
                "<em>Cuisine: " + best.cuisine + " | Budget: " + budget + " | Deposit: " + best.deposit + "</em><br><br>" +
                best.description;

            // Trigger the slide-down animation by re-adding the class
            output.classList.remove("show-result");
            // Small timeout so the browser registers the class removal first
            setTimeout(function() {
                output.classList.add("show-result");
            }, 10);

            // Show the reserve button linked to this restaurant
            reserveBtn.setAttribute("href", "reservation.html?restaurant=" + encodeURIComponent(best.name));
            reserveSection.classList.remove("hidden");
        } else {
            // No perfect match — suggest the closest option
            output.innerHTML =
                "😕 No exact match found for your preferences. " +
                "Try adjusting your dietary preference or budget. " +
                "You can also <a href='restaurants.html'>browse all restaurants</a> manually.";
            output.classList.remove("show-result");
            setTimeout(function() {
                output.classList.add("show-result");
            }, 10);
            reserveSection.classList.add("hidden");
        }
    });
}


/* ==============================================================
   4. REGISTRATION FORM VALIDATION
   Checks each field against the requirements and shows
   error messages. Blocks submission until all fields are valid.
   ============================================================== */
function initRegisterForm() {
    var form = document.getElementById("registerForm");

    // Only run if we are on register.html
    if (!form) return;

    form.addEventListener("submit", function(e) {
        // Prevent the form from submitting by default
        e.preventDefault();

        var isValid = true;

        // --- Username validation ---
        // Must be at least 5 characters, letters/numbers/underscores only
        var username = document.getElementById("username").value.trim();
        var usernameError = document.getElementById("usernameError");
        var usernameRegex = /^[a-zA-Z0-9_]{5,}$/;
        if (!usernameRegex.test(username)) {
            usernameError.style.display = "block";
            isValid = false;
        } else {
            usernameError.style.display = "none";
        }

        // --- Email validation ---
        // Must follow a standard email format
        var email = document.getElementById("email").value.trim();
        var emailError = document.getElementById("emailError");
        var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            emailError.style.display = "block";
            isValid = false;
        } else {
            emailError.style.display = "none";
        }

        // --- Phone number validation ---
        // Must be digits only, 8 to 15 digits
        var phone = document.getElementById("phone").value.trim();
        var phoneError = document.getElementById("phoneError");
        var phoneRegex = /^\d{8,15}$/;
        if (!phoneRegex.test(phone)) {
            phoneError.style.display = "block";
            isValid = false;
        } else {
            phoneError.style.display = "none";
        }

        // --- Password validation ---
        // Min 10 characters, must include uppercase, lowercase, digit, special char
        var password = document.getElementById("password").value;
        var passwordError = document.getElementById("passwordError");
        var hasUpper = /[A-Z]/.test(password);
        var hasLower = /[a-z]/.test(password);
        var hasDigit = /\d/.test(password);
        var hasSpecial = /[!@#$%^&*(),.?":{}|<>_\-]/.test(password);
        if (password.length < 10 || !hasUpper || !hasLower || !hasDigit || !hasSpecial) {
            passwordError.style.display = "block";
            isValid = false;
        } else {
            passwordError.style.display = "none";
        }

        // --- Confirm Password validation ---
        // Must match the password field
        var confirmPassword = document.getElementById("confirmPassword").value;
        var confirmPasswordError = document.getElementById("confirmPasswordError");
        if (confirmPassword !== password) {
            confirmPasswordError.style.display = "block";
            isValid = false;
        } else {
            confirmPasswordError.style.display = "none";
        }

        // --- Gender validation ---
        // A radio option must be selected
        var genderInputs = document.querySelectorAll("input[name='gender']");
        var genderError = document.getElementById("genderError");
        var genderSelected = false;
        for (var i = 0; i < genderInputs.length; i++) {
            if (genderInputs[i].checked) {
                genderSelected = true;
                break;
            }
        }
        if (!genderSelected) {
            genderError.style.display = "block";
            isValid = false;
        } else {
            genderError.style.display = "none";
        }

        // --- Dietary preference validation ---
        var dietary = document.getElementById("dietaryPref").value;
        var dietaryError = document.getElementById("dietaryError");
        if (dietary === "") {
            dietaryError.style.display = "block";
            isValid = false;
        } else {
            dietaryError.style.display = "none";
        }

        // --- Country validation ---
        var country = document.getElementById("country").value;
        var countryError = document.getElementById("countryError");
        if (country === "") {
            countryError.style.display = "block";
            isValid = false;
        } else {
            countryError.style.display = "none";
        }

        // If all fields passed, submit the form
        if (isValid) {
            form.submit();
        }
    });
}


/* ==============================================================
   5. RESERVATION FORM
   - Pre-fills restaurant from URL query string
   - Dynamically updates deposit based on selected restaurant
   - Shows/hides voucher or card fields based on payment method
   - "Same as email" checkbox auto-fills billing email
   - Validates all required fields before submission
   ============================================================== */

// Deposit amounts for each restaurant (must match restaurants.html)
var depositAmounts = {
    "La Trattoria": 20,
    "Sakura Lounge": 50,
    "Urban Harvest": 25,
    "Casa Caliente": 10,
    "Spice Garden": 15,
    "Golden Dragon": 10
};

function initReservationForm() {
    var form = document.getElementById("reservationForm");

    // Only run if we are on reservation.html
    if (!form) return;

    var restaurantSelect = document.getElementById("restaurantChoice");
    var depositDisplay = document.getElementById("depositDisplay");
    var payVoucher = document.getElementById("payVoucher");
    var payOnline = document.getElementById("payOnline");
    var voucherSection = document.getElementById("voucherSection");
    var cardSection = document.getElementById("cardSection");
    var cardNumberSection = document.getElementById("cardNumberSection");
    var sameEmailCheckbox = document.getElementById("sameEmail");

    // --- Pre-fill restaurant from URL (coming from restaurants or recommend page) ---
    var urlParams = new URLSearchParams(window.location.search);
    var preselected = urlParams.get("restaurant");
    if (preselected && restaurantSelect) {
        restaurantSelect.value = preselected;
        updateDepositDisplay(preselected);
    }

    // --- Update deposit display when restaurant changes ---
    restaurantSelect.addEventListener("change", function() {
        updateDepositDisplay(this.value);
    });

    function updateDepositDisplay(restaurantName) {
        if (restaurantName && depositAmounts[restaurantName] !== undefined) {
            depositDisplay.textContent = "$" + depositAmounts[restaurantName] + " deposit required for " + restaurantName;
        } else {
            depositDisplay.textContent = "Select a restaurant to see deposit amount.";
        }
    }

    // --- Show/hide voucher or card fields based on payment method ---
    payVoucher.addEventListener("change", function() {
        if (this.checked) {
            voucherSection.classList.remove("hidden");
            cardSection.classList.add("hidden");
            cardNumberSection.classList.add("hidden");
        }
    });

    payOnline.addEventListener("change", function() {
        if (this.checked) {
            cardSection.classList.remove("hidden");
            cardNumberSection.classList.remove("hidden");
            voucherSection.classList.add("hidden");
        }
    });

    // --- "Same as email address" checkbox ---
    sameEmailCheckbox.addEventListener("change", function() {
        var billingEmail = document.getElementById("billingEmail");
        var resEmail = document.getElementById("resEmail").value;
        if (this.checked) {
            billingEmail.value = resEmail;
            billingEmail.setAttribute("readonly", true);
        } else {
            billingEmail.removeAttribute("readonly");
        }
    });

    // --- Form submission validation ---
    form.addEventListener("submit", function(e) {
        e.preventDefault();
        var isValid = true;

        // Full name - must not be empty
        var fullName = document.getElementById("fullName").value.trim();
        var fullNameError = document.getElementById("fullNameError");
        if (fullName === "") {
            fullNameError.style.display = "block";
            isValid = false;
        } else {
            fullNameError.style.display = "none";
        }

        // Email - must be valid format
        var resEmail = document.getElementById("resEmail").value.trim();
        var resEmailError = document.getElementById("resEmailError");
        var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(resEmail)) {
            resEmailError.style.display = "block";
            isValid = false;
        } else {
            resEmailError.style.display = "none";
        }

        // Phone - at least 10 digits
        var resPhone = document.getElementById("resPhone").value.trim();
        var resPhoneError = document.getElementById("resPhoneError");
        var digits = resPhone.replace(/\D/g, "");
        if (digits.length < 10) {
            resPhoneError.style.display = "block";
            isValid = false;
        } else {
            resPhoneError.style.display = "none";
        }

        // Restaurant - must be selected
        var restaurant = restaurantSelect.value;
        var restaurantError = document.getElementById("restaurantError");
        if (restaurant === "") {
            restaurantError.style.display = "block";
            isValid = false;
        } else {
            restaurantError.style.display = "none";
        }

        // Date - must not be in the past
        var dateInput = document.getElementById("reservationDate").value;
        var dateError = document.getElementById("dateError");
        var today = new Date();
        today.setHours(0, 0, 0, 0);
        if (dateInput === "") {
            dateError.style.display = "block";
            isValid = false;
        } else {
            var selectedDate = new Date(dateInput);
            if (selectedDate < today) {
                dateError.style.display = "block";
                isValid = false;
            } else {
                dateError.style.display = "none";
            }
        }

        // Time - must not be empty
        var timeInput = document.getElementById("reservationTime").value;
        var timeError = document.getElementById("timeError");
        if (timeInput === "") {
            timeError.style.display = "block";
            isValid = false;
        } else {
            timeError.style.display = "none";
        }

        // Guests - must be greater than 0
        var guests = parseInt(document.getElementById("guests").value);
        var guestsError = document.getElementById("guestsError");
        if (isNaN(guests) || guests < 1) {
            guestsError.style.display = "block";
            isValid = false;
        } else {
            guestsError.style.display = "none";
        }

        // Payment method - must be selected
        var paymentError = document.getElementById("paymentError");
        if (!payVoucher.checked && !payOnline.checked) {
            paymentError.style.display = "block";
            isValid = false;
        } else {
            paymentError.style.display = "none";
        }

        // Card number validation (only if online payment selected)
        if (payOnline.checked) {
            var cardNumber = document.getElementById("cardNumber").value.replace(/\s/g, "");
            var cardType = document.getElementById("cardType").value;
            var cardError = document.getElementById("cardError");
            var cardValid = false;

            // Visa and Mastercard require 16 digits, Amex requires 15 digits
            if ((cardType === "visa" || cardType === "mastercard") && /^\d{16}$/.test(cardNumber)) {
                cardValid = true;
            } else if (cardType === "amex" && /^\d{15}$/.test(cardNumber)) {
                cardValid = true;
            }

            if (!cardValid) {
                cardError.style.display = "block";
                isValid = false;
            } else {
                cardError.style.display = "none";
            }
        }

        // Billing email - must be valid
        var billingEmail = document.getElementById("billingEmail").value.trim();
        var billingEmailError = document.getElementById("billingEmailError");
        if (!emailRegex.test(billingEmail)) {
            billingEmailError.style.display = "block";
            isValid = false;
        } else {
            billingEmailError.style.display = "none";
        }

        // If all valid, submit the form
        if (isValid) {
            form.submit();
        }
    });
}


/* ==============================================================
   6. BILL CALCULATOR (bill.html - Bonus Task)
   Calculates an estimated bill based on restaurant base price,
   group size, optional extras, and service charge.
   Updates dynamically when the button is clicked.
   ============================================================== */
function initBillCalculator() {
    var calcBtn = document.getElementById("calcBillBtn");

    // Only run if we are on bill.html
    if (!calcBtn) return;

    calcBtn.addEventListener("click", function() {
        var restaurantSelect = document.getElementById("billRestaurant");
        var selectedOption = restaurantSelect.options[restaurantSelect.selectedIndex];

        // Get base price per person from data attribute
        var basePricePerPerson = parseFloat(selectedOption.getAttribute("data-base")) || 0;
        var restaurantName = restaurantSelect.value;

        // Get group size
        var groupSize = parseInt(document.getElementById("groupSize").value) || 1;
        if (groupSize < 1) groupSize = 1;

        // Base food cost
        var baseTotal = basePricePerPerson * groupSize;

        // Optional extras
        var dish1 = document.getElementById("dish1").checked ? 15 * groupSize : 0;  // Drinks per person
        var dish2 = document.getElementById("dish2").checked ? 12 : 0;              // Dessert platter (flat)
        var dish3 = document.getElementById("dish3").checked ? 25 : 0;              // Floral centrepiece (flat)
        var dish4 = document.getElementById("dish4").checked ? 10 * groupSize : 0;  // Champagne per person

        var extrasTotal = dish1 + dish2 + dish3 + dish4;

        // Subtotal before service
        var subtotal = baseTotal + extrasTotal;

        // Optional service charge (10%)
        var includeService = document.getElementById("includeService").checked;
        var serviceCharge = includeService ? subtotal * 0.10 : 0;

        // Grand total
        var grandTotal = subtotal + serviceCharge;

        // Build breakdown display
        var breakdown = "";

        if (restaurantName === "") {
            alert("Please select a restaurant first.");
            return;
        }

        breakdown += "<p>🍽️ <strong>" + restaurantName + "</strong></p>";
        breakdown += "<p>Base cost: $" + basePricePerPerson.toFixed(2) + " × " + groupSize + " people = <strong>$" + baseTotal.toFixed(2) + "</strong></p>";

        if (dish1 > 0) breakdown += "<p>🍷 Drinks Package: <strong>$" + dish1.toFixed(2) + "</strong></p>";
        if (dish2 > 0) breakdown += "<p>🎂 Dessert Platter: <strong>$" + dish2.toFixed(2) + "</strong></p>";
        if (dish3 > 0) breakdown += "<p>🌹 Floral Centrepiece: <strong>$" + dish3.toFixed(2) + "</strong></p>";
        if (dish4 > 0) breakdown += "<p>🍾 Champagne Toast: <strong>$" + dish4.toFixed(2) + "</strong></p>";

        breakdown += "<p>Subtotal: <strong>$" + subtotal.toFixed(2) + "</strong></p>";

        if (includeService) {
            breakdown += "<p>Service charge (10%): <strong>$" + serviceCharge.toFixed(2) + "</strong></p>";
        }

        // Show the breakdown section
        var breakdownDiv = document.getElementById("billBreakdown");
        document.getElementById("breakdownDetails").innerHTML = breakdown;
        document.getElementById("billTotal").textContent = "Estimated Total: $" + grandTotal.toFixed(2);
        breakdownDiv.classList.remove("hidden");
    });
}


/* ==============================================================
   INITIALISE ALL FUNCTIONS
   Run setup functions when the page is fully loaded.
   ============================================================== */
window.onload = function() {
    highlightActiveNav();
    initRestaurantFilters();
    initRecommendations();
    initRegisterForm();
    initReservationForm();
    initBillCalculator();
};
