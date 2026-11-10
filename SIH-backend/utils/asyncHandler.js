import ApiError from './apiError.js';

const asyncHandler = (requestHandler) => (req, res, next) => {
    Promise.resolve(requestHandler(req, res, next)).catch((error) => {
        console.error('Error occurred:', error);
        if (error instanceof ApiError) {
            return res.status(error.statusCode).json({
                statusCode: error.statusCode,
                data: null,
                message: error.message,
                success: false,
                errors: error.errors || []
            });
        }
        return res.status(500).json({
            statusCode: 500,
            data: null,
            message: 'Internal Server Error',
            success: false
        });
    });
};

export default asyncHandler;
