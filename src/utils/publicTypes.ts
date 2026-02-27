export type PublicUser = {
  _id: string;
  name: string;
  email: string;
  isEmailPublic: boolean;
  isEmailVerified: boolean;
  avatarURL: string;
  isAdmin: boolean;
};

export type MinimalUser = {
  _id: string;
  name: string;
  avatarURL: string;
};

export type PublicComment = {
  _id: string;
  content: string;
  author: Pick<PublicUser, '_id' | 'name' | 'avatarURL'>;
  likes: Pick<PublicUser, '_id' | 'name' | 'avatarURL'>[];
  dislikes: Pick<PublicUser, '_id' | 'name' | 'avatarURL'>[];
  createdAt: Date;
  updatedAt: Date;
};

export type PublicPost = {
  _id: string;
  title: string;
  content: string;
  imageURL?: string;
  author: Pick<PublicUser, '_id' | 'name' | 'avatarURL'>;
  likes: Pick<PublicUser, '_id' | 'name' | 'avatarURL'>[];
  dislikes: Pick<PublicUser, '_id' | 'name' | 'avatarURL'>[];
  comments: PublicComment[];
  createdAt: Date;
  updatedAt: Date;
};