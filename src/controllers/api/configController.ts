import { Request, Response } from "express";
import { isS3Configured } from "../../utils/s3Config";
import { isSMTPConfigured } from "../../utils/emailConfig";

export default class ConfigController
{
    isS3Enabled(request: Request, response: Response)
    {
        const s3Enabled = isS3Configured();
        response.json({ s3Enabled });
    }

    isSMTPEnabled(request: Request, response: Response)
    {
        const smtpEnabled = isSMTPConfigured();
        response.json({ smtpEnabled });
    }
}