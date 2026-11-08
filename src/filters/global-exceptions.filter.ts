import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from "@nestjs/common";
import { HttpAdapterHost } from "@nestjs/core";
import { mapPrismaError } from "../utils/prisma-error.util.js";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/client";

interface ErrorResponse {
  path: string;
  message: string;
  timestamp: string;
  statusCode: number;
  fieldErrors: string[] | null;
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  constructor(private readonly httpAdapterHost: HttpAdapterHost) {
  }

  catch(exception: any, host: ArgumentsHost) {
    const {httpAdapter} = this.httpAdapterHost;

    const ctx = host.switchToHttp();

    const responseBody: ErrorResponse = {
      path: httpAdapter.getRequestUrl(ctx.getRequest()),
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: "Something went wrong",
      timestamp: new Date().toISOString(),
      fieldErrors: null,
    };

    if (exception instanceof HttpException) {
      const errorResponse = exception.getResponse();
      const responseMessage = getResponseMessage(errorResponse);

      responseBody.statusCode = exception.getStatus();
      responseBody.fieldErrors = Array.isArray(responseMessage) ? responseMessage : null;
      responseBody.message = Array.isArray(responseMessage) ? 'Validation failed' : exception.message;
    } else if (exception instanceof PrismaClientKnownRequestError) {
      const {statusCode, message} = mapPrismaError(exception);
      responseBody.statusCode = statusCode;
      responseBody.message = message;
    } else {
      this.logger.error(exception instanceof Error ? exception.stack : exception);
      responseBody.message = "Internal Server Error";
    }

    httpAdapter.reply(ctx.getResponse(), responseBody, responseBody.statusCode);
  }
}

function getResponseMessage(errorResponse: string | object) {
  return typeof errorResponse === 'object' && errorResponse !== null
    ? (errorResponse as Record<string, unknown>).message
    : undefined;
}