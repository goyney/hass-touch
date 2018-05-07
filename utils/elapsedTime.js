import moment from 'moment';

export default (datetime) => {
  const lastChanged = moment(datetime).format('YYYY-MM-DD HH:mm:ss.SSSSSSZ');
  const howLongMins = moment().diff(lastChanged, 'minutes');
  if (howLongMins === 0) {
    return 'Moments ago';
  } else if (howLongMins < 60) {
    return `For ${howLongMins} minute${howLongMins > 1 ? 's' : ''}`;
  } else if (howLongMins < 1440) {
    const howLongHours = Math.floor(howLongMins / 60);
    return `For ${howLongHours} hour${howLongHours > 1 ? 's' : ''}`;
  } else if (howLongMins > 1441) {
    const howLongDays = Math.floor((howLongMins / 60) / 24);
    return `For ${howLongDays} day${howLongDays > 1 ? 's' : ''}`;
  }
};
