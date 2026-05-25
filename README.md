# wd_assign2

TableGlimpse - COS10005 Web Development Assignment 2
Student: Christabella Vedy
Semester 1, 2026

WEBSITE STRUCTURE

assignment2/
- html/
 - index.html: Home page - introduces the platform, target users, services, and features
 - restaurants.html: Restaurant listing - 6 restaurants with full details, filterable by cuisine/price
 - recommend.html: Recommendation page - rule-based logic suggests a restaurant from user preferences
 - register.html: Registration form with full JavaScript validation
 - reservation.html: Reservation form with deposit logic, conditional payment fields, and JS validation
 - bill.html: Estimated bill calculator - dynamically calculates group dining costs

- css/
 - style.css: External stylesheet applied to all pages; includes responsive design

- js/
 - script.js: All JavaScript logic - validation, filters, recommendations, bill calculator

 - images/:
  - Folder for all restaurant and site images 
 
- Readme.txt:
 - This file

GITHUB && MERCURY

Link to Github Repostiity: https://github.com/TechICO-i/wd_assign2

Link to Mercury: 


JAVASCRIPT VALIDATION LOGIC

REGISTRATION FORM (register.html):
1. Username: must be at least 5 characters long, and can only contain letters (a–z, A–Z), numbers (0–9), and underscores (_). Any other characters or length below 5 will show an error.
2. Email: must follow a standard email format (something@domain.com). If it doesn't contain @ and a dot after it, an error is shown.
3. Phone number: must contain only digits and be between 8 and 15 digits long. Letters or symbols will trigger an error.
4. Password: must be at least 10 characters and include at least one uppercase letter, one lowercase letter, one number, and one special character (e.g. !, @, #). If any of these are missing, an error is shown.
5. Confirm Password: must exactly match the Password field. If they differ, an error is displayed.
6. Gender: at least one radio button must be selected. If none is selected, an error appears.
7. Dietary Preference: must be selected from the dropdown (not the default blank option).
8. Country/Region: must be selected from the dropdown (not the default blank option).

If any field fails, the form submission is blocked and errors are displayed next to the relevant field. The form only submits once all fields pass validation.

RESERVATION FORM (reservation.html):
1. Full Name: must not be empty.
2. Email Address: must be in a valid email format.
3. Phone Number: the digits-only portion must be at least 10 digits.
4. Restaurant: a restaurant must be selected from the dropdown.
5. Reservation Date: must be selected and must not be a past date (compared to today's date).
6. Reservation Time: must not be empty.
7. Number of Guests: must be a number greater than zero.
8. Payment Method: at least one payment method (Voucher or Online Payment) must be selected.
   - If Voucher is chosen, a text box appears for a 12-digit voucher code (no validation required).
   - If Online Payment is chosen, credit card fields appear. The card number must match the expected digit count: 16 digits for Visa/Mastercard, 15 digits for Amex.
9. Billing Email: must be a valid email format. If the "Same as email address" checkbox is ticked, this field is auto-filled with the email entered above.

Form submission is blocked if any required field fails. Error messages appear clearly below each field.

RESTAURANT FILTER (restaurants.html):
- Two dropdowns let users filter by Cuisine and Price Range.
- When a filter changes, the script loops through all restaurant cards and hides those that don't match.
- A "No results" message is shown if no cards match.
- A Reset button resets both dropdowns to "All" and shows all cards again.

RECOMMENDATION LOGIC (recommend.html):
- The user selects dietary preference, budget range, and dining purpose.
- The script compares these selections against a list of 6 restaurant objects.
- Each restaurant is scored: dietary match = 3 points, budget match = 2 points, purpose match = 1 point.
- The highest-scoring restaurant is displayed with its details and a link to the reservation page pre-filled with that restaurant.
- If no restaurant matches at all (score = 0), a fallback message is shown.

BILL CALCULATOR (bill.html):
- The user selects a restaurant (each has a base average price per person), enters group size, and optionally checks extras.
- Extras include per-person items (drinks, champagne) and flat-fee items (dessert platter, centrepiece).
- A 10% service charge is optionally added.
- Clicking the Calculate button displays a full breakdown and estimated grand total.
- The "active" nav link is highlighted on all pages by reading the current filename from the URL and adding a CSS class.


REFERENCES 
- Restaurant descriptions are original.
- No external JavaScript libraries were used.
- CSS and JS written from scratch based on COS10005 lecture material.
