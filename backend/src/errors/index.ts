import { AppError } from './appError';

export class ValidationError extends AppError {
    errors: any[];

    constructor(message = 'Validation error', errors: any[] = []) {
        super(message, 400);
        this.errors = errors;
    }
}

export class UnauthorizedError extends AppError {
    constructor(message = 'Authorization is required') {
        super(message, 401);
    }
}

export class ForbiddenError extends AppError {
    constructor(message = 'Access denied') {
        super(message, 403);
    }
}

export class NotFoundError extends AppError {
    constructor(message = 'Resource not found') {
        super(message, 404);
    }
}

export class ConflictError extends AppError {
    constructor(message = 'Resource alredy exists') {
        super(message, 409);
    }
}