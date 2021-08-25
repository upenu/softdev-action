import * as core from '@actions/core'
import GoogleSheet from 'google-sheet-cli/lib/lib/google-sheet'

async function run(): Promise<void> {
  const spreadsheetId: string = core.getInput('spreadsheetId', {
    required: true,
  });

  const { GSHEET_CLIENT_EMAIL, GSHEET_PRIVATE_KEY } = process.env;
  if (!GSHEET_CLIENT_EMAIL || !GSHEET_PRIVATE_KEY)
    throw new Error('Google sheets credentials have to be supplied');

  const gsheet = new GoogleSheet(spreadsheetId);
  await gsheet.authorize({
    /* eslint-disable camelcase */
    client_email: GSHEET_CLIENT_EMAIL,
    private_key: GSHEET_PRIVATE_KEY,
    /* eslint-enable camelcase */
  });

  const worksheetTitle: string = core.getInput('worksheetTitle', {
    required: true,
  });

  await gsheet.getWorksheet(worksheetTitle)

  var i = 0;
  //while (true) {
    var x = await gsheet.getData({minCol: 1, minRow: 1, maxCol: 10, maxRow: 10});
    console.log(x);
  //}
}

run()
