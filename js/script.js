/*
 *
 * This file handles:
 *   1. Navigation - highlight the active page link
 *   2. Restaurants page - filter cards by cuisine and price
 *   3. Recommendation page - rule-based logic to suggest a restaurant
 *   4. Registration form - validation with clear error messages
 *   5. Reservation form - validation, deposit display, conditional fields
 *   6. Bill calculator - dynamic total calculation
 *

/* 
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


/*
   2. RESTAURANTS PAGE - Filter by Cuisine and Price
   Hides cards that don't match selected filters.
*/
function initRestaurantFilters() {
    var cuisineFilter = document.getElementById("cuisineFilter"); //variables get elements by their ID
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
        applyFilters(); //apply filters function is called to update the display after resetting the filters
    });

    function applyFilters() { //function to show/hide cards based on selected filters
        var selectedCuisine = cuisineFilter.value; //get the selected value from the cuisine filter
        var selectedPrice = priceFilter.value;
        var cards = document.querySelectorAll("#restaurantCards .card"); //get all the restaurant cards
        var visibleCount = 0; //counter to track how many cards are visible after filtering

        for (var i = 0; i < cards.length; i++) { //loop through each card to check if it matches the selected filters
            var cardCuisine = cards[i].getAttribute("data-cuisine"); //get the cuisine type from the card's data attribute
            var cardPrice = cards[i].getAttribute("data-price");

            // Check if card matches both filters (or filter is "all")
            var cuisineMatch = (selectedCuisine === "all" || cardCuisine === selectedCuisine);
            var priceMatch = (selectedPrice === "all" || cardPrice === selectedPrice); //check if the card's price matches the selected price filter or if the filter is set to "all"

            if (cuisineMatch && priceMatch) {
                cards[i].style.display = "";  // show card
                visibleCount++;
            } else {
                cards[i].style.display = "none";  // hide card
            }
        }

        // Show "no results" message if nothing matched
        var noResults = document.getElementById("noResults"); //get the "no results" message element
        if (noResults) { //check if the element exists before trying to show/hide it
            if (visibleCount === 0) {
                noResults.classList.remove("hidden"); //if no cards are visible, remove the "hidden" class to show the "no results" message
            } else { // If there are visible cards, ensure the "no results" message is hidden
                noResults.classList.add("hidden");
            }
        }
    }
}


