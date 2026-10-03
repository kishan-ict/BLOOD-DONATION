# LifeLink — Blood Donation Project

A responsive blood donation interest-registration prototype built with HTML5, CSS, Bootstrap, and JavaScript.

## Features

- First-visit welcome letter with continue, skip, and close actions.
- Home page with clearly marked sample hospitals.
- Required donor form with an 18+ age rule and conditional blood group selection.
- Downloadable and shareable donor interest card.
- Optional Google Sheets submission endpoint; setup instructions are in [GOOGLE_SHEETS_SETUP.md](GOOGLE_SHEETS_SETUP.md).

## Run locally

Open `index.html` or serve this folder with a static web server. Bootstrap and the card-image library load from CDNs and require an internet connection.

## Data handling

Until an Apps Script web app URL is set in `config.js`, the form does not save or send donor data. Once configured, the script appends submissions to the private [LifeLink Donor Registrations Sheet](https://docs.google.com/spreadsheets/d/1DG0suFdcrkg0OvDNtCsWg-3EM7pui2_OneiUc8W1s8Y/edit). The website cannot verify the response body from Apps Script, so check that each row appears in the Sheet. Keep the Sheet private; do not collect real donor data without consent. The form is not a medical eligibility or appointment system.

Sample hospital names must be replaced with confirmed partners. Donation eligibility and appointment decisions belong to qualified donation-centre staff.
