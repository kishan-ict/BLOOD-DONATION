
function doGet(e) {
  const page = e && e.parameter ? e.parameter.page : '';
  if (page === 'admin') {
    return HtmlService.createHtmlOutputFromFile('Admin')
      .setTitle('LifeLink Donor Admin');
  }
  return HtmlService.createHtmlOutput('LifeLink submission service is ready.');
}

function adminLogin(password) {
  const expected = PropertiesService.getScriptProperties().getProperty('ADMIN_PASSWORD');
  if (!expected) {
    return { ok: false, message: 'Admin password is not configured in Apps Script project properties.' };
  }

  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(5000);
    const cache = CacheService.getScriptCache();
    const minuteKey = 'admin_login_attempts_' + Math.floor(Date.now() / 60000);
    const attempts = Number(cache.get(minuteKey) || 0);
    if (attempts >= 10) {
      return { ok: false, message: 'Too many sign-in attempts. Wait a minute and try again.' };
    }
    cache.put(minuteKey, String(attempts + 1), 90);
  } finally {
    if (lock.hasLock()) lock.releaseLock();
  }

  if (String(password || '') !== expected) {
    return { ok: false, message: 'Incorrect password.' };
  }
  const token = Utilities.getUuid() + Utilities.getUuid();
  CacheService.getScriptCache().put('admin_session_' + token, 'valid', 1800);
  return { ok: true, token: token };
}

function getDonorRegistrations(token) {
  if (!token || CacheService.getScriptCache().get('admin_session_' + token) !== 'valid') {
    return { ok: false, reauth: true, message: 'Your session expired. Please sign in again.' };
  }
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
    if (!sheet) throw new Error('Donor Registrations tab not found.');
    const lastRow = sheet.getLastRow();
    if (lastRow < 2) return { ok: true, rows: [] };
    const rows = sheet.getRange(2, 1, lastRow - 1, 9).getDisplayValues();
    return { ok: true, rows: rows.reverse() };
  } catch (error) {
    console.error(error);
    return { ok: false, message: 'Could not read donor records.' };
  }
}

const SPREADSHEET_ID = '1DG0suFdcrkg0OvDNtCsWg-3EM7pui2_OneiUc8W1s8Y';
const SHEET_NAME = 'Donor Registrations';
const MAX_SUBMISSIONS_PER_MINUTE = 30;

function doPost(e) {
  let lock;
  try {
    const payload = JSON.parse((e && e.postData && e.postData.contents) || '{}');

    // Honeypot for basic bot filtering. Never write the submitted value.
    if (String(payload.website || '').trim()) {
      return json_({ ok: true });
    }

    const name = clean_(payload.name, 80);
    const phone = clean_(payload.phone, 20);
    const address = clean_(payload.address, 240);
    const age = Number(payload.age);
    const knowsBloodGroup = payload.knowsBloodGroup === true;
    const bloodGroup = knowsBloodGroup ? clean_(payload.bloodGroup, 3) : 'Not known';
    const consent = payload.consent === true;
    const registrationId = clean_(payload.registrationId, 24);

    if (!name || !phone || !address || !consent || !Number.isInteger(age) || age < 18 || age > 100) {
      return json_({ ok: false, error: 'Please provide valid required fields and confirm consent.' });
    }
    if (!/^[0-9+() .-]{7,20}$/.test(phone)) {
      return json_({ ok: false, error: 'Invalid phone number.' });
    }
    if (knowsBloodGroup && !['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].includes(bloodGroup)) {
      return json_({ ok: false, error: 'Invalid blood group.' });
    }
    if (!/^LL-20\d{2}-[A-Z0-9]{6}$/.test(registrationId)) {
      return json_({ ok: false, error: 'Invalid registration ID.' });
    }

    lock = LockService.getScriptLock();
    lock.waitLock(5000);
    const cache = CacheService.getScriptCache();
    const minuteKey = 'submissions_' + Math.floor(Date.now() / 60000);
    const currentCount = Number(cache.get(minuteKey) || 0);
    if (currentCount >= MAX_SUBMISSIONS_PER_MINUTE) {
      return json_({ ok: false, error: 'Please try again later.' });
    }

    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = spreadsheet.getSheetByName(SHEET_NAME);
    if (!sheet) throw new Error('Donor Registrations tab not found.');

    sheet.appendRow([
      registrationId,
      new Date().toISOString(),
      safeCell_(name),
      safeCell_(phone),
      safeCell_(address),
      knowsBloodGroup ? 'Yes' : 'No',
      safeCell_(bloodGroup),
      age,
      'Yes'
    ]);
    cache.put(minuteKey, String(currentCount + 1), 90);
    return json_({ ok: true, registrationId: registrationId });
  } catch (error) {
    console.error(error);
    return json_({ ok: false, error: 'Submission could not be saved.' });
  } finally {
    if (lock && lock.hasLock()) lock.releaseLock();
  }
}

function clean_(value, maxLength) {
  return String(value == null ? '' : value).trim().replace(/[\u0000-\u001F\u007F]/g, '').slice(0, maxLength);
}

function safeCell_(value) {
  return /^[=+\-@]/.test(value) ? "'" + value : value;
}

function json_(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
