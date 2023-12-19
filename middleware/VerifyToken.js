import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const accessToken = authHeader && authHeader.split(' ')[1];

    if (!accessToken) {
        return res.status(401).json({message: "Unauthorized : Access token not found"});
    }

    try {
        jwt.verify(accessToken, process.env.JWT_ACCESS_TOKEN_SECRET, (error, decoded) => {
            if (error) {
                return res.status(403).json({message: "Unauthorized: Invalid token"});
            }
            req.userId = decoded.userId;
            req.email = decoded.email;
            next();
        });
    } catch (error) {
        console.error(error);
        return res.status(401).json({message: "Unauthorized: Invalid token"});
    }
}