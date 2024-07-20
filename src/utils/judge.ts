import { spawn } from 'child_process';
import * as fs from 'fs';

export function judge(idProblem: string, testCase: string, answer: string) {
  //run the program

  return new Promise((resolve, reject) => {
    const input = fs.openSync(`public/test-sum/input/${testCase}.in`, 'r');

    const exe = spawn(`./public/bin`, [], {
      stdio: [input, 'pipe', 'pipe'],
    });

    //timeout
    const timeout = setTimeout(() => {
      try {
        process.kill(exe.pid);
        reject('Time out');
      } catch (e) {
        console.log(e);
        reject('Cannot kill process');
      }
    }, 1000);

    //Output
    exe.stdout.on('data', (data) => {
      clearTimeout(timeout);
      const resultUser = data.toString().replace(/\n/g, '');
      const realAns = answer.toString().replace(/\n/g, '');
      console.log({ resultUser, realAns });

      if (resultUser !== realAns) {
        reject('Wrong Answer');
      }

      resolve('Accepted');
    });

    //Runtime Error
    exe.stderr.on('data', (data) => {
      clearTimeout(timeout);
      reject('Runtime Error');
    });
  });
}
