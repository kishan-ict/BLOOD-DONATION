# Connect LifeLink to Google Sheets and open the admin page

The private donor sheet is ready: https://docs.google.com/spreadsheets/d/1DG0suFdcrkg0OvDNtCsWg-3EM7pui2_OneiUc8W1s8Y/edit

## Set up Apps Script

1. Open the Sheet and choose **Extensions → Apps Script**.
2. Replace the starter contents of `Code.gs` with [google-apps-script/Code.gs](google-apps-script/Code.gs).
3. Add an HTML file in Apps Script named **Admin** (without the .html extension) and paste the contents of [google-apps-script/Admin.html](google-apps-script/Admin.html).
4. In Apps Script, open **Project Settings → Script properties → Add script property**. Set the property name to `ADMIN_PASSWORD` and enter your chosen password as its value. Do not put the password in GitHub or in `config.js`.
5. Choose **Deploy → New deployment → Web app**. Set **Execute as** to **Me**, and **Who has access** to **Anyone** for public donor submissions. Google will ask you to authorize the script.
6. Deploy and copy the URL ending in `/exec`.
7. Paste that URL into `googleSheetsEndpoint` in `config.js`, commit and push to `main`. The Admin link appears after GitHub Pages redeploys.
8. After each Apps Script code change, create a new deployment version (or edit the existing deployment) so the live web app uses the updated code.

The script appends DOB in column J. Add `Date of birth (DOB)` as the header in cell J1 if your sheet does not already have that column.

## Admin page

Use the **Admin** link on the site, or open the deployed web app URL with `?page=admin`. The admin dashboard asks for the password, then displays all saved donor details newest first. It includes search, refresh, and sign out. The password stays in Apps Script Script Properties; donor rows are returned only after server-side password verification and a short-lived session check.

## Data and privacy

Keep the spreadsheet private; do not set general access to “Anyone.” The public web app is needed for the GitHub Pages form to submit without donor sign-in. The endpoint appends validated entries and has basic bot filtering and rate limits, but any public form can receive unwanted submissions. The browser cannot verify Apps Script's response body, so confirm a test row appears in the Sheet before relying on a submission. This prototype is not a medical eligibility or appointment system. Use a stronger authentication system for real sensitive donor records.
