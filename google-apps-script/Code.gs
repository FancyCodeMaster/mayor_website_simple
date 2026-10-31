const ISSUE_SHEET_HEADERS = [
  'Submitted at',
  'Municipality',
  'Ward',
  'Tole / locality',
  'Category',
  'Description',
  'Name',
  'Email',
  'Anonymous',
  'Locale',
];

function doGet() {
  try {
    const sheet = getIssueSheet();
    return jsonResponse({ ok: true, sheet: sheet.getName() });
  } catch (error) {
    console.error(error);
    return jsonResponse({ ok: false, error: 'Google Sheet is not configured.' });
  }
}

function doPost(event) {
  try {
    const issue = validateIssue(getRequestParameters(event));
    const sheet = getIssueSheet();
    sheet.appendRow([
      new Date(),
      issue.municipality,
      issue.ward,
      issue.tole,
      issue.category,
      issue.description,
      issue.name,
      issue.email,
      issue.anonymous,
      issue.locale,
    ]);
    SpreadsheetApp.flush();

    let emailSent = false;
    if (issue.email) {
      try {
        sendConfirmationEmail(issue);
        emailSent = true;
      } catch (error) {
        // Do not discard a saved issue if email delivery fails.
        console.error(`Confirmation email failed for ${issue.email}: ${error}`);
      }
    }

    return jsonResponse({ ok: true, saved: true, emailSent: emailSent });
  } catch (error) {
    console.error(error);
    return jsonResponse({ ok: false, error: 'Unable to submit this issue.' });
  }
}

function sendConfirmationEmail(issue) {
  const properties = PropertiesService.getScriptProperties();
  const politicianEmail = properties.getProperty('POLITICIAN_EMAIL') || issue.politicianEmail;
  const senderName = properties.getProperty('POLITICIAN_NAME') || 'Office';
  const subject = `${senderName}: confirmation of your community issue`;
  const body = `Hello,\n\nThis is a confirmation that the office of ${senderName} has received your community issue. No action is required from you.\n\nThank you,\n${senderName}`;
  const options = {
    name: senderName,
    htmlBody: `<p>Hello,</p><p>This is a confirmation that the office of ${senderName} has received your community issue. No action is required from you.</p><p>Thank you,<br>${senderName}</p>`,
  };
  if (politicianEmail) options.replyTo = politicianEmail;

  // MailApp sends from the Google account that owns the Web App deployment.
  // It does not require the politician address to be configured as an alias.
  if (MailApp.getRemainingDailyQuota() < 1) {
    throw new Error('The Apps Script daily email quota has been exhausted.');
  }
  MailApp.sendEmail(issue.email, subject, body, options);
}

function getRequestParameters(event) {
  if (!event) throw new Error('Missing web app request event. Submit through the deployed /exec URL.');

  if (event.parameter && Object.keys(event.parameter).length > 0) return event.parameter;
  if (event.parameters && Object.keys(event.parameters).length > 0) {
    const values = {};
    Object.keys(event.parameters).forEach((key) => {
      values[key] = event.parameters[key][0] || '';
    });
    return values;
  }

  const contents = event.postData && event.postData.contents;
  if (contents && (!event.postData.type || event.postData.type.indexOf('application/x-www-form-urlencoded') === 0)) {
    const values = {};
    contents.split('&').forEach((pair) => {
      const separator = pair.indexOf('=');
      const key = separator >= 0 ? pair.slice(0, separator) : pair;
      const value = separator >= 0 ? pair.slice(separator + 1) : '';
      if (key) values[decodeURIComponent(key.replace(/\+/g, ' '))] = decodeURIComponent(value.replace(/\+/g, ' '));
    });
    return values;
  }

  throw new Error('No form parameters received. Redeploy the website and submit the form again.');
}

function getIssueSheet() {
  const properties = PropertiesService.getScriptProperties();
  const spreadsheetId = (properties.getProperty('ISSUE_SHEET_ID') || '').trim();
  const sheetName = (properties.getProperty('ISSUE_SHEET_NAME') || 'Issues').trim();
  const spreadsheet = spreadsheetId
    ? SpreadsheetApp.openById(spreadsheetId)
    : SpreadsheetApp.getActiveSpreadsheet();

  if (!spreadsheet) {
    throw new Error('Set ISSUE_SHEET_ID in Script properties or bind this script to a spreadsheet.');
  }

  const sheet = spreadsheet.getSheetByName(sheetName) || spreadsheet.insertSheet(sheetName);
  if (sheet.getLastRow() === 0) sheet.appendRow(ISSUE_SHEET_HEADERS);
  return sheet;
}

function validateIssue(values) {
  if (values.website || !isMinimumSubmissionTime(values.formStartedAt)) {
    throw new Error('Invalid submission.');
  }

  const anonymous = values.anonymous === 'true';
  const issue = {
    municipality: requiredText(values.municipality, 100, 'municipality'),
    ward: requiredText(values.ward, 10, 'ward'),
    tole: requiredText(values.tole, 100, 'tole'),
    category: requiredText(values.category, 100, 'category'),
    description: requiredText(values.description, 2000, 'description'),
    name: anonymous ? '' : optionalText(values.name, 100, 'name'),
    email: anonymous ? '' : optionalEmail(values.email),
    anonymous: anonymous ? 'Yes' : 'No',
    locale: values.locale === 'en' ? 'en' : 'np',
    politicianEmail: optionalEmail(values.politicianEmail),
  };

  if (issue.description.length < 20) throw new Error('Description is too short.');
  return issue;
}

function requiredText(value, maximum, field) {
  const text = optionalText(value, maximum, field);
  if (!text) throw new Error(`${field} is required.`);
  return text;
}

function optionalText(value, maximum, field) {
  const text = String(value || '').trim();
  if (text.length > maximum) throw new Error(`${field} is too long.`);
  return text;
}

function optionalEmail(value) {
  const email = optionalText(value, 254, 'email');
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Email is invalid.');
  return email;
}

function isMinimumSubmissionTime(startedAt) {
  const start = Number(startedAt);
  return Number.isFinite(start) && Date.now() - start >= 3000;
}

function jsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}
