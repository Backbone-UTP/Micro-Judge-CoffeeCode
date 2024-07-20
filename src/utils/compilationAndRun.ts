import { spawn } from 'child_process';
import { downloadFilesToJudge } from './downloadTestCases';
import * as fs from 'fs';
import { judge } from './judge';
import { Socket } from 'socket.io-client';
import { DefaultEventsMap } from '@socket.io/component-emitter';

export async function compilationAndRun(
  idProblem: string,
  idLenguage: string,
  code: string,
  socket: Socket<DefaultEventsMap, DefaultEventsMap>,
  saveSubmission: any,
) {
  const testCase = await downloadFilesToJudge(idProblem);
  console.log(testCase);
  fs.writeFileSync(`public/${idProblem}.cpp`, code);

  //compile
  const program = spawn('g++', [`public/${idProblem}.cpp`, '-o', `public/bin`]);

  return new Promise((resolve, reject) => {
    //compile time

    program.on('exit', async (statusCode) => {
      console.log(statusCode);

      //compile error
      if (statusCode === 1) {
        reject('Compilation Error');
        return;
      }
      let testNumber = 1;
      for (const testCaseName in testCase) {
        console.log('judging problem', testCaseName);
        try {
          const result = await judge(
            idProblem,
            testCaseName,
            testCase[testCaseName],
          );
          console.log({ result });
          saveSubmission.status = `${testNumber++}/${Object.keys(testCase).length}`;
          socket.emit('msgToServer', saveSubmission);
        } catch (e) {
          console.log('un error', e);
          reject(e);
          break;
        }
      }

      resolve('Accepted');
    });
  });
}
