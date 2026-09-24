/**
 * Foresight Consulting — Platform Growth Audit form handler
 *
 * Stage 1: every application is written to the leads sheet.
 * Stage 2: flip SEND_EMAIL to true to also get a notification email.
 *
 * The sheet is the record of the lead, so a failed write returns
 * {"ok":false} and the website shows its red "that did not go through"
 * message — an applicant is never told they succeeded when nothing was saved.
 */

/* ---- Settings ----------------------------------------------------------- */

// "Profitcast X Foresight Consulting – Website Leads Tracker"
var SHEET_ID = '1kmbC5a7QviTZzXWLoRUlnVK1nQ2Sz3nz30Y5Q3Fl6ts';

// Stage 2 — set to true once the sheet is confirmed working.
var SEND_EMAIL = false;
var RECIPIENT  = 'foresight.consulting2025@gmail.com';

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

    // The sheet is the lead record. If this throws, the catch below reports
    // failure to the website rather than pretending the application landed.
    logToSheet_(p, suspected);

    // Notification only — the lead is already safely stored, so a mail
    // problem must not fail the submission.
    if (SEND_EMAIL) {
      try {
        sendMail_(p, suspected);
      } catch (mailErr) {
        console.error('Email failed (lead was still saved): ' + mailErr);
      }
    }

    return json_({ ok: true });

  } catch (err) {
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

/* ---- Email (stage 2) ---------------------------------------------------- */

function sendMail_(p, suspected) {
  var fields = [
    ['Name', p.name], ['Role', p.role], ['Brand', p.brand], ['City', p.city],
    ['Outlets', p.outlets], ['Monthly online sales', p.sales],
    ['Swiggy listing', p.swiggy], ['Zomato listing', p.zomato],
    ['Commercial challenge', p.challenge], ['90-day target', p.target],
    ['Phone', p.phone], ['Email', p.email]
  ];

  var body = fields.map(function (f) {
    return f[0] + ': ' + (clean_(f[1]) || '—');
  }).join('\n');

  body += '\n\n--\nSubmitted: ' + new Date().toString();
  body += '\nSaved to the leads sheet.';
  if (suspected) {
    body += '\n\n[FLAGGED] The hidden anti-bot field was filled in. Usually a '
          + 'bot, but a browser autofilling it looks identical. Read before '
          + 'discarding.';
  }

  var options = {
    to:      RECIPIENT,
    subject: (suspected ? '[Possible spam] ' : '') + 'Audit application — ' +
             (clean_(p.brand) || 'no brand given') +
             ' (' + (clean_(p.city) || 'no city given') + ')',
    body:    body,
    name:    'Foresight website'
  };

  var applicant = clean_(p.email);
  if (/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(applicant)) {
    options.replyTo = applicant;
  }

  MailApp.sendEmail(options);
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
   Select testSheetWrite in the editor's function dropdown and press Run. It
   grants the script permission to touch the sheet and proves access works,
   without needing the website at all. Delete the test row afterwards.
   -------------------------------------------------------------------------- */

function testSheetWrite() {
  logToSheet_({
    name: 'ZZ TEST ROW — delete me',
    role: 'test', brand: 'TEST', city: 'TEST', outlets: '1',
    sales: 'Under 2 lakh', swiggy: '', zomato: '',
    challenge: 'Editor test run', target: 'n/a',
    phone: '+910000000000', email: 'test@example.com', source: 'testSheetWrite'
  }, false);

  Logger.log('Row written to: ' +
             SpreadsheetApp.openById(SHEET_ID).getName());
}
