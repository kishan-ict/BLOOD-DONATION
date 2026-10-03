# Connect LifeLink to Google Sheets

The private donor sheet is ready: https://docs.google.com/spreadsheets/d/1DG0suFdcrkg0OvDNtCsWg-3EM7pui2_OneiUc8W1s8Y/edit

## Deploy the write endpoint

1. Open the sheet and choose **Extensions → Apps Script**.
2. Open [google-apps-script/Code.gs](google-apps-script/Code.gs) in this repository, copy its contents, and replace the starter code in Apps Script.
3. Save the Apps Script project.
4. Choose **Deploy → New deployment → Web app**.
5. Set **Execute as** to **Me**. For public donor submissions, set **Who has access** to **Anyone**. Google will ask you to authorize the script to append rows to this sheet.
6. Deploy and copy the web app URL ending in `/exec`.
7. Open `config.js` in this repository, paste the URL into `googleSheetsEndpoint`, commit, and push to `main`.
8. Wait for GitHub Pages to redeploy, then submit a test donor entry and check for its row in the sheet. Delete the test row afterward.

## Data and privacy

The spreadsheet itself should remain private; do not change its general access to “Anyone.” The web app endpoint is public so the static GitHub Pages form can submit without requiring each donor to sign in. It is limited to appending validated fields and includes a basic honeypot and rate limit, but a public endpoint can still receive unwanted submissions. Review the sheet regularly and only collect real donor details with consent. Do not use this prototype as a medical eligibility or appointment system.

The browser uses a no-CORS POST because Apps Script's Content Service redirects responses. The website therefore cannot verify the response body. After testing or when a donor submits, confirm the row appeared in the Sheet before treating it as received.
