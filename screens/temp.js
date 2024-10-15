<script>
  const roomID = 'room123'; // You can change this to get dynamic roomID from the URL or user input

  const socket = io('https://remote-conn-server-production.up.railway.app', { transports: ['websocket', 'polling'] });
  const peer = new Peer();

  let userStream;
  let senders = [];
  let remoteUserSocketId;
  let myPeerId;

  const notification = document.getElementById('notification');
  const myVideo = document.getElementById('myVideo');
  const remoteVideo = document.getElementById('remoteVideo');
  const roomCode = document.getElementById('roomCode');
  roomCode.innerText = roomID;

  // Initialize video/audio stream
  navigator.mediaDevices.getUserMedia({ video: true, audio: true })
    .then(stream => {
      userStream = stream;
      myVideo.srcObject = stream;

      peer.on('call', call => {
        call.answer(stream); // Answer the call with our stream

        call.on('stream', remoteStream => {
          remoteVideo.srcObject = remoteStream;
        });

        senders = call.peerConnection.getSenders();
      });

      socket.emit('join room', roomID);
    })
    .catch(err => {
      console.error('Failed to get local stream', err);
    });

  peer.on('open', id => {
    myPeerId = id;
    notification.innerText = 'Waiting for other user...';
    console.log("Peer id",id);

    socket.emit('ready', { peerId: id });
  });

  socket.on('other user', userId => {
    remoteUserSocketId = userId;
    socket.emit('getPeerId', { to: userId, peerId: myPeerId });
  });

  socket.on('takePeerId', peerId => {
    const call = peer.call(peerId, userStream);
    
    call.on('stream', remoteStream => {
      remoteVideo.srcObject = remoteStream;
    });

    senders = call.peerConnection.getSenders();
  });

  // Screen Sharing
  document.getElementById('shareScreenBtn').addEventListener('click', () => {
    navigator.mediaDevices.getDisplayMedia({ cursor: true }).then(screenStream => {
      const screenTrack = screenStream.getTracks()[0];
      const videoSender = senders.find(sender => sender.track.kind === 'video');

      if (videoSender) {
        videoSender.replaceTrack(screenTrack);
      }

      screenTrack.onended = () => {
        const originalVideoTrack = userStream.getTracks().find(track => track.kind === 'video');
        if (videoSender && originalVideoTrack) {
          videoSender.replaceTrack(originalVideoTrack);
        }
      };
    }).catch(err => console.error('Error sharing screen:', err));
  });

  // Leave Room
  document.getElementById('leaveRoomBtn').addEventListener('click', () => {
    socket.disconnect();
    peer.disconnect();
    window.location.href = '/'; // Redirect to the home page
  });

  socket.on('user joined', userId => {
    remoteUserSocketId = userId;
    notification.innerText = 'User joined!';
    setTimeout(() => {
      notification.style.display = 'none';
    }, 2000);
  });
</script>
