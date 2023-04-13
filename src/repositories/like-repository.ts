import {Model, RefType} from "mongoose";
import {ILikeStatus} from "../ts/interfaces";
import {LikeModel} from "../models/like-model";

export class LikeRepository {
    private likeModel: Model<ILikeStatus>;

    constructor() {
        this.likeModel = LikeModel;
    }

    public async createLike(commentId: string, userId: string, likeStatus: string): Promise<ILikeStatus> {
        return this.likeModel.create({userId, likeStatus, commentId})
    }

    public async updateLikeStatus(id: RefType, likeStatus: string): Promise<ILikeStatus | null> {
        return this.likeModel.findOneAndUpdate({_id: id}, {"likeStatus": likeStatus})
    }

    public async findLike(userId: string): Promise<ILikeStatus | null> {
        return this.likeModel.findOne({userId})
    }

    public async countingLikeOrDislike(commentId: string, param: string) {
        return this.likeModel.find({$and: [{"commentId": commentId}, {"likeStatus": param}]}).count()
    }
}