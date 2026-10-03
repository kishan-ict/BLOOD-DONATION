# LifeLink — Blood Donation Project

A responsive donor interest-registration prototype built with HTML5, CSS, Bootstrap, and JavaScript.

## Features

- First-visit welcome letter and sample hospital listings.
- Required donor form with an 18+ age rule and conditional blood-group question.
- Downloadable and shareable donor interest card.
- Optional Google Sheets submission endpoint.
- Password-gated admin dashboard for viewing, searching, refreshing, and signing out of donor records.

See [GOOGLE_SHEETS_SETUP.md](GOOGLE_SHEETS_SETUP.md) to connect the Sheet, deploy Apps Script, and configure the admin password privately.

## Run locally

Open `index.html` or serve this folder with a static web server. Bootstrap and the card-image library load from CDNs and require an internet connection.

## Data handling

Until an Apps Script web app URL is set in `config.js`, the form does not save or send donor data and the Admin link stays hidden. Once configured, submissions are appended to the private [LifeLink Donor Registrations Sheet](https://docs.google.com/spreadsheets/d/1DG0suFdcrkg0OvDNtCsWg-3EM7pui2_OneiUc8W1s8Y/edit). The browser cannot verify Apps Script's response body, so confirm each row in the Sheet. Keep the Sheet private and collect real donor data only with consent. This prototype is not a medical eligibility or appointment system.

Sample hospital names must be replaced with confirmed partners. Donation eligibility and appointments belong to qualified donation-centre staff.
