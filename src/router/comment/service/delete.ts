import { getCustomRepository } from "typeorm";
import { APIGatewayEventIncludeConnectionName } from "../../../DTO/http.dto";
import { AccessTokenDTO } from "../../../DTO/token.dto";
import { HttpException } from "../../../exception";
import { CommentRepository } from "../../../repository/comment";
import { createRes } from "../../../util/http";
import { getAuthorizationByHeader } from "../../../util/req";
import { verifyToken } from "../../../util/token";

const deleteComment = async (event: APIGatewayEventIncludeConnectionName) => {
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
};

export default deleteComment;
