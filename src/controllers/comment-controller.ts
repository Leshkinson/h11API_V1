import {Request, Response} from "express";
import {IComment} from "../ts/interfaces";
import {QueryService} from "../services/query-service";
import {CommentService} from "../services/comment-service";
import {JWT, TokenService} from "../application/token-service";
import {UserService} from "../services/user-service";
import {LikesStatus} from "../const/const";

export class CommentController {

    static async updateComment(req: Request, res: Response) {
        try {
            const commentService = new CommentService();
            const tokenService = new TokenService();
            const userService = new UserService();

            const {commentId} = req.params;
            const {content} = req.body;
            const token = req.headers.authorization?.split(' ')[1]
            if (token) {
                const payload = await tokenService.getPayloadByAccessToken(token) as JWT
                const user = await userService.getUserById(payload.id);
                const comment: IComment | undefined = await commentService.getOne(commentId);
                if (!user || !comment) {
                    res.sendStatus(404)

                    return
                }
                if (comment?.commentatorInfo.userLogin !== user?.login) {
                    res.sendStatus(403)

                    return
                }
                if (comment?.commentatorInfo.userId !== user?._id.toString()) {
                    res.sendStatus(403)

                    return
                }
                const updatedComment: IComment | undefined = await commentService.update(commentId, content)

                if (updatedComment) res.sendStatus(204);
            }
        } catch (error) {
            if (error instanceof Error) {
                res.sendStatus(404);
                console.log(error.message);
            }
        }
    }

    static async deleteComment(req: Request, res: Response) {
        try {
            const commentService = new CommentService()
            const tokenService = new TokenService();
            const userService = new UserService();

            const {id} = req.params;
            const token = req.headers.authorization?.split(' ')[1]
            if (token) {
                const payload = await tokenService.getPayloadByAccessToken(token) as JWT
                const user = await userService.getUserById(payload.id);

                if (!user) {
                    res.sendStatus(404)
                    return
                }

                const comment: IComment | undefined = await commentService.getOne(id);

                if (!comment) {
                    res.sendStatus(404)
                    return
                }
                if (comment?.commentatorInfo.userLogin !== user?.login) {
                    res.sendStatus(403)
                    return
                }

                if (comment?.commentatorInfo.userId !== user?._id.toString()) {
                    console.log('Here4')
                    res.sendStatus(403)
                    return
                }

                await commentService.delete(id);

                res.sendStatus(204);
            }
        } catch (error) {
            if (error instanceof Error) {
                res.sendStatus(404);
                console.log(error.message);
            }
        }
    }

    static async getOneComment(req: Request, res: Response) {
        try {
            const userService = new UserService();
            const tokenService = new TokenService();
            const queryService = new QueryService();
            const commentService = new CommentService();
            console.log('req', req)
            const {id} = req.params;
            const {refreshToken} = req.cookies;
            console.log('refreshToken', refreshToken)
            const findComment: IComment | undefined = await commentService.getOne(id);
            const payload = await tokenService.getPayloadFromToken(refreshToken);
            const user = await userService.getUserByParam(payload.email);
            if (user) {
                res.status(200).json(findComment)
                // "likesCount": await queryService. getTotalCountLikeOrDislike(id, LikesStatus.LIKE),
                //     "dislikesCount": await queryService. getTotalCountLikeOrDislike(id, LikesStatus.DISLIKE),
                //     "myStatus": await queryService.getLikeStatus(String(user._id))
            }
        } catch (error) {
            if (error instanceof Error) {
                res.sendStatus(404);
                console.log(error.message);
            }
        }
    }

    static async sendLikeOrDislikeStatusForTheComment(req: Request, res: Response) {
        try {
            const userService = new UserService();
            const tokenService = new TokenService();
            const queryService = new QueryService();
            const commentService = new CommentService();

            const {commentId} = req.params;
            const {likeStatus} = req.body;
            const token = req.headers.authorization?.split(' ')[1];
            if (token) {
                const payload = await tokenService.getPayloadByAccessToken(token) as JWT
                const user = await userService.getUserById(payload.id);
                const comment: IComment | undefined = await commentService.getOne(commentId);
                if (!user || !comment) {
                    res.sendStatus(404)

                    return
                }
                await queryService.makeLikeStatusForTheComment(likeStatus, commentId, String(user._id));
                res.sendStatus(204);
            }
        } catch (error) {
            if (error instanceof Error) {
                res.sendStatus(404);
                console.log(error.message);
            }
        }
    }

}