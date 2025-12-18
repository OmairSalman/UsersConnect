import { User } from "../entities/userEntity";
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { PublicUser } from "../utils/publicTypes";
import { userToPublic } from "../utils/publicDTOs";

export default class AuthService
{
    async loginUser(credentials: {email: string, password: string}): Promise<PublicUser | string>
    {
        try
        {
            const user = await User.findOneBy({email: credentials.email});
            if (!user) return 'DNE';
            const match = await bcrypt.compare(credentials.password, user.password);
            if(match)
            {
                const safeUser = userToPublic(user);
                return safeUser;
            }
            else
                return 'ICR';
        }
        catch(error)
        {
            const errorDate = new Date();
            const errorDateString = errorDate.toLocaleDateString();
            const errorTimeString = errorDate.toLocaleTimeString();
            console.error(`[${errorDateString} @ ${errorTimeString}] Error logging in: `, error);
        }
        return 'error';
    }

    async registerUser(newUser: User): Promise<PublicUser | null>
    {
        const user = new User();
        user.name = newUser.name;
        user.email = newUser.email;
        user.isAdmin = false;

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newUser.password, salt);
        const hash = crypto.createHash('sha256').update(user.email.trim()).digest('hex');
        user.avatarURL = `https://gravatar.com/avatar/${hash}?s=256&d=initials`;
        await user.save();
        const safeUser = userToPublic(user);
        return safeUser;
    }

    async verifyPassword(userId: string, password: string): Promise<PublicUser | null>
    {
        const user = await User.findOneBy({ _id: userId });
        if(!user) return null;

        const match = await bcrypt.compare(password, user.password);
        if(match)
            return user;
        return null;
    }
}