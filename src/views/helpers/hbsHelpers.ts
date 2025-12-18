import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { PublicUser } from '../../utils/publicTypes';

dayjs.extend(relativeTime);

const hbsHelpers =
{
  eq: (a: number, b: number) => a === b,
  gt: (a: number, b: number) => a > b,
  lt: (a: number, b: number) => a < b,
  add: (a: number, b: number) => a + b,
  subtract: (a: number, b: number) => a - b,
  range: (start: number, end: number) => {
    const arr = [];
    for (let i = start; i <= end; i++) arr.push(i);
    return arr;
  },
  formatDate: (date: Date) => dayjs(date).format("MMM D, YYYY h:mm A"),
  fromNow: (date: string) => {
    const now = dayjs();
    const d = dayjs(date);
    return d.isAfter(now) ? "just now" : d.fromNow();
  },
  pluralize: (count: number, singular: string, plural: string) => count === 1 ? singular : plural,
  isLiked: (likes: {_id: string, name: string}[], userId: string) => {
    if (!likes || likes.length === 0) return false;
    return !!likes.find(like => like._id === userId);
  },
  isAuthorized: (authorId: string, user: PublicUser) => {
    if (authorId === user._id) return true;
    if (user.isAdmin) return true;
    return false;
  },
  isOwner: (currentUserId: string, profileUserId: string) => profileUserId === currentUserId,
  json: (context: any) => JSON.stringify(context),
};

export default hbsHelpers;