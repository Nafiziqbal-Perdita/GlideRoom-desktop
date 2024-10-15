// Screen sharing functionality
document.getElementById("shareScreenBtnn").addEventListener("click", () => {
  console.log("Share Screen Clicked");
  // Request the screen stream from the user
  navigator.mediaDevices
    .getDisplayMedia({
      cursor: true,
      video: {
        cursor: "always",
        displaySurface: "screen",
      },
    })
    .then((screenStream) => {
      // Get the track from the screen stream
      const screenTrack = screenStream.getTracks()[0];
      // Find the video sender (to replace it with screen sharing stream)
      const videoSender = senders.find(
        (sender) => sender.track.kind === "video"
      );

      // Replace the video track with the screen track
      if (videoSender) {
        videoSender.replaceTrack(screenTrack);
      }

      // When the screen sharing stops, revert back to the original video track
      screenTrack.onended = () => {
        const originalVideoTrack = userStream
          .getTracks()
          .find((track) => track.kind === "video");
        if (videoSender && originalVideoTrack) {
          videoSender.replaceTrack(originalVideoTrack);
        }
      };
    })
    .catch((err) => console.error("Error sharing screen:", err)); // Handle errors
});
//this is temp