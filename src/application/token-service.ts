import {IToken} from "../ts/interfaces";
import {TokenRepository} from "../repositories/token-repository";
import jwt, {JwtPayload, Secret, SignOptions} from "jsonwebtoken";
import {SessionService} from "../services/session-service";

const settings = {
    JWT_ACCESS_SECRET: "superpupersecret",
    JWT_REFRESH_SECRET: "superpupermegasecret",
    TOKEN_ACCESS_LIVE_TIME: {expiresIn: "10s"},
    TOKEN_REFRESH_LIVE_TIME: {expiresIn: "100s"},
}

export interface JWT extends JwtPayload {
    id: string;
    email: string;
    deviceId: string;
}

export class TokenService {
    private tokenRepository: TokenRepository
    private readonly secretAccess: Secret;
    private readonly optionsAccess: SignOptions;
    private readonly secretRefresh: Secret;
    private readonly optionsRefresh: SignOptions;


    constructor() {
        this.tokenRepository = new TokenRepository();
        this.optionsAccess = settings.TOKEN_ACCESS_LIVE_TIME;
        this.secretAccess = settings.JWT_ACCESS_SECRET;
        this.optionsRefresh = settings.TOKEN_REFRESH_LIVE_TIME;
        this.secretRefresh = settings.JWT_REFRESH_SECRET;
    }

    public generateAccessToken(payload: object): string {
        return jwt.sign(payload, this.secretAccess, this.optionsAccess);
    }

    public generateRefreshToken(payload: object): string {
        return jwt.sign(payload, this.secretRefresh, this.optionsRefresh);
    }

    public getPayloadByAccessToken(token: string): string | JwtPayload | JWT | boolean {
        const {exp} = jwt.decode(token) as JwtPayload
        if (!exp) return false
        if (Date.now() >= exp * 1000) {
            return false
        }

        return jwt.verify(token, settings.JWT_ACCESS_SECRET)

    }

    public getPayloadByRefreshToken(token: string): string | JwtPayload | JWT | boolean {
        const {exp} = jwt.decode(token) as JwtPayload
        if (!exp) return false
        if (Date.now() >= exp * 1000) {
            return false
        }
        return jwt.verify(token, settings.JWT_REFRESH_SECRET)
    }

    public async addTokenToBlackList(token: string): Promise<IToken> {
        return await this.tokenRepository.createToken(token)
    }

    public async checkTokenByBlackList(token: string): Promise<boolean> {
        const {iat, deviceId} = jwt.decode(token) as JwtPayload
        console.log('iat', iat)
        console.log('deviceId', deviceId)
        const sessionService = new SessionService();
        const session = await sessionService.findSession(deviceId);
        console.log('session', session)
        console.log('check', iat === session?.lastActiveDate)
        return iat === session?.lastActiveDate;



        // const checkToken = await this.tokenRepository.findToken(token)
        // return !!checkToken;
    }

//TODO finish refactor
    public async getPayloadFromToken(refreshToken: string) {
        if (!refreshToken) throw new Error;
        console.log("ref", refreshToken)
        const isBlockedToken = await this.checkTokenByBlackList(refreshToken);
        console.log('isBlockedToken', isBlockedToken)
        if (isBlockedToken) throw new Error;
        const payload = await this.getPayloadByRefreshToken(refreshToken);
        console.log('payload by service', payload)
        if (!payload) {
            throw new Error

        }
        return payload as JWT
    }
}