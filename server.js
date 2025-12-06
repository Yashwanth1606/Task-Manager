const express = require('express');
const cors = require('cors');
const {google} = require('googleapis');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const SHEET_ID = process.env.SHEET_ID || '1sYhF7hBK10Ri5Ksj8mpzzJshtsg0IXEm2i_vCC_g2vg';
// Path to your downloaded service account JSON key. Use absolute path or set env var GOOGLE_APPLICATION_CREDENTIALS
const KEYFILE = process.env.GOOGLE_APPLICATION_CREDENTIALS || path.join(__dirname, 'service-account.json');

async function getSheetsClient(){
  const auth = new google.auth.GoogleAuth({
    keyFile: KEYFILE,
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  const authClient = await auth.getClient();
  return google.sheets({version: 'v4', auth: authClient});
}

// Helper: map rows to task objects assuming columns A..G: Date, Time, Task Name, Description, Priority, Due Date, Status
function rowsToTasks(rows){
  return (rows || []).map(r => ({
    date: r[0] || '',
    time: r[1] || '',
    title: r[2] || '',
    description: r[3] || '',
    priority: r[4] || '',
    dueDate: r[5] || '',
    status: r[6] || ''
  }));
}

app.get('/tasks', async (req, res) => {
  try{
    const sheets = await getSheetsClient();
    const range = 'Sheet1!A2:G';
    const resp = await sheets.spreadsheets.values.get({ spreadsheetId: SHEET_ID, range });
    const rows = resp.data.values || [];
    return res.json({ok: true, tasks: rowsToTasks(rows)});
  }catch(err){
    console.error(err);
    return res.status(500).json({ok:false, error: err.message});
  }
});

app.post('/tasks', async (req, res) => {
  try{
    const { title, description, priority, dueDate, status } = req.body;
    if(!title) return res.status(400).json({ok:false, error: 'title required'});

    const now = new Date();
    const isoDate = now.toISOString().split('T')[0]; // YYYY-MM-DD
    const time = now.toTimeString().split(' ')[0]; // HH:MM:SS

    const newRow = [isoDate, time, title, description || '', priority || '', dueDate || '', status || 'Not Started'];

    const sheets = await getSheetsClient();
    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: 'Sheet1!A:G',
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [newRow] }
    });

    return res.json({ok:true, appended: newRow});
  }catch(err){
    console.error(err);
    return res.status(500).json({ok:false, error: err.message});
  }
});

// PATCH /tasks/:id  -> update task status in column G of the sheet
app.patch('/tasks/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({ ok: false, error: 'invalid id' });
    }
    const { status } = req.body;
    if (typeof status !== 'string') {
      return res.status(400).json({ ok: false, error: 'status required' });
    }

    const sheets = await getSheetsClient();

    // spreadsheet row to update (data rows start at row 2, so id 1 -> row 2)
    const sheetRow = id + 1;
    const range = `Sheet1!G${sheetRow}`; // column G = Status

    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [[ status ]] }
    });

    return res.json({ ok: true, id, status });
  } catch (err) {
    console.error('PATCH /tasks/:id error', err);
    return res.status(500).json({ ok: false, error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server listening on http://localhost:${PORT}`));
