import moment from 'moment';
import * as _ from 'lodash-es';
export const getFullDateTime = () =>
  moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');

export const chunkArr = 
    (size = 2, arr = ['']) => {
    return _.chunk(arr, size, null);
};
