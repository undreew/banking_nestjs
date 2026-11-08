import { HttpStatus, Logger } from "@nestjs/common";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/client";

const logger = new Logger('PrismaErrorMapper');

const UNIQUE_CONSTRAINT_MESSAGES: Record<string, string> = {
  uk_users_email: "Email already in use",
};

export function mapPrismaError(exception: PrismaClientKnownRequestError): { statusCode: number; message: string } {
  switch (exception.code) {
    case 'P2002': {
      const constraintName = getConstraintName(exception);
      return {
        statusCode: HttpStatus.CONFLICT,
        message: (constraintName && UNIQUE_CONSTRAINT_MESSAGES[constraintName]) ?? 'A record with this value already exists',
      };
    }
    case 'P2025':
      return {statusCode: HttpStatus.NOT_FOUND, message: 'Record not found'};
    case 'P2003':
      return {statusCode: HttpStatus.BAD_REQUEST, message: 'Invalid reference to a related record'};
    default:
      logger.error(`Unhandled Prisma error code: ${exception.code}`, exception.meta as object);
      return {statusCode: HttpStatus.INTERNAL_SERVER_ERROR, message: 'Database error'};
  }
}

function getConstraintName(exception: PrismaClientKnownRequestError): string | undefined {
  const driverAdapterError = exception.meta?.driverAdapterError as any;
  return driverAdapterError?.cause?.constraint?.index;
}
