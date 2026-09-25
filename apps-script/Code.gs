/**
 * Foresight Consulting — Platform Growth Audit form handler
 *
 * Every submission from contact.html is written to the leads sheet and then
 * emailed as a notification.
 *
 * The sheet is the record of the lead. A failed write returns {"ok":false}
 * and the website shows its red "that did not go through" message, so an
 * applicant is never told they succeeded when nothing was saved. The email is
 * only a notification, so a mail fault is logged and swallowed — the lead is
 * already safe by then.
 */

/* ---- Settings ----------------------------------------------------------- */

// "Profitcast X Foresight Consulting – Website Leads Tracker"
var SHEET_ID = '1kmbC5a7QviTZzXWLoRUlnVK1nQ2Sz3nz30Y5Q3Fl6ts';

var RECIPIENT = 'foresight.consulting2025@gmail.com';

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

    // Must succeed: this is the lead record.
    logToSheet_(p, suspected);

    // Notification only. The row is already stored, so a mail problem must
    // not turn a saved application into a failure for the applicant.
    try {
      sendMail_(p, suspected);
    } catch (mailErr) {
      console.error('Email failed, but the lead was saved to the sheet: ' + mailErr);
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

/* ---- Email -------------------------------------------------------------- */

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
  body += '\nSaved to: ' + SpreadsheetApp.openById(SHEET_ID).getUrl();
  if (suspected) {
    body += '\n\n[FLAGGED] The hidden anti-bot field was filled in. Usually a '
          + 'bot, but a browser autofilling it looks identical. Read before '
          + 'discarding — the row is in the sheet either way.';
  }

  var options = {
    to:      RECIPIENT,
    subject: (suspected ? '[Possible spam] ' : '') + 'Audit application — ' +
             (clean_(p.brand) || 'no brand given') +
             ' (' + (clean_(p.city) || 'no city given') + ')',
    body:    body,
    name:    'Foresight website'
  };

  // Reply-To set to the applicant, so hitting Reply reaches them directly.
  var applicant = clean_(p.email);
  if (/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(applicant)) {
    options.replyTo = applicant;
  }

  MailApp.sendEmail(options);
}

/* ---- Helpers ------------------------------------------------------------ */

function clean_(v) {
  return String(v == null ? '' : v).trim();
}

function json_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/* Opening the /exec URL in a browser confirms the deployment is live. */
function doGet() {
  return json_({ ok: true, status: 'Foresight audit form endpoint is live' });
}

/* ---- Editor test runs ----------------------------------------------------
   Run sendTestEmail once after pasting this in. It triggers the new mail
   permission prompt and proves delivery, without needing the website.
   -------------------------------------------------------------------------- */

function sendTestEmail() {
  MailApp.sendEmail(
    RECIPIENT,
    'Foresight form — test email',
    'If you are reading this, the script can send mail to ' + RECIPIENT + '.\n\n' +
    'Remaining MailApp quota today: ' + MailApp.getRemainingDailyQuota()
  );
  Logger.log('Test email sent to ' + RECIPIENT);
}

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
