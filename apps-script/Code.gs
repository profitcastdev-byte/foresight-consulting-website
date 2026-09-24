/**
 * Foresight Consulting — Platform Growth Audit form handler
 *
 * Receives POSTs from contact.html and emails each application to RECIPIENT.
 * Returns {"ok":true} only when the mail was actually sent; any failure returns
 * {"ok":false}, which makes the website show its red "that did not go through"
 * message instead of a false "Application received".
 */

/* ---- Settings ----------------------------------------------------------- */

var RECIPIENT = 'foresight.consulting2025@gmail.com';

// Durable backup — "Profitcast X Foresight Consulting – Website Leads Tracker".
// Every application is written here as well as emailed, so a failed or deleted
// email cannot lose a lead. Set to '' to disable and email only.
var SHEET_ID = '1kmbC5a7QviTZzXWLoRUlnVK1nQ2Sz3nz30Y5Q3Fl6ts';

/* ---- Handler ------------------------------------------------------------ */

function doPost(e) {
  try {
    var p = (e && e.parameter) || {};

    // The hidden anti-bot field. Note this does NOT discard the submission —
    // browsers sometimes autofill hidden fields, and silently binning a real
    // applicant is worse than seeing an occasional flagged email.
    var suspected = String(p.company_website || '').trim() !== '';

    var rows = [
      ['Name',                 p.name],
      ['Role',                 p.role],
      ['Brand',                p.brand],
      ['City',                 p.city],
      ['Outlets',              p.outlets],
      ['Monthly online sales', p.sales],
      ['Swiggy listing',       p.swiggy],
      ['Zomato listing',       p.zomato],
      ['Commercial challenge', p.challenge],
      ['90-day target',        p.target],
      ['Phone',                p.phone],
      ['Email',                p.email]
    ];

    var body = rows.map(function (r) {
      return r[0] + ': ' + (String(r[1] == null ? '' : r[1]).trim() || '—');
    }).join('\n');

    body += '\n\n--\nSubmitted: ' + new Date().toString();
    body += '\nSource: ' + (String(p.source || '').trim() || 'unknown');
    if (suspected) {
      body += '\n\n[FLAGGED] The hidden anti-bot field was filled in. This is '
            + 'usually a bot, but a browser autofilling the field would look '
            + 'identical. Read it before discarding.';
    }

    var brand = String(p.brand || '').trim() || 'no brand given';
    var city  = String(p.city  || '').trim() || 'no city given';

    var options = {
      to:      RECIPIENT,
      subject: (suspected ? '[Possible spam] ' : '') +
               'Audit application — ' + brand + ' (' + city + ')',
      body:    body,
      name:    'Foresight website'
    };

    // Reply-To set to the applicant, so hitting Reply reaches them directly.
    var applicant = String(p.email || '').trim();
    if (/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(applicant)) {
      options.replyTo = applicant;
    }

    MailApp.sendEmail(options);

    // Backup is best-effort: a sheet problem must not fail a sent application.
    if (SHEET_ID) {
      try {
        logToSheet_(p, suspected);
      } catch (sheetErr) {
        console.error('Sheet backup failed: ' + sheetErr);
      }
    }

    return json_({ ok: true });

  } catch (err) {
    // Surfaces in Executions, and tells the website to show the error message.
    console.error('doPost failed: ' + err);
    return json_({ ok: false, error: String(err) });
  }
}

/* ---- Helpers ------------------------------------------------------------ */

function logToSheet_(p, suspected) {
  var sheet = SpreadsheetApp.openById(SHEET_ID).getSheets()[0];
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['Timestamp', 'Name', 'Role', 'Brand', 'City', 'Outlets',
                     'Sales', 'Swiggy', 'Zomato', 'Challenge', 'Target',
                     'Phone', 'Email', 'Flagged']);
  }
  sheet.appendRow([new Date(), p.name, p.role, p.brand, p.city, p.outlets,
                   p.sales, p.swiggy, p.zomato, p.challenge, p.target,
                   p.phone, p.email, suspected ? 'possible spam' : '']);
}

function json_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/* Opening the /exec URL in a browser confirms the deployment is live, instead
   of the "Script function not found: doGet" error the old one returned. */
function doGet() {
  return json_({ ok: true, status: 'Foresight audit form endpoint is live' });
}

/* Run this once from the editor to grant permissions and prove mail works. */
function sendTestEmail() {
  MailApp.sendEmail(
    RECIPIENT,
    'Foresight form — test email',
    'If you are reading this, the script can send mail to ' + RECIPIENT + '.\n\n' +
    'Remaining MailApp quota today: ' + MailApp.getRemainingDailyQuota()
  );
}
