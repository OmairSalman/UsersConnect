import { User } from "../entities/userEntity";
import crypto from 'crypto';
import { PublicUser } from "../utils/publicTypes";
import { userToPublic } from "../utils/publicDTOs";
import redisClient from "../config/redis";
import bcrypt from 'bcrypt';

export default class UserService
{
    async readUsers(): Promise<PublicUser[]>
    {
        try
        {
            const users = await User.find();
            const safeUsers = users.map(userToPublic);
            return safeUsers;
        }
        catch(error)
        {
            const errorDate = new Date();
            const errorDateString = errorDate.toLocaleDateString();
            const errorTimeString = errorDate.toLocaleTimeString();
            console.error(`[${errorDateString} @ ${errorTimeString}] Error fetching users data from DB:\n`, error);
            return [];
        }
    }

    async getUserById(userId: string): Promise<PublicUser | null>
    {
        const user = await User.findOneBy({ _id: userId });
        if (!user) return null;
        const safeUser = userToPublic(user);
        return safeUser;
    }

    async updateUser(userId: string, updatedUser: {name: string, email: string, isEmailPublic?: boolean, newPassword: string, confirmPassword: string}): Promise<PublicUser | string>
    {
        const updateData: any = {
            name: updatedUser.name,
            email: updatedUser.email
        };

        if (typeof updatedUser.isEmailPublic === 'boolean') {
            updateData.isEmailPublic = updatedUser.isEmailPublic;
        }
        
        if (updatedUser.newPassword && updatedUser.newPassword.trim() !== "") {
            const salt = await bcrypt.genSalt(10);
            updateData.password = await bcrypt.hash(updatedUser.newPassword, salt);
        }

        if (updatedUser.email) {
            const existing = await User.findOneBy({ email: updatedUser.email });
            if (existing && existing._id !== userId)
            {
                return "Email is already in use.";
            }
            const hash = crypto.createHash('sha256').update(updatedUser.email.trim()).digest('hex');
            updateData.avatarURL = `https://gravatar.com/avatar/${hash}?s=256&d=initials`;
        }

        await User.update({ _id: userId }, updateData);
        const user = await User.findOneBy({ _id: userId });
        if (!user)
        {
            return "User not found";
        }
        
        const keys = await redisClient.keys(`user:${user._id}:posts:*`);
        if (keys.length) await redisClient.del(keys);
        await redisClient.del('feed:page:1');

        const safeUser = userToPublic(user);
        return safeUser;
    }

    async deleteUser(userId: string): Promise<PublicUser | null>
    {
        const user = await User.findOneBy({ _id: userId });
        if(!user) return null;
        await user.remove();
        await redisClient.del('feed:page:1');

        const safeUser = userToPublic(user);
        return safeUser;
    }

    async searchUsers(searchTerm: string): Promise<PublicUser[]>
    {
        const users = await this.readUsers();
        const filteredUsers = users.filter(u =>
            (u.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (u.email.toLowerCase().includes(searchTerm.toLowerCase())));
        return filteredUsers;
    }

    async toggleAdmin(userId: string): Promise<PublicUser | null>
    {
        const user = await User.findOneBy({_id: userId});
        if(!user) return null;
        user.isAdmin = !user.isAdmin;
        await user.save();
        const safeUser = userToPublic(user);
        return safeUser;
    }
}