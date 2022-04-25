import { getCustomRepository } from "typeorm";
import { APIGatewayEventIncludeConnectionName } from "../../DTO/http.dto";
import { AccessTokenDTO } from "../../DTO/token.dto";
import { HttpException } from "../../exception";
import { CommentRepository } from "../../repository/comment";
import { createRes } from "../../util/http";
import { getAuthorizationByHeader, getBody } from "../../util/req";
import { verifyToken } from "../../util/token";

export const CommentService: { [k: string]: Function } = {
  addComment: async (event: APIGatewayEventIncludeConnectionName) => {
    const body = getBody<{ content: string }>(event.body);
    const idx = event.pathParameters?.idx;
    if (!idx) {
      throw new HttpException("JL003");
    }

    const user = verifyToken<AccessTokenDTO>(
      getAuthorizationByHeader(event.headers),
    );
    if (!user) {
      throw new HttpException("JL003");
    }

    const commentRepo = getCustomRepository(
      CommentRepository,
      event.connectionName,
    );

    const result = await commentRepo.addComment({
      idx: Number(idx),
      subId: user.subId,
      content: body.content,
    });
    if (result) {
      return createRes({});
    } else {
      throw new HttpException("JL004");
    }
  },
  deleteComment: async (event: APIGatewayEventIncludeConnectionName) => {
    const idx = event.pathParameters?.idx;
    if (!idx) {
      throw new HttpException("JL003");
    }

    const user = verifyToken<AccessTokenDTO>(
      getAuthorizationByHeader(event.headers),
    );
    if (!user) {
      throw new HttpException("JL003");
    }
    if (!user.isAdmin) {
      throw new HttpException("JL002");
    }

    const commentRepo = getCustomRepository(
      CommentRepository,
      event.connectionName,
    );

    const result = await commentRepo.deleteComment({
      idx: Number(idx),
    });
    if (result) {
      return createRes({});
    } else {
      throw new HttpException("JL004");
    }
  },
};
