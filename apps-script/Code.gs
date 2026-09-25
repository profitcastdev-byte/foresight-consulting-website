/**
 * Foresight Consulting — Platform Growth Audit form handler
 *
 * Writes every submission from contact.html into the leads sheet.
 * Sheet only: no email is sent, so the script asks for one permission
 * (Google Sheets) and nothing else.
 *
 * The sheet is the only record of a lead, so a failed write returns
 * {"ok":false} and the website shows its red "that did not go through"
 * message. An applicant is never told they succeeded when nothing was saved.
 */

/* ---- Settings ----------------------------------------------------------- */

// "Profitcast X Foresight Consulting – Website Leads Tracker"
var SHEET_ID = '1kmbC5a7QviTZzXWLoRUlnVK1nQ2Sz3nz30Y5Q3Fl6ts';

var HEADERS = ['Timestamp', 'Name', 'Role', 'Brand', 'City', 'Outlets',
               'Monthly online sales', 'Swiggy listing', 'Zomato listing',
               'Commercial challenge', '90-day target', 'Phone', 'Email',
               'Flagged', 'Source'];

/* ---- Handler ------------------------------------------------------------ */

function doPost(e) {
  try {
    var p = (e && e.parameter) || {};

    // The hidden anti-bot field. This does NOT discard the submission —
    // browsers sometimes autofill hidden fields, and silently binning a real
    // applicant is worse than an occasional flagged row you can scan past.
    var suspected = String(p.company_website || '').trim() !== '';

    logToSheet_(p, suspected);

    return json_({ ok: true });

  } catch (err) {
    // Shows up in the Executions log, and tells the website to display its
    // error message rather than a false "Application received".
    console.error('doPost failed: ' + err);
    return json_({ ok: false, error: String(err) });
  }
}

/* ---- Sheet -------------------------------------------------------------- */

function logToSheet_(p, suspected) {
  var sheet = SpreadsheetApp.openById(SHEET_ID).getSheets()[0];

  // Write the header row once, on the first submission.
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }

  sheet.appendRow([
    new Date(),
    clean_(p.name),
    clean_(p.role),
    clean_(p.brand),
    clean_(p.city),
    clean_(p.outlets),
    clean_(p.sales),
    clean_(p.swiggy),
    clean_(p.zomato),
    clean_(p.challenge),
    clean_(p.target),
    "'" + clean_(p.phone),   // leading quote keeps +91… as text, not a formula
    clean_(p.email),
    suspected ? 'possible spam' : '',
    clean_(p.source) || 'unknown'
  ]);
}

function clean_(v) {
  return String(v == null ? '' : v).trim();
}

/* ---- Helpers ------------------------------------------------------------ */

function json_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/* Opening the /exec URL in a browser confirms the deployment is live. */
function doGet() {
  return json_({ ok: true, status: 'Foresight audit form endpoint is live' });
}

/* ---- Run this first ------------------------------------------------------
   Pick testSheetWrite in the editor's function dropdown and press Run. It
   grants the sheet permission and proves access works, without needing the
   website or a deployment. Delete the test row afterwards.
   -------------------------------------------------------------------------- */

function testSheetWrite() {
  logToSheet_({
    name: 'ZZ TEST ROW — delete me',
    role: 'test', brand: 'TEST', city: 'TEST', outlets: '1',
    sales: 'Under 2 lakh', swiggy: '', zomato: '',
    challenge: 'Editor test run', target: 'n/a',
    phone: '+910000000000', email: 'test@example.com', source: 'testSheetWrite'
  }, false);

  Logger.log('Row written to: ' + SpreadsheetApp.openById(SHEET_ID).getName());
}
