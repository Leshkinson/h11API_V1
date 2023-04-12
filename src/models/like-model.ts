import mongoose, {Schema} from "mongoose";
import {ILikeStatus} from "../ts/interfaces";
import {CommentSchema} from "./comment-model";

export const LikeSchema = new Schema({
    likeStatus: {type: "string", required: true},
    userId: {type: "string", required: true},
    commentId: {type: "string", required: true},
}, {timestamps: true});

CommentSchema.set('toJSON', {
    transform: function (doc, dto) {
        dto.id = dto._id;
        delete dto._id;
        delete dto.__v;
        delete dto.updatedAt;
    }
});

CommentSchema.set('id', true);

export const LikeModel = mongoose.model<ILikeStatus>('LikeStatus', LikeSchema)