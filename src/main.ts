import * as core from '@actions/core'
import GoogleSheet from 'google-sheet-cli/lib/lib/google-sheet'
import {GoogleSheetCli} from 'google-sheet-cli/lib/lib/google-sheet'

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

  const student: string = core.getInput('actor', { //GITHUB_ACTOR
    required: true,
  });

  var curr = new Date;
  var first = curr.getDate() - curr.getDay();
  var week = new Date(curr.setDate(first)).toDateString()


  var students = await gsheet.getData({minCol: 1, minRow: 1, maxCol: 1, maxRow: 100});
  var weeks = await gsheet.getData({minCol: 1, minRow: 1, maxCol: 100, maxRow: 1});
  
  var studentIndex = 1;
  var weekIndex = 1;

  for (; studentIndex < 100; studentIndex++) {
    if (students.rawData.length <= studentIndex || students.rawData[studentIndex].length < 1 || students.rawData[studentIndex][0] == '') {
      await gsheet.updateData([[student]], {minCol: 1, minRow: studentIndex+1, maxCol: 1, maxRow: studentIndex+1})
      break;
    }
    if (students.rawData[studentIndex][0] == student) {
      break;
    }
  }

  for (; weekIndex < 100; weekIndex++) {
    if (weeks.rawData.length < 1 || weeks.rawData[0].length <= weekIndex || weeks.rawData[0][weekIndex] == '') {
      await gsheet.updateData([[week]], {minCol: weekIndex+1, minRow: 1, maxCol: weekIndex+1, maxRow: 1})
      break;
    }
    if (weeks.rawData[0][weekIndex] == week) {
      break;
    }
  }

  const repository: string = core.getInput('repository', { //GITHUB_REPOSITORY
    required: true,
  });

  const sha: string = core.getInput('sha', { // GITHUB_SHA
    required: true,
  });

  await gsheet.updateData([['=HYPERLINK(\"' +  'https://github.com/' + repository + '/commit/' + sha + '\", \"✅\")']], 
    {minCol: weekIndex+1, minRow: studentIndex + 1, maxCol: weekIndex+1, maxRow: studentIndex+1, valueInputOption: GoogleSheetCli.ValueInputOption.USER_ENTERED})
}

run()
