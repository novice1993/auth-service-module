export const convertMillisecondsToMMSS = (milliseconds: number) => {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const secondsFormatted = seconds < 10 ? '0' + seconds : seconds;

  return `${minutes}:${secondsFormatted}`; // mm:Ss
};
