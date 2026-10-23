// KIDUP School Expo: publish as Web App (Execute as: Me; Who has access: Anyone).
// Spreadsheet ID is from https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit
const SHEET_ID = 'PASTE_GOOGLE_SHEET_ID_HERE';
const SHEET_NAME = 'Registrations';
const HEADERS = ['Submitted At','Registration ID','Parent Name','Mobile Number','Email','Attendees','Child Age','Current School / Nursery','Parent Questions','Consent','UTM Source','UTM Medium','UTM Campaign','UTM Content','Follow-up Status','Attendance Status'];
function setup() {
  const sheet=SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME) || SpreadsheetApp.openById(SHEET_ID).insertSheet(SHEET_NAME);
  if(sheet.getLastRow()===0){sheet.appendRow(HEADERS);sheet.setFrozenRows(1);sheet.getRange(1,1,1,HEADERS.length).setFontWeight('bold').setBackground('#142446').setFontColor('#FFFFFF');}
}
function doPost(e) {
  let id = '';
  try {
    const p = e && e.parameter || {};
    id=String(p.registration_id||'').slice(0,90);
    if(p['bot-field']) return result(id,false,'Unable to process this request.');
    const name = clean(p.parent_name,100);
    const phone = clean(p.mobile_number,25).replace(/[\s()+-]/g,'');
    const email = clean(p.email,150);
    const attendees=clean(p.attendees,4);
    const age=clean(p.child_age,30);
    const consent=clean(p.privacy_consent,5);
    if(name.length<3 || !/^(?:01[0125]\d{8}|201[0125]\d{8})$/.test(phone) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !['1','2','3','4','5+'].includes(attendees) || !age || consent!=='yes' || !/^KD[0-9]+-[a-z0-9]+$/.test(id)) return result(id,false,'Please check the required fields.');
    const lock=LockService.getScriptLock();
    if(!lock.tryLock(15000)) return result(id,false,'The service is busy. Try again shortly.');
    try {
      const sheet=SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
      if(!sheet) throw new Error('Run setup() before deployment.');
      // Idempotency prevents double-click retries; email + phone duplicate handling
      // remains a human-reviewed workflow (siblings may legitimately share details).
      const last=sheet.getLastRow();
      if(last>1){
        const ids=sheet.getRange(2,2,last-1,1).getDisplayValues();
        if(ids.some(row=>row[0]===id))return result(id,true,'Already received.');
      }
      sheet.appendRow([new Date(),id,name,phone,email,attendees,age,clean(p.current_school,120),clean(p.interests,600),consent,clean(p.utm_source,100),clean(p.utm_medium,100),clean(p.utm_campaign,150),clean(p.utm_content,150),'New','Not Confirmed']);
      return result(id,true,'Saved.');
    } finally {lock.releaseLock();}
  } catch(err) {console.error(err);return result(id,false,'Registration could not be saved. Please try again.');}
}
function clean(value,max){
  const s=String(value==null?'':value).trim().slice(0,max);
  // Prevent spreadsheet formula injection from untrusted free-text fields.
  return /^[=+@\-\t\r]/.test(s) ? "'"+s : s;
}
function result(id,success,error){
  const payload=JSON.stringify({type:'KIDUP_REGISTRATION_RESULT',registration_id:id,success:success,error:success?'':error}).replace(/</g,'\\u003c');
  // Script HTML responses use Google's iframe sandbox. Send to top and parent;
  // test on your published hosting URL before collecting live registrations.
  const html='<!doctype html><html><body><script>(function(){var m='+payload+';window.parent.postMessage(m,"*");try{window.top.postMessage(m,"*")}catch(e){}})();<\/script></body></html>';
  return HtmlService.createHtmlOutput(html);
}
