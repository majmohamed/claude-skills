const fs = require('fs');
const mammoth = require('mammoth');

const docxPath = 'C:\\Users\\majidmohamed\\Microsoft\\MAI - Strategy - 11. MSI strategy\\1. Ad hoc\\0. Maj Working Folder\\3. Adhoc\\State of the Union - AI Training Infra\\State of the Union - AI Training Infra.docx';

mammoth.extractRawText({ path: docxPath })
  .then(result => {
    console.log(result.value);
  })
  .catch(err => {
    console.error('Error reading docx:', err);
  });