/*
   3. RECOMMENDATION PAGE - Rule-Based Logic
   Uses dietary preference, budget, and dining purpose to
   suggest the best matching restaurant.
*/
function initRecommendations() { 
    var recommendBtn = document.getElementById("recommendBtn"); // Get the recommend button element by its ID

    // Only run if we are on recommend.html
    if (!recommendBtn) return; // If the recommend button doesn't exist on the page, exit the function to avoid errors

    // Restaurant data used for matching
    var restaurants = [
        {
            name: "La Trattoria", // Name of the restaurant
            cuisine: "Italian", // Type of cuisine offered
            budget: "mid", // Budget category (low, mid, high)
            purposes: ["date", "family"], // Suitable dining purposes (e.g. date, family, business)
            dietary: ["none", "vegetarian"], // Dietary options available (e.g. none, vegetarian, vegan, glutenfree)
            description: "A cosy Italian restaurant perfect for date nights and family dinners. Great pasta and pizza.", // A brief description of the restaurant's atmosphere and offerings
            deposit: "$20" // Deposit amount required for reservations at this restaurant
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

    recommendBtn.addEventListener("click", function() { // Add click event listener to the recommend button
        var dietary = document.getElementById("dietaryPref").value; // Get the selected dietary preference from the dropdown
        var budget = document.getElementById("budgetPref").value; 
        var purpose = document.getElementById("purposePref").value;
        var output = document.getElementById("recommendationOutput"); // Get the element where the recommendation result will be displayed
        var reserveSection = document.getElementById("reserveFromRecommend");
        var reserveBtn = document.getElementById("reserveRecommendedBtn");

        // Find all restaurants that match the criteria
        var matches = []; // Initialize an array to hold matching restaurants along with their scores based on how well they match the user's preferences
        for (var i = 0; i < restaurants.length; i++) { // Loop through each restaurant in the data array to evaluate how well it matches the user's preferences
            var r = restaurants[i];
            var dietaryMatch = (r.dietary.indexOf(dietary) !== -1); // Check if the restaurant's dietary options include the user's selected dietary preference
            var budgetMatch = (r.budget === budget); // Check if the restaurant's budget category matches the user's selected budget
            var purposeMatch = (r.purposes.indexOf(purpose) !== -1); // Check if the restaurant supports the user's selected purpose

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
        if (matches.length > 0) { // If there are any matches, take the one with the highest score as the best recommendation
            var best = matches[0].restaurant; // Get the restaurant object from the best match to display its details
            output.innerHTML = // Build the recommendation message with the restaurant's name, cuisine, budget, deposit, and description
                "<strong> We recommend: " + best.name + "</strong><br>" +
                "<em>Cuisine: " + best.cuisine + " | Budget: " + budget + " | Deposit: " + best.deposit + "</em><br><br>" +
                best.description;

            // Trigger the slide-down animation by re-adding the class
            output.classList.remove("show-result"); // Remove the class to reset the animation
            // Small timeout so the browser registers the class removal first
            setTimeout(function() {
                output.classList.add("show-result");
            }, 10);

            // Show the reserve button linked to this restaurant
            reserveBtn.setAttribute("href", "reservation.html?restaurant=" + encodeURIComponent(best.name)); // Set the reservation button's link to include the recommended restaurant's name as a query parameter
            reserveSection.classList.remove("hidden");
        } else {
            // No perfect match — suggest the closest option
            output.innerHTML = // If no matches were found, display a message suggesting the user adjust their preferences or browse all restaurants
                "No exact match found for your preferences. " +
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


/*
   4. REGISTRATION FORM VALIDATION
   Checks each field against the requirements and shows
   error messages. Blocks submission until all fields are valid.
*/
function initRegisterForm() { // Get the registration form element by its ID
    var form = document.getElementById("registerForm");

    // Only run if we are on register.html
    if (!form) return;

    form.addEventListener("submit", function(e) { // Add a submit event listener to the form to validate the input fields when the user tries to submit the form
        // Prevent the form from submitting by default
        e.preventDefault();

        var isValid = true; // Flag to track overall form validity, starts as true and will be set to false if any field fails validation

        // Username validation
        // Must be at least 5 characters, letters/numbers/underscores only
        var username = document.getElementById("username").value.trim(); // Get the value of the username input field and trim any whitespace from the beginning and end
        var usernameError = document.getElementById("usernameError"); // Get the element where the username error message will be displayed
        var usernameRegex = /^[a-zA-Z0-9_]{5,}$/; // Regular expression to validate that the username is at least 5 characters long and contains only letters, numbers, or underscores
   
        if (!usernameRegex.test(username)) 
            { // If the username does not match the regular expression, it is invalid
            usernameError.style.display = "block"; // Show the username error message by setting its display style to "block"
            isValid = false; // Set the overall form validity flag to false since this field is invalid
        } else 
            {// If the username is valid, hide the error message
            usernameError.style.display = "none";// Hide the username error message by setting its display style to "none"
        }

        //Email validation
        // Must follow a standard email format
        var email = document.getElementById("email").value.trim(); // Get the value of the email input field and trim any whitespace from the beginning and end
        var emailError = document.getElementById("emailError"); // Get the element where the email error message will be displayed
        var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Regular expression to validate that the email follows a standard format (contains an "@" symbol and a domain)
       
        if (!emailRegex.test(email)) 
            { // If the email does not match the regular expression, it is invalid
            emailError.style.display = "block"; // Show the email error message by setting its display style to "block"
            isValid = false; // Set the overall form validity flag to false since this field is invalid
        } 
        else 
            { // If the email is valid, hide the error message
            emailError.style.display = "none"; //   Hide the email error message by setting its display style to "none"
        }

        // Phone number validation
        // Must be digits only, 8 to 15 digits
        //Same as above, get the value of the phone input field and trim any whitespace from the beginning and end
        var phone = document.getElementById("phone").value.trim();
        var phoneError = document.getElementById("phoneError");
        var phoneRegex = /^\d{8,15}$/;
     
        if (!phoneRegex.test(phone)) 
            {
            phoneError.style.display = "block";
            isValid = false;
        } 
        else 
            {
            phoneError.style.display = "none";
        }

        // Password validation
        // Min 10 characters, must include uppercase, lowercase, digit, special char
        var password = document.getElementById("password").value; // Get the value of the password input field (no trim since we want to allow spaces if they are part of the password)
        var passwordError = document.getElementById("passwordError"); // Get the element where the password error message will be displayed
        var hasUpper = /[A-Z]/.test(password); // Check for uppercase letters using a regular expression that tests if there is at least one uppercase letter in the password string
        var hasLower = /[a-z]/.test(password); // Check for lowercase letters
        var hasDigit = /\d/.test(password); // Check for digits using a regular expression that tests if there is at least one digit in the password string
        var hasSpecial = /[!@#$%^&*(),.?":{}|<>_\-]/.test(password); // Check for special characters, including common ones and underscore/dash
      
        if (password.length < 10 || !hasUpper || !hasLower || !hasDigit || !hasSpecial) { // If the password is less than 10 characters long or does not contain at least one uppercase letter, one lowercase letter, one digit, and one special character, it is invalid
            passwordError.style.display = "block";
            isValid = false;
        } 
        else 
            {
            passwordError.style.display = "none";
        }

        // Confirm Password validation
        // Must match the password field
        //Same as above, get the value of the confirm password input field
        var confirmPassword = document.getElementById("confirmPassword").value;
        var confirmPasswordError = document.getElementById("confirmPasswordError");
        
        if (confirmPassword !== password) 
            {
            confirmPasswordError.style.display = "block";
            isValid = false;
        } 
        else 
            {
            confirmPasswordError.style.display = "none";
        }

        // Gender validation
        // A radio option must be selected
        var genderInputs = document.querySelectorAll("input[name='gender']"); // Get all radio buttons with the name "gender"
        var genderError = document.getElementById("genderError"); // Get the element where the gender error message will be displayed
        var genderSelected = false; // Initialize a flag to track whether a gender option has been selected, starts as false and will be set to true if any of the radio buttons are checked
        
        for (var i = 0; i < genderInputs.length; i++) { // Loop through each radio button to check if it is checked
            if (genderInputs[i].checked) { // If the current radio button is checked, set the genderSelected flag to true and break out of the loop since we only need one option to be selected
                genderSelected = true; 
                break; //break out of the loop since we have found a selected option and don't need to check the rest
            }
        }
        if (!genderSelected) { //if no gender
            genderError.style.display = "block"; // Show the gender error message by setting its display style to "block"
            isValid = false; // Set the overall form validity flag to false since this field is invalid
        } 
        else 
            { // If a gender option is selected, hide the error message  
            genderError.style.display = "none";
        }

        // Dietary preference validation
        var dietary = document.getElementById("dietaryPref").value; // Get the selected value from the dietary preference dropdown
        var dietaryError = document.getElementById("dietaryError"); // Get the element where the dietary preference error message will be displayed
        if (dietary === "") { // If the dietary preference value is an empty string, it means no option has been selected and the field is invalid
            dietaryError.style.display = "block"; // Show the dietary preference error message by setting its display style to "block"
            isValid = false; // Set the overall form validity flag to false since this field is invalid
        } 
        else 
            { // If a dietary preference is selected, hide the error message
            dietaryError.style.display = "none"; // Hide the dietary preference error message by setting its display style to "none"
        }

        // Country validation
        var country = document.getElementById("country").value; // Get the selected value from the country dropdown
        var countryError = document.getElementById("countryError"); // Get the element where the country error message will be displayed
        if (country === "") 
            { // If the country value is an empty string, it means no option has been selected and the field is invalid
            countryError.style.display = "block";
            isValid = false;
        } else {
            countryError.style.display = "none";
        }

        // If all fields passed, submit the form
        if (isValid) 
            {
            form.submit(); // If the isValid flag is still true after all validations, it means all fields are valid and we can submit the form programmatically using form.submit()
        }
    });
}


/*
   5. RESERVATION FORM
   - Pre-fills restaurant from URL query string
   - Dynamically updates deposit based on selected restaurant
   - Shows/hides voucher or card fields based on payment method
   - "Same as email" checkbox auto-fills billing email
   - Validates all required fields before submission
*/

// Deposit amounts for each restaurant (must match restaurants.html)
var depositAmounts = { 
    "La Trattoria": 20, //different restaurants have different deposit amounts, stored in an object for easy lookup based on restaurant name
    "Sakura Lounge": 50,
    "Urban Harvest": 25,
    "Casa Caliente": 10,
    "Spice Garden": 15,
    "Golden Dragon": 10
};

function initReservationForm() // function that gets called to set up the reservation form functionality, including pre-filling data, updating the deposit display, handling payment method changes, and validating the form on submission
{
    var form = document.getElementById("reservationForm"); // Get the reservation form element by its ID

    // Only run if we are on reservation.html
    if (!form) return; // If the reservation form doesn't exist on the page, exit the function to avoid errors

    var restaurantSelect = document.getElementById("restaurantChoice"); // Get the restaurant select dropdown element by its ID
    var depositDisplay = document.getElementById("depositDisplay"); // Get the element where the deposit amount will be displayed based on the selected restaurant
    var payVoucher = document.getElementById("payVoucher"); // Get the radio button element for paying with a voucher by its ID
    var payOnline = document.getElementById("payOnline"); // Get the radio button element for paying online by its ID
    var voucherSection = document.getElementById("voucherSection"); //  Get the section of the form that contains the voucher code input by its ID, which will be shown or hidden based on the selected payment method
    var cardSection = document.getElementById("cardSection"); // Get the section of the form that contains the card type dropdown by its ID, which will be shown or hidden based on the selected payment method
    var cardNumberSection = document.getElementById("cardNumberSection"); // Get the section of the form that contains the card number input by its ID, which will be shown or hidden based on the selected payment method
    var sameEmailCheckbox = document.getElementById("sameEmail"); // Get the checkbox element for "Same as email address" by its ID, which will be used to auto-fill the billing email field with the reservation email when checked

    // Pre-fill restaurant from URL (coming from restaurants or recommend page)
    var urlParams = new URLSearchParams(window.location.search); // Create a URLSearchParams object to easily access query parameters from the URL, which allows us to pre-fill the restaurant selection if the user came from a restaurant recommendation or listing page with a specific restaurant in mind
    var preselected = urlParams.get("restaurant"); // Get the value of the "restaurant" query parameter from the URL, which will be used to pre-select the restaurant in the dropdown and update the deposit display accordingly
    if (preselected && restaurantSelect) { // If there is a preselected restaurant from the URL and the restaurant select element exists on the page, set the select dropdown to that restaurant and update the deposit display to show the required deposit for that restaurant
        restaurantSelect.value = preselected; // Set the restaurant select dropdown to the preselected restaurant value from the URL, which will automatically select that restaurant in the dropdown when the page loads
        updateDepositDisplay(preselected); // Call the function to update the deposit display based on the preselected restaurant, which will show the user how much deposit is required for that restaurant right away when they land on the reservation page
    }

    // Update deposit display when restaurant changes 
    restaurantSelect.addEventListener("change", function() // Add a change event listener to the restaurant select dropdown so that whenever the user selects a different restaurant, the deposit display will update to show the required deposit for the newly selected restaurant
    { 
        updateDepositDisplay(this.value); // Call the function to update the deposit display, passing in the currently selected restaurant value from the dropdown (this.value) so that it can look up the correct deposit amount from the depositAmounts object and display it to the user
    });

    function updateDepositDisplay(restaurantName) // Function to update the deposit display based on the selected restaurant name, which looks up the deposit amount from the depositAmounts object and updates the text content of the depositDisplay element to show the user how much deposit is required for that restaurant 
    { 
        if (restaurantName && depositAmounts[restaurantName] !== undefined) // If a restaurant name is provided and there is a corresponding deposit amount in the depositAmounts object, update the deposit display to show the required deposit for that restaurant. If no restaurant is selected or if the restaurant does not have a defined deposit amount, show a default message prompting the user to select a restaurant.
            { 
            depositDisplay.textContent = "$" + depositAmounts[restaurantName] + " deposit required for " + restaurantName; // Set the text content of the depositDisplay element to show the required deposit amount for the selected restaurant, formatted as a dollar amount and including the restaurant name for clarity
        } 
        else 
            {
            depositDisplay.textContent = "Select a restaurant to see deposit amount.";// If no valid restaurant is selected, set the deposit display to a default message prompting the user to select a restaurant to see the deposit amount
        }
    }

    // Show/hide voucher or card fields based on payment method
    payVoucher.addEventListener("change", function() // Add a change event listener to the "Pay with Voucher" radio button so that when the user selects this payment method, the form will show the voucher code input section and hide the card type and card number sections, since those are not needed when paying with a voucher
    {
        if (this.checked) // If the "Pay with Voucher" radio button is checked, show the voucher section and hide the card sections
            { 
            voucherSection.classList.remove("hidden"); // Remove the "hidden" class from the voucherSection element to show it, allowing the user to enter their voucher code
            cardSection.classList.add("hidden"); //same as above
            cardNumberSection.classList.add("hidden");
        }
    });

    payOnline.addEventListener("change", function() // Add a change event listener to the "Pay Online" radio button so that when the user selects this payment method, the form will show the card type and card number sections and hide the voucher code section, since those are needed when paying online but not when using a voucher
    {
        if (this.checked) // If the "Pay Online" radio button is checked, show the card sections and hide the voucher section
            {
            cardSection.classList.remove("hidden");
            cardNumberSection.classList.remove("hidden");
            voucherSection.classList.add("hidden");
        }
    });

    // "Same as email address" checkbox
    sameEmailCheckbox.addEventListener("change", function() // Add a change event listener to the "Same as email address" checkbox so that when the user checks this box, the billing email field will be auto-filled with the value from the reservation email field and set to read-only, preventing the user from editing it. If the checkbox is unchecked, the billing email field will become editable again, allowing the user to enter a different email if they wish.
    {
        var billingEmail = document.getElementById("billingEmail"); // Get the billing email input field element by its ID, which is the field that will be auto-filled and set to read-only when the "Same as email address" checkbox is checked
        var resEmail = document.getElementById("resEmail").value;
        
        if (this.checked) // If the "Same as email address" checkbox is checked, set the billing email field's value to match the reservation email and make it read-only to prevent editing, ensuring that the billing email will be the same as the reservation email when this option is selected
            {
            billingEmail.value = resEmail; // Set the value of the billing email input field to match the value of the reservation email input field, effectively auto-filling it with the same email address that the user entered for their reservation contact information
            billingEmail.setAttribute("readonly", true); // Set the "readonly" attribute on the billing email input field to make it read-only, which prevents the user from changing the billing email when they have chosen to use the same email as the reservation email
        } 
        else 
            {
            billingEmail.removeAttribute("readonly"); // Remove the "readonly" attribute from the billing email input field to make it editable again, allowing the user to enter a different billing email if they uncheck the "Same as email address" checkbox
        }
    });

    // Form submission validation
    form.addEventListener("submit", function(e)  // Add a submit event listener to the reservation form to validate all required fields before allowing the form to be submitted. This validation checks that all fields are filled out correctly according to the specified requirements, and if any field is invalid, it prevents the form from submitting and shows appropriate error messages next to each invalid field.
    {
        e.preventDefault(); // Prevent the form from submitting by default so that we can perform validation checks before allowing submission. If any validation fails, we will not call form.submit() and the user will have a chance to correct their input based on the error messages displayed.
        var isValid = true; // Flag to track overall form validity, starts as true and will be set to false if any field fails validation

        // Full name - must not be empty
        var fullName = document.getElementById("fullName").value.trim();// Get the value of the full name input field and trim any whitespace from the beginning and end to ensure we are validating the actual name input by the user without extra spaces
        var fullNameError = document.getElementById("fullNameError"); // Get the element where the full name error message will be displayed, which will be shown if the full name field is left empty
  
        if (fullName === "")  // If the full name value is an empty string after trimming, it means the user did not enter a valid name and the field is invalid
            {
            fullNameError.style.display = "block"; // Show the full name error message by setting its display style to "block", prompting the user to enter their full name since it is a required field for the reservation
            isValid = false; // Set the overall form validity flag to false since this field is invalid, which will prevent the form from being submitted until the user corrects this error by entering their full name
        } 
        else 
            {
            fullNameError.style.display = "none"; // If the full name field is not empty, hide the error message by setting its display style to "none", indicating that this field is valid and does not need correction
        }

        // Email - must be valid format
        var resEmail = document.getElementById("resEmail").value.trim(); //same as above
        var resEmailError = document.getElementById("resEmailError");
        var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Regular expression to validate that the email follows a standard format (contains an "@" symbol and a domain), which is used to check if the reservation email entered by the user is in a valid format before allowing the form to be submitted
       
        if (!emailRegex.test(resEmail))  // If the reservation email does not match the regular expression, it is invalid and we need to show an error message prompting the user to enter a valid email address in the correct format
            {
            resEmailError.style.display = "block";
            isValid = false;
        } 
        else 
            {
            resEmailError.style.display = "none";
        }

        // Phone - at least 10 digits
        var resPhone = document.getElementById("resPhone").value.trim(); // Get the value of the reservation phone input field and trim any whitespace from the beginning and end to ensure we are validating the actual phone number input by the user without extra spaces. The validation will check that there are at least 10 digits in the phone number, which is a common requirement for valid phone numbers in many regions.
        var resPhoneError = document.getElementById("resPhoneError"); // Get the element where the reservation phone error message will be displayed, which will be shown if the phone number entered by the user does not contain at least 10 digits, indicating that it is not a valid phone number for contact purposes
        var digits = resPhone.replace(/\D/g, ""); // Remove all non-digit characters from the phone number input to count only the digits, which allows the user to enter their phone number with spaces, dashes, or parentheses for formatting without affecting the validation of whether there are at least 10 digits present in the phone number
        
        if (digits.length < 10) //checks if the length of the digits-only version of the phone number is less than 10, which would indicate that the phone number is not valid and we need to show an error message prompting the user to enter a valid phone number with at least 10 digits for contact purposes
            {
            resPhoneError.style.display = "block";
            isValid = false; 
        } 
        else 
            {
            resPhoneError.style.display = "none";
        }

        // Restaurant - must be selected
        var restaurant = restaurantSelect.value;
        var restaurantError = document.getElementById("restaurantError");
        
        if (restaurant === "") 
            {
            restaurantError.style.display = "block";
            isValid = false;
        } 
        else 
            {
            restaurantError.style.display = "none";
        }

        // Date - must not be in the past
        var dateInput = document.getElementById("reservationDate").value;
        var dateError = document.getElementById("dateError");
        var today = new Date(); // Create a new Date object representing the current date and time, which will be used to compare against the selected reservation date to ensure that the user cannot select a date in the past for their reservation. We will set the time of today's date to midnight to ensure that we are only comparing the date portion and not the time when validating that the selected reservation date is not in the past. This allows the user to select today's date or any future date for their reservation, but not a date that has already passed.
        today.setHours(0, 0, 0, 0); // Set the time of today's date to midnight to ensure that we are only comparing the date portion and not the time when validating that the selected reservation date is not in the past. This allows the user to select today's date or any future date for their reservation, but not a date that has already passed.
     
        if (dateInput === "") 
            {
            dateError.style.display = "block";
            isValid = false;
        } 
        else 
            {
            var selectedDate = new Date(dateInput); // Create a new Date object from the selected date input value, which will be used to compare against today's date to validate that the user has selected a reservation date that is not in the past. The date input value is typically in the format "YYYY-MM-DD", and when we create a Date object from it, it will represent that specific date at midnight. We can then compare this selectedDate to today's date (with time set to midnight) to ensure that the reservation date is valid.
             
            if (selectedDate < today)  // If the selected reservation date is earlier than today's date (with time set to midnight), it means the user has selected a date in the past, which is not valid for a reservation. In this case, we will show an error message prompting the user to select a valid date that is today or in the future for their reservation.
                {
                dateError.style.display = "block"; 
                isValid = false;
            } 
            else 
                {
                dateError.style.display = "none";
            }
        }

        // Time - must not be empty
        var timeInput = document.getElementById("reservationTime").value;
        var timeError = document.getElementById("timeError");
  
        if (timeInput === "") 
            {
            timeError.style.display = "block";
            isValid = false;
        } 
        else 
            {
            timeError.style.display = "none";
        }

        // Guests - must be greater than 0
        var guests = parseInt(document.getElementById("guests").value);
        var guestsError = document.getElementById("guestsError");
       
        if (isNaN(guests) || guests < 1) // If the guests value is not a number (NaN) or is less than 1, it means the user has not entered a valid number of guests for the reservation. In this case, we will show an error message prompting the user to enter a valid number of guests that is at least 1, since a reservation cannot be made for zero or a negative number of guests.
            {
            guestsError.style.display = "block";
            isValid = false;
        } 
        else 
            {
            guestsError.style.display = "none";
        }

        // Payment method - must be selected
        var paymentError = document.getElementById("paymentError");

        if (!payVoucher.checked && !payOnline.checked)  // If neither the "Pay with Voucher" nor the "Pay Online" radio buttons are checked, it means the user has not selected a payment method for their reservation. In this case, we will show an error message prompting the user to select a payment method before they can submit their reservation, since a payment method is required to complete the reservation process.
            {
            paymentError.style.display = "block";
            isValid = false;
        } 
        else 
            {
            paymentError.style.display = "none";
        }

        // Card number validation (only if online payment selected)
        if (payOnline.checked) 
            {
            var cardNumber = document.getElementById("cardNumber").value.replace(/\s/g, ""); // Get the value of the card number input field and remove all whitespace characters (spaces) to validate only the digits of the card number, which allows the user to enter their card number with spaces for readability without affecting the validation of whether the card number has the correct number of digits based on the selected card type (Visa/Mastercard or Amex)
            var cardType = document.getElementById("cardType").value; // Get the selected value from the card type dropdown, which will be used to determine the required number of digits for the card number validation. Visa and Mastercard typically require 16 digits, while American Express (Amex) requires 15 digits. We will validate the card number based on the selected card type to ensure that the user has entered a valid card number format for their chosen payment method.
            var cardError = document.getElementById("cardError"); // Get the element where the card number error message will be displayed, which will be shown if the card number entered by the user does not have the correct number of digits based on the selected card type, indicating that it is not a valid card number format for online payment. The validation will check that Visa and Mastercard numbers are 16 digits long, while Amex numbers are 15 digits long, and show an error message if the entered card number does not meet these requirements.
            var cardValid = false;

            // Visa and Mastercard require 16 digits, Amex requires 15 digits
            if ((cardType === "visa" || cardType === "mastercard") && /^\d{16}$/.test(cardNumber)) // If the selected card type is Visa or Mastercard and the card number consists of exactly 16 digits (after removing spaces), then the card number is considered valid for those card types
                {
                cardValid = true; // Set the cardValid flag to true if the card number meets the requirements for Visa or Mastercard, which means it has 16 digits and the user has selected either Visa or Mastercard as the card type
            } 
            else if (cardType === "amex" && /^\d{15}$/.test(cardNumber)) // If the selected card type is American Express (Amex) and the card number consists of exactly 15 digits (after removing spaces), then the card number is considered valid for Amex
                {
                cardValid = true;
            }

            if (!cardValid) 
                {
                cardError.style.display = "block";
                isValid = false;
            } 
            else 
                {
                cardError.style.display = "none";
            }
        }

        // Billing email - must be valid
        var billingEmail = document.getElementById("billingEmail").value.trim(); // Get the value of the billing email input field and trim any whitespace from the beginning and end to ensure we are validating the actual email address input by the user without extra spaces. The validation will check that the billing email is in a valid format, which is important for sending payment confirmations or receipts to the correct email address. We will use a regular expression to validate that the billing email follows a standard email format (contains an "@" symbol and a domain) before allowing the form to be submitted.
        var billingEmailError = document.getElementById("billingEmailError"); // Get the element where the billing email error message will be displayed, which will be shown if the billing email entered by the user does not follow a valid email format, indicating that it is not a valid email address for billing purposes. The validation will check that the billing email contains an "@" symbol and a domain, which are common requirements for a valid email address format.
       
        if (!emailRegex.test(billingEmail)) 
            {
            billingEmailError.style.display = "block";
            isValid = false;
        } 
        else 
            {
            billingEmailError.style.display = "none";
        }

        // If all valid, submit the form
        if (isValid) {
            form.submit();
        }
    });
}


/*
   6. BILL CALCULATOR (bill.html - Bonus Task)
   Calculates an estimated bill based on restaurant base price,
   group size, optional extras, and service charge.
   Updates dynamically when the button is clicked.
*/

function initBillCalculator() 
{
    var calcBtn = document.getElementById("calcBillBtn"); // Get the calculate bill button element by its ID, which will be used to trigger the bill calculation when clicked. This function will set up the event listener for the button and perform the necessary calculations to estimate the total bill based on the user's selections for restaurant, group size, optional extras, and service charge. The results will be displayed in a breakdown format showing how the total was calculated.

    // Only run if we are on bill.html
    if (!calcBtn) return; // If the calculate bill button doesn't exist on the page, exit the function to avoid errors

    calcBtn.addEventListener("click", function() // Add a click event listener to the calculate bill button so that when the user clicks this button, the function will perform the bill calculation based on the current selections and inputs in the form, and then display the breakdown of the bill calculation along with the estimated total amount. This allows the user to see how their choices for restaurant, group size, optional extras, and service charge affect their estimated bill before they finalize their reservation or order.
    {
        var restaurantSelect = document.getElementById("billRestaurant");
        var selectedOption = restaurantSelect.options[restaurantSelect.selectedIndex]; // Get the currently selected option from the restaurant select dropdown, which will allow us to access the data attributes associated with that option, such as the base price per person for the selected restaurant. This is important for calculating the base cost of the bill based on the restaurant choice before adding any optional extras or service charges.

        // Get base price per person from data attribute
        var basePricePerPerson = parseFloat(selectedOption.getAttribute("data-base")) || 0; // Get the base price per person for the selected restaurant from the data attribute "data-base" of the selected option in the dropdown. This value will be used as the starting point for calculating the total bill based on the number of people in the group and any optional extras they choose. If the data attribute is not set or cannot be parsed as a float, it will default to 0 to prevent errors in the calculation.
        var restaurantName = restaurantSelect.value;

        // Get group size
        var groupSize = parseInt(document.getElementById("groupSize").value) || 1; // Get the value of the group size input field and parse it as an integer to use in the bill calculation. This represents the number of people in the group for the reservation or order, and it will be multiplied by the base price per person to calculate the base cost of the bill. If the input is empty or cannot be parsed as an integer, it will default to 1 to ensure that we have a valid group size for the calculation, since a reservation or order must be for at least one person.
        if (groupSize < 1) groupSize = 1;

        // Base food cost
        var baseTotal = basePricePerPerson * groupSize;

        // Optional extras
        var dish1 = document.getElementById("dish1").checked ? 15 * groupSize : 0;  // Drinks per person
        var dish2 = document.getElementById("dish2").checked ? 12 : 0;              // Dessert platter (flat)
        var dish3 = document.getElementById("dish3").checked ? 25 : 0;              // Floral centrepiece (flat)
        var dish4 = document.getElementById("dish4").checked ? 10 * groupSize : 0;  // Champagne per person

        var extrasTotal = dish1 + dish2 + dish3 + dish4; // Calculate the total cost of the optional extras based on which checkboxes are selected. The drinks and champagne are calculated per person, so they are multiplied by the group size, while the dessert platter and floral centrepiece are flat fees that do not depend on the number of people. The total cost of the extras will be added to the base cost to calculate the subtotal before any service charge is applied.

        // Subtotal before service
        var subtotal = baseTotal + extrasTotal; 

        // Optional service charge (10%)
        var includeService = document.getElementById("includeService").checked;
        var serviceCharge = includeService ? subtotal * 0.10 : 0;

        // Grand total
        var grandTotal = subtotal + serviceCharge;

      
        var breakdown = ""; // Initialize an empty string to build the HTML content for the breakdown of the bill calculation, which will include details about the selected restaurant, base cost, optional extras, subtotal, and service charge. This breakdown will be displayed to the user to show how the estimated total was calculated based on their selections and inputs in the form.

        if (restaurantName === "") // If no restaurant is selected, show an alert and exit the function to prevent performing the bill calculation without a valid restaurant choice, since the base price per person is essential for calculating the total bill. This ensures that the user is prompted to select a restaurant before they can see the breakdown of their estimated bill.
            {
            alert("Please select a restaurant first.");
            return;
        }

        breakdown += "<p><strong>" + restaurantName + "</strong></p>"; // Add the selected restaurant name to the breakdown as a header, which helps the user see which restaurant they are calculating the bill for at a glance when viewing the breakdown of their estimated bill.
        breakdown += "<p>Base cost: $" + basePricePerPerson.toFixed(2) + " × " + groupSize + " people = <strong>$" + baseTotal.toFixed(2) + "</strong></p>"; // Add the base cost calculation to the breakdown, showing the base price per person, the group size, and the resulting total base cost for the bill. This helps the user understand how the base cost is calculated based on their restaurant choice and group size when they view the breakdown of their estimated bill.

        if (dish1 > 0) breakdown += "<p>Drinks Package: <strong>$" + dish1.toFixed(2) + "</strong></p>"; // If the drinks package is selected (dish1 > 0), add a line to the breakdown showing the cost of the drinks package, which is calculated based on the group size. This allows the user to see how much the optional drinks package is adding to their estimated bill in the breakdown section.
        if (dish2 > 0) breakdown += "<p> Dessert Platter: <strong>$" + dish2.toFixed(2) + "</strong></p>"; // If the dessert platter is selected (dish2 > 0), add a line to the breakdown showing the cost of the dessert platter, which is a flat fee. This allows the user to see how much the optional dessert platter is adding to their estimated bill in the breakdown section.
        if (dish3 > 0) breakdown += "<p> Floral Centrepiece: <strong>$" + dish3.toFixed(2) + "</strong></p>"; 
        if (dish4 > 0) breakdown += "<p> Champagne Toast: <strong>$" + dish4.toFixed(2) + "</strong></p>";

        breakdown += "<p>Subtotal: <strong>$" + subtotal.toFixed(2) + "</strong></p>"; // Add the subtotal (base cost + extras) to the breakdown, showing the user the total cost before any service charge is applied. This helps the user understand how much their estimated bill is before considering the optional service charge when they view the breakdown of their estimated bill.

        if (includeService) 
            {
            breakdown += "<p>Service charge (10%): <strong>$" + serviceCharge.toFixed(2) + "</strong></p>"; // If the optional service charge is included, add a line to the breakdown showing the amount of the service charge, which is calculated as 10% of the subtotal. This allows the user to see how much the optional service charge is adding to their estimated bill in the breakdown section if they choose to include it.
        }

        // Show the breakdown section
        var breakdownDiv = document.getElementById("billBreakdown"); // Get the element where the breakdown of the bill calculation will be displayed by its ID, which is the section of the page that will show the detailed breakdown of how the estimated total was calculated based on the user's selections and inputs in the form. We will set the innerHTML of this element to the breakdown string we built, which contains all the details of the calculation, and then make sure this section is visible to the user so they can review how their estimated bill was calculated.
        document.getElementById("breakdownDetails").innerHTML = breakdown;
        document.getElementById("billTotal").textContent = "Estimated Total: $" + grandTotal.toFixed(2); // Update the text content of the element that shows the estimated total amount to reflect the calculated grand total based on the user's selections and inputs in the form. This allows the user to see the final estimated total for their bill after all calculations are done when they view the breakdown of their estimated bill.
        breakdownDiv.classList.remove("hidden");
    });
}


/*
   INITIALISE ALL FUNCTIONS
   Run setup functions when the page is fully loaded.
*/
window.onload = function() { // Set up an event listener for when the window has finished loading, which will call the function to initialize all the features of the page. This ensures that all the DOM elements are fully loaded and available before we try to access them in our JavaScript code, preventing errors and ensuring that all interactive features are properly set up and ready for the user to interact with when they visit the page.
    highlightActiveNav(); 
    initRestaurantFilters();
    initRecommendations();
    initRegisterForm();
    initReservationForm();
    initBillCalculator();
};
