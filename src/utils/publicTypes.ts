export type PublicUser = {
  _id: string;
  name: string;
  email: string;
  isEmailPublic: boolean;
  avatarURL: string;
  isAdmin: boolean;
};

export type PublicComment = {
  _id: string;
  content: string;
  author: Omit<PublicUser, "email">;
  likes: Omit<PublicUser, "email">[];
  dislikes: Omit<PublicUser, "email">[];
  createdAt: Date;
  updatedAt: Date;
};

export type PublicPost = {
  _id: string;
  title: string;
  content: string;
  imageURL?: string;
  author: Omit<PublicUser, "email">;
  likes: Omit<PublicUser, "email">[];
  dislikes: Omit<PublicUser, "email">[];
  comments: PublicComment[];
  createdAt: Date;
  updatedAt: Date;
};