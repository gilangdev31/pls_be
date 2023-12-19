export const handleSequelizeError = (error, res) => {
    if (error.name === 'SequelizeUniqueConstraintError') {
        console.error('SequelizeUniqueConstraintError:', error.errors);

        res.status(400).json({
            success: false,
            message: 'Validation error',
            errors: error.errors.map(err => ({
                message: err.message,
                type: err.type,
                path: err.path,
                value: err.value,
            })),
        });
    } else {
        console.error('Other error:', error);
        res.status(500).json({ success: false, message: 'Internal server error', detail: error.message });
    }
};
