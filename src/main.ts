import 'dotenv/config';

import { compilationAndRun } from './utils/compilationAndRun';
import { getRequest } from './utils/getRequest';
import { io } from 'socket.io-client';

async function main() {
  const socket = io('ws://localhost:3000');
  socket.on('connect', () => {
    console.log(socket.id); // x8WIv7-mJelg7on_ALbx
  });

  while (true) {
    const request = await getRequest();
    console.log(request);
    if (request.Body) {
      const submission = JSON.parse(request.Body);

      const saveSubmission = {
        idSubmission: submission.idSubmission,
        idProblem: submission.idProblem,
        idLenguage: submission.idLenguage,
        idUser: submission.idUser,
        status: 'In queue',
      };
      socket.emit('msgToServer', saveSubmission);

      await compilationAndRun(
        submission.idProblem,
        submission.idLenguage,
        submission.code,
        socket,
        saveSubmission,
      )
        .then((res) => {
          if (res === 'Accepted') {
            console.log('Accepted');
            saveSubmission.status = 'Accepted';
            socket.emit('msgToServer', saveSubmission);
          }
        })
        .catch((e) => {
          if (e === 'Compilation Error') {
            console.log('Compilation Error');
            saveSubmission.status = 'Compilation Error';
            socket.emit('msgToServer', saveSubmission);
            return;
          }

          if (e === 'Wrong Answer') {
            console.log('Wrong Answer');
            saveSubmission.status = 'Wrong Answer';
            socket.emit('msgToServer', saveSubmission);
            return;
          }

          if (e === 'Runtime Error') {
            console.log('Runtime Error');
            saveSubmission.status = 'Runtime Error';
            socket.emit('msgToServer', saveSubmission);
            return;
          }

          if (e === 'Time out') {
            console.log('Time out');
            saveSubmission.status = 'Time out';
            socket.emit('msgToServer', saveSubmission);
            return;
          }

          console.log('Unhandled error', e);
        });
    }
  }
}

main();
