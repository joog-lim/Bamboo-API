import { getCustomRepository } from "typeorm";
import { APIGatewayEventIncludeConnectionName } from "../../../DTO/http.dto";
import { AccessTokenDTO } from "../../../DTO/token.dto";
import { HttpException } from "../../../exception";
import { CommentRepository } from "../../../repository/comment";
import { createRes } from "../../../util/http";
import { getAuthorizationByHeader, getBody } from "../../../util/req";
import { verifyToken } from "../../../util/token";

const addComment = async (event: APIGatewayEventIncludeConnectionName) => {
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
};

export default addComment;
